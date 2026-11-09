use serde::{Deserialize, Serialize};

/// 成员是否可承接普通工作，与其运行进程是否开启独立。
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "snake_case")]
pub enum ActorAvailability {
    #[default]
    Available,
    Handoff,
    Away,
    Returning,
}

impl ActorAvailability {
    pub const fn is_available(&self) -> bool {
        matches!(self, Self::Available)
    }
    pub const fn may_run(&self) -> bool {
        !matches!(self, Self::Away)
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ActorLeaveStatus {
    Preparing,
    Assigning,
    Accepting,
    Finalizing,
    Away,
    Returning,
    Returned,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ActorLeaveTask {
    pub task_id: String,
    pub title: String,
    pub revision: u64,
    #[serde(default)]
    pub to: String,
    #[serde(default)]
    pub to_generation: String,
    #[serde(default)]
    pub assignment_id: String,
    #[serde(default)]
    pub accepted_at: Option<String>,
    #[serde(default)]
    pub transferred: bool,
    #[serde(default)]
    pub closed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ActorLeave {
    #[serde(default)]
    pub revision: u64,
    pub id: String,
    pub actor_id: String,
    pub actor_generation: String,
    pub manager_id: String,
    pub manager_generation: String,
    pub status: ActorLeaveStatus,
    pub immediate: bool,
    pub summary: String,
    pub summary_by: String,
    pub tasks: Vec<ActorLeaveTask>,
    pub requested_at: String,
    pub updated_at: String,
    #[serde(default)]
    pub last_error: String,
    #[serde(default)]
    pub recall_summary: String,
    #[serde(default)]
    pub notify_attempt: u64,
}

impl ActorLeave {
    pub const fn is_handing_off(&self) -> bool {
        matches!(
            self.status,
            ActorLeaveStatus::Preparing
                | ActorLeaveStatus::Assigning
                | ActorLeaveStatus::Accepting
                | ActorLeaveStatus::Finalizing
        )
    }
    pub fn all_accepted(&self) -> bool {
        !self.summary.trim().is_empty()
            && self.tasks.iter().all(|task| {
                task.closed
                    || task.transferred
                    || (!task.to.is_empty() && task.accepted_at.is_some())
            })
    }
}
