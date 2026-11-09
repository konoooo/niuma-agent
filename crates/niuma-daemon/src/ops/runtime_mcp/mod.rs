mod process;
mod state;

use niuma_contracts::ActorRuntime;
use niuma_core::HomeLayout;
use std::collections::BTreeMap;
use std::io;
use std::path::Path;
use std::sync::{Mutex, OnceLock};
use std::time::Duration;

use crate::dispatch::OpError;
use state::{Report, State};

const CHECK_TIMEOUT: Duration = Duration::from_secs(10);
const SETUP_TIMEOUT: Duration = Duration::from_secs(30);

fn setup_lock() -> &'static Mutex<()> {
    static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| Mutex::new(()))
}

pub(super) fn prepare(
    home: &HomeLayout,
    runtime: ActorRuntime,
    launch_command: &[String],
    cwd: &Path,
    env: &mut BTreeMap<String, String>,
) -> Result<(), OpError> {
    if !niuma_core::runtime_mcp::is_auto_managed(runtime) {
        return Ok(());
    }
    // These adapters own MCP setup later in the launch pipeline. Grok shares
    // its native registry with the TUI; the others inject a session entry.
    if matches!(
        runtime,
        ActorRuntime::Claude
            | ActorRuntime::Codex
            | ActorRuntime::Grok
            | ActorRuntime::Opencode
            | ActorRuntime::Kilo
            | ActorRuntime::Pi
    ) {
        return Ok(());
    }
    let executable = super::codex_mcp::resolve_niuma_executable().ok_or_else(|| {
        OpError::new(
            "runtime_mcp_executable_missing",
            "cannot locate the active 牛马Agent executable for runtime MCP setup",
        )
    })?;
    env.insert(
        "NIUMA_HOME".into(),
        home.root().to_string_lossy().into_owned(),
    );

    if runtime == ActorRuntime::Antigravity {
        return ensure_antigravity(launch_command, cwd, env, &executable);
    }

    match runtime {
        ActorRuntime::Claude
        | ActorRuntime::Codex
        | ActorRuntime::Grok
        | ActorRuntime::Kilo
        | ActorRuntime::Pi
        | ActorRuntime::Opencode => {
            unreachable!("managed runtime returned early")
        }
        ActorRuntime::Hermes => {
            let _guard = setup_lock().lock().map_err(|_| {
                OpError::new(
                    "runtime_mcp_lock_failed",
                    "runtime MCP setup lock is poisoned",
                )
            })?;
            super::hermes_runtime::ensure_for_actor(home, cwd, env)
        }
        _ => {
            let _guard = setup_lock().lock().map_err(|_| {
                OpError::new(
                    "runtime_mcp_lock_failed",
                    "runtime MCP setup lock is poisoned",
                )
            })?;
            ensure_persistent(runtime, cwd, env, &executable)
        }
    }
}

fn ensure_antigravity(
    launch_command: &[String],
    cwd: &Path,
    env: &BTreeMap<String, String>,
    executable: &Path,
) -> Result<(), OpError> {
    let runtime = ActorRuntime::Antigravity;
    let mut command = niuma_core::runtime_mcp::add_command(runtime, executable)
        .expect("Antigravity native setup command");
    if let Some(program) = launch_command.first() {
        command[0].clone_from(program);
    }
    niuma_core::runtime_mcp::ensure_antigravity(cwd, env, || {
        run_checked(
            runtime,
            "add 牛马Agent MCP entry",
            &command,
            cwd,
            env,
            SETUP_TIMEOUT,
        )
        .map_err(|error| io::Error::other(error.message))
    })
    .map(|_| ())
    .map_err(|error| OpError::new("runtime_mcp_setup_failed", error.to_string()))
}

fn ensure_persistent(
    runtime: ActorRuntime,
    cwd: &Path,
    env: &BTreeMap<String, String>,
    executable: &Path,
) -> Result<(), OpError> {
    if runtime == ActorRuntime::Kimi {
        return niuma_core::runtime_mcp::ensure_kimi(cwd, env, executable)
            .map(|_| ())
            .map_err(|error| OpError::new("runtime_mcp_setup_failed", error.to_string()));
    }
    let expected = niuma_core::runtime_mcp::expected_command(executable);
    let report = inspect(runtime, cwd, env, &expected)?;
    if report.state == State::Ready {
        return Ok(());
    }
    if matches!(runtime, ActorRuntime::Copilot | ActorRuntime::Kiro)
        && report.state == State::Stale
        && !report.source.is_empty()
        && !report.source.contains("user")
    {
        return Err(OpError::new(
            "runtime_mcp_scope_conflict",
            format!(
                "{} MCP server `niuma-agent` is stale in {} scope; remove that entry before starting the actor",
                niuma_core::runtime_mcp::name(runtime),
                report.source
            ),
        ));
    }
    if report.state == State::Stale
        && let Some(command) = niuma_core::runtime_mcp::remove_command(runtime)
    {
        run_checked(
            runtime,
            "remove stale 牛马Agent MCP entry",
            &command,
            cwd,
            env,
            SETUP_TIMEOUT,
        )?;
    }
    let command = niuma_core::runtime_mcp::add_command(runtime, executable).ok_or_else(|| {
        OpError::new(
            "runtime_mcp_setup_unsupported",
            format!(
                "{} does not expose an automatic MCP setup command",
                niuma_core::runtime_mcp::name(runtime)
            ),
        )
    })?;
    run_checked(
        runtime,
        "add 牛马Agent MCP entry",
        &command,
        cwd,
        env,
        SETUP_TIMEOUT,
    )?;
    let verified = inspect(runtime, cwd, env, &expected)?;
    if verified.state != State::Ready {
        return Err(OpError::new(
            "runtime_mcp_verification_failed",
            format!(
                "{} MCP setup completed, but its 牛马Agent entry did not match {} mcp",
                niuma_core::runtime_mcp::name(runtime),
                executable.display()
            ),
        ));
    }
    Ok(())
}

fn inspect(
    runtime: ActorRuntime,
    cwd: &Path,
    env: &BTreeMap<String, String>,
    expected: &[String],
) -> Result<Report, OpError> {
    match runtime {
        ActorRuntime::Copilot => inspect_cli(
            runtime,
            &["copilot", "mcp", "get", "niuma-agent", "--json"],
            cwd,
            env,
            expected,
        ),
        ActorRuntime::Devin => inspect_devin(cwd, env, expected),
        _ => Ok(state::json_state(runtime, cwd, env, expected)),
    }
}

fn inspect_devin(
    cwd: &Path,
    env: &BTreeMap<String, String>,
    expected: &[String],
) -> Result<Report, OpError> {
    let inspected = inspect_cli(
        ActorRuntime::Devin,
        &["devin", "mcp", "get", "niuma-agent"],
        cwd,
        env,
        expected,
    )?;
    if inspected.state == State::Ready {
        return Ok(inspected);
    }
    let listed = inspect_cli(
        ActorRuntime::Devin,
        &["devin", "mcp", "list"],
        cwd,
        env,
        expected,
    )?;
    if listed.state == State::Ready {
        Ok(listed)
    } else {
        Ok(inspected)
    }
}

fn inspect_cli(
    runtime: ActorRuntime,
    command: &[&str],
    cwd: &Path,
    env: &BTreeMap<String, String>,
    expected: &[String],
) -> Result<Report, OpError> {
    let command = command
        .iter()
        .map(|part| (*part).to_owned())
        .collect::<Vec<_>>();
    match process::run(&command, cwd, env, CHECK_TIMEOUT) {
        Ok(output) if output.code == 0 => Ok(state::command_output_state(
            runtime,
            &output.stdout,
            expected,
        )),
        Ok(_) => Ok(Report::new(State::Missing)),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Err(OpError::new(
            "runtime_mcp_cli_missing",
            format!(
                "{} CLI was not found while checking 牛马Agent MCP setup",
                niuma_core::runtime_mcp::name(runtime)
            ),
        )),
        Err(error) => Err(OpError::new(
            "runtime_mcp_check_failed",
            format!(
                "{} MCP setup check failed: {error}",
                niuma_core::runtime_mcp::name(runtime)
            ),
        )),
    }
}

fn run_checked(
    runtime: ActorRuntime,
    step: &str,
    command: &[String],
    cwd: &Path,
    env: &BTreeMap<String, String>,
    timeout: Duration,
) -> Result<(), OpError> {
    let output = process::run(command, cwd, env, timeout).map_err(|error| {
        OpError::new(
            "runtime_mcp_setup_failed",
            format!(
                "failed to {step} for {}: {error}",
                niuma_core::runtime_mcp::name(runtime)
            ),
        )
    })?;
    if output.code == 0 {
        return Ok(());
    }
    let detail = if output.stderr.trim().is_empty() {
        output.stdout.trim()
    } else {
        output.stderr.trim()
    };
    Err(OpError::new(
        "runtime_mcp_setup_failed",
        format!(
            "failed to {step} for {} (exit {}): {}",
            niuma_core::runtime_mcp::name(runtime),
            output.code,
            if detail.is_empty() {
                "no output"
            } else {
                detail
            }
        ),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(unix)]
    #[test]
    fn antigravity_uses_selected_cli_before_launch_and_rechecks_its_config() {
        use std::os::unix::fs::PermissionsExt;
        let temp = tempfile::tempdir().expect("tempdir");
        let cwd = temp.path().join("project");
        std::fs::create_dir_all(&cwd).expect("cwd");
        let provider_home = temp.path().join("provider");
        let script = temp.path().join("selected-agy");
        std::fs::write(
            &script,
            r#"#!/usr/bin/env python3
import sys,os,json,pathlib
assert sys.argv[1:]==['mcp','add','niuma-agent','niuma-agent','mcp']
assert os.environ['NIUMA_GROUP_ID']=='group-fixture'
assert os.environ['NIUMA_ACTOR_ID']=='actor-fixture'
root=pathlib.Path(os.environ['HOME']);path=root/'.gemini/config/mcp_config.json'
path.parent.mkdir(parents=True,exist_ok=True)
path.write_text(json.dumps({'mcpServers':{'niuma-agent':{'command':'niuma-agent','args':['mcp']}}}))
(root/'selected-invoked').touch()
"#,
        )
        .expect("CLI fixture");
        std::fs::set_permissions(&script, std::fs::Permissions::from_mode(0o700))
            .expect("executable");
        let default_cli = temp.path().join("agy");
        std::fs::write(&default_cli, b"#!/bin/sh\nexit 99\n").expect("unused default CLI");
        std::fs::set_permissions(&default_cli, std::fs::Permissions::from_mode(0o700))
            .expect("default executable");
        let search_path = std::env::join_paths(std::iter::once(temp.path().to_path_buf()).chain(
            std::env::split_paths(&std::env::var_os("PATH").expect("test PATH")),
        ))
        .expect("fixture PATH");
        let env = BTreeMap::from([
            ("HOME".into(), provider_home.display().to_string()),
            ("USERPROFILE".into(), provider_home.display().to_string()),
            ("NIUMA_GROUP_ID".into(), "group-fixture".into()),
            ("NIUMA_ACTOR_ID".into(), "actor-fixture".into()),
            ("PATH".into(), search_path.to_string_lossy().into_owned()),
        ]);
        let command = [
            script.display().to_string(),
            "--dangerously-skip-permissions".into(),
        ];
        ensure_antigravity(&command, &cwd, &env, Path::new("/fixture/niuma-agent"))
            .expect("native setup");
        assert!(provider_home.join("selected-invoked").is_file());
        std::fs::remove_file(&script).expect("remove fixture CLI");
        ensure_antigravity(&command, &cwd, &env, Path::new("/fixture/niuma-agent"))
            .expect("ready entry needs no subprocess");
    }

    #[test]
    fn kimi_actor_setup_uses_the_code_config_without_invoking_a_cli() {
        let temp = tempfile::tempdir().expect("tempdir");
        let cwd = temp.path().join("project");
        let config = temp.path().join("kimi-code");
        let home = temp.path().join("niuma-home");
        let env = BTreeMap::from([
            ("KIMI_CODE_HOME".into(), config.display().to_string()),
            ("NIUMA_HOME".into(), home.display().to_string()),
            ("PATH".into(), String::new()),
        ]);
        ensure_persistent(
            ActorRuntime::Kimi,
            &cwd,
            &env,
            Path::new("/opt/niuma-agent"),
        )
        .expect("setup without kimi mcp command");
        let config: serde_json::Value =
            niuma_core::fs::read_json(&config.join("mcp.json")).expect("config");
        assert_eq!(
            config["mcpServers"]["niuma-agent"]["command"],
            "/opt/niuma-agent"
        );
        assert_eq!(
            config["mcpServers"]["niuma-agent"]["env"]["NIUMA_HOME"],
            home.display().to_string()
        );
    }

    #[test]
    fn kimi_actor_setup_inherits_the_daemon_environment() {
        const CANARY: &str = "NIUMA_KIMI_SETUP_CANARY";
        if let Some(root) = std::env::var_os(CANARY) {
            let root = std::path::PathBuf::from(root);
            // No HOME/KIMI_CODE_HOME override on the Actor itself.
            let overrides = BTreeMap::from([(
                "NIUMA_HOME".into(),
                root.join("niuma-agent").display().to_string(),
            )]);
            ensure_persistent(
                ActorRuntime::Kimi,
                &root.join("project"),
                &overrides,
                Path::new("/opt/niuma-agent"),
            )
            .expect("inherited Kimi Code home");
            assert!(root.join("kimi-code/mcp.json").is_file());
            return;
        }
        let temp = tempfile::tempdir().expect("tempdir");
        let output = std::process::Command::new(std::env::current_exe().expect("test executable"))
            .args([
                "--exact",
                "ops::runtime_mcp::tests::kimi_actor_setup_inherits_the_daemon_environment",
                "--nocapture",
            ])
            .env(CANARY, temp.path())
            .env("KIMI_CODE_HOME", temp.path().join("kimi-code"))
            .output()
            .expect("isolated test process");
        assert!(
            output.status.success(),
            "{}\n{}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
    }
}
