import { expect, it } from "vite-plus/test";
import { planOfficeSpeech } from "./officeSpeech";

it("真实公开短句优先，重复短句不会连续播放", () => {
  const view = {
    working: true,
    hint: "状态提示：执行命令",
    utterance: { id: "one", text: "正在核对接口。", receivedAt: 1000 },
  };
  const first = planOfficeSpeech(view, null, 1200, 0);
  expect(first.speech).toEqual({ text: "正在核对接口。", source: "actual" });
  expect(planOfficeSpeech(view, first.clock, 4000, 0).speech).toBeNull();
  expect(planOfficeSpeech(view, first.clock, 10_000, 0).speech).toBeNull();
});

it("没有真实短句时稍后显示状态提示，停止工作后清除节奏", () => {
  const view = { working: true, hint: "状态提示：修改文件", utterance: null };
  const initial = planOfficeSpeech(view, null, 1000, 0);
  expect(initial.speech).toBeNull();
  expect(planOfficeSpeech(view, initial.clock, 5000, 0).speech).toBeNull();
  const due = planOfficeSpeech(view, initial.clock, 9000, 0);
  expect(due.speech).toEqual({ text: "状态提示：修改文件", source: "status" });
  expect(planOfficeSpeech({ ...view, working: false }, due.clock, 9500, 0)).toEqual({
    clock: null,
    speech: null,
  });
});

it("等待冷却后优先显示仍然新鲜的真实短句", () => {
  const view = { working: true, hint: "状态提示：工作中", utterance: null };
  const initial = planOfficeSpeech(view, null, 1000, 0);
  const fallback = planOfficeSpeech(view, initial.clock, 9000, 0);
  const withActual = {
    ...view,
    utterance: { id: "next", text: "我在核对结果。", receivedAt: 11_000 },
  };
  expect(planOfficeSpeech(withActual, fallback.clock, 12_000, 0).speech).toBeNull();
  expect(planOfficeSpeech(withActual, fallback.clock, 17_000, 0).speech).toEqual({
    text: "我在核对结果。",
    source: "actual",
  });
});
