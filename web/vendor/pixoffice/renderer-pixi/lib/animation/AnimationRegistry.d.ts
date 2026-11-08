import type { AnimationAdapter, VisualAssetManifest } from '@pixoffice/contracts/animation';
/** Only the application registers executable adapters, never external scene commands. */
export declare class AnimationRegistry<TNode> {
    private adapters;
    register(adapter: AnimationAdapter<TNode>): this;
    acquire(manifest: VisualAssetManifest, signal: AbortSignal): Promise<import("@pixoffice/contracts").VisualAssetLease<TNode>>;
}
