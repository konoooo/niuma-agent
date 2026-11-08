import { z } from 'zod';
import type { CommandRecord, CommandResult } from '@pixoffice/protocol';
import type { Actor, Checkpoint, Persistence, Snapshot, World } from './model.ts';
import type { PoseSupport } from './actionContract.ts';
import type { NavigationAdapter, NavigationFactory } from './navigationAdapter.ts';
import type { ScenePlugin } from './plugins.ts';
import type { SeatStepDuration } from './seatInteraction.ts';
export type SceneRuntimeOptions = {
    world: World;
    plugins: ScenePlugin[];
    createNavigation: NavigationFactory;
    now?: () => number;
    persistence?: Persistence;
    runtimeId?: string;
    seatStepDuration?: SeatStepDuration;
    supportsPose?: PoseSupport;
};
export declare class SceneRuntime {
    readonly runtimeId: string;
    private readonly plugins;
    readonly navigation: NavigationAdapter;
    private movement;
    private supportsPose;
    private world;
    private resources;
    private records;
    private stateSources;
    private completedActivities;
    private activities;
    private events;
    private listeners;
    private now;
    private persistence?;
    private persistenceError?;
    private layoutRecovery?;
    private revision;
    private sequence;
    private disposed;
    private pumping;
    private editing;
    private editor?;
    private phaseReady;
    private settling;
    constructor(options: SceneRuntimeOptions);
    private defineResources;
    subscribe: (listener: () => void) => () => void;
    getRevision: () => number;
    get sceneId(): string;
    get isEditing(): boolean;
    /** Successful finite activities in this runtime lifetime, independent of bounded history. */
    get completedActivityCount(): number;
    template(id: string): import("./model.ts").Template;
    templates(): import("./model.ts").Template[];
    exportMap(): {
        format: "ai-office-map";
        version: 2;
        unit: "cell";
        sceneId: string;
        width: number;
        height: number;
        gridSize: 1;
        bounds: {
            left: number;
            top: number;
            right: number;
            bottom: number;
        };
        walkableArea: {
            x: number;
            y: number;
        }[];
        blockedAreas: {
            id: string;
            name: string;
            bounds: {
                left: number;
                top: number;
                right: number;
                bottom: number;
            };
        }[];
        props: {
            id: string;
            name: string;
            templateId: string;
            position: {
                x: number;
                y: number;
            };
            anchors?: (Record<string, import("@pixoffice/protocol/schema").JsonValue> & Record<string, {
                x: number;
                y: number;
            }>) | undefined;
        }[];
        bindings: {
            actorId: string;
            homeId: string;
            position: {
                x: number;
                y: number;
            };
        }[];
    };
    editorSnapshot(): import("./map/MapDraft.ts").MapDraftSnapshot | undefined;
    readEditorWorld(): World;
    readWorld(): World;
    readActors(): Actor[];
    readActivePhases(): {
        activityId: string;
        capability: string;
        participants: string[];
        phaseIndex: number;
        phaseCount: number;
        title: string;
        ready: boolean;
        actions: {
            actorId: string;
            actionId: string;
        }[];
        progress: number;
    }[];
    getRecord(id: string): CommandRecord | undefined;
    snapshot(): Snapshot;
    describe(): {
        sceneId: string;
        furnitureGrid: {
            cellSize: number;
            origin: {
                x: number;
                y: number;
            };
        };
        plugins: {
            stateSchemas: {
                [k: string]: z.core.ZodStandardJSONSchemaPayload<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
            };
            operations: {
                id: string;
                name: string;
                params: z.core.ZodStandardJSONSchemaPayload<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
                participants: {
                    min: number;
                    max: number;
                    roles: {
                        role: string;
                        min: number;
                        max: number;
                    }[];
                    rules: string[];
                };
            }[];
            id: string;
            name: string;
            version: string;
            enabled: boolean;
            capabilities: string[];
        }[];
        templates: import("./model.ts").Template[];
        entities: {
            id: string;
            name: string;
            kind: string;
        }[];
        protocolVersion: string;
        unit: string;
        coordinates: string;
        command: z.core.ZodStandardJSONSchemaPayload<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"map.edit">;
            edit: z.ZodDiscriminatedUnion<[z.ZodObject<{
                action: z.ZodLiteral<"begin">;
                expectedLayoutRevision: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"patch">;
                operations: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    op: z.ZodLiteral<"prop.put">;
                    prop: z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        templateId: z.ZodString;
                        position: z.ZodObject<{
                            x: z.ZodNumber;
                            y: z.ZodNumber;
                        }, z.core.$strict>;
                        anchors: z.ZodOptional<z.ZodIntersection<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("@pixoffice/protocol/schema").JsonValue, unknown, z.core.$ZodTypeInternals<import("@pixoffice/protocol/schema").JsonValue, unknown>>>>, z.ZodRecord<z.ZodString, z.ZodObject<{
                            x: z.ZodNumber;
                            y: z.ZodNumber;
                        }, z.core.$strict>>>>;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    op: z.ZodLiteral<"prop.remove">;
                    id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    op: z.ZodLiteral<"floor.set">;
                    points: z.ZodArray<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>>;
                }, z.core.$strict>, z.ZodObject<{
                    op: z.ZodLiteral<"blocked.put">;
                    area: z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        bounds: z.ZodObject<{
                            left: z.ZodNumber;
                            top: z.ZodNumber;
                            right: z.ZodNumber;
                            bottom: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    op: z.ZodLiteral<"blocked.remove">;
                    id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    op: z.ZodLiteral<"binding.set">;
                    actorId: z.ZodString;
                    homeId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
                    position: z.ZodOptional<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>>;
                }, z.core.$strict>, z.ZodObject<{
                    op: z.ZodLiteral<"map.replace">;
                    document: z.ZodObject<{
                        format: z.ZodLiteral<"ai-office-map">;
                        version: z.ZodLiteral<2>;
                        unit: z.ZodLiteral<"cell">;
                        sceneId: z.ZodString;
                        width: z.ZodNumber;
                        height: z.ZodNumber;
                        gridSize: z.ZodLiteral<1>;
                        bounds: z.ZodObject<{
                            left: z.ZodNumber;
                            top: z.ZodNumber;
                            right: z.ZodNumber;
                            bottom: z.ZodNumber;
                        }, z.core.$strict>;
                        walkableArea: z.ZodArray<z.ZodObject<{
                            x: z.ZodNumber;
                            y: z.ZodNumber;
                        }, z.core.$strict>>;
                        blockedAreas: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            name: z.ZodString;
                            bounds: z.ZodObject<{
                                left: z.ZodNumber;
                                top: z.ZodNumber;
                                right: z.ZodNumber;
                                bottom: z.ZodNumber;
                            }, z.core.$strict>;
                        }, z.core.$strict>>;
                        props: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            name: z.ZodString;
                            templateId: z.ZodString;
                            position: z.ZodObject<{
                                x: z.ZodNumber;
                                y: z.ZodNumber;
                            }, z.core.$strict>;
                            anchors: z.ZodOptional<z.ZodIntersection<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("@pixoffice/protocol/schema").JsonValue, unknown, z.core.$ZodTypeInternals<import("@pixoffice/protocol/schema").JsonValue, unknown>>>>, z.ZodRecord<z.ZodString, z.ZodObject<{
                                x: z.ZodNumber;
                                y: z.ZodNumber;
                            }, z.core.$strict>>>>;
                        }, z.core.$strict>>;
                        bindings: z.ZodArray<z.ZodObject<{
                            actorId: z.ZodString;
                            homeId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
                            position: z.ZodObject<{
                                x: z.ZodNumber;
                                y: z.ZodNumber;
                            }, z.core.$strict>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                }, z.core.$strict>], "op">>;
                requireValid: z.ZodOptional<z.ZodBoolean>;
                draftId: z.ZodString;
                expectedDraftRevision: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"undo">;
                draftId: z.ZodString;
                expectedDraftRevision: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"redo">;
                draftId: z.ZodString;
                expectedDraftRevision: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"validate">;
                draftId: z.ZodString;
                expectedDraftRevision: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"route">;
                from: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                to: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                draftId: z.ZodString;
                expectedDraftRevision: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"commit">;
                draftId: z.ZodString;
                expectedDraftRevision: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                action: z.ZodLiteral<"cancel">;
                draftId: z.ZodString;
                expectedDraftRevision: z.ZodNumber;
            }, z.core.$strict>], "action">;
            protocolVersion: z.ZodLiteral<"2.0">;
            sceneId: z.ZodString;
            commandId: z.ZodString;
            after: z.ZodOptional<z.ZodArray<z.ZodString>>;
            busyPolicy: z.ZodOptional<z.ZodEnum<{
                queue: "queue";
                reject: "reject";
            }>>;
            timeoutMs: z.ZodOptional<z.ZodNumber>;
            expiresAt: z.ZodOptional<z.ZodISODateTime>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"activity.start">;
            capability: z.ZodString;
            participants: z.ZodArray<z.ZodObject<{
                entityId: z.ZodString;
                role: z.ZodString;
            }, z.core.$strict>>;
            params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("@pixoffice/protocol/schema").JsonValue, unknown, z.core.$ZodTypeInternals<import("@pixoffice/protocol/schema").JsonValue, unknown>>>>;
            protocolVersion: z.ZodLiteral<"2.0">;
            sceneId: z.ZodString;
            commandId: z.ZodString;
            after: z.ZodOptional<z.ZodArray<z.ZodString>>;
            busyPolicy: z.ZodOptional<z.ZodEnum<{
                queue: "queue";
                reject: "reject";
            }>>;
            timeoutMs: z.ZodOptional<z.ZodNumber>;
            expiresAt: z.ZodOptional<z.ZodISODateTime>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"activity.stop">;
            activityId: z.ZodString;
            protocolVersion: z.ZodLiteral<"2.0">;
            sceneId: z.ZodString;
            commandId: z.ZodString;
            after: z.ZodOptional<z.ZodArray<z.ZodString>>;
            busyPolicy: z.ZodOptional<z.ZodEnum<{
                queue: "queue";
                reject: "reject";
            }>>;
            timeoutMs: z.ZodOptional<z.ZodNumber>;
            expiresAt: z.ZodOptional<z.ZodISODateTime>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"command.cancel">;
            targetCommandId: z.ZodString;
            protocolVersion: z.ZodLiteral<"2.0">;
            sceneId: z.ZodString;
            commandId: z.ZodString;
            after: z.ZodOptional<z.ZodArray<z.ZodString>>;
            busyPolicy: z.ZodOptional<z.ZodEnum<{
                queue: "queue";
                reject: "reject";
            }>>;
            timeoutMs: z.ZodOptional<z.ZodNumber>;
            expiresAt: z.ZodOptional<z.ZodISODateTime>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"actor.presentation.set">;
            actorId: z.ZodString;
            sourceRevision: z.ZodNumber;
            status: z.ZodEnum<{
                thinking: "thinking";
                idle: "idle";
                working: "working";
            }>;
            title: z.ZodString;
            protocolVersion: z.ZodLiteral<"2.0">;
            sceneId: z.ZodString;
            commandId: z.ZodString;
            after: z.ZodOptional<z.ZodArray<z.ZodString>>;
            busyPolicy: z.ZodOptional<z.ZodEnum<{
                queue: "queue";
                reject: "reject";
            }>>;
            timeoutMs: z.ZodOptional<z.ZodNumber>;
            expiresAt: z.ZodOptional<z.ZodISODateTime>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"object.state.set">;
            entityId: z.ZodString;
            expectedStateRevision: z.ZodNumber;
            state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("@pixoffice/protocol/schema").JsonValue, unknown, z.core.$ZodTypeInternals<import("@pixoffice/protocol/schema").JsonValue, unknown>>>>;
            protocolVersion: z.ZodLiteral<"2.0">;
            sceneId: z.ZodString;
            commandId: z.ZodString;
            after: z.ZodOptional<z.ZodArray<z.ZodString>>;
            busyPolicy: z.ZodOptional<z.ZodEnum<{
                queue: "queue";
                reject: "reject";
            }>>;
            timeoutMs: z.ZodOptional<z.ZodNumber>;
            expiresAt: z.ZodOptional<z.ZodISODateTime>;
        }, z.core.$strict>], "type">>;
        batch: z.core.ZodStandardJSONSchemaPayload<z.ZodObject<{
            mode: z.ZodEnum<{
                sequence: "sequence";
                parallel: "parallel";
            }>;
            commands: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                type: z.ZodLiteral<"map.edit">;
                edit: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    action: z.ZodLiteral<"begin">;
                    expectedLayoutRevision: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    action: z.ZodLiteral<"patch">;
                    operations: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        op: z.ZodLiteral<"prop.put">;
                        prop: z.ZodObject<{
                            id: z.ZodString;
                            name: z.ZodString;
                            templateId: z.ZodString;
                            position: z.ZodObject<{
                                x: z.ZodNumber;
                                y: z.ZodNumber;
                            }, z.core.$strict>;
                            anchors: z.ZodOptional<z.ZodIntersection<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("@pixoffice/protocol/schema").JsonValue, unknown, z.core.$ZodTypeInternals<import("@pixoffice/protocol/schema").JsonValue, unknown>>>>, z.ZodRecord<z.ZodString, z.ZodObject<{
                                x: z.ZodNumber;
                                y: z.ZodNumber;
                            }, z.core.$strict>>>>;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        op: z.ZodLiteral<"prop.remove">;
                        id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        op: z.ZodLiteral<"floor.set">;
                        points: z.ZodArray<z.ZodObject<{
                            x: z.ZodNumber;
                            y: z.ZodNumber;
                        }, z.core.$strict>>;
                    }, z.core.$strict>, z.ZodObject<{
                        op: z.ZodLiteral<"blocked.put">;
                        area: z.ZodObject<{
                            id: z.ZodString;
                            name: z.ZodString;
                            bounds: z.ZodObject<{
                                left: z.ZodNumber;
                                top: z.ZodNumber;
                                right: z.ZodNumber;
                                bottom: z.ZodNumber;
                            }, z.core.$strict>;
                        }, z.core.$strict>;
                    }, z.core.$strict>, z.ZodObject<{
                        op: z.ZodLiteral<"blocked.remove">;
                        id: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        op: z.ZodLiteral<"binding.set">;
                        actorId: z.ZodString;
                        homeId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
                        position: z.ZodOptional<z.ZodObject<{
                            x: z.ZodNumber;
                            y: z.ZodNumber;
                        }, z.core.$strict>>;
                    }, z.core.$strict>, z.ZodObject<{
                        op: z.ZodLiteral<"map.replace">;
                        document: z.ZodObject<{
                            format: z.ZodLiteral<"ai-office-map">;
                            version: z.ZodLiteral<2>;
                            unit: z.ZodLiteral<"cell">;
                            sceneId: z.ZodString;
                            width: z.ZodNumber;
                            height: z.ZodNumber;
                            gridSize: z.ZodLiteral<1>;
                            bounds: z.ZodObject<{
                                left: z.ZodNumber;
                                top: z.ZodNumber;
                                right: z.ZodNumber;
                                bottom: z.ZodNumber;
                            }, z.core.$strict>;
                            walkableArea: z.ZodArray<z.ZodObject<{
                                x: z.ZodNumber;
                                y: z.ZodNumber;
                            }, z.core.$strict>>;
                            blockedAreas: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                name: z.ZodString;
                                bounds: z.ZodObject<{
                                    left: z.ZodNumber;
                                    top: z.ZodNumber;
                                    right: z.ZodNumber;
                                    bottom: z.ZodNumber;
                                }, z.core.$strict>;
                            }, z.core.$strict>>;
                            props: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                name: z.ZodString;
                                templateId: z.ZodString;
                                position: z.ZodObject<{
                                    x: z.ZodNumber;
                                    y: z.ZodNumber;
                                }, z.core.$strict>;
                                anchors: z.ZodOptional<z.ZodIntersection<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("@pixoffice/protocol/schema").JsonValue, unknown, z.core.$ZodTypeInternals<import("@pixoffice/protocol/schema").JsonValue, unknown>>>>, z.ZodRecord<z.ZodString, z.ZodObject<{
                                    x: z.ZodNumber;
                                    y: z.ZodNumber;
                                }, z.core.$strict>>>>;
                            }, z.core.$strict>>;
                            bindings: z.ZodArray<z.ZodObject<{
                                actorId: z.ZodString;
                                homeId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
                                position: z.ZodObject<{
                                    x: z.ZodNumber;
                                    y: z.ZodNumber;
                                }, z.core.$strict>;
                            }, z.core.$strict>>;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "op">>;
                    requireValid: z.ZodOptional<z.ZodBoolean>;
                    draftId: z.ZodString;
                    expectedDraftRevision: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    action: z.ZodLiteral<"undo">;
                    draftId: z.ZodString;
                    expectedDraftRevision: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    action: z.ZodLiteral<"redo">;
                    draftId: z.ZodString;
                    expectedDraftRevision: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    action: z.ZodLiteral<"validate">;
                    draftId: z.ZodString;
                    expectedDraftRevision: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    action: z.ZodLiteral<"route">;
                    from: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    to: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    draftId: z.ZodString;
                    expectedDraftRevision: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    action: z.ZodLiteral<"commit">;
                    draftId: z.ZodString;
                    expectedDraftRevision: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    action: z.ZodLiteral<"cancel">;
                    draftId: z.ZodString;
                    expectedDraftRevision: z.ZodNumber;
                }, z.core.$strict>], "action">;
                protocolVersion: z.ZodLiteral<"2.0">;
                sceneId: z.ZodString;
                commandId: z.ZodString;
                after: z.ZodOptional<z.ZodArray<z.ZodString>>;
                busyPolicy: z.ZodOptional<z.ZodEnum<{
                    queue: "queue";
                    reject: "reject";
                }>>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                expiresAt: z.ZodOptional<z.ZodISODateTime>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"activity.start">;
                capability: z.ZodString;
                participants: z.ZodArray<z.ZodObject<{
                    entityId: z.ZodString;
                    role: z.ZodString;
                }, z.core.$strict>>;
                params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("@pixoffice/protocol/schema").JsonValue, unknown, z.core.$ZodTypeInternals<import("@pixoffice/protocol/schema").JsonValue, unknown>>>>;
                protocolVersion: z.ZodLiteral<"2.0">;
                sceneId: z.ZodString;
                commandId: z.ZodString;
                after: z.ZodOptional<z.ZodArray<z.ZodString>>;
                busyPolicy: z.ZodOptional<z.ZodEnum<{
                    queue: "queue";
                    reject: "reject";
                }>>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                expiresAt: z.ZodOptional<z.ZodISODateTime>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"activity.stop">;
                activityId: z.ZodString;
                protocolVersion: z.ZodLiteral<"2.0">;
                sceneId: z.ZodString;
                commandId: z.ZodString;
                after: z.ZodOptional<z.ZodArray<z.ZodString>>;
                busyPolicy: z.ZodOptional<z.ZodEnum<{
                    queue: "queue";
                    reject: "reject";
                }>>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                expiresAt: z.ZodOptional<z.ZodISODateTime>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"command.cancel">;
                targetCommandId: z.ZodString;
                protocolVersion: z.ZodLiteral<"2.0">;
                sceneId: z.ZodString;
                commandId: z.ZodString;
                after: z.ZodOptional<z.ZodArray<z.ZodString>>;
                busyPolicy: z.ZodOptional<z.ZodEnum<{
                    queue: "queue";
                    reject: "reject";
                }>>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                expiresAt: z.ZodOptional<z.ZodISODateTime>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"actor.presentation.set">;
                actorId: z.ZodString;
                sourceRevision: z.ZodNumber;
                status: z.ZodEnum<{
                    thinking: "thinking";
                    idle: "idle";
                    working: "working";
                }>;
                title: z.ZodString;
                protocolVersion: z.ZodLiteral<"2.0">;
                sceneId: z.ZodString;
                commandId: z.ZodString;
                after: z.ZodOptional<z.ZodArray<z.ZodString>>;
                busyPolicy: z.ZodOptional<z.ZodEnum<{
                    queue: "queue";
                    reject: "reject";
                }>>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                expiresAt: z.ZodOptional<z.ZodISODateTime>;
            }, z.core.$strict>, z.ZodObject<{
                type: z.ZodLiteral<"object.state.set">;
                entityId: z.ZodString;
                expectedStateRevision: z.ZodNumber;
                state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("@pixoffice/protocol/schema").JsonValue, unknown, z.core.$ZodTypeInternals<import("@pixoffice/protocol/schema").JsonValue, unknown>>>>;
                protocolVersion: z.ZodLiteral<"2.0">;
                sceneId: z.ZodString;
                commandId: z.ZodString;
                after: z.ZodOptional<z.ZodArray<z.ZodString>>;
                busyPolicy: z.ZodOptional<z.ZodEnum<{
                    queue: "queue";
                    reject: "reject";
                }>>;
                timeoutMs: z.ZodOptional<z.ZodNumber>;
                expiresAt: z.ZodOptional<z.ZodISODateTime>;
            }, z.core.$strict>], "type">>;
        }, z.core.$strict>>;
        limits: {
            maxQueue: number;
            maxHistory: number;
            maxBatch: number;
            maxMessageBytes: number;
        };
        delivery: string;
        extensions: string[];
    };
    submit(value: unknown, context?: {
        stateSource?: string;
    }): CommandResult;
    submitBatch(value: unknown): CommandResult[];
    tick(dtMs: number): void;
    private buildPlan;
    private pump;
    private advance;
    private executeImmediate;
    private editMap;
    setPluginEnabled(id: string, enabled: boolean): void;
    private endActivity;
    private commitCompletion;
    private actor;
    private finish;
    private result;
    private emit;
    private prune;
    checkpoint(): Checkpoint;
    private persist;
    recoverLayout(): void;
    private prepareRestoredCheckpoint;
    private applyRestoredCheckpoint;
    private offerLayoutRecovery;
    private restore;
    dispose(): void;
}
