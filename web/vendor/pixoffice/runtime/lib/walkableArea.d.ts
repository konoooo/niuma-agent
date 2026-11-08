import type { Point } from './model.ts';
/** Convex floor boundaries keep every straight segment between valid endpoints inside the room. */
export declare function convexAreaContains(vertices: Point[]): (point: Point, clearance?: number) => boolean;
