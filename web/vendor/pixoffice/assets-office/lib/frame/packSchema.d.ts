import { z } from 'zod';
import { type WorkSurface } from '@pixoffice/contracts/contactSurface';
export { CharacterRegistrySchema, resolveCharacterClip, sampleCharacterClip } from '@pixoffice/animation-frame/packSchema';
export type { CharacterRegistry } from '@pixoffice/animation-frame/packSchema';
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
    profile: z.ZodEnum<{
        basic: "basic";
        office: "office";
    }>;
    work: z.ZodOptional<z.ZodObject<{
        shoulders: z.ZodObject<{
            left: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            right: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        upper: z.ZodObject<{
            clip: z.ZodString;
            root: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            tip: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        forearm: z.ZodObject<{
            clip: z.ZodString;
            root: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            tip: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        hand: z.ZodObject<{
            clip: z.ZodString;
            root: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            tip: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        previewSurface: z.ZodObject<{
            keyboardLeft: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            keyboardRight: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            mouse: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            bounds: z.ZodObject<{
                left: z.ZodNumber;
                right: z.ZodNumber;
                back: z.ZodNumber;
                front: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    label: z.ZodString;
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
    profile: z.ZodEnum<{
        basic: "basic";
        office: "office";
    }>;
    work: z.ZodOptional<z.ZodObject<{
        shoulders: z.ZodObject<{
            left: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            right: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        upper: z.ZodObject<{
            clip: z.ZodString;
            root: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            tip: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        forearm: z.ZodObject<{
            clip: z.ZodString;
            root: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            tip: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        hand: z.ZodObject<{
            clip: z.ZodString;
            root: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            tip: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        previewSurface: z.ZodObject<{
            keyboardLeft: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            keyboardRight: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            mouse: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            bounds: z.ZodObject<{
                left: z.ZodNumber;
                right: z.ZodNumber;
                back: z.ZodNumber;
                front: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    label: z.ZodString;
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
export type CharacterSource = z.infer<typeof CharacterSourceSchema>;
export type CharacterManifest = z.infer<typeof CharacterManifestSchema>;
export declare function characterFrameDependencies(manifest: Pick<CharacterManifest, 'clips' | 'mouth' | 'work'>, names: string[]): string[];
/** Body timing and speech timing are independent; attachments belong to the sampled body frame. */
export declare function sampleCharacterLayers(manifest: CharacterManifest, name: string, elapsedMs?: number, progress?: number, speechElapsedMs?: number, surface?: WorkSurface): {
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
    work: {
        parts: {
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
            root: import("@pixoffice/contracts/contactSurface").WorkPoint;
            position: import("@pixoffice/contracts/contactSurface").WorkPoint;
            rotation: number;
            mirror: 1 | -1;
        }[];
        phase: string;
        contacts: {
            left: {
                x: number;
                y: number;
            };
            right: {
                x: number;
                y: number;
            };
        };
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
} | {
    loop: boolean;
    frames: {
        durationMs: number;
    }[];
} | undefined;
