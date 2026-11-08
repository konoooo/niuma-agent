import { Container, Rectangle } from 'pixi.js';
import type { DestroyOptions } from 'pixi.js';
import type { VisualAssetLease } from '@pixoffice/contracts/animation';
import type { PresentedActor } from '@pixoffice/contracts/presentation';
/** Labels and pointer targets do not depend on the animation backend. */
export declare class ActorView extends Container {
    readonly overlay: Container<import("pixi.js").ContainerChild>;
    private visual?;
    private lease?;
    private presenter;
    private statusLabel;
    private bubble;
    private taskBadge;
    private speech?;
    private appearance;
    private animationError?;
    private visualBounds;
    private anchoredTask;
    private taskOccluded;
    private clearOcclusionSeconds;
    constructor(actor: PresentedActor, lease?: VisualAssetLease<Container>);
    get actionError(): string | undefined;
    setSelected(value: boolean): void;
    getVisualBounds(): Rectangle;
    getTaskOcclusionBounds(): Rectangle | undefined;
    setTaskOccluded(value: boolean, elapsedSeconds: number): void;
    update(actor: PresentedActor, dt: number): void;
    destroy(options?: DestroyOptions): void;
}
