import type { Actor, Move, Point, Pose, World } from './model.ts';
import type { NavigationAdapter, NavigationTemplates } from './navigationAdapter.ts';
import { SeatInteractions } from './seatInteraction.ts';
import type { SeatPort, SeatStepDuration } from './seatInteraction.ts';
import type { PoseSupport } from './actionContract.ts';
type ResolvedMove = {
    actor: Actor;
    path: Point[];
    destination: Point;
    distance: number;
    departure?: SeatPort;
    arrival?: SeatPort;
    move?: Move;
    poses?: Pose[];
};
export declare class MovementController {
    readonly seats: SeatInteractions;
    private arrivals;
    private goals;
    private blocked;
    private navigation;
    private supportsPose;
    constructor(navigation: NavigationAdapter, templates?: NavigationTemplates, seatStepDuration?: SeatStepDuration, supportsPose?: PoseSupport);
    clear(actorId: string): void;
    busy(actor: Actor): boolean;
    start({ actor, path, departure, arrival, move, poses }: ResolvedMove): void;
    cancel(actor: Actor, rollback?: boolean): void;
    needsRelease(actor: Actor): boolean;
    releaseUse(world: World, actor: Actor): void;
    stand(world: World, actor: Actor, reserved: Point[], toward?: Point): ResolvedMove;
    private route;
    private noRoute;
    resolve(world: World, move: Move, departing: Set<string>, reserved: Point[], requiredPoses?: Pose[]): ResolvedMove;
    private wait;
    advance(world: World, actor: Actor, dt: number): void;
}
export {};
