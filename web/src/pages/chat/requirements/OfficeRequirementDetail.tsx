import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/button";
import {
  requirementAction,
  updateCoordinationTask,
  type RequirementDetail,
} from "../../../services/api";
import { useGroupStore } from "../../../stores/useGroupStore";
import { useUIStore } from "../../../stores/useUIStore";
import type { Actor, Task } from "../../../types";
import { officeTaskMember, officeTaskStateKey } from "../animation/officeTaskPresentation";
import { ObsidianImportButton } from "./ObsidianImportButton";
import { submitRequirementOnEnter } from "./requirementFormKeys";

type Mode = "plan" | "link_task" | "accept";
type Props = {
  groupId: string;
  detail: RequirementDetail;
  actors: Actor[];
  readOnly: boolean;
  canImport: boolean;
  onChanged: (result: RequirementDetail) => void;
  onRefresh: () => void;
  onOpenTask: (task: Task) => void;
};

export function OfficeRequirementDetail({
  groupId,
  detail,
  actors,
  readOnly,
  canImport,
  onChanged,
  onRefresh,
  onOpenTask,
}: Props) {
  const { t } = useTranslation("chat");
  const { requirement, tasks } = detail;
  const [editor, setEditor] = useState<{ mode: Mode; rev: number; tasksVersion: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const available = actors.filter(
    (actor) =>
      actor.enabled !== false && (!actor.availability || actor.availability === "available"),
  );
  const member = (id?: string | null) =>
    officeTaskMember(actors, id) || t("officeTasks.unassigned");

  function edit(mode: Mode) {
    setError("");
    setEditor({ mode, rev: requirement.rev, tasksVersion: detail.tasks_version });
  }
  async function run(action: () => Promise<void>) {
    if (pending.current || readOnly) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("requirements.actionFailed"));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget).entries());
    void run(async () => {
      const response = await requirementAction(groupId, {
        ...fields,
        action: editor.mode,
        requirement_id: requirement.id,
        if_rev: editor.rev,
        tasks_version: editor.tasksVersion,
      });
      if (!response.ok) throw new Error(response.error.message);
      setEditor(null);
      onChanged(response.result);
    });
  }
  function assign(event: FormEvent<HTMLFormElement>, task: Task) {
    event.preventDefault();
    const assignee = String(new FormData(event.currentTarget).get("assignee") || "");
    if (!assignee) return;
    void run(async () => {
      const response = await updateCoordinationTask(groupId, task.id, { assignee }, task.rev);
      if (!response.ok) throw new Error(response.error.message);
      onRefresh();
    });
  }
  async function openSource(eventId: string) {
    try {
      if (await useGroupStore.getState().openChatWindow(groupId, eventId)) return;
    } catch {
      /* 统一显示原消息无法定位的提示。 */
    }
    useUIStore.getState().showNotice({ message: t("notifications.messageUnavailable") });
  }
  const source = requirement.source;
  return (
    <div className="office-tasks__detail office-requirements__detail">
      <div className="office-requirements__source">
        {source.kind === "obsidian" ? (
          <a href={source.url} title={t("requirements.openNote")}>
            {source.note}
            {source.heading ? " · " + source.heading : ""}
          </a>
        ) : (
          <button type="button" onClick={() => void openSource(source.event_id)}>
            {t("requirements.openMessage")}
          </button>
        )}
      </div>
      <div>
        <h3>{t("requirements.description")}</h3>
        <p className="office-requirements__text">{requirement.description}</p>
      </div>
      <div>
        <h3>{t("requirements.criteria")}</h3>
        <p>{requirement.acceptance_criteria || t("requirements.criteriaPending")}</p>
      </div>
      <p>
        {t("requirements.owner", { name: member(requirement.technical_owner) })} ·{" "}
        {t("officeTasks.priority." + requirement.priority)}
      </p>
      {requirement.acceptance && (
        <div>
          <h3>{t("requirements.acceptanceNote")}</h3>
          <p>{requirement.acceptance.note}</p>
        </div>
      )}
      {!readOnly && !editor && (
        <div className="office-tasks__actions">
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-requirement-plan
            disabled={busy}
            onClick={() => edit("plan")}
          >
            {t("requirements.plan")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => edit("link_task")}
          >
            {t("requirements.linkTask")}
          </Button>
          {requirement.status === "awaiting_acceptance" && (
            <Button
              type="button"
              size="sm"
              data-requirement-accept
              disabled={busy}
              onClick={() => edit("accept")}
            >
              {t("requirements.accept")}
            </Button>
          )}
          {canImport && source.kind === "obsidian" && (
            <ObsidianImportButton
              groupId={groupId}
              requirement={requirement}
              onImported={onChanged}
            />
          )}
        </div>
      )}
      {editor && !readOnly && (
        <form className="requirements-form office-requirements__editor" onSubmit={submit}>
          {editor.mode === "plan" && (
            <>
              <label>
                {t("requirements.title")}
                <input
                  className="glass-input"
                  name="title"
                  defaultValue={requirement.title}
                  required
                  maxLength={160}
                  disabled={busy}
                />
              </label>
              <label>
                {t("requirements.description")}
                <textarea
                  className="glass-input"
                  name="description"
                  defaultValue={requirement.description}
                  rows={3}
                  required
                  maxLength={65536}
                  disabled={busy}
                  onKeyDown={submitRequirementOnEnter}
                />
              </label>
              <label>
                {t("requirements.criteria")}
                <textarea
                  className="glass-input"
                  name="acceptance_criteria"
                  defaultValue={requirement.acceptance_criteria}
                  rows={3}
                  required
                  maxLength={8000}
                  disabled={busy}
                  onKeyDown={submitRequirementOnEnter}
                />
              </label>
              <label>
                {t("requirements.technicalOwner")}
                <select
                  className="glass-input"
                  name="technical_owner"
                  defaultValue={
                    available.some((actor) => actor.id === requirement.technical_owner)
                      ? requirement.technical_owner
                      : ""
                  }
                  required
                  disabled={busy}
                >
                  <option value="">{t("requirements.selectMember")}</option>
                  {available.map((actor) => (
                    <option key={actor.id} value={actor.id}>
                      {member(actor.id)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("requirements.priority")}
                <select
                  className="glass-input"
                  name="priority"
                  defaultValue={requirement.priority}
                  disabled={busy}
                >
                  {["low", "normal", "high", "urgent"].map((priority) => (
                    <option key={priority} value={priority}>
                      {t("officeTasks.priority." + priority)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {editor.mode === "link_task" && (
            <label>
              {t("requirements.taskId")}
              <input
                className="glass-input"
                name="task_id"
                placeholder="T001"
                required
                disabled={busy}
              />
            </label>
          )}
          {editor.mode === "accept" && (
            <label>
              {t("requirements.acceptanceNote")}
              <textarea
                className="glass-input"
                name="note"
                rows={3}
                maxLength={8000}
                required
                disabled={busy}
                onKeyDown={submitRequirementOnEnter}
              />
            </label>
          )}
          <div className="office-tasks__actions">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setEditor(null);
                setError("");
              }}
            >
              {t("officeTasks.cancel")}
            </Button>
            <Button type="submit" size="sm" data-requirement-save={editor.mode} disabled={busy}>
              {t(
                busy
                  ? "requirements.saving"
                  : editor.mode === "accept"
                    ? "requirements.accept"
                    : "requirements.save",
              )}
            </Button>
          </div>
        </form>
      )}
      {error && (
        <p className="office-tasks__error" role="alert">
          {error}
        </p>
      )}
      <div className="office-requirements__linked">
        <h3>{t("requirements.linkedTasks")}</h3>
        {!tasks.length && <p>{t("requirements.noTasks")}</p>}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="office-requirements__task"
            data-requirement-task-id={task.id}
          >
            <div className="office-tasks__task-heading">
              <span className="office-tasks__id">{task.id}</span>
              {task.status === "archived" ? (
                <strong>{task.title || task.id}</strong>
              ) : (
                <button type="button" onClick={() => onOpenTask(task)}>
                  <strong>{task.title || task.id}</strong>
                </button>
              )}
            </div>
            <div className="office-tasks__meta">
              <span>{member(task.assignee)}</span>
              <span>{t("officeTasks.state." + officeTaskStateKey(task))}</span>
              {!task.assignee && task.suggested_assignee && (
                <span>
                  {t("requirements.suggested", { name: member(task.suggested_assignee) })}
                </span>
              )}
            </div>
            {task.outcome && <p>{task.outcome}</p>}
            {!!task.blocked_by?.length && (
              <p>
                {t("officeTasks.dependencies")} · {task.blocked_by.join(", ")}
              </p>
            )}
            {!readOnly && task.status === "planned" && available.length > 0 && (
              <form
                key={task.rev}
                className="office-requirements__assign"
                onSubmit={(event) => assign(event, task)}
              >
                <select
                  className="glass-input"
                  name="assignee"
                  aria-label={t("requirements.assign")}
                  required
                  disabled={busy}
                  defaultValue={
                    available.some(
                      (actor) => actor.id === (task.assignee || task.suggested_assignee),
                    )
                      ? task.assignee || task.suggested_assignee || ""
                      : ""
                  }
                >
                  <option value="">{t("requirements.selectMember")}</option>
                  {available.map((actor) => (
                    <option key={actor.id} value={actor.id}>
                      {member(actor.id)}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="outline" disabled={busy}>
                  {t("requirements.assign")}
                </Button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
