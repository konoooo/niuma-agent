import { expect, it } from "vite-plus/test";
import type { Actor, HeadlessStreamEvent, LedgerEvent } from "../../../types";
import {
  currentOfficeActivity,
  latestOfficeUtterance,
  officeMessage,
  shouldAnimateOfficeMessage,
} from "./officeEvents";

it("只显示当前轮次中尚未结束的真实活动", () => {
  const actor: Actor = {
    id: "worker",
    running: true,
    effective_working_state: "working",
    effective_active_task_id: "turn-2",
  };
  const events: HeadlessStreamEvent[] = [
    {
      type: "headless.visual_activity",
      data: { turn_id: "turn-1", activity_id: "a", phase: "started", kind: "command" },
    },
    {
      type: "headless.visual_activity",
      data: {
        turn_id: "turn-2",
        activity_id: "b",
        phase: "started",
        kind: "file_change",
        label: "app.ts",
      },
    },
  ];
  expect(currentOfficeActivity(actor, events)).toMatchObject({
    kind: "file_change",
    label: "app.ts",
  });
  events.push({
    type: "headless.visual_activity",
    data: { turn_id: "turn-2", activity_id: "b", phase: "completed", kind: "file_change" },
  });
  expect(currentOfficeActivity(actor, events)).toBeNull();
  expect(currentOfficeActivity({ ...actor, effective_working_state: "idle" }, events)).toBeNull();
});

it("按真实消息接收人解析互动，不虚构接收方回复", () => {
  const actors: Actor[] = [
    { id: "lead", role: "foreman" },
    { id: "worker", role: "peer" },
  ];
  const event: LedgerEvent = {
    id: "m1",
    kind: "chat.message",
    by: "lead",
    data: { to: ["worker"], text: "请检查代码" },
  };
  expect(officeMessage(event, actors)).toEqual({
    id: "m1",
    from: "lead",
    to: ["worker"],
    text: "请检查代码",
  });
  expect(officeMessage({ ...event, kind: "runtime.delivery" }, actors)).toBeNull();
});

it("历史或断线恢复消息不会当作实时互动重播", () => {
  const event: LedgerEvent = { id: "old", kind: "chat.message" };
  expect(shouldAnimateOfficeMessage(event, 20_000)).toBe(false);
  expect(shouldAnimateOfficeMessage({ ...event, _officeLiveAt: 19_500 }, 20_000)).toBe(true);
  expect(shouldAnimateOfficeMessage({ ...event, _officeLiveAt: 1_000 }, 20_000)).toBe(false);
});

it("只取当前轮次中新近到达的真实公开短句", () => {
  const actor: Actor = {
    id: "worker",
    running: true,
    effective_working_state: "working",
    effective_active_task_id: "turn-2",
  };
  const events: HeadlessStreamEvent[] = [
    {
      id: "history",
      type: "headless.visual_activity",
      data: { turn_id: "turn-2", speech: "历史输出" },
    },
    {
      id: "old-turn",
      type: "headless.visual_activity",
      _receivedAt: 1000,
      data: { turn_id: "turn-1", speech: "旧轮次" },
    },
    {
      id: "live",
      type: "headless.visual_activity",
      _receivedAt: 1500,
      data: { turn_id: "turn-2", speech: "正在核对接口。" },
    },
  ];
  expect(latestOfficeUtterance(actor, events, 2000)).toEqual({
    id: "live",
    text: "正在核对接口。",
    receivedAt: 1500,
  });
  expect(
    latestOfficeUtterance({ ...actor, effective_working_state: "idle" }, events, 2000),
  ).toBeNull();
  expect(latestOfficeUtterance(actor, events, 30_000)).toBeNull();
  expect(
    latestOfficeUtterance(
      {
        ...actor,
        effective_active_task_id: null,
        effective_working_updated_at: "2026-11-06T12:00:10Z",
      },
      [{ ...events[2], ts: "2026-11-06T12:00:01Z" }],
      2000,
    ),
  ).toBeNull();
});
