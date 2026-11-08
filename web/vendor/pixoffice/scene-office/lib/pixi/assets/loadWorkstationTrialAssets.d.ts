import type { Texture } from 'pixi.js';
declare const parts: readonly ["desk", "chair", "computer"];
type TrialTextures = Record<(typeof parts)[number], Texture>;
export declare function getWorkstationTrialTextures(): TrialTextures | undefined;
export declare function loadWorkstationTrialAssets(onLoaded?: (part: typeof parts[number]) => void): Promise<boolean>;
export {};
