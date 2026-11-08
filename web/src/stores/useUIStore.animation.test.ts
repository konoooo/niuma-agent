// @vitest-environment happy-dom
import { beforeEach, expect, it, vi } from "vite-plus/test";

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

it("展开动画时消息仍然可见，切到终端再回来保留开关", async () => {
  const { groupMessagesVisible, useUIStore } = await import("./useUIStore");
  useUIStore.setState({ activeTab: "chat", isSmallScreen: false });
  expect(useUIStore.getState().setGroupAnimationVisible).toBeTypeOf("function");
  useUIStore.getState().setGroupAnimationVisible("group-a", true);
  expect(groupMessagesVisible("group-a", useUIStore.getState())).toBe(true);
  useUIStore.getState().setGroupWorkView("group-a", "terminals");
  expect(groupMessagesVisible("group-a", useUIStore.getState())).toBe(false);
  useUIStore.getState().setGroupWorkView("group-a", "messages");
  expect(useUIStore.getState().chatSessions["group-a"].animationVisible).toBe(true);
  expect(groupMessagesVisible("group-a", useUIStore.getState())).toBe(true);
});

it("刷新后按工作组分别保留动画开关", async () => {
  const { getChatSession, useUIStore } = await import("./useUIStore");
  expect(useUIStore.getState().setGroupAnimationVisible).toBeTypeOf("function");
  useUIStore.getState().setGroupAnimationVisible("group-a", true);
  useUIStore.getState().setGroupAnimationVisible("group-b", false);
  vi.resetModules();
  const reloaded = await import("./useUIStore");
  const sessions = reloaded.useUIStore.getState().chatSessions;
  expect(getChatSession("group-a", sessions).animationVisible).toBe(true);
  expect(getChatSession("group-b", sessions).animationVisible).toBe(false);
});

it("旧版动画视图设置迁移为消息视图加展开动画", async () => {
  localStorage.setItem(
    "cccc-chat-sessions",
    JSON.stringify({ "group-a": { workView: "animation" } }),
  );
  const { useUIStore } = await import("./useUIStore");
  expect(useUIStore.getState().chatSessions["group-a"]).toMatchObject({
    workView: "messages",
    animationVisible: true,
  });
});
