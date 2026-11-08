import type { Point, World } from './model.ts';
import type { NavigationAdapter, NavigationQuery, NavigationTemplates } from './navigationAdapter.ts';
export declare class GridNavigation implements NavigationAdapter {
    private templates;
    constructor(templates: NavigationTemplates);
    anchor(world: World, targetId: string, anchor: string): Point;
    onFloor(world: World, p: Point): boolean;
    walkable(world: World, p: Point, query?: NavigationQuery): boolean;
    segmentClear(world: World, from: Point, to: Point, query?: NavigationQuery): boolean;
    path(world: World, from: Point, to: Point, query?: NavigationQuery): Point[];
    validate(world: World, options?: {
        connectivity?: boolean;
    }): void;
}
