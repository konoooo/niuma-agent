import type { Actor, Point, World, FurnitureInteraction } from './model.ts';
import type { NavigationAdapter, NavigationObstacle, NavigationTemplates } from './navigationAdapter.ts';
export type SeatPort = {
    propId: string;
    interactionId: string;
    seat: Point;
    approach: Point;
    passage: Point[];
    config: FurnitureInteraction;
};
export type SeatStepDuration = (from: Point, to: Point, transition: NonNullable<Actor['seatTransition']>) => number;
/** Furniture use is a reserved local path, not a general permission to cross furniture. */
export declare class SeatInteractions {
    private active;
    private navigation;
    private templates;
    private stepDuration;
    constructor(navigation: NavigationAdapter, templates: NavigationTemplates, stepDuration?: SeatStepDuration);
    config(world: World, propId: string, interactionId?: string): FurnitureInteraction | undefined;
    ports(world: World, propId: string, interactionId?: string): SeatPort[];
    obstacles(world: World, actorId: string): NavigationObstacle[];
    passageClear(world: World, actorId: string, port: SeatPort): boolean;
    begin(actor: Actor, port: SeatPort, direction: 'enter' | 'exit'): void;
    recover(actor: Actor): void;
    advance(world: World, actor: Actor, dt: number, recovering?: boolean): void;
}
