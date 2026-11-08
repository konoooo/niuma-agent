import { facingFromWorldDirection, worldDirectionToward } from '@pixoffice/protocol/spatial';
export function facingToward(from, to) {
    return facingFromWorldDirection(worldDirectionToward(from, to));
}