import { z } from 'zod';
export const scenePackManifestSchema = z.strictObject({
    id: z.string().min(1), version: z.string().min(1), apiVersion: z.literal(1),
});