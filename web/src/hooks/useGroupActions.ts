// Explicit targets keep asynchronous Group actions independent of the current view.
import { useCallback, useRef, useState } from "react";
import { useGroupStore, useUIStore } from "../stores";
import * as api from "../services/api";
import type { GroupControl } from "../utils/groupControls";
import i18n from "../i18n";

export function useGroupActions() {
  const pending = useRef(false);
  const confirmationRef = useRef<{ groupId: string; title: string; control: GroupControl } | null>(
    null,
  );
  const [offDutyConfirmation, setOffDutyConfirmation] =
    useState<typeof confirmationRef.current>(null);
  const run = useCallback(
    async (groupId: string, control: GroupControl | "delete", confirmed = false) => {
      const gid = groupId.trim();
      if (!gid || pending.current || (confirmationRef.current && !confirmed)) return;
      const store = useGroupStore.getState();
      const title = store.groups.find((group) => group.group_id === gid)?.title || gid;
      if (!confirmed && (control === "pause" || control === "stop")) {
        confirmationRef.current = { groupId: gid, title, control };
        setOffDutyConfirmation(confirmationRef.current);
        return;
      }
      if (
        control === "delete" &&
        !window.confirm(i18n.t("actors:deleteGroupConfirm", { name: title }))
      )
        return;
      pending.current = true;
      const { setBusy, showError } = useUIStore.getState();
      const busyKey = `group-${control === "launch" ? "start" : control}`;
      setBusy(busyKey);
      try {
        if (control === "delete") {
          const response = await api.deleteGroup(gid);
          if (!response.ok)
            showError(
              `${title}: ${response.error.code === "actor_browser_busy" ? i18n.t("actors:runtimeSwitch.browserBusy") : response.error.message}`,
            );
          else if (useGroupStore.getState().selectedGroupId === gid) {
            // This setter already clears the selected view and handles its draft.
            useGroupStore.getState().setSelectedGroupId("");
          }
        } else {
          let response =
            control === "launch"
              ? await api.startGroup(gid)
              : control === "stop"
                ? await api.stopGroup(gid)
                : await api.setGroupState(gid, control === "pause" ? "paused" : "active");
          const recoveries = response.ok ? [...(response.result.recoveries || [])] : [];
          if (
            response.ok &&
            control === "activate" &&
            !(
              response.result.group.runtime_status?.runtime_running ?? response.result.group.running
            )
          ) {
            response = await api.startGroup(gid);
            if (response.ok) recoveries.push(...(response.result.recoveries || []));
          }
          if (!response.ok) showError(`${title}: ${response.error.message}`);
          else if (recoveries.length) {
            const current = useGroupStore.getState();
            const names = [
              ...new Set(
                recoveries.map((item) =>
                  current.selectedGroupId === gid
                    ? current.actors.find((actor) => actor.id === item.actor_id)?.title ||
                      item.actor_id
                    : item.actor_id,
                ),
              ),
            ].join("、");
            useUIStore
              .getState()
              .showNotice({
                message: i18n.t("layout:groupRun.recovered", { group: title, actors: names }),
              });
          }
        }
      } catch {
        showError(i18n.t("layout:groupRun.failed", { group: title }));
      } finally {
        try {
          // These store methods refresh by Group ID and guard navigation races.
          await useGroupStore.getState().refreshGroups();
          if (control !== "delete") await useGroupStore.getState().refreshActors(gid);
        } finally {
          pending.current = false;
          if (useUIStore.getState().busy === busyKey) setBusy("");
        }
      }
    },
    [],
  );
  const handleGroupControl = useCallback(
    (groupId: string, control: GroupControl) => run(groupId, control),
    [run],
  );
  const handleStartGroup = useCallback(
    () => run(useGroupStore.getState().selectedGroupId, "launch"),
    [run],
  );
  const handleDeleteGroup = useCallback((groupId: string) => run(groupId, "delete"), [run]);
  const cancelGroupOffDuty = useCallback(() => {
    confirmationRef.current = null;
    setOffDutyConfirmation(null);
  }, []);
  const confirmGroupOffDuty = useCallback(async () => {
    const target = confirmationRef.current;
    if (!target) return;
    confirmationRef.current = null;
    setOffDutyConfirmation(null);
    await run(target.groupId, target.control, true);
  }, [run]);
  return {
    handleStartGroup,
    handleGroupControl,
    handleDeleteGroup,
    offDutyConfirmation,
    cancelGroupOffDuty,
    confirmGroupOffDuty,
  };
}
