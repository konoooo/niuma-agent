// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import { ActorLeaveCard } from "./ActorLeaveCard";
import { useGroupStore, useUIStore } from "../../stores";
import type { ActorLeave, GroupDoc } from "../../types";
import * as api from "../../services/api";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("../../services/api", () => ({ actOnActorLeave: vi.fn() }));
vi.mock("../runtimeSwitch/runtimeSwitchState", () => ({ refreshRuntimeSwitchGroup: vi.fn() }));

const initial: ActorLeave = {
  id: "leave-one",
  revision: 1,
  actor_id: "dev",
  actor_generation: "gen-one",
  manager_id: "manager",
  manager_generation: "gen-manager",
  status: "accepting",
  immediate: false,
  summary: "修改待验证，尚未完成验收。",
  summary_by: "dev",
  requested_at: "2026-11-07T00:00:00Z",
  updated_at: "2026-11-07T00:00:00Z",
  last_error: "",
  recall_summary: "",
  notify_attempt: 0,
  tasks: [
    {
      task_id: "T001",
      title: "完成验收",
      revision: 1,
      to: "receiver",
      to_generation: "gen-two",
      assignment_id: "assignment-one",
      transferred: false,
    },
  ],
};
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useGroupStore.setState({
    selectedGroupId: "g",
    groupDoc: { group_id: "g", actor_leaves: {} } as GroupDoc,
    actors: [{ id: "dev", runtime: "codex", generation: "gen-one", availability: "handoff" }],
  });
  useUIStore.setState({ webReadOnly: false });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
const button = (key: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((item) => item.textContent === key);

it("等待接手确认不会显示已移交或召回入口", async () => {
  await act(async () => root.render(<ActorLeaveCard groupId="g" record={initial} />));
  expect(host.textContent).toContain("leave.task.waiting");
  expect(host.textContent).not.toContain("leave.task.transferred");
  expect(button("leave.recall")).toBeUndefined();
});

it("召回响应立即展示返岗同步，旧群组快照不会覆盖最新状态", async () => {
  const away: ActorLeave = {
    ...initial,
    status: "away",
    revision: 2,
    tasks: initial.tasks.map((task) => ({ ...task, transferred: true })),
  };
  useGroupStore.setState({
    groupDoc: { group_id: "g", actor_leaves: { [away.id]: away } } as GroupDoc,
  });
  vi.mocked(api.actOnActorLeave).mockResolvedValue({
    ok: true,
    result: { leave: { ...away, status: "returning", revision: 3 } },
  });
  await act(async () => root.render(<ActorLeaveCard groupId="g" record={away} />));
  await act(async () => button("leave.recall")!.click());
  expect(api.actOnActorLeave).toHaveBeenCalledWith("g", "leave-one", "recall");
  expect(host.textContent).toContain("leave.status.returning");
  expect(button("leave.recall")).toBeUndefined();
  expect(host.textContent).toContain("leave.task.transferred");
});

it("只读页面和重建过的同名成员都不能操作历史交接卡", async () => {
  await act(async () => root.render(<ActorLeaveCard groupId="g" record={initial} readOnly />));
  expect(button("leave.cancel")).toBeUndefined();
  await act(async () => {
    useGroupStore.setState({
      actors: [{ id: "dev", runtime: "codex", generation: "new-generation" }],
    });
    root.render(<ActorLeaveCard groupId="g" record={initial} />);
  });
  expect(button("leave.cancel")).toBeUndefined();
});

it("立即停止但尚未交接的成员不会被误报为交接完成", async () => {
  await act(async () =>
    root.render(
      <ActorLeaveCard groupId="g" record={{ ...initial, immediate: true, status: "assigning" }} />,
    ),
  );
  expect(host.textContent).toContain("leave.status.stoppedPending");
  expect(host.textContent).not.toContain("leave.status.away");
  expect(button("leave.recall")).toBeUndefined();
});
