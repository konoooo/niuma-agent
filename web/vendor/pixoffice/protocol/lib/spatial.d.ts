export type WorldPoint = {
    x: number;
    y: number;
};
export type WorldBox = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
/** Ground-plane axes, independent of camera orientation. Positive y is south. */
export type WorldDirection = 'north' | 'east' | 'south' | 'west';
/** Existing v2 saves and commands retain these axis names. They are not sprite views. */
export type LegacyFacing = 'front' | 'back' | 'left' | 'right';
export declare const worldDirectionFromFacing: (facing: LegacyFacing) => WorldDirection;
export declare const facingFromWorldDirection: (direction: WorldDirection) => LegacyFacing;
export declare function worldDirectionToward(from: WorldPoint, to: WorldPoint): WorldDirection;
