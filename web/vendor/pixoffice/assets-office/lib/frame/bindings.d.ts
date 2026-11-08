import type { FrameAssetManifest } from '@pixoffice/animation-frame/FrameAdapter';
import { type CharacterManifest } from './packSchema.ts';
/** Compatibility metadata for the existing artwork; image content and URLs stay unchanged. */
export declare function bindOfficeFrames(source: CharacterManifest, uri: string): FrameAssetManifest;
