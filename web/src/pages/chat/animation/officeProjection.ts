import type { Actor } from "../../../types";

export const OFFICE_SLOTS = [
  "office-lead",
  "code-agent",
  "file-agent",
  "app-agent",
  "review-agent",
  "data-agent",
] as const;

export type OfficeState =
  | "stopped"
  | "idle"
  | "working"
  | "waiting"
  | "stuck"
  | "error"
  | "unknown";

export function officePage(actors: Actor[], requestedPage: number) {
  const pageCount = Math.max(1, Math.ceil(actors.length / OFFICE_SLOTS.length));
  const page = Math.max(
    0,
    Math.min(Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 0, pageCount - 1),
  );
  const members = actors.slice(page * OFFICE_SLOTS.length, (page + 1) * OFFICE_SLOTS.length);
  return {
    members: members
      .map((actor, index) => ({ actor, sceneId: OFFICE_SLOTS[index] }))
      .filter(({ actor }) => actor.availability !== "away"),
    page,
    pageCount,
  };
}

export function officeState(actor: Actor): OfficeState {
  if (actor.running === false) return "stopped";
  const reason = String(actor.effective_working_reason || "").toLowerCase();
  if (reason.includes("unknown") || reason.includes("unavailable")) return "unknown";
  const state = String(actor.effective_working_state || "").toLowerCase();
  if (
    state === "stopped" ||
    state === "idle" ||
    state === "working" ||
    state === "waiting" ||
    state === "stuck" ||
    state === "error"
  )
    return state;
  if (state === "blocked") return "waiting";
  return "unknown";
}
