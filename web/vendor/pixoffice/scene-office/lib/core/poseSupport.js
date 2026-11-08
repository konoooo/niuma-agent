export function characterPoseClip(posture, facing) {
    return posture === 'standing' ? `idle.${facing}` : facing === 'back' ? 'sit.back' : `talk.seated-${facing}`;
}
export const OFFICE_SEATED_CLIPS = ['sit.back', 'talk.seated-left', 'talk.seated-right'];
/** The standard office pack guarantees these poses before textures are loaded. */
export function supportsOfficePose(_templateId, posture, facing) {
    return posture === 'standing' || OFFICE_SEATED_CLIPS.some(clip => clip === characterPoseClip(posture, facing));
}