// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vite-plus/test";
import { createMessageSpeechController } from "./messageSpeech";

type Callbacks = {
  onPhase(phase: "connecting" | "reading"): void;
  onEnd(): void;
  onError(error: "failed" | "busy"): void;
};
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture() {
  const sessions: {
    text: string;
    language: string;
    callbacks: Callbacks;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }[] = [];
  const factory = (text: string, language: string, callbacks: Callbacks) => {
    const session = {
      text,
      language,
      callbacks,
      start: vi.fn(async () => {}),
      stop: vi.fn(async () => {}),
    };
    sessions.push(session);
    return session;
  };
  const controller = createMessageSpeechController(factory);
  controllers.push(controller);
  return { controller, sessions };
}
const controllers: ReturnType<typeof createMessageSpeechController>[] = [];
afterEach(async () => {
  for (const controller of controllers.splice(0)) await controller.stop();
});

it("连接 Codex 时保持选中，收到语音后切换为朗读状态", async () => {
  const { controller, sessions } = fixture();
  controller.toggle("one", "第一条消息。", "zh-CN");
  expect(controller.getActiveKey()).toBe("one");
  expect(controller.getSnapshot()).toEqual({ key: "one", phase: "connecting" });
  await Promise.resolve();
  expect(sessions[0].start).toHaveBeenCalledOnce();
  expect(sessions[0].text).toBe("第一条消息。");
  expect(sessions[0].language).toBe("zh-CN");
  sessions[0].callbacks.onPhase("reading");
  expect(controller.getSnapshot()).toEqual({ key: "one", phase: "reading" });
});

it("同一条可停止，换播时结束旧会话，旧回调不会影响新消息", async () => {
  const { controller, sessions } = fixture();
  controller.toggle("one", "第一条。", "zh-CN");
  await Promise.resolve();
  controller.toggle("two", "第二条。", "zh-CN");
  await vi.waitFor(() => expect(sessions[1].start).toHaveBeenCalledOnce());
  expect(sessions[0].stop).toHaveBeenCalledOnce();
  sessions[0].callbacks.onEnd();
  sessions[0].callbacks.onError("failed");
  expect(controller.getActiveKey()).toBe("two");
  await controller.stop("one");
  expect(controller.getActiveKey()).toBe("two");
  controller.toggle("two", "第二条。", "zh-CN");
  expect(controller.getActiveKey()).toBeNull();
  expect(sessions[1].stop).toHaveBeenCalledOnce();
});

it("换播会等待旧连接释放，快速跳过的中间消息不会开始朗读", async () => {
  const { controller, sessions } = fixture();
  controller.toggle("one", "第一条。", "zh-CN");
  await Promise.resolve();
  const cleanup = deferred();
  sessions[0].stop.mockReturnValue(cleanup.promise);
  controller.toggle("two", "第二条。", "zh-CN");
  controller.toggle("three", "第三条。", "zh-CN");
  await Promise.resolve();
  expect(sessions[1].start).not.toHaveBeenCalled();
  expect(sessions[2].start).not.toHaveBeenCalled();
  cleanup.resolve();
  await vi.waitFor(() => expect(sessions[2].start).toHaveBeenCalledOnce());
  expect(sessions[1].start).not.toHaveBeenCalled();
});

it("服务占用或连接失败后恢复，并且只提示当前消息的错误", async () => {
  const { controller, sessions } = fixture();
  const onError = vi.fn();
  controller.toggle("one", "测试。", "zh-CN", onError);
  await Promise.resolve();
  sessions[0].callbacks.onError("busy");
  expect(controller.getActiveKey()).toBeNull();
  expect(onError).toHaveBeenCalledExactlyOnceWith("busy");
  sessions[0].callbacks.onError("failed");
  expect(onError).toHaveBeenCalledOnce();
});

it("朗读完成和页面退出会释放自己的连接", async () => {
  const { controller, sessions } = fixture();
  controller.toggle("one", "测试。", "zh-CN");
  await Promise.resolve();
  sessions[0].callbacks.onEnd();
  expect(controller.getSnapshot()).toBeNull();
  expect(sessions[0].stop).toHaveBeenCalledOnce();
  controller.toggle("two", "测试。", "zh-CN");
  await Promise.resolve();
  window.dispatchEvent(new Event("pagehide"));
  expect(controller.getActiveKey()).toBeNull();
  expect(sessions[1].stop).toHaveBeenCalledOnce();
});

it("工厂异常和启动拒绝可恢复，不留下未处理的异步异常", async () => {
  const onError = vi.fn();
  const broken = createMessageSpeechController(() => {
    throw new Error("unavailable");
  });
  controllers.push(broken);
  broken.toggle("one", "测试。", "zh-CN", onError);
  expect(broken.getActiveKey()).toBeNull();
  expect(onError).toHaveBeenCalledWith("unavailable");
  const { controller, sessions } = fixture();
  controller.toggle("two", "测试。", "zh-CN", onError);
  sessions[0].start.mockRejectedValue(new Error("network"));
  await vi.waitFor(() => expect(controller.getActiveKey()).toBeNull());
  expect(onError).toHaveBeenLastCalledWith("failed");
});
