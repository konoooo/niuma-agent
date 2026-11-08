import type { ScenePresentationPack } from '@pixoffice/renderer-pixi/ScenePresentationPack';
import type { ActorTaskPresentation } from '@pixoffice/contracts/presentation';
import type { WhiteboardProgress } from '../whiteboard.ts';
export { configureOfficeAssets } from './assets/loadOfficeTexture.ts';
export declare function createOfficePresentation(trialEnabled?: () => boolean): ScenePresentationPack;
export declare function createReferenceOfficePresentation(options?: {
    taskForActor?: (id: string) => ActorTaskPresentation | undefined;
    whiteboardProgress?: WhiteboardProgress;
    workEffects?: boolean;
}): ScenePresentationPack;
