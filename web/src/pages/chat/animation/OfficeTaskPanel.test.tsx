// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import { OfficeTaskPanel } from "./OfficeTaskPanel";
import * as api from "../../../services/api";
import type { TaskPagesResult, TaskPageResult } from "../../../services/api";
import type { Task } from "../../../types";
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("../../../services/api", () => ({
  fetchTaskPages: vi.fn(),
  fetchTaskPage: vi.fn(),
  fetchTaskById: vi.fn(),
}));
vi.mock("../../../components/SelectCombobox", () => ({
  SelectCombobox: ({
    items,
    value,
    onChange,
    ariaLabel,
  }: {
    items: Array<{ value: string; label: string }>;
    value: string;
    onChange: (v: string) => void;
    ariaLabel: string;
  }) => (
    <select aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)}>
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  ),
}));
const current: Task = {
  id: "T001",
  title: "真实任务第一项",
  status: "active",
  assignee: "dev",
  waiting_on: "actor",
  priority: "high",
};
const other: Task = {
  id: "T002",
  title: "其他成员负责的任务",
  status: "active",
  assignee: "receiver",
};
const facets = {
  statusCounts: { active: 31, planned: 1, done: 0 },
  blocked: 1,
  waitingUser: 0,
  pendingHandoffs: 0,
  unassigned: 0,
  assignees: ["dev", "receiver"],
};
const page = (
  tasks: Task[],
  total = tasks.length,
  hasMore = false,
  offset = 0,
): TaskPageResult => ({
  tasks,
  count: tasks.length,
  totalCount: total,
  totalCountKnown: true,
  hasMore,
  offset,
  limit: 30,
  tasksVersion: "tasksv:1",
  facets,
});
const pages = (active: Task[] = [current, other], hasMore = false): TaskPagesResult => ({
  pages: {
    active: page(active, hasMore ? 31 : active.length, hasMore),
    planned: page([
      { id: "T003", title: "领班登记的下一步计划", status: "planned", assignee: "dev" },
    ]),
    done: page([]),
  },
  facets,
  tasksVersion: "tasksv:1",
  taskIndex: [current, other],
});
let host: HTMLDivElement;
let root: Root;
const close = vi.fn();
const render = () =>
  act(async () =>
    root.render(
      <OfficeTaskPanel
        groupId="g"
        actors={[
          { id: "manager", runtime: "codex", title: "项目经理", role: "foreman" },
          { id: "dev", title: "开发", runtime: "codex" },
          { id: "receiver", title: "接手人", runtime: "claude" },
        ]}
        offDuty
        onClose={close}
      />,
    ),
  );
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  close.mockReset();
  vi.mocked(api.fetchTaskPages).mockReset().mockResolvedValue({ ok: true, result: pages() });
  vi.mocked(api.fetchTaskPage).mockReset();
  vi.mocked(api.fetchTaskById)
    .mockReset()
    .mockResolvedValue({
      ok: true,
      result: {
        task: {
          ...current,
          notes: "已有修改待验收",
          blocked_by: ["T002"],
          checklist: [{ id: "c1", text: "验证边界情况", status: "pending" }],
        },
        tasksVersion: "tasksv:1",
        deleteInfo: { allowed: true, total: 1, reason: "" },
      },
    });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("完整列表可加载摘要之外的任务，计划页签展示已登记的规划", async () => {
  vi.mocked(api.fetchTaskPages).mockResolvedValue({
    ok: true,
    result: pages(
      Array.from({ length: 30 }, (_, i) => ({ ...current, id: `T${i + 1}` })),
      true,
    ),
  });
  vi.mocked(api.fetchTaskPage).mockResolvedValue({
    ok: true,
    result: page([{ id: "T31", title: "第三十一项真实任务", status: "active" }], 31, false, 30),
  });
  await render();
  const more = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (b) => b.textContent === "officeTasks.loadMore",
  )!;
  await act(async () => more.click());
  expect(host.textContent).toContain("第三十一项真实任务");
  const planned = host.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1];
  await act(async () => planned.click());
  expect(host.textContent).toContain("领班登记的下一步计划");
  expect(host.textContent).not.toContain("第三十一项真实任务");
});

it("服务端省略零项状态统计时，成功读取后仍明确显示计划为零", async () => {
  const result = pages();
  result.pages.planned = page([]);
  result.facets = { ...facets, statusCounts: { active: 2 } };
  vi.mocked(api.fetchTaskPages).mockResolvedValue({ ok: true, result });
  await render();
  expect(host.querySelectorAll('[role="tab"]')[1].textContent).toContain("0");
});

it("任务详情来自服务端，按成员筛选后不会保留不匹配的旧详情任务", async () => {
  await render();
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[data-office-task-id="T001"]')!.click(),
  );
  expect(host.textContent).toContain("已有修改待验收");
  expect(host.textContent).toContain("验证边界情况");
  vi.mocked(api.fetchTaskPages).mockResolvedValue({ ok: true, result: pages([other]) });
  const select = host.querySelector<HTMLSelectElement>("select")!;
  await act(async () => {
    select.value = "receiver";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(host.textContent).not.toContain("真实任务第一项");
  expect(host.textContent).not.toContain("已有修改待验收");
  expect(host.textContent).toContain("其他成员负责的任务");
});

it("Escape 只处理面板内部，先关闭详情再返回办公室", async () => {
  await render();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  expect(close).not.toHaveBeenCalled();
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[data-office-task-id="T001"]')!.click(),
  );
  await act(async () =>
    host
      .querySelector("[data-office-task-panel]")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
  );
  expect(close).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain("已有修改待验收");
  await act(async () =>
    host
      .querySelector("[data-office-task-panel]")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
  );
  expect(close).toHaveBeenCalledOnce();
});
