use super::{
    LockState, command_line_is_niuma_daemon_host, lock_path, probe_lock,
    unresponsive_daemon_report, wait_for_lock_release,
};
use fs2::FileExt;
use niuma_core::HomeLayout;
use std::fs::{File, OpenOptions};
use std::time::Duration;

fn home() -> (tempfile::TempDir, HomeLayout) {
    let temp = tempfile::tempdir().expect("tempdir");
    let home = HomeLayout::from_path(temp.path().join("home")).expect("home");
    home.initialize().expect("initialize home");
    (temp, home)
}

fn hold_lock(home: &HomeLayout) -> File {
    let lock = OpenOptions::new()
        .create(true)
        .truncate(false)
        .read(true)
        .write(true)
        .open(lock_path(home))
        .expect("open lock");
    lock.try_lock_exclusive().expect("hold lock");
    lock
}

#[test]
fn an_unheld_lock_reads_as_free_and_stays_available() {
    let (_temp, home) = home();
    assert_eq!(probe_lock(&home).expect("probe"), LockState::Free);
    assert_eq!(probe_lock(&home).expect("probe again"), LockState::Free);
}

#[test]
fn a_held_lock_reads_as_held_until_it_is_released() {
    let (_temp, home) = home();
    let lock = hold_lock(&home);
    assert_eq!(probe_lock(&home).expect("probe"), LockState::Held);
    FileExt::unlock(&lock).expect("release lock");
    assert_eq!(
        probe_lock(&home).expect("probe after release"),
        LockState::Free
    );
}

#[tokio::test]
async fn waiting_reports_a_lock_that_is_never_released() {
    let (_temp, home) = home();
    let _lock = hold_lock(&home);
    let error = wait_for_lock_release(&home, Duration::from_millis(150))
        .await
        .expect_err("a held lock must be reported, not waited on forever");
    assert!(
        format!("{error:#}").contains("did not release"),
        "{error:#}"
    );
}

#[tokio::test]
async fn waiting_returns_once_the_lock_is_released() {
    let (_temp, home) = home();
    let held_lock = hold_lock(&home);

    let waiter_home = home.clone();
    let waiter =
        tokio::spawn(
            async move { wait_for_lock_release(&waiter_home, Duration::from_secs(2)).await },
        );
    tokio::time::sleep(Duration::from_millis(150)).await;
    assert!(
        !waiter.is_finished(),
        "the wait returned while the daemon lock was still held"
    );

    FileExt::unlock(&held_lock).expect("release held daemon lock");
    tokio::time::timeout(Duration::from_secs(1), waiter)
        .await
        .expect("waiter timeout")
        .expect("waiter task")
        .expect("lock release detected");
}

#[test]
fn every_niuma_daemon_host_command_line_is_a_takeover_target() {
    for command in [
        "/Users/dev/.local/bin/niuma-agent daemon run",
        "niuma-agent daemon run",
        // The Unix Web host embeds the daemon and writes its own PID.
        "/Users/dev/.local/bin/niuma-agent",
        "/Users/dev/.local/bin/niuma-agent web",
        "niuma-agent web --exhibit",
        "niuma-agent --port 8080",
        "niuma-agent --web-port=8080 --web-host=127.0.0.1 web --exhibit",
        "niuma-agent --host localhost daemon run --port 8080",
        "target/debug/niuma-agent --host 0.0.0.0 web",
        // Windows publishes a quoted executable path.
        r#""C:\Program Files\牛马Agent\niuma-agent.exe" daemon run"#,
        "牛马Agent.EXE daemon run",
    ] {
        assert!(command_line_is_niuma_daemon_host(command), "{command}");
    }
}

#[test]
fn nothing_else_is_a_takeover_target() {
    for command in [
        "/Users/dev/.local/bin/niuma-agent mcp",
        "niuma-agent --port 8080 mcp",
        "niuma-agent daemon stop",
        "niuma-agent daemon status",
        "niuma-agent version",
        "niuma-agent --port 8080 version",
        "niuma-agent --host localhost im status",
        "niuma-agent --web-port=8080 daemon stop",
        "niuma-agent --port 8080 --help",
        "niuma-agent web --help",
        "niuma-agent --unknown web",
        "niuma-agent --port invalid web",
        "niuma-agent --host 'unterminated",
        "/usr/bin/tail -f niuma-agent daemon run",
        "/usr/bin/python3 server.py",
        r#""C:\unterminated\niuma-agent.exe daemon run"#,
        "",
    ] {
        assert!(!command_line_is_niuma_daemon_host(command), "{command}");
    }
}

#[test]
fn the_unresponsive_report_admits_it_cannot_tell_busy_from_stuck() {
    let (_temp, home) = home();
    let report = unresponsive_daemon_report(&home, Some(4242));
    assert!(report.contains("PID 4242"), "{report}");
    assert!(report.contains("niumad.lock"), "{report}");
    assert!(report.contains("busy"), "{report}");
    assert!(report.contains("stuck"), "{report}");
    assert!(unresponsive_daemon_report(&home, None).contains("unknown PID"));
}
