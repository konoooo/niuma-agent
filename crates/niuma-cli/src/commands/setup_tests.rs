use super::*;
use niuma_contracts::ActorRuntime;

#[test]
fn public_launcher_override_must_be_an_existing_absolute_file() {
    let temp = tempfile::tempdir().expect("tempdir");
    let current = temp.path().join("niuma-rust");
    let launcher = temp.path().join("niuma-agent");
    std::fs::write(&launcher, b"launcher").expect("write launcher");

    assert_eq!(
        select_public_executable(current.clone(), Some(launcher.clone())),
        launcher
    );
    assert_eq!(
        select_public_executable(current.clone(), Some(PathBuf::from("niuma-agent"))),
        current
    );
    let other = temp.path().join("other");
    std::fs::write(&other, b"other").expect("write other");
    assert_eq!(
        select_public_executable(current.clone(), Some(other)),
        current
    );
}

#[test]
fn builds_codex_command_with_compiled_binary() {
    assert_eq!(
        add_command("codex", Path::new("/opt/niuma-agent")).expect("command"),
        [
            "codex",
            "mcp",
            "add",
            "niuma-agent",
            "--",
            "/opt/niuma-agent",
            "mcp"
        ]
    );
}

#[test]
fn antigravity_uses_native_registration_with_inherited_launcher() {
    assert_eq!(
        add_command("antigravity", Path::new("/opt/niuma-agent")).expect("command"),
        ["agy", "mcp", "add", "niuma-agent", "niuma-agent", "mcp"]
    );
}

#[test]
fn manual_runtime_has_explicit_batch_status() {
    let temp = tempfile::tempdir().expect("tempdir");
    let home = HomeLayout::from_path(temp.path().join("home")).expect("home");
    let args = SetupArgs {
        runtime: None,
        path: ".".into(),
        runtime_mode: "default".into(),
        login: false,
    };
    let value = setup_one(
        &home,
        &args,
        "custom",
        Path::new("/opt/niuma-agent"),
        &json!({"mcpServers":{}}),
    )
    .expect("manual setup");
    assert_eq!(value["status"], "requires_action");
    assert_eq!(value["mode"], "manual");
}

#[test]
fn builds_noninteractive_cline_command_with_compiled_binary() {
    assert_eq!(
        add_command("cline", Path::new("/opt/niuma-agent")).expect("command"),
        [
            "cline",
            "mcp",
            "add",
            "niuma-agent",
            "--yes",
            "--",
            "/opt/niuma-agent",
            "mcp"
        ]
    );
}

fn assert_managed_setup(runtime: &str, actor_runtime: ActorRuntime) {
    let temp = tempfile::tempdir().expect("tempdir");
    let home = HomeLayout::from_path(temp.path().join("home")).expect("home");
    let args = SetupArgs {
        runtime: Some(runtime.into()),
        path: ".".into(),
        runtime_mode: "default".into(),
        login: false,
    };
    let value = setup_one(
        &home,
        &args,
        runtime,
        Path::new("/opt/niuma-agent"),
        &json!({"mcpServers":{}}),
    )
    .expect("managed setup");

    assert_eq!(value["status"], "ready");
    assert_eq!(value["managed"], true);
    assert_eq!(value["mode"], "managed_session");
    assert_eq!(value["mcp"], "injected_per_session");
    assert!(
        niuma_core::runtime_mcp::add_command(actor_runtime, Path::new("/opt/niuma-agent"))
            .is_none()
    );
    assert!(niuma_core::runtime_mcp::remove_command(actor_runtime).is_none());
}

#[test]
fn claude_setup_reports_session_owned_mcp_without_global_config_mutation() {
    assert_managed_setup("claude", ActorRuntime::Claude);
}

#[test]
fn opencode_setup_reports_session_owned_mcp_without_global_config_mutation() {
    assert_managed_setup("opencode", ActorRuntime::Opencode);
}

#[test]
fn pi_setup_reports_session_owned_mcp_without_global_config_mutation() {
    assert_managed_setup("pi", ActorRuntime::Pi);
}
