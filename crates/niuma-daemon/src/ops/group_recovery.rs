use crate::dispatch::OpError;
use niuma_contracts::{Actor, ActorRuntime, Event};
use niuma_core::{GroupDoc, GroupStore, HomeLayout, actors, ledger};
use niuma_runtime::SessionStatus;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use std::path::PathBuf;

mod context;

#[derive(Clone, Debug, Serialize)]
pub(super) struct Recovery {
    pub actor_id: String,
    pub recovery_id: String,
    pub context_sources: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct Record {
    id: String,
    group_generation: String,
    actor_id: String,
    actor_generation: String,
    previous_identity: Map<String, Value>,
    current_identity: Map<String, Value>,
    context: String,
    sources: Vec<String>,
    cutoff: String,
}

fn directory(home: &HomeLayout, group: &GroupDoc) -> Result<PathBuf, OpError> {
    Ok(GroupStore::new(home.clone())
        .map_err(OpError::io)?
        .state_dir(&group.group_id)
        .map_err(OpError::io)?
        .join("session_recoveries"))
}

fn conversation(receipt: &Map<String, Value>) -> Option<(&str, &str)> {
    let runtime = receipt.get("runtime")?.as_str()?;
    ["provider_thread_id", "provider_session_id"]
        .iter()
        .find_map(|key| {
            receipt
                .get(*key)
                .and_then(Value::as_str)
                .filter(|id| !id.is_empty())
                .map(|id| (runtime, id))
        })
}

fn same_conversation(current: &Map<String, Value>, old: &Map<String, Value>) -> bool {
    conversation(current).is_some_and(|identity| Some(identity) == conversation(old))
        || (current.get("runtime").and_then(Value::as_str) == Some("claude")
            && current
                .get("continued_from_session_id")
                .and_then(Value::as_str)
                .is_some_and(|parent| {
                    !parent.is_empty()
                        && old.get("provider_session_id").and_then(Value::as_str) == Some(parent)
                }))
}

pub(super) fn start(
    home: &HomeLayout,
    group: &GroupDoc,
    actor: &Actor,
) -> Result<(Option<SessionStatus>, Option<Recovery>), OpError> {
    start_with(home, group, actor, |kind| {
        super::actor_runtime::apply(home, group, &actor.id, kind)
    })
}

fn start_with(
    home: &HomeLayout,
    group: &GroupDoc,
    actor: &Actor,
    mut launch: impl FnMut(&str) -> Result<Option<SessionStatus>, OpError>,
) -> Result<(Option<SessionStatus>, Option<Recovery>), OpError> {
    if !actor.external_session_id.is_empty()
        || !matches!(actor.runtime, ActorRuntime::Codex | ActorRuntime::Claude)
        || super::actor_runtime::actor_is_running(group, actor)
    {
        return launch("actor.start").map(|status| (status, None));
    }
    let previous =
        super::runtime_session::snapshot(home, &group.group_id, &actor.id).map_err(OpError::io)?;
    let cutoff = niuma_contracts::utc_now();
    let snapshot = context::capture(home, group, actor);
    if actor.runtime == ActorRuntime::Claude {
        super::runtime_session::retry_failed_claude_resume(home, &group.group_id, &actor.id)
            .map_err(OpError::io)?;
    } else {
        super::runtime_session::resume_failure::retry(
            home,
            &group.group_id,
            &actor.id,
            actor.runtime,
        )
        .map_err(OpError::io)?;
    }
    let first = launch("actor.start");
    if let Ok(status) = first {
        let current = super::runtime_session::snapshot(home, &group.group_id, &actor.id)
            .map_err(OpError::io)?;
        let changed = previous.as_ref().is_some_and(|old| {
            conversation(old).is_some()
                && current
                    .as_ref()
                    .is_some_and(|now| !same_conversation(now, old))
        });
        if changed
            || (previous.is_none()
                && snapshot.has_history
                && current
                    .as_ref()
                    .is_some_and(|value| conversation(value).is_some()))
        {
            let mut record = record(group, actor, previous.as_ref(), snapshot, cutoff);
            return finish(home, group, actor, &mut record, status)
                .map(|(status, recovery)| (status, Some(recovery)));
        }
        return Ok((status, None));
    }
    let error = first.unwrap_err();
    if !matches!(
        error.code.as_str(),
        super::actor_runtime::RUNTIME_RESUME_FAILED | super::actor_runtime::CLAUDE_RESUME_FAILED
    ) {
        return Err(error);
    }
    let Some(previous) = previous else {
        return Err(error);
    };
    let failed_receipt = super::runtime_session::snapshot(home, &group.group_id, &actor.id)
        .map_err(OpError::io)?
        .unwrap_or_else(|| previous.clone());
    let mut record = record(group, actor, Some(&previous), snapshot, cutoff);
    let dir = directory(home, group)?;
    std::fs::create_dir_all(&dir).map_err(OpError::io)?;
    // 先保存旧身份与可读记录，再重置会话指针；旧提供方历史文件始终保留。
    niuma_core::fs::write_secret_json(&dir.join(format!("{}.json", record.id)), &record)
        .map_err(OpError::io)?;
    launch("actor.stop")?;
    if super::actor_runtime::actor_is_running(group, actor) {
        return Err(OpError::new(
            "stop_unconfirmed",
            "旧会话尚未停止，不能新建会话",
        ));
    }
    let status = match launch("actor.new_session") {
        Ok(status) => status,
        Err(error) => {
            let _ = launch("actor.stop");
            super::runtime_session::restore_snapshot(
                home,
                &group.group_id,
                &actor.id,
                Some(&failed_receipt),
            )
            .map_err(OpError::io)?;
            return Err(error);
        }
    };
    match finish(home, group, actor, &mut record, status) {
        Ok((status, recovery)) => Ok((status, Some(recovery))),
        Err(error) => {
            let _ = launch("actor.stop");
            super::runtime_session::restore_snapshot(
                home,
                &group.group_id,
                &actor.id,
                Some(&failed_receipt),
            )
            .map_err(OpError::io)?;
            Err(error)
        }
    }
}

fn record(
    group: &GroupDoc,
    actor: &Actor,
    old: Option<&Map<String, Value>>,
    snapshot: context::Snapshot,
    cutoff: String,
) -> Record {
    Record {
        id: uuid::Uuid::new_v4().simple().to_string(),
        group_generation: group.generation.clone(),
        actor_id: actor.id.clone(),
        actor_generation: actors::generation_identity(actor),
        previous_identity: old.map(super::group_rest::identity).unwrap_or_default(),
        current_identity: Map::new(),
        context: snapshot.body,
        sources: snapshot.sources,
        cutoff,
    }
}

fn finish(
    home: &HomeLayout,
    group: &GroupDoc,
    actor: &Actor,
    record: &mut Record,
    status: Option<SessionStatus>,
) -> Result<(Option<SessionStatus>, Recovery), OpError> {
    let current = super::runtime_session::snapshot(home, &group.group_id, &actor.id)
        .map_err(OpError::io)?
        .ok_or_else(|| OpError::new("recovery_not_ready", "新会话尚未就绪，原会话记录已保留"))?;
    if conversation(&current).is_none()
        || current.get("status").and_then(Value::as_str) != Some("usable")
    {
        return Err(OpError::new(
            "recovery_not_ready",
            "新会话尚未就绪，原会话记录已保留",
        ));
    }
    record.current_identity = super::group_rest::identity(&current);
    let dir = directory(home, group)?;
    std::fs::create_dir_all(&dir).map_err(OpError::io)?;
    niuma_core::fs::write_secret_json(&dir.join(format!("{}.json", record.id)), record)
        .map_err(OpError::io)?;
    GroupStore::new(home.clone())
        .map_err(OpError::io)?
        .mutate(&group.group_id, |group| {
            let member = group
                .actors
                .iter_mut()
                .find(|member| {
                    member.id == actor.id
                        && actors::generation_identity(member) == record.actor_generation
                })
                .ok_or_else(|| std::io::Error::other("恢复期间成员身份变化"))?;
            // 旧消息保留在历史中，由恢复摘要接续，不作为新任务再次自动投递。
            member.work_after = record.cutoff.clone();
            Ok(())
        })
        .map_err(OpError::io)?;
    let path = GroupStore::new(home.clone())
        .map_err(OpError::io)?
        .ledger_path(&group.group_id)
        .map_err(OpError::io)?;
    let client_id = format!("group-recovery:{}", record.id);
    if ledger::find_idempotent(&path, "system.notify", "system", &client_id)
        .map_err(OpError::io)?
        .is_none()
    {
        let mut event = Event::new("system.notify", &group.group_id);
        event.by = "system".into();
        event.scope_key = actor.default_scope_key.clone();
        event.data=json!({"kind":"group_session_recovery","target_actor_id":actor.id,"client_id":client_id,"recovery_id":record.id,"title":"新会话接续","message":"原会话无法恢复，已按用户的上班要求开启新会话。下方会载入可恢复的工作摘要；它是历史参考，不代表相关操作已完成。先核对最新任务、目录、文件和执行结果，只继续仍由你负责且未完成的工作。不要重复已完成、结果不明或已移交的操作；待用户确认事项仍须确认。缺失上下文先向项目经理或用户说明。","im_visibility":"internal"}).as_object().unwrap().clone();
        ledger::append(&path, &event).map_err(OpError::io)?;
    }
    let public_id = format!("group-recovery-ui:{}", record.id);
    if ledger::find_idempotent(&path, "chat.message", "system", &public_id)
        .map_err(OpError::io)?
        .is_none()
    {
        let mut event = Event::new("chat.message", &group.group_id);
        event.by = "system".into();
        let name = if actor.title.trim().is_empty() {
            &actor.id
        } else {
            &actor.title
        };
        event.data=json!({"kind":"group_session_recovered","to":["user"],"message_mode":"send","client_id":public_id,"sender_title":"系统","text":format!("{name} 的旧会话无法恢复，已开启新会话，正在接续可恢复的工作摘要。旧会话记录已保留；恢复内容是有限节选，成员会先核对最新任务与实际结果。")}).as_object().unwrap().clone();
        ledger::append(&path, &event).map_err(OpError::io)?;
    }
    Ok((
        status,
        Recovery {
            actor_id: actor.id.clone(),
            recovery_id: record.id.clone(),
            context_sources: record.sources.clone(),
        },
    ))
}

pub(super) fn delivery_context(
    home: &HomeLayout,
    group: &GroupDoc,
    actor_id: &str,
    events: &[Event],
) -> Option<String> {
    if !events.iter().any(|event| {
        event.by == "system"
            && event.kind == "system.notify"
            && event.data.get("kind").and_then(Value::as_str) == Some("group_session_recovery")
    }) {
        return None;
    }
    let actor = actors::find(group, actor_id)?;
    let current = super::runtime_session::snapshot(home, &group.group_id, actor_id).ok()??;
    events.iter().find_map(|event| {
        if event.kind != "system.notify"
            || event.by != "system"
            || event.data.get("kind").and_then(Value::as_str) != Some("group_session_recovery")
            || event.data.get("target_actor_id").and_then(Value::as_str) != Some(actor_id)
        {
            return None;
        }
        let id = event.data.get("recovery_id")?.as_str()?;
        if id.len() != 32 || !id.bytes().all(|value| value.is_ascii_hexdigit()) {
            return None;
        }
        let record: Record =
            niuma_core::fs::read_json(&directory(home, group).ok()?.join(format!("{id}.json")))
                .ok()?;
        (record.group_generation == group.generation
            && record.actor_id == actor_id
            && record.actor_generation == actors::generation_identity(actor)
            && same_conversation(&current, &record.current_identity))
        .then_some(record.context)
    })
}

pub(super) fn dispatch_first(home: &HomeLayout, group: &GroupDoc, recoveries: &[Recovery]) {
    let Ok(store) = GroupStore::new(home.clone()) else {
        return;
    };
    let Ok(path) = store.ledger_path(&group.group_id) else {
        return;
    };
    for recovery in recoveries {
        let Some(actor) = actors::find(group, &recovery.actor_id) else {
            continue;
        };
        if let Ok(Some(event)) = ledger::find_idempotent(
            &path,
            "system.notify",
            "system",
            &format!("group-recovery:{}", recovery.recovery_id),
        ) {
            // 先送入恢复摘要，再接收上班过程中到达的新消息。
            super::actor_delivery::dispatch_to(
                home,
                group,
                &event,
                std::slice::from_ref(actor),
                false,
            );
        }
    }
}

#[cfg(test)]
mod tests;
