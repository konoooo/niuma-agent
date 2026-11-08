// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import { ActorLeaveDialog } from "./ActorLeaveDialog";
import { useGroupStore } from "../../stores";
import type { Actor } from "../../types";
import * as api from "../../services/api";

const t = (key: string) => key;
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t }) }));
vi.mock("../../services/api", () => ({ requestActorLeave: vi.fn(), fetchActorLeave: vi.fn() }));
vi.mock("../runtimeSwitch/runtimeSwitchState", () => ({ refreshRuntimeSwitchGroup: vi.fn() }));
const member: Actor = {
  id: "dev",
  generation: "gen-one",
  runtime: "codex",
  role: "peer",
  enabled: true,
};
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useGroupStore.setState({
    selectedGroupId: "g",
    groupDoc: null,
    actors: [member, { id: "manager", role: "foreman", runtime: "codex", enabled: true }],
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
async function render(actor: Actor) {
  await act(async () =>
    root.render(
      <ActorLeaveDialog isOpen onClose={vi.fn()} groupId="g" actor={actor} isDark={false} />,
    ),
  );
}
const submit = () =>
  [...document.body.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.textContent === "leave.submit",
  )!;

it("项目经理必须先指定代理才能发起离岗", async () => {
  await render({ ...member, role: "foreman" });
  expect(document.body.textContent).toContain("leave.deputyHint");
  expect(submit().disabled).toBe(true);
  expect(api.requestActorLeave).not.toHaveBeenCalled();
});

it("外部原生会话与尚不支持的运行时明确提示且不能提交", async () => {
  await render({ ...member, external_session_id: "external-owner" });
  expect(submit().disabled).toBe(true);
  expect(document.body.textContent).toContain("leave.external");
  await render({ ...member, runtime: "gemini" });
  expect(submit().disabled).toBe(true);
  expect(document.body.textContent).toContain("leave.unsupported");
});

it("普通员工选择立即离岗时携带当前身份和模式，关闭前不擅自提交", async () => {
  await render(member);
  expect(api.requestActorLeave).not.toHaveBeenCalled();
  const choice = [...document.body.querySelectorAll<HTMLButtonElement>("button")].find((item) =>
    item.textContent?.startsWith("leave.immediate"),
  )!;
  await act(async () => choice.click());
  const send = [...document.body.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.textContent === "leave.immediate",
  )!;
  vi.mocked(api.requestActorLeave).mockResolvedValue({
    ok: false,
    error: { code: "fixture_rejection", message: "测试未实际离岗" },
  });
  await act(async () => send.click());
  expect(api.requestActorLeave).toHaveBeenCalledWith("g", "dev", {
    immediate: true,
    deputyId: "",
    expectedGeneration: "gen-one",
  });
  expect(document.body.textContent).toContain("测试未实际离岗");
});
