import { z } from 'zod';
declare const mouthAttachment: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
    view: z.ZodString;
    scale: z.ZodDefault<z.ZodNumber>;
    rotation: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
declare const mouthRig: z.ZodObject<{
    pivot: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>;
    views: z.ZodRecord<z.ZodString, z.ZodObject<{
        closed: z.ZodString;
        speaking: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
type ClipGraph = Record<string, {
    alias: string;
    mirrorX: boolean;
} | {
    frames: {
        mouth?: z.infer<typeof mouthAttachment>;
    }[];
    loop: boolean;
}>;
export declare function validateFrameSource(value: {
    canvas: {
        width: number;
        height: number;
    };
    pivot: {
        x: number;
        y: number;
    };
    referenceHeight: number;
    profile: string;
    portrait: string;
    clips: ClipGraph;
    mouth?: z.infer<typeof mouthRig>;
}, ctx: z.RefinementCtx): void;
export declare const CharacterSourceSchema: z.ZodObject<{
    clips: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
        alias: z.ZodString;
        mirrorX: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>, z.ZodObject<{
        frames: z.ZodArray<z.ZodObject<{
            durationMs: z.ZodNumber;
            mouth: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                view: z.ZodString;
                scale: z.ZodDefault<z.ZodNumber>;
                rotation: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            file: z.ZodString;
        }, z.core.$strict>>;
        loop: z.ZodBoolean;
    }, z.core.$strict>]>>;
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    label: z.ZodString;
    profile: z.ZodString;
    canvas: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strict>;
    pivot: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>;
    referenceHeight: z.ZodNumber;
    displayHeight: z.ZodNumber;
    portrait: z.ZodString;
    mouth: z.ZodOptional<z.ZodObject<{
        pivot: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>;
        views: z.ZodRecord<z.ZodString, z.ZodObject<{
            closed: z.ZodString;
            speaking: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const CharacterManifestSchema: z.ZodObject<{
    revision: z.ZodString;
    pages: z.ZodArray<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
        image: z.ZodString;
        group: z.ZodEnum<{
            startup: "startup";
            deferred: "deferred";
        }>;
    }, z.core.$strict>>;
    frames: z.ZodRecord<z.ZodString, z.ZodObject<{
        page: z.ZodNumber;
        rect: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>;
        offset: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    clips: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodObject<{
        alias: z.ZodString;
        mirrorX: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>, z.ZodObject<{
        frames: z.ZodArray<z.ZodObject<{
            durationMs: z.ZodNumber;
            mouth: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                view: z.ZodString;
                scale: z.ZodDefault<z.ZodNumber>;
                rotation: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            frame: z.ZodString;
        }, z.core.$strict>>;
        loop: z.ZodBoolean;
    }, z.core.$strict>]>>;
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    label: z.ZodString;
    profile: z.ZodString;
    canvas: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strict>;
    pivot: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>;
    referenceHeight: z.ZodNumber;
    displayHeight: z.ZodNumber;
    portrait: z.ZodString;
    mouth: z.ZodOptional<z.ZodObject<{
        pivot: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>;
        views: z.ZodRecord<z.ZodString, z.ZodObject<{
            closed: z.ZodString;
            speaking: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strip>;
export declare const CharacterRegistrySchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    characters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        manifest: z.ZodString;
        clips: z.ZodArray<z.ZodString>;
        portrait: z.ZodObject<{
            image: z.ZodString;
            canvas: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strict>;
            referenceHeight: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CharacterSource = z.infer<typeof CharacterSourceSchema>;
export type CharacterManifest = z.infer<typeof CharacterManifestSchema>;
export type CharacterRegistry = z.infer<typeof CharacterRegistrySchema>;
export declare function resolveCharacterClip(manifest: Pick<CharacterManifest, 'clips'>, requested: string): {
    name: string;
    requested: string;
    mirrorX: boolean;
    frames: {
        durationMs: number;
        frame: string;
        mouth?: {
            x: number;
            y: number;
            view: string;
            scale: number;
            rotation: number;
        } | undefined;
    }[];
    loop: boolean;
} | undefined;
/** Include every body and mouth dependency before a pose can render. */
export declare function characterFrameDependencies(manifest: Pick<CharacterManifest, 'clips' | 'mouth'>, names: string[]): string[];
export declare function sampleCharacterClip(manifest: CharacterManifest, name: string, elapsedMs?: number, progress?: number): {
    key: string;
    frame: {
        page: number;
        rect: {
            width: number;
            height: number;
            x: number;
            y: number;
        };
        offset: {
            x: number;
            y: number;
        };
    };
    index: number;
    clip: {
        name: string;
        requested: string;
        mirrorX: boolean;
        frames: {
            durationMs: number;
            frame: string;
            mouth?: {
                x: number;
                y: number;
                view: string;
                scale: number;
                rotation: number;
            } | undefined;
        }[];
        loop: boolean;
    };
    durationMs: number;
    completed: boolean;
} | undefined;
/** Body timing and speech timing are independent; attachments belong to the sampled body frame. */
export declare function sampleCharacterLayers(manifest: CharacterManifest, name: string, elapsedMs?: number, progress?: number, speechElapsedMs?: number): {
    body: {
        key: string;
        frame: {
            page: number;
            rect: {
                width: number;
                height: number;
                x: number;
                y: number;
            };
            offset: {
                x: number;
                y: number;
            };
        };
        index: number;
        clip: {
            name: string;
            requested: string;
            mirrorX: boolean;
            frames: {
                durationMs: number;
                frame: string;
                mouth?: {
                    x: number;
                    y: number;
                    view: string;
                    scale: number;
                    rotation: number;
                } | undefined;
            }[];
            loop: boolean;
        };
        durationMs: number;
        completed: boolean;
    };
    mouth: {
        attachment: {
            x: number;
            y: number;
            view: string;
            scale: number;
            rotation: number;
        };
        pivot: {
            x: number;
            y: number;
        };
        key: string;
        frame: {
            page: number;
            rect: {
                width: number;
                height: number;
                x: number;
                y: number;
            };
            offset: {
                x: number;
                y: number;
            };
        };
        index: number;
        clip: {
            name: string;
            requested: string;
            mirrorX: boolean;
            frames: {
                durationMs: number;
                frame: string;
                mouth?: {
                    x: number;
                    y: number;
                    view: string;
                    scale: number;
                    rotation: number;
                } | undefined;
            }[];
            loop: boolean;
        };
        durationMs: number;
        completed: boolean;
    } | undefined;
} | undefined;
export declare function characterPreviewTimeline(manifest: CharacterManifest, name: string): {
    name: string;
    requested: string;
    mirrorX: boolean;
    frames: {
        durationMs: number;
        frame: string;
        mouth?: {
            x: number;
            y: number;
            view: string;
            scale: number;
            rotation: number;
        } | undefined;
    }[];
    loop: boolean;
} | undefined;
export {};
