import { z } from 'zod';
import type { VisualAssetManifest } from './animation.ts';
/** A host-level boundary, not a runtime switch or an asset URL convention. */
export declare const sceneProductSchema: z.ZodObject<{
    id: z.ZodString;
    storageNamespace: z.ZodString;
    presentationProfileId: z.ZodString;
}, z.core.$strict>;
export type SceneProduct = z.infer<typeof sceneProductSchema>;
export declare function assertProductAppearance(product: SceneProduct, manifest: VisualAssetManifest): void;
