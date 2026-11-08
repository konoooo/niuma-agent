const directions = { front: 'south', back: 'north', left: 'west', right: 'east' };
const facings = { north: 'back', east: 'right', south: 'front', west: 'left' };
export const worldDirectionFromFacing = (facing) => directions[facing];
export const facingFromWorldDirection = (direction) => facings[direction];
export function worldDirectionToward(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y;
    return Math.abs(dx) >= Math.abs(dy) ? dx < 0 ? 'west' : 'east' : dy < 0 ? 'north' : 'south';
}