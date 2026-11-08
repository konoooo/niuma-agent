import type { Actor, Template, World } from './model.ts';
export declare function restoreBoundActor(world: World, actor: Actor, template: (id: string) => Template): void;
export declare function restoreInteractionFacing(world: World, actor: Actor, template: (id: string) => Template): void;
