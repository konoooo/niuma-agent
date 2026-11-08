import { expect, it } from "vite-plus/test";
import type { TaskPagesResult } from "../../../services/api/tasks";
import { officeTaskStateKey, renderOfficeTaskSummary } from "./officeTaskPresentation";

const tr = (key: string) => key;
const data: TaskPagesResult = {
  pages: {
    active: {
      tasks: Array.from({ length: 4 }, (_, i) => ({
        id: `T${i}`,
        title: `真实任务-${i}`,
        assignee: "dev",
        status: "active",
      })),
      totalCount: 47,
      count: 4,
      offset: 0,
      limit: 100,
      hasMore: true,
      totalCountKnown: true,
    } as TaskPagesResult["pages"]["active"],
    planned: {
      tasks: [],
      totalCount: 0,
      count: 0,
      offset: 0,
      limit: 100,
      hasMore: false,
      totalCountKnown: true,
    } as TaskPagesResult["pages"]["planned"],
  },
  facets: {
    statusCounts: { active: 47, planned: 0, done: 15 },
    blocked: 6,
    waitingUser: 0,
    pendingHandoffs: 0,
    unassigned: 0,
    assignees: ["dev"],
  },
  tasksVersion: "tasksv:1",
  taskIndex: [],
};

it("摘要使用全量统计，任务仅展示两项，空计划不会自动生成", () => {
  const html = renderOfficeTaskSummary(
    { data, loading: false, error: false },
    [{ id: "dev", title: "开发", runtime: "codex" }],
    false,
    tr,
  );
  expect(html).toContain("active 47");
  expect(html).toContain("blocked 6");
  expect(html).toContain("真实任务-0");
  expect(html).toContain("真实任务-1");
  expect(html).not.toContain("真实任务-2");
  expect(html).toContain("officeTasks.noPlans");
  expect(html).not.toContain("progressbar");
});

it("加载失败与尚未读取都不会伪装成零项任务", () => {
  const failed = renderOfficeTaskSummary(
    { data: null, loading: false, error: true },
    [],
    false,
    tr,
  );
  expect(failed).toContain("officeTasks.loadError");
  expect(failed).not.toContain("active 0");
  const loading = renderOfficeTaskSummary(
    { data: null, loading: true, error: false },
    [],
    false,
    tr,
  );
  expect(loading).toContain("officeTasks.loading");
  expect(loading).not.toContain("noPlans");
});

it("任务、成员和翻译均作为文字转义，历史结果有明确标记", () => {
  const unsafe = {
    ...data,
    pages: {
      ...data.pages,
      active: {
        ...data.pages.active!,
        tasks: [{ id: "T1", title: '<img src=x onerror="boom">', assignee: "manager" }],
      },
    },
  };
  const html = renderOfficeTaskSummary(
    { data: unsafe, loading: false, error: true },
    [{ id: "manager", title: "<领班>", role: "foreman", runtime: "codex" }],
    false,
    tr,
  );
  expect(html).toContain("&lt;img");
  expect(html).not.toContain("<img");
  expect(html).toContain("&lt;领班&gt;");
  expect(html).toContain("officeTasks.stale");
});

it("任务等待原因优先显示，任务已完成后不沿用旧等待标记", () => {
  expect(officeTaskStateKey({ id: "x", status: "active", waiting_on: "user" })).toBe("waitingUser");
  expect(officeTaskStateKey({ id: "x", status: "done", waiting_on: "actor" })).toBe("done");
  expect(officeTaskStateKey({ id: "x", status: "planned", blocked_by: ["T1"] })).toBe("blocked");
  expect(officeTaskStateKey({ id: "x", status: "active" })).toBe("active");
});
