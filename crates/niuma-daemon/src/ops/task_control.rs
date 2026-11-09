use super::operation::{
    Operation,
    Policy::{Read, Write},
};
use crate::dispatch::{OpError, OpResult, object, required_arg, store, string_arg};
use niuma_contracts::{ActorRole, DaemonRequest, Event, GroupState};
use niuma_core::{
    GroupDoc, HomeLayout, actors,
    context::{ContextDoc, ContextStore},
    task_control as control,
};
use serde_json::{Map, Value, json};
use sha2::{Digest, Sha256};

pub(super) fn resolve_operation(request: &DaemonRequest) -> Option<Operation> {
    (request.op == "task_control").then(|| {
        Operation::new(
            if string_arg(request, "action").as_deref().unwrap_or("get") == "get" {
                Read
            } else {
                Write
            },
            run,
        )
    })
}
fn user(by: &str) -> Result<(), OpError> {
    if by == "user" {
        Ok(())
    } else {
        Err(OpError::new(
            "permission_denied",
            "请由用户发起停止、恢复、删除或提问",
        ))
    }
}
fn manager(group: &GroupDoc, by: &str) -> Result<(), OpError> {
    if actors::effective_role(group, by) == Some(ActorRole::Foreman) {
        Ok(())
    } else {
        Err(OpError::new(
            "permission_denied",
            "须由当前项目经理确认任务停止",
        ))
    }
}
fn text<'a>(value: &'a Map<String, Value>, key: &str) -> &'a str {
    value.get(key).and_then(Value::as_str).unwrap_or_default()
}
fn lead(group: &GroupDoc) -> Option<&niuma_contracts::Actor> {
    actors::visible(group).find(|actor| {
        actor.availability.is_available()
            && actors::effective_role(group, &actor.id) == Some(ActorRole::Foreman)
    })
}
fn owner_stopped(home: &HomeLayout, group: &GroupDoc, id: &str) -> bool {
    actors::find(group, id).is_some_and(|actor| {
        actor.external_session_id.is_empty()
            && !actor.runtime.is_web_model()
            && !super::actor_runtime_status::resolve(home, group, actor).running
            && super::actor_runtime::delivery_owner(&group.group_id, id)
                .is_ok_and(|owner| owner.is_none())
    })
}
fn snapshot(doc: &ContextDoc, id: &str) -> Vec<Map<String, Value>> {
    let ids = doc.task_subtree_ids(id);
    let mut tasks = doc
        .tasks
        .iter()
        .filter(|task| ids.iter().any(|id| text(task, "id") == id))
        .cloned()
        .collect::<Vec<_>>();
    tasks.sort_by(|a, b| text(a, "id").cmp(text(b, "id")));
    tasks
}
fn token(tasks: &[Map<String, Value>]) -> String {
    format!(
        "{:x}",
        Sha256::digest(serde_json::to_vec(tasks).unwrap_or_default())
    )
}
fn report(home: &HomeLayout, gid: &str, id: &str) -> OpResult {
    let doc = ContextStore::new(home.clone())
        .map_err(OpError::io)?
        .load(gid)
        .map_err(OpError::io)?;
    let task = doc
        .tasks
        .iter()
        .find(|task| text(task, "id") == id)
        .ok_or_else(|| OpError::new("task_not_found", "任务已不存在"))?;
    let tree = snapshot(&doc, id);
    let blocked = tree.iter().find(|task| !control::deletable(task));
    object(
        json!({"task":task, "control":control::get(task), "delete_token":token(&tree),
        "delete_info":{"allowed":blocked.is_none(), "total":tree.len(),
            "reason":blocked.map(|task| if text(task,"id")==id {"task_not_stopped"} else {"subtask_not_stopped"}).unwrap_or("")}}),
    )
}
fn sync(
    home: &HomeLayout,
    gid: &str,
    ops: &[Map<String, Value>],
    version: Option<&str>,
    by: &str,
) -> Result<(), OpError> {
    let result = ContextStore::new(home.clone())
        .map_err(OpError::io)?
        .sync(gid, ops, version, by, false)
        .map_err(OpError::invalid)?;
    let mut event = Event::new("context.sync", gid);
    event.by = by.into();
    event.data = json!({"version":result.version, "changes":result.changes})
        .as_object()
        .unwrap()
        .clone();
    niuma_core::ledger::append(&store(home)?.ledger_path(gid).map_err(OpError::io)?, &event)
        .map_err(OpError::io)
}
fn run(home: &HomeLayout, request: &DaemonRequest) -> OpResult {
    let gid = required_arg(request, "group_id")?;
    let id = required_arg(request, "task_id")?;
    let action = string_arg(request, "action").unwrap_or_else(|| "get".into());
    let by = string_arg(request, "by").unwrap_or_else(|| "user".into());
    let group = store(home)?.load(&gid).map_err(OpError::not_found)?;
    let contexts = ContextStore::new(home.clone()).map_err(OpError::io)?;
    let doc = contexts.load(&gid).map_err(OpError::io)?;
    let Some(task) = doc.tasks.iter().find(|task| text(task, "id") == id) else {
        if action == "delete" {
            user(&by)?;
            return object(json!({"deleted":true,"already_absent":true,"task_id":id}));
        }
        return Err(OpError::new("task_not_found", "任务已不存在"));
    };
    if action == "get" {
        return report(home, &gid, &id);
    }
    if action == "ask" {
        user(&by)?;
        return ask(home, &group, task, request);
    }
    let old = control::get(task);
    if action == "delete" {
        user(&by)?;
        let tree = snapshot(&doc, &id);
        if tree.iter().any(|task| !control::deletable(task)) {
            return Err(OpError::new(
                "task_not_stopped",
                "当前任务或子任务尚未确认停止，不能删除",
            ));
        }
        if string_arg(request, "delete_token").as_deref() != Some(token(&tree).as_str()) {
            return Err(OpError::new(
                "task_conflict",
                "任务或子任务已变化，请重新核对删除范围",
            ));
        }
        let version = contexts.version(&doc).map_err(OpError::io)?;
        sync(
            home,
            &gid,
            &[json!({"op":"task.delete","task_id":id,
            "if_task_rev":task.get("rev").and_then(Value::as_u64).unwrap_or(0)})
            .as_object()
            .unwrap()
            .clone()],
            Some(&version),
            "user",
        )?;
        if let Some(manager) = lead(&group) {
            notice(
                home,
                &group,
                &manager.id,
                &format!("deleted-{}-{}", id, token(&tree)),
                format!(
                    "用户已删除任务 {id}「{}」及符合条件的子任务。旧定义保存在上下文事件的 removed_tasks 快照中，群聊与执行日志保留。请核对其他任务的依赖，不要从旧消息中重新创建或继续已删除任务。",
                    text(task, "title")
                ),
            )?;
        }
        return object(
            json!({"deleted":true,"task_id":id,"count":tree.len(),"deleted_task_ids":tree.iter().map(|task|text(task,"id")).collect::<Vec<_>>()}),
        );
    }
    let owner = text(task, "assignee");
    let generation = actors::find(&group, owner)
        .map(actors::generation_identity)
        .unwrap_or_default();
    let runtime_stopped = owner_stopped(home, &group, owner);
    let client_id = string_arg(request, "client_id")
        .unwrap_or_else(|| uuid::Uuid::new_v4().simple().to_string());
    if let Some(expected) = request.args.get("if_task_rev").and_then(Value::as_u64)
        && expected != task.get("rev").and_then(Value::as_u64).unwrap_or(0)
        && !old
            .as_ref()
            .is_some_and(|control| control.client_id == client_id)
    {
        return Err(OpError::new("task_conflict", "任务已变化，请核对最新状态"));
    }
    let nonce = if action == "request_stop" {
        old.as_ref()
            .filter(|old| old.owner_id == owner && old.owner_generation == generation)
            .map(|old| old.request_id.clone())
            .unwrap_or_else(|| uuid::Uuid::new_v4().simple().to_string())
    } else if matches!(action.as_str(), "ack_stop" | "confirm_stop") {
        required_arg(request, "request_id")?
    } else {
        old.as_ref()
            .map(|old| old.request_id.clone())
            .unwrap_or_default()
    };
    let mut op = json!({"op":"task.control","task_id":id,"action":action,"request_id":nonce,
        "owner_generation":generation,"runtime_stopped":runtime_stopped,"reported_by":by,
        "note":string_arg(request,"note").unwrap_or_default(),"client_id":client_id})
    .as_object()
    .unwrap()
    .clone();
    match action.as_str() {
        "request_stop" => {
            user(&by)?;
            if old.as_ref().is_some_and(|old| old.state == "stopped") {
                return report(home, &gid, &id);
            }
            if old.as_ref().is_some_and(|old| old.request_id == nonce) {
                op.insert("action".into(), json!("retry_stop"));
            }
        }
        "ack_stop" | "confirm_stop" => {
            if action == "confirm_stop" {
                manager(&group, &by)?;
            }
            let previous = old
                .as_ref()
                .ok_or_else(|| OpError::new("invalid_args", "任务没有停止请求"))?;
            if previous.request_id != nonce
                || previous.owner_id != owner
                || previous.owner_generation != generation
            {
                return Err(OpError::new(
                    "task_conflict",
                    "负责人或停止请求已变化，请重新协调",
                ));
            }
            if action == "ack_stop" && (by != owner || generation.is_empty()) {
                return Err(OpError::new(
                    "permission_denied",
                    "须由当前负责人提交停止回执",
                ));
            }
            if previous.state == "stopped" {
                return report(home, &gid, &id);
            }
        }
        "resume" => {
            user(&by)?;
            if old.is_none() {
                return report(home, &gid, &id);
            }
        }
        _ => return Err(OpError::new("invalid_args", "不支持的任务控制动作")),
    }
    let version = contexts.version(&doc).map_err(OpError::io)?;
    let replay = action == "request_stop"
        && old
            .as_ref()
            .is_some_and(|old| old.client_id == client_id && old.request_id == nonce);
    if !replay {
        sync(home, &gid, &[op], Some(&version), "system")?;
    }
    let result = report(home, &gid, &id)?;
    let current = result.get("control").cloned().unwrap_or(Value::Null);
    let title = text(task, "title");
    if action == "resume" {
        if let Some(manager) = lead(&group) {
            notice(
                home,
                &group,
                &manager.id,
                &format!("resume-{id}-{}", doc.revision),
                format!(
                    "用户已明确恢复任务 {id}「{title}」。请核对当前归属和实际结果后安排未完成的工作，不重复已完成步骤。"
                ),
            )?;
        }
    } else if current.get("state").and_then(Value::as_str) == Some("stopping") {
        let attempts = current.get("attempt").and_then(Value::as_u64).unwrap_or(0);
        if let Some(manager) = lead(&group) {
            notice(
                home,
                &group,
                &manager.id,
                &format!(
                    "manager-{nonce}-{attempts}-{}",
                    current
                        .get("acknowledged_at")
                        .and_then(Value::as_str)
                        .unwrap_or("pending")
                ),
                format!(
                    "用户要求停止任务 {id}「{title}」，请求 ID：{nonce}，负责人：{owner}。请先通过异步邮件协调（niuma_message_send mode=mail），核对负责人正在执行的工作，在当前任务的安全边界停下并保存结果，避免打断其其他任务。负责人须用 niuma_task_control(action=ack_stop, task_id=\"{id}\", request_id=\"{nonce}\", note=真实停止说明) 提交系统回执，你核实后再调用 action=confirm_stop 确认。先 action=get 核对状态，不能把普通聊天中的口头承诺当作系统确认。无负责人时向团队核实并在确认中说明依据。子任务独立核对，未停止子任务仍禁止整项删除。"
                ),
            )?;
        }
    } else if action != "ack_stop" {
        if let Some(manager) = lead(&group) {
            notice(
                home,
                &group,
                &manager.id,
                &format!("stopped-{nonce}"),
                format!(
                    "任务 {id}「{title}」已确认停止，保持其人工停止状态，不再自动安排。用户明确继续后才恢复；群聊与执行记录仍保留。"
                ),
            )?;
        }
    }
    Ok(result)
}
fn notice(
    home: &HomeLayout,
    group: &GroupDoc,
    target: &str,
    key: &str,
    message: String,
) -> Result<(), OpError> {
    let Some(actor) = actors::find(group, target) else {
        return Ok(());
    };
    let client_id = format!(
        "task-control:{key}:{}:{}",
        actor.id,
        actors::generation_identity(actor)
    );
    let path = store(home)?
        .ledger_path(&group.group_id)
        .map_err(OpError::io)?;
    let event = if let Some(event) =
        niuma_core::ledger::find_idempotent(&path, "system.notify", "system", &client_id)
            .map_err(OpError::io)?
    {
        event
    } else {
        let mut event = Event::new("system.notify", &group.group_id);
        event.by = "system".into();
        event.data=json!({"kind":"task_control_notice","target_actor_id":target,"client_id":client_id,"title":"任务控制","message":message}).as_object().unwrap().clone();
        niuma_core::ledger::append(&path, &event).map_err(OpError::io)?;
        event
    };
    if group.running && group.state == GroupState::Active {
        super::actor_delivery::dispatch_to(home, group, &event, std::slice::from_ref(actor), false);
    }
    Ok(())
}
fn ask(
    home: &HomeLayout,
    group: &GroupDoc,
    task: &Map<String, Value>,
    request: &DaemonRequest,
) -> OpResult {
    let manager = lead(group)
        .ok_or_else(|| OpError::new("manager_unavailable", "请先指定一位在岗项目经理"))?;
    let question = required_arg(request, "question")?;
    if question.trim().is_empty() || question.chars().count() > 2000 {
        return Err(OpError::new(
            "invalid_args",
            "问题不能为空，且不能超过 2000 字",
        ));
    }
    let id = text(task, "id");
    let title = text(task, "title");
    let mut args = request.args.clone();
    args.insert("by".into(), json!("user"));
    args.insert("to".into(), json!(["@foreman"]));
    args.insert("message_mode".into(), json!("request_reply"));
    args.insert("text".into(),json!(format!("关于任务 {id}「{title}」的提问：\n{}\n\n请当前项目经理核对任务记录后解答。信息不足时，先向负责成员或团队中的相关成员咨询，带上任务与问题上下文；核实后由项目经理统一回复用户，不确定的部分请明确说明。",question.trim())));
    args.insert("refs".into(),json!([{"kind":"task_ref","task_id":id,"title":title,"status":task.get("status"),"waiting_on":task.get("waiting_on")}]));
    args.remove("task_id");
    args.remove("action");
    args.remove("question");
    let mut result = super::messaging::send_preserving_group_state(
        home,
        &DaemonRequest {
            v: 1,
            op: "send".into(),
            args,
        },
    )?;
    result.insert("manager_id".into(), json!(manager.id));
    result.insert(
        "awaiting_start".into(),
        json!(
            !group.running
                || group.state != GroupState::Active
                || !super::actor_runtime_status::resolve(home, group, manager).running
        ),
    );
    Ok(result)
}
