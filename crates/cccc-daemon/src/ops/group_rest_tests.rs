use super::*;
use cccc_contracts::{Actor, GroupState};
use cccc_core::{GroupStore, ledger};
use serde_json::{Value, json};

fn fixture() -> (tempfile::TempDir, HomeLayout, GroupStore, GroupDoc) {
    let temp = tempfile::tempdir().expect("隔离目录");
    let home = HomeLayout::from_path(temp.path().join("home")).expect("home");
    let store = GroupStore::new(home.clone()).expect("store");
    let mut group = store.create("休息与续接", "").expect("group");
    for id in ["领班", "开发"] {
        group.actors.push(Actor::new(id));
    }
    store.save(&group).expect("保存组");
    (temp, home, store, group)
}

fn receipt(home: &HomeLayout, group: &GroupDoc, actor: &str, thread: &str, seen: &str) {
    let record = json!({"v":2,"kind":"runtime_session","group_id":group.group_id,"actor_id":actor,"runtime":"codex","transport":"codex_app_server","provider_thread_id":thread,"provider_session_id":"","workspace_path":"/fixture/project","command_fingerprint":"command-1","identity_fingerprint":"identity-1","model":"","status":"usable","resume_eligible":true,"last_seen_at":seen,"captured_from":"app_server_thread_resume"});
    super::super::runtime_session::restore_snapshot(
        home,
        &group.group_id,
        actor,
        Some(record.as_object().expect("对象")),
    )
    .expect("保存会话记录");
}

fn notices(store: &GroupStore, group: &GroupDoc) -> Vec<cccc_contracts::Event> {
    ledger::read_all(&store.ledger_path(&group.group_id).expect("ledger"))
        .expect("读取事件")
        .into_iter()
        .filter(|event| event.kind == "system.notify" && event.data["kind"] == "group_resume")
        .collect()
}

#[test]
fn rest_snapshot_continues_each_restored_conversation_once() {
    let (_temp, home, store, mut group) = fixture();
    for actor in &group.actors {
        receipt(
            &home,
            &group,
            &actor.id,
            &format!("thread-{}", actor.id),
            "before-rest",
        );
    }
    group.running = true;
    capture(&home, &group).expect("记录休息点");
    for actor in &group.actors {
        receipt(
            &home,
            &group,
            &actor.id,
            &format!("thread-{}", actor.id),
            "after-resume",
        );
    }
    assert_eq!(continue_work(&home, &group).expect("续接"), 2);
    assert_eq!(continue_work(&home, &group).expect("重复恢复"), 0);
    let events = notices(&store, &group);
    assert_eq!(events.len(), 2);
    assert!(events.iter().all(|event| {
        event.data["message"]
            .as_str()
            .is_some_and(|text| text.contains("未完成") && text.contains("已完成"))
    }));
}

#[test]
fn changing_thread_or_not_restoring_history_never_resumes_old_work() {
    let (_temp, home, store, group) = fixture();
    receipt(&home, &group, "领班", "old-thread", "before");
    receipt(&home, &group, "开发", "same-thread", "before");
    capture(&home, &group).expect("休息点");
    receipt(&home, &group, "领班", "different-thread", "after");
    assert_eq!(continue_work(&home, &group).expect("恢复"), 0);
    assert!(notices(&store, &group).is_empty());
}

#[test]
fn changing_claude_model_while_off_duty_continues_verified_inherited_history() {
    let (_temp, home, store, group) = fixture();
    receipt(&home, &group, "开发", "", "before");
    let mut saved = super::super::runtime_session::snapshot(&home, &group.group_id, "开发")
        .unwrap()
        .unwrap();
    saved.insert("runtime".into(), json!("claude"));
    saved.insert("transport".into(), json!("claude_agent_view"));
    saved.insert("provider_session_id".into(), json!("old-session"));
    super::super::runtime_session::restore_snapshot(&home, &group.group_id, "开发", Some(&saved))
        .unwrap();
    capture(&home, &group).unwrap();
    saved.insert("provider_session_id".into(), json!("continued-session"));
    saved.insert("continued_from_session_id".into(), json!("old-session"));
    saved.insert("last_seen_at".into(), json!("after"));
    super::super::runtime_session::restore_snapshot(&home, &group.group_id, "开发", Some(&saved))
        .unwrap();
    assert_eq!(continue_work(&home, &group).unwrap(), 1);
    assert_eq!(notices(&store, &group).len(), 1);
}

#[test]
fn rest_snapshot_survives_reload_and_repeated_rest_without_overwriting_history() {
    let (_temp, home, store, mut group) = fixture();
    receipt(&home, &group, "领班", "saved-thread", "before");
    capture(&home, &group).expect("休息点");
    group.state = GroupState::Paused;
    group.running = false;
    capture(&home, &group).expect("重复休息");
    receipt(&home, &group, "领班", "saved-thread", "after");
    let reloaded = HomeLayout::from_path(home.root().to_path_buf()).expect("重新载入");
    assert_eq!(continue_work(&reloaded, &group).expect("重启后续接"), 1);
    assert_eq!(notices(&store, &group).len(), 1);
}

#[test]
fn first_start_does_not_create_an_artificial_task() {
    let (_temp, home, store, group) = fixture();
    prepare(&home, &group).expect("首次启动");
    receipt(&home, &group, "领班", "new-thread", "after-start");
    assert_eq!(continue_work(&home, &group).expect("启动后检查"), 0);
    assert!(notices(&store, &group).is_empty());
}

#[test]
fn legacy_stopped_group_gets_a_continuation_after_real_session_resume() {
    let (_temp, home, store, mut group) = fixture();
    group.state = GroupState::Stopped;
    group.running = false;
    receipt(&home, &group, "领班", "legacy-thread", "before");
    prepare(&home, &group).expect("旧版本停止组");
    receipt(&home, &group, "领班", "legacy-thread", "after");
    assert_eq!(continue_work(&home, &group).expect("续接"), 1);
    assert_eq!(notices(&store, &group).len(), 1);
}

#[test]
fn disabled_or_recreated_members_do_not_inherit_previous_tasks() {
    let (_temp, home, store, mut group) = fixture();
    for actor in &group.actors {
        receipt(&home, &group, &actor.id, &actor.id, "before");
    }
    capture(&home, &group).expect("休息点");
    group.actors[0].enabled = false;
    group.actors[1].created_at = "recreated".into();
    for actor in &group.actors {
        receipt(&home, &group, &actor.id, &actor.id, "after");
    }
    assert_eq!(continue_work(&home, &group).expect("恢复"), 0);
    assert!(notices(&store, &group).is_empty());
}

#[test]
#[cfg(unix)]
fn pause_stops_native_pty_and_records_group_as_not_desired_running() {
    use std::collections::BTreeMap;
    let (temp, home, store, mut group) = fixture();
    group.running = true;
    group.actors[0].runtime = cccc_contracts::ActorRuntime::Kimi;
    store.save(&group).expect("保存运行组");
    cccc_runtime::start(cccc_runtime::LaunchSpec {
        group_id: group.group_id.clone(),
        actor_id: group.actors[0].id.clone(),
        runner: cccc_contracts::RunnerKind::Pty,
        command: vec!["/bin/sh".into(), "-c".into(), "exec sleep 60".into()],
        cwd: temp.path().to_path_buf(),
        env: BTreeMap::new(),
        cols: 120,
        rows: 40,
    })
    .expect("隔离原生进程");
    let response = crate::handle_request(
        &home,
        &cccc_contracts::DaemonRequest {
            v: 1,
            op: "group_set_state".into(),
            args: json!({"group_id":group.group_id,"by":"user","state":"paused"})
                .as_object()
                .expect("参数")
                .clone(),
        },
    );
    let still_running = cccc_runtime::status(&group.group_id, &group.actors[0].id)
        .is_ok_and(|status| status.running);
    let _ = cccc_runtime::stop(&group.group_id, &group.actors[0].id);
    assert!(response.ok, "{:?}", response.error);
    assert!(
        !still_running,
        "休息必须停止原生进程，不能只停止托管 headless 会话"
    );
    let saved = store.load(&group.group_id).expect("组状态");
    assert_eq!(saved.state, GroupState::Paused);
    assert!(!saved.running, "休息期间不应要求进程继续运行");
}

#[test]
fn activate_paused_group_runs_the_start_lifecycle_in_one_request() {
    let (_temp, home, store, mut group) = fixture();
    group.actors.clear();
    group.running = false;
    group.state = GroupState::Paused;
    store.save(&group).expect("休息中的组");
    let response = crate::handle_request(
        &home,
        &cccc_contracts::DaemonRequest {
            v: 1,
            op: "group_set_state".into(),
            args: json!({"group_id":group.group_id,"by":"user","state":"active"})
                .as_object()
                .expect("参数")
                .clone(),
        },
    );
    assert!(response.ok, "{:?}", response.error);
    assert!(
        store.load(&group.group_id).expect("组").running,
        "恢复必须执行启动流程"
    );
    assert!(
        ledger::read_all(&store.ledger_path(&group.group_id).expect("路径"))
            .expect("事件")
            .iter()
            .any(|event| event.kind == "group.start")
    );
}

#[test]
fn retry_after_notice_commit_does_not_submit_a_second_continuation() {
    let (_temp, home, store, group) = fixture();
    receipt(&home, &group, "领班", "same-thread", "before");
    capture(&home, &group).expect("休息点");
    let original: Value =
        cccc_core::fs::read_json(&path(&home, &group).expect("路径")).expect("持久化休息点");
    receipt(&home, &group, "领班", "same-thread", "after");
    assert_eq!(continue_work(&home, &group).expect("首次续接"), 1);
    // 模拟通知已写入、批次完成标记尚未落盘时服务退出。
    cccc_core::fs::write_json(&path(&home, &group).expect("路径"), &original)
        .expect("重现未完成标记");
    assert_eq!(continue_work(&home, &group).expect("重试"), 0);
    assert_eq!(notices(&store, &group).len(), 1);
}

#[test]
fn changed_workspace_does_not_receive_a_previous_task() {
    let (_temp, home, store, group) = fixture();
    receipt(&home, &group, "领班", "same-thread", "before");
    capture(&home, &group).expect("休息点");
    receipt(&home, &group, "领班", "same-thread", "after");
    let mut current = super::super::runtime_session::snapshot(&home, &group.group_id, "领班")
        .expect("读取")
        .expect("记录");
    current.insert("workspace_path".into(), json!("/another-project"));
    super::super::runtime_session::restore_snapshot(&home, &group.group_id, "领班", Some(&current))
        .expect("模拟目录变更");
    assert_eq!(continue_work(&home, &group).expect("恢复"), 0);
    assert!(notices(&store, &group).is_empty());
}

#[cfg(unix)]
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn complete_group_cycle_restores_codex_thread_and_delivers_continuation_to_native_input() {
    use futures_util::{SinkExt, StreamExt};
    use std::os::unix::fs::PermissionsExt;
    use std::sync::{Arc, Mutex};
    use std::time::{Duration, Instant};
    use tokio_tungstenite::tungstenite::Message;
    if std::env::var_os("CCCC_GROUP_REST_NATIVE_FIXTURE").is_none() {
        // 原生启动器解析依赖进程环境；隔离子进程可避免修改并行测试的全局环境。
        let launcher_dir = tempfile::tempdir().expect("隔离启动器");
        let launcher = launcher_dir.path().join("cccc");
        std::fs::write(&launcher, "#!/bin/sh\nexit 1\n").expect("离线 MCP 占位启动器");
        std::fs::set_permissions(&launcher, std::fs::Permissions::from_mode(0o700))
            .expect("启动器权限");
        let filter = "ops::group_rest::tests::complete_group_cycle_restores_codex_thread_and_delivers_continuation_to_native_input";
        let output = std::process::Command::new(std::env::current_exe().expect("测试程序"))
            .args([filter, "--exact", "--nocapture"])
            .env("CCCC_GROUP_REST_NATIVE_FIXTURE", "1")
            .env("CCCC_LAUNCHER_PATH", launcher)
            .output()
            .expect("运行隔离原生测试");
        super::super::isolated_test::assert_one_passed(output, filter);
        return;
    }
    let (temp, home, store, mut group) = fixture();
    group.actors.truncate(1);
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
        .await
        .expect("隔离协议服务");
    let endpoint = format!("ws://{}", listener.local_addr().expect("地址"));
    let methods = Arc::new(Mutex::new(Vec::<String>::new()));
    let captured = Arc::clone(&methods);
    let refuse_resume = Arc::new(std::sync::atomic::AtomicBool::new(false));
    let recovery_flag = Arc::clone(&refuse_resume);
    let server = tokio::spawn(async move {
        while let Ok((stream, _)) = listener.accept().await {
            let captured = Arc::clone(&captured);
            let recovery_flag = Arc::clone(&recovery_flag);
            tokio::spawn(async move {
                let mut socket = tokio_tungstenite::accept_async(stream)
                    .await
                    .expect("协议连接");
                while let Some(Ok(Message::Text(text))) = socket.next().await {
                    let request: Value = serde_json::from_str(&text).expect("请求");
                    let Some(id) = request.get("id") else {
                        continue;
                    };
                    let method = request["method"].as_str().unwrap_or_default();
                    captured.lock().expect("协议记录").push(method.to_owned());
                    if method == "thread/resume"
                        && recovery_flag.load(std::sync::atomic::Ordering::SeqCst)
                    {
                        if socket.send(Message::Text(json!({"id":id,"error":{"code":-32000,"message":"saved conversation is unavailable"}}).to_string().into())).await.is_err(){break;}
                        continue;
                    }
                    let result = match method {
                        "thread/start" | "thread/resume" => {
                            json!({"thread":{"id":if recovery_flag.load(std::sync::atomic::Ordering::SeqCst){"fresh-recovered-thread"}else{"saved-work-thread"}}})
                        }
                        "thread/read" => {
                            json!({"thread":{"id":request["params"]["threadId"],"turns":[]}})
                        }
                        _ => json!({}),
                    };
                    if socket
                        .send(Message::Text(
                            json!({"id":id,"result":result}).to_string().into(),
                        ))
                        .await
                        .is_err()
                    {
                        break;
                    }
                }
            });
        }
    });
    let input = temp.path().join("native-input.txt");
    let terminal = temp.path().join("terminal.py");
    std::fs::write(
        &terminal,
        r#"import os,sys,tty,pathlib
root=pathlib.Path(sys.argv[1]);tty.setraw(0)
os.write(1,b'\x1b[?2004hNative fixture\r\n>')
buf=b''
while True:
 data=os.read(0,65536)
 if not data:break
 buf+=data
 while b'\r' in buf:
  text,buf=buf.split(b'\r',1)
  if text:
   with (root/'native-input.txt').open('ab') as output:output.write(text+b'\n')
"#,
    )
    .expect("原生输入测试程序");
    let executable = temp.path().join("codex");
    std::fs::write(&executable,format!("#!/bin/sh\nfor arg in \"$@\"; do\nif [ \"$arg\" = app-server ]; then\nprintf '%s\\n' 'listening on: {endpoint}' >&2\nexec sleep 120\nfi\ndone\nexec python3 {} {}\n",shell_words::quote(&terminal.to_string_lossy()),shell_words::quote(&temp.path().to_string_lossy()))).expect("离线 Codex 启动器");
    std::fs::set_permissions(&executable, std::fs::Permissions::from_mode(0o700))
        .expect("可执行权限");
    group.actors[0].command = vec![executable.to_string_lossy().into_owned()];
    group.actors[0].env.insert(
        "CODEX_HOME".into(),
        temp.path().join("provider").to_string_lossy().into_owned(),
    );
    store.save(&group).expect("离线成员");
    group = cccc_core::group_scope::attach(
        &store,
        &group.group_id,
        cccc_core::scope::detect(temp.path()).expect("目录"),
    )
    .expect("绑定目录");
    struct Cleanup(HomeLayout, GroupDoc);
    impl Drop for Cleanup {
        fn drop(&mut self) {
            super::super::actor_delivery::shutdown_group(&self.1.group_id);
            let _ = super::super::actor_runtime::stop_group(&self.0, &self.1);
        }
    }
    let _cleanup = Cleanup(home.clone(), group.clone());
    let request = |op: &str, state: Option<&str>| {
        let mut args = json!({"group_id":group.group_id,"by":"user"});
        if let Some(state) = state {
            args["state"] = json!(state);
        }
        let response = crate::handle_request(
            &home,
            &cccc_contracts::DaemonRequest {
                v: 1,
                op: op.into(),
                args: args.as_object().expect("参数").clone(),
            },
        );
        assert!(response.ok, "{:?}", response.error);
        response
    };
    request("group_start", None);
    assert!(!input.exists(), "首次启动不能制造模型任务");
    request("group_set_state", Some("paused"));
    assert!(!super::super::local_headless::running(
        &group.group_id,
        &group.actors[0].id
    ));
    request("group_set_state", Some("active"));
    let deadline = Instant::now() + Duration::from_secs(8);
    while !std::fs::read_to_string(&input)
        .unwrap_or_default()
        .contains("用户要求工作组接着工作")
        && Instant::now() < deadline
    {
        tokio::time::sleep(Duration::from_millis(25)).await;
    }
    let received = std::fs::read_to_string(&input).unwrap_or_default();
    assert!(
        received.contains("用户要求工作组接着工作"),
        "续接请求必须真实进入恢复后的原生输入，已接收内容长度={}",
        received.len()
    );
    assert!(
        methods
            .lock()
            .expect("记录")
            .iter()
            .any(|method| method == "thread/resume")
    );
    assert_eq!(notices(&store, &group).len(), 1);
    request("group_start", None);
    assert_eq!(notices(&store, &group).len(), 1, "重复恢复不得重复发任务");

    // 用同一离线协议验证成员交接和召回确实恢复原会话、收到控制指令。
    let mut with_worker = store.load(&group.group_id).expect("当前组");
    let mut worker = Actor::new("交接员工");
    worker.command = with_worker.actors[0].command.clone();
    worker.env = with_worker.actors[0].env.clone();
    cccc_core::actors::add(&mut with_worker, worker).expect("离线员工");
    store.save(&with_worker).expect("保存离线员工");
    let _leave_cleanup = Cleanup(home.clone(), with_worker.clone());
    request("group_start", None);
    let context = cccc_core::context::ContextStore::new(home.clone()).expect("任务板");
    let updated = context.sync(&group.group_id, &[json!({"op":"task.create","title":"离线交接测试工作","assignee":"交接员工","status":"active"}).as_object().unwrap().clone()],None,"user",false).unwrap();
    let task_id = updated.context.tasks.last().unwrap()["id"]
        .as_str()
        .unwrap();
    let leave_call = |by: &str, args: Value| {
        let mut args = args.as_object().unwrap().clone();
        args.insert("group_id".into(), json!(group.group_id));
        args.insert("by".into(), json!(by));
        let response = crate::handle_request(
            &home,
            &cccc_contracts::DaemonRequest {
                v: 1,
                op: "actor_leave".into(),
                args,
            },
        );
        assert!(response.ok, "原生交接操作失败：{:?}", response.error);
        response.result["leave"].clone()
    };
    let leave = leave_call("user", json!({"action":"request","actor_id":"交接员工"}));
    let leave_id = leave["id"].as_str().unwrap();
    let deadline = Instant::now() + Duration::from_secs(8);
    while !std::fs::read_to_string(&input)
        .unwrap_or_default()
        .contains("本轮仅整理交接")
        && Instant::now() < deadline
    {
        tokio::time::sleep(Duration::from_millis(25)).await;
    }
    assert!(
        std::fs::read_to_string(&input)
            .unwrap_or_default()
            .contains("本轮仅整理交接"),
        "交接指令必须进入恢复的原生输入"
    );
    leave_call(
        "交接员工",
        json!({"action":"summary","leave_id":leave_id,"summary":"已核对离线任务，待领班接手。"}),
    );
    let assigned = leave_call(
        "领班",
        json!({"action":"assign","leave_id":leave_id,"assignments":[{"task_id":task_id,"actor_id":"领班"}]}),
    );
    assert_eq!(
        context.load(&group.group_id).unwrap().tasks.last().unwrap()["assignee"],
        "交接员工"
    );
    let completed = leave_call(
        "领班",
        json!({"action":"accept","leave_id":leave_id,"assignment_ids":[assigned["tasks"][0]["assignment_id"]]}),
    );
    assert_eq!(completed["status"], "away");
    assert!(!super::super::local_headless::running(
        &group.group_id,
        "交接员工"
    ));
    request("group_start", None);
    assert!(
        !super::super::local_headless::running(&group.group_id, "交接员工"),
        "团队上班不得唤醒离岗员工"
    );
    request("group_stop", None);
    leave_call("user", json!({"action":"recall","leave_id":leave_id}));
    assert!(
        !super::super::local_headless::running(&group.group_id, "交接员工"),
        "团队下班时召回只保存返岗请求"
    );
    request("group_start", None);
    let deadline = Instant::now() + Duration::from_secs(8);
    while !std::fs::read_to_string(&input)
        .unwrap_or_default()
        .contains("本轮仅做返岗同步")
        && Instant::now() < deadline
    {
        tokio::time::sleep(Duration::from_millis(25)).await;
    }
    assert!(
        std::fs::read_to_string(&input)
            .unwrap_or_default()
            .contains("本轮仅做返岗同步"),
        "召回指令必须进入原生输入"
    );
    let retained = super::super::runtime_session::snapshot(&home, &group.group_id, "交接员工")
        .unwrap()
        .unwrap();
    assert_eq!(retained["provider_thread_id"], "saved-work-thread");
    leave_call(
        "交接员工",
        json!({"action":"ready","leave_id":leave_id,"summary":"已同步，原任务继续由领班负责。"}),
    );
    assert_eq!(
        context.load(&group.group_id).unwrap().tasks.last().unwrap()["assignee"],
        "领班"
    );
    super::super::local_headless::append_event(
        &home,
        &group.group_id,
        "领班",
        "headless.message.delta",
        json!({"delta":"old-context-marker：已有修改待核对，避免重复执行。"})
            .as_object()
            .unwrap()
            .clone(),
    )
    .unwrap();
    request("group_stop", None);
    refuse_resume.store(true, std::sync::atomic::Ordering::SeqCst);
    let automatic = crate::handle_request(
        &home,
        &cccc_contracts::DaemonRequest {
            v: 1,
            op: "group_start".into(),
            args: json!({"group_id":group.group_id,"by":"user","_cccc_automatic_lifecycle":true})
                .as_object()
                .unwrap()
                .clone(),
        },
    );
    assert!(!automatic.ok, "自动调度不得擅自清空旧会话");
    assert_eq!(
        super::super::runtime_session::snapshot(&home, &group.group_id, "领班")
            .unwrap()
            .unwrap()["provider_thread_id"],
        "saved-work-thread"
    );
    let resumed = request("group_start", None);
    assert!(
        !resumed.result["recoveries"].as_array().unwrap().is_empty(),
        "恢复失败时应明确返回新会话接续结果"
    );
    let current_group = store.load(&group.group_id).unwrap();
    let recovery_events = ledger::read_all(&store.ledger_path(&group.group_id).unwrap())
        .unwrap()
        .into_iter()
        .filter(|event| {
            event.data.get("kind").and_then(Value::as_str) == Some("group_session_recovery")
                && event.data.get("target_actor_id").and_then(Value::as_str) == Some("领班")
        })
        .collect::<Vec<_>>();
    let rendered = super::super::actor_delivery_render::render_batch_with_mail_context(
        &home,
        &current_group,
        "领班",
        &recovery_events,
    )
    .unwrap_or_default();
    assert!(
        rendered.contains("old-context-marker"),
        "恢复通知应为当前成员加载旧记录，来源={}",
        resumed.result["recoveries"]
    );
    let deadline = Instant::now() + Duration::from_secs(8);
    while !std::fs::read_to_string(&input)
        .unwrap_or_default()
        .contains("old-context-marker")
        && Instant::now() < deadline
    {
        tokio::time::sleep(Duration::from_millis(25)).await;
    }
    let received = std::fs::read_to_string(&input).unwrap_or_default();
    let facts = ledger::tail(&store.ledger_path(&group.group_id).unwrap(), 12)
        .unwrap()
        .iter()
        .map(|event| json!({"kind":event.kind,"data":event.data}))
        .collect::<Vec<_>>();
    assert!(
        received.contains("old-context-marker"),
        "可读取的旧输出必须实际载入新会话；输入尾段={}，投递事实={}",
        received
            .chars()
            .rev()
            .take(1200)
            .collect::<String>()
            .chars()
            .rev()
            .collect::<String>(),
        json!(facts)
    );
    assert_eq!(
        super::super::runtime_session::snapshot(&home, &group.group_id, "领班")
            .unwrap()
            .unwrap()["provider_thread_id"],
        "fresh-recovered-thread"
    );
    request("group_stop", None);
    server.abort();
}
