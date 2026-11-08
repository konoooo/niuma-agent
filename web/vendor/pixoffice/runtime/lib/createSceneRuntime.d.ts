import { SceneRuntime } from './SceneRuntime.ts';
import type { SceneRuntimeOptions } from './SceneRuntime.ts';
import type { ScenePack } from './scenePack.ts';
export type CreateSceneRuntimeOptions = Omit<SceneRuntimeOptions, 'world' | 'plugins' | 'createNavigation'> & {
    sceneId?: string;
    createNavigation?: SceneRuntimeOptions['createNavigation'];
};
export declare function createSceneRuntime(pack: ScenePack, options?: CreateSceneRuntimeOptions): SceneRuntime;
