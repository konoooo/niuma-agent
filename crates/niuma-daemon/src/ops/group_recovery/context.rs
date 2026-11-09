use niuma_contracts::Actor;
use niuma_core::{GroupDoc, GroupStore, HomeLayout, context::ContextStore, ledger};
use serde_json::Value;
use std::io::{Read, Seek, SeekFrom};

pub(super) struct Snapshot {
    pub body: String,
    pub sources: Vec<String>,
    pub has_history: bool,
}
fn clipped(value: &str, limit: usize) -> String {
    let chars = value.chars().collect::<Vec<_>>();
    chars[chars.len().saturating_sub(limit)..].iter().collect()
}

pub(super) fn capture(home: &HomeLayout, group: &GroupDoc, actor: &Actor) -> Snapshot {
    let mut sections = Vec::new();
    let mut sources = Vec::new();
    let mut has_history = false;
    if let Ok(doc) = ContextStore::new(home.clone()).and_then(|store| store.load(&group.group_id)) {
        let tasks = doc
            .tasks
            .iter()
            .filter(|task| task.get("assignee").and_then(Value::as_str) == Some(actor.id.as_str()))
            .take(40)
            .collect::<Vec<_>>();
        if !tasks.is_empty() {
            sources.push("tasks".into());
            sections.push(format!(
                "【当前归属你的任务，包含完成记录以避免重做】\n{}",
                clipped(&serde_json::to_string(&tasks).unwrap_or_default(), 5000)
            ));
        }
        if let Some(brief) = doc.coordination.get("brief") {
            sources.push("brief".into());
            sections.push(format!(
                "【团队目标与约束】\n{}",
                clipped(&brief.to_string(), 2500)
            ));
        }
        if let Some(state) = doc.agent_states.get(&actor.id) {
            sources.push("member_state".into());
            sections.push(format!(
                "【成员上次登记的工作状态】\n{}",
                clipped(&serde_json::to_string(state).unwrap_or_default(), 2000)
            ));
        }
    }
    if let Ok(store) = GroupStore::new(home.clone()) {
        if let Ok(path) = store.ledger_path(&group.group_id)
            && let Ok((events, _)) = ledger::tail_filtered(&path, 80, Some("chat"))
        {
            let messages =
                events
                    .iter()
                    .filter(|event| {
                        event.ts >= actor.created_at
                            && (event.by == actor.id
                                || event.data.get("to").and_then(Value::as_array).is_some_and(
                                    |to| {
                                        to.iter().any(|value| {
                                            value.as_str().is_some_and(|id| {
                                                id == actor.id
                                                    || id == "@all"
                                                    || (id == "@foreman"
                                                        && niuma_core::actors::effective_role(
                                                            group, &actor.id,
                                                        ) == Some(
                                                            niuma_contracts::ActorRole::Foreman,
                                                        ))
                                                    || (id == "@peers"
                                                        && niuma_core::actors::effective_role(
                                                            group, &actor.id,
                                                        ) != Some(
                                                            niuma_contracts::ActorRole::Foreman,
                                                        ))
                                            })
                                        })
                                    },
                                ))
                    })
                    .filter_map(|event| {
                        event.data.get("text").and_then(Value::as_str).map(|text| {
                            if event.by == actor.id {
                                has_history = true;
                            }
                            format!("{} {}: {}", event.ts, event.by, clipped(text, 1800))
                        })
                    })
                    .collect::<Vec<_>>();
            if !messages.is_empty() {
                sources.push("messages".into());
                sections.push(format!(
                    "【最近与本成员相关的群聊记录，仅作历史参考】\n{}",
                    clipped(&messages.join("\n"), 5000)
                ));
            }
        }
        if let Ok(state) = store.state_dir(&group.group_id)
            && let Ok(mut file) = std::fs::File::open(state.join("headless/events.jsonl"))
        {
            let length = file.metadata().map(|metadata| metadata.len()).unwrap_or(0);
            let start = length.saturating_sub(256 * 1024);
            let _ = file.seek(SeekFrom::Start(start));
            let mut bytes = Vec::new();
            if file.take(256 * 1024).read_to_end(&mut bytes).is_ok() {
                let text = String::from_utf8_lossy(&bytes);
                let mut snippets = String::new();
                for line in text.lines() {
                    let Ok(event) = serde_json::from_str::<Value>(line) else {
                        continue;
                    };
                    if event["actor_id"] != actor.id
                        || event["ts"].as_str().unwrap_or_default() < actor.created_at.as_str()
                    {
                        continue;
                    }
                    match event["type"].as_str() {
                        Some("headless.message.delta") => {
                            if let Some(text) = event["data"]["delta"].as_str() {
                                snippets.push_str(text);
                            }
                        }
                        Some("headless.activity.completed") => {
                            if let Some(text) = event["data"]["summary"].as_str() {
                                snippets.push_str(&format!("\n已记录活动：{text}\n"));
                            }
                        }
                        _ => {}
                    }
                }
                if !snippets.trim().is_empty() {
                    has_history = true;
                    sources.push("member_output".into());
                    sections.push(format!(
                        "【旧会话可读取的公开输出节选，非完整会话】\n{}",
                        clipped(&snippets, 6000)
                    ));
                }
            }
        }
    }
    let terminal_belongs_to_member =
        super::super::runtime_session::snapshot(home, &group.group_id, &actor.id)
            .ok()
            .flatten()
            .is_some_and(|receipt| {
                receipt
                    .get("last_seen_at")
                    .and_then(Value::as_str)
                    .is_some_and(|seen| seen >= actor.created_at.as_str())
            });
    if terminal_belongs_to_member
        && let Ok(history) =
            super::super::terminal_history_source::retained(home, &group.group_id, &actor.id, 6000)
        && !history.data.trim().is_empty()
    {
        has_history = true;
        sources.push("terminal".into());
        sections.push(format!(
            "【旧终端输出节选，结果仍需核对】\n{}",
            clipped(
                &super::super::terminal_text::render(&history.data, false),
                8000
            )
        ));
    }
    let body = if sections.is_empty() {
        "【上下文恢复说明】未找到可读取的历史内容。不要假设已恢复旧会话，请先查询当前任务与群消息，向项目经理确认下一步。".into()
    } else {
        format!(
            "【新会话恢复摘要】以下是可读取记录的有限节选，不能视为完整原生会话。以当前项目目录、最新任务和实际文件结果为准，先核对再续做。\n\n{}",
            sections.join("\n\n")
        )
    };
    Snapshot {
        body,
        sources,
        has_history,
    }
}
