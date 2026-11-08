// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import { MessageBubble } from "./MessageBubble";
import { messageSpeech } from "../features/messageSpeech/messageSpeech";
import type { MessageSpeechCallbacks } from "../features/messageSpeech/messageSpeechTypes";
import type { LedgerEvent } from "../types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { resolvedLanguage: "zh" } }),
}));
const speech = vi.hoisted(() => ({
  supported: true,
  sessions: [] as {
    text: string;
    callbacks: MessageSpeechCallbacks;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }[],
}));
vi.mock("../features/messageSpeech/codexMessageSpeechSession", () => ({
  codexMessageSpeechAvailable: () => speech.supported,
  createCodexMessageSpeechSession: (
    text: string,
    _language: string,
    callbacks: MessageSpeechCallbacks,
  ) => {
    const session = { text, callbacks, start: vi.fn(async () => {}), stop: vi.fn(async () => {}) };
    speech.sessions.push(session);
    return session;
  },
}));
let host: HTMLDivElement;
let root: Root;
const message = (id: string, text: string): LedgerEvent => ({
  id,
  kind: "chat.message",
  by: "worker",
  ts: "2026-11-07T00:00:00Z",
  data: { text, to: ["user"], message_mode: "send" },
});
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  speech.sessions.length = 0;
  speech.supported = true;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  await messageSpeech.stop();
  host.remove();
});
const render = (events: LedgerEvent[], groupId = "g1", readOnly = false) =>
  act(async () =>
    root.render(
      <>
        {events.map((event) => (
          <MessageBubble
            key={event.id}
            event={event}
            groupId={groupId}
            readOnly={readOnly}
            actorById={new Map()}
            actors={[]}
            displayNameMap={new Map()}
            agentState={null}
            taskById={new Map()}
            isDark={false}
            groupLabelById={{}}
            onReply={() => {}}
            onShowRecipients={() => {}}
          />
        ))}
      </>,
    ),
  );
const speaker = (id = "one") =>
  host.querySelector<HTMLButtonElement>(`[data-message-read-aloud="${id}"]`)!;

it("消息时间旁的小喇叭显示连接状态，只把清洗后的正文交给 Codex", async () => {
  await render([
    message("one", "**你好**，请查看[说明](https://example.com)。\n\n```js\nsecret();\n```"),
  ]);
  const button = speaker();
  expect(button).not.toBeNull();
  expect(button.parentElement?.classList.contains("lcd-row-head")).toBe(true);
  await act(async () => button.click());
  expect(speech.sessions[0].text).toBe("你好，请查看说明。");
  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.title).toBe("messageSpeech.connecting");
  await act(async () => speech.sessions[0].callbacks.onPhase("reading"));
  expect(button.getAttribute("aria-busy")).not.toBe("true");
  expect(button.title).toBe("messageSpeech.stop");
  await act(async () => button.click());
  expect(speech.sessions[0].stop).toHaveBeenCalledOnce();
  expect(button.getAttribute("aria-pressed")).toBe("false");
});

it("换播另一条时结束旧朗读，旧事件不会影响新消息", async () => {
  await render([message("one", "第一条"), message("two", "第二条")]);
  await act(async () => speaker("one").click());
  const previous = speech.sessions[0];
  await act(async () => speaker("two").click());
  expect(previous.stop).toHaveBeenCalledOnce();
  expect(speaker("one").getAttribute("aria-pressed")).toBe("false");
  expect(speaker("two").getAttribute("aria-pressed")).toBe("true");
  await act(async () => previous.callbacks.onEnd());
  expect(speaker("two").getAttribute("aria-pressed")).toBe("true");
});

it("工作组切换和消息卸载时结束自己的朗读", async () => {
  await render([message("one", "可以朗读")], "g1");
  await act(async () => speaker().click());
  await render([message("one", "可以朗读")], "g2");
  expect(speech.sessions[0].stop).toHaveBeenCalledOnce();
  expect(speaker().getAttribute("aria-pressed")).toBe("false");
});

it("只读页面不发起后端语音会话，提供明确提示", async () => {
  await render([message("one", "只读消息")], "g1", true);
  expect(speaker().disabled).toBe(true);
  expect(speaker().title).toBe("messageSpeech.readOnly");
  await act(async () => speaker().click());
  expect(speech.sessions).toHaveLength(0);
});

it("不为未完成输出、空正文和纯代码消息显示朗读入口", async () => {
  await render([
    { ...message("stream", "尚在输出"), _streaming: true },
    message("empty", ""),
    message("code", "```sh\nrm file\n```"),
  ]);
  expect(host.querySelector("[data-message-read-aloud]")).toBeNull();
});

it("浏览器没有所需语音能力时显示明确的不可用提示", async () => {
  speech.supported = false;
  await render([message("one", "测试")]);
  expect(speaker().disabled).toBe(true);
  expect(speaker().title).toBe("messageSpeech.unavailable");
});
