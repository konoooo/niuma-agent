import { type CharacterRegistry } from './packSchema.ts';
import { CharacterPackResources } from './CharacterPackResources.ts';
import { type CharacterManifest } from './packSchema.ts';
export type CharacterPack = CharacterPackResources;
export declare function createCharacterResources<T extends CharacterManifest>(options: {
    parseManifest(data: unknown): T;
    dependencies?: (manifest: T, names: string[]) => string[];
    cacheData?: Record<string, unknown>;
}): {
    configureCharacterResources: (baseUrl: string) => void;
    characterResourceUrl: (path: string) => string;
    loadCharacterRegistry: () => Promise<CharacterRegistry>;
    readCharacterManifest: (id: string) => Promise<{
        manifest: T;
        url: string;
    }>;
    characterAssets: {
        acquire(id: string, manifestUrl?: string): Promise<{
            value: CharacterPackResources<T>;
            release: () => void;
        }>;
        get(id: string): CharacterPackResources<T> | undefined;
    };
    getCharacterPack: (id: string) => CharacterPackResources<T> | undefined;
    acquireCharacterPacks: (ids: string[], onLoaded?: (id: string) => void, options?: {
        preload: "startup" | "all";
        clipsForPack?: (pack: CharacterPackResources<T>) => string[];
    }) => Promise<{
        packs: CharacterPackResources<T>[];
        release: () => void;
    }>;
};
export declare const configureCharacterResources: (baseUrl: string) => void, characterResourceUrl: (path: string) => string, loadCharacterRegistry: () => Promise<CharacterRegistry>, readCharacterManifest: (id: string) => Promise<{
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
        schemaVersion: 1;
        id: string;
        label: string;
        profile: string;
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
        value: CharacterPackResources<{
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
            schemaVersion: 1;
            id: string;
            label: string;
            profile: string;
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
    get(id: string): CharacterPackResources<{
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
        schemaVersion: 1;
        id: string;
        label: string;
        profile: string;
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
}, getCharacterPack: (id: string) => CharacterPackResources<{
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
    schemaVersion: 1;
    id: string;
    label: string;
    profile: string;
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
}> | undefined, acquireCharacterPacks: (ids: string[], onLoaded?: ((id: string) => void) | undefined, options?: {
    preload: "startup" | "all";
    clipsForPack?: ((pack: CharacterPackResources<{
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
        schemaVersion: 1;
        id: string;
        label: string;
        profile: string;
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
}) => Promise<{
    packs: CharacterPackResources<{
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
        schemaVersion: 1;
        id: string;
        label: string;
        profile: string;
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
