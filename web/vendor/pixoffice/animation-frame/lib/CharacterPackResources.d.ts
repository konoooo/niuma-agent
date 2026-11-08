import { Texture } from 'pixi.js';
import { type CharacterManifest } from './packSchema.ts';
/** Owns progressive atlas pages; callers retain the pack through ResourceLeaseCache. */
export declare class CharacterPackResources<T extends CharacterManifest = CharacterManifest> {
    readonly manifest: T;
    readonly pageUrls: string[];
    readonly textures: Map<string, Texture<import("pixi.js").TextureSource<any>>>;
    private pages;
    private pending;
    private disposed;
    private disposal?;
    private dependencies;
    constructor(manifest: T, pageUrls: string[], dependencies?: (manifest: T, names: string[]) => string[]);
    get isComplete(): boolean;
    ensureStartup(): Promise<void>;
    ensureClips(names: string[]): Promise<void>;
    ensureAll(): Promise<void>;
    private ensurePages;
    private loadPage;
    dispose(): Promise<void>;
}
