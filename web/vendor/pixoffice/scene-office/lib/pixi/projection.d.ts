import type { Actor, Point, Prop, SeatTransition } from '@pixoffice/runtime/model';
export declare const CELL_PIXELS = 50;
export declare const cellCenter: (p: Point) => {
    x: number;
    y: number;
};
export declare function propPixels(prop: Prop): {
    x: number;
    y: number;
};
export declare const seatPixels: (cell: Point) => {
    x: number;
    y: number;
};
/** Only align the final standing point with the chair; all walking stays on the floor. */
export declare function seatStepPixels(from: Point, to: Point, transition: SeatTransition): Point[];
export declare function seatStepDurationMs(from: Point, to: Point, transition: SeatTransition): number;
export declare function actorVisualPose(actor: Actor): {
    position: Point;
    facing: Actor['facing'];
};
export declare function actorPixels(actor: Actor): Point;
