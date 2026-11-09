// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import type { LedgerEvent, Task } from "../../../types";
import * as api from "../../../services/api";
import { useUIStore } from "../../../stores/useUIStore";
import { useGroupStore } from "../../../stores/useGroupStore";
import { OfficeTaskActions } from "./OfficeTaskActions";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("../../../services/api", () => ({
  fetchTaskControl: vi.fn(),
  requestTaskStop: vi.fn(),
  resumeTaskWork: vi.fn(),
  deleteControlledTask: vi.fn(),
  askTaskManager: vi.fn(),
}));
const task: Task = {
  id: "T001",
  rev: 3,
  title: "核对真实执行状态",
  status: "active",
  assignee: "dev",
};
const preview = (value: Task = task) => ({
  task: value,
  delete_token: "snapshot-v1",
  delete_info: { allowed: true, total: 2, reason: "" },
});
let host: HTMLDivElement;
let root: Root;
const updated = vi.fn();
const deleted = vi.fn();
const render = (value: Task = task) =>
  act(async () =>
    root.render(
      <OfficeTaskActions groupId="g" task={value} onUpdated={updated} onDeleted={deleted} />,
    ),
  );
const click = async (action: string) =>
  act(async () =>
    host.querySelector<HTMLButtonElement>('[data-task-action="' + action + '"]')!.click(),
  );
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.resetAllMocks();
  useUIStore.setState({ webReadOnly: false });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("停止请求等待真实回执，失败后刷新，重试保留同一个请求标识", async () => {
  vi.mocked(api.requestTaskStop)
    .mockRejectedValueOnce(new Error("连接中断"))
    .mockResolvedValue({
      ok: true,
      result: preview({ ...task, execution_control: { state: "stopping" } }),
    });
  await render();
  await click("stop");
  expect(host.textContent).toContain("连接中断");
  expect(updated).toHaveBeenCalledOnce();
  expect(host.querySelector<HTMLButtonElement>('[data-task-action="delete"]')!.disabled).toBe(true);
  await click("stop");
  const calls = vi.mocked(api.requestTaskStop).mock.calls;
  expect(calls[0][2]).toBe(calls[1][2]);
  expect(useUIStore.getState().notice?.message).toBe("officeTasks.stoppingNotice");
});

it("待办删除先核对最新快照，取消不删除，确认才删除整个子树", async () => {
  const planned = { ...task, status: "planned" };
  vi.mocked(api.fetchTaskControl).mockResolvedValue({ ok: true, result: preview(planned) });
  vi.mocked(api.deleteControlledTask).mockResolvedValue({
    ok: true,
    result: { deleted: true, task_id: "T001", deleted_task_ids: ["T001", "T003"] },
  });
  await render(planned);
  await click("delete");
  expect(api.deleteControlledTask).not.toHaveBeenCalled();
  const dialog = document.querySelector('[role="dialog"]')!;
  const cancel = [...dialog.querySelectorAll<HTMLButtonElement>("button")].find(
    (b) => b.textContent === "officeTasks.cancel",
  )!;
  expect(document.activeElement).toBe(cancel);
  await act(async () => cancel.click());
  expect(api.deleteControlledTask).not.toHaveBeenCalled();
  await click("delete");
  await act(async () =>
    document.querySelector<HTMLButtonElement>('[data-task-action="confirm-delete"]')!.click(),
  );
  expect(api.deleteControlledTask).toHaveBeenCalledWith("g", "T001", "snapshot-v1");
  expect(deleted).toHaveBeenCalledWith(["T001", "T003"]);
});

it("删除前发现运行中的子任务时拒绝打开确认，网络失败也不移除任务", async () => {
  const stopped = { ...task, execution_control: { state: "stopped" as const } };
  vi.mocked(api.fetchTaskControl)
    .mockResolvedValueOnce({
      ok: true,
      result: {
        ...preview(stopped),
        delete_info: { allowed: false, total: 2, reason: "subtask_not_stopped" },
      },
    })
    .mockResolvedValue({ ok: true, result: preview(stopped) });
  await render(stopped);
  await click("delete");
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(host.textContent).toContain("officeTasks.deleteSubtaskRunning");
  vi.mocked(api.deleteControlledTask).mockRejectedValue(new Error("删除结果未确认"));
  await click("delete");
  await act(async () =>
    document.querySelector<HTMLButtonElement>('[data-task-action="confirm-delete"]')!.click(),
  );
  expect(deleted).not.toHaveBeenCalled();
  expect(document.querySelector('[role="dialog"]')!.textContent).toContain("删除结果未确认");
});

it("提问使用 Enter 发送、组合键换行、输入法不误提交，真实消息进入当前群聊", async () => {
  const event: LedgerEvent = {
    id: "question-event",
    group_id: "g",
    kind: "chat.message",
    by: "user",
    ts: "2026-11-08T00:00:00Z",
    data: { text: "任务提问", to: ["manager"], message_mode: "request_reply" },
  };
  const append = vi.spyOn(useGroupStore.getState(), "appendEvent");
  vi.mocked(api.askTaskManager).mockResolvedValue({
    ok: true,
    result: { event, manager_id: "manager", awaiting_start: true },
  });
  await render();
  await click("ask");
  const input = host.querySelector<HTMLTextAreaElement>("textarea")!;
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
    setter.call(input, "请解释风险");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }),
    ),
  );
  expect(api.askTaskManager).not.toHaveBeenCalled();
  input.setSelectionRange(input.value.length, input.value.length);
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }),
    ),
  );
  expect(input.value).toBe("请解释风险\n");
  expect(api.askTaskManager).not.toHaveBeenCalled();
  await act(async () =>
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })),
  );
  expect(api.askTaskManager).toHaveBeenCalledWith("g", "T001", "请解释风险", expect.any(String));
  expect(append).toHaveBeenCalledWith(event, "g");
  expect(host.querySelector("textarea")).toBeNull();
  expect(useUIStore.getState().notice?.message).toBe("officeTasks.questionQueued");
  append.mockRestore();
});

it("只读页面不暴露任务写操作", async () => {
  useUIStore.setState({ webReadOnly: true });
  await render();
  expect(host.querySelector("button")).toBeNull();
});

it("通过普通 HTTP 访问时仍能生成停止请求标识", async () => {
  vi.stubGlobal("crypto", { getRandomValues: crypto.getRandomValues.bind(crypto) });
  vi.mocked(api.requestTaskStop).mockResolvedValue({
    ok: true,
    result: preview({ ...task, execution_control: { state: "stopping" } }),
  });
  await render();
  await click("stop");
  expect(api.requestTaskStop).toHaveBeenCalledWith(
    "g",
    task,
    expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
  );
});
