import { useEffect, useState } from "react";
import { fetchTaskPages, type TaskPagesResult } from "../../../services/api/tasks";

export type OfficeTasksState = { data: TaskPagesResult | null; loading: boolean; error: boolean };

export function useOfficeTasks(groupId: string, tasksVersion?: string) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<OfficeTasksState & { groupId: string }>({
    groupId,
    data: null,
    loading: true,
    error: false,
  });
  useEffect(() => {
    const controller = new AbortController();
    setState((old) => ({
      groupId,
      data: old.groupId === groupId ? old.data : null,
      loading: true,
      error: false,
    }));
    void fetchTaskPages(groupId, {
      statuses: ["active", "planned"],
      limit: 100,
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) return;
        setState((old) => ({
          groupId,
          data: response.ok ? response.result : old.groupId === groupId ? old.data : null,
          loading: false,
          error: !response.ok,
        }));
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState((old) => ({ ...old, groupId, loading: false, error: true }));
      });
    return () => controller.abort();
  }, [groupId, tasksVersion, attempt]);
  return {
    ...(state.groupId === groupId ? state : { data: null, loading: true, error: false }),
    refresh: () => setAttempt((value) => value + 1),
  };
}
