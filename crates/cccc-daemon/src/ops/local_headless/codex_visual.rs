use serde_json::{Map, Value, json};

pub(super) fn public_commentary(message: &Value) -> Option<&str> {
    if message.get("method")?.as_str()? != "item/completed" {
        return None;
    }
    let item = message.get("params")?.get("item")?;
    if item.get("type")?.as_str()? != "agentMessage" || item.get("phase")?.as_str()? != "commentary"
    {
        return None;
    }
    item.get("text")?
        .as_str()
        .filter(|text| !text.trim().is_empty())
}

pub(super) fn project(message: &Value) -> Option<Map<String, Value>> {
    let phase = match message.get("method")?.as_str()? {
        "item/started" => "started",
        "item/completed" => "completed",
        _ => return None,
    };
    let params = message.get("params")?;
    let item = params.get("item")?;
    let turn_id = params.get("turnId")?.as_str()?.trim();
    let item_id = item.get("id")?.as_str()?.trim();
    if turn_id.is_empty() || item_id.is_empty() || turn_id.len() > 200 || item_id.len() > 200 {
        return None;
    }
    let (kind, label) = match item.get("type")?.as_str()? {
        "commandExecution" => (
            "command",
            command_label(item["command"].as_str().unwrap_or("")),
        ),
        "fileChange" => ("file_change", file_label(item)),
        "webSearch" => ("search", String::new()),
        "mcpToolCall" | "dynamicToolCall" => ("tool", tool_label(item)),
        "reasoning" => ("thinking", String::new()),
        "plan" => ("planning", String::new()),
        "agentMessage" => ("reply", String::new()),
        "enteredReviewMode" | "exitedReviewMode" => ("review", String::new()),
        _ => return None,
    };
    let mut event = Map::from_iter([
        ("activity_id".into(), json!(format!("{turn_id}:{item_id}"))),
        ("turn_id".into(), json!(turn_id)),
        ("phase".into(), json!(phase)),
        ("kind".into(), json!(kind)),
        ("label".into(), json!(label)),
    ]);
    if let Some(status @ ("completed" | "failed" | "declined")) = item["status"].as_str() {
        event.insert("outcome".into(), json!(status));
    }
    Some(event)
}

fn command_label(command: &str) -> String {
    let mut words = command.split_whitespace();
    let executable = words.next().unwrap_or("").rsplit('/').next().unwrap_or("");
    let second = words.next().unwrap_or("");
    match (executable, second) {
        ("npm" | "pnpm" | "yarn" | "cargo" | "go" | "mvn", "test") => {
            format!("{executable} test")
        }
        ("pytest" | "vitest" | "jest", _) => executable.to_owned(),
        (
            "npm" | "pnpm" | "yarn" | "cargo" | "git" | "node" | "python" | "python3" | "curl"
            | "rg",
            _,
        ) => executable.to_owned(),
        _ => String::new(),
    }
}

fn file_label(item: &Value) -> String {
    item["changes"]
        .as_array()
        .and_then(|changes| changes.first())
        .and_then(|change| change["path"].as_str())
        .and_then(|path| path.rsplit(['/', '\\']).next())
        .unwrap_or("")
        .chars()
        .filter(|character| !character.is_control())
        .take(80)
        .collect()
}

fn tool_label(item: &Value) -> String {
    item["tool"]
        .as_str()
        .unwrap_or("")
        .chars()
        .filter(|character| character.is_alphanumeric() || matches!(character, '-' | '_' | '.'))
        .take(80)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn codex_visual_projects_command_lifecycle_without_leaking_arguments() {
        let message = json!({"method":"item/started","params":{
            "turnId":"turn-1","item":{"id":"item-1","type":"commandExecution",
            "command":"curl https://example.test/?token=secret"}
        }});
        let event = project(&message).expect("命令开始事件");
        assert_eq!(event["activity_id"], "turn-1:item-1");
        assert_eq!(event["phase"], "started");
        assert_eq!(event["kind"], "command");
        assert!(!Value::Object(event).to_string().contains("secret"));
    }

    #[test]
    fn codex_visual_projects_file_completion_and_ignores_unrelated_events() {
        let message = json!({"method":"item/completed","params":{
            "turnId":"turn-1","item":{"id":"item-2","type":"fileChange",
            "status":"completed","changes":[{"path":"/repo/src/app.ts","diff":"private"}]}
        }});
        let event = project(&message).expect("文件变更事件");
        assert_eq!(event["phase"], "completed");
        assert_eq!(event["kind"], "file_change");
        assert_eq!(event["label"], "app.ts");
        assert!(!Value::Object(event).to_string().contains("private"));
        assert!(project(&json!({"method":"item/agentMessage/delta"})).is_none());
    }
}
