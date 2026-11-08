import { Container, Sprite } from 'pixi.js';
import type { CharacterPackResources } from './CharacterPackResources.ts';
import { sampleCharacterLayers, type CharacterManifest } from './packSchema.ts';
/** Frame rendering only; action choice and clocks belong to the caller. */
export declare class FrameSprite<T extends CharacterManifest = CharacterManifest> extends Container {
    protected pack: CharacterPackResources<T> | undefined;
    protected readonly sprite: Sprite;
    protected readonly mouthSprite: Sprite;
    protected headY: number;
    protected poseError?: string;
    constructor(pack?: CharacterPackResources<T>);
    get isReady(): boolean;
    get actionError(): string | undefined;
    getHeadOffsetY(): number;
    renderClip(name: string, elapsed?: number, progress?: number, speechElapsedMs?: number): void;
    protected renderLayers(layers: ReturnType<typeof sampleCharacterLayers>, name: string): void;
}
