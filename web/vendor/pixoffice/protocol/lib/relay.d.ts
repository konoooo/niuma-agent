import { z } from 'zod';
export declare const relayPaths: {
    readonly messages: "/api/pixoffice/messages";
    readonly events: "/api/pixoffice/events";
};
export declare const maxRelayMessageBytes = 65536;
export declare const maxRelayEventBytes = 524288;
export declare const maxRelayTeams = 100;
export declare const relayMessageSchema: z.ZodObject<{
    teamId: z.ZodString;
    conversationId: z.ZodOptional<z.ZodString>;
    command: z.ZodUnion<readonly [z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                    anchors: z.ZodOptional<z.ZodIntersection<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>, z.ZodRecord<z.ZodString, z.ZodObject<{
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
                        anchors: z.ZodOptional<z.ZodIntersection<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>, z.ZodRecord<z.ZodString, z.ZodObject<{
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
        params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
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
        state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
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
    }, z.core.$strict>], "type">, z.ZodObject<{
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
                        anchors: z.ZodOptional<z.ZodIntersection<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>, z.ZodRecord<z.ZodString, z.ZodObject<{
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
                            anchors: z.ZodOptional<z.ZodIntersection<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>, z.ZodRecord<z.ZodString, z.ZodObject<{
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
            params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
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
            state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
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
    }, z.core.$strict>]>;
}, z.core.$strict>;
export type RelayMessage = z.infer<typeof relayMessageSchema>;
