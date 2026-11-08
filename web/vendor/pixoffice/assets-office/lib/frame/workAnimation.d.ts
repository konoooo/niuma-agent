import type { CharacterManifest } from './packSchema.ts';
import { type WorkPoint, type WorkSurface } from '@pixoffice/contracts/contactSurface';
export declare const WORK_CYCLE_MS = 12000;
export declare const QUIET_WORK_CYCLE_MS = 4000;
type Rig = NonNullable<CharacterManifest['work']>;
export type WorkPartTransform = {
    clip: string;
    root: WorkPoint;
    position: WorkPoint;
    rotation: number;
    mirror: 1 | -1;
};
/** Fixed-length two-link reach, with elbows bending outwards. No sprite stretching. */
export declare function solveWorkArm(shoulder: WorkPoint, wrist: WorkPoint, upper: number, lower: number, side: 1 | -1): {
    x: number;
    y: number;
} | undefined;
export declare function computerWorkTargets(surface: WorkSurface, elapsedMs: number): {
    phase: string;
    left: {
        x: number;
        y: number;
    };
    right: {
        x: number;
        y: number;
    };
};
/** Match the leader's four-pose, three-second typing loop and one-second rest. */
export declare function quietWorkTargets(surface: WorkSurface, elapsedMs: number): {
    phase: string;
    left: {
        x: number;
        y: number;
    };
    right: {
        x: number;
        y: number;
    };
};
/** Preflight the entire reach so a marginal furniture fit cannot flicker mid-loop. */
export declare function canUseWorkSurface(rig: Rig, surface: WorkSurface): boolean;
export declare function sampleComputerWork(rig: Rig, surface: WorkSurface, elapsedMs: number): {
    phase: string;
    contacts: {
        left: {
            x: number;
            y: number;
        };
        right: {
            x: number;
            y: number;
        };
    };
    parts: WorkPartTransform[];
} | undefined;
export declare function canUseQuietSurface(rig: Rig, surface: WorkSurface): boolean;
export declare function sampleQuietWork(rig: Rig, surface: WorkSurface, elapsedMs: number): {
    phase: string;
    contacts: {
        left: {
            x: number;
            y: number;
        };
        right: {
            x: number;
            y: number;
        };
    };
    parts: WorkPartTransform[];
} | undefined;
export {};
