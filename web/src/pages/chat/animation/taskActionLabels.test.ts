import { expect, it } from "vite-plus/test";
import zh from "../../../i18n/locales/zh/chat.json";
import { officeTaskStateKey } from "./officeTaskPresentation";
import type { Task } from "../../../types";

it("任务规划统一显示待办", () => {
  expect(zh.officeTasks.planned).toBe("待办");
  expect(zh.officeTasks.summaryEntry).toContain("待办");
});

it("停止中和已停止不会继续显示为普通进行中", () => {
  expect(
    officeTaskStateKey({
      id: "T1",
      status: "active",
      execution_control: { state: "stopping" },
    } as Task),
  ).toBe("stopping");
  expect(
    officeTaskStateKey({
      id: "T1",
      status: "active",
      execution_control: { state: "stopped" },
    } as Task),
  ).toBe("stopped");
});
