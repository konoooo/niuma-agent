//! 需求记录与团队任务的归属。子任务沿用最近父任务的需求归属。

use crate::context::ContextDoc;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use std::collections::BTreeMap;
use std::io;

pub const RECORDS: &str = "requirement_records";

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum RequirementSource {
    Chat {
        event_id: String,
    },
    Obsidian {
        vault: String,
        path: String,
        heading: Option<String>,
        version: String,
    },
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct RequirementAcceptance {
    pub by: String,
    pub at: String,
    pub note: String,
    pub tasks: Vec<(String, u64)>,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct Requirement {
    pub id: String,
    pub rev: u64,
    pub title: String,
    pub description: String,
    pub source: RequirementSource,
    #[serde(default)]
    pub source_group_id: String,
    pub priority: String,
    pub acceptance_criteria: String,
    pub technical_owner: String,
    pub technical_owner_generation: String,
    pub approved: bool,
    pub acceptance: Option<RequirementAcceptance>,
    #[serde(default)]
    pub breakdown_requests: BTreeMap<String, String>,
    pub updated_at: String,
}

pub fn records(doc: &ContextDoc) -> io::Result<Vec<Requirement>> {
    doc.coordination
        .get(RECORDS)
        .map(|records| serde_json::from_value(records.clone()).map_err(io::Error::other))
        .unwrap_or_else(|| Ok(Vec::new()))
}

pub(crate) fn save(doc: &mut ContextDoc, operation: &Map<String, Value>) -> io::Result<()> {
    let requirement: Requirement = serde_json::from_value(
        operation
            .get("requirement")
            .cloned()
            .ok_or_else(|| io::Error::other("缺少需求记录"))?,
    )
    .map_err(io::Error::other)?;
    let mut records = records(doc)?;
    if let Some(previous) = records
        .iter_mut()
        .find(|record| record.id == requirement.id)
    {
        *previous = requirement;
    } else {
        records.push(requirement);
    }
    doc.coordination.insert(
        RECORDS.into(),
        serde_json::to_value(records).map_err(io::Error::other)?,
    );
    Ok(())
}

pub fn task_groups(doc: &ContextDoc) -> BTreeMap<&str, Vec<&Map<String, Value>>> {
    let by_id = doc
        .tasks
        .iter()
        .filter_map(|task| Some((task.get("id")?.as_str()?, task)))
        .collect::<BTreeMap<_, _>>();
    let mut groups = BTreeMap::<&str, Vec<&Map<String, Value>>>::new();
    for task in &doc.tasks {
        let mut current = Some(task);
        // 限制遍历深度，兼容以前手工写入的任务数据。
        for _ in 0..doc.tasks.len() {
            let Some(item) = current else {
                break;
            };
            if let Some(id) = item
                .get("requirement_id")
                .and_then(Value::as_str)
                .filter(|id| !id.is_empty())
            {
                groups.entry(id).or_default().push(task);
                break;
            }
            current = item
                .get("parent_id")
                .and_then(Value::as_str)
                .and_then(|id| by_id.get(id).copied());
        }
    }
    groups
}

pub fn completed(task: &Map<String, Value>) -> bool {
    let status = task.get("status").and_then(Value::as_str);
    status == Some("done")
        || (status == Some("archived")
            && task.get("archived_from").and_then(Value::as_str) == Some("done"))
}

pub fn task_revisions(tasks: &[&Map<String, Value>]) -> Vec<(String, u64)> {
    let mut revisions = tasks
        .iter()
        .filter_map(|task| {
            Some((
                task.get("id")?.as_str()?.to_owned(),
                task.get("rev").and_then(Value::as_u64).unwrap_or_default(),
            ))
        })
        .collect::<Vec<_>>();
    revisions.sort_unstable();
    revisions
}

pub fn status(requirement: &Requirement, tasks: &[&Map<String, Value>]) -> &'static str {
    if !requirement.approved {
        return "intake";
    }
    if tasks.is_empty() {
        return "awaiting_breakdown";
    }
    if tasks.iter().all(|task| completed(task)) {
        return if requirement
            .acceptance
            .as_ref()
            .is_some_and(|receipt| receipt.tasks == task_revisions(tasks))
        {
            "done"
        } else {
            "awaiting_acceptance"
        };
    }
    if tasks
        .iter()
        .all(|task| task.get("status").and_then(Value::as_str) == Some("planned"))
    {
        "planned"
    } else {
        "active"
    }
}
