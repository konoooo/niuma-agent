import { Container } from 'pixi.js';
import type { Prop, Template } from '@pixoffice/runtime/model';
import type { PresentedActor } from '@pixoffice/contracts/presentation';
import type { SceneProjection } from '@pixoffice/contracts/projection';
export interface PropView {
    roots: Container[];
    hitTarget: Container;
    update(prop: Prop, template: Template, actors: PresentedActor[]): void;
    updateFrame?(elapsedSeconds: number): void;
}
export type PropViewFactory = (prop: Prop, template: Template) => PropView;
/** Trusted view factories are assembled by the application, never downloaded by commands. */
export declare class PropViewRegistry {
    private factories;
    private fallback;
    constructor(projection?: number | SceneProjection);
    register(id: string, factory: PropViewFactory): void;
    create(prop: Prop, template: Template): PropView;
}
