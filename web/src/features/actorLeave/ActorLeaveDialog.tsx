import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Actor, ActorLeave } from "../../types";
import { useGroupStore } from "../../stores";
import * as api from "../../services/api";
import { actorGenerationIdentity } from "../../utils/actorIdentity";
import { refreshRuntimeSwitchGroup } from "../runtimeSwitch/runtimeSwitchState";
import { useModalA11y } from "../../hooks/useModalA11y";
import { ModalFrame } from "../../components/modals/ModalFrame";
import { SelectCombobox } from "../../components/SelectCombobox";
import { Button } from "../../components/ui/button";
import { ActorLeaveCard } from "./ActorLeaveCard";
import { createPortal } from "react-dom";
const EMPTY_ACTORS: Actor[] = [];

export function ActorLeaveDialog({
  isOpen,
  onClose,
  groupId,
  actor,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  actor: Actor;
  isDark: boolean;
}) {
  const { t } = useTranslation("actors");
  const titleId = useId();
  const { modalRef } = useModalA11y(isOpen, onClose);
  const actors = useGroupStore((state) =>
    state.selectedGroupId === groupId ? state.actors : EMPTY_ACTORS,
  );
  const live = useGroupStore((state) =>
    state.groupDoc?.group_id === groupId && actor.leave_id
      ? state.groupDoc.actor_leaves?.[actor.leave_id]
      : undefined,
  );
  const [record, setRecord] = useState<ActorLeave | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [immediate, setImmediate] = useState(false);
  const [deputy, setDeputy] = useState("");
  const unavailable = !!actor.availability && actor.availability !== "available";
  const isManager = actor.role === "foreman";
  const supported = actor.runtime === "codex" || actor.runtime === "claude";
  useEffect(() => {
    if (!isOpen) return;
    setRecord(null);
    setError("");
    setImmediate(false);
    setDeputy("");
    if (!actor.leave_id) return;
    let current = true;
    void api
      .fetchActorLeave(groupId, actor.leave_id)
      .then((response) => {
        if (!current) return;
        if (response.ok) setRecord(response.result.leave);
        else setError(response.error.message);
      })
      .catch((error) => {
        if (current) setError(error instanceof Error ? error.message : t("leave.failed"));
      });
    return () => {
      current = false;
    };
  }, [isOpen, groupId, actor.id, actor.leave_id, t]);
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await api.requestActorLeave(groupId, actor.id, {
        immediate,
        deputyId: deputy,
        expectedGeneration: actorGenerationIdentity(actor),
      });
      if (!response.ok) throw new Error(response.error.message);
      setRecord(response.result.leave);
      await refreshRuntimeSwitchGroup(groupId);
    } catch (error) {
      setError(error instanceof Error ? error.message : t("leave.failed"));
    } finally {
      setBusy(false);
    }
  };
  if (!isOpen) return null;
  const current = live || record;
  return createPortal(
    <ModalFrame
      isOpen
      isDark={isDark}
      onClose={onClose}
      titleId={titleId}
      title={t(current || unavailable ? "leave.manage" : "leave.request")}
      closeAriaLabel={t("common:close")}
      closeDisabled={busy}
      modalRef={modalRef}
      panelClassName="w-full h-full sm:h-auto sm:w-[min(100vw-2rem,42rem)] sm:max-h-[calc(100dvh-4rem)]"
      footerActions={
        <Button variant="secondary" disabled={busy} onClick={onClose}>
          {t("common:done")}
        </Button>
      }
    >
      <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-5">
        {current ? (
          <ActorLeaveCard groupId={groupId} record={current} onUpdated={setRecord} />
        ) : unavailable ? (
          <p role="status">{error || t("leave.loading")}</p>
        ) : (
          <>
            <p className="text-sm leading-relaxed">
              {t("leave.requestHint", { actor: actor.title || actor.id })}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[false, true].map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  data-lcd-key
                  className={`rounded-xl border p-3 text-left ${immediate === value ? "border-[var(--color-text-primary)] bg-[var(--glass-tab-bg)]" : "border-[var(--glass-border-subtle)]"}`}
                  onClick={() => setImmediate(value)}
                  disabled={busy}
                  aria-pressed={immediate === value}
                >
                  <span className="block text-sm font-medium">
                    {t(value ? "leave.immediate" : "leave.normal")}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-[var(--color-text-muted)]">
                    {t(value ? "leave.immediateHint" : "leave.normalHint")}
                  </span>
                </button>
              ))}
            </div>
            {isManager && (
              <div className="space-y-2">
                <p className="text-sm">{t("leave.deputyHint")}</p>
                <SelectCombobox
                  ariaLabel={t("leave.deputy")}
                  placeholder={t("leave.chooseDeputy")}
                  value={deputy}
                  onChange={setDeputy}
                  disabled={busy}
                  searchable
                  className="glass-input min-h-[40px] w-full rounded-xl border px-3 py-2 text-sm"
                  items={actors
                    .filter(
                      (candidate) =>
                        candidate.id !== actor.id &&
                        candidate.enabled !== false &&
                        !candidate.internal_kind &&
                        (!candidate.availability || candidate.availability === "available"),
                    )
                    .map((candidate) => ({
                      value: candidate.id,
                      label: candidate.title || candidate.id,
                    }))}
                />
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm">
                {error}
              </p>
            )}
            <Button
              onClick={() => void submit()}
              disabled={busy || !supported || !!actor.external_session_id || (isManager && !deputy)}
            >
              {t(immediate ? "leave.immediate" : "leave.submit")}
            </Button>
            {actor.external_session_id && (
              <p className="text-xs text-[var(--color-text-muted)]">{t("leave.external")}</p>
            )}
            {!supported && (
              <p className="text-xs text-[var(--color-text-muted)]">{t("leave.unsupported")}</p>
            )}
          </>
        )}
      </div>
    </ModalFrame>,
    document.body,
  );
}
