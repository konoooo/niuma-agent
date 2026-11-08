import type { TFunction } from "i18next";
import { getGroupMenuControls, type GroupControl } from "../../utils/groupControls";
import type { GroupStatusKey } from "../../utils/groupStatus";
import { PauseIcon, PlayIcon, StopIcon } from "../Icons";
import type { GroupMenuActionItem } from "./useGroupMenu";

/** 侧边栏与顶部状态按钮使用同一套上班／下班操作。 */
export function groupRunMenuActions(
  statusKey: GroupStatusKey | null | undefined,
  t: TFunction<"layout">,
  onControl: (control: GroupControl) => void,
  disabled = false,
): GroupMenuActionItem[] {
  return getGroupMenuControls(statusKey).map(({ control, labelKey }) => ({
    label: t(labelKey),
    disabled,
    icon:
      control === "pause" ? (
        <PauseIcon size={15} />
      ) : control === "stop" ? (
        <StopIcon size={15} />
      ) : (
        <PlayIcon size={15} />
      ),
    tone: control === "stop" ? "danger" : undefined,
    section: "run",
    onClick: () => onControl(control),
  }));
}
