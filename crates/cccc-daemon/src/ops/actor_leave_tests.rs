use cccc_contracts::{Actor, DaemonRequest, GroupState};
use cccc_core::{GroupStore, HomeLayout, actors, context::ContextStore};
use serde_json::{Value, json};

struct Fixture {
    _temp: tempfile::TempDir,
    home: HomeLayout,
    group: String,
}

impl Fixture {
    fn new() -> Self {
        let temp = tempfile::tempdir().unwrap();
        let home = HomeLayout::from_path(temp.path().join("home")).unwrap();
        let store = GroupStore::new(home.clone()).unwrap();
        let mut group = store.create("离岗交接测试", "").unwrap();
        group.state = GroupState::Paused;
        for id in ["manager", "dev", "receiver", "other"] {
            actors::add(&mut group, Actor::new(id)).unwrap();
        }
        store.save(&group).unwrap();
        ContextStore::new(home.clone()).unwrap().sync(&group.group_id, &[json!({"op":"task.create","title":"未完成的开发工作","assignee":"dev","status":"active"}).as_object().unwrap().clone()], None, "user", false).unwrap();
        Self {
            _temp: temp,
            home,
            group: group.group_id,
        }
    }
    fn call(&self, by: &str, args: Value) -> cccc_contracts::DaemonResponse {
        let mut args = args.as_object().unwrap().clone();
        args.insert("group_id".into(), json!(self.group));
        args.insert("by".into(), json!(by));
        crate::handle_request(
            &self.home,
            &DaemonRequest {
                v: 1,
                op: "actor_leave".into(),
                args,
            },
        )
    }
    fn ok(&self, by: &str, args: Value) -> Value {
        let response = self.call(by, args);
        assert!(response.ok, "离岗操作失败：{:?}", response.error);
        json!(response.result)["leave"].clone()
    }
    fn member(&self, id: &str) -> Value {
        let group = GroupStore::new(self.home.clone())
            .unwrap()
            .load(&self.group)
            .unwrap();
        serde_json::to_value(actors::find(&group, id).unwrap()).unwrap()
    }
    fn owner(&self) -> String {
        ContextStore::new(self.home.clone())
            .unwrap()
            .load(&self.group)
            .unwrap()
            .tasks[0]["assignee"]
            .as_str()
            .unwrap()
            .into()
    }
}

#[test]
fn actor_leave_transfers_only_after_receiver_ack_and_recall_keeps_new_owner() {
    let f = Fixture::new();
    let before = f.member("dev");
    let requested = f.ok("user", json!({"action":"request","actor_id":"dev"}));
    let id = requested["id"].as_str().unwrap();
    assert_eq!(f.member("dev")["availability"], "handoff");
    assert_eq!(f.owner(), "dev");
    f.ok(
        "dev",
        json!({"action":"summary","leave_id":id,"summary":"已有改动已核对，仍需完成验收。"}),
    );
    let assigned=f.ok("manager",json!({"action":"assign","leave_id":id,"assignments":[{"task_id":"T001","actor_id":"receiver"}]}));
    assert_eq!(f.owner(), "dev", "口头分配不能直接改变任务负责人");
    let assignment = assigned["tasks"][0]["assignment_id"].as_str().unwrap();
    let completed = f.ok(
        "receiver",
        json!({"action":"accept","leave_id":id,"assignment_ids":[assignment]}),
    );
    assert_eq!(completed["status"], "away");
    assert_eq!(f.owner(), "receiver");
    let away = f.member("dev");
    assert_eq!(away["availability"], "away");
    assert_eq!(away["enabled"], false);
    for key in ["id", "generation", "command", "model_config"] {
        assert_eq!(away[key], before[key]);
    }
    f.ok("user", json!({"action":"recall","leave_id":id}));
    assert_eq!(f.member("dev")["availability"], "returning");
    f.ok("dev", json!({"action":"ready","leave_id":id}));
    assert!(
        f.member("dev")["availability"].is_null() || f.member("dev")["availability"] == "available"
    );
    assert_eq!(f.owner(), "receiver", "召回不会自动收回已移交的任务");
}

#[test]
fn actor_leave_requires_manager_assignment_and_the_named_receiver() {
    let f = Fixture::new();
    let requested = f.ok("user", json!({"action":"request","actor_id":"dev"}));
    let id = requested["id"].as_str().unwrap();
    f.ok(
        "dev",
        json!({"action":"summary","leave_id":id,"summary":"待验收"}),
    );
    let denied=f.call("other",json!({"action":"assign","leave_id":id,"assignments":[{"task_id":"T001","actor_id":"receiver"}]}));
    assert!(!denied.ok);
    assert_eq!(f.owner(), "dev");
    let planned=f.ok("manager",json!({"action":"assign","leave_id":id,"assignments":[{"task_id":"T001","actor_id":"receiver"}]}));
    let denied=f.call("other",json!({"action":"accept","leave_id":id,"assignment_ids":[planned["tasks"][0]["assignment_id"]]}));
    assert!(!denied.ok);
    assert_eq!(f.owner(), "dev");
}

#[test]
fn actor_leave_immediate_is_stopped_but_not_falsely_reported_as_handed_over() {
    let f = Fixture::new();
    let leave = f.ok(
        "user",
        json!({"action":"request","actor_id":"dev","immediate":true}),
    );
    assert_eq!(f.member("dev")["availability"], "away");
    assert_eq!(f.owner(), "dev");
    assert_ne!(leave["status"], "away", "停机和完成交接是两个独立事实");
    let recalled = f.call("user", json!({"action":"recall","leave_id":leave["id"]}));
    assert!(!recalled.ok);
}

#[test]
fn actor_leave_manager_requires_a_user_selected_deputy() {
    let f = Fixture::new();
    let denied = f.call("user", json!({"action":"request","actor_id":"manager"}));
    assert!(!denied.ok);
    let requested = f.ok(
        "user",
        json!({"action":"request","actor_id":"manager","deputy_id":"other"}),
    );
    assert_eq!(requested["manager_id"], "other");
    let group = GroupStore::new(f.home.clone())
        .unwrap()
        .load(&f.group)
        .unwrap();
    assert_eq!(
        actors::effective_role(&group, "other"),
        Some(cccc_contracts::ActorRole::Foreman)
    );
}

#[test]
fn actor_leave_blocks_plain_start_task_assignment_and_explicit_messages() {
    let f = Fixture::new();
    f.ok(
        "user",
        json!({"action":"request","actor_id":"dev","immediate":true}),
    );
    let request = |op: &str, args: Value| {
        let mut args = args.as_object().unwrap().clone();
        args.insert("group_id".into(), json!(f.group));
        crate::handle_request(
            &f.home,
            &DaemonRequest {
                v: 1,
                op: op.into(),
                args,
            },
        )
    };
    let started = request("actor_start", json!({"actor_id":"dev","by":"user"}));
    assert_eq!(
        started.error.as_ref().map(|error| error.code.as_str()),
        Some("actor_on_leave")
    );
    let assigned = request(
        "context_sync",
        json!({"by":"manager","ops":[{"op":"task.create","title":"新工作","assignee":"dev"}]}),
    );
    assert!(!assigned.ok, "项目经理也不能把新任务派给离岗成员");
    let sent = request(
        "send",
        json!({"by":"user","to":["dev"],"text":"新任务","message_mode":"send"}),
    );
    assert!(!sent.ok, "直接消息不能暗中唤醒离岗成员");
}

#[test]
fn actor_leave_delivery_projection_holds_old_work_and_keeps_control_notice() {
    let f = Fixture::new();
    let mut event = cccc_contracts::Event::new("chat.message", &f.group);
    event.by = "user".into();
    event.data = json!({"to":["dev"],"text":"离岗前的工作","message_mode":"send"})
        .as_object()
        .unwrap()
        .clone();
    let store = GroupStore::new(f.home.clone()).unwrap();
    cccc_core::ledger::append(&store.ledger_path(&f.group).unwrap(), &event).unwrap();
    f.ok("user", json!({"action":"request","actor_id":"dev"}));
    let group = store.load(&f.group).unwrap();
    let pending = cccc_core::inbox::pending_deliveries(&f.home, &group, "dev", 100).unwrap();
    assert!(!pending.iter().any(|source| source.id == event.id));
    assert!(pending.iter().any(
        |source| source.data.get("kind").and_then(Value::as_str) == Some("actor_leave_prepare")
    ));
}

#[test]
fn actor_leave_mixed_delivery_batch_keeps_control_when_old_work_is_withdrawn() {
    let f = Fixture::new();
    f.ok("user", json!({"action":"request","actor_id":"dev"}));
    let store = GroupStore::new(f.home.clone()).unwrap();
    let group = store
        .mutate(&f.group, |group| {
            group.running = true;
            group.state = GroupState::Active;
            Ok(group.clone())
        })
        .unwrap();
    let actor = actors::find(&group, "dev").unwrap().clone();
    let control = cccc_core::ledger::read_all(&store.ledger_path(&f.group).unwrap())
        .unwrap()
        .into_iter()
        .find(|event| event.data.get("kind").and_then(Value::as_str) == Some("actor_leave_prepare"))
        .unwrap();
    let mut old = cccc_contracts::Event::new("chat.message", &f.group);
    old.data = json!({"to":["dev"],"text":"不得继续的旧工作"})
        .as_object()
        .unwrap()
        .clone();
    let transport = super::super::actor_delivery::owner_transport(&f.home, &group, &actor, None);
    let mut jobs = [old, control.clone()]
        .into_iter()
        .map(|event| super::super::actor_delivery::DeliveryJob {
            home: f.home.clone(),
            group: group.clone(),
            actor: actor.clone(),
            event,
            claimed: false,
            transport,
        })
        .collect::<Vec<_>>();
    let _ = super::super::actor_delivery_worker::process_batch(
        &mut jobs,
        &mut String::new(),
        &std::sync::atomic::AtomicBool::new(false),
    );
    assert_eq!(jobs.len(), 1, "撤回旧工作时不能一起丢弃交接控制指令");
    assert_eq!(jobs[0].event.id, control.id);
}

#[test]
fn actor_leave_changed_summary_requires_new_acceptance() {
    let f = Fixture::new();
    let leave = f.ok("user", json!({"action":"request","actor_id":"dev"}));
    let id = leave["id"].as_str().unwrap();
    f.ok(
        "dev",
        json!({"action":"summary","leave_id":id,"summary":"第一版交接"}),
    );
    let assigned=f.ok("manager",json!({"action":"assign","leave_id":id,"assignments":[{"task_id":"T001","actor_id":"receiver"}]}));
    let old = assigned["tasks"][0]["assignment_id"].clone();
    f.ok(
        "dev",
        json!({"action":"summary","leave_id":id,"summary":"补充了尚未验证的修改"}),
    );
    let assigned=f.ok("manager",json!({"action":"assign","leave_id":id,"assignments":[{"task_id":"T001","actor_id":"receiver"}]}));
    assert_ne!(assigned["tasks"][0]["assignment_id"], old);
    assert!(
        !f.call(
            "receiver",
            json!({"action":"accept","leave_id":id,"assignment_ids":[old]})
        )
        .ok
    );
}

#[test]
fn actor_leave_changed_task_requires_a_fresh_assignment_and_acceptance() {
    let f = Fixture::new();
    let requested = f.ok("user", json!({"action":"request","actor_id":"dev"}));
    let id = requested["id"].as_str().unwrap();
    f.ok(
        "dev",
        json!({"action":"summary","leave_id":id,"summary":"交接当前开发任务"}),
    );
    let assigned = f.ok("manager",json!({"action":"assign","leave_id":id,"assignments":[{"task_id":"T001","actor_id":"receiver"}]}));
    let old = assigned["tasks"][0]["assignment_id"].clone();
    ContextStore::new(f.home.clone())
        .unwrap()
        .sync(
            &f.group,
            &[
                json!({"op":"task.update","task_id":"T001","title":"范围调整后的工作"})
                    .as_object()
                    .unwrap()
                    .clone(),
            ],
            None,
            "user",
            false,
        )
        .unwrap();
    let waiting = f.ok(
        "receiver",
        json!({"action":"accept","leave_id":id,"assignment_ids":[old]}),
    );
    assert_ne!(
        waiting["status"], "away",
        "旧清单的确认不能移交已变更的工作"
    );
    assert_eq!(f.owner(), "dev");
    let fresh = f.ok("manager",json!({"action":"assign","leave_id":id,"assignments":[{"task_id":"T001","actor_id":"receiver"}]}));
    assert_ne!(fresh["tasks"][0]["assignment_id"], old);
    assert!(fresh["tasks"][0]["accepted_at"].is_null());
    assert_eq!(fresh["tasks"][0]["title"], "范围调整后的工作");
}

#[test]
fn actor_leave_finished_work_keeps_historical_owner_and_needs_no_receiver() {
    let f = Fixture::new();
    let leave = f.ok("user", json!({"action":"request","actor_id":"dev"}));
    let id = leave["id"].as_str().unwrap();
    ContextStore::new(f.home.clone())
        .unwrap()
        .sync(
            &f.group,
            &[json!({"op":"task.move","task_id":"T001","status":"done"})
                .as_object()
                .unwrap()
                .clone()],
            None,
            "user",
            false,
        )
        .unwrap();
    f.ok(
        "dev",
        json!({"action":"summary","leave_id":id,"summary":"已确认任务完成"}),
    );
    let done = f.ok(
        "manager",
        json!({"action":"assign","leave_id":id,"assignments":[]}),
    );
    assert_eq!(done["status"], "away");
    assert_eq!(f.owner(), "dev");
    assert_eq!(done["tasks"][0]["closed"], true);
}

#[test]
fn actor_leave_chat_history_keeps_one_card_without_private_control_instructions() {
    let f = Fixture::new();
    let leave = f.ok("user", json!({"action":"request","actor_id":"dev"}));
    f.ok(
        "dev",
        json!({"action":"summary","leave_id":leave["id"],"summary":"已整理交接"}),
    );
    f.ok("manager", json!({"action":"retry","leave_id":leave["id"]}));
    let response = crate::handle_request(
        &f.home,
        &DaemonRequest {
            v: 1,
            op: "ledger_tail".into(),
            args: json!({"group_id":f.group,"kind":"chat","limit":100})
                .as_object()
                .unwrap()
                .clone(),
        },
    );
    assert!(response.ok, "群聊历史读取失败：{:?}", response.error);
    let events = response.result["events"].as_array().unwrap();
    assert_eq!(
        events
            .iter()
            .filter(|event| event["data"]["kind"] == "actor_leave_card")
            .count(),
        1
    );
    assert!(
        !events
            .iter()
            .any(|event| event["data"]["kind"] == "actor_leave_prepare")
    );
}

#[test]
fn actor_leave_reconcile_does_not_restart_a_cancelled_historical_leave() {
    let f = Fixture::new();
    let leave = f.ok("user", json!({"action":"request","actor_id":"dev"}));
    f.ok("user", json!({"action":"cancel","leave_id":leave["id"]}));
    let store = GroupStore::new(f.home.clone()).unwrap();
    store
        .mutate(&f.group, |group| {
            group.running = true;
            group.state = GroupState::Active;
            group
                .actors
                .iter_mut()
                .for_each(|actor| actor.enabled = false);
            Ok(())
        })
        .unwrap();
    super::reconcile(&f.home, &f.group).unwrap();
    let record = f.ok("user", json!({"action":"get","leave_id":leave["id"]}));
    assert_eq!(record["last_error"], "", "历史撤销记录不得再次启动成员");
    assert_eq!(f.member("dev")["enabled"], false);
}

#[test]
fn actor_leave_rejects_a_new_conversation_and_restores_the_previous_pointer() {
    let f = Fixture::new();
    let receipt = json!({"v":2,"kind":"native_runtime_session","group_id":f.group,"actor_id":"dev","runtime":"codex","provider_thread_id":"original-thread","resume_eligible":true,"secret":"不得写入交接备份"}).as_object().unwrap().clone();
    super::super::runtime_session::restore_snapshot(&f.home, &f.group, "dev", Some(&receipt))
        .unwrap();
    let leave = f.ok("user", json!({"action":"request","actor_id":"dev"}));
    let group = GroupStore::new(f.home.clone())
        .unwrap()
        .load(&f.group)
        .unwrap();
    let record = cccc_core::actor_leave::get(&group, leave["id"].as_str().unwrap()).unwrap();
    super::session::capture(&f.home, &f.group, &record).unwrap();
    let mut changed = receipt.clone();
    changed.insert("provider_thread_id".into(), json!("accidental-new-thread"));
    super::super::runtime_session::restore_snapshot(&f.home, &f.group, "dev", Some(&changed))
        .unwrap();
    let error = super::session::verify(&f.home, &f.group, &record).unwrap_err();
    assert_eq!(error.code, "leave_session_changed");
    let restored = super::super::runtime_session::snapshot(&f.home, &f.group, "dev")
        .unwrap()
        .unwrap();
    assert_eq!(restored["provider_thread_id"], "original-thread");
    let backup = GroupStore::new(f.home.clone())
        .unwrap()
        .state_dir(&f.group)
        .unwrap()
        .join("actor_leave_sessions")
        .join(format!("{}.json", record.id));
    assert!(
        !std::fs::read_to_string(backup)
            .unwrap()
            .contains("不得写入交接备份")
    );
}
