use super::*;
use cccc_contracts::{Event, GroupState};
use cccc_core::ledger;

pub(super) fn stop(home: &HomeLayout, group: &GroupDoc, actor_id: &str) -> Result<(), OpError> {
    super::super::actor_delivery::shutdown_actor_for(
        &group.group_id,
        actor_id,
        super::super::actor_delivery::ShutdownReason::Replace,
    );
    super::super::actor_runtime::apply(home, group, actor_id, "actor.stop")?;
    let actor = actors::find(group, actor_id)
        .ok_or_else(|| OpError::new("actor_not_found", "成员不存在"))?;
    if super::super::actor_runtime::actor_is_running(group, actor) {
        return Err(OpError::new("stop_unconfirmed", "尚未确认成员停止"));
    }
    Ok(())
}
pub(super) fn begin(home: &HomeLayout, gid: &str, record: &ActorLeave) -> Result<(), OpError> {
    let group = store(home)?.load(gid).map_err(OpError::io)?;
    stop(home, &group, &record.actor_id)?;
    if record.immediate {
        mutate(home, gid, |group| {
            workflow::mark_stopped(group, &record.id, false)
        })?;
    } else {
        start_control(home, gid, record)?;
    }
    Ok(())
}

pub(super) fn user_retry(home: &HomeLayout, gid: &str, record: &ActorLeave) -> Result<(), OpError> {
    let group = store(home)?.load(gid).map_err(OpError::io)?;
    let source = workflow::source(&group, record).map_err(OpError::invalid)?;
    let effective = super::super::actor_profile_runtime::resolve(home, source)?;
    if effective.runtime == cccc_contracts::ActorRuntime::Claude {
        super::super::runtime_session::retry_failed_claude_resume(home, gid, &source.id)
            .map_err(OpError::io)?;
    } else {
        super::super::runtime_session::resume_failure::retry(
            home,
            gid,
            &source.id,
            effective.runtime,
        )
        .map_err(OpError::io)?;
    }
    super::super::local_headless::retry_confirmation(gid, &source.id).map_err(OpError::io)
}
pub(super) fn start_control(
    home: &HomeLayout,
    gid: &str,
    record: &ActorLeave,
) -> Result<(), OpError> {
    let group = store(home)?.load(gid).map_err(OpError::io)?;
    if !group.running || group.state != GroupState::Active {
        return Ok(());
    }
    super::session::capture(home, gid, record)?;
    let source = workflow::source(&group, record).map_err(OpError::invalid)?;
    if !source.enabled {
        return Ok(());
    }
    if !super::super::actor_runtime::actor_is_running(&group, source) {
        if let Err(error) = super::super::actor_runtime::apply(
            home,
            &group,
            &record.actor_id,
            "actor.leave_control",
        ) {
            let _ = store(home)?.mutate(gid, |group| {
                if let Some(actor) = group
                    .actors
                    .iter_mut()
                    .find(|actor| actor.id == record.actor_id)
                {
                    actor.enabled = false;
                }
                Ok(())
            });
            return Err(error);
        }
    }
    if let Err(error) = super::session::verify(home, gid, record) {
        let _ = stop(home, &group, &record.actor_id);
        store(home)?
            .mutate(gid, |group| {
                if let Some(actor) = group
                    .actors
                    .iter_mut()
                    .find(|actor| actor.id == record.actor_id)
                {
                    actor.enabled = false;
                }
                Ok(())
            })
            .map_err(OpError::io)?;
        return Err(error);
    }
    Ok(())
}

fn notice(
    home: &HomeLayout,
    group: &GroupDoc,
    record: &ActorLeave,
    kind: &str,
    target: &str,
    key: &str,
    message: String,
) -> Result<Event, OpError> {
    let path = store(home)?
        .ledger_path(&group.group_id)
        .map_err(OpError::io)?;
    let client_id = if kind == "actor_leave_card" {
        format!("actor-leave:{}:card", record.id)
    } else {
        format!("actor-leave:{}:{key}:{}", record.id, record.notify_attempt)
    };
    let event_kind = if kind == "actor_leave_card" {
        "chat.message"
    } else {
        "system.notify"
    };
    let event = if let Some(event) =
        ledger::find_idempotent(&path, event_kind, "system", &client_id).map_err(OpError::io)?
    {
        event
    } else {
        let mut event = Event::new(event_kind, &group.group_id);
        event.by = "system".into();
        event.data=json!({"kind":kind,"leave_id":record.id,"target_actor_id":target,"client_id":client_id,"title":"成员离岗交接","message":message,"leave":record}).as_object().unwrap().clone();
        if kind == "actor_leave_card" {
            // 群聊卡片作为正式消息持久化，内部协调指令仍走私有通知。
            event.data.insert("to".into(), json!(["user"]));
            event.data.insert("text".into(), json!(message));
            event.data.insert("message_mode".into(), json!("send"));
            event.data.insert("sender_title".into(), json!("系统"));
        }
        ledger::append(&path, &event).map_err(OpError::io)?;
        event
    };
    if group.running
        && group.state == GroupState::Active
        && let Some(actor) = actors::find(group, target)
    {
        super::super::actor_delivery::dispatch_to(
            home,
            group,
            &event,
            std::slice::from_ref(actor),
            false,
        );
    }
    Ok(event)
}

pub(super) fn publish(home: &HomeLayout, gid: &str, record: &ActorLeave) -> Result<(), OpError> {
    let path = store(home)?.ledger_path(gid).map_err(OpError::io)?;
    let mut changed = Event::new("actor.leave", gid);
    changed.by = "system".into();
    changed.data = json!({"actor_id":record.actor_id,"leave_id":record.id,"status":record.status})
        .as_object()
        .unwrap()
        .clone();
    ledger::append(&path, &changed).map_err(OpError::io)?;
    ensure_notices(home, gid, record)
}

pub(super) fn ensure_notices(
    home: &HomeLayout,
    gid: &str,
    record: &ActorLeave,
) -> Result<(), OpError> {
    let group = store(home)?.load(gid).map_err(OpError::io)?;
    notice(
        home,
        &group,
        record,
        "actor_leave_card",
        "user",
        "card",
        format!("{} 的临时离岗与交接记录", record.actor_id),
    )?;
    if !record.last_error.is_empty() {
        notice(
            home,
            &group,
            record,
            "actor_leave_manager",
            &record.manager_id,
            &format!("blocked-{}", record.revision),
            format!(
                "交接需要处理：{}。请核对最新任务、接手人状态及记录，再调用 cccc_actor_leave(action=retry, leave_id) 或重新分配。",
                record.last_error
            ),
        )?;
    }
    let common = format!(
        "交接 ID：{}。先调用 cccc_actor_leave(action=get, leave_id) 核对最新状态。保留已有任务、约束和历史；不要重复已完成操作，不代替用户批准待确认事项。交接资料不得包含凭据。",
        record.id
    );
    match record.status {
        ActorLeaveStatus::Preparing => {
            notice(
                home,
                &group,
                record,
                "actor_leave_prepare",
                &record.actor_id,
                "prepare",
                format!(
                    "用户要求你临时离岗。普通任务已暂停，本轮仅整理交接。核对当前文件、未提交改动、未完成任务、阻塞与无法确认的操作；未登记的工作先通过 cccc_task 创建归属自己的 planned 任务，client_request_id 使用本离岗 ID 加冒号和稳定工作标识，避免重复创建。随后调用 cccc_actor_leave(action=summary, leave_id, summary) 提交真实总结；不要继续开发或执行原任务。{common}"
                ),
            )?;
            notice(
                home,
                &group,
                record,
                "actor_leave_manager",
                &record.manager_id,
                "manager-initial",
                format!(
                    "用户要求 {} 临时离岗，由你负责交接。你是当前负责协调的项目经理。等待或补充其交接总结，核对任务与未登记工作；新增交接任务使用 planned 状态、归属离岗成员，client_request_id 以本离岗 ID 加冒号为前缀；普通消息中的承诺不能代替接手确认。{common}",
                    record.actor_id
                ),
            )?;
        }
        ActorLeaveStatus::Assigning => {
            notice(
                home,
                &group,
                record,
                "actor_leave_manager",
                &record.manager_id,
                &format!("manager-summary-{}", record.updated_at),
                format!(
                    "请为 {} 安排离岗交接。核对最新任务和交接总结；如总结缺失，先用 action=summary 代为补充并标明依据。检查 handoff_to 指向离岗成员的其他任务，改派其交接对象并保留原负责人。使用 cccc_actor_leave(action=assign, leave_id, assignments=[{{task_id, actor_id}}]) 为每项工作指定在岗接手人；无未完成工作时传空列表，由你确认完成。{} {common}",
                    record.actor_id, record.summary
                ),
            )?;
        }
        ActorLeaveStatus::Accepting | ActorLeaveStatus::Finalizing => {
            for task in record.tasks.iter().filter(|task| {
                !task.to.is_empty()
                    && task.accepted_at.is_none()
                    && !task.transferred
                    && !task.closed
            }) {
                notice(
                    home,
                    &group,
                    record,
                    "actor_leave_accept",
                    &task.to,
                    &format!("accept-{}", task.assignment_id),
                    format!(
                        "项目经理拟将 {} 的任务 {}「{}」交由你接手。请先阅读交接总结并核对相关记录；此时尚未正式转移负责人，暂不修改相关工作。确认能够接手后调用 cccc_actor_leave(action=accept, leave_id, assignment_ids=[\"{}\"])。若有缺口，联系项目经理补充；不要口头确认后跳过系统回执。总结：{}。{common}",
                        record.actor_id,
                        task.task_id,
                        task.title,
                        task.assignment_id,
                        record.summary
                    ),
                )?;
            }
        }
        ActorLeaveStatus::Away => {
            for task in record
                .tasks
                .iter()
                .filter(|task| task.transferred && !task.closed && !task.to.is_empty())
            {
                notice(
                    home,
                    &group,
                    record,
                    "actor_leave_work",
                    &task.to,
                    &format!("work-{}", task.assignment_id),
                    format!(
                        "离岗交接已完成：原成员 {} 已停止，其任务 {}「{}」现在由你负责。请沿用交接总结和原任务约束，从未完成的位置继续，先核对实际结果，不重复已完成或结果未明的操作。总结：{}。{common}",
                        record.actor_id, task.task_id, task.title, record.summary
                    ),
                )?;
            }
        }
        ActorLeaveStatus::Returning => {
            notice(
                home,
                &group,
                record,
                "actor_leave_recall",
                &record.actor_id,
                "recall",
                format!(
                    "用户已召回你。本轮仅做返岗同步，不执行旧任务。读取本次交接清单、离岗后的群消息和最新任务板：已移交的任务继续由接手成员负责，不自动收回，也不要补跑离岗前的旧消息。核对最新进展后调用 cccc_actor_leave(action=ready, leave_id, summary) 说明同步结果，随后等待项目经理安排。{common}"
                ),
            )?;
            start_control(home, gid, record)?;
        }
        ActorLeaveStatus::Returned => {
            notice(
                home,
                &group,
                record,
                "actor_leave_returned",
                &record.manager_id,
                "returned",
                format!(
                    "{} 已完成返岗同步，可安排新工作；已移交的任务继续保留给现负责人。同步说明：{}。{common}",
                    record.actor_id, record.recall_summary
                ),
            )?;
        }
        ActorLeaveStatus::Cancelled => {
            if group.running && group.state == GroupState::Active {
                super::super::actor_runtime::apply(home, &group, &record.actor_id, "actor.start")?;
            }
            notice(
                home,
                &group,
                record,
                "actor_leave_cancelled",
                &record.actor_id,
                "cancelled",
                format!(
                    "用户已撤销本次离岗，请核对最新任务归属、当前结果和最近消息，只继续仍由你负责的工作，其他员工负责的任务不可重复执行。{common}"
                ),
            )?;
        }
    }
    Ok(())
}
