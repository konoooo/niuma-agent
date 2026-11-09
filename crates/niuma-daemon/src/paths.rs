use niuma_core::HomeLayout;
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct DaemonPaths {
    pub home: HomeLayout,
    pub daemon_dir: PathBuf,
    pub socket: PathBuf,
    pub address: PathBuf,
    pub pid: PathBuf,
    pub log: PathBuf,
    pub lock: PathBuf,
}

impl DaemonPaths {
    #[must_use]
    pub fn new(home: HomeLayout) -> Self {
        let daemon_dir = home.daemon_dir();
        Self {
            home,
            socket: daemon_dir.join("niumad.sock"),
            address: daemon_dir.join("niumad.addr.json"),
            pid: daemon_dir.join("niumad.pid"),
            log: daemon_dir.join("niumad.log"),
            lock: daemon_dir.join("niumad.lock"),
            daemon_dir,
        }
    }
}
