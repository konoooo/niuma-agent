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
import {
  requirementAction,
  type RequirementDetail,
  type RequirementSourcePreview,
  type RequirementSummary,
} from "../../../services/api";

type Props = {
  groupId: string;
  requirement?: RequirementSummary;
  onImported: (result: RequirementDetail) => void;
};

export function ObsidianImportButton({ groupId, requirement, onImported }: Props) {
  const { t } = useTranslation("chat");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<RequirementSourcePreview | null>(null);
  const pending = useRef(false);
  const actionLabel = t(requirement ? "requirements.readSource" : "requirements.importObsidian");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const fields = new FormData(event.currentTarget);
    const source = requirement
      ? { requirement_id: requirement.id }
      : {
          note_path: String(fields.get("note_path") || "").trim(),
          heading: String(fields.get("heading") || "").trim(),
        };
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (!preview) {
        const response = await requirementAction<RequirementSourcePreview>(groupId, {
          action: requirement ? "read_source" : "preview_source",
          ...source,
        });
        if (!response.ok) throw new Error(response.error.message);
        setPreview(response.result);
      } else {
        const response = await requirementAction(groupId, {
          action: requirement ? "refresh_source" : "import_source",
          ...source,
          source_version: preview.source_version,
          if_rev: preview.requirement_rev ?? undefined,
        });
        if (!response.ok) {
          if (
            response.error.code === "source_changed" ||
            response.error.code === "requirement_conflict"
          )
            setPreview(null);
          throw new Error(response.error.message);
        }
        setOpen(false);
        setPreview(null);
        onImported(response.result);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("requirements.actionFailed"));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending.current) {
          setOpen(next);
          setPreview(null);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" data-requirement-import>
          {actionLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="requirements-dialog">
        <DialogHeader>
          <DialogTitle>{actionLabel}</DialogTitle>
          <DialogDescription>
            {t(requirement ? "requirements.readSourceHelp" : "requirements.importHelp")}
          </DialogDescription>
        </DialogHeader>
        <form
          className="requirements-form"
          onSubmit={(event) => void submit(event)}
          onChange={() => {
            setPreview(null);
            setError("");
          }}
        >
          {requirement?.source.kind === "obsidian" ? (
            <p className="office-requirements__source">
              {requirement.source.note}
              {requirement.source.heading ? " · " + requirement.source.heading : ""}
            </p>
          ) : (
            <>
              <label>
                {t("requirements.notePath")}
                <input
                  className="glass-input"
                  name="note_path"
                  required
                  disabled={busy}
                  autoFocus
                />
              </label>
              <label>
                {t("requirements.noteHeading")}
                <input
                  className="glass-input"
                  name="heading"
                  disabled={busy}
                  placeholder={t("requirements.wholeNote")}
                />
              </label>
            </>
          )}
          {preview && (
            <div className="office-requirements__preview" data-requirement-source-preview>
              <strong>{preview.title}</strong>
              {preview.requirement_id && (
                <p>
                  {t(
                    preview.changed
                      ? "requirements.sourceChanged"
                      : "requirements.sourceAlreadyImported",
                    { id: preview.requirement_id },
                  )}
                </p>
              )}
              <pre>{preview.text}</pre>
            </div>
          )}
          {error && (
            <p className="office-tasks__error" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
              {t("officeTasks.cancel")}
            </Button>
            <Button type="submit" data-requirement-import-submit disabled={busy}>
              {t(
                busy
                  ? "requirements.saving"
                  : !preview
                    ? "requirements.preview"
                    : preview.changed
                      ? "requirements.applySource"
                      : preview.requirement_id
                        ? "requirements.openExisting"
                        : "requirements.import",
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
