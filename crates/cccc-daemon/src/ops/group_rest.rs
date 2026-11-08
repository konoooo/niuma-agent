use cccc_contracts::{Event, GroupState};
use cccc_core::{GroupDoc, GroupStore, HomeLayout, ledger};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use std::io;
use std::path::PathBuf;

const IDENTITY_FIELDS: &[&str] = &[
    "runtime",
    "transport",
    "provider_thread_id",
    "provider_session_id",
    "workspace_path",
    "command_fingerprint",
    "identity_fingerprint",
    "model",
];

#[derive(Serialize, Deserialize)]
struct Member {
    actor_id: String,
    actor_created_at: String,
    identity: Map<String, Value>,
    last_seen_at: String,
}

#[derive(Serialize, Deserialize)]
struct RestPoint {
    v: u8,
    id: String,
    group_generation: String,
    completed: bool,
    members: Vec<Member>,
}

fn path(home: &HomeLayout, group: &GroupDoc) -> io::Result<PathBuf> {
    Ok(GroupStore::new(home.clone())?
        .state_dir(&group.group_id)?
        .join("group_rest.json"))
}

fn pending(home: &HomeLayout, group: &GroupDoc) -> io::Result<Option<RestPoint>> {
    let point: RestPoint = match cccc_core::fs::read_json(&path(home, group)?) {
        Ok(point) => point,
        Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(error),
    };
    if point.v != 1 {
        return Err(io::Error::other("unsupported group rest record version"));
    }
    Ok((!point.completed && point.group_generation == group.generation).then_some(point))
}

fn usable(receipt: &Map<String, Value>) -> bool {
    receipt.get("resume_eligible").and_then(Value::as_bool) == Some(true)
        && receipt.get("status").and_then(Value::as_str) == Some("usable")
        && ["provider_thread_id", "provider_session_id"]
            .iter()
            .any(|field| {
                receipt
                    .get(*field)
                    .and_then(Value::as_str)
                    .is_some_and(|id| !id.is_empty())
            })
}

pub(super) fn identity(receipt: &Map<String, Value>) -> Map<String, Value> {
    IDENTITY_FIELDS
        .iter()
        .filter_map(|field| {
            receipt
                .get(*field)
                .map(|value| ((*field).to_owned(), value.clone()))
        })
        .collect()
}

pub(super) fn same_history(receipt: &Map<String, Value>, original: &Map<String, Value>) -> bool {
    let mut current = identity(receipt);
    if &current == original {
        return true;
    }
    if receipt.get("runtime").and_then(Value::as_str) == Some("claude")
        && receipt.get("transport").and_then(Value::as_str) == Some("claude_agent_view")
        && receipt.get("continued_from_session_id") == original.get("provider_session_id")
        && let Some(parent) = original
            .get("provider_session_id")
            .filter(|id| id.as_str().is_some_and(|id| !id.is_empty()))
    {
        current.insert("provider_session_id".into(), parent.clone());
        return &current == original;
    }
    false
}

/// 保存原会话的必要身份字段，不保存环境变量、凭证或任务正文。
pub(super) fn capture(home: &HomeLayout, group: &GroupDoc) -> io::Result<()> {
    if !group.running
        && matches!(group.state, GroupState::Paused | GroupState::Stopped)
        && pending(home, group)?.is_some()
    {
        return Ok(());
    }
    let mut members = Vec::new();
    for actor in group.actors.iter().filter(|actor| {
        actor.enabled
            && actor.availability.is_available()
            && actor.internal_kind.is_none()
            && !cccc_core::runtime_switches::has_pending(group, &actor.id)
    }) {
        let receipt = match super::runtime_session::snapshot(home, &group.group_id, &actor.id) {
            Ok(Some(receipt)) => receipt,
            Ok(None) => continue,
            Err(error) => {
                tracing::warn!(group_id=%group.group_id,actor_id=%actor.id,kind=?error.kind(),"休息点跳过不可读取的成员会话");
                continue;
            }
        };
        if usable(&receipt) {
            members.push(Member {
                actor_id: actor.id.clone(),
                actor_created_at: actor.created_at.clone(),
                identity: identity(&receipt),
                last_seen_at: receipt
                    .get("last_seen_at")
                    .and_then(Value::as_str)
                    .unwrap_or_default()
                    .to_owned(),
            });
        }
    }
    cccc_core::fs::write_json(
        &path(home, group)?,
        &RestPoint {
            v: 1,
            id: uuid::Uuid::new_v4().simple().to_string(),
            group_generation: group.generation.clone(),
            completed: false,
            members,
        },
    )
}

/// 兼容旧版本停止的工作组；健康运行中的重复启动不会再创建续接任务。
pub(super) fn prepare(home: &HomeLayout, group: &GroupDoc) -> io::Result<()> {
    if pending(home, group)?.is_some() {
        return Ok(());
    }
    if group.actors.iter().any(|actor| {
        actor.enabled
            && !cccc_core::runtime_switches::has_pending(group, &actor.id)
            && !super::actor_runtime::actor_is_running(group, actor)
    }) {
        capture(home, group)?;
    }
    Ok(())
}

pub(super) fn continue_work(home: &HomeLayout, group: &GroupDoc) -> io::Result<usize> {
    let Some(mut point) = pending(home, group)? else {
        return Ok(0);
    };
    let ledger_path = GroupStore::new(home.clone())?.ledger_path(&group.group_id)?;
    let mut queued = 0;
    for member in &point.members {
        let Some(actor) = group.actors.iter().find(|actor| {
            actor.id == member.actor_id
                && actor.created_at == member.actor_created_at
                && actor.enabled
                && actor.availability.is_available()
                && !cccc_core::runtime_switches::has_pending(group, &actor.id)
        }) else {
            continue;
        };
        let receipt = match super::runtime_session::snapshot(home, &group.group_id, &actor.id) {
            Ok(Some(receipt)) => receipt,
            Ok(None) => continue,
            Err(error) => {
                tracing::warn!(group_id=%group.group_id,actor_id=%actor.id,kind=?error.kind(),"休息点跳过不可读取的成员会话");
                continue;
            }
        };
        // 成功恢复会刷新 last_seen_at；仅有残留旧记录不能证明原会话已恢复。
        if !usable(&receipt)
            || !same_history(&receipt, &member.identity)
            || receipt
                .get("last_seen_at")
                .and_then(Value::as_str)
                .unwrap_or_default()
                == member.last_seen_at
        {
            continue;
        }
        let client_id = format!("group-resume:{}:{}", point.id, actor.id);
        if ledger::find_idempotent(&ledger_path, "system.notify", "system", &client_id)?.is_some() {
            continue;
        }
        let mut event = Event::new("system.notify", &group.group_id);
        event.by = "system".into();
        event.scope_key = actor.default_scope_key.clone();
        event.data = json!({
            "kind":"group_resume", "target_actor_id":actor.id, "client_id":client_id,
            "title":"接着工作",
            "message":"用户要求工作组接着工作。请沿用本会话和此前任务约束，先核对最近群消息、任务记录、文件与工具执行结果，从上次休息时尚未完成的位置继续。已完成的步骤不要重复执行，不要因为服务重新启动就重做任务或新建无关任务。若原任务已经完成或正在等待他人、用户输入，请报告真实状态并待命；需要确认的操作继续按原权限规则处理。",
            "context":{"kind":"group_resume","rest_id":point.id,"actor_created_at":actor.created_at},
            "im_visibility":"internal",
        }).as_object().expect("固定通知对象").clone();
        ledger::append(&ledger_path, &event)?;
        queued += 1;
    }
    point.completed = true;
    cccc_core::fs::write_json(&path(home, group)?, &point)?;
    Ok(queued)
}

#[cfg(test)]
#[path = "group_rest_tests.rs"]
mod tests;
