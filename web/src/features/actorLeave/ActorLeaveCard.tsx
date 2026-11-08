import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Actor, ActorLeave } from "../../types";
import { actorGenerationIdentity } from "../../utils/actorIdentity";
import { useGroupStore, useUIStore } from "../../stores";
import * as api from "../../services/api";
import { refreshRuntimeSwitchGroup } from "../runtimeSwitch/runtimeSwitchState";
import { Button } from "../../components/ui/button";
const EMPTY_ACTORS: Actor[] = [];

export function ActorLeaveCard({
  groupId,
  record: initial,
  readOnly = false,
  onUpdated,
}: {
  groupId: string;
  record: ActorLeave;
  readOnly?: boolean;
  onUpdated?: (record: ActorLeave) => void;
}) {
  const { t } = useTranslation("actors");
  const live = useGroupStore((state) =>
    state.groupDoc?.group_id === groupId ? state.groupDoc.actor_leaves?.[initial.id] : undefined,
  );
  const actors = useGroupStore((state) =>
    state.selectedGroupId === groupId ? state.actors : EMPTY_ACTORS,
  );
  const webReadOnly = useUIStore((state) => state.webReadOnly);
  const waitingForGroup = useGroupStore((state) =>
    state.groupDoc?.group_id === groupId
      ? !state.groupDoc.running || state.groupDoc.state !== "active"
      : false,
  );
  const [local, setLocal] = useState<ActorLeave | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const record =
    live && (!local || (live.revision ?? 0) >= (local.revision ?? 0))
      ? live
      : local || live || initial;
  const member = (id: string) => actors.find((actor) => actor.id === id)?.title || id;
  const pending = ["preparing", "assigning", "accepting", "finalizing"].includes(record.status);
  const source = actors.find((actor) => actor.id === record.actor_id);
  const canAct =
    !readOnly &&
    !webReadOnly &&
    Boolean(source && actorGenerationIdentity(source) === record.actor_generation);
  const status = record.immediate && pending ? "stoppedPending" : record.status;
  const action = async (kind: "force" | "recall" | "retry" | "cancel") => {
    setBusy(kind);
    setError("");
    try {
      const response = await api.actOnActorLeave(groupId, record.id, kind);
      if (!response.ok) throw new Error(response.error.message);
      setLocal(response.result.leave);
      onUpdated?.(response.result.leave);
      await refreshRuntimeSwitchGroup(groupId);
    } catch (error) {
      setError(error instanceof Error ? error.message : t("leave.failed"));
    } finally {
      setBusy("");
    }
  };
  const tasks = expanded ? record.tasks : record.tasks.slice(0, 5);
  return (
    <section
      className="min-w-0 space-y-3 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--glass-panel-bg)] p-3 sm:p-4"
      data-actor-leave-card
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold">
          {t("leave.cardTitle", { actor: member(record.actor_id) })}
        </div>
        <span className="lcd-tag">{t(`leave.status.${status}`)}</span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        {t("leave.manager", { actor: member(record.manager_id) })}
      </p>
      {waitingForGroup && (pending || record.status === "returning") && (
        <p role="status" className="text-xs text-[var(--color-text-secondary)]">
          {t("leave.waitingForGroup")}
        </p>
      )}
      {record.summary ? (
        <div className="space-y-1">
          <div className="text-xs text-[var(--color-text-muted)]">
            {t("leave.summaryBy", { actor: member(record.summary_by) })}
          </div>
          <p className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-sm">
            {record.summary}
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-secondary)]">{t("leave.waitingSummary")}</p>
      )}
      {tasks.length ? (
        <div className="divide-y divide-[var(--glass-border-subtle)] border-y border-[var(--glass-border-subtle)]">
          {tasks.map((task) => (
            <div key={task.task_id} className="space-y-1.5 py-2.5">
              <div className="break-words text-sm">
                <span className="mr-2 font-mono text-xs text-[var(--color-text-muted)]">
                  {task.task_id}
                </span>
                {task.title}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span>
                  {task.closed
                    ? t("leave.noTransferNeeded")
                    : task.to
                      ? `${member(record.actor_id)} → ${member(task.to)}`
                      : t("leave.unassigned")}
                </span>
                <span className="text-[var(--color-text-secondary)]">
                  {t(
                    `leave.task.${task.closed ? "closed" : task.transferred ? "transferred" : task.accepted_at ? "accepted" : task.to ? "waiting" : "unassigned"}`,
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-text-muted)]">{t("leave.noBoardTasks")}</p>
      )}
      {record.tasks.length > 5 && (
        <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
          {t(expanded ? "leave.collapse" : "leave.expand", { count: record.tasks.length })}
        </Button>
      )}
      {record.status === "returning" && (
        <p className="text-sm text-[var(--color-text-secondary)]">{t("leave.returningHint")}</p>
      )}
      {record.recall_summary && (
        <p className="whitespace-pre-wrap break-words text-sm">{record.recall_summary}</p>
      )}
      {(error || record.last_error) && (
        <p role="alert" className="text-sm text-[var(--color-text-secondary)]">
          {error || record.last_error}
        </p>
      )}
      {canAct && (
        <div className="flex flex-wrap gap-2">
          {record.status === "away" && (
            <Button size="sm" onClick={() => void action("recall")} disabled={!!busy}>
              {t("leave.recall")}
            </Button>
          )}
          {(pending || record.status === "returning") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void action("retry")}
              disabled={!!busy}
            >
              {t("leave.retry")}
            </Button>
          )}
          {pending && (
            <>
              {source?.availability !== "away" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void action("force")}
                  disabled={!!busy}
                >
                  {t("leave.immediate")}
                </Button>
              )}
              {record.status !== "finalizing" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void action("cancel")}
                  disabled={!!busy}
                >
                  {t("leave.cancel")}
                </Button>
              )}
            </>
          )}
        </div>
      )}
      <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
        {t("leave.ownershipHint")}
      </p>
    </section>
  );
}
