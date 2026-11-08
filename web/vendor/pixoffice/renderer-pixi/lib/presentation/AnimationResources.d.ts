import type { AnimationRegistry } from '../animation/AnimationRegistry.ts';
import type { VisualAssetLease, VisualAssetManifest } from '@pixoffice/contracts/animation';
import type { PresentedActor } from '@pixoffice/contracts/presentation';
export declare class AnimationResources<TNode> {
    private leases;
    private ready;
    private released;
    private pending?;
    get(id: string): VisualAssetLease<TNode> | undefined;
    get size(): number;
    get completed(): number;
    get isComplete(): boolean;
    static load<TNode>(actors: PresentedActor[], registry: AnimationRegistry<TNode>, resolve: (id: string) => Promise<VisualAssetManifest>, signal: AbortSignal, report: (id: string) => void): Promise<AnimationResources<TNode>>;
    prepareAll(signal: AbortSignal, report: () => void): Promise<void>;
    release(): void;
}
