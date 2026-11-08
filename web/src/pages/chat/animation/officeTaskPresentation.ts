import type { Actor, Task } from "../../../types";
import type { OfficeTasksState } from "./useOfficeTasks";

export type OfficeTaskTranslator = (key: string) => string;
export const officeTaskMember = (actors: Actor[], id?: string | null) =>
  actors.find((actor) => actor.id === id)?.title?.trim() || id || "";

export function officeTaskStateKey(task: Task): string {
  if (task.status === "done" || task.status === "archived") return "done";
  if (task.waiting_on === "user") return "waitingUser";
  if (task.waiting_on === "actor") return "waitingActor";
  if (task.waiting_on === "external") return "waitingExternal";
  if (task.blocked_by?.length) return "blocked";
  if (task.handoff_to) return "handoff";
  return task.status === "planned" ? "planned" : "active";
}

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!,
  );

export function renderOfficeTaskSummary(
  state: OfficeTasksState,
  actors: Actor[],
  offDuty: boolean,
  tr: OfficeTaskTranslator,
): string {
  const text = (key: string) => escape(tr(`officeTasks.${key}`));
  const manager = actors.find((actor) => actor.role === "foreman");
  const data = state.data;
  const heading = `<header style="display:flex;justify-content:space-between;align-items:center;gap:12px;font-weight:700;font-size:32px;line-height:38px"><span>${text("title")}</span><span style="font-size:24px;font-weight:400;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${escape(officeTaskMember(actors, manager?.id))}</span></header>`;
  if (!data)
    return `${heading}<p style="margin:36px 0;font-size:30px">${text(state.error ? "loadError" : "loading")}</p><div style="font-size:25px">${text("open")} ↗</div>`;
  const counts = data.facets.statusCounts;
  const totals = `<div style="display:flex;gap:20px;line-height:35px;font-size:25px;color:#525d55"><span>${text("active")} ${counts.active || 0}</span><span>${text("blocked")} ${data.facets.blocked}</span><span>${text("planned")} ${counts.planned || 0}</span></div>`;
  const column = (status: "active" | "planned") => {
    const tasks = data.pages[status]?.tasks || [];
    const rows = tasks
      .slice(0, 2)
      .map(
        (task) =>
          `<div style="padding:7px 0;border-top:1px solid #bcc4bc"><div style="font-size:30px;line-height:34px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${escape(task.title || task.id)}</div><div style="display:flex;justify-content:space-between;gap:8px;font-size:24px;line-height:30px;color:#667166"><span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${escape(officeTaskMember(actors, task.assignee)) || text("unassigned")}</span><span style="flex:none">${text(`state.${officeTaskStateKey(task)}`)}</span></div></div>`,
      )
      .join("");
    return `<section style="min-width:0"><strong style="display:block;font-size:27px;line-height:36px">${text(status)}</strong>${rows || `<p style="font-size:25px;line-height:34px;margin:8px 0;color:#667166">${text(status === "planned" ? "noPlans" : "noActive")}</p>`}</section>`;
  };
  const note = state.error ? text("stale") : offDuty ? text("offDutyShort") : text("live");
  return `${heading}${totals}<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:30px">${column("active")}${column("planned")}</div><footer style="display:flex;justify-content:space-between;gap:10px;font-size:24px;line-height:28px;margin-top:3px;color:#566b5e"><span>${note}</span><span>${text("viewAll")} ↗</span></footer>`;
}
