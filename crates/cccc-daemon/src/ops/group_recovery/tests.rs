use super::*;

fn fixture(
    runtime: ActorRuntime,
) -> (
    tempfile::TempDir,
    HomeLayout,
    GroupDoc,
    Actor,
    Map<String, Value>,
) {
    let temp = tempfile::tempdir().unwrap();
    let home = HomeLayout::from_path(temp.path().join("home")).unwrap();
    let store = GroupStore::new(home.clone()).unwrap();
    let mut group = store.create("会话恢复测试", "").unwrap();
    let mut actor = Actor::new("dev");
    actor.runtime = runtime;
    actors::add(&mut group, actor.clone()).unwrap();
    actor = actors::find(&group, "dev").unwrap().clone();
    store.save(&group).unwrap();
    let old=json!({"v":2,"runtime":runtime,"transport":if runtime==ActorRuntime::Claude{"claude_agent_view"}else{"codex_app_server"},"provider_thread_id":if runtime==ActorRuntime::Codex{"old-thread"}else{""},"provider_session_id":if runtime==ActorRuntime::Claude{"old-session"}else{""},"status":"usable","resume_eligible":true,"last_seen_at":cccc_contracts::utc_now()}).as_object().unwrap().clone();
    super::super::runtime_session::restore_snapshot(&home, &group.group_id, &actor.id, Some(&old))
        .unwrap();
    (temp, home, group, actor, old)
}

#[test]
fn unrelated_startup_errors_never_reset_a_saved_conversation() {
    let (_temp, home, group, actor, old) = fixture(ActorRuntime::Codex);
    let mut calls = Vec::new();
    let result = start_with(&home, &group, &actor, |kind| {
        calls.push(kind.to_owned());
        Err(OpError::new("missing_project_root", "测试目录未关联"))
    });
    assert!(result.is_err());
    assert_eq!(calls, ["actor.start"]);
    assert_eq!(
        super::super::runtime_session::snapshot(&home, &group.group_id, &actor.id)
            .unwrap()
            .unwrap(),
        old
    );
}

#[test]
fn failed_new_session_restores_the_original_pointer() {
    let (_temp, home, group, actor, old) = fixture(ActorRuntime::Codex);
    let result = start_with(&home, &group, &actor, |kind| match kind {
        "actor.start" => Err(OpError::new(
            super::super::actor_runtime::RUNTIME_RESUME_FAILED,
            "旧会话不可恢复",
        )),
        "actor.new_session" => {
            super::super::runtime_session::restore_snapshot(
                &home,
                &group.group_id,
                &actor.id,
                None,
            )
            .unwrap();
            Err(OpError::new("provider_unavailable", "提供方不可用"))
        }
        _ => Ok(None),
    });
    assert!(result.is_err());
    assert_eq!(
        super::super::runtime_session::snapshot(&home, &group.group_id, &actor.id)
            .unwrap()
            .unwrap(),
        old
    );
}

#[test]
fn native_recovery_is_private_bound_to_the_current_member_and_keeps_the_old_identity() {
    for runtime in [ActorRuntime::Codex, ActorRuntime::Claude] {
        let (_temp, home, group, actor, old) = fixture(runtime);
        let expected = json!({"delta":"仅属于当前成员的历史工作说明"})
            .as_object()
            .unwrap()
            .clone();
        super::super::local_headless::append_event(
            &home,
            &group.group_id,
            &actor.id,
            "headless.message.delta",
            expected,
        )
        .unwrap();
        let mut current = old.clone();
        let key = if runtime == ActorRuntime::Codex {
            "provider_thread_id"
        } else {
            "provider_session_id"
        };
        current.insert(key.into(), json!("fresh-native-conversation"));
        let (_, report) = start_with(&home, &group, &actor, |kind| match kind {
            "actor.start" => Err(OpError::new(
                if runtime == ActorRuntime::Codex {
                    super::super::actor_runtime::RUNTIME_RESUME_FAILED
                } else {
                    super::super::actor_runtime::CLAUDE_RESUME_FAILED
                },
                "旧会话不可恢复",
            )),
            "actor.new_session" => {
                super::super::runtime_session::restore_snapshot(
                    &home,
                    &group.group_id,
                    &actor.id,
                    Some(&current),
                )
                .unwrap();
                Ok(None)
            }
            _ => Ok(None),
        })
        .unwrap();
        let report = report.unwrap();
        assert!(
            report
                .context_sources
                .iter()
                .any(|source| source == "member_output")
        );
        let events = ledger::tail(
            &GroupStore::new(home.clone())
                .unwrap()
                .ledger_path(&group.group_id)
                .unwrap(),
            10,
        )
        .unwrap();
        assert!(
            !serde_json::to_string(&events)
                .unwrap()
                .contains("仅属于当前成员"),
            "旧输出不能进入群聊账本"
        );
        assert!(
            delivery_context(&home, &group, &actor.id, &events)
                .unwrap()
                .contains("仅属于当前成员")
        );
        let saved: Record = cccc_core::fs::read_json(
            &directory(&home, &group)
                .unwrap()
                .join(format!("{}.json", report.recovery_id)),
        )
        .unwrap();
        assert_eq!(saved.previous_identity[key], old[key]);
        let mut replaced = group.clone();
        replaced.actors[0].generation = "new-member-generation".into();
        assert!(delivery_context(&home, &replaced, &actor.id, &events).is_none());
    }
}

#[test]
fn failed_recovery_keeps_the_original_resume_failure_gate_closed() {
    let (_temp, home, group, actor, old) = fixture(ActorRuntime::Codex);
    let mut failed = old.clone();
    failed.insert("status".into(), json!("resume_failed"));
    failed.insert("resume_eligible".into(), json!(false));
    let result = start_with(&home, &group, &actor, |kind| match kind {
        "actor.start" => {
            super::super::runtime_session::restore_snapshot(
                &home,
                &group.group_id,
                &actor.id,
                Some(&failed),
            )
            .unwrap();
            Err(OpError::new(
                super::super::actor_runtime::RUNTIME_RESUME_FAILED,
                "旧会话不可用",
            ))
        }
        "actor.new_session" => {
            super::super::runtime_session::restore_snapshot(
                &home,
                &group.group_id,
                &actor.id,
                None,
            )
            .unwrap();
            Err(OpError::new("provider_unavailable", "新会话也未连接"))
        }
        _ => Ok(None),
    });
    assert!(result.is_err());
    assert_eq!(
        super::super::runtime_session::snapshot(&home, &group.group_id, &actor.id)
            .unwrap()
            .unwrap()["status"],
        "resume_failed"
    );
}

#[test]
fn messages_arriving_during_recovery_remain_new_work() {
    let (_temp, home, group, actor, old) = fixture(ActorRuntime::Codex);
    let mut new_event = String::new();
    start_with(&home, &group, &actor, |kind| match kind {
        "actor.start" => Err(OpError::new(
            super::super::actor_runtime::RUNTIME_RESUME_FAILED,
            "旧会话不可恢复",
        )),
        "actor.new_session" => {
            let mut current = old.clone();
            current.insert("provider_thread_id".into(), json!("fresh-thread"));
            super::super::runtime_session::restore_snapshot(
                &home,
                &group.group_id,
                &actor.id,
                Some(&current),
            )
            .unwrap();
            let mut event = Event::new("chat.message", &group.group_id);
            event.by = "user".into();
            event.data =
                json!({"to":[actor.id],"text":"上班过程中刚提交的新请求","message_mode":"send"})
                    .as_object()
                    .unwrap()
                    .clone();
            new_event = event.id.clone();
            ledger::append(
                &GroupStore::new(home.clone())
                    .unwrap()
                    .ledger_path(&group.group_id)
                    .unwrap(),
                &event,
            )
            .unwrap();
            Ok(None)
        }
        _ => Ok(None),
    })
    .unwrap();
    let current = GroupStore::new(home.clone())
        .unwrap()
        .load(&group.group_id)
        .unwrap();
    let pending = cccc_core::inbox::pending_deliveries(&home, &current, &actor.id, 100).unwrap();
    assert!(
        pending.iter().any(|event| event.id == new_event),
        "恢复过程中收到的新请求不能被当作旧工作跳过"
    );
}
