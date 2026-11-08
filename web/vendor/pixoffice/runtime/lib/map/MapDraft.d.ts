import type { Point, Template, World } from '../model.ts';
import type { NavigationAdapter } from '../navigationAdapter.ts';
import type { SceneError } from '@pixoffice/protocol';
import type { MapDocument, MapOperation } from '@pixoffice/protocol/map';
export type MapDraftSnapshot = {
    id: string;
    revision: number;
    baseLayoutRevision: number;
    document: MapDocument;
    canUndo: boolean;
    canRedo: boolean;
    validation: {
        valid: boolean;
        error?: SceneError;
    };
    route?: {
        from: Point;
        to: Point;
        points: Point[];
        distance: number;
        turns: number;
        error?: SceneError;
    };
};
export declare function exportMap(world: World): MapDocument;
export declare function materializeMap(document: MapDocument, current: World, template: (id: string) => Template): World;
/** Domain-only transaction. Pointer gestures and HTTP commands share this history. */
export declare class MapDraft {
    readonly id: string;
    readonly baseLayoutRevision: number;
    private revision;
    private document;
    private past;
    private future;
    private validation;
    private route?;
    private navigation;
    private template;
    private readonly validateStructure;
    constructor(world: World, id: string, navigation: NavigationAdapter, template: (id: string) => Template, validateStructure?: (world: World) => void);
    assertRevision(id: string, revision: number): void;
    snapshot(): MapDraftSnapshot;
    world(current: World): World;
    patch(operations: MapOperation[], current: World, requireValid?: boolean): void;
    undo(current: World): void;
    redo(current: World): void;
    private changed;
    validate(current: World): {
        valid: boolean;
        error?: SceneError;
    };
    previewRoute(current: World, from: Point, to: Point): void;
}
