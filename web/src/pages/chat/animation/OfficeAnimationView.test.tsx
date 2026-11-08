// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vite-plus/test";
import { EMPTY_CHAT_BUCKET } from "../../../stores/groupStoreCore";
import { useGroupStore } from "../../../stores/useGroupStore";
import type { LedgerEvent } from "../../../types";
import {
  createPendingReplyStore,
  PendingReplyStoreContext,
  replyKey,
} from "../../../features/pendingReplies/store";
import { OfficeAnimationView } from "./OfficeAnimationView";

const pendingFixture = vi.hoisted(() => ({
  events: [] as LedgerEvent[],
  hasMore: false,
  loadMore: vi.fn(),
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../../../services/api/tasks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../services/api/tasks")>()),
  fetchTaskPage: vi.fn(async () => ({ ok: true, result: { tasks: [] } })),
  fetchTaskPages: vi.fn(async () => ({
    ok: true,
    result: {
      pages: {
        active: {
          items: [],
          tasks: [{ id: "T001", title: "当前真实工作", assignee: "worker", status: "active" }],
          totalCount: 7,
          count: 1,
          offset: 0,
          limit: 100,
          hasMore: false,
          totalCountKnown: true,
        },
        planned: {
          tasks: [{ id: "T002", title: "经理安排的下一项", assignee: "worker", status: "planned" }],
          totalCount: 2,
          count: 1,
          offset: 0,
          limit: 100,
          hasMore: false,
          totalCountKnown: true,
        },
        done: {
          tasks: [],
          totalCount: 0,
          count: 0,
          offset: 0,
          limit: 30,
          hasMore: false,
          totalCountKnown: true,
        },
      },
      facets: {
        statusCounts: { active: 7, planned: 2, done: 0 },
        blocked: 3,
        waitingUser: 0,
        pendingHandoffs: 0,
        unassigned: 0,
        assignees: ["worker"],
      },
      taskIndex: [],
      tasksVersion: "tasksv:1",
    },
  })),
}));
vi.mock("../../../features/pendingReplies/usePendingPages", () => ({
  usePendingPages: () => ({
    active: true,
    loaded: true,
    loading: false,
    hasMore: pendingFixture.hasMore,
    error: false,
    events: pendingFixture.events,
    loadMore: pendingFixture.loadMore,
  }),
}));
vi.mock("./OfficeCanvas", () => ({
  OfficeCanvas: ({
    views,
    events,
    onSelect,
    pendingCounts = {},
    onPendingActor,
    onOpenTasks,
  }: {
    views: Record<string, { utterance?: { text: string } | null; actionLabel: string }>;
    events: unknown[];
    onSelect: (id: string) => void;
    pendingCounts?: Record<string, number>;
    onPendingActor?: (id: string) => void;
    onOpenTasks?: () => void;
  }) => (
    <div data-office-canvas data-events={events.length}>
      {views.worker?.utterance?.text}
      {views.worker?.actionLabel}
      <button type="button" onClick={() => onSelect("worker")}>
        选择角色
      </button>
      <button type="button" onClick={onOpenTasks}>
        模拟点击黑板
      </button>
      {pendingCounts.worker ? (
        <button type="button" data-test-pending onClick={() => onPendingActor?.("worker")}>
          {pendingCounts.worker}
        </button>
      ) : null}
    </div>
  ),
}));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

afterEach(() => {
  useGroupStore.setState({ chatByGroup: {}, groupContext: null, groupDoc: null });
  pendingFixture.events = [];
  pendingFixture.hasMore = false;
  pendingFixture.loadMore.mockReset();
});

it("点击黑板只在动画区域内打开完整任务列表，并能返回办公室", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <OfficeAnimationView
          groupId="group-a"
          actors={[{ id: "worker", runtime: "codex", title: "开发" }]}
          onInspectActor={vi.fn()}
          onOpenPending={vi.fn()}
        />,
      ),
    );
    await act(async () =>
      [...host.querySelectorAll<HTMLButtonElement>("button")]
        .find((b) => b.textContent === "模拟点击黑板")!
        .click(),
    );
    const panel = host.querySelector("[data-office-task-panel]");
    expect(panel).not.toBeNull();
    expect(host.querySelector("[data-office-canvas]")).not.toBeNull();
    expect(panel?.textContent).toContain("当前真实工作");
    expect(document.querySelector('[aria-modal="true"]')).toBeNull();
    const close = panel!.querySelector<HTMLButtonElement>("[data-office-tasks-close]")!;
    await act(async () => close.click());
    expect(host.querySelector("[data-office-task-panel]")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("继续读取较早的待答复，避免遗漏不在首页的角色", async () => {
  pendingFixture.hasMore = true;
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <OfficeAnimationView
          groupId="group-a"
          actors={[]}
          onInspectActor={() => {}}
          onOpenPending={() => {}}
        />,
      ),
    );
    expect(pendingFixture.loadMore).toHaveBeenCalledOnce();
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("场景保留真实活动和互动数据，点击角色可以打开终端", async () => {
  const actors = [
    { id: "lead", title: "领班", running: true, effective_working_state: "idle" },
    {
      id: "worker",
      title: "开发工程师",
      running: true,
      effective_working_state: "working",
      effective_active_task_id: "turn-1",
    },
  ];
  useGroupStore.setState({
    chatByGroup: {
      "group-a": {
        ...EMPTY_CHAT_BUCKET,
        events: [
          {
            id: "m1",
            kind: "chat.message",
            by: "lead",
            data: { to: ["worker"], text: "请检查代码" },
          },
        ],
        rawHeadlessEventsByActorId: {
          worker: [
            {
              type: "headless.visual_activity",
              data: {
                turn_id: "turn-1",
                activity_id: "a",
                phase: "started",
                kind: "file_change",
                label: "app.ts",
              },
            },
            {
              id: "speech-1",
              type: "headless.visual_activity",
              _receivedAt: Date.now(),
              data: { turn_id: "turn-1", speech: "正在核对接口。" },
            },
          ],
        },
      },
    },
    groupContext: null,
  });
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const onInspectActor = vi.fn();
  await act(async () =>
    root.render(
      <OfficeAnimationView
        groupId="group-a"
        actors={actors}
        onInspectActor={onInspectActor}
        onOpenPending={() => {}}
      />,
    ),
  );
  expect(host.textContent).toContain("app.ts");
  expect(host.textContent).toContain("正在核对接口。");
  expect(host.querySelector("[data-office-canvas]")?.getAttribute("data-events")).toBe("1");
  expect(host.querySelector("aside")).toBeNull();
  await act(async () =>
    host.querySelector<HTMLButtonElement>("[data-office-canvas] button")!.click(),
  );
  expect(onInspectActor).toHaveBeenCalledWith("worker");
  await act(async () => root.unmount());
  host.remove();
});

it("只将有效待答复关联到对应角色，多条问题可选择原消息", async () => {
  const request = (id: string, text: string, replied = false): LedgerEvent => ({
    id,
    kind: "chat.message",
    by: "worker",
    data: { message_mode: "request_reply", to: ["user"], text },
    _user_request: { question: "none", requester: "available" },
    _obligation_status: {
      user: { reply_requested: true, replied, cancelled: false, delivery_state: "" },
    },
  });
  pendingFixture.events = [
    request("one", "第一个问题"),
    request("two", "第二个问题"),
    request("done", "已答复", true),
    { ...request("unknown", "未确认"), _user_request: undefined },
  ];
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const open = vi.fn();
  try {
    await act(async () =>
      root.render(
        <OfficeAnimationView
          groupId="group-a"
          actors={[{ id: "worker", running: true }]}
          onInspectActor={() => {}}
          onOpenPending={open}
        />,
      ),
    );
    expect(host.querySelector("[data-test-pending]")?.textContent).toBe("2");
    await act(async () => host.querySelector<HTMLButtonElement>("[data-test-pending]")!.click());
    expect(host.textContent).toContain("第一个问题");
    expect(host.textContent).toContain("第二个问题");
    expect(host.textContent).not.toContain("已答复");
    expect(host.textContent).not.toContain("未确认");
    await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    await act(async () => host.querySelector<HTMLButtonElement>("[data-test-pending]")!.click());
    const choice = [...host.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("第二个问题"),
    );
    await act(async () => choice!.click());
    expect(open).toHaveBeenCalledExactlyOnceWith("two");
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("单条待答复直接定位原消息，成功后不等待轮询立即移除徽标", async () => {
  pendingFixture.events = [
    {
      id: "one",
      kind: "chat.message",
      by: "worker",
      data: { message_mode: "request_reply", to: ["user"], text: "请确认" },
      _user_request: { question: "none", requester: "available" },
      _obligation_status: {
        user: { reply_requested: true, replied: false, cancelled: false, delivery_state: "" },
      },
    },
  ];
  const store = createPendingReplyStore();
  const key = replyKey("group-a", "one");
  const open = vi.fn();
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <PendingReplyStoreContext.Provider value={store}>
          <OfficeAnimationView
            groupId="group-a"
            actors={[{ id: "worker", running: true }]}
            onInspectActor={() => {}}
            onOpenPending={open}
          />
        </PendingReplyStoreContext.Provider>,
      ),
    );
    await act(async () => host.querySelector<HTMLButtonElement>("[data-test-pending]")!.click());
    expect(open).toHaveBeenCalledExactlyOnceWith("one");
    await act(async () => {
      store.getState().begin(key, { v: 1, text: "答复" }, () => "client-1");
      store.getState().complete(key, "client-1");
    });
    expect(host.querySelector("[data-test-pending]")).toBeNull();
    expect(host.querySelector("[data-office-pending-summary]")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
