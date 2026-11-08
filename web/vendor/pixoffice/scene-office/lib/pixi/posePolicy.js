export function apartmentPoseForState(state, animation, atDesk = false) {
    if (state === 'walking')
        return 'walking';
    if (animation === 'emotes/wave')
        return 'wave';
    if (animation === 'emotes/thinking')
        return 'thinking';
    if (animation === 'emotes/surprised')
        return 'surprised';
    if (atDesk && state === 'working')
        return 'typing';
    if (atDesk)
        return 'seated';
    return 'idle';
}