import type { ActorLeave } from "../../types";
import { apiJson, clearActorsReadOnlyRequest, clearGroupsReadRequest } from "./base";

type LeaveResult = {
  leave: ActorLeave;
  current_tasks?: Array<{ task_id: string; title: string; assignee?: string; status?: string }>;
};
export function fetchActorLeave(groupId: string, leaveId: string) {
  return apiJson<LeaveResult>(
    `/api/v1/groups/${encodeURIComponent(groupId)}/actor_leaves/${encodeURIComponent(leaveId)}`,
  );
}
function invalidate(groupId: string) {
  clearActorsReadOnlyRequest(groupId);
  clearGroupsReadRequest();
}
export async function requestActorLeave(
  groupId: string,
  actorId: string,
  options: { immediate?: boolean; deputyId?: string; expectedGeneration?: string } = {},
) {
  invalidate(groupId);
  try {
    return await apiJson<LeaveResult>(
      `/api/v1/groups/${encodeURIComponent(groupId)}/actors/${encodeURIComponent(actorId)}/leave`,
      {
        method: "POST",
        body: JSON.stringify({
          by: "user",
          immediate: options.immediate || false,
          deputy_id: options.deputyId || undefined,
          expected_actor_generation: options.expectedGeneration,
        }),
      },
    );
  } finally {
    invalidate(groupId);
  }
}
export async function actOnActorLeave(
  groupId: string,
  leaveId: string,
  action: "force" | "recall" | "retry" | "cancel",
) {
  invalidate(groupId);
  try {
    return await apiJson<LeaveResult>(
      `/api/v1/groups/${encodeURIComponent(groupId)}/actor_leaves/${encodeURIComponent(leaveId)}`,
      { method: "POST", body: JSON.stringify({ by: "user", action }) },
    );
  } finally {
    invalidate(groupId);
  }
}
