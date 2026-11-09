//! 团队任务的人工停止记录；任务台账与原生执行轮次并非一一对应。
//! 只接受服务端核实的运行状态，或负责人回执与项目经理确认，不直接中断成员的其他工作。

use crate::context::ContextDoc;
use niuma_contracts::utc_now;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use std::io;

pub const FIELD: &str = "execution_control";

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(default)]
pub struct TaskExecutionControl {
    pub state: String,
    pub request_id: String,
    pub client_id: String,
    pub owner_id: String,
    pub owner_generation: String,
    pub requested_by: String,
    pub requested_at: String,
    pub acknowledged_by: String,
    pub acknowledged_at: Option<String>,
    pub confirmed_by: String,
    pub confirmed_at: Option<String>,
    pub note: String,
    pub attempt: u64,
}

pub fn get(task: &Map<String, Value>) -> Option<TaskExecutionControl> {
    serde_json::from_value(task.get(FIELD)?.clone()).ok()
}
pub fn held(task: &Map<String, Value>) -> bool {
    get(task).is_some_and(|control| matches!(control.state.as_str(), "stopping" | "stopped"))
}
pub fn stopped(task: &Map<String, Value>) -> bool {
    get(task).is_some_and(|control| {
        control.state == "stopped"
            && !control.confirmed_by.is_empty()
            && control.confirmed_at.is_some()
    })
}
pub fn deletable(task: &Map<String, Value>) -> bool {
    match text(task, "status") {
        "" | "planned" => true,
        "active" => stopped(task),
        "archived" => matches!(text(task, "archived_from"), "" | "planned"),
        _ => false,
    }
}
pub fn apply(doc: &mut ContextDoc, op: &Map<String, Value>, by: &str) -> io::Result<()> {
    if by != "system" {
        return Err(io::Error::other("任务控制状态只能通过专用接口更新"));
    }
    let id = text(op, "task_id");
    let task = doc
        .tasks
        .iter_mut()
        .find(|task| text(task, "id") == id)
        .ok_or_else(|| io::Error::other("任务不存在"))?;
    let action = text(op, "action");
    if action == "resume" {
        task.remove(FIELD);
        task.insert("updated_at".into(), json!(utc_now()));
        return Ok(());
    }
    if text(task, "status") != "active" {
        return Err(io::Error::other("仅进行中任务需要停止确认"));
    }
    let runtime_stopped = op.get("runtime_stopped") == Some(&Value::Bool(true));
    let reporter = text(op, "reported_by");
    let note = text(op, "note").chars().take(4096).collect::<String>();
    let mut control = if action == "request_stop" {
        TaskExecutionControl {
            state: "stopping".into(),
            request_id: text(op, "request_id").into(),
            client_id: text(op, "client_id").into(),
            owner_id: text(task, "assignee").into(),
            owner_generation: text(op, "owner_generation").into(),
            requested_by: reporter.into(),
            requested_at: utc_now(),
            note: note.clone(),
            ..Default::default()
        }
    } else {
        let control = get(task).ok_or_else(|| io::Error::other("没有对应的停止请求"))?;
        if control.request_id != text(op, "request_id") {
            return Err(io::Error::other("停止请求已变化，请核对最新状态"));
        }
        if action != "retry_stop" && control.state == "stopped" {
            return Ok(());
        }
        control
    };
    match action {
        "request_stop" | "retry_stop" => {
            if action == "retry_stop" {
                control.attempt += 1;
                control.client_id = text(op, "client_id").into();
            }
            if runtime_stopped && !control.owner_id.is_empty() {
                control.state = "stopped".into();
                control.confirmed_by = "system".into();
                control.confirmed_at = Some(utc_now());
                control.note = "负责人当前未运行，已停止任务并保留后续执行闸门".into();
            }
        }
        "ack_stop" => {
            if reporter != control.owner_id
                || text(task, "assignee") != control.owner_id
                || text(op, "owner_generation") != control.owner_generation
            {
                return Err(io::Error::other("须由原负责人确认停止当前请求"));
            }
            control.acknowledged_by = reporter.into();
            control.acknowledged_at = Some(utc_now());
            control.note = note;
        }
        "confirm_stop" => {
            if !runtime_stopped && !control.owner_id.is_empty() && control.acknowledged_at.is_none()
            {
                return Err(io::Error::other("请先取得负责人的系统停止回执"));
            }
            if control.owner_id.is_empty() && note.trim().is_empty() {
                return Err(io::Error::other("无负责人任务须说明核实依据"));
            }
            control.state = "stopped".into();
            control.confirmed_by = reporter.into();
            control.confirmed_at = Some(utc_now());
            control.note = note;
        }
        _ => return Err(io::Error::other("不支持的任务控制动作")),
    }
    if control.request_id.is_empty() {
        return Err(io::Error::other("缺少停止请求标识"));
    }
    task.insert(FIELD.into(), json!(control));
    task.insert("updated_at".into(), json!(utc_now()));
    Ok(())
}

fn text<'a>(object: &'a Map<String, Value>, key: &str) -> &'a str {
    object.get(key).and_then(Value::as_str).unwrap_or_default()
}
