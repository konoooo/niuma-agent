import type { SceneProjection, ScreenPoint } from '@pixoffice/contracts/projection';
type Point = ScreenPoint;
/** Compatibility projection used by the existing three scene products. */
export declare function createOrthogonalProjection(cellPixels?: number): SceneProjection;
/** 45-degree yaw / 30-degree elevation. Width is exactly twice the tile height. */
export declare function createDimetricProjection(tileWidth?: number): SceneProjection;
export declare function pickGridCell(projection: SceneProjection, screen: Point): Point;
export {};
