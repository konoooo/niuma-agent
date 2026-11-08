import { describe, expect, it } from "vite-plus/test";
import { getGroupMenuControls } from "./groupControls";
import zh from "../i18n/locales/zh/layout.json";

describe("工作组休息与续接菜单", () => {
  it("运行时只显示休息，休息或离线时只显示继续，避免两个停止入口混淆", () => {
    expect(getGroupMenuControls("run")).toEqual([{ control: "pause", labelKey: "pauseDelivery" }]);
    for (const status of ["paused", "idle"] as const)
      expect(getGroupMenuControls(status)).toEqual([
        { control: "activate", labelKey: "resumeDelivery" },
      ]);
    for (const status of ["stop", "offline", null] as const)
      expect(getGroupMenuControls(status)).toEqual([
        { control: "launch", labelKey: "launchAllAgents" },
      ]);
  });
  it("中文按钮直接表达上班和下班", () => {
    expect(zh.pauseDelivery).toBe("下班");
    expect(zh.resumeDelivery).toBe("上班");
    expect(zh.launchAllAgents).toBe("上班");
  });
});
