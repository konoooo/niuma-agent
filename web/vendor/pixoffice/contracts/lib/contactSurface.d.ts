export type WorkPoint = {
    x: number;
    y: number;
};
export type WorkSurface = {
    keyboardLeft: WorkPoint;
    keyboardRight: WorkPoint;
    mouse: WorkPoint;
    bounds: {
        left: number;
        right: number;
        back: number;
        front: number;
    };
};
/** Render landmarks only. Floor occupancy remains in the integer-grid runtime. */
export declare function transformWorkSurface(surface: WorkSurface, scale: number, x?: number, y?: number): WorkSurface;
export declare function validWorkSurface(surface: WorkSurface): boolean;
