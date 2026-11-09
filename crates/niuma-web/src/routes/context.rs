use axum::extract::{FromRequest, Path, Query, Request, State};
use axum::routing::{get, post};
use axum::{Json, Router};
use serde_json::{Value, json};
use std::collections::HashMap;

use crate::AppState;
use crate::api::{ApiResult, body_object, call, object};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/api/v1/groups/{group_id}/context",
            get(context_get).post(context_sync),
        )
        .route("/api/v1/groups/{group_id}/tasks", get(tasks))
        .route(
            "/api/v1/groups/{group_id}/requirements",
            get(requirements).post(requirement_action),
        )
        .route(
            "/api/v1/groups/{group_id}/requirements/{requirement_id}",
            get(requirement_detail),
        )
        .route(
            "/api/v1/groups/{group_id}/tasks/{task_id}/control",
            get(task_control_get).post(task_control_write),
        )
        .route("/api/v1/groups/{group_id}/ledger/tail", get(ledger_tail))
        .route(
            "/api/v1/groups/{group_id}/ledger/search",
            get(ledger_search),
        )
        .route(
            "/api/v1/groups/{group_id}/ledger/window",
            get(ledger_window),
        )
        .route(
            "/api/v1/groups/{group_id}/ledger/statuses",
            post(ledger_statuses),
        )
        .route(
            "/api/v1/groups/{group_id}/events/{event_id}/read_status",
            get(read_status),
        )
}

#[derive(serde::Deserialize)]
struct RequirementPage {
    limit: Option<u64>,
    offset: Option<u64>,
}

async fn requirements(
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Query(page): Query<RequirementPage>,
) -> ApiResult {
    call(&state, "requirement", object(json!({"group_id":group_id,"by":"user","action":"list","limit":page.limit,"offset":page.offset}))).await
}

async fn requirement_detail(
    State(state): State<AppState>,
    Path((group_id, requirement_id)): Path<(String, String)>,
) -> ApiResult {
    call(
        &state,
        "requirement",
        object(
            json!({"group_id":group_id,"by":"user","action":"get","requirement_id":requirement_id}),
        ),
    )
    .await
}

async fn requirement_action(
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    request: Request,
) -> ApiResult {
    let local_admin = request
        .extensions()
        .get::<crate::auth::Principal>()
        .is_some_and(|principal| principal.is_admin)
        && crate::local_browser_auth::allowed(&state, &request);
    let Json(body) = Json::<Value>::from_request(request, &state)
        .await
        .map_err(|_| crate::api::ApiError::bad("需求请求格式有误"))?;
    let mut args = body_object(body)?;
    match args.get("action").and_then(Value::as_str) {
        Some("preview_source" | "import_source" | "read_source" | "refresh_source") => {
            if !local_admin {
                return Err(crate::api::ApiError::forbidden(
                    "请在本机管理员页面读取 Obsidian 笔记",
                ));
            }
        }
        Some("issue" | "capture" | "plan" | "breakdown" | "link_task" | "accept") => {}
        _ => return Err(crate::api::ApiError::bad("不支持的需求操作")),
    }
    args.insert("group_id".into(), json!(group_id));
    args.insert("by".into(), json!("user"));
    call(&state, "requirement", args).await
}

async fn task_control_get(
    State(state): State<AppState>,
    Path((group_id, task_id)): Path<(String, String)>,
) -> ApiResult {
    call(
        &state,
        "task_control",
        object(json!({"group_id":group_id,"task_id":task_id,"action":"get","by":"user"})),
    )
    .await
}
async fn task_control_write(
    State(state): State<AppState>,
    Path((group_id, task_id)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult {
    let mut args = body_object(body)?;
    if !matches!(
        args.get("action").and_then(Value::as_str),
        Some("request_stop" | "resume" | "delete" | "ask")
    ) {
        return Err(crate::api::ApiError::bad("不支持此任务操作"));
    }
    args.insert("group_id".into(), json!(group_id));
    args.insert("task_id".into(), json!(task_id));
    args.insert("by".into(), json!("user"));
    call(&state, "task_control", args).await
}

async fn context_get(
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Query(query): Query<ContextQuery>,
) -> ApiResult {
    let detail = query.detail.as_deref().unwrap_or("summary");
    if !matches!(detail, "overview" | "summary" | "full") {
        return Err(crate::api::ApiError::bad_code(
            "invalid_detail",
            "detail must be 'overview', 'summary', or 'full'",
            json!({"detail":detail}),
        ));
    }
    call(
        &state,
        "context_get",
        object(json!({
            "group_id":group_id,
            "detail":detail,
            "fresh":strict_bool(query.fresh.as_deref(), "fresh")?,
        })),
    )
    .await
}

#[derive(Default, serde::Deserialize)]
struct ContextQuery {
    detail: Option<String>,
    fresh: Option<String>,
}
async fn context_sync(
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult {
    let mut args = body_object(body)?;
    args.insert("group_id".into(), Value::String(group_id));
    call(&state, "context_sync", args).await
}
async fn tasks(
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Query(query): Query<HashMap<String, String>>,
) -> ApiResult {
    let mut args = object(json!({"group_id":group_id}));
    for name in [
        "task_id",
        "task_ids",
        "status",
        "statuses",
        "query",
        "assignee",
        "attention",
        "offset",
        "limit",
        "include_index",
    ] {
        if let Some(value) = query.get(name) {
            args.insert(name.into(), Value::String(value.clone()));
        }
    }
    call(&state, "task_list", args).await
}
async fn ledger_tail(
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Query(query): Query<HashMap<String, String>>,
) -> ApiResult {
    let limit = first_non_blank_query(&query, &["limit", "n"])
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(200);
    call(
        &state,
        "ledger_tail",
        object(json!({
            "group_id":group_id,
            "limit":limit,
            "kind":query.get("kind"),
            "with_read_status":query_bool(&query, "with_read_status")?,
            "with_obligation_status":query_bool(&query, "with_obligation_status")?,
        })),
    )
    .await
}
async fn ledger_search(
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Query(query): Query<HashMap<String, String>>,
) -> ApiResult {
    let by_any = query
        .get("by_any")
        .map(|value| {
            serde_json::from_str::<Vec<String>>(value).map_err(|_| {
                crate::api::ApiError::bad_code(
                    "invalid_args",
                    "by_any must be a JSON array of sender identities",
                    json!({"field":"by_any"}),
                )
            })
        })
        .transpose()?;
    call(
        &state,
        "ledger_search",
        object(json!({
            "group_id":group_id,
            "q":first_non_blank_query(&query,&["q","query"]),
            "kind":query.get("kind"),
            "by":query.get("by"),
            "by_any":by_any,
            "to":query.get("to"),
            "since_ts":query.get("since_ts"),
            "until_ts":query.get("until_ts"),
            "before":query.get("before"),
            "after":query.get("after"),
            "limit":query.get("limit"),
            "with_read_status":query_bool(&query, "with_read_status")?,
            "with_obligation_status":query_bool(&query, "with_obligation_status")?,
        })),
    )
    .await
}

fn first_non_blank_query<'a>(
    query: &'a HashMap<String, String>,
    names: &[&str],
) -> Option<&'a str> {
    names.iter().find_map(|name| {
        query
            .get(*name)
            .map(String::as_str)
            .map(str::trim)
            .filter(|value| !value.is_empty())
    })
}
async fn ledger_window(
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Query(query): Query<HashMap<String, String>>,
) -> ApiResult {
    call(
        &state,
        "ledger_window",
        object(json!({
            "group_id":group_id,
            "center":query.get("center"),
            "kind":query.get("kind"),
            "before":query.get("before"),
            "after":query.get("after"),
            "with_read_status":query_bool(&query, "with_read_status")?,
            "with_obligation_status":query_bool(&query, "with_obligation_status")?,
        })),
    )
    .await
}

fn query_bool(query: &HashMap<String, String>, name: &str) -> Result<bool, crate::api::ApiError> {
    strict_bool(query.get(name).map(String::as_str), name)
}

fn strict_bool(value: Option<&str>, name: &str) -> Result<bool, crate::api::ApiError> {
    match value.map(str::trim).filter(|value| !value.is_empty()) {
        None => Ok(false),
        Some("1" | "true" | "yes" | "on") => Ok(true),
        Some("0" | "false" | "no" | "off") => Ok(false),
        Some(value) => Err(crate::api::ApiError::bad_code(
            "invalid_boolean",
            format!("{name} must be a boolean"),
            json!({"field":name,"value":value}),
        )),
    }
}
async fn ledger_statuses(
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult {
    call(
        &state,
        "ledger_statuses",
        object(json!({"group_id":group_id,"event_ids":body.get("event_ids")})),
    )
    .await
}
async fn read_status(
    State(state): State<AppState>,
    Path((group_id, event_id)): Path<(String, String)>,
) -> ApiResult {
    call(
        &state,
        "message_read_status",
        object(json!({"group_id":group_id,"event_id":event_id})),
    )
    .await
}
