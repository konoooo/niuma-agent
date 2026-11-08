// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import { useOfficeTasks } from "./useOfficeTasks";
import * as api from "../../../services/api/tasks";
import type { TaskPagesResult } from "../../../services/api/tasks";
vi.mock("../../../services/api/tasks", () => ({ fetchTaskPages: vi.fn() }));
let host: HTMLDivElement;
let root: Root;
let result: ReturnType<typeof useOfficeTasks>;
const response = (id: string) => ({
  ok: true as const,
  result: {
    pages: {},
    facets: {
      statusCounts: { active: 7 },
      blocked: 6,
      waitingUser: 0,
      pendingHandoffs: 0,
      unassigned: 0,
      assignees: [],
    },
    tasksVersion: id,
    taskIndex: [],
  } satisfies TaskPagesResult,
});
function Probe({ groupId, version }: { groupId: string; version?: string }) {
  result = useOfficeTasks(groupId, version);
  return <div>{result.data?.tasksVersion || "unloaded"}</div>;
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.mocked(api.fetchTaskPages).mockReset();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
it("切换工作组时丢弃旧请求，旧结果无法覆盖新组", async () => {
  let oldDone!: (v: ReturnType<typeof response>) => void;
  vi.mocked(api.fetchTaskPages)
    .mockReturnValueOnce(
      new Promise((resolve) => {
        oldDone = resolve;
      }),
    )
    .mockResolvedValueOnce(response("new-group"));
  await act(async () => root.render(<Probe groupId="old" />));
  await act(async () => root.render(<Probe groupId="new" />));
  await act(async () => oldDone(response("old-group")));
  expect(result.data?.tasksVersion).toBe("new-group");
  const first = vi.mocked(api.fetchTaskPages).mock.calls[0][1];
  expect(first.signal?.aborted).toBe(true);
});
it("任务版本变化刷新摘要，失败保留上次结果并提示，可手动重试", async () => {
  vi.mocked(api.fetchTaskPages)
    .mockResolvedValueOnce(response("tasksv:1"))
    .mockResolvedValueOnce({ ok: false, error: { code: "offline", message: "offline" } })
    .mockResolvedValueOnce(response("tasksv:2"));
  await act(async () => root.render(<Probe groupId="g" version="tasksv:1" />));
  await act(async () => root.render(<Probe groupId="g" version="tasksv:2" />));
  expect(result.error).toBe(true);
  expect(result.data?.tasksVersion).toBe("tasksv:1");
  await act(async () => result.refresh());
  expect(result.error).toBe(false);
  expect(result.data?.tasksVersion).toBe("tasksv:2");
});
