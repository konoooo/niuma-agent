// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vite-plus/test";
import { ChatOfficeSplit } from "./ChatOfficeSplit";

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("./animation/OfficeAnimationView", () => ({
  OfficeAnimationView: () => <div data-test-office />,
}));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

it("展开和收起动画时保留同一份消息、阅读位置和输入草稿", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const render = (showAnimation: boolean) => (
    <ChatOfficeSplit
      groupId="g"
      actors={[]}
      showAnimation={showAnimation}
      onInspectActor={() => {}}
      onOpenPending={() => {}}
    >
      <div data-history>原有消息</div>
      <textarea data-draft />
    </ChatOfficeSplit>
  );
  try {
    await act(async () => root.render(render(false)));
    const history = host.querySelector<HTMLElement>("[data-history]")!;
    const draft = host.querySelector<HTMLTextAreaElement>("[data-draft]")!;
    history.scrollTop = 37;
    draft.value = "尚未发送的内容";
    await act(async () => root.render(render(true)));
    expect(host.querySelector('[data-group-animation-view="visible"]')).not.toBeNull();
    expect(host.querySelector("[data-history]")).toBe(history);
    expect(host.querySelector("[data-draft]")).toBe(draft);
    expect(history.scrollTop).toBe(37);
    expect(draft.value).toBe("尚未发送的内容");
    await act(async () => root.render(render(false)));
    expect(host.querySelector("[data-group-animation-view]")).toBeNull();
    expect(host.querySelector("[data-history]")).toBe(history);
    expect(draft.value).toBe("尚未发送的内容");
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
