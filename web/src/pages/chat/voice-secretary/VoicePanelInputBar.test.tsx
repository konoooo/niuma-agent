// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { VoicePanelInputBar } from "./VoicePanelInputBar";

describe("VoicePanelInputBar", () => {
  let host: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
  });

  const render = (props: Partial<Parameters<typeof VoicePanelInputBar>[0]> = {}) =>
    act(async () =>
      root.render(
        <VoicePanelInputBar
          isDark={false}
          recordLabel="Record into this document"
          recordDisabled={false}
          recording={false}
          recordingStarting={false}
          recordingTargetLabel="Recording into Notes"
          stopLabel="Stop & save"
          liveSnippet=""
          onToggleRecord={() => undefined}
          value="Summarize"
          onChange={() => undefined}
          placeholder="Ask"
          inputLabel="Request"
          actions={[]}
          {...props}
        />,
      ),
    );

  it("shows the pinned target and stop control while any recording is active", async () => {
    const toggle = vi.fn();
    await render({
      recording: true,
      recordDisabled: true,
      liveSnippet: "first words",
      captureHint: "No audio detected. Check the microphone if you are speaking.",
      onToggleRecord: toggle,
    });
    const record = host.querySelector<HTMLButtonElement>("[data-voice-record]")!;
    expect(host.querySelector("[data-voice-input-recording]")?.textContent).toContain(
      "Recording into Notes",
    );
    expect(host.textContent).toContain("first words");
    const hint = host.querySelector('[data-voice-input-silence][role="status"]');
    expect(hint?.textContent).toContain("No audio detected");
    expect(hint?.getAttribute("data-status-tone")).toBe("warning");
    expect(record.textContent).toBe("Stop & save");
    expect(record.disabled).toBe(false);
    expect(record.getAttribute("aria-pressed")).toBe("true");
    await act(async () => record.click());
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it("按 Enter 提交主要操作，⌘ + Enter 换行且输入法选字不提交", async () => {
    const update = vi.fn();
    const ask = vi.fn();
    const onChange = vi.fn();
    await render({
      onChange,
      actions: [
        { key: "ask", label: "Ask", onClick: ask },
        { key: "update", label: "Update", onClick: update, primary: true },
      ],
    });
    const field = host.querySelector("textarea")!;
    await act(async () => {
      field.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }),
      );
    });
    expect(update).not.toHaveBeenCalled();
    await act(async () => {
      field.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          metaKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(onChange).toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    await act(async () => {
      field.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
      );
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(ask).not.toHaveBeenCalled();
  });
});
