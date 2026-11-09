use super::operation::{
    Operation,
    Policy::{Read, Write},
};
use crate::dispatch::{OpError, OpResult, object, required_arg, string_arg};
use niuma_contracts::{Actor, ActorRole, DaemonRequest, Event, GroupState, utc_now};
use niuma_core::requirements::{self, Requirement, RequirementAcceptance, RequirementSource};
use niuma_core::{
    GroupDoc, HomeLayout, actors,
    context::{ContextDoc, ContextStore},
    ledger,
};
use serde_json::{Map, Value, json};
use sha2::{Digest, Sha256};

mod obsidian;

pub(super) fn resolve_operation(request: &DaemonRequest) -> Option<Operation> {
    if request.op != "requirement" {
        return None;
    }
    let action = string_arg(request, "action").unwrap_or_else(|| "list".into());
    let policy = if matches!(
        action.as_str(),
        "list" | "get" | "preview_source" | "read_source"
    ) {
        Read
    } else {
        Write
    };
    Some(Operation::new(policy, run))
}

struct Board<'a> {
    home: &'a HomeLayout,
    group: GroupDoc,
    store: ContextStore,
    doc: ContextDoc,
    records: Vec<Requirement>,
}

impl Board<'_> {
    fn detail(&self, record: &Requirement) -> OpResult {
        detail(&self.doc, record, self.store.tasks_version(&self.doc))
    }

    fn persist(
        &self,
        record: Option<&Requirement>,
        mut ops: Vec<Map<String, Value>>,
        by: &str,
    ) -> Result<niuma_core::context::ContextSyncResult, OpError> {
        if let Some(record) = record {
            ops.insert(
                0,
                map(json!({"op":"requirement.save","requirement":record})),
            );
        }
        let version = self.store.version(&self.doc).map_err(OpError::io)?;
        let result = self
            .store
            .sync(&self.group.group_id, &ops, Some(&version), by, false)
            .map_err(OpError::invalid)?;
        super::context::publish_sync(self.home, &self.group.group_id, by, &result)?;
        announce_task_changes(self.home, &self.group, &self.doc, &result.context, by);
        Ok(result)
    }

    fn save(&self, record: &Requirement, by: &str) -> OpResult {
        let result = self.persist(Some(record), Vec::new(), by)?;
        detail(
            &result.context,
            record,
            self.store.tasks_version(&result.context),
        )
    }

    fn new_record(
        &self,
        title: String,
        description: String,
        source: RequirementSource,
    ) -> Requirement {
        let next = self
            .records
            .iter()
            .filter_map(|record| record.id.strip_prefix('R')?.parse::<u64>().ok())
            .max()
            .unwrap_or_default()
            + 1;
        Requirement {
            id: format!("R{next:03}"),
            rev: 1,
            title,
            description,
            source,
            source_group_id: self.group.group_id.clone(),
            priority: "normal".into(),
            acceptance_criteria: String::new(),
            technical_owner: String::new(),
            technical_owner_generation: String::new(),
            approved: false,
            acceptance: None,
            breakdown_requests: Default::default(),
            updated_at: utc_now(),
        }
    }
}

fn run(home: &HomeLayout, request: &DaemonRequest) -> OpResult {
    let group = super::context::load_group(home, &required_arg(request, "group_id")?)?;
    let by = string_arg(request, "by").unwrap_or_else(|| "user".into());
    let actor = actors::visible(&group).find(|actor| actor.id == by);
    if by != "user" && actor.is_none() {
        return Err(denied("请用本组成员身份操作需求"));
    }
    let store = ContextStore::new(home.clone()).map_err(OpError::io)?;
    let doc = store.load(&group.group_id).map_err(OpError::io)?;
    let records = requirements::records(&doc).map_err(OpError::io)?;
    let board = Board {
        home,
        group,
        store,
        doc,
        records,
    };
    let action = string_arg(request, "action").unwrap_or_else(|| "list".into());
    match action.as_str() {
        "list" => return list(&board, request),
        "issue" => {
            require_user(&by)?;
            return issue(&board, request);
        }
        "capture" => {
            require_manager(&board.group, &by)?;
            let event = super::messaging::find_event(
                home,
                &board.group.group_id,
                &required_arg(request, "event_id")?,
            )?;
            return capture(&board, &event, &by);
        }
        "preview_source" | "import_source" => {
            require_user(&by)?;
            let selection = obsidian::preview(
                &required_arg(request, "note_path")?,
                string_arg(request, "heading").as_deref(),
            )?;
            let existing = board
                .records
                .iter()
                .find(|record| obsidian::same_note(&record.source, &selection.source));
            if action == "preview_source" {
                return source_preview(&selection, existing);
            }
            return apply_source(&board, existing, selection, request, &by);
        }
        _ => {}
    }
    let id = required_arg(request, "requirement_id")?;
    let record = board
        .records
        .iter()
        .find(|record| record.id == id)
        .ok_or_else(|| OpError::new("requirement_not_found", "需求已不存在"))?;
    if action == "get" {
        return board.detail(record);
    }
    if action != "breakdown" {
        check_revision(record, request)?;
    }
    match action.as_str() {
        "read_source" => {
            require_breakdown_owner(&board.group, record, &by)?;
            require_registered_source(&board.group, record)?;
            source_preview(&obsidian::reread(&record.source)?, Some(record))
        }
        "refresh_source" => {
            require_manager(&board.group, &by)?;
            require_registered_source(&board.group, record)?;
            apply_source(
                &board,
                Some(record),
                obsidian::reread(&record.source)?,
                request,
                &by,
            )
        }
        "plan" => {
            require_manager(&board.group, &by)?;
            plan(&board, record.clone(), request, &by)
        }
        "breakdown" => {
            require_breakdown_owner(&board.group, record, &by)?;
            breakdown(&board, record, request, &by)
        }
        "link_task" => {
            require_manager(&board.group, &by)?;
            link_task(&board, record, request, &by)
        }
        "accept" => {
            require_manager(&board.group, &by)?;
            accept(&board, record.clone(), request, &by)
        }
        _ => Err(OpError::invalid("不支持的需求操作")),
    }
}

fn denied(message: &str) -> OpError {
    OpError::new("permission_denied", message)
}

fn require_registered_source(group: &GroupDoc, record: &Requirement) -> Result<(), OpError> {
    if record.source_group_id == group.group_id {
        Ok(())
    } else {
        Err(denied("请在此组重新指定 Obsidian 来源"))
    }
}

fn require_user(by: &str) -> Result<(), OpError> {
    if by == "user" {
        Ok(())
    } else {
        Err(denied("请由用户指定 Obsidian 来源或直接下达需求"))
    }
}

fn active_actor<'a>(group: &'a GroupDoc, id: &str) -> Option<&'a Actor> {
    actors::visible(group)
        .find(|actor| actor.id == id && actor.enabled && actor.availability.is_available())
}

fn manager(group: &GroupDoc) -> Option<&Actor> {
    actors::visible(group).find(|actor| {
        actor.enabled
            && actor.availability.is_available()
            && actors::effective_role(group, &actor.id) == Some(ActorRole::Foreman)
    })
}

fn require_manager(group: &GroupDoc, by: &str) -> Result<(), OpError> {
    if by == "user" || manager(group).is_some_and(|manager| manager.id == by) {
        Ok(())
    } else {
        Err(denied("须由项目经理统筹或验收此需求"))
    }
}

fn require_breakdown_owner(
    group: &GroupDoc,
    record: &Requirement,
    by: &str,
) -> Result<(), OpError> {
    if require_manager(group, by).is_ok()
        || active_actor(group, by).is_some_and(|actor| {
            actor.id == record.technical_owner
                && actors::generation_identity(actor) == record.technical_owner_generation
        })
    {
        Ok(())
    } else {
        Err(denied("须由指定的技术负责人或项目经理处理"))
    }
}

fn map(value: Value) -> Map<String, Value> {
    value.as_object().expect("固定操作对象").clone()
}

fn checked_text(request: &DaemonRequest, field: &str, limit: usize) -> Result<String, OpError> {
    let value = required_arg(request, field)?;
    let value = value.trim();
    if value.is_empty() || value.chars().count() > limit {
        return Err(OpError::invalid(format!(
            "{field} 不能为空，且最多 {limit} 字"
        )));
    }
    Ok(value.to_owned())
}

fn check_revision(record: &Requirement, request: &DaemonRequest) -> Result<(), OpError> {
    if let Some(rev) = request.args.get("if_rev").and_then(Value::as_u64)
        && rev != record.rev
    {
        return Err(OpError::new(
            "requirement_conflict",
            "需求已变化，请重新核对",
        ));
    }
    Ok(())
}

fn view(record: &Requirement, tasks: &[&Map<String, Value>], full: bool) -> Value {
    let status = requirements::status(record, tasks);
    let done = tasks
        .iter()
        .filter(|task| requirements::completed(task))
        .count();
    let blocked = tasks
        .iter()
        .filter(|task| !requirements::completed(task) && super::task_list::blocked(task))
        .count();
    let mut result = json!({
        "id":record.id, "rev":record.rev, "title":record.title, "source":obsidian::public_source(&record.source),
        "priority":record.priority, "technical_owner":record.technical_owner, "status":status,
        "task_counts":{"total":tasks.len(),"done":done,"blocked":blocked}, "updated_at":record.updated_at,
    });
    if full {
        result["description"] = json!(record.description);
        result["acceptance_criteria"] = json!(record.acceptance_criteria);
        result["acceptance"] = json!(
            record
                .acceptance
                .as_ref()
                .filter(|_| status == "done")
                .map(|receipt| json!({"by":receipt.by,"at":receipt.at,"note":receipt.note}))
        );
    }
    result
}

fn detail(doc: &ContextDoc, record: &Requirement, tasks_version: String) -> OpResult {
    let grouped = requirements::task_groups(doc);
    let tasks = grouped
        .get(record.id.as_str())
        .map(Vec::as_slice)
        .unwrap_or_default();
    object(
        json!({"requirement":view(record,tasks,true),"tasks":tasks,"tasks_version":tasks_version}),
    )
}

fn list(board: &Board<'_>, request: &DaemonRequest) -> OpResult {
    let limit = request
        .args
        .get("limit")
        .and_then(Value::as_u64)
        .unwrap_or(50)
        .clamp(1, 100) as usize;
    let offset = request
        .args
        .get("offset")
        .and_then(Value::as_u64)
        .unwrap_or(0)
        .min(usize::MAX as u64) as usize;
    let groups = requirements::task_groups(&board.doc);
    let items = board
        .records
        .iter()
        .rev()
        .skip(offset)
        .take(limit)
        .map(|record| {
            view(
                record,
                groups
                    .get(record.id.as_str())
                    .map(Vec::as_slice)
                    .unwrap_or_default(),
                false,
            )
        })
        .collect::<Vec<_>>();
    object(
        json!({"requirements":items,"total":board.records.len(),"has_more":offset.saturating_add(items.len()) < board.records.len()}),
    )
}

fn issue(board: &Board<'_>, request: &DaemonRequest) -> OpResult {
    let title = checked_text(request, "title", 160)?;
    let description = checked_text(request, "description", 16_000)?;
    let client_id = checked_text(request, "client_id", 128)?;
    if manager(&board.group).is_none() {
        return Err(OpError::new(
            "manager_unavailable",
            "请先指定一位在岗项目经理",
        ));
    }
    let text = format!("需求：{title}\n\n{description}");
    let args = map(
        json!({"group_id":board.group.group_id,"by":"user","to":["@foreman"],
        "text":text,"message_mode":"request_reply","client_id":format!("requirement-issue:{client_id}")}),
    );
    let sent = super::messaging::send_preserving_group_state(
        board.home,
        &DaemonRequest {
            v: 1,
            op: "send".into(),
            args,
        },
    )?;
    let event: Event = serde_json::from_value(sent.get("event").cloned().unwrap_or_default())
        .map_err(OpError::invalid)?;
    if event.data.get("text").and_then(Value::as_str) != Some(&text) {
        return Err(OpError::new(
            "requirement_conflict",
            "这次发送标识已用于另一条需求",
        ));
    }
    let mut result = capture(board, &event, "user")?;
    result.insert("event".into(), json!(event));
    Ok(result)
}

fn capture(board: &Board<'_>, event: &Event, by: &str) -> OpResult {
    if event.kind != "chat.message" || event.by != "user" || event.group_id != board.group.group_id
    {
        return Err(OpError::invalid("请选择本组用户下达需求的消息"));
    }
    let source = RequirementSource::Chat {
        event_id: event.id.clone(),
    };
    if let Some(record) = board.records.iter().find(|record| record.source == source) {
        return board.detail(record);
    }
    let text = event
        .data
        .get("text")
        .and_then(Value::as_str)
        .unwrap_or_default()
        .trim();
    if text.is_empty() || text.chars().count() > 16_256 {
        return Err(OpError::invalid("需求消息为空或过长"));
    }
    let first = text.lines().next().unwrap_or_default().trim();
    let title = first
        .strip_prefix("需求：")
        .unwrap_or(first)
        .trim()
        .chars()
        .take(160)
        .collect::<String>();
    if title.is_empty() {
        return Err(OpError::invalid("需求标题不能为空"));
    }
    let rest = text.strip_prefix(first).unwrap_or_default().trim();
    let description = if rest.is_empty() { text } else { rest };
    board.save(&board.new_record(title, description.to_owned(), source), by)
}

fn source_preview(selection: &obsidian::Selection, existing: Option<&Requirement>) -> OpResult {
    object(
        json!({"title":selection.title,"text":selection.text,"source":obsidian::public_source(&selection.source),
        "source_version":obsidian::version(&selection.source),"requirement_id":existing.map(|record| &record.id),
        "requirement_rev":existing.map(|record| record.rev),
        "changed":existing.is_some_and(|record| obsidian::version(&record.source) != obsidian::version(&selection.source))}),
    )
}

fn apply_source(
    board: &Board<'_>,
    existing: Option<&Requirement>,
    selection: obsidian::Selection,
    request: &DaemonRequest,
    by: &str,
) -> OpResult {
    if required_arg(request, "source_version")? != obsidian::version(&selection.source) {
        return Err(OpError::new("source_changed", "笔记内容已变化，请重新预览"));
    }
    let record = if let Some(existing) = existing {
        if existing.source_group_id == board.group.group_id
            && obsidian::version(&existing.source) == obsidian::version(&selection.source)
        {
            return board.detail(existing);
        }
        check_revision(existing, request)?;
        let mut record = existing.clone();
        record.description = selection.text;
        record.source = selection.source;
        record.source_group_id = board.group.group_id.clone();
        record.approved = false;
        record.acceptance = None;
        revise(&mut record);
        record
    } else {
        board.new_record(selection.title, selection.text, selection.source)
    };
    let result = board.save(&record, by)?;
    if let Some(manager) = manager(&board.group).filter(|manager| manager.id != by) {
        notify(
            board.home,
            &board.group,
            &manager.id,
            &format!("intake:{}:{}", record.id, record.rev),
            format!(
                "需求 {}「{}」已从 Obsidian 收录或更新。请项目经理核对范围、验收条件和技术负责人，再确认计划。",
                record.id, record.title
            ),
        );
    }
    Ok(result)
}

fn revise(record: &mut Requirement) {
    record.rev += 1;
    record.updated_at = utc_now();
}

fn plan(board: &Board<'_>, mut record: Requirement, request: &DaemonRequest, by: &str) -> OpResult {
    let owner_id = required_arg(request, "technical_owner")?;
    let owner = active_actor(&board.group, &owner_id)
        .ok_or_else(|| OpError::invalid("请选择在岗的技术负责人"))?;
    let priority = string_arg(request, "priority").unwrap_or_else(|| record.priority.clone());
    if !matches!(priority.as_str(), "low" | "normal" | "high" | "urgent") {
        return Err(OpError::invalid("无效优先级"));
    }
    if request.args.contains_key("title") {
        record.title = checked_text(request, "title", 160)?;
    }
    if request.args.contains_key("description") {
        record.description = checked_text(request, "description", 65_536)?;
    }
    record.acceptance_criteria = checked_text(request, "acceptance_criteria", 8_000)?;
    record.priority = priority;
    record.technical_owner = owner.id.clone();
    record.technical_owner_generation = actors::generation_identity(owner);
    record.approved = true;
    record.acceptance = None;
    revise(&mut record);
    let result = board.save(&record, by)?;
    if owner.id != by {
        notify(
            board.home,
            &board.group,
            &owner.id,
            &format!("plan:{}:{}", record.id, record.rev),
            format!(
                "请拆解需求 {}「{}」。核对目标和验收条件后，登记待办、依赖和建议负责人。已有拆解时补充所需任务，由项目经理统筹分派。",
                record.id, record.title
            ),
        );
    }
    Ok(result)
}

fn breakdown(
    board: &Board<'_>,
    record: &Requirement,
    request: &DaemonRequest,
    by: &str,
) -> OpResult {
    let client_id = checked_text(request, "client_id", 128)?;
    let items = request
        .args
        .get("tasks")
        .and_then(Value::as_array)
        .filter(|items| (1..=30).contains(&items.len()))
        .ok_or_else(|| OpError::invalid("一次拆解可登记 1 至 30 项任务"))?;
    let receipt_key = serde_json::to_string(&(by, &client_id)).map_err(OpError::invalid)?;
    let digest = format!(
        "{:x}",
        Sha256::digest(serde_json::to_vec(items).map_err(OpError::invalid)?)
    );
    if let Some(previous) = record.breakdown_requests.get(&receipt_key) {
        if previous != &digest {
            return Err(OpError::new(
                "requirement_conflict",
                "这次拆解标识已用于另一组任务",
            ));
        }
        return board.detail(record);
    }
    check_revision(record, request)?;
    if !record.approved {
        return Err(OpError::invalid("请先由项目经理确认需求计划"));
    }
    let prefix = format!("requirement:{}:{client_id}", record.id);
    let mut ops = Vec::with_capacity(items.len());
    for (index, item) in items.iter().enumerate() {
        let title = item
            .get("title")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .trim();
        if title.is_empty() || title.chars().count() > 160 {
            return Err(OpError::invalid("任务标题不能为空，且最多 160 字"));
        }
        let outcome = item
            .get("outcome")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .trim();
        if outcome.chars().count() > 8_000 {
            return Err(OpError::invalid("任务交付物说明过长"));
        }
        let suggested = item
            .get("suggested_assignee")
            .and_then(Value::as_str)
            .filter(|id| !id.is_empty());
        if suggested.is_some_and(|id| active_actor(&board.group, id).is_none()) {
            return Err(OpError::invalid("建议负责人须为在岗成员"));
        }
        let mut dependencies = Vec::new();
        if let Some(after) = item.get("after") {
            for step in after
                .as_array()
                .ok_or_else(|| OpError::invalid("after 须为序号数组"))?
            {
                let step = step
                    .as_u64()
                    .filter(|step| *step > 0 && *step <= index as u64)
                    .ok_or_else(|| OpError::invalid("任务只能依赖本次拆解中排在它之前的任务"))?;
                dependencies.push(format!("{prefix}:{step}"));
            }
        }
        ops.push(map(
            json!({"op":"task.create","title":title,"outcome":outcome,"status":"planned",
            "requirement_id":record.id,"suggested_assignee":suggested,"priority":record.priority,
            "client_request_id":format!("{prefix}:{}",index + 1),"blocked_by_refs":dependencies}),
        ));
    }
    let mut record = record.clone();
    record.breakdown_requests.insert(receipt_key, digest);
    record.acceptance = None;
    revise(&mut record);
    let result = board.persist(Some(&record), ops, by)?;
    if result
        .changes
        .iter()
        .any(|change| change["replayed"] != true)
        && let Some(manager) = manager(&board.group).filter(|manager| manager.id != by)
    {
        notify(
            board.home,
            &board.group,
            &manager.id,
            &format!("split:{prefix}:{by}"),
            format!(
                "需求 {}「{}」已登记拆解任务。请项目经理核对建议分工，分派负责人并安排开工。",
                record.id, record.title
            ),
        );
    }
    detail(
        &result.context,
        &record,
        board.store.tasks_version(&result.context),
    )
}

fn link_task(
    board: &Board<'_>,
    record: &Requirement,
    request: &DaemonRequest,
    by: &str,
) -> OpResult {
    let id = required_arg(request, "task_id")?;
    let task = board
        .doc
        .tasks
        .iter()
        .find(|task| task.get("id").and_then(Value::as_str) == Some(&id))
        .ok_or_else(|| OpError::new("task_not_found", "任务不存在"))?;
    if task.get("requirement_id").and_then(Value::as_str) == Some(&record.id) {
        return board.detail(record);
    }
    if task.get("requirement_id").and_then(Value::as_str).is_some()
        || task.get("parent_id").and_then(Value::as_str).is_some()
    {
        return Err(OpError::invalid("请选择尚未关联需求的顶层任务"));
    }
    let result = board.persist(
        None,
        vec![map(
            json!({"op":"task.update","task_id":id,"requirement_id":record.id}),
        )],
        by,
    )?;
    detail(
        &result.context,
        record,
        board.store.tasks_version(&result.context),
    )
}

fn accept(
    board: &Board<'_>,
    mut record: Requirement,
    request: &DaemonRequest,
    by: &str,
) -> OpResult {
    let groups = requirements::task_groups(&board.doc);
    let tasks = groups
        .get(record.id.as_str())
        .map(Vec::as_slice)
        .unwrap_or_default();
    let status = requirements::status(&record, tasks);
    if status == "done" {
        return board.detail(&record);
    }
    if status != "awaiting_acceptance" {
        return Err(OpError::invalid("请先确认需求计划并完成全部关联任务"));
    }
    if let Some(version) = string_arg(request, "tasks_version")
        && version != board.store.tasks_version(&board.doc)
    {
        return Err(OpError::new(
            "requirement_conflict",
            "关联任务已变化，请重新核对验收结果",
        ));
    }
    record.acceptance = Some(RequirementAcceptance {
        by: by.into(),
        at: utc_now(),
        note: checked_text(request, "note", 8_000)?,
        tasks: requirements::task_revisions(tasks),
    });
    revise(&mut record);
    board.save(&record, by)
}

pub(super) fn announce_task_changes(
    home: &HomeLayout,
    group: &GroupDoc,
    before: &ContextDoc,
    after: &ContextDoc,
    by: &str,
) {
    let Ok(records) = requirements::records(after) else {
        return;
    };
    if records.is_empty() {
        return;
    }
    let previous = requirements::task_groups(before);
    let current = requirements::task_groups(after);
    for record in records {
        let old = previous
            .get(record.id.as_str())
            .map(Vec::as_slice)
            .unwrap_or_default();
        let tasks = current
            .get(record.id.as_str())
            .map(Vec::as_slice)
            .unwrap_or_default();
        for task in tasks {
            let Some(owner) = task
                .get("assignee")
                .and_then(Value::as_str)
                .filter(|owner| !owner.is_empty() && *owner != by)
            else {
                continue;
            };
            if requirements::completed(task)
                || task.get("status").and_then(Value::as_str) == Some("archived")
            {
                continue;
            }
            let task_id = task.get("id").and_then(Value::as_str).unwrap_or_default();
            if old.iter().any(|old| {
                old.get("id") == task.get("id") && old.get("assignee") == task.get("assignee")
            }) {
                continue;
            }
            let rev = task.get("rev").and_then(Value::as_u64).unwrap_or_default();
            notify(
                home,
                group,
                owner,
                &format!("assign:{}:{task_id}:{rev}", record.id),
                format!(
                    "你收到需求 {} 的任务 {task_id}。请核对目标、验收条件与依赖，在任务中记录状态、进展和结果。人工停止的任务等待用户恢复。",
                    record.id
                ),
            );
        }
        if requirements::status(&record, tasks) == "awaiting_acceptance"
            && requirements::status(&record, old) != "awaiting_acceptance"
            && let Some(manager) = manager(group)
        {
            notify(
                home,
                group,
                &manager.id,
                &format!(
                    "acceptance:{}:{}:{}",
                    record.id, record.rev, after.tasks_revision
                ),
                format!(
                    "需求 {}「{}」的关联任务已完成。请项目经理按验收条件核对结果，登记验收结论。",
                    record.id, record.title
                ),
            );
        }
    }
}

fn notify(home: &HomeLayout, group: &GroupDoc, target: &str, key: &str, message: String) {
    let Some(actor) = active_actor(group, target) else {
        return;
    };
    let result = (|| -> std::io::Result<()> {
        let path = niuma_core::GroupStore::new(home.clone())?.ledger_path(&group.group_id)?;
        let client_id = format!("requirement:{key}:{}", actors::generation_identity(actor));
        if ledger::find_idempotent(&path, "chat.message", "system", &client_id)?.is_some() {
            return Ok(());
        }
        let mut event = Event::new("chat.message", &group.group_id);
        event.by = "system".into();
        event.data = map(
            json!({"to":[target],"text":message,"message_mode":"mail","im_visibility":"internal","client_id":client_id}),
        );
        ledger::append(&path, &event)?;
        if group.running && group.state == GroupState::Active {
            super::automation_runtime::notify_idle_mail_recipients(home, group, &event);
        }
        Ok(())
    })();
    if let Err(error) = result {
        tracing::warn!(%error, group_id=%group.group_id, "需求通知写入失败");
    }
}
