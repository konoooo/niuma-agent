use niuma_contracts::{ActorModelConfig, ActorRuntime, DaemonRequest};
use niuma_core::{GroupStore, HomeLayout};
use serde_json::{Value, json};
use std::collections::BTreeMap;
use std::io;
use std::path::{Path, PathBuf};

use crate::dispatch::{OpError, OpResult, object, required_arg};

pub(super) fn normalized(
    config: Option<&ActorModelConfig>,
    runtime: ActorRuntime,
) -> Option<ActorModelConfig> {
    config
        .filter(|value| {
            value.runtime == runtime
                && (!value.model.is_empty() || !value.reasoning_effort.is_empty())
        })
        .cloned()
}

pub(super) fn previous(
    home: &HomeLayout,
    group: &str,
    actor: &str,
) -> io::Result<Option<ActorModelConfig>> {
    let receipt = super::runtime_session::snapshot(home, group, actor)?;
    receipt
        .and_then(|value| value.get("applied_model_config").cloned())
        .filter(|value| !value.is_null())
        .map(serde_json::from_value)
        .transpose()
        .map_err(io::Error::other)
}

pub(super) fn record(
    home: &HomeLayout,
    group: &str,
    actor: &str,
    config: Option<&ActorModelConfig>,
    parent: Option<&str>,
) -> io::Result<()> {
    let Some(mut receipt) = super::runtime_session::snapshot(home, group, actor)? else {
        return Ok(());
    };
    receipt.insert("applied_model_config".into(), json!(config));
    if let Some(parent) = parent {
        receipt.insert("continued_from_session_id".into(), json!(parent));
    }
    super::runtime_session::restore_snapshot(home, group, actor, Some(&receipt))
}

pub(super) fn list(home: &HomeLayout, request: &DaemonRequest) -> OpResult {
    let group_id = required_arg(request, "group_id")?;
    let actor_id = required_arg(request, "actor_id")?;
    let group = GroupStore::new(home.clone())
        .map_err(OpError::io)?
        .load(&group_id)
        .map_err(OpError::not_found)?;
    let actor = group
        .actors
        .iter()
        .find(|actor| actor.id == actor_id)
        .ok_or_else(|| OpError::new("actor_not_found", "成员不存在"))?;
    let actor = super::actor_profile_runtime::resolve(home, actor)?;
    if actor.runtime == ActorRuntime::Claude {
        // 原生 CLI 的稳定模型别名；实际账号权限和自定义模型仍由 CLI 校验。
        let models = ["opus", "sonnet", "haiku"].map(|id| json!({"id":id,"name":id,"reasoning_efforts":["low","medium","high","xhigh","max"]}));
        return object(json!({"available":true,"source":"aliases","models":models}));
    }
    let mut models = super::local_headless::model_catalog(&group_id, &actor_id).unwrap_or_default();
    let mut source = "runtime";
    if models.is_empty() && actor.runtime == ActorRuntime::Codex {
        let environment = super::actor_secrets::effective_values(home, &group_id, &actor)?;
        if let Ok(cwd) = super::actor_runtime::working_directory(&group, &actor) {
            models = cached_codex_models(&environment, &cwd);
            source = "cache";
        }
    }
    object(
        json!({"available":!models.is_empty(),"source":if models.is_empty(){"unavailable"}else{source},"models":models}),
    )
}

fn cached_codex_models(environment: &BTreeMap<String, String>, cwd: &Path) -> Vec<Value> {
    let env = |key: &str| {
        environment
            .get(key)
            .cloned()
            .or_else(|| std::env::var(key).ok())
            .filter(|value| !value.trim().is_empty())
    };
    let root = env("CODEX_HOME").map(PathBuf::from).or_else(|| {
        env("HOME")
            .or_else(|| env("USERPROFILE"))
            .map(|home| PathBuf::from(home).join(".codex"))
    });
    let Some(root) = root else { return Vec::new() };
    let root = if root.is_absolute() {
        root
    } else {
        cwd.join(root)
    };
    let path = root.join("models_cache.json");
    if !std::fs::metadata(&path)
        .is_ok_and(|metadata| metadata.is_file() && metadata.len() <= 4 * 1024 * 1024)
    {
        return Vec::new();
    }
    let Ok(cache) = niuma_core::fs::read_json::<Value>(&path) else {
        return Vec::new();
    };
    cache["models"].as_array().map(|models| models.iter().filter(|model| model["visibility"] == "list").filter_map(|model| {
        let id = model["slug"].as_str()?;
        let efforts = model["supported_reasoning_levels"].as_array().map(|levels| levels.iter().filter_map(|level| level["effort"].as_str()).collect::<Vec<_>>()).unwrap_or_default();
        Some(json!({"id":id,"name":model["display_name"].as_str().unwrap_or(id),"reasoning_efforts":efforts}))
    }).collect()).unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn stopped_member_catalog_uses_only_its_own_visible_cached_models() {
        let temp = tempfile::tempdir().unwrap();
        std::fs::write(temp.path().join("models_cache.json"), json!({"identity":"不能出现在响应中","models":[
            {"slug":"native-model","display_name":"原生模型","visibility":"list","supported_reasoning_levels":[{"effort":"low"},{"effort":"max"},{"effort":"ultra"}]},
            {"slug":"hidden-model","visibility":"hide"}
        ]}).to_string()).unwrap();
        let environment = BTreeMap::from([(
            "CODEX_HOME".into(),
            temp.path().to_string_lossy().into_owned(),
        )]);
        assert_eq!(
            cached_codex_models(&environment, temp.path()),
            vec![
                json!({"id":"native-model","name":"原生模型","reasoning_efforts":["low","max","ultra"]})
            ]
        );
    }
}
