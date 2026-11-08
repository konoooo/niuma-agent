import { createSceneRuntime } from '@pixoffice/runtime';
import type { ScenePack, CreateSceneRuntimeOptions } from '@pixoffice/runtime';
import type { SceneProduct, VisualAssetManifest } from '@pixoffice/contracts';
import { SceneView } from './SceneView.ts';
import type { SceneViewOptions } from './SceneView.ts';
export interface SceneAssembly extends Pick<SceneViewOptions, 'pack' | 'animations' | 'resolveAppearance'> {
    scene: ScenePack;
    product?: SceneProduct;
    /** Product-owned calibration, independent of the headless scene definitions. */
    runtimeOptions?: Pick<CreateSceneRuntimeOptions, 'seatStepDuration' | 'supportsPose'>;
}
export interface MountSceneOptions {
    signal?: AbortSignal;
    runtime?: CreateSceneRuntimeOptions;
    step?: (runtime: ReturnType<typeof createSceneRuntime>, elapsedMs: number) => void;
    view?: Omit<SceneViewOptions, 'runtime' | 'pack' | 'animations' | 'resolveAppearance' | 'onStep' | 'dispatchCommand'>;
}
/** The host selects a trusted module. Unselected scenes are never imported. */
export declare function mountScene(host: HTMLElement, load: (signal: AbortSignal) => Promise<SceneAssembly>, options?: MountSceneOptions): Promise<{
    runtime: import("@pixoffice/runtime").SceneRuntime;
    view: SceneView;
    dispose: () => void;
}>;
/** URLs are host-owned, not guessed from a scene name or a global registry. */
export declare function createAppearanceResolver(urlForId: (id: string) => string, signal?: AbortSignal): (id: string) => Promise<VisualAssetManifest>;
