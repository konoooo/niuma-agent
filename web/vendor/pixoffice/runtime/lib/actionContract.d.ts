import type { Actor, Facing, Pose, World } from './model.ts';
export type PoseSupport = (templateId: string, posture: Actor['posture'], facing: Facing) => boolean;
export declare const unrestrictedPoses: PoseSupport;
export declare function resolvePoses(world: World, poses: Pose[], supports: PoseSupport, positions?: Map<string, import("@pixoffice/protocol/spatial").WorldPoint>): {
    actor: Actor;
    posture: "standing" | "seated";
    facing: import("@pixoffice/protocol/spatial").LegacyFacing;
    expression: string | undefined;
}[];
