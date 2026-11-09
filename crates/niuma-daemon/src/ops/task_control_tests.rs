use niuma_contracts::{Actor, DaemonRequest, GroupState};
use niuma_core::{GroupDoc, GroupStore, HomeLayout, actors, context::ContextStore};
use serde_json::{Value, json};

struct Fixture {
    _temp: tempfile::TempDir,
    home: HomeLayout,
    group: GroupDoc,
}
impl Fixture {
    fn new() -> Self {
        let temp = tempfile::tempdir().unwrap();
        let home = HomeLayout::from_path(temp.path().join("home")).unwrap();
        let store = GroupStore::new(home.clone()).unwrap();
        let mut group = store.create("任务控制测试", "").unwrap();
        group.state = GroupState::Paused;
        for id in ["manager", "dev", "peer"] {
            actors::add(&mut group, Actor::new(id)).unwrap();
        }
        store.save(&group).unwrap();
        ContextStore::new(home.clone()).unwrap().sync(&group.group_id,&[json!({"op":"task.create","title":"正在开发的功能","assignee":"dev","status":"active"}).as_object().unwrap().clone(),json!({"op":"task.create","title":"后续验收工作","assignee":"dev","status":"planned"}).as_object().unwrap().clone()],None,"user",false).unwrap();
        Self {
            _temp: temp,
            home,
            group,
        }
    }
    fn call(&self, by: &str, args: Value) -> niuma_contracts::DaemonResponse {
        let mut args = args.as_object().unwrap().clone();
        args.insert("group_id".into(), json!(self.group.group_id));
        args.insert("by".into(), json!(by));
        crate::handle_request(
            &self.home,
            &DaemonRequest {
                v: 1,
                op: "task_control".into(),
                args,
            },
        )
    }
    fn ok(&self, by: &str, args: Value) -> Value {
        let r = self.call(by, args);
        assert!(r.ok, "任务操作失败：{:?}", r.error);
        json!(r.result)
    }
    #[cfg(unix)]
    fn working(&self) {
        niuma_runtime::start(niuma_runtime::LaunchSpec {
            group_id: self.group.group_id.clone(),
            actor_id: "dev".into(),
            runner: niuma_contracts::RunnerKind::Pty,
            command: vec!["/bin/sleep".into(), "120".into()],
            cwd: self._temp.path().to_owned(),
            env: Default::default(),
            cols: 80,
            rows: 24,
        })
        .unwrap();
    }
}
impl Drop for Fixture {
    fn drop(&mut self) {
        let _ = niuma_runtime::stop(&self.group.group_id, "dev");
    }
}

#[test]
#[cfg(unix)]
fn task_control_waits_for_owner_ack_and_current_manager_confirmation_before_delete() {
    let f = Fixture::new();
    f.working();
    let requested = f.ok(
        "user",
        json!({"action":"request_stop","task_id":"T001","client_id":"stop-one"}),
    );
    assert_eq!(requested["task"]["execution_control"]["state"], "stopping");
    let nonce = requested["task"]["execution_control"]["request_id"].clone();
    assert!(
        !f.call(
            "user",
            json!({"action":"delete","task_id":"T001","delete_token":requested["delete_token"]})
        )
        .ok
    );
    assert!(
        !f.call(
            "peer",
            json!({"action":"confirm_stop","task_id":"T001","request_id":nonce,"note":"我认为已停"})
        )
        .ok
    );
    assert!(!f.call("manager",json!({"action":"confirm_stop","task_id":"T001","request_id":nonce,"note":"尚未收到回执"})).ok);
    f.ok("dev",json!({"action":"ack_stop","task_id":"T001","request_id":nonce,"note":"已保留修改并停止当前任务"}));
    let stopped=f.ok("manager",json!({"action":"confirm_stop","task_id":"T001","request_id":nonce,"note":"已核对负责人回执"}));
    assert_eq!(stopped["task"]["execution_control"]["state"], "stopped");
    assert!(
        niuma_runtime::status(&f.group.group_id, "dev")
            .unwrap()
            .running,
        "不应中断该成员可能在做的其他工作"
    );
    f.ok(
        "user",
        json!({"action":"delete","task_id":"T001","delete_token":stopped["delete_token"]}),
    );
    assert!(
        !ContextStore::new(f.home.clone())
            .unwrap()
            .load(&f.group.group_id)
            .unwrap()
            .tasks
            .iter()
            .any(|t| t["id"] == "T001")
    );
}

#[test]
#[cfg(unix)]
fn task_control_replayed_stop_has_one_request_and_one_manager_notice() {
    let f = Fixture::new();
    f.working();
    let first = f.ok(
        "user",
        json!({"action":"request_stop","task_id":"T001","client_id":"same-stop"}),
    );
    let again = f.ok(
        "user",
        json!({"action":"request_stop","task_id":"T001","client_id":"same-stop","if_task_rev":0}),
    );
    assert_eq!(first["task"]["rev"], again["task"]["rev"]);
    assert_eq!(
        first["task"]["execution_control"],
        again["task"]["execution_control"]
    );
    let ledger = niuma_core::ledger::read_all(
        &GroupStore::new(f.home.clone())
            .unwrap()
            .ledger_path(&f.group.group_id)
            .unwrap(),
    )
    .unwrap();
    let notices = ledger
        .iter()
        .filter(|event| event.kind == "system.notify")
        .collect::<Vec<_>>();
    assert_eq!(notices.len(), 1);
    assert_eq!(
        notices[0].data["target_actor_id"], "manager",
        "仅通知经理，由经理协调，避免中断负责人其他工作"
    );
}

#[test]
#[cfg(unix)]
fn task_control_rejects_old_requests_and_requires_user_to_resume() {
    let f = Fixture::new();
    f.working();
    let first = f.ok(
        "user",
        json!({"action":"request_stop","task_id":"T001","client_id":"first"}),
    );
    let nonce = first["task"]["execution_control"]["request_id"].clone();
    assert!(
        !f.call("dev", json!({"action":"ack_stop","task_id":"T001"}))
            .ok
    );
    assert!(
        !f.call(
            "dev",
            json!({"action":"ack_stop","task_id":"T001","request_id":"old-request"})
        )
        .ok
    );
    assert!(
        !f.call("manager", json!({"action":"resume","task_id":"T001"}))
            .ok
    );
    let contexts = ContextStore::new(f.home.clone()).unwrap();
    assert!(
        contexts
            .sync(
                &f.group.group_id,
                &[
                    json!({"op":"task.control","action":"resume","task_id":"T001"})
                        .as_object()
                        .unwrap()
                        .clone()
                ],
                None,
                "manager",
                false
            )
            .is_err()
    );
    assert!(
        contexts
            .sync(
                &f.group.group_id,
                &[json!({"op":"task.move","status":"active","task_id":"T001"})
                    .as_object()
                    .unwrap()
                    .clone()],
                None,
                "manager",
                false
            )
            .is_err()
    );
    f.ok("user", json!({"action":"resume","task_id":"T001"}));
    let second = f.ok(
        "user",
        json!({"action":"request_stop","task_id":"T001","client_id":"second"}),
    );
    assert_ne!(nonce, second["task"]["execution_control"]["request_id"]);
    assert!(
        !f.call(
            "dev",
            json!({"action":"ack_stop","task_id":"T001","request_id":nonce})
        )
        .ok
    );
}

#[test]
fn task_control_cannot_delete_a_stopped_parent_with_a_running_child() {
    let f = Fixture::new();
    let contexts = ContextStore::new(f.home.clone()).unwrap();
    contexts.sync(&f.group.group_id,&[json!({"op":"task.create","title":"进行中子任务","parent_id":"T001","assignee":"peer","status":"active"}).as_object().unwrap().clone()],None,"user",false).unwrap();
    let stopped = f.ok(
        "user",
        json!({"action":"request_stop","task_id":"T001","client_id":"parent"}),
    );
    assert_eq!(stopped["delete_info"]["reason"], "subtask_not_stopped");
    assert!(
        !f.call(
            "user",
            json!({"action":"delete","task_id":"T001","delete_token":stopped["delete_token"]})
        )
        .ok
    );
    f.ok(
        "user",
        json!({"action":"request_stop","task_id":"T003","client_id":"child"}),
    );
    let preview = f.ok("user", json!({"action":"get","task_id":"T001"}));
    let deleted = f.ok(
        "user",
        json!({"action":"delete","task_id":"T001","delete_token":preview["delete_token"]}),
    );
    assert_eq!(deleted["deleted_task_ids"], json!(["T001", "T003"]));
    assert_eq!(contexts.load(&f.group.group_id).unwrap().tasks.len(), 1);
}

#[test]
fn task_control_ordinary_updates_cannot_forge_confirmation() {
    let f = Fixture::new();
    let contexts = ContextStore::new(f.home.clone()).unwrap();
    contexts.sync(&f.group.group_id,&[json!({"op":"task.update","task_id":"T001","execution_control":{"state":"stopped","confirmed_by":"manager","confirmed_at":"now"}}).as_object().unwrap().clone()],None,"manager",false).unwrap();
    let task = f.ok("user", json!({"action":"get","task_id":"T001"}));
    assert_eq!(task["delete_info"]["allowed"], false);
    assert!(task["task"]["execution_control"].is_null());
}

#[test]
fn task_control_remote_execution_requires_coordination_even_without_a_local_process() {
    for external in [false, true] {
        let mut f = Fixture::new();
        let actor = f
            .group
            .actors
            .iter_mut()
            .find(|actor| actor.id == "dev")
            .unwrap();
        if external {
            actor.external_session_id = "external-session".into();
        } else {
            actor.runtime = niuma_contracts::ActorRuntime::WebModel;
        }
        GroupStore::new(f.home.clone())
            .unwrap()
            .save(&f.group)
            .unwrap();
        let result = f.ok(
            "user",
            json!({"action":"request_stop","task_id":"T001","client_id":"remote-stop"}),
        );
        assert_eq!(result["task"]["execution_control"]["state"], "stopping");
        assert_eq!(result["delete_info"]["allowed"], false);
    }
}

#[test]
#[cfg(unix)]
fn task_control_new_actor_generation_cannot_ack_an_old_stop_request() {
    let mut f = Fixture::new();
    f.working();
    let result = f.ok(
        "user",
        json!({"action":"request_stop","task_id":"T001","client_id":"generation-stop"}),
    );
    let actor = f
        .group
        .actors
        .iter_mut()
        .find(|actor| actor.id == "dev")
        .unwrap();
    actor.generation = uuid::Uuid::new_v4().to_string();
    GroupStore::new(f.home.clone())
        .unwrap()
        .save(&f.group)
        .unwrap();
    assert!(!f.call("dev",json!({"action":"ack_stop","task_id":"T001","request_id":result["control"]["request_id"],"note":"新会话不能代替原会话确认"})).ok);
}

#[test]
fn task_control_stopped_owner_can_be_confirmed_without_waking_the_team() {
    let f = Fixture::new();
    let stopped = f.ok(
        "user",
        json!({"action":"request_stop","task_id":"T001","client_id":"idle-stop"}),
    );
    assert_eq!(stopped["task"]["execution_control"]["state"], "stopped");
    assert!(!super::actor_runtime::actor_is_running(
        &f.group,
        actors::find(&f.group, "dev").unwrap()
    ));
}

#[test]
fn task_control_planned_delete_uses_a_fresh_snapshot_and_preserves_deleted_task_data() {
    let f = Fixture::new();
    let preview = f.ok("user", json!({"action":"get","task_id":"T002"}));
    ContextStore::new(f.home.clone())
        .unwrap()
        .sync(
            &f.group.group_id,
            &[
                json!({"op":"task.update","task_id":"T002","title":"已调整的验收计划"})
                    .as_object()
                    .unwrap()
                    .clone(),
            ],
            None,
            "user",
            false,
        )
        .unwrap();
    assert!(
        !f.call(
            "user",
            json!({"action":"delete","task_id":"T002","delete_token":preview["delete_token"]})
        )
        .ok
    );
    let preview = f.ok("user", json!({"action":"get","task_id":"T002"}));
    f.ok(
        "user",
        json!({"action":"delete","task_id":"T002","delete_token":preview["delete_token"]}),
    );
    let ledger = niuma_core::ledger::read_all(
        &GroupStore::new(f.home.clone())
            .unwrap()
            .ledger_path(&f.group.group_id)
            .unwrap(),
    )
    .unwrap();
    assert!(
        serde_json::to_string(&ledger)
            .unwrap()
            .contains("已调整的验收计划"),
        "删除应保留任务快照供历史查证"
    );
}

#[test]
fn task_control_question_is_a_real_reply_required_message_to_the_manager() {
    let f = Fixture::new();
    let sent=f.ok("user",json!({"action":"ask","task_id":"T001","question":"为什么还在等待？","client_id":"question-one"}));
    let event = &sent["event"];
    let stored = GroupStore::new(f.home.clone())
        .unwrap()
        .load(&f.group.group_id)
        .unwrap();
    assert_eq!(stored.state, GroupState::Paused);
    assert!(!stored.running);
    assert_eq!(event["by"], "user");
    assert_eq!(event["data"]["message_mode"], "request_reply");
    assert!(
        event["data"]["text"]
            .as_str()
            .unwrap()
            .contains("为什么还在等待")
    );
    assert!(event["data"]["text"].as_str().unwrap().contains("成员"));
    assert_eq!(event["data"]["refs"][0]["task_id"], "T001");
    let again=f.ok("user",json!({"action":"ask","task_id":"T001","question":"为什么还在等待？","client_id":"question-one"}));
    assert_eq!(again["event"]["id"], event["id"]);
}
