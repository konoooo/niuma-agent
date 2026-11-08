import { describe, expect, it } from "vite-plus/test";
import type { Actor } from "../../../types";
import { officePage, officeState } from "./officeProjection";

it("已离岗成员退出场景并给其他成员保留原工位", () => {
  const actors: Actor[] = [{ id: "manager" }, { id: "away", availability: "away" }, { id: "dev" }];
  expect(officePage(actors, 0).members.map(({ actor, sceneId }) => [actor.id, sceneId])).toEqual([
    ["manager", "office-lead"],
    ["dev", "file-agent"],
  ]);
});

describe("办公室成员映射", () => {
  it("每位成员保有独立身份，超过六人时分场景展示", () => {
    const actors: Actor[] = Array.from({ length: 8 }, (_, i) => ({ id: `agent-${i + 1}` }));
    const first = officePage(actors, 0);
    const last = officePage(actors, 99);
    expect(first.pageCount).toBe(2);
    expect(first.members.map((item) => item.actor.id)).toEqual(actors.slice(0, 6).map((a) => a.id));
    expect(new Set(first.members.map((item) => item.sceneId)).size).toBe(6);
    expect(last.page).toBe(1);
    expect(last.members.map((item) => item.actor.id)).toEqual(["agent-7", "agent-8"]);
  });

  it("状态未知时不伪装成等待用户", () => {
    expect(
      officeState({
        id: "agent",
        running: true,
        effective_working_state: "waiting",
        effective_working_reason: "pty_running_state_unknown",
      }),
    ).toBe("unknown");
    expect(officeState({ id: "agent", running: false })).toBe("stopped");
    expect(officeState({ id: "agent", running: true, effective_working_state: "working" })).toBe(
      "working",
    );
    expect(officeState({ id: "agent", running: true, effective_working_state: "waiting" })).toBe(
      "waiting",
    );
  });
});
