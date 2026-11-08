import { z } from 'zod';
import type { World } from './model.ts';
import type { ScenePlugin } from './plugins.ts';
import type { PoseSupport } from './actionContract.ts';
export declare const scenePackManifestSchema: z.ZodObject<{
    id: z.ZodString;
    version: z.ZodString;
    apiVersion: z.ZodLiteral<1>;
}, z.core.$strict>;
/** Trusted, headless definitions. Rendering and animation are assembled separately. */
export interface ScenePack {
    readonly manifest: z.infer<typeof scenePackManifestSchema>;
    readonly plugins: readonly ScenePlugin[];
    createWorld(sceneId?: string): World;
    supportsPose?: PoseSupport;
}
