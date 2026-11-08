import type { Actor, ChatMessageData, HeadlessStreamEvent, LedgerEvent } from "../../../types";
import { getRecipientActorIdsForEvent } from "../../../utils/ledgerEventHandlers";

export type OfficeActivity = { kind: string; label: string; activityId: string };
export type OfficeMessage = { id: string; from: string; to: string[]; text: string };
export type OfficeUtterance = { id: string; text: string; receivedAt: number };

export function latestOfficeUtterance(
  actor: Actor,
  events: HeadlessStreamEvent[],
  now: number,
): OfficeUtterance | null {
  if (actor.running === false || actor.effective_working_state !== "working") return null;
  const stateTime = Date.parse(actor.effective_working_updated_at || "");
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index];
    if (
      event.type !== "headless.visual_activity" ||
      !event.id ||
      typeof event._receivedAt !== "number"
    )
      continue;
    if (now < event._receivedAt || now - event._receivedAt > 15_000) continue;
    const turn = typeof event.data?.turn_id === "string" ? event.data.turn_id : "";
    if (actor.effective_active_task_id && turn !== actor.effective_active_task_id) continue;
    const eventTime = Date.parse(event.ts || "");
    if (
      !actor.effective_active_task_id &&
      Number.isFinite(stateTime) &&
      Number.isFinite(eventTime) &&
      eventTime < stateTime
    )
      continue;
    const text =
      typeof event.data?.speech === "string" ? event.data.speech.replace(/\s+/g, " ").trim() : "";
    if (!text) continue;
    const characters = Array.from(text);
    return {
      id: event.id,
      text: characters.length > 80 ? `${characters.slice(0, 80).join("")}…` : text,
      receivedAt: event._receivedAt,
    };
  }
  return null;
}

export function shouldAnimateOfficeMessage(event: LedgerEvent, now: number): boolean {
  const received = event._officeLiveAt;
  return (
    event.kind === "chat.message" &&
    typeof received === "number" &&
    now >= received &&
    now - received <= 10_000
  );
}

export function currentOfficeActivity(
  actor: Actor,
  events: HeadlessStreamEvent[],
): OfficeActivity | null {
  if (actor.running === false || actor.effective_working_state !== "working") return null;
  const active = new Map<string, OfficeActivity>();
  const activeTurn = actor.effective_active_task_id;
  const stateTime = Date.parse(actor.effective_working_updated_at || "");
  for (const event of events) {
    const type = String(event.type || "");
    if (type !== "headless.visual_activity" && !type.startsWith("headless.activity.")) continue;
    const data = event.data || {};
    const turn = typeof data.turn_id === "string" ? data.turn_id : "";
    if (activeTurn && turn && turn !== activeTurn) continue;
    const eventTime = Date.parse(event.ts || "");
    if (
      !activeTurn &&
      Number.isFinite(stateTime) &&
      Number.isFinite(eventTime) &&
      eventTime < stateTime
    )
      continue;
    const id = typeof data.activity_id === "string" ? data.activity_id : "";
    if (!id) continue;
    const phase = type === "headless.visual_activity" ? data.phase : type.split(".").at(-1);
    if (phase === "completed" || phase === "failed") {
      active.delete(id);
      continue;
    }
    if (phase !== "started" && phase !== "updated") continue;
    const kind = typeof data.kind === "string" ? data.kind : "tool";
    const label =
      typeof data.label === "string"
        ? data.label
        : typeof data.tool_name === "string"
          ? data.tool_name
          : "";
    active.delete(id);
    active.set(id, { kind, label: label.replace(/\s+/g, " ").trim().slice(0, 80), activityId: id });
  }
  return [...active.values()].at(-1) || null;
}

export function officeMessage(event: LedgerEvent, actors: Actor[]): OfficeMessage | null {
  if (event.kind !== "chat.message" || !event.id || event._streaming) return null;
  const data = event.data as ChatMessageData | undefined;
  const from = String(event.by || "user").trim() || "user";
  const to = getRecipientActorIdsForEvent(event, actors);
  if (Array.isArray(data?.to) && data.to.some((target) => target === "user" || target === "@user"))
    to.push("user");
  return {
    id: event.id,
    from,
    to,
    text: typeof data?.text === "string" ? data.text.trim().replace(/\s+/g, " ").slice(0, 100) : "",
  };
}
