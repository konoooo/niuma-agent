import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { FileIcon } from "../../../components/Icons";
import { requirementAction, type RequirementDetail } from "../../../services/api";
import { useGroupStore } from "../../../stores/useGroupStore";
import { useUIStore } from "../../../stores/useUIStore";
import { newClientId } from "../../../utils/clientId";
import { submitRequirementOnEnter } from "./requirementFormKeys";
import "./requirements.css";

type Props = {
  groupId: string;
  compact?: boolean;
  disabled?: boolean;
  onCreated?: (result: RequirementDetail) => void;
};

export function RequirementIssueButton({ groupId, compact, disabled, onCreated }: Props) {
  const { t } = useTranslation("chat");
  const readOnly = useUIStore((state) => state.webReadOnly);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sending = useRef(false);
  const request = useRef({ key: "", id: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || readOnly || disabled) return;
    const fields = new FormData(event.currentTarget);
    const title = String(fields.get("title") || "").trim();
    const description = String(fields.get("description") || "").trim();
    if (!title || !description) {
      setError(t("requirements.required"));
      return;
    }
    const key = JSON.stringify([groupId, title, description]);
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      if (request.current.key !== key) request.current = { key, id: newClientId() };
      const response = await requirementAction(groupId, {
        action: "issue",
        title,
        description,
        client_id: request.current.id,
      });
      if (!response.ok) throw new Error(response.error.message);
      const result = response.result;
      if (
        !result.requirement?.id ||
        !result.event?.id ||
        result.event.kind !== "chat.message" ||
        result.event.group_id !== groupId
      ) {
        throw new Error(t("requirements.receiptUnknown"));
      }
      useGroupStore.getState().appendEvent(result.event, groupId);
      useUIStore
        .getState()
        .showNotice({ message: t("requirements.issued", { id: result.requirement.id }) });
      request.current = { key: "", id: "" };
      setOpen(false);
      onCreated?.(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("requirements.actionFailed"));
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  if (readOnly || !groupId) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!sending.current) {
          setOpen(next);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={compact ? "ghost" : "outline"}
          disabled={disabled}
          data-requirement-issue
          className={compact ? "requirement-issue--composer" : undefined}
          title={t("requirements.issue")}
          aria-label={t("requirements.issue")}
        >
          {compact && <FileIcon className="h-4 w-4" />}
          <span>{t("requirements.issue")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="requirements-dialog">
        <DialogHeader>
          <DialogTitle>{t("requirements.issue")}</DialogTitle>
          <DialogDescription>{t("requirements.issueHelp")}</DialogDescription>
        </DialogHeader>
        <form className="requirements-form" onSubmit={(event) => void submit(event)}>
          <label>
            {t("requirements.title")}
            <input
              className="glass-input"
              name="title"
              maxLength={160}
              required
              autoFocus
              disabled={busy}
            />
          </label>
          <label>
            {t("requirements.description")}
            <textarea
              className="glass-input"
              name="description"
              rows={5}
              maxLength={16000}
              required
              disabled={busy}
              onKeyDown={submitRequirementOnEnter}
            />
          </label>
          {error && (
            <p className="office-tasks__error" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
              {t("officeTasks.cancel")}
            </Button>
            <Button type="submit" data-requirement-submit disabled={busy}>
              {t(busy ? "requirements.saving" : "requirements.publish")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
