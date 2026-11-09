//! Exercise omitted actions through the real MCP admission path. The IPC fixture
//! records operations, so no provider, terminal or external integration is called.
use niuma_contracts::DaemonRequest;
use niuma_core::{GroupStore, HomeLayout};
use serde_json::json;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};

#[tokio::test]
async fn optional_actions_use_the_published_default_before_routing() {
    let temp = tempfile::tempdir().expect("temp");
    let home = HomeLayout::from_path(temp.path().join("home")).expect("home");
    home.initialize().expect("initialize");
    let store = GroupStore::new(home.clone()).expect("store");
    let mut group = store.create("defaults", "").expect("group");
    niuma_core::actors::add(&mut group, niuma_contracts::Actor::new("lead")).expect("actor");
    store.save(&group).expect("save");
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
        .await
        .expect("IPC");
    niuma_core::fs::write_json(
        &niuma_daemon::DaemonPaths::new(home.clone()).address,
        &json!({"v":1,"transport":"tcp","path":"","host":"127.0.0.1",
        "port":listener.local_addr().expect("port").port(),"pid":std::process::id(),
        "version":env!("CARGO_PKG_VERSION"),"ts":"2026-09-16T00:00:00Z"}),
    )
    .expect("address");
    let server = tokio::spawn(async move {
        loop {
            let (stream, _) = listener.accept().await.expect("accept");
            let mut stream = BufReader::new(stream);
            let mut line = String::new();
            stream.read_line(&mut line).await.expect("read");
            let request: DaemonRequest = serde_json::from_str(&line).expect("request");
            let response = json!({"v":1,"ok":true,"result":{"observed_op":request.op,"observed_args":request.args}});
            stream
                .get_mut()
                .write_all(format!("{response}\n").as_bytes())
                .await
                .expect("respond");
        }
    });
    for (tool, action, op) in [
        ("niuma_memory", "search", "memory_reme_search"),
        ("niuma_memory_admin", "index_sync", "memory_reme_index_sync"),
        ("niuma_notify", "send", "system_notify"),
        ("niuma_terminal", "tail", "terminal_tail"),
        ("niuma_debug", "snapshot", "debug_snapshot"),
        ("niuma_automation", "state", "group_automation_state"),
        ("niuma_actor", "list", "actor_list"),
        ("niuma_group", "info", "group_show"),
        ("niuma_headless", "status", "headless_status"),
        ("niuma_im_bind", "", "im_bind_chat"),
    ] {
        for explicit in [false, true] {
            let mut args = json!({"query":"audit", "key":"fixture-key", "target_actor_id":"lead"});
            if explicit && !action.is_empty() {
                args["action"] = json!(action);
            }
            let response = niuma_mcp::handle_request_for_actor(&home,
                &json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":tool,"arguments":args}}),
                &group.group_id, "lead").await;
            assert_eq!(
                response["result"]["structuredContent"]["observed_op"], op,
                "{tool}, explicit action={explicit}: {response}"
            );
        }
    }
    let invalid = niuma_mcp::handle_request_for_actor(&home,
        &json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"niuma_debug","arguments":{"action":"not-an-action"}}}),
        &group.group_id,"lead").await;
    assert_eq!(
        invalid["result"]["isError"], true,
        "explicit invalid action must not become a default"
    );
    server.abort();
    let _ = server.await;
}

#[tokio::test]
async fn workspace_defaults_inspect_and_edit_the_active_scope() {
    let temp = tempfile::tempdir().expect("temp");
    let home = HomeLayout::from_path(temp.path().join("home")).expect("home");
    home.initialize().expect("initialize");
    let root = temp.path().join("project");
    std::fs::create_dir(&root).expect("project");
    assert!(
        std::process::Command::new("git")
            .args(["init", "--quiet"])
            .arg(&root)
            .status()
            .expect("git init")
            .success()
    );
    std::fs::write(root.join("note.txt"), "before").expect("file");
    let store = GroupStore::new(home.clone()).expect("store");
    let mut group = store.create("workspace defaults", "").expect("group");
    let mut actor = niuma_contracts::Actor::new("web-peer");
    actor.runtime = niuma_contracts::ActorRuntime::WebModel;
    actor.normalize_runtime_constraints();
    niuma_core::actors::add(&mut group, actor).expect("actor");
    store.save(&group).expect("save");
    niuma_core::group_scope::attach(
        &store,
        &group.group_id,
        niuma_core::Scope {
            scope_key: "project".into(),
            url: root.to_string_lossy().into_owned(),
            label: "project".into(),
            git_remote: String::new(),
        },
    )
    .expect("attach");
    let daemon_home = home.clone();
    let daemon = tokio::spawn(async move { niuma_daemon::run(daemon_home).await });
    let client = niuma_client::DaemonClient::new(home.clone());
    tokio::time::timeout(std::time::Duration::from_secs(5), async {
        loop {
            if client
                .call(&DaemonRequest {
                    v: 1,
                    op: "ping".into(),
                    args: Default::default(),
                })
                .await
                .is_ok()
            {
                break;
            }
            tokio::time::sleep(std::time::Duration::from_millis(20)).await;
        }
    })
    .await
    .expect("daemon ready");
    let mut results = Vec::new();
    for (tool, args) in [
        ("niuma_repo", json!({})),
        ("niuma_repo", json!({"action":"read", "path":"note.txt"})),
        (
            "niuma_repo_edit",
            json!({"path":"note.txt", "old_text":"before", "new_text":"after"}),
        ),
        ("niuma_git", json!({})),
    ] {
        let response = niuma_mcp::handle_request_for_actor(&home,
            &json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":tool,"arguments":args}}),
            &group.group_id,"web-peer").await;
        assert_ne!(response["result"]["isError"], true, "{tool}: {response}");
        results.push(response["result"]["structuredContent"].clone());
    }
    daemon.abort();
    let _ = daemon.await;
    assert_eq!(
        results[0]["git"], true,
        "default repo action must return info"
    );
    assert!(results[1].to_string().contains("before"));
    assert_eq!(
        std::fs::read_to_string(root.join("note.txt")).expect("read"),
        "after"
    );
    assert_eq!(
        results[3]["exit_code"], 0,
        "default git action must return status"
    );
    assert!(
        results[3]["stdout"]
            .as_str()
            .expect("status")
            .contains("note.txt")
    );
}
