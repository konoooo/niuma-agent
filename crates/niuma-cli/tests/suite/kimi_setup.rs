use serde_json::{Value, json};
use std::process::Command;

#[test]
fn kimi_setup_updates_the_code_home_without_a_kimi_mcp_subcommand() {
    let temp = tempfile::tempdir().expect("tempdir");
    let root = temp.path();
    let config = root.join("kimi-code");
    let project = root.join("project");
    std::fs::create_dir_all(&project).expect("project");
    let other = json!({"command":"other-mcp","args":["keep"]});
    niuma_core::fs::write_json(
        &config.join("mcp.json"),
        &json!({"mcpServers":{"other":other}}),
    )
    .expect("existing unrelated MCP entry");
    let setup = || {
        Command::new(env!("CARGO_BIN_EXE_niuma-agent"))
            .args(["setup", "--runtime", "kimi", "--path"])
            .arg(&project)
            .env("NIUMA_HOME", root.join("niuma-agent"))
            .env("KIMI_CODE_HOME", &config)
            .env("PATH", "")
            .env_remove("NIUMA_LAUNCHER_PATH")
            .output()
            .expect("run CLI setup")
    };
    let output = setup();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let response: Value = serde_json::from_slice(&output.stdout).expect("setup JSON");
    assert_eq!(response["status"], "ready");
    let updated: Value =
        niuma_core::fs::read_json(&config.join("mcp.json")).expect("updated MCP config");
    assert_eq!(updated["mcpServers"]["other"], other);
    assert_eq!(updated["mcpServers"]["niuma-agent"]["args"], json!(["mcp"]));
    assert!(setup().status.success(), "setup is idempotent");

    let conflict = json!({"mcpServers":{"niuma-agent":{"command":"stale","args":["mcp"]}}});
    niuma_core::fs::write_json(&project.join(".kimi-code/mcp.json"), &conflict)
        .expect("conflicting project entry");
    let failed = setup();
    assert!(!failed.status.success());
    assert!(String::from_utf8_lossy(&failed.stderr).contains("overrides the user configuration"));
    let preserved: Value = niuma_core::fs::read_json(&project.join(".kimi-code/mcp.json"))
        .expect("unchanged project config");
    assert_eq!(preserved, conflict);
}
