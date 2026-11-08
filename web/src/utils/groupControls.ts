import type { GroupStatusKey } from "./groupStatus";

export type GroupControl = "launch" | "activate" | "pause" | "stop";

export type GroupMenuControl = {
  control: GroupControl;
  labelKey: "launchAllAgents" | "resumeDelivery" | "pauseDelivery" | "stopAllAgents";
};

/** 顶部与侧边栏共用一个休息／继续入口，避免与另一种停止操作混淆。 */
export function getGroupMenuControls(
  status: GroupStatusKey | null | undefined,
): GroupMenuControl[] {
  const toggle: GroupMenuControl =
    status === "run"
      ? { control: "pause", labelKey: "pauseDelivery" }
      : status === "paused" || status === "idle"
        ? { control: "activate", labelKey: "resumeDelivery" }
        : { control: "launch", labelKey: "launchAllAgents" };
  return [toggle];
}
