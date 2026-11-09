use crate::capabilities::Capability;

pub const SELF_EVOLUTION_CAPABILITY_ID: &str = "skill:niuma-agent:self-evolution";
pub const LEGACY_SELF_EVOLUTION_CAPABILITY_ID: &str =
    "skill:agent_self_proposed:niuma-self-evolution";
pub const DEFAULT_GROUP_CAPABILITY_SEED_VERSION: u64 = 2;

const SELF_EVOLUTION_CAPSULE: &str = include_str!("../../../resources/niuma-self-evolution.md");

/// Always visible to ordinary Actors, whether or not the daemon is reachable.
pub const CORE_TOOL_NAMES: &[&str] = &[
    "niuma_help",
    "niuma_bootstrap",
    "niuma_capability_search",
    "niuma_capability_use",
    "niuma_inbox_read",
    "niuma_message_history",
    "niuma_connect",
    "niuma_message_send",
    "niuma_message_reply",
    "niuma_message_deliver",
    "niuma_reply_request_cancel",
    "niuma_file",
    "niuma_file_send",
    "niuma_context_get",
    "niuma_coordination",
    "niuma_task",
    "niuma_actor_leave",
    "niuma_agent_state",
];

const WEB_MODEL_EXTRA_TOOL_NAMES: &[&str] = &[
    "niuma_capability_state",
    "niuma_capability_enable",
    "niuma_capability_install",
    "niuma_tracked_send",
    "niuma_repo",
    "niuma_presentation",
    "niuma_memory",
    "niuma_runtime_wait_next_turn",
    "niuma_runtime_complete_turn",
    "niuma_code_exec",
    "niuma_code_wait",
    "niuma_repo_edit",
    "niuma_apply_patch",
    "niuma_shell",
    "niuma_exec_command",
    "niuma_write_stdin",
    "niuma_git",
];

pub fn web_model_tool_names() -> impl Iterator<Item = &'static str> {
    CORE_TOOL_NAMES
        .iter()
        .chain(WEB_MODEL_EXTRA_TOOL_NAMES)
        .copied()
}

/// Base exposure only. Enabled capability packs and administrative permissions
/// remain the daemon's responsibility; loss of IPC must not change this profile.
pub fn actor_base_tool_names(
    _actor_id: &str,
    actor: Option<&niuma_contracts::Actor>,
) -> impl Iterator<Item = &'static str> {
    let extra = if actor.is_some_and(|a| a.runtime.is_web_model()) {
        WEB_MODEL_EXTRA_TOOL_NAMES
    } else {
        &[]
    };
    CORE_TOOL_NAMES.iter().chain(extra).copied()
}

/// Discovery and conversation entry point for explicitly enabled native sessions.
pub const LOCAL_SESSION_TOOL_NAMES: &[&str] = &["niuma_session"];

/// Local user-authority MCP sessions need the Group control plane without
/// first mutating capability state. Actor sessions keep the smaller core and
/// opt into these operations through `pack:group-runtime`.
pub const USER_CONTROL_TOOL_NAMES: &[&str] = &["niuma_group", "niuma_actor"];

/// Capability-bound global secretary sessions expose no Actor or user tools.
pub const VOICE_SECRETARY_TASK_TOOL_NAMES: &[&str] = &["niuma_voice_secretary_task"];

pub fn is_builtin_capability_pack_tool(name: &str) -> bool {
    all()
        .iter()
        .any(|capability| capability.tool_names.iter().any(|tool| tool == name))
}

pub fn all() -> Vec<Capability> {
    vec![
        skill(
            SELF_EVOLUTION_CAPABILITY_ID,
            "niuma-self-evolution",
            "Review complete visible 牛马Agent group history and propose confirmed improvements at the prompt, structured-context, workflow, Harness, or optimizer level.",
            SELF_EVOLUTION_CAPSULE,
            &[
                "self-evolution",
                "learning",
                "workflow",
                "harness",
                "optimizer",
                "niuma-glue",
            ],
        ),
        pack(
            "pack:group-runtime",
            "Group + Runtime Operations",
            &[
                "niuma_group",
                "niuma_actor",
                "niuma_runtime_list",
                "niuma_actor_notes",
            ],
            &["group", "actor", "runtime"],
        ),
        pack(
            "pack:file-im",
            "IM Bind",
            &["niuma_im_bind"],
            &["im", "bind"],
        ),
        pack(
            "pack:space",
            "Group Space",
            &["niuma_space"],
            &["space", "notebooklm", "knowledge"],
        ),
        pack(
            "pack:automation",
            "Automation",
            &["niuma_automation"],
            &["automation", "ops"],
        ),
        pack(
            "pack:context-advanced",
            "Extended Context + Delegation",
            &[
                "niuma_tracked_send",
                "niuma_context_sync",
                "niuma_memory",
                "niuma_memory_admin",
            ],
            &["context", "delegation", "memory"],
        ),
        pack(
            "pack:headless-notify",
            "Headless + Notify",
            &["niuma_headless", "niuma_notify"],
            &["headless", "notify"],
        ),
        pack(
            "pack:diagnostics",
            "Workspace Utilities",
            &[
                "niuma_repo",
                "niuma_presentation",
                "niuma_terminal",
                "niuma_debug",
            ],
            &["workspace", "repo", "presentation", "diagnostics"],
        ),
        pack(
            "pack:capability-admin",
            "Capability Admin",
            &[
                "niuma_capability_state",
                "niuma_capability_enable",
                "niuma_capability_install",
                "niuma_capability_import",
                "niuma_capability_block",
                "niuma_capability_uninstall",
            ],
            &["capability", "install", "admin", "governance"],
        ),
    ]
}

fn skill(id: &str, name: &str, description: &str, capsule_text: &str, tags: &[&str]) -> Capability {
    Capability {
        id: id.into(),
        kind: "skill".into(),
        name: name.into(),
        description: description.into(),
        tool_names: Vec::new(),
        tags: tags.iter().map(|value| (*value).into()).collect(),
        capsule_text: capsule_text.trim().into(),
        source: "niuma_builtin".into(),
        source_uri: String::new(),
        qualification_status: "qualified".into(),
        enable_supported: true,
    }
}

fn pack(id: &str, title: &str, tools: &[&str], tags: &[&str]) -> Capability {
    Capability {
        id: id.into(),
        kind: "pack".into(),
        name: title.into(),
        description: format!("Built-in 牛马Agent capability pack: {title}."),
        tool_names: tools.iter().map(|value| (*value).into()).collect(),
        tags: tags.iter().map(|value| (*value).into()).collect(),
        capsule_text: String::new(),
        source: "niuma_builtin".into(),
        source_uri: String::new(),
        qualification_status: "qualified".into(),
        enable_supported: true,
    }
}
