use super::*;

pub(super) fn finalize(
    home: &HomeLayout,
    gid: &str,
    record: &ActorLeave,
) -> Result<ActorLeave, OpError> {
    let group = store(home)?.load(gid).map_err(OpError::io)?;
    workflow::source(&group, record).map_err(OpError::invalid)?;
    let contexts = ContextStore::new(home.clone()).map_err(OpError::io)?;
    let document = contexts.load(gid).map_err(OpError::io)?;
    let source_tasks = task_snapshot(home, gid, &record.actor_id)?;
    if source_tasks.iter().any(|task| {
        !record
            .tasks
            .iter()
            .any(|known| known.task_id == task.task_id)
    }) {
        return Err(OpError::new(
            "handoff_changed",
            "出现新的待交接任务，请项目经理重新分配",
        ));
    }
    if document.tasks.iter().any(|task| {
        task.get("handoff_to").and_then(Value::as_str) == Some(record.actor_id.as_str())
            && !matches!(
                task.get("status").and_then(Value::as_str),
                Some("done" | "archived")
            )
    }) {
        return Err(OpError::new(
            "incoming_handoff_pending",
            "请项目经理先处理发给该成员的待接手交接",
        ));
    }
    let mut ops = Vec::new();
    let mut completing = record.clone();
    for item in &mut completing.tasks {
        let Some(task) = document
            .tasks
            .iter()
            .find(|task| task.get("id").and_then(Value::as_str) == Some(item.task_id.as_str()))
        else {
            item.closed = true;
            continue;
        };
        if matches!(
            task.get("status").and_then(Value::as_str),
            Some("done" | "archived")
        ) {
            item.closed = true;
            continue;
        }
        let recipient = actors::find(&group, &item.to)
            .filter(|actor| {
                workflow::available(actor)
                    && actors::generation_identity(actor) == item.to_generation
            })
            .ok_or_else(|| {
                OpError::new(
                    "receiver_unavailable",
                    "接手人已离岗或身份改变，请项目经理重新分配",
                )
            })?;
        if item.accepted_at.is_none() {
            return Err(OpError::new("acceptance_required", "接手员工尚未确认"));
        }
        let owner = task
            .get("assignee")
            .and_then(Value::as_str)
            .unwrap_or_default();
        if owner == recipient.id {
            continue;
        }
        if task.get("rev").and_then(Value::as_u64).unwrap_or(0) != item.revision {
            return Err(OpError::new(
                "handoff_changed",
                "交接任务已变化，请项目经理刷新分配并由接手人重新确认",
            ));
        }
        if owner != record.actor_id {
            return Err(OpError::new(
                "task_owner_changed",
                "任务负责人已变化，请经理核对",
            ));
        }
        ops.push(json!({"op":"task.update","task_id":item.task_id,"if_task_rev":task.get("rev").and_then(Value::as_u64).unwrap_or(0),"assignee":recipient.id,"handoff_to":null}).as_object().unwrap().clone());
        ops.push(json!({"op":"coordination.note.add","kind":"handoff","task_id":item.task_id,"summary":format!("离岗交接 {}：{} → {}；接手确认 {}",record.id,record.actor_id,recipient.id,item.assignment_id)}).as_object().unwrap().clone());
    }
    coordination::stop(home, &group, &record.actor_id)?;
    mutate(home, gid, |group| {
        let mut current = completing;
        current.status = ActorLeaveStatus::Finalizing;
        workflow::save(group, current)
    })?;
    if !ops.is_empty() {
        let version = contexts.version(&document).map_err(OpError::io)?;
        let result = contexts
            .sync(gid, &ops, Some(&version), "system", false)
            .map_err(OpError::io)?;
        let mut event = niuma_contracts::Event::new("context.sync", gid);
        event.by = "system".into();
        event.data = json!({"version":result.version,"changes":result.changes})
            .as_object()
            .unwrap()
            .clone();
        niuma_core::ledger::append(&store(home)?.ledger_path(gid).map_err(OpError::io)?, &event)
            .map_err(OpError::io)?;
    }
    mutate(home, gid, |group| {
        workflow::mark_stopped(group, &record.id, true)
    })
}
