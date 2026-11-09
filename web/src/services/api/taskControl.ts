import type { LedgerEvent, Task } from "../../types";
import { apiJson, clearContextRequest } from "./base";

export type TaskControlPreview = {
  task: Task;
  delete_token: string;
  delete_info: { allowed: boolean; total: number; reason: string };
};
const path = (groupId: string, taskId: string) =>
  "/api/v1/groups/" +
  encodeURIComponent(groupId) +
  "/tasks/" +
  encodeURIComponent(taskId) +
  "/control";
export function fetchTaskControl(groupId: string, taskId: string) {
  return apiJson<TaskControlPreview>(path(groupId, taskId), { cache: "no-store" });
}
async function write<T>(groupId: string, taskId: string, body: Record<string, unknown>) {
  clearContextRequest(groupId);
  try {
    return await apiJson<T>(path(groupId, taskId), { method: "POST", body: JSON.stringify(body) });
  } finally {
    clearContextRequest(groupId);
  }
}
export function requestTaskStop(groupId: string, task: Task, clientId: string) {
  return write<TaskControlPreview>(groupId, task.id, {
    action: "request_stop",
    if_task_rev: task.rev ?? 0,
    client_id: clientId,
  });
}
export function resumeTaskWork(groupId: string, task: Task) {
  return write<TaskControlPreview>(groupId, task.id, {
    action: "resume",
    if_task_rev: task.rev ?? 0,
  });
}
export function deleteControlledTask(groupId: string, taskId: string, deleteToken: string) {
  return write<{
    deleted: boolean;
    task_id: string;
    count?: number;
    already_absent?: boolean;
    deleted_task_ids?: string[];
  }>(groupId, taskId, { action: "delete", delete_token: deleteToken });
}
export function askTaskManager(
  groupId: string,
  taskId: string,
  question: string,
  clientId: string,
) {
  return write<{ event: LedgerEvent; manager_id: string; awaiting_start: boolean }>(
    groupId,
    taskId,
    { action: "ask", question, client_id: clientId },
  );
}
