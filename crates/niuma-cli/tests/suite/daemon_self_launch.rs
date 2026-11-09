// Included by the crate-level integration test harness.
use fs2::FileExt;
use std::fs::OpenOptions;
use std::path::Path;
use std::process::{Command, Output, Stdio};
use std::time::{Duration, Instant};

#[test]
fn installed_cli_starts_daemon_without_a_sibling_daemon_binary() {
    let temp = tempfile::tempdir().expect("tempdir");
    let bin_dir = temp.path().join("bin");
    std::fs::create_dir(&bin_dir).expect("create bin dir");

    let installed = bin_dir.join(executable_name("niuma-agent"));
    std::fs::copy(env!("CARGO_BIN_EXE_niuma-agent"), &installed).expect("copy niuma-agent");

    // A decoy catches regressions to the old sibling `niumad start` contract.
    let decoy = bin_dir.join(executable_name("niumad"));
    std::fs::copy(env!("CARGO_BIN_EXE_niuma-agent"), decoy).expect("copy decoy niumad");

    let home = temp.path().join("home");
    let start = run(&installed, &home, &["daemon", "start"]);
    if !start.status.success() {
        panic!("daemon start failed: {}", detail(&start));
    }

    let status = run(&installed, &home, &["daemon", "status"]);
    let stop = run(&installed, &home, &["daemon", "stop"]);
    wait_for_daemon_exit(&home);

    assert!(
        status.status.success(),
        "daemon status failed: {}",
        detail(&status)
    );
    assert!(
        stop.status.success(),
        "daemon stop failed: {}",
        detail(&stop)
    );
    assert_daemon_lock_released(&home);
}

#[test]
fn daemon_stop_waits_for_the_combined_web_process_to_exit() {
    let temp = tempfile::tempdir().expect("tempdir");
    let installed = temp.path().join(executable_name("niuma-agent"));
    std::fs::copy(env!("CARGO_BIN_EXE_niuma-agent"), &installed).expect("copy niuma-agent");
    let home = temp.path().join("home");
    let mut web = Command::new(&installed)
        .args(["--host", "127.0.0.1", "--port", "0"])
        .env("NIUMA_HOME", &home)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("start combined 牛马Agent");

    wait_for_combined_web_start(&home, &mut web);
    let stop = run(&installed, &home, &["daemon", "stop"]);
    if !stop.status.success() {
        // Recover the combined process output so CI failures show which
        // shutdown stage hung instead of only the CLI timeout.
        let _ = web.kill();
        let output = web
            .wait_with_output()
            .expect("collect combined 牛马Agent output");
        panic!(
            "daemon stop failed: {} combined 牛马Agent output: {}",
            detail(&stop),
            detail(&output)
        );
    }
    assert!(
        web.try_wait().expect("combined 牛马Agent status").is_some(),
        "daemon stop returned before the combined Web process exited"
    );
    let output = web
        .wait_with_output()
        .expect("collect combined 牛马Agent output");
    assert!(
        output.status.success(),
        "combined 牛马Agent failed: {}",
        detail(&output)
    );
    assert_daemon_lock_released(&home);
    assert_web_lock_released(&home);
}

#[test]
fn combined_web_bind_failure_stops_its_owned_daemon() {
    let temp = tempfile::tempdir().expect("tempdir");
    let installed = temp.path().join(executable_name("niuma-agent"));
    std::fs::copy(env!("CARGO_BIN_EXE_niuma-agent"), &installed).expect("copy niuma-agent");
    let home = temp.path().join("home");
    let occupied = std::net::TcpListener::bind(("127.0.0.1", 0)).expect("occupy Web port");
    let port = occupied.local_addr().expect("occupied address").port();

    let output = run(
        &installed,
        &home,
        &["--host", "127.0.0.1", "--port", &port.to_string()],
    );

    assert!(
        !output.status.success(),
        "combined 牛马Agent unexpectedly served an occupied port: {}",
        detail(&output)
    );
    wait_for_daemon_exit(&home);
    assert_daemon_lock_released(&home);
    assert_web_lock_released(&home);
}

fn assert_daemon_lock_released(home: &Path) {
    let lock_path = home.join("daemon").join("niumad.lock");
    let lock = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .truncate(false)
        .open(&lock_path)
        .expect("open daemon lock");
    lock.try_lock_exclusive().unwrap_or_else(|error| {
        panic!(
            "daemon stop returned before releasing {}: {error}",
            lock_path.display()
        )
    });
    FileExt::unlock(&lock).expect("release daemon lock probe");
}

fn assert_web_lock_released(home: &Path) {
    let lock_path = home.join("daemon").join("niuma-web.lock");
    let lock = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .truncate(false)
        .open(&lock_path)
        .expect("open Web lock");
    lock.try_lock_exclusive().unwrap_or_else(|error| {
        panic!(
            "daemon stop returned before releasing {}: {error}",
            lock_path.display()
        )
    });
    FileExt::unlock(&lock).expect("release Web lock probe");
}

fn executable_name(stem: &str) -> String {
    if cfg!(windows) {
        format!("{stem}.exe")
    } else {
        stem.to_owned()
    }
}

fn run(executable: &Path, home: &Path, args: &[&str]) -> Output {
    Command::new(executable)
        .args(args)
        .env("NIUMA_HOME", home)
        .output()
        .expect("run installed niuma-agent")
}

fn wait_for_daemon_exit(home: &Path) {
    let address = home.join("daemon").join("niumad.addr.json");
    let deadline = Instant::now() + Duration::from_secs(10);
    while address.exists() && Instant::now() < deadline {
        std::thread::sleep(Duration::from_millis(50));
    }
    assert!(
        !address.exists(),
        "daemon did not remove {}",
        address.display()
    );
}

fn wait_for_combined_web_start(home: &Path, web: &mut std::process::Child) {
    let runtime_path = home.join("daemon").join("web_runtime.json");
    let deadline = Instant::now() + Duration::from_secs(30);
    loop {
        if let Some(web_status) = web.try_wait().expect("combined 牛马Agent status") {
            panic!("combined 牛马Agent exited before Web startup: {web_status}");
        }
        // Daemon IPC becomes available before its combined Web owner has
        // finished startup. Test shutdown of a listening Web, not that race.
        if let Ok(bytes) = std::fs::read(&runtime_path)
            && let Ok(runtime) = serde_json::from_slice::<serde_json::Value>(&bytes)
            && runtime["pid"].as_u64() == Some(u64::from(web.id()))
            && let Some(port) = runtime["port"]
                .as_u64()
                .and_then(|port| u16::try_from(port).ok())
            && std::net::TcpStream::connect_timeout(
                &std::net::SocketAddr::from(([127, 0, 0, 1], port)),
                Duration::from_millis(100),
            )
            .is_ok()
        {
            return;
        }
        assert!(
            Instant::now() < deadline,
            "combined 牛马Agent Web did not start within 30 seconds"
        );
        std::thread::sleep(Duration::from_millis(100));
    }
}

fn detail(output: &Output) -> String {
    format!(
        "status={} stdout={} stderr={}",
        output.status,
        String::from_utf8_lossy(&output.stdout).trim(),
        String::from_utf8_lossy(&output.stderr).trim()
    )
}
