use niuma_contracts::{Actor, DaemonRequest, GroupState};
use niuma_core::{GroupStore, HomeLayout, actors};
use serde_json::{Value, json};

struct Fixture {
    temp: tempfile::TempDir,
    home: HomeLayout,
    group_id: String,
}

impl Fixture {
    fn new() -> Self {
        let temp = tempfile::tempdir().unwrap();
        let home = HomeLayout::from_path(temp.path().join("home")).unwrap();
        let store = GroupStore::new(home.clone()).unwrap();
        let mut group = store.create("需求流程测试", "").unwrap();
        group.state = GroupState::Paused;
        for id in ["manager", "tech", "dev"] {
            actors::add(&mut group, Actor::new(id)).unwrap();
        }
        store.save(&group).unwrap();
        Self {
            temp,
            home,
            group_id: group.group_id,
        }
    }

    fn call(&self, op: &str, by: &str, args: Value) -> niuma_contracts::DaemonResponse {
        let mut args = args.as_object().unwrap().clone();
        args.insert("group_id".into(), json!(self.group_id));
        args.insert("by".into(), json!(by));
        crate::handle_request(
            &self.home,
            &DaemonRequest {
                v: 1,
                op: op.into(),
                args,
            },
        )
    }

    fn ok(&self, op: &str, by: &str, args: Value) -> Value {
        let result = self.call(op, by, args);
        assert!(result.ok, "操作 {op} 失败：{:?}", result.error);
        json!(result.result)
    }

    fn requirement(&self, by: &str, args: Value) -> Value {
        self.ok("requirement", by, args)
    }

    fn plan(&self, id: &Value) {
        self.requirement("manager", json!({"action":"plan","requirement_id":id,
            "title":"订单导出","description":"支持导出已筛选的订单",
            "acceptance_criteria":"仅导出匹配筛选条件的记录","technical_owner":"tech","priority":"high"}));
    }
}

#[test]
fn requirement_chat_breakdown_assignment_and_acceptance_share_the_task_board() {
    let f = Fixture::new();
    let args = json!({"action":"issue","title":"订单导出","description":"支持导出已筛选的订单","client_id":"issue-one"});
    let issued = f.requirement("user", args.clone());
    let stored = GroupStore::new(f.home.clone())
        .unwrap()
        .load(&f.group_id)
        .unwrap();
    assert_eq!(stored.state, GroupState::Paused);
    assert!(!stored.running);
    let id = &issued["requirement"]["id"];
    assert_eq!(issued["event"]["data"]["to"], json!(["manager"]));
    assert_eq!(
        issued["requirement"]["source"]["event_id"],
        issued["event"]["id"]
    );
    assert_eq!(f.requirement("user", args)["requirement"]["id"], *id);
    assert_eq!(
        f.requirement("dev", json!({"action":"list"}))["requirements"]
            .as_array()
            .unwrap()
            .len(),
        1
    );
    f.plan(id);
    let split = json!({"action":"breakdown","requirement_id":id,"client_id":"split-one","tasks":[
        {"title":"实现筛选导出","outcome":"输出 CSV","suggested_assignee":"dev"},
        {"title":"验证导出范围","outcome":"提供验收结果","after":[1]}
    ]});
    assert!(!f.call("requirement", "dev", split.clone()).ok);
    let planned = f.requirement("tech", split.clone());
    assert_eq!(planned["tasks"].as_array().unwrap().len(), 2);
    assert_eq!(
        f.requirement("tech", split)["tasks"]
            .as_array()
            .unwrap()
            .len(),
        2
    );
    assert_eq!(
        planned["tasks"][1]["blocked_by"],
        json!([planned["tasks"][0]["id"]])
    );
    assert!(planned["tasks"][0]["assignee"].is_null());
    assert!(
        !f.call(
            "context_sync",
            "dev",
            json!({"ops":[{"op":"task.create","title":"越权关联","requirement_id":id}]})
        )
        .ok
    );
    let accept = json!({"action":"accept","requirement_id":id,"note":"已核对筛选结果"});
    assert!(!f.call("requirement", "manager", accept.clone()).ok);
    for task in planned["tasks"].as_array().unwrap() {
        f.ok(
            "context_sync",
            "manager",
            json!({"ops":[{"op":"task.update","task_id":task["id"],"assignee":"dev"}]}),
        );
        f.ok(
            "context_sync",
            "dev",
            json!({"ops":[{"op":"task.move","task_id":task["id"],"status":"done"}]}),
        );
    }
    let waiting = f.requirement("dev", json!({"action":"get","requirement_id":id}));
    assert_eq!(waiting["requirement"]["status"], "awaiting_acceptance");
    let events = f.ok(
        "ledger_tail",
        "user",
        json!({"kind":"chat.message","limit":40}),
    );
    let events = events["events"].as_array().unwrap();
    for recipient in ["tech", "dev", "manager"] {
        assert!(events.iter().any(|event| event["by"] == "system"
            && event["data"]["to"] == json!([recipient])
            && event["data"]["message_mode"] == "mail"));
    }
    assert!(!f.call("requirement", "dev", accept.clone()).ok);
    assert_eq!(
        f.requirement("manager", accept)["requirement"]["status"],
        "done"
    );
}

#[test]
fn requirement_obsidian_import_reads_only_the_selected_section_and_deduplicates() {
    let f = Fixture::new();
    let vault = f.temp.path().join("测试笔记");
    std::fs::create_dir_all(vault.join(".obsidian")).unwrap();
    let note = vault.join("产品想法.md");
    let original = "# 个人记录\n不属于本需求的文字\n\n## 订单导出\n仅导出已筛选订单。\n```md\n## 示例中的标题\n```\n### 验收\n核对记录数。\n\n另一个需求\n--------\n其他内容。\n";
    std::fs::write(&note, original).unwrap();
    let preview_args = json!({"action":"preview_source","note_path":note,"heading":"订单导出"});
    assert!(!f.call("requirement", "dev", preview_args.clone()).ok);
    let preview = f.requirement("user", preview_args);
    assert!(preview["text"].as_str().unwrap().contains("核对记录数"));
    assert!(!preview["text"].as_str().unwrap().contains("其他内容"));
    let import = json!({"action":"import_source","note_path":note,"heading":"订单导出","source_version":preview["source_version"]});
    let imported = f.requirement("user", import.clone());
    let id = &imported["requirement"]["id"];
    assert_eq!(
        f.requirement("user", import.clone())["requirement"]["id"],
        *id
    );
    assert_eq!(std::fs::read_to_string(&note).unwrap(), original);
    f.plan(id);
    assert!(
        f.requirement("tech", json!({"action":"read_source","requirement_id":id}))["text"]
            .as_str()
            .unwrap()
            .contains("核对记录数")
    );
    assert!(
        !f.call(
            "requirement",
            "dev",
            json!({"action":"read_source","requirement_id":id})
        )
        .ok
    );
    std::fs::write(&note, original.replace("核对记录数", "核对记录数及字段")).unwrap();
    assert!(!f.call("requirement", "user", import).ok);
    let latest = f.requirement(
        "manager",
        json!({"action":"read_source","requirement_id":id}),
    );
    assert_eq!(latest["changed"], true);
    let revised = f.requirement("manager", json!({"action":"refresh_source","requirement_id":id,"source_version":latest["source_version"]}));
    assert_eq!(revised["requirement"]["id"], *id);
    assert_eq!(revised["requirement"]["status"], "intake");
}

#[test]
fn requirement_replayed_breakdown_does_not_recreate_a_deleted_task() {
    let f = Fixture::new();
    let issued = f.requirement("user", json!({"action":"issue","title":"验证重试","description":"核对拆解回执","client_id":"issue-retry"}));
    let id = &issued["requirement"]["id"];
    f.plan(id);
    let split = json!({"action":"breakdown","requirement_id":id,"client_id":"split-retry","tasks":[{"title":"待删除的任务"}]});
    let created = f.requirement("tech", split.clone());
    let task_id = &created["tasks"][0]["id"];
    let preview = f.ok(
        "task_control",
        "user",
        json!({"action":"get","task_id":task_id}),
    );
    f.ok(
        "task_control",
        "user",
        json!({"action":"delete","task_id":task_id,"delete_token":preview["delete_token"]}),
    );
    assert_eq!(f.requirement("tech", split)["tasks"], json!([]));
}

#[test]
#[cfg(unix)]
fn requirement_registered_note_cannot_be_redirected_to_another_note() {
    let f = Fixture::new();
    let vault = f.temp.path().join("vault");
    std::fs::create_dir_all(vault.join(".obsidian")).unwrap();
    let note = vault.join("selected.md");
    let other = vault.join("private.md");
    std::fs::write(&note, "指定内容").unwrap();
    std::fs::write(&other, "其他笔记").unwrap();
    let preview = f.requirement("user", json!({"action":"preview_source","note_path":note}));
    let imported = f.requirement("user", json!({"action":"import_source","note_path":note,"source_version":preview["source_version"]}));
    std::fs::remove_file(&note).unwrap();
    std::os::unix::fs::symlink(&other, &note).unwrap();
    assert!(
        !f.call(
            "requirement",
            "manager",
            json!({"action":"read_source","requirement_id":imported["requirement"]["id"]})
        )
        .ok
    );
}
