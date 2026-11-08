export type CharacterPosture = 'standing' | 'seated';
export type CharacterFacing = 'front' | 'back' | 'left' | 'right';
export declare function characterPoseClip(posture: CharacterPosture, facing: CharacterFacing): string;
export declare const OFFICE_SEATED_CLIPS: readonly ["sit.back", "talk.seated-left", "talk.seated-right"];
/** The standard office pack guarantees these poses before textures are loaded. */
export declare function supportsOfficePose(_templateId: string, posture: CharacterPosture, facing: CharacterFacing): boolean;
