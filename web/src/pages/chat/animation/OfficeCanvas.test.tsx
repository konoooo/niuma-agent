// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vite-plus/test";
import type { Actor, LedgerEvent } from "../../../types";
import { OfficeCanvas, type OfficeActorView } from "./OfficeCanvas";
import { officePage } from "./officeProjection";

const fixture = vi.hoisted(() => ({
  submit: vi.fn(),
  dispose: vi.fn(),
  select: vi.fn(),
  taskForActor: undefined as undefined | ((id: string) => { detail?: string } | undefined),
  propClick: undefined as undefined | ((event: { propId: string }) => void),
  mounts: vi.fn(),
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({
    t: (key: string, options?: { activity?: string }) =>
      key === "animationOffice.statusHint" ? `状态提示：${options?.activity || ""}` : key,
  }),
}));
vi.mock("@pixoffice/renderer-pixi", () => ({
  AnimationRegistry: class {
    register() {
      return this;
    }
  },
  createAppearanceResolver: () => () => Promise.resolve({}),
  mountScene: async (
    _host: unknown,
    load: (signal: AbortSignal) => Promise<unknown>,
    options: { view: { onPropClick?: (event: { propId: string }) => void } },
  ) => {
    fixture.mounts();
    fixture.propClick = options.view.onPropClick;
    await load(new AbortController().signal);
    return {
      runtime: {
        sceneId: "office-1",
        readWorld: () => ({
          props: [
            { id: "whiteboard-1", templateId: "office.wall-whiteboard" },
            { id: "desk", templateId: "office.reference-workstation" },
          ],
        }),
        readActors: () =>
          ["office-lead", "code-agent"].map((id) => ({ id, presentation: { sourceRevision: 0 } })),
        submit: fixture.submit,
      },
      view: { selectActor: fixture.select },
      dispose: fixture.dispose,
    };
  },
}));
vi.mock("@pixoffice/animation-frame", () => ({ FrameAdapter: class {} }));
vi.mock("@pixoffice/assets-office/frame/resources", () => ({
  characterAssets: {},
  configureCharacterResources: vi.fn(),
}));
vi.mock("@pixoffice/scene-office/pixi", () => ({
  configureOfficeAssets: vi.fn(),
  createReferenceOfficePresentation: ({
    taskForActor,
  }: {
    taskForActor: typeof fixture.taskForActor;
  }) => {
    fixture.taskForActor = taskForActor;
    return {};
  },
}));
vi.mock("@pixoffice/scene-office/pixi/projection", () => ({ seatStepDurationMs: vi.fn() }));
vi.mock("@pixoffice/scene-office/core/poseSupport", () => ({ supportsOfficePose: vi.fn() }));
vi.mock("./officeScene", () => ({ officeScene: () => ({}) }));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

it("真实黑板命中打开任务，摘要更新不重新挂载场景", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const open = vi.fn();
  fixture.mounts.mockClear();
  const render = (loading: boolean) => (
    <OfficeCanvas
      groupId="g"
      actors={[]}
      members={[]}
      views={{}}
      events={[]}
      selectedId=""
      onSelect={vi.fn()}
      taskBoard={{ data: null, error: false, loading }}
      onOpenTasks={open}
    />
  );
  try {
    await act(async () => root.render(render(true)));
    fixture.propClick?.({ propId: "desk" });
    expect(open).not.toHaveBeenCalled();
    fixture.propClick?.({ propId: "whiteboard-1" });
    expect(open).toHaveBeenCalledOnce();
    await act(async () => root.render(render(false)));
    expect(fixture.mounts).toHaveBeenCalledOnce();
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("只为新到的实时消息播放一次互动，已停止的接收方不会假装接待", async () => {
  const actors: Actor[] = [{ id: "lead" }, { id: "worker" }];
  const members = officePage(actors, 0).members;
  const views: Record<string, OfficeActorView> = Object.fromEntries(
    actors.map((actor) => [
      actor.id,
      actor.id === "worker"
        ? { state: "stopped", stateLabel: "已停止", actionLabel: "", taskTitle: "" }
        : { state: "idle", stateLabel: "空闲", actionLabel: "", taskTitle: "" },
    ]),
  );
  const old: LedgerEvent = {
    id: "old",
    kind: "chat.message",
    by: "lead",
    data: { to: ["worker"], text: "旧消息" },
  };
  const fresh: LedgerEvent = {
    id: "new",
    kind: "chat.message",
    by: "lead",
    data: { to: ["worker"], text: "新消息" },
    _officeLiveAt: Date.now(),
  };
  const later: LedgerEvent = {
    id: "later",
    kind: "chat.message",
    by: "lead",
    data: { to: ["worker"], text: "再次发送" },
    _officeLiveAt: Date.now(),
  };
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const select = vi.fn();
  const render = (events: LedgerEvent[], actorViews = views) => (
    <OfficeCanvas
      groupId="g"
      actors={actors}
      members={members}
      views={actorViews}
      events={events}
      selectedId=""
      onSelect={select}
    />
  );
  fixture.submit.mockClear();
  await act(async () => {
    root.render(render([old]));
    await Promise.resolve();
  });
  expect(fixture.taskForActor?.("code-agent")?.detail).toBe("已停止");
  expect(
    fixture.submit.mock.calls.filter(([value]) => value.capability === "office.visit"),
  ).toHaveLength(0);
  await act(async () => root.render(render([old, fresh])));
  const visits = fixture.submit.mock.calls
    .map(([value]) => value)
    .filter((value) => value.capability === "office.visit");
  expect(visits).toHaveLength(0);
  expect(
    fixture.submit.mock.calls.filter(([value]) => value.capability === "scene.say"),
  ).toHaveLength(1);
  await act(async () => root.render(render([old, fresh])));
  expect(
    fixture.submit.mock.calls.filter(([value]) => value.capability === "scene.say"),
  ).toHaveLength(1);
  const activeViews: Record<string, OfficeActorView> = {
    ...views,
    worker: { ...views.worker, state: "idle", stateLabel: "空闲" },
  };
  await act(async () => root.render(render([old, fresh, later], activeViews)));
  const laterVisits = fixture.submit.mock.calls
    .map(([value]) => value)
    .filter((value) => value.capability === "office.visit");
  expect(laterVisits).toHaveLength(1);
  expect(laterVisits[0].params.stops).toEqual([{ hostId: "code-agent", message: "再次发送" }]);
  await act(async () => root.unmount());
  host.remove();
});

it("待答复徽标和终端确认分别触发对应操作", async () => {
  const actors: Actor[] = [{ id: "lead", runtime_confirmation_required: true }];
  const members = officePage(actors, 0).members;
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const openPending = vi.fn();
  const openTerminal = vi.fn();
  try {
    await act(async () => {
      root.render(
        <OfficeCanvas
          groupId="g"
          actors={actors}
          members={members}
          views={{ lead: { state: "waiting", stateLabel: "等待", actionLabel: "", taskTitle: "" } }}
          events={[]}
          selectedId=""
          onSelect={openTerminal}
          pendingCounts={{ lead: 2 }}
          onPendingActor={openPending}
        />,
      );
      await Promise.resolve();
    });
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[data-office-pending-actor="lead"]')!.click(),
    );
    expect(openPending).toHaveBeenCalledExactlyOnceWith("lead");
    expect(openTerminal).not.toHaveBeenCalled();
    await act(async () =>
      host.querySelector<HTMLButtonElement>('[data-office-terminal-confirmation="lead"]')!.click(),
    );
    expect(openTerminal).toHaveBeenCalledExactlyOnceWith("lead");
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

it("工作中的角色优先说真实进展，停止工作后结束气泡", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
  fixture.submit.mockReset();
  fixture.submit.mockImplementation((command) => ({
    status: "running",
    activityId: command.commandId,
  }));
  const actors: Actor[] = [{ id: "lead" }];
  const members = officePage(actors, 0).members;
  const working: Record<string, OfficeActorView> = {
    lead: {
      state: "working",
      stateLabel: "工作中",
      actionLabel: "执行命令",
      taskTitle: "",
      utterance: { id: "speech-1", text: "正在核对接口。", receivedAt: Date.now() },
    },
  };
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const select = vi.fn();
  const render = (views: Record<string, OfficeActorView>) => (
    <OfficeCanvas
      groupId="g"
      actors={actors}
      members={members}
      views={views}
      events={[]}
      selectedId=""
      onSelect={select}
    />
  );
  try {
    await act(async () => {
      root.render(render(working));
      await Promise.resolve();
      await Promise.resolve();
    });
    const speeches = fixture.submit.mock.calls
      .map(([value]) => value)
      .filter((value) => value.capability === "scene.say");
    expect(speeches).toHaveLength(1);
    expect(speeches[0].params.text).toBe("正在核对接口。");
    await act(async () => vi.advanceTimersByTime(2500));
    expect(
      fixture.submit.mock.calls.filter(([value]) => value.capability === "scene.say"),
    ).toHaveLength(1);
    await act(async () =>
      root.render(render({ lead: { ...working.lead, state: "idle", stateLabel: "空闲" } })),
    );
    expect(fixture.submit.mock.calls.some(([value]) => value.type === "activity.stop")).toBe(true);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    fixture.submit.mockReset();
    vi.useRealTimers();
  }
});

it("没有公开进展时，工作中的角色间隔显示状态提示", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(2_000_000);
  fixture.submit.mockReset();
  fixture.submit.mockImplementation((command) => ({
    status: "running",
    activityId: command.commandId,
  }));
  const actors: Actor[] = [{ id: "lead" }];
  const members = officePage(actors, 0).members;
  const views: Record<string, OfficeActorView> = {
    lead: { state: "working", stateLabel: "工作中", actionLabel: "执行命令", taskTitle: "" },
  };
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await act(async () => {
      root.render(
        <OfficeCanvas
          groupId="g"
          actors={actors}
          members={members}
          views={views}
          events={[]}
          selectedId=""
          onSelect={() => {}}
        />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(
      fixture.submit.mock.calls.filter(([value]) => value.capability === "scene.say"),
    ).toHaveLength(0);
    await act(async () => vi.advanceTimersByTime(10_000));
    const speeches = fixture.submit.mock.calls
      .map(([value]) => value)
      .filter((value) => value.capability === "scene.say");
    expect(speeches).toHaveLength(1);
    expect(speeches[0].params.text).toBe("状态提示：执行命令");
    await act(async () => vi.advanceTimersByTime(5_000));
    expect(
      fixture.submit.mock.calls.some(
        ([value]) => value.type === "activity.stop" && value.activityId === speeches[0].commandId,
      ),
    ).toBe(true);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    fixture.submit.mockReset();
    vi.useRealTimers();
  }
});
