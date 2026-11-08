import type { Texture } from 'pixi.js';
export declare const getReferenceOfficeTexture: (name: string) => Texture<import("pixi.js").TextureSource<any>> | undefined;
export declare const loadReferenceOfficeBackground: () => Promise<Texture<import("pixi.js").TextureSource<any>>>;
export declare function loadReferenceOfficeObjects(report: (part: string) => void): Promise<void>;
