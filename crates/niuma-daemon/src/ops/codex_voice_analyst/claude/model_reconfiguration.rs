use super::command::PreparedClaude;
use niuma_contracts::ActorModelConfig;
use serde_json::Value;
use std::collections::HashSet;
use std::io::{self, BufRead};
use std::path::Path;

/// 覆盖项只进入该成员的启动参数，不写用户全局的模型或强度设置。
pub(in crate::ops::codex_voice_analyst) fn apply(
    prepared: &mut PreparedClaude,
    config: Option<&ActorModelConfig>,
    changed: bool,
) {
    prepared.reconfigure = changed;
    let Some(config) = config else { return };
    for (flags, value) in [
        (["--model", "-m"], config.model.as_str()),
        (["--effort", "--effort"], config.reasoning_effort.as_str()),
    ] {
        if value.is_empty() {
            continue;
        }
        let mut skip = false;
        prepared.arguments.retain(|argument| {
            if skip {
                skip = false;
                return false;
            }
            if flags.contains(&argument.as_str()) {
                skip = true;
                return false;
            }
            !flags
                .iter()
                .any(|flag| argument.starts_with(&format!("{flag}=")))
        });
        prepared.arguments.extend([flags[0].into(), value.into()]);
    }
}

/// 只接纳原生 CLI 明确确认的、由指定旧会话续接的副本。
pub(super) fn confirmed_copy(parent: &str, child: &str, output: &str) -> bool {
    parent != child
        && parent.len() >= 8
        && child.len() >= 8
        && output.contains(&format!("background session {}", &parent[..8]))
        && output.contains(&format!("copy as {}", &child[..8]))
}

pub(super) fn inherited_uuids(config_dir: &Path, session_id: &str) -> io::Result<HashSet<String>> {
    let path = super::transcript_path::find(config_dir, session_id)?.ok_or_else(|| {
        io::Error::new(
            io::ErrorKind::NotFound,
            "切换模型前找不到原会话历史，已保留原会话",
        )
    })?;
    let metadata = std::fs::symlink_metadata(&path)?;
    if !metadata.is_file()
        || metadata.file_type().is_symlink()
        || metadata.len() > 128 * 1024 * 1024
    {
        return Err(io::Error::other("原会话历史未通过文件校验"));
    }
    let canonical = path.canonicalize()?;
    if !canonical.starts_with(config_dir.join("projects").canonicalize()?) {
        return Err(io::Error::other("原会话历史超出会话目录"));
    }
    let mut ids = HashSet::new();
    for line in io::BufReader::new(std::fs::File::open(canonical)?).lines() {
        let line = line?;
        if line.len() > super::MAX_TRANSCRIPT_LINE_BYTES {
            return Err(io::Error::other("原会话历史单行超出限制"));
        }
        let value: Value = serde_json::from_str(&line).map_err(io::Error::other)?;
        if let Some(id) = value["uuid"].as_str() {
            ids.insert(id.to_owned());
        }
    }
    Ok(ids)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn model_change_accepts_only_the_explicitly_confirmed_parent_and_child() {
        let parent = "12345678-0000-0000-0000-000000000000";
        let child = "87654321-0000-0000-0000-000000000000";
        let output = "note: background session 12345678 keeps its own saved options, so the flags you passed started a copy as 87654321.";
        assert!(confirmed_copy(parent, child, output));
        assert!(!confirmed_copy(child, parent, output));
        assert!(!confirmed_copy(parent, child, "backgrounded · 87654321"));
    }
}
