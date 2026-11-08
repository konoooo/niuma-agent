import { Container } from 'pixi.js';
import type { SceneReadPort } from '@pixoffice/runtime';
import type { Point } from '@pixoffice/runtime/model';
import type { CommandResult, SceneCommand } from '@pixoffice/protocol';
import type { VisualAssetManifest } from '@pixoffice/contracts/animation';
import type { AnimationRegistry } from './animation/AnimationRegistry.ts';
import type { PropViewRegistry } from './PropViewRegistry.ts';
import type { ScenePresentationPack } from './ScenePresentationPack.ts';
import type { SceneProjection } from '@pixoffice/contracts/projection';
export type SceneLoadProgress = {
    completed: number;
    total: number;
};
export type SceneActionProgress = SceneLoadProgress & {
    ready: boolean;
    error?: string;
};
export interface SceneViewOptions {
    runtime: SceneReadPort;
    onStep?: (elapsedMs: number) => void;
    dispatchCommand?: (command: SceneCommand) => CommandResult;
    pack: ScenePresentationPack;
    animations: AnimationRegistry<Container>;
    resolveAppearance(id: string): Promise<VisualAssetManifest>;
    propViews?: PropViewRegistry;
    onActorClick?: (event: {
        actorId: string;
        clientX: number;
        clientY: number;
    }) => void;
    onActorHover?: (event: {
        actorId: string;
        clientX: number;
        clientY: number;
        hovered: boolean;
    }) => void;
    onPropClick?: (event: {
        propId: string;
        clientX: number;
        clientY: number;
    }) => void;
    onCellClick?: (event: {
        cell: Point;
        clientX: number;
        clientY: number;
    }) => void;
    onDraftChange?: (error: string | null) => void;
    onLoadProgress?: (progress: SceneLoadProgress) => void;
    onActionProgress?: (progress: SceneActionProgress) => void;
}
export declare class SceneView {
    readonly runtime: SceneReadPort;
    protected options: SceneViewOptions;
    private app;
    private world;
    private layer;
    private overlays;
    private selectedActorId?;
    private grid;
    private agentEntities;
    private propViews;
    private ambientViews;
    private propViewTemplates;
    private viewRegistry;
    private pack;
    readonly projection: SceneProjection;
    private abort;
    private destroyed;
    private renderingSuspended;
    private renderElapsed;
    private renderBudget;
    private activeMotion;
    private lastRevision;
    private unsubscribe?;
    private unwatchPixelDensity?;
    private editorPreview?;
    private editorHighlight?;
    private characterLease?;
    private actionsReady;
    private firstFrameReady;
    private actionPreparation?;
    private initialization?;
    constructor(options: SceneViewOptions);
    protected onReady(): void;
    protected onRevision(): void;
    protected afterTick(_dt: number): void;
    protected beforeEditing(): void;
    protected onDestroy(): void;
    protected refresh(): void;
    init(host: HTMLElement, width: number, height: number): Promise<void>;
    private initialize;
    get areActionsReady(): boolean;
    selectActor(id?: string): void;
    actorClientAnchor(actorId: string): {
        clientX: number;
        clientY: number;
    } | undefined;
    actorLabelClientAnchor(actorId: string): {
        clientX: number;
        clientY: number;
    } | undefined;
    prepareActions(): Promise<void>;
    protected requireActions(): void;
    private dispatch;
    setRenderingSuspended(suspended: boolean): void;
    beginEditing(): void;
    cancelEditing(): void;
    applyEditing(): void;
    previewProp(preview?: {
        id: string;
        position: Point;
        templateId?: string;
        name?: string;
    }): void;
    highlightProp(id: string, valid: boolean): void;
    furnitureThumbnail(templateId: string): Promise<string>;
    private viewWorld;
    private mountProp;
    private syncProps;
    private syncActors;
    private syncTaskOcclusion;
    private onTick;
    private drawGridArea;
    private sceneBounds;
    /** Canvas CSS coordinates, not client coordinates. Outside the map returns null. */
    screenToCell(point: Point): Point | null;
    resize(width: number, height: number): void;
    destroy(): void;
}
