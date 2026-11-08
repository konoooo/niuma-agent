import type { WorkSurface } from '@pixoffice/contracts/contactSurface';
export declare const CLASSIC_DESK: {
    width: number;
    height: number;
    targetWidth: number;
    anchorY: number;
    splitY: number;
    topHeightScale: number;
};
export declare const TRIAL_DESK: {
    left: number;
    top: number;
    width: number;
    apron: number;
    bottom: number;
    targetWidth: number;
    apronY: number;
};
export declare const TRIAL_COMPUTER: {
    left: number;
    top: number;
    width: number;
    height: number;
    targetWidth: number;
    bottomY: number;
};
export declare const TRIAL_MONITOR_RIGHT: {
    x: number;
    y: number;
};
export declare function trialComputerPlacement(): {
    topY: number;
};
export declare function classicDeskPlacement(width?: number, height?: number): {
    scale: number;
    split: number;
    apronY: number;
    topY: number;
};
/** Landmarks are measured in source artwork and use the furniture's drawing transform. */
export declare function workstationSurface(artwork: 'classic' | 'trial' | 'fallback'): WorkSurface;
