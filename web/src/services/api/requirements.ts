import type { LedgerEvent, Task } from "../../types";
import { apiJson, clearContextRequest, normalizeTask } from "./base";

export type RequirementSource =
  | { kind: "chat"; event_id: string }
  | { kind: "obsidian"; note: string; heading?: string | null; url: string };

export type RequirementSummary = {
  id: string;
  rev: number;
  title: string;
  status: "intake" | "awaiting_breakdown" | "planned" | "active" | "awaiting_acceptance" | "done";
  priority: string;
  technical_owner: string;
  source: RequirementSource;
  task_counts: { total: number; done: number; blocked: number };
};

export type RequirementDetail = {
  requirement: RequirementSummary & {
    description: string;
    acceptance_criteria: string;
    acceptance?: { by: string; at: string; note: string } | null;
  };
  tasks: Task[];
  tasks_version: string;
  event?: LedgerEvent;
};

export type RequirementSourcePreview = {
  title: string;
  text: string;
  source: RequirementSource;
  source_version: string;
  requirement_id?: string | null;
  requirement_rev?: number | null;
  changed: boolean;
};

const endpoint = (groupId: string) =>
  "/api/v1/groups/" + encodeURIComponent(groupId) + "/requirements";

export function fetchRequirements(groupId: string, offset: number, signal?: AbortSignal) {
  return apiJson<{ requirements: RequirementSummary[]; total: number; has_more: boolean }>(
    endpoint(groupId) + "?limit=30&offset=" + offset,
    { cache: "no-store", signal },
  );
}

export async function fetchRequirement(groupId: string, id: string, signal?: AbortSignal) {
  const response = await apiJson<RequirementDetail>(
    endpoint(groupId) + "/" + encodeURIComponent(id),
    { cache: "no-store", signal },
  );
  if (response.ok) {
    return {
      ...response,
      result: {
        ...response.result,
        tasks: response.result.tasks.map(normalizeTask).filter((task): task is Task => !!task),
      },
    };
  }
  return response;
}

export async function requirementAction<T = RequirementDetail>(
  groupId: string,
  args: { action: string } & Record<string, unknown>,
) {
  const writing = args.action !== "preview_source" && args.action !== "read_source";
  if (writing) clearContextRequest(groupId);
  try {
    return await apiJson<T>(endpoint(groupId), {
      method: "POST",
      body: JSON.stringify(args),
      cache: "no-store",
    });
  } finally {
    if (writing) clearContextRequest(groupId);
  }
}
