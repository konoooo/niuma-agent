import type { Actor, Point, World } from './model.ts';
import type { NavigationAdapter, NavigationQuery } from './navigationAdapter.ts';
export declare const CELL_STEP_MS = 320;
export declare function occupiedCells(world: World, exceptId: string): Point[];
export declare function cellAvailable(world: World, actor: Actor, cell: Point): boolean;
/** Position changes only at cell boundaries. A committed edge owns both ends. */
export declare function advanceCell(world: World, actor: Actor, target: Point, dt: number, navigation: NavigationAdapter, query?: NavigationQuery, durationMs?: number): "arrived" | "blocked" | "moving";
