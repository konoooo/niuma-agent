// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vite-plus/test";
import { GroupOffDutyDialog } from "./GroupOffDutyDialog";
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { group?: string }) =>
      key + (options?.group ? ` ${options.group}` : ""),
  }),
}));
it("下班确认默认聚焦继续上班，只有确认按钮会执行停止", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const cancel = vi.fn(),
    confirm = vi.fn();
  try {
    await act(async () =>
      root.render(
        <GroupOffDutyDialog target={{ title: "研发组" }} onCancel={cancel} onConfirm={confirm} />,
      ),
    );
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("研发组");
    const button = (text: string) =>
      [...document.body.querySelectorAll<HTMLButtonElement>("button")].find(
        (item) => item.textContent === text,
      )!;
    expect(document.activeElement).toBe(button("groupRun.keepWorking"));
    await act(async () => button("groupRun.keepWorking").click());
    expect(cancel).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
    await act(async () => button("groupRun.confirmOffDuty").click());
    expect(confirm).toHaveBeenCalledOnce();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
