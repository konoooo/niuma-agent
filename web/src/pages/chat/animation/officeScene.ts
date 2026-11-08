import { referenceOfficeScenePack } from "@pixoffice/scene-office/core";
import type { Actor } from "../../../types";
import { OFFICE_SLOTS } from "./officeProjection";

export function officeScene(members: Array<{ actor: Actor; sceneId: string }>) {
  return {
    ...referenceOfficeScenePack,
    createWorld(sceneId?: string) {
      const world = referenceOfficeScenePack.createWorld(sceneId);
      world.actors = world.actors
        .filter((actor) => members.some((member) => member.sceneId === actor.id))
        .map((actor) => ({
          ...actor,
          name:
            members.find((member) => member.sceneId === actor.id)!.actor.title?.trim() ||
            members.find((member) => member.sceneId === actor.id)!.actor.id,
        }));
      world.props.slice(0, 6).forEach((prop, index) => {
        const member = members.find((member) => member.sceneId === OFFICE_SLOTS[index]);
        prop.name = member ? `${member.actor.title?.trim() || member.actor.id}的工位` : "空工位";
      });
      return world;
    },
  };
}
