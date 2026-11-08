import { z } from 'zod';
declare const point: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strict>;
export declare const viewDirectionSchema: z.ZodEnum<{
    front: "front";
    back: "back";
    left: "left";
    right: "right";
    "front-left": "front-left";
    "front-right": "front-right";
    "back-left": "back-left";
    "back-right": "back-right";
}>;
export type ViewDirection = z.infer<typeof viewDirectionSchema>;
export type PointDu = z.infer<typeof point>;
export type BoundsDu = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
export declare const actionClockSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"time">;
    elapsedMs: z.ZodNumber;
    loop: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    mode: z.ZodLiteral<"progress">;
    progress: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    mode: z.ZodLiteral<"distance">;
    travelledDu: z.ZodNumber;
    strideDu: z.ZodNumber;
}, z.core.$strict>], "mode">;
export type ActionClock = z.infer<typeof actionClockSchema>;
export declare const visualRequestSchema: z.ZodObject<{
    poseId: z.ZodString;
    view: z.ZodEnum<{
        front: "front";
        back: "back";
        left: "left";
        right: "right";
        "front-left": "front-left";
        "front-right": "front-right";
        "back-left": "back-left";
        "back-right": "back-right";
    }>;
    variantIds: z.ZodArray<z.ZodString>;
    contactProfileId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type VisualRequest = z.infer<typeof visualRequestSchema>;
export declare const entityPresentationSchema: z.ZodObject<{
    entityId: z.ZodString;
    request: z.ZodObject<{
        poseId: z.ZodString;
        view: z.ZodEnum<{
            front: "front";
            back: "back";
            left: "left";
            right: "right";
            "front-left": "front-left";
            "front-right": "front-right";
            "back-left": "back-left";
            "back-right": "back-right";
        }>;
        variantIds: z.ZodArray<z.ZodString>;
        contactProfileId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    actions: z.ZodArray<z.ZodObject<{
        instanceId: z.ZodString;
        variantId: z.ZodString;
        clock: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"time">;
            elapsedMs: z.ZodNumber;
            loop: z.ZodBoolean;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"progress">;
            progress: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"distance">;
            travelledDu: z.ZodNumber;
            strideDu: z.ZodNumber;
        }, z.core.$strict>], "mode">;
    }, z.core.$strict>>;
    contacts: z.ZodArray<z.ZodObject<{
        socketId: z.ZodString;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>;
        toleranceDu: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type EntityPresentation = z.infer<typeof entityPresentationSchema>;
export type ActionSample = EntityPresentation['actions'][number];
export type ContactTarget = EntityPresentation['contacts'][number];
export type SupportResult = {
    supported: true;
} | {
    supported: false;
    missing: string[];
};
export interface ActionVariant {
    variantId: string;
    actionId: string;
    poseId: string;
    view: ViewDirection;
    channel: 'base' | 'gesture' | 'speech';
    clockModes: ActionClock['mode'][];
}
export interface VisualAssetManifest {
    schemaVersion: 1;
    asset: {
        id: string;
        revision: string;
    };
    adapterId: string;
    adapterApiVersion: 1;
    rendererApiVersion: 'pixi-1';
    presentationProfileId: string;
    capabilities: {
        variants: ActionVariant[];
        combinations: string[][];
        contactProfiles: string[];
        sockets: {
            id: string;
            policy: 'stable' | 'animated';
        }[];
    };
    source: {
        format: string;
        uri: string;
    };
}
export declare const visualAssetManifestSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    asset: z.ZodObject<{
        id: z.ZodString;
        revision: z.ZodString;
    }, z.core.$strict>;
    adapterId: z.ZodString;
    adapterApiVersion: z.ZodLiteral<1>;
    rendererApiVersion: z.ZodLiteral<"pixi-1">;
    presentationProfileId: z.ZodString;
    capabilities: z.ZodObject<{
        variants: z.ZodArray<z.ZodObject<{
            variantId: z.ZodString;
            actionId: z.ZodString;
            poseId: z.ZodString;
            view: z.ZodEnum<{
                front: "front";
                back: "back";
                left: "left";
                right: "right";
                "front-left": "front-left";
                "front-right": "front-right";
                "back-left": "back-left";
                "back-right": "back-right";
            }>;
            channel: z.ZodEnum<{
                base: "base";
                gesture: "gesture";
                speech: "speech";
            }>;
            clockModes: z.ZodArray<z.ZodEnum<{
                time: "time";
                progress: "progress";
                distance: "distance";
            }>>;
        }, z.core.$strict>>;
        combinations: z.ZodArray<z.ZodArray<z.ZodString>>;
        contactProfiles: z.ZodArray<z.ZodString>;
        sockets: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            policy: z.ZodEnum<{
                stable: "stable";
                animated: "animated";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    source: z.ZodObject<{
        format: z.ZodString;
        uri: z.ZodString;
    }, z.core.$loose>;
}, z.core.$strict>;
export interface VisualCue {
    actionInstanceId: string;
    markerId: string;
    cycle: number;
}
export interface AnimatedVisual<TNode> {
    readonly root: TNode;
    sample(state: EntityPresentation): readonly VisualCue[];
    getSocket(id: string): PointDu | undefined;
    getHitBounds(): BoundsDu;
    dispose(): void;
}
export interface VisualAssetLease<TNode> {
    readonly manifest: VisualAssetManifest;
    assess(request: VisualRequest): SupportResult;
    prepare(requests: readonly VisualRequest[], signal: AbortSignal): Promise<void>;
    create(initial: EntityPresentation): AnimatedVisual<TNode>;
    release(): void;
}
export interface AnimationAdapter<TNode> {
    readonly id: string;
    readonly apiVersion: 1;
    readonly rendererApiVersion: 'pixi-1';
    acquire(manifest: VisualAssetManifest, signal: AbortSignal): Promise<VisualAssetLease<TNode>>;
}
export {};
