use super::operation::{
    Operation,
    Policy::{Read, Write},
};
use crate::dispatch::{OpError, OpResult, object, required_arg, store, string_arg};
use cccc_contracts::{
    ActorAvailability, ActorLeave, ActorLeaveStatus, ActorLeaveTask, ActorRole, DaemonRequest,
};
use cccc_core::{GroupDoc, HomeLayout, actor_leave as workflow, actors, context::ContextStore};
use serde_json::{Value, json};

#[path = "actor_leave/coordination.rs"]
mod coordination;
#[path = "actor_leave/session.rs"]
mod session;
#[path = "actor_leave/transfers.rs"]
mod transfers;

#[cfg(test)]
#[path = "actor_leave_tests.rs"]
mod tests;

pub(super) fn resolve_operation(request: &DaemonRequest) -> Option<Operation> {
    (request.op == "actor_leave").then(|| {
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

fn caller(request: &DaemonRequest) -> String {
    string_arg(request, "by").unwrap_or_else(|| "user".into())
}
fn user(by: &str) -> Result<(), OpError> {
    if matches!(by, "user" | "system") {
        Ok(())
    } else {
        Err(OpError::new(
            "permission_denied",
            "请由用户发起离岗、召回或撤销操作",
        ))
    }
}
fn manager(group: &GroupDoc, by: &str) -> Result<(), OpError> {
    if matches!(by, "user" | "system")
        || actors::effective_role(group, by) == Some(ActorRole::Foreman)
    {
        Ok(())
    } else {
        Err(OpError::new(
            "permission_denied",
            "工作交接必须由项目经理分配",
        ))
    }
}
fn mutate(
    home: &HomeLayout,
    gid: &str,
    apply: impl FnOnce(&mut GroupDoc) -> std::io::Result<ActorLeave>,
) -> Result<ActorLeave, OpError> {
    store(home)?.mutate(gid, apply).map_err(OpError::invalid)
}
fn task_snapshot(
    home: &HomeLayout,
    gid: &str,
    actor_id: &str,
) -> Result<Vec<ActorLeaveTask>, OpError> {
    let document = ContextStore::new(home.clone())
        .map_err(OpError::io)?
        .load(gid)
        .map_err(OpError::io)?;
    Ok(document
        .tasks
        .iter()
        .filter(|task| {
            task.get("assignee").and_then(Value::as_str) == Some(actor_id)
                && !matches!(
                    task.get("status").and_then(Value::as_str),
                    Some("done" | "archived")
                )
        })
        .filter_map(|task| {
            Some(ActorLeaveTask {
                task_id: task.get("id")?.as_str()?.into(),
                title: task
                    .get("title")
                    .and_then(Value::as_str)
                    .unwrap_or_default()
                    .into(),
                revision: task.get("rev").and_then(Value::as_u64).unwrap_or(0),
                to: String::new(),
                to_generation: String::new(),
                assignment_id: String::new(),
                accepted_at: None,
                transferred: false,
                closed: false,
            })
        })
        .collect())
}

fn run(home: &HomeLayout, request: &DaemonRequest) -> OpResult {
    let gid = required_arg(request, "group_id")?;
    let group = store(home)?.load(&gid).map_err(OpError::not_found)?;
    let action = string_arg(request, "action").unwrap_or_else(|| "get".into());
    let by = caller(request);
    let record = if action == "request" {
        user(&by)?;
        let aid = required_arg(request, "actor_id")?;
        if let Some(expected) = string_arg(request, "expected_actor_generation")
            && actors::find(&group, &aid)
                .is_none_or(|actor| actors::generation_identity(actor) != expected)
        {
            return Err(OpError::new(
                "actor_changed",
                "成员身份已更新，请重新打开配置",
            ));
        }
        let tasks = task_snapshot(home, &gid, &aid)?;
        let immediate = request.args.get("immediate") == Some(&Value::Bool(true));
        let deputy = string_arg(request, "deputy_id").unwrap_or_default();
        let leave = mutate(home, &gid, |group| {
            workflow::request(group, &aid, immediate, &deputy, tasks)
        })?;
        let already_pending = actors::find(&group, &aid)
            .is_some_and(|actor| !actor.leave_id.is_empty() && !actor.availability.is_available());
        if !already_pending && let Err(error) = coordination::begin(home, &gid, &leave) {
            remember_error(home, &gid, &leave.id, &error);
        }
        workflow::get(&store(home)?.load(&gid).map_err(OpError::io)?, &leave.id)
            .map_err(OpError::invalid)?
    } else {
        let id = string_arg(request, "leave_id")
            .or_else(|| {
                string_arg(request, "actor_id")
                    .and_then(|aid| actors::find(&group, &aid).map(|actor| actor.leave_id.clone()))
            })
            .filter(|id| !id.is_empty())
            .ok_or_else(|| OpError::new("invalid_args", "缺少交接记录 ID"))?;
        let record = workflow::get(&group, &id).map_err(OpError::not_found)?;
        if action != "get" {
            workflow::source(&group, &record).map_err(OpError::invalid)?;
        }
        match action.as_str() {
            "get" => record,
            "summary" => {
                if by != record.actor_id {
                    manager(&group, &by)?;
                }
                let text = required_arg(request, "summary")?;
                mutate(home, &gid, |group| {
                    workflow::summary(group, &id, &by, &text)
                })?
            }
            "assign" => {
                manager(&group, &by)?;
                let assignments = request
                    .args
                    .get("assignments")
                    .and_then(Value::as_array)
                    .filter(|items| items.len() <= 500)
                    .ok_or_else(|| OpError::new("invalid_args", "请提供任务分配列表"))?
                    .iter()
                    .map(|item| {
                        let task = item
                            .get("task_id")
                            .and_then(Value::as_str)
                            .filter(|value| !value.is_empty());
                        let to = item
                            .get("actor_id")
                            .and_then(Value::as_str)
                            .filter(|value| !value.is_empty());
                        match (task, to) {
                            (Some(task), Some(to)) => Ok((task.to_owned(), to.to_owned())),
                            _ => Err(OpError::new("invalid_args", "每项分配必须包含任务和接手人")),
                        }
                    })
                    .collect::<Result<Vec<_>, _>>()?;
                let fresh = task_snapshot(home, &gid, &record.actor_id)?;
                let document = ContextStore::new(home.clone())
                    .map_err(OpError::io)?
                    .load(&gid)
                    .map_err(OpError::io)?;
                mutate(home, &gid, |group| {
                    let mut record = workflow::get(group, &id)?;
                    for item in &mut record.tasks {
                        item.closed = document
                            .tasks
                            .iter()
                            .find(|task| {
                                task.get("id").and_then(Value::as_str)
                                    == Some(item.task_id.as_str())
                            })
                            .is_none_or(|task| {
                                matches!(
                                    task.get("status").and_then(Value::as_str),
                                    Some("done" | "archived")
                                )
                            });
                    }
                    for task in fresh {
                        if let Some(old) = record
                            .tasks
                            .iter_mut()
                            .find(|old| old.task_id == task.task_id)
                        {
                            if old.revision != task.revision && !old.to.is_empty() {
                                old.assignment_id = uuid::Uuid::new_v4().simple().to_string();
                                old.accepted_at = None;
                            }
                            old.revision = task.revision;
                            old.title = task.title;
                        } else {
                            record.tasks.push(task);
                        }
                    }
                    let lead = workflow::manager(group)?;
                    record.manager_id = lead.id.clone();
                    record.manager_generation = actors::generation_identity(lead);
                    workflow::save(group, record)?;
                    workflow::assign(group, &id, &assignments)
                })?
            }
            "accept" => {
                let ids = request
                    .args
                    .get("assignment_ids")
                    .and_then(Value::as_array)
                    .filter(|items| items.len() <= 500)
                    .ok_or_else(|| OpError::new("invalid_args", "请提供接手确认 ID"))?
                    .iter()
                    .map(|value| {
                        value
                            .as_str()
                            .map(str::to_owned)
                            .ok_or_else(|| OpError::new("invalid_args", "确认 ID 必须是字符串"))
                    })
                    .collect::<Result<Vec<_>, _>>()?;
                mutate(home, &gid, |group| workflow::accept(group, &id, &by, &ids))?
            }
            "force" => {
                user(&by)?;
                if !record.is_handing_off() {
                    return Err(OpError::new("invalid_args", "该成员已完成离岗"));
                }
                coordination::stop(home, &group, &record.actor_id)?;
                mutate(home, &gid, |group| {
                    let mut record = workflow::get(group, &id)?;
                    record.immediate = true;
                    workflow::save(group, record)?;
                    workflow::mark_stopped(group, &id, false)
                })?
            }
            "recall" => {
                user(&by)?;
                mutate(home, &gid, |group| workflow::recall(group, &id))?
            }
            "ready" => {
                if by != record.actor_id {
                    return Err(OpError::new(
                        "permission_denied",
                        "必须由返岗成员本人确认同步完成",
                    ));
                }
                let summary = string_arg(request, "summary").unwrap_or_default();
                mutate(home, &gid, |group| workflow::ready(group, &id, &summary))?
            }
            "cancel" => {
                user(&by)?;
                if !record.is_handing_off() {
                    return Err(OpError::new(
                        "invalid_args",
                        "请通过召回恢复已完成交接的成员",
                    ));
                }
                if record.status == ActorLeaveStatus::Finalizing {
                    return Err(OpError::new(
                        "handoff_finalizing",
                        "移交已进入提交阶段，请继续协调后再召回",
                    ));
                }
                coordination::stop(home, &group, &record.actor_id)?;
                mutate(home, &gid, |group| {
                    let mut record = workflow::get(group, &id)?;
                    let actor = group
                        .actors
                        .iter_mut()
                        .find(|actor| actor.id == record.actor_id)
                        .unwrap();
                    actor.availability = ActorAvailability::Available;
                    actor.enabled = true;
                    actor.leave_id.clear();
                    actor.work_after = cccc_contracts::utc_now();
                    record.status = ActorLeaveStatus::Cancelled;
                    record.last_error.clear();
                    workflow::save(group, record)
                })?
            }
            "retry" => {
                manager(&group, &by)?;
                if !record.is_handing_off() && record.status != ActorLeaveStatus::Returning {
                    return Err(OpError::new("invalid_args", "已完成的交接无需重复协调"));
                }
                mutate(home, &gid, |group| {
                    let mut record = workflow::get(group, &id)?;
                    record.notify_attempt += 1;
                    record.last_error.clear();
                    if matches!(
                        record.status,
                        ActorLeaveStatus::Preparing | ActorLeaveStatus::Returning
                    ) {
                        if let Some(actor) = group
                            .actors
                            .iter_mut()
                            .find(|actor| actor.id == record.actor_id)
                        {
                            actor.enabled = true;
                        }
                    }
                    workflow::save(group, record)
                })?
            }
            _ => return Err(OpError::new("invalid_args", "不支持的离岗操作")),
        }
    };
    if super::actor_runtime::user_confirmation_retry(request)
        && matches!(action.as_str(), "recall" | "retry")
        && matches!(
            record.status,
            ActorLeaveStatus::Preparing | ActorLeaveStatus::Returning
        )
    {
        coordination::user_retry(home, &gid, &record)?;
    }
    let mut record = if action != "get"
        && matches!(
            record.status,
            ActorLeaveStatus::Accepting | ActorLeaveStatus::Finalizing
        )
        && record.all_accepted()
    {
        match transfers::finalize(home, &gid, &record) {
            Ok(done) => done,
            Err(error) => {
                remember_error(home, &gid, &record.id, &error);
                workflow::get(&store(home)?.load(&gid).map_err(OpError::io)?, &record.id)
                    .map_err(OpError::io)?
            }
        }
    } else {
        record
    };
    if action != "get" {
        if action == "retry" && record.status == ActorLeaveStatus::Preparing && !record.immediate {
            if let Err(error) = coordination::begin(home, &gid, &record) {
                remember_error(home, &gid, &record.id, &error);
            }
        }
        if let Err(error) = coordination::publish(home, &gid, &record) {
            remember_error(home, &gid, &record.id, &error);
        }
        record = workflow::get(&store(home)?.load(&gid).map_err(OpError::io)?, &record.id)
            .map_err(OpError::io)?;
    }
    let document = ContextStore::new(home.clone())
        .map_err(OpError::io)?
        .load(&gid)
        .map_err(OpError::io)?;
    let current_tasks=document.tasks.iter().filter(|task|record.tasks.iter().any(|entry|task.get("id").and_then(Value::as_str)==Some(entry.task_id.as_str()))||task.get("assignee").and_then(Value::as_str)==Some(record.actor_id.as_str())||task.get("handoff_to").and_then(Value::as_str)==Some(record.actor_id.as_str())).map(|task|json!({"task_id":task.get("id"),"title":task.get("title"),"assignee":task.get("assignee"),"handoff_to":task.get("handoff_to"),"status":task.get("status"),"rev":task.get("rev")})).collect::<Vec<_>>();
    let current = store(home)?.load(&gid).map_err(OpError::io)?;
    let available_members=current.actors.iter().filter(|actor|workflow::available(actor)&&actor.internal_kind.is_none()).map(|actor|json!({"id":actor.id,"title":actor.title,"runtime":actor.runtime,"generation":actors::generation_identity(actor)})).collect::<Vec<_>>();
    object(
        json!({"leave":record,"current_tasks":current_tasks,"available_members":available_members}),
    )
}

fn remember_error(home: &HomeLayout, gid: &str, id: &str, error: &OpError) {
    let _ = mutate(home, gid, |group| {
        let mut record = workflow::get(group, id)?;
        record.last_error = format!(
            "交接尚未完成（{}）。请项目经理核对任务与运行状态后继续协调。",
            error.code
        );
        workflow::save(group, record)
    });
    tracing::warn!(group_id=%gid,leave_id=%id,code=%error.code,"离岗协调等待重试");
}

pub(super) fn reconcile(home: &HomeLayout, gid: &str) -> Result<(), OpError> {
    let group = store(home)?.load(gid).map_err(OpError::io)?;
    if !group.running || group.state != cccc_contracts::GroupState::Active {
        return Ok(());
    }
    for mut record in workflow::records(&group)
        .map_err(OpError::io)?
        .into_values()
    {
        if workflow::source(&group, &record).is_err()
            || actors::find(&group, &record.actor_id)
                .is_none_or(|actor| actor.leave_id != record.id)
            || matches!(
                record.status,
                ActorLeaveStatus::Returned | ActorLeaveStatus::Cancelled
            )
        {
            continue;
        }
        if record.is_handing_off()
            && let Ok(lead) = workflow::manager(&group)
            && (record.manager_id != lead.id
                || record.manager_generation != actors::generation_identity(lead))
        {
            record = mutate(home, gid, |group| {
                let mut current = workflow::get(group, &record.id)?;
                let lead = workflow::manager(group)?;
                current.manager_id = lead.id.clone();
                current.manager_generation = actors::generation_identity(lead);
                current.notify_attempt += 1;
                workflow::save(group, current)
            })?;
        }
        if matches!(
            record.status,
            ActorLeaveStatus::Accepting | ActorLeaveStatus::Finalizing
        ) && record.all_accepted()
        {
            match transfers::finalize(home, gid, &record) {
                Ok(done) => record = done,
                Err(error) => {
                    remember_error(home, gid, &record.id, &error);
                    record =
                        workflow::get(&store(home)?.load(gid).map_err(OpError::io)?, &record.id)
                            .map_err(OpError::io)?;
                }
            }
        }
        if record.last_error.is_empty()
            && matches!(
                record.status,
                ActorLeaveStatus::Preparing | ActorLeaveStatus::Returning
            )
            && (record.status == ActorLeaveStatus::Returning || !record.immediate)
        {
            if actors::find(&group, &record.actor_id).is_some_and(|actor| actor.enabled) {
                if let Err(error) = coordination::start_control(home, gid, &record) {
                    remember_error(home, gid, &record.id, &error);
                    record =
                        workflow::get(&store(home)?.load(gid).map_err(OpError::io)?, &record.id)
                            .map_err(OpError::io)?;
                }
            }
        }
        if let Err(error) = coordination::ensure_notices(home, gid, &record) {
            remember_error(home, gid, &record.id, &error);
        }
    }
    Ok(())
}
