use serde_json::Value;
use std::os::unix::fs::PermissionsExt;
use std::process::Command;

#[test]
fn grok_setup_reconciles_native_registration_without_changing_imported_config() {
    let temp = tempfile::tempdir().expect("tempdir");
    let root = temp.path();
    let provider = root.join(".grok");
    std::fs::create_dir(&provider).expect("provider home");
    let claude = root.join(".claude.json");
    let imported = r#"{"mcpServers":{"niuma-agent":{"command":"legacy-python"}}}"#;
    std::fs::write(&claude, imported).expect("imported config");
    let grok = root.join("grok");
    std::fs::write(&grok, r#"#!/usr/bin/env python3
import json, os, pathlib, sys
path = pathlib.Path(os.environ['GROK_HOME']) / 'config.toml'
if sys.argv[1:] == ['inspect', '--json']:
    entries = [{'name': 'niuma-agent', 'transport': 'stdio', 'target': os.environ['NIUMA_CLI'],
                'source': {'type': 'configToml', 'path': str(path)}}] if path.exists() else []
    print(json.dumps({'mcpServers': entries}))
elif sys.argv[1:] == ['mcp', 'list', '--json']:
    print(json.dumps([{'name': 'niuma-agent', 'command': os.environ['NIUMA_CLI'],
                       'args': ['mcp'], 'enabled': True, 'scope': 'user'}]))
else:
    assert sys.argv[1:] == ['mcp', 'add', '--scope', 'user', 'niuma-agent', '--', '${NIUMA_CLI:-niuma-agent}', 'mcp']
    assert not path.exists(), 'matching registration must not be rewritten'
    path.write_text("[mcp_servers.niuma-agent]\ncommand='${NIUMA_CLI:-niuma-agent}'\nargs=['mcp']\n")
"#).expect("native CLI fixture");
    std::fs::set_permissions(&grok, std::fs::Permissions::from_mode(0o700)).expect("executable");
    let setup = || {
        Command::new(env!("CARGO_BIN_EXE_niuma-agent"))
            .args(["setup", "--runtime", "grok", "--path"])
            .arg(root)
            .env_clear()
            .env("HOME", root)
            .env("NIUMA_HOME", root.join("niuma-home"))
            .env("GROK_HOME", &provider)
            .env("PATH", format!("{}:/usr/bin:/bin", root.display()))
            .output()
            .expect("CLI setup")
    };
    for _ in 0..2 {
        let output = setup();
        assert!(
            output.status.success(),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        let response: Value = serde_json::from_slice(&output.stdout).expect("JSON");
        assert_eq!(response["status"], "ready");
        assert_eq!(response["mcp"], "native_registry");
        assert_eq!(
            response["path"],
            provider.join("config.toml").to_str().expect("path")
        );
    }
    assert_eq!(
        std::fs::read_to_string(claude).expect("imported config"),
        imported
    );
    let malformed = "private-fixture-value =";
    std::fs::write(provider.join("config.toml"), malformed).expect("malformed config");
    let output = setup();
    assert!(!output.status.success());
    assert!(String::from_utf8_lossy(&output.stderr).contains("correct the TOML"));
    assert!(!String::from_utf8_lossy(&output.stderr).contains("private-fixture-value"));
    assert_eq!(
        std::fs::read_to_string(provider.join("config.toml")).expect("preserved config"),
        malformed
    );
}
