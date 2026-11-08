import { z } from 'zod';
export declare const mapPropSchema: z.ZodObject<{
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
export declare const mapDocumentSchema: z.ZodObject<{
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
export declare const mapOperationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>], "op">;
export declare const mapEditSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type MapDocument = z.infer<typeof mapDocumentSchema>;
export type MapOperation = z.infer<typeof mapOperationSchema>;
export type MapEdit = z.infer<typeof mapEditSchema>;
