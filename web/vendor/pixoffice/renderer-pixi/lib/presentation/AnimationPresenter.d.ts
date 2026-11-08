import type { EntityPresentation, VisualAssetManifest, VisualRequest } from '@pixoffice/contracts/animation';
import type { ActorIntent, PresentedActor } from '@pixoffice/contracts/presentation';
export declare function resolveVisualRequest(manifest: VisualAssetManifest, intent: ActorIntent): VisualRequest;
/** Host-controlled clocks. Direction changes preserve gait phase; action changes restart it. */
export declare class AnimationPresenter {
    private action;
    private elapsedMs;
    private travelledDu;
    private generation;
    private speech;
    private speechMs;
    private speechGeneration;
    private previousPosition?;
    private previousGroundPosition?;
    sample(actor: PresentedActor, manifest: VisualAssetManifest, dt: number): EntityPresentation;
}
