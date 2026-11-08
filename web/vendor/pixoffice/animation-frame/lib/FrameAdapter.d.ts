import type { Container } from 'pixi.js';
import type { AnimationAdapter, VisualAssetLease, VisualAssetManifest } from '@pixoffice/contracts/animation';
import type { CharacterPackResources } from './CharacterPackResources.ts';
export interface FrameAssetManifest extends VisualAssetManifest {
    source: {
        format: 'pixoffice-frame-v1';
        uri: string;
        bindings: Record<string, {
            clip: string;
            mouthLayer?: boolean;
        }>;
    };
}
type ResourceLease = {
    value: CharacterPackResources;
    release(): void;
};
type AcquireResources = (manifest: FrameAssetManifest) => Promise<ResourceLease>;
export declare class FrameAdapter implements AnimationAdapter<Container> {
    readonly id = "pixoffice.frame";
    readonly apiVersion: 1;
    readonly rendererApiVersion: "pixi-1";
    private acquireResources;
    constructor(acquireResources?: AcquireResources);
    acquire(input: VisualAssetManifest, signal: AbortSignal): Promise<VisualAssetLease<Container>>;
}
export {};
