use super::*;
use std::path::PathBuf;

fn path(home: &HomeLayout, gid: &str, id: &str) -> Result<PathBuf, OpError> {
    Ok(store(home)?
        .state_dir(gid)
        .map_err(OpError::io)?
        .join("actor_leave_sessions")
        .join(format!("{id}.json")))
}
fn safe_receipt(value: serde_json::Map<String, Value>) -> serde_json::Map<String, Value> {
    const FIELDS: &[&str] = &[
        "v",
        "kind",
        "group_id",
        "actor_id",
        "runtime",
        "transport",
        "workspace_path",
        "command_fingerprint",
        "identity_fingerprint",
        "provider_thread_id",
        "provider_session_id",
        "model",
        "status",
        "resume_eligible",
        "captured_from",
        "last_seen_at",
        "last_resume_attempt_at",
        "last_resume_attempt_id",
        "failure_count",
        "updated_at",
        "applied_model_config",
        "continued_from_session_id",
    ];
    value
        .into_iter()
        .filter(|(key, _)| FIELDS.contains(&key.as_str()))
        .collect()
}
pub(super) fn capture(home: &HomeLayout, gid: &str, record: &ActorLeave) -> Result<(), OpError> {
    let file = path(home, gid, &record.id)?;
    if file.exists() {
        return Ok(());
    }
    let receipt = super::super::runtime_session::snapshot(home, gid, &record.actor_id)
        .map_err(OpError::io)?
        .map(safe_receipt);
    std::fs::create_dir_all(file.parent().unwrap()).map_err(OpError::io)?;
    cccc_core::fs::write_secret_json(
        &file,
        &json!({"actor_generation":record.actor_generation,"receipt":receipt}),
    )
    .map_err(OpError::io)
}
pub(super) fn verify(home: &HomeLayout, gid: &str, record: &ActorLeave) -> Result<(), OpError> {
    let file = path(home, gid, &record.id)?;
    let backup: Value = cccc_core::fs::read_json(&file).map_err(OpError::io)?;
    if backup["actor_generation"] != record.actor_generation {
        return Err(OpError::new("leave_session_changed", "离岗会话身份已变化"));
    }
    let current = super::super::runtime_session::snapshot(home, gid, &record.actor_id)
        .map_err(OpError::io)?;
    if let Some(saved) = backup["receipt"].as_object() {
        let retained = current.as_ref().is_some_and(|current| {
            super::super::group_rest::same_history(
                current,
                &super::super::group_rest::identity(saved),
            )
        });
        if !retained {
            // 新空白会话尚未收到输入；先停止，再恢复旧会话指针供排查或重试。
            let group = store(home)?.load(gid).map_err(OpError::io)?;
            super::coordination::stop(home, &group, &record.actor_id)?;
            super::super::runtime_session::restore_snapshot(
                home,
                gid,
                &record.actor_id,
                Some(saved),
            )
            .map_err(OpError::io)?;
            return Err(OpError::new(
                "leave_session_changed",
                "原会话或运行配置已变化，已保留原历史；请恢复原设置后继续协调",
            ));
        }
    }
    if let Some(current) = current {
        cccc_core::fs::write_secret_json(
            &file,
            &json!({"actor_generation":record.actor_generation,"receipt":safe_receipt(current)}),
        )
        .map_err(OpError::io)?;
    }
    Ok(())
}
