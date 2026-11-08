import { expect, it } from "vite-plus/test";
import { createSceneRuntime } from "@pixoffice/runtime";
import { renderWhiteboardPreview } from "@pixoffice/scene-office/task-board";
import { officePage } from "./officeProjection";
import { officeScene } from "./officeScene";

it("场景使用真实成员名称并保留各自工位", () => {
  const page = officePage(
    [
      { id: "architect", title: "架构师" },
      { id: "developer", title: "开发工程师" },
    ],
    0,
  );
  const world = officeScene(page.members).createWorld("office-1");
  expect(world.actors.map((actor) => [actor.id, actor.name, actor.homeId])).toEqual([
    ["office-lead", "架构师", "desk-0"],
    ["code-agent", "开发工程师", "desk-1"],
  ]);
  expect(world.actors[0].templateId).toBe("office-lead");
  expect(world.actors[1].templateId).toBe("code-agent");
});

it("单向消息的拜访动画不替接收人虚构回复", () => {
  const page = officePage([{ id: "lead" }, { id: "worker" }], 0);
  const runtime = createSceneRuntime(officeScene(page.members));
  const result = runtime.submit({
    protocolVersion: "2.0",
    sceneId: runtime.sceneId,
    commandId: "message-1",
    type: "activity.start",
    capability: "office.visit",
    participants: [
      { entityId: "office-lead", role: "visitor" },
      { entityId: "code-agent", role: "host" },
    ],
    params: { stops: [{ hostId: "code-agent", message: "请检查代码" }] },
  });
  expect(result.status).not.toBe("rejected");
  const spoken = runtime
    .snapshot()
    .activities[0].plan.phases.flatMap((phase) =>
      (phase.speech || []).map((speech) => [speech.actorId, speech.text]),
    );
  expect(spoken).toEqual([["office-lead", "请检查代码"]]);
  runtime.dispose();
});

it("没有白板数据时不虚构任务拆解状态", () => {
  expect(renderWhiteboardPreview({})).toContain("实时状态见成员列表");
});
