import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Task } from "../../../types";
import * as api from "../../../services/api";
import type { TaskControlPreview } from "../../../services/api";
import { useUIStore } from "../../../stores/useUIStore";
import { useGroupStore } from "../../../stores/useGroupStore";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { insertTextareaNewline, isComposingKey, isPlainEnter } from "../../../utils/textareaSubmit";
import { newClientId } from "../../../utils/clientId";

type Props = {
  groupId: string;
  task: Task;
  onUpdated: () => Promise<void> | void;
  onDeleted: (ids: string[]) => void;
};

export function OfficeTaskActions({ groupId, task, onUpdated, onDeleted }: Props) {
  const { t } = useTranslation("chat");
  const readOnly = useUIStore((state) => state.webReadOnly);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<TaskControlPreview | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const pending = useRef(false);
  const stopClient = useRef("");
  const questionClient = useRef({ text: "", id: "" });
  const cancel = useRef<HTMLButtonElement>(null);
  const questionId = useId();
  const live = task.status === "active";
  const control = task.execution_control;
  const stopped = control?.state === "stopped";
  const held = stopped || control?.state === "stopping";
  const deletable = task.status === "planned" || (live && stopped);
  const notice = (key: string) => useUIStore.getState().showNotice({ message: t(key) });
  const start = () => {
    if (readOnly || pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError("");
    return true;
  };
  const finish = () => {
    pending.current = false;
    setBusy(false);
  };
  const failure = (reason: unknown) =>
    setError(reason instanceof Error ? reason.message : t("officeTasks.actionFailed"));
  const run = async (action: "stop" | "resume") => {
    if (!start()) return;
    try {
      if (!stopClient.current) stopClient.current = newClientId();
      const response =
        action === "stop"
          ? await api.requestTaskStop(groupId, task, stopClient.current)
          : await api.resumeTaskWork(groupId, task);
      if (!response.ok) throw new Error(response.error.message);
      if (response.result.task?.id !== task.id) throw new Error(t("officeTasks.receiptUnknown"));
      stopClient.current = "";
      notice(
        action === "resume"
          ? "officeTasks.resumedNotice"
          : response.result.task.execution_control?.state === "stopped"
            ? "officeTasks.stoppedNotice"
            : "officeTasks.stoppingNotice",
      );
    } catch (reason) {
      failure(reason);
    } finally {
      await onUpdated();
      finish();
    }
  };
  const prepareDelete = async () => {
    if (!start()) return;
    try {
      const response = await api.fetchTaskControl(groupId, task.id);
      if (!response.ok) throw new Error(response.error.message);
      if (response.result.task?.id !== task.id || !response.result.delete_token)
        throw new Error(t("officeTasks.receiptUnknown"));
      if (!response.result.delete_info.allowed)
        throw new Error(
          t(
            response.result.delete_info.reason === "subtask_not_stopped"
              ? "officeTasks.deleteSubtaskRunning"
              : "officeTasks.deleteRequiresStop",
          ),
        );
      setPreview(response.result);
    } catch (reason) {
      failure(reason);
      await onUpdated();
    } finally {
      finish();
    }
  };
  const confirmDelete = async () => {
    if (!preview || !start()) return;
    try {
      const response = await api.deleteControlledTask(groupId, task.id, preview.delete_token);
      if (!response.ok) throw new Error(response.error.message);
      if (!response.result.deleted || response.result.task_id !== task.id)
        throw new Error(t("officeTasks.receiptUnknown"));
      setPreview(null);
      onDeleted(response.result.deleted_task_ids || [task.id]);
      notice("officeTasks.deletedNotice");
      await onUpdated();
    } catch (reason) {
      failure(reason);
      await onUpdated();
    } finally {
      finish();
    }
  };
  const sendQuestion = async () => {
    const text = question.trim();
    if (!text) {
      setError(t("officeTasks.questionRequired"));
      return;
    }
    if (!start()) return;
    try {
      if (questionClient.current.text !== text || !questionClient.current.id)
        questionClient.current = { text, id: newClientId() };
      const response = await api.askTaskManager(groupId, task.id, text, questionClient.current.id);
      if (!response.ok) throw new Error(response.error.message);
      const event = response.result.event;
      if (!event?.id || event.group_id !== groupId || event.kind !== "chat.message")
        throw new Error(t("officeTasks.receiptUnknown"));
      useGroupStore.getState().appendEvent(event, groupId);
      questionClient.current = { text: "", id: "" };
      setQuestion("");
      setAskOpen(false);
      notice(
        response.result.awaiting_start ? "officeTasks.questionQueued" : "officeTasks.questionSent",
      );
    } catch (reason) {
      failure(reason);
    } finally {
      finish();
    }
  };
  if (readOnly) return null;
  return (
    <div className="office-tasks__actions-area" aria-busy={busy}>
      <div className="office-tasks__actions">
        {live && !stopped && (
          <Button
            size="sm"
            variant="outline"
            data-task-action="stop"
            title={t("officeTasks.stopScope")}
            disabled={busy}
            onClick={() => void run("stop")}
          >
            {t(held ? "officeTasks.retryStop" : "officeTasks.stop")}
          </Button>
        )}
        {live && held && (
          <Button
            size="sm"
            variant="outline"
            data-task-action="resume"
            disabled={busy}
            onClick={() => void run("resume")}
          >
            {t(stopped ? "officeTasks.resume" : "officeTasks.cancelStop")}
          </Button>
        )}
        {(live || task.status === "planned") && (
          <Button
            size="sm"
            variant="outline"
            data-task-action="delete"
            title={deletable ? undefined : t("officeTasks.deleteRequiresStop")}
            disabled={busy || !deletable}
            onClick={() => void prepareDelete()}
          >
            {t("officeTasks.delete")}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          data-task-action="ask"
          disabled={busy}
          aria-expanded={askOpen}
          onClick={() => {
            setAskOpen(!askOpen);
            setError("");
          }}
        >
          {t("officeTasks.ask")}
        </Button>
      </div>
      {askOpen && (
        <div
          className="office-tasks__question"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              if (!busy) setAskOpen(false);
            }
          }}
        >
          <label htmlFor={questionId}>{t("officeTasks.askTitle")}</label>
          <textarea
            id={questionId}
            className="glass-input"
            data-task-question
            value={question}
            maxLength={2000}
            rows={3}
            autoFocus
            disabled={busy}
            placeholder={t("officeTasks.questionPlaceholder")}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || isComposingKey(event)) return;
              if (event.metaKey || event.ctrlKey)
                insertTextareaNewline(event, (value) => setQuestion(value));
              else if (isPlainEnter(event)) {
                event.preventDefault();
                void sendQuestion();
              }
            }}
          />
          <div className="office-tasks__actions">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setAskOpen(false)}>
              {t("officeTasks.cancel")}
            </Button>
            <Button
              size="sm"
              data-task-action="send-question"
              disabled={busy || !question.trim()}
              onClick={() => void sendQuestion()}
            >
              {t("officeTasks.sendQuestion")}
            </Button>
          </div>
        </div>
      )}
      {error && !preview && (
        <p className="office-tasks__error" role="alert">
          {error}
        </p>
      )}
      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setPreview(null);
            setError("");
          }
        }}
      >
        <DialogContent
          className="office-tasks__delete-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancel.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {t("officeTasks.deleteTitle", { title: preview?.task.title || task.id })}
            </DialogTitle>
            <DialogDescription>
              {t("officeTasks.deleteDescription", { count: preview?.delete_info.total || 1 })}
            </DialogDescription>
          </DialogHeader>
          <p className="office-tasks__id">{task.id}</p>
          {error && (
            <p className="office-tasks__error" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button ref={cancel} variant="outline" disabled={busy} onClick={() => setPreview(null)}>
              {t("officeTasks.cancel")}
            </Button>
            <Button
              variant="destructive"
              data-task-action="confirm-delete"
              disabled={busy}
              onClick={() => void confirmDelete()}
            >
              {t("officeTasks.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
