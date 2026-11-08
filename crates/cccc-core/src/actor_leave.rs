use crate::{GroupDoc, actors};
use cccc_contracts::{
    Actor, ActorAvailability, ActorLeave, ActorLeaveStatus, ActorLeaveTask, ActorRole, utc_now,
};
use serde_json::{Value, json};
use std::{collections::BTreeMap, io};

pub const RECORDS_KEY: &str = "actor_leaves";

pub fn records(group: &GroupDoc) -> io::Result<BTreeMap<String, ActorLeave>> {
    group
        .extra
        .get(RECORDS_KEY)
        .map(|value| serde_json::from_value(value.clone()).map_err(io::Error::other))
        .unwrap_or_else(|| Ok(BTreeMap::new()))
}
pub fn get(group: &GroupDoc, id: &str) -> io::Result<ActorLeave> {
    records(group)?
        .remove(id)
        .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "找不到离岗交接记录"))
}
pub fn save(group: &mut GroupDoc, mut record: ActorLeave) -> io::Result<ActorLeave> {
    record.updated_at = utc_now();
    let mut all = records(group)?;
    record.revision = all
        .get(&record.id)
        .map_or(1, |old| old.revision.saturating_add(1));
    all.insert(record.id.clone(), record.clone());
    group.extra.insert(RECORDS_KEY.into(), json!(all));
    Ok(record)
}
pub fn source<'a>(group: &'a GroupDoc, record: &ActorLeave) -> io::Result<&'a Actor> {
    actors::find(group, &record.actor_id)
        .filter(|actor| actors::generation_identity(actor) == record.actor_generation)
        .ok_or_else(|| io::Error::other("原成员身份已变化，不能继续旧交接"))
}
pub fn available(actor: &Actor) -> bool {
    actor.enabled && actor.availability.is_available()
}
pub fn manager(group: &GroupDoc) -> io::Result<&Actor> {
    actors::visible(group)
        .find(|actor| {
            actor.availability.is_available()
                && actors::effective_role(group, &actor.id) == Some(ActorRole::Foreman)
        })
        .ok_or_else(|| io::Error::other("没有可协调交接的项目经理"))
}

pub fn request(
    group: &mut GroupDoc,
    actor_id: &str,
    immediate: bool,
    deputy_id: &str,
    tasks: Vec<ActorLeaveTask>,
) -> io::Result<ActorLeave> {
    let actor = actors::find(group, actor_id)
        .cloned()
        .ok_or_else(|| io::Error::other("成员不存在"))?;
    if !actor.leave_id.is_empty() && !actor.availability.is_available() {
        return get(group, &actor.leave_id);
    }
    if !actor.external_session_id.is_empty() {
        return Err(io::Error::other(
            "外部原生会话由原拥有者管理，请先在原会话完成交接",
        ));
    }
    if actor.internal_kind.is_some() {
        return Err(io::Error::other("系统内部成员不参与员工离岗交接"));
    }
    if !matches!(
        actor.runtime,
        cccc_contracts::ActorRuntime::Codex | cccc_contracts::ActorRuntime::Claude
    ) {
        return Err(io::Error::other(
            "当前离岗功能支持 CCCC 托管的 Codex 和 Claude，其他运行时请先手动交接后停用",
        ));
    }
    if crate::runtime_switches::has_pending(group, actor_id) {
        return Err(io::Error::other("请先完成该成员正在进行的运行时切换"));
    }
    if actors::effective_role(group, actor_id) == Some(ActorRole::Foreman) {
        if deputy_id.is_empty() || deputy_id == actor_id {
            return Err(io::Error::other(
                "项目经理离岗前，请由用户指定一位在岗代理项目经理",
            ));
        }
        let deputy = actors::find(group, deputy_id)
            .filter(|actor| available(actor) && actor.internal_kind.is_none())
            .ok_or_else(|| io::Error::other("代理项目经理必须是在岗成员"))?;
        let deputy_id = deputy.id.clone();
        let mut ids = actors::visible(group)
            .map(|actor| actor.id.clone())
            .filter(|id| id != &deputy_id)
            .collect::<Vec<_>>();
        ids.insert(0, deputy_id);
        actors::reorder(group, &ids)?;
    }
    let manager = manager(group)?.clone();
    let now = utc_now();
    let record = ActorLeave {
        revision: 0,
        id: format!("leave_{}", uuid::Uuid::new_v4().simple()),
        actor_id: actor.id.clone(),
        actor_generation: actors::generation_identity(&actor),
        manager_id: manager.id.clone(),
        manager_generation: actors::generation_identity(&manager),
        status: if immediate {
            ActorLeaveStatus::Assigning
        } else {
            ActorLeaveStatus::Preparing
        },
        immediate,
        summary: String::new(),
        summary_by: String::new(),
        tasks,
        requested_at: now.clone(),
        updated_at: now,
        last_error: String::new(),
        recall_summary: String::new(),
        notify_attempt: 0,
    };
    let member = group
        .actors
        .iter_mut()
        .find(|member| member.id == actor_id)
        .unwrap();
    member.availability = ActorAvailability::Handoff;
    member.leave_id = record.id.clone();
    if !immediate {
        member.enabled = true;
    }
    save(group, record)
}

pub fn summary(group: &mut GroupDoc, id: &str, by: &str, text: &str) -> io::Result<ActorLeave> {
    let mut record = get(group, id)?;
    source(group, &record)?;
    if !record.is_handing_off() {
        return Err(io::Error::other("当前交接已结束"));
    }
    if text.trim().is_empty() || text.len() > 16_384 {
        return Err(io::Error::other("交接总结不能为空，且不能超过 16 KB"));
    }
    if record.summary == text.trim() {
        return Ok(record);
    }
    for task in record
        .tasks
        .iter_mut()
        .filter(|task| !task.transferred && !task.closed && !task.to.is_empty())
    {
        task.assignment_id = uuid::Uuid::new_v4().simple().to_string();
        task.accepted_at = None;
    }
    record.summary = text.trim().into();
    record.summary_by = by.into();
    record.status = ActorLeaveStatus::Assigning;
    record.last_error.clear();
    save(group, record)
}

pub fn assign(
    group: &mut GroupDoc,
    id: &str,
    assignments: &[(String, String)],
) -> io::Result<ActorLeave> {
    let mut record = get(group, id)?;
    source(group, &record)?;
    if !record.is_handing_off() || record.summary.trim().is_empty() {
        return Err(io::Error::other("请先核对并提交交接总结"));
    }
    for (task_id, to) in assignments {
        if to == &record.actor_id {
            return Err(io::Error::other("接手人不能是离岗成员本人"));
        }
        let recipient = actors::find(group, to)
            .filter(|actor| available(actor) && actor.internal_kind.is_none())
            .ok_or_else(|| io::Error::other("接手人必须是可接任务的在岗成员"))?;
        let task = record
            .tasks
            .iter_mut()
            .find(|task| &task.task_id == task_id)
            .ok_or_else(|| io::Error::other("分配的任务不在交接清单中"))?;
        if task.transferred || task.closed {
            continue;
        }
        if task.to != *to || task.to_generation != actors::generation_identity(recipient) {
            task.to = to.clone();
            task.to_generation = actors::generation_identity(recipient);
            task.assignment_id = uuid::Uuid::new_v4().simple().to_string();
            task.accepted_at = None;
        }
    }
    if record
        .tasks
        .iter()
        .any(|task| !task.transferred && !task.closed && task.to.is_empty())
    {
        return Err(io::Error::other("请为每一项未完成工作指定接手人"));
    }
    record.status = ActorLeaveStatus::Accepting;
    record.last_error.clear();
    save(group, record)
}

pub fn accept(group: &mut GroupDoc, id: &str, by: &str, ids: &[String]) -> io::Result<ActorLeave> {
    let mut record = get(group, id)?;
    source(group, &record)?;
    if record.status == ActorLeaveStatus::Away
        && ids.iter().all(|id| {
            record
                .tasks
                .iter()
                .any(|task| task.assignment_id == *id && task.to == by && task.transferred)
        })
    {
        return Ok(record);
    }
    if record.status != ActorLeaveStatus::Accepting || ids.is_empty() {
        return Err(io::Error::other("当前没有可确认的交接"));
    }
    let receiver = actors::find(group, by)
        .filter(|actor| available(actor))
        .ok_or_else(|| io::Error::other("接手人当前不在岗"))?;
    for id in ids {
        let task = record
            .tasks
            .iter_mut()
            .find(|task| {
                task.assignment_id == *id
                    && task.to == by
                    && task.to_generation == actors::generation_identity(receiver)
            })
            .ok_or_else(|| io::Error::other("交接已改派或确认人不是指定接手人"))?;
        if task.accepted_at.is_none() {
            task.accepted_at = Some(utc_now());
        }
    }
    save(group, record)
}

pub fn mark_stopped(group: &mut GroupDoc, id: &str, completed: bool) -> io::Result<ActorLeave> {
    let mut record = get(group, id)?;
    source(group, &record)?;
    let actor = group
        .actors
        .iter_mut()
        .find(|actor| actor.id == record.actor_id)
        .unwrap();
    actor.enabled = false;
    actor.availability = ActorAvailability::Away;
    if completed {
        record.status = ActorLeaveStatus::Away;
        for task in &mut record.tasks {
            if !task.closed {
                task.transferred = true;
            }
        }
    }
    record.last_error.clear();
    save(group, record)
}

pub fn recall(group: &mut GroupDoc, id: &str) -> io::Result<ActorLeave> {
    let mut record = get(group, id)?;
    source(group, &record)?;
    if matches!(
        record.status,
        ActorLeaveStatus::Returning | ActorLeaveStatus::Returned
    ) {
        return Ok(record);
    }
    if record.status != ActorLeaveStatus::Away {
        return Err(io::Error::other(
            "工作交接尚未完成，请先由项目经理处理或撤销离岗",
        ));
    }
    let actor = group
        .actors
        .iter_mut()
        .find(|actor| actor.id == record.actor_id)
        .unwrap();
    actor.availability = ActorAvailability::Returning;
    actor.enabled = true;
    actor.work_after = utc_now();
    record.status = ActorLeaveStatus::Returning;
    record.last_error.clear();
    save(group, record)
}

pub fn ready(group: &mut GroupDoc, id: &str, summary: &str) -> io::Result<ActorLeave> {
    let mut record = get(group, id)?;
    source(group, &record)?;
    if record.status == ActorLeaveStatus::Returned {
        return Ok(record);
    }
    if record.status != ActorLeaveStatus::Returning {
        return Err(io::Error::other("成员当前不处于返岗同步状态"));
    }
    let actor = group
        .actors
        .iter_mut()
        .find(|actor| actor.id == record.actor_id)
        .unwrap();
    actor.availability = ActorAvailability::Available;
    actor.leave_id.clear();
    record.status = ActorLeaveStatus::Returned;
    record.recall_summary = summary.trim().chars().take(4096).collect();
    save(group, record)
}

/// 旧工作仍可在历史中查看，自动投递只接纳截止点之后的新任务。
pub fn accepts_event(actor: &Actor, event: &cccc_contracts::Event) -> bool {
    let control = event.kind == "system.notify"
        && event
            .data
            .get("kind")
            .and_then(Value::as_str)
            .is_some_and(|kind| matches!(kind, "actor_leave_prepare" | "actor_leave_recall"));
    if control
        && event.data.get("target_actor_id").and_then(Value::as_str) != Some(actor.id.as_str())
    {
        return false;
    }
    accepts_delivery(
        actor,
        &event.ts,
        control,
        event
            .data
            .get("leave_id")
            .and_then(Value::as_str)
            .unwrap_or_default(),
    )
}

pub fn accepts_delivery(actor: &Actor, ts: &str, control: bool, leave_id: &str) -> bool {
    if actor.availability == ActorAvailability::Away {
        return false;
    }
    if !actor.availability.is_available() {
        return control && !actor.leave_id.is_empty() && leave_id == actor.leave_id;
    }
    if control {
        return false;
    }
    if actor.work_after.is_empty() {
        return true;
    }
    let date = |text: &str| chrono::DateTime::parse_from_rfc3339(text).ok();
    match (date(ts), date(&actor.work_after)) {
        (Some(event), Some(cutoff)) => event > cutoff,
        _ => false,
    }
}
