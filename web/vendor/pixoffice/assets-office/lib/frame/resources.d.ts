import type { CharacterPackResources as FrameResources } from '@pixoffice/animation-frame/CharacterPackResources';
import { type CharacterManifest } from './packSchema.ts';
export type CharacterPackResources = FrameResources<CharacterManifest>;
export type CharacterPack = CharacterPackResources;
export declare const configureCharacterResources: (baseUrl: string) => void, characterResourceUrl: (path: string) => string, loadCharacterRegistry: () => Promise<import("@pixoffice/animation-frame/packSchema").CharacterRegistry>, readCharacterManifest: (id: string) => Promise<{
    manifest: {
        revision: string;
        pages: {
            width: number;
            height: number;
            image: string;
            group: "startup" | "deferred";
        }[];
        frames: Record<string, {
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
        }>;
        clips: Record<string, {
            alias: string;
            mirrorX: boolean;
        } | {
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
        }>;
        profile: "basic" | "office";
        schemaVersion: 1;
        id: string;
        label: string;
        canvas: {
            width: number;
            height: number;
        };
        pivot: {
            x: number;
            y: number;
        };
        referenceHeight: number;
        displayHeight: number;
        portrait: string;
        work?: {
            shoulders: {
                left: {
                    x: number;
                    y: number;
                };
                right: {
                    x: number;
                    y: number;
                };
            };
            upper: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            forearm: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            hand: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            previewSurface: {
                keyboardLeft: {
                    x: number;
                    y: number;
                };
                keyboardRight: {
                    x: number;
                    y: number;
                };
                mouse: {
                    x: number;
                    y: number;
                };
                bounds: {
                    left: number;
                    right: number;
                    back: number;
                    front: number;
                };
            };
        } | undefined;
        mouth?: {
            pivot: {
                x: number;
                y: number;
            };
            views: Record<string, {
                closed: string;
                speaking: string;
            }>;
        } | undefined;
    };
    url: string;
}>, characterAssets: {
    acquire(id: string, manifestUrl?: string): Promise<{
        value: FrameResources<{
            revision: string;
            pages: {
                width: number;
                height: number;
                image: string;
                group: "startup" | "deferred";
            }[];
            frames: Record<string, {
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
            }>;
            clips: Record<string, {
                alias: string;
                mirrorX: boolean;
            } | {
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
            }>;
            profile: "basic" | "office";
            schemaVersion: 1;
            id: string;
            label: string;
            canvas: {
                width: number;
                height: number;
            };
            pivot: {
                x: number;
                y: number;
            };
            referenceHeight: number;
            displayHeight: number;
            portrait: string;
            work?: {
                shoulders: {
                    left: {
                        x: number;
                        y: number;
                    };
                    right: {
                        x: number;
                        y: number;
                    };
                };
                upper: {
                    clip: string;
                    root: {
                        x: number;
                        y: number;
                    };
                    tip: {
                        x: number;
                        y: number;
                    };
                };
                forearm: {
                    clip: string;
                    root: {
                        x: number;
                        y: number;
                    };
                    tip: {
                        x: number;
                        y: number;
                    };
                };
                hand: {
                    clip: string;
                    root: {
                        x: number;
                        y: number;
                    };
                    tip: {
                        x: number;
                        y: number;
                    };
                };
                previewSurface: {
                    keyboardLeft: {
                        x: number;
                        y: number;
                    };
                    keyboardRight: {
                        x: number;
                        y: number;
                    };
                    mouse: {
                        x: number;
                        y: number;
                    };
                    bounds: {
                        left: number;
                        right: number;
                        back: number;
                        front: number;
                    };
                };
            } | undefined;
            mouth?: {
                pivot: {
                    x: number;
                    y: number;
                };
                views: Record<string, {
                    closed: string;
                    speaking: string;
                }>;
            } | undefined;
        }>;
        release: () => void;
    }>;
    get(id: string): FrameResources<{
        revision: string;
        pages: {
            width: number;
            height: number;
            image: string;
            group: "startup" | "deferred";
        }[];
        frames: Record<string, {
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
        }>;
        clips: Record<string, {
            alias: string;
            mirrorX: boolean;
        } | {
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
        }>;
        profile: "basic" | "office";
        schemaVersion: 1;
        id: string;
        label: string;
        canvas: {
            width: number;
            height: number;
        };
        pivot: {
            x: number;
            y: number;
        };
        referenceHeight: number;
        displayHeight: number;
        portrait: string;
        work?: {
            shoulders: {
                left: {
                    x: number;
                    y: number;
                };
                right: {
                    x: number;
                    y: number;
                };
            };
            upper: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            forearm: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            hand: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            previewSurface: {
                keyboardLeft: {
                    x: number;
                    y: number;
                };
                keyboardRight: {
                    x: number;
                    y: number;
                };
                mouse: {
                    x: number;
                    y: number;
                };
                bounds: {
                    left: number;
                    right: number;
                    back: number;
                    front: number;
                };
            };
        } | undefined;
        mouth?: {
            pivot: {
                x: number;
                y: number;
            };
            views: Record<string, {
                closed: string;
                speaking: string;
            }>;
        } | undefined;
    }> | undefined;
}, getCharacterPack: (id: string) => FrameResources<{
    revision: string;
    pages: {
        width: number;
        height: number;
        image: string;
        group: "startup" | "deferred";
    }[];
    frames: Record<string, {
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
    }>;
    clips: Record<string, {
        alias: string;
        mirrorX: boolean;
    } | {
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
    }>;
    profile: "basic" | "office";
    schemaVersion: 1;
    id: string;
    label: string;
    canvas: {
        width: number;
        height: number;
    };
    pivot: {
        x: number;
        y: number;
    };
    referenceHeight: number;
    displayHeight: number;
    portrait: string;
    work?: {
        shoulders: {
            left: {
                x: number;
                y: number;
            };
            right: {
                x: number;
                y: number;
            };
        };
        upper: {
            clip: string;
            root: {
                x: number;
                y: number;
            };
            tip: {
                x: number;
                y: number;
            };
        };
        forearm: {
            clip: string;
            root: {
                x: number;
                y: number;
            };
            tip: {
                x: number;
                y: number;
            };
        };
        hand: {
            clip: string;
            root: {
                x: number;
                y: number;
            };
            tip: {
                x: number;
                y: number;
            };
        };
        previewSurface: {
            keyboardLeft: {
                x: number;
                y: number;
            };
            keyboardRight: {
                x: number;
                y: number;
            };
            mouse: {
                x: number;
                y: number;
            };
            bounds: {
                left: number;
                right: number;
                back: number;
                front: number;
            };
        };
    } | undefined;
    mouth?: {
        pivot: {
            x: number;
            y: number;
        };
        views: Record<string, {
            closed: string;
            speaking: string;
        }>;
    } | undefined;
}> | undefined, acquireCharacterPacks: (ids: string[], onLoaded?: (id: string) => void, options?: {
    preload: "startup" | "all";
    clipsForPack?: ((pack: FrameResources<{
        revision: string;
        pages: {
            width: number;
            height: number;
            image: string;
            group: "startup" | "deferred";
        }[];
        frames: Record<string, {
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
        }>;
        clips: Record<string, {
            alias: string;
            mirrorX: boolean;
        } | {
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
        }>;
        profile: "basic" | "office";
        schemaVersion: 1;
        id: string;
        label: string;
        canvas: {
            width: number;
            height: number;
        };
        pivot: {
            x: number;
            y: number;
        };
        referenceHeight: number;
        displayHeight: number;
        portrait: string;
        work?: {
            shoulders: {
                left: {
                    x: number;
                    y: number;
                };
                right: {
                    x: number;
                    y: number;
                };
            };
            upper: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            forearm: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            hand: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            previewSurface: {
                keyboardLeft: {
                    x: number;
                    y: number;
                };
                keyboardRight: {
                    x: number;
                    y: number;
                };
                mouse: {
                    x: number;
                    y: number;
                };
                bounds: {
                    left: number;
                    right: number;
                    back: number;
                    front: number;
                };
            };
        } | undefined;
        mouth?: {
            pivot: {
                x: number;
                y: number;
            };
            views: Record<string, {
                closed: string;
                speaking: string;
            }>;
        } | undefined;
    }>) => string[]) | undefined;
} | undefined) => Promise<{
    packs: FrameResources<{
        revision: string;
        pages: {
            width: number;
            height: number;
            image: string;
            group: "startup" | "deferred";
        }[];
        frames: Record<string, {
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
        }>;
        clips: Record<string, {
            alias: string;
            mirrorX: boolean;
        } | {
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
        }>;
        profile: "basic" | "office";
        schemaVersion: 1;
        id: string;
        label: string;
        canvas: {
            width: number;
            height: number;
        };
        pivot: {
            x: number;
            y: number;
        };
        referenceHeight: number;
        displayHeight: number;
        portrait: string;
        work?: {
            shoulders: {
                left: {
                    x: number;
                    y: number;
                };
                right: {
                    x: number;
                    y: number;
                };
            };
            upper: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            forearm: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            hand: {
                clip: string;
                root: {
                    x: number;
                    y: number;
                };
                tip: {
                    x: number;
                    y: number;
                };
            };
            previewSurface: {
                keyboardLeft: {
                    x: number;
                    y: number;
                };
                keyboardRight: {
                    x: number;
                    y: number;
                };
                mouse: {
                    x: number;
                    y: number;
                };
                bounds: {
                    left: number;
                    right: number;
                    back: number;
                    front: number;
                };
            };
        } | undefined;
        mouth?: {
            pivot: {
                x: number;
                y: number;
            };
            views: Record<string, {
                closed: string;
                speaking: string;
            }>;
        } | undefined;
    }>[];
    release: () => void;
}>;
