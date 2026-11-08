import { Texture } from 'pixi.js';
import type { PresentedActor } from '@pixoffice/contracts/presentation';
import type { World } from '@pixoffice/runtime/model';
import type { SceneReadPort } from '@pixoffice/runtime';
import type { SceneAmbientView } from '@pixoffice/renderer-pixi/ScenePresentationPack';
export declare function officeWorkEffectSeat(actor: PresentedActor | undefined, world: World): {
    x: number;
    y: number;
} | undefined;
export declare function officeWorkEffectActive(actor: PresentedActor | undefined, world: World): boolean;
export declare class OfficeWorkEffectClock {
    time: number;
    opacity: number;
    completion: number;
    private runningTask;
    private completedTask;
    update(dt: number, active: boolean, taskKey: string, completed: boolean): void;
}
export declare const OFFICE_WORK_EFFECT: {
    readonly columns: 3;
    readonly rows: 2;
    readonly cellPixels: 160;
    readonly displayPixels: 160;
    readonly opacity: 1;
    readonly frameDurationsMs: readonly [170, 170, 170, 170, 170, 200];
};
export declare function officeWorkEffectFrame(seconds: number): number;
export declare function createOfficeWorkEffects(atlas: Texture, runtime: SceneReadPort, actorIds: readonly string[], projectActors: (world: World) => PresentedActor[], reducedMotion?: () => boolean): SceneAmbientView;
