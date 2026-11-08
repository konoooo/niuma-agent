import type { Texture } from 'pixi.js';
export declare function getOfficeBackgroundTexture(): Texture | null;
export declare function getOfficeDeskTexture(): Texture | null;
export declare function getOfficeChairTexture(): Texture | null;
export declare function isOfficeAssetsReady(): boolean;
export declare function loadOfficeBackground(): Promise<Texture | null>;
export declare function loadOfficeFurniture(onLoaded?: (part: 'desk' | 'chair') => void): Promise<boolean>;
export declare function loadOfficeAssets(): Promise<boolean>;
