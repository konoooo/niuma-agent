import { z } from 'zod';
import { officeUiManifest } from './office-ui.ts';
export declare const officeIntegrationPaths: {
    readonly reply: "/api/pixoffice/reply";
    readonly ui: "/api/pixoffice/ui";
    readonly layout: "/api/pixoffice/layout";
};
export declare const officeWorkspaceTopic = "@pixoffice/workspace";
export declare const seqSchema: z.ZodNumber;
export declare const officeConversationSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        insights: z.ZodOptional<z.ZodObject<{
            scope: z.ZodEnum<{
                conversation: "conversation";
                office: "office";
            }>;
            updatedAt: z.ZodISODateTime;
            periods: z.ZodArray<z.ZodObject<{
                id: z.ZodEnum<{
                    last7Days: "last7Days";
                    last30Days: "last30Days";
                }>;
                label: z.ZodString;
                metrics: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    label: z.ZodString;
                    value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                    unit: z.ZodDefault<z.ZodString>;
                    changePercent: z.ZodOptional<z.ZodNumber>;
                    sentiment: z.ZodDefault<z.ZodEnum<{
                        positive: "positive";
                        negative: "negative";
                        neutral: "neutral";
                    }>>;
                }, z.core.$strict>>;
                blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    type: z.ZodLiteral<"trend">;
                    unit: z.ZodDefault<z.ZodString>;
                    points: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        value: z.ZodNumber;
                    }, z.core.$strict>>;
                    id: z.ZodString;
                    title: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"bars">;
                    unit: z.ZodDefault<z.ZodString>;
                    items: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        value: z.ZodNumber;
                    }, z.core.$strict>>;
                    id: z.ZodString;
                    title: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"distribution">;
                    items: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        value: z.ZodNumber;
                    }, z.core.$strict>>;
                    id: z.ZodString;
                    title: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    type: z.ZodLiteral<"activity">;
                    items: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        occurredAt: z.ZodISODateTime;
                        status: z.ZodEnum<{
                            completed: "completed";
                            running: "running";
                            blocked: "blocked";
                            failed: "failed";
                        }>;
                    }, z.core.$strict>>;
                    id: z.ZodString;
                    title: z.ZodString;
                }, z.core.$strict>], "type">>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
        role: z.ZodDefault<z.ZodString>;
        online: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>>>;
    tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<{
            completed: "completed";
            running: "running";
            blocked: "blocked";
            failed: "failed";
            queued: "queued";
        }>;
        updatedAt: z.ZodISODateTime;
        assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        summary: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>>>;
    events: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodEnum<{
            note: "note";
            "task.assigned": "task.assigned";
            "task.started": "task.started";
            "task.blocked": "task.blocked";
            "task.completed": "task.completed";
        }>;
        summary: z.ZodString;
        occurredAt: z.ZodISODateTime;
        taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>>>;
    whiteboard: z.ZodDefault<z.ZodObject<{
        template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
        title: z.ZodDefault<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<{
            completed: "completed";
            running: "running";
            blocked: "blocked";
            failed: "failed";
            queued: "queued";
        }>>;
        tagline: z.ZodDefault<z.ZodString>;
        description: z.ZodDefault<z.ZodString>;
        note: z.ZodDefault<z.ZodString>;
        link: z.ZodDefault<z.ZodObject<{
            label: z.ZodDefault<z.ZodString>;
            url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
        }, z.core.$strict>>;
        steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type OfficeConversation = z.infer<typeof officeConversationSchema>;
export declare const officeSnapshotSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1.0">;
    seq: z.ZodNumber;
    workspace: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>;
    conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            insights: z.ZodOptional<z.ZodObject<{
                scope: z.ZodEnum<{
                    conversation: "conversation";
                    office: "office";
                }>;
                updatedAt: z.ZodISODateTime;
                periods: z.ZodArray<z.ZodObject<{
                    id: z.ZodEnum<{
                        last7Days: "last7Days";
                        last30Days: "last30Days";
                    }>;
                    label: z.ZodString;
                    metrics: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        label: z.ZodString;
                        value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                        unit: z.ZodDefault<z.ZodString>;
                        changePercent: z.ZodOptional<z.ZodNumber>;
                        sentiment: z.ZodDefault<z.ZodEnum<{
                            positive: "positive";
                            negative: "negative";
                            neutral: "neutral";
                        }>>;
                    }, z.core.$strict>>;
                    blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        type: z.ZodLiteral<"trend">;
                        unit: z.ZodDefault<z.ZodString>;
                        points: z.ZodArray<z.ZodObject<{
                            label: z.ZodString;
                            value: z.ZodNumber;
                        }, z.core.$strict>>;
                        id: z.ZodString;
                        title: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"bars">;
                        unit: z.ZodDefault<z.ZodString>;
                        items: z.ZodArray<z.ZodObject<{
                            label: z.ZodString;
                            value: z.ZodNumber;
                        }, z.core.$strict>>;
                        id: z.ZodString;
                        title: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"distribution">;
                        items: z.ZodArray<z.ZodObject<{
                            label: z.ZodString;
                            value: z.ZodNumber;
                        }, z.core.$strict>>;
                        id: z.ZodString;
                        title: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        type: z.ZodLiteral<"activity">;
                        items: z.ZodArray<z.ZodObject<{
                            label: z.ZodString;
                            occurredAt: z.ZodISODateTime;
                            status: z.ZodEnum<{
                                completed: "completed";
                                running: "running";
                                blocked: "blocked";
                                failed: "failed";
                            }>;
                        }, z.core.$strict>>;
                        id: z.ZodString;
                        title: z.ZodString;
                    }, z.core.$strict>], "type">>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
            role: z.ZodDefault<z.ZodString>;
            online: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>>>;
        tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            status: z.ZodEnum<{
                completed: "completed";
                running: "running";
                blocked: "blocked";
                failed: "failed";
                queued: "queued";
            }>;
            updatedAt: z.ZodISODateTime;
            assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            summary: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>>>;
        events: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodEnum<{
                note: "note";
                "task.assigned": "task.assigned";
                "task.started": "task.started";
                "task.blocked": "task.blocked";
                "task.completed": "task.completed";
            }>;
            summary: z.ZodString;
            occurredAt: z.ZodISODateTime;
            taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>>>;
        whiteboard: z.ZodDefault<z.ZodObject<{
            template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
            title: z.ZodDefault<z.ZodString>;
            status: z.ZodDefault<z.ZodEnum<{
                completed: "completed";
                running: "running";
                blocked: "blocked";
                failed: "failed";
                queued: "queued";
            }>>;
            tagline: z.ZodDefault<z.ZodString>;
            description: z.ZodDefault<z.ZodString>;
            note: z.ZodDefault<z.ZodString>;
            link: z.ZodDefault<z.ZodObject<{
                label: z.ZodDefault<z.ZodString>;
                url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
            }, z.core.$strict>>;
            steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>>;
    system: z.ZodDefault<z.ZodObject<{
        cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type OfficeSnapshot = z.infer<typeof officeSnapshotSchema>;
export declare const officeLayoutIdSchema: z.ZodEnum<{
    classic: "classic";
    members: "members";
}>;
export type OfficeLayoutId = z.infer<typeof officeLayoutIdSchema>;
export declare const officeLayoutStateSchema: z.ZodObject<{
    currentLayoutId: z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>;
    revision: z.ZodNumber;
}, z.core.$strict>;
export type OfficeLayoutState = z.infer<typeof officeLayoutStateSchema>;
export declare const defaultOfficeLayout: OfficeLayoutState;
export declare const officeLayoutInfoSchema: z.ZodObject<{
    currentLayoutId: z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>;
    revision: z.ZodNumber;
    layouts: z.ZodArray<z.ZodObject<{
        id: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        name: z.ZodString;
        dataMessageType: z.ZodLiteral<"office.snapshot">;
        dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodString>;
            actions: z.ZodArray<z.ZodString>;
            localControls: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const officeLayoutSetSchema: z.ZodObject<{
    type: z.ZodLiteral<"office.layout.set">;
    layoutId: z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>;
}, z.core.$strict>;
export declare function describeOfficeLayouts(state?: OfficeLayoutState): {
    layouts: ({
        id: "classic";
        name: string;
        dataMessageType: "office.snapshot";
        dataSchema: z.core.ZodStandardJSONSchemaPayload<z.ZodObject<{
            schemaVersion: z.ZodLiteral<"1.0">;
            seq: z.ZodNumber;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>;
            conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    insights: z.ZodOptional<z.ZodObject<{
                        scope: z.ZodEnum<{
                            conversation: "conversation";
                            office: "office";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        periods: z.ZodArray<z.ZodObject<{
                            id: z.ZodEnum<{
                                last7Days: "last7Days";
                                last30Days: "last30Days";
                            }>;
                            label: z.ZodString;
                            metrics: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                label: z.ZodString;
                                value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                unit: z.ZodDefault<z.ZodString>;
                                changePercent: z.ZodOptional<z.ZodNumber>;
                                sentiment: z.ZodDefault<z.ZodEnum<{
                                    positive: "positive";
                                    negative: "negative";
                                    neutral: "neutral";
                                }>>;
                            }, z.core.$strict>>;
                            blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"trend">;
                                unit: z.ZodDefault<z.ZodString>;
                                points: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"bars">;
                                unit: z.ZodDefault<z.ZodString>;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"distribution">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"activity">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    occurredAt: z.ZodISODateTime;
                                    status: z.ZodEnum<{
                                        completed: "completed";
                                        running: "running";
                                        blocked: "blocked";
                                        failed: "failed";
                                    }>;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>], "type">>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                    role: z.ZodDefault<z.ZodString>;
                    online: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strict>>>;
                tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    status: z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    summary: z.ZodDefault<z.ZodString>;
                }, z.core.$strict>>>;
                events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    kind: z.ZodEnum<{
                        note: "note";
                        "task.assigned": "task.assigned";
                        "task.started": "task.started";
                        "task.blocked": "task.blocked";
                        "task.completed": "task.completed";
                    }>;
                    summary: z.ZodString;
                    occurredAt: z.ZodISODateTime;
                    taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>>>;
                whiteboard: z.ZodDefault<z.ZodObject<{
                    template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                    title: z.ZodDefault<z.ZodString>;
                    status: z.ZodDefault<z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>>;
                    tagline: z.ZodDefault<z.ZodString>;
                    description: z.ZodDefault<z.ZodString>;
                    note: z.ZodDefault<z.ZodString>;
                    link: z.ZodDefault<z.ZodObject<{
                        label: z.ZodDefault<z.ZodString>;
                        url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                    }, z.core.$strict>>;
                    steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    }, z.core.$strict>>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            system: z.ZodDefault<z.ZodObject<{
                cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        ui: {
            slots: ("whiteboard" | "dialog" | "computer.task" | "actor.insights" | "decision")[];
            actions: ("actor.inspect" | "employee.inspect" | "task.start" | "task.block" | "task.complete" | "task.assign" | "dialog.action" | "conversation.delete")[];
            localControls: string[];
        };
    } | {
        id: "members";
        name: string;
        dataMessageType: "office.snapshot";
        dataSchema: z.core.ZodStandardJSONSchemaPayload<z.ZodObject<{
            schemaVersion: z.ZodLiteral<"1.0">;
            seq: z.ZodNumber;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>;
            conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    insights: z.ZodOptional<z.ZodObject<{
                        scope: z.ZodEnum<{
                            conversation: "conversation";
                            office: "office";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        periods: z.ZodArray<z.ZodObject<{
                            id: z.ZodEnum<{
                                last7Days: "last7Days";
                                last30Days: "last30Days";
                            }>;
                            label: z.ZodString;
                            metrics: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                label: z.ZodString;
                                value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                unit: z.ZodDefault<z.ZodString>;
                                changePercent: z.ZodOptional<z.ZodNumber>;
                                sentiment: z.ZodDefault<z.ZodEnum<{
                                    positive: "positive";
                                    negative: "negative";
                                    neutral: "neutral";
                                }>>;
                            }, z.core.$strict>>;
                            blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"trend">;
                                unit: z.ZodDefault<z.ZodString>;
                                points: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"bars">;
                                unit: z.ZodDefault<z.ZodString>;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"distribution">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"activity">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    occurredAt: z.ZodISODateTime;
                                    status: z.ZodEnum<{
                                        completed: "completed";
                                        running: "running";
                                        blocked: "blocked";
                                        failed: "failed";
                                    }>;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>], "type">>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                    role: z.ZodDefault<z.ZodString>;
                    online: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strict>>>;
                tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    status: z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    summary: z.ZodDefault<z.ZodString>;
                }, z.core.$strict>>>;
                events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    kind: z.ZodEnum<{
                        note: "note";
                        "task.assigned": "task.assigned";
                        "task.started": "task.started";
                        "task.blocked": "task.blocked";
                        "task.completed": "task.completed";
                    }>;
                    summary: z.ZodString;
                    occurredAt: z.ZodISODateTime;
                    taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>>>;
                whiteboard: z.ZodDefault<z.ZodObject<{
                    template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                    title: z.ZodDefault<z.ZodString>;
                    status: z.ZodDefault<z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>>;
                    tagline: z.ZodDefault<z.ZodString>;
                    description: z.ZodDefault<z.ZodString>;
                    note: z.ZodDefault<z.ZodString>;
                    link: z.ZodDefault<z.ZodObject<{
                        label: z.ZodDefault<z.ZodString>;
                        url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                    }, z.core.$strict>>;
                    steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    }, z.core.$strict>>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            system: z.ZodDefault<z.ZodObject<{
                cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        ui: {
            slots: ("whiteboard" | "dialog" | "computer.task" | "decision")[];
            actions: ("employee.inspect" | "task.start" | "task.block" | "task.complete" | "task.assign" | "dialog.action" | "conversation.delete")[];
            localControls: string[];
        };
    })[];
    currentLayoutId: "classic" | "members";
    revision: number;
};
export declare const officeLayoutSyncSchema: z.ZodObject<{
    type: z.ZodLiteral<"office.layout.sync">;
    layout: z.ZodObject<{
        currentLayoutId: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const officeChatUpdatedSchema: z.ZodObject<{
    type: z.ZodLiteral<"chat.updated">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>;
export declare const officeChatUpdatedResultSchema: z.ZodObject<{
    teamId: z.ZodString;
    conversationId: z.ZodString;
    forwarded: z.ZodNumber;
}, z.core.$strict>;
export declare const officeReasonSchema: z.ZodEnum<{
    INVALID_MESSAGE: "INVALID_MESSAGE";
    INVALID_REPLY: "INVALID_REPLY";
    OFFICE_NOT_INITIALIZED: "OFFICE_NOT_INITIALIZED";
    ACTOR_NOT_FOUND: "ACTOR_NOT_FOUND";
    INVALID_BINDING: "INVALID_BINDING";
    OFFICE_LIMIT: "OFFICE_LIMIT";
    CACHE_FULL: "CACHE_FULL";
    STALE_SEQ: "STALE_SEQ";
    DUPLICATE_SEQ: "DUPLICATE_SEQ";
    SEQ_CONFLICT: "SEQ_CONFLICT";
    REQUEST_TIMEOUT: "REQUEST_TIMEOUT";
    NO_RECEIVER: "NO_RECEIVER";
    RECEIVER_UNAVAILABLE: "RECEIVER_UNAVAILABLE";
    BUSINESS_QUEUE_FULL: "BUSINESS_QUEUE_FULL";
    DECISION_DUPLICATE: "DECISION_DUPLICATE";
    DECISION_EXPIRED: "DECISION_EXPIRED";
    DECISION_QUEUE_FULL: "DECISION_QUEUE_FULL";
    SERVER_CLOSING: "SERVER_CLOSING";
    CALLER_DISCONNECTED: "CALLER_DISCONNECTED";
    SCENE_SYNC_FAILED: "SCENE_SYNC_FAILED";
    BUSINESS_ERROR: "BUSINESS_ERROR";
    UI_REQUEST_EXPIRED: "UI_REQUEST_EXPIRED";
    UI_QUEUE_FULL: "UI_QUEUE_FULL";
    UI_WAIT_BUSY: "UI_WAIT_BUSY";
    UNSUPPORTED_UI_ACTION: "UNSUPPORTED_UI_ACTION";
    SNAPSHOT_REQUIRED: "SNAPSHOT_REQUIRED";
    AUTH_FAILED: "AUTH_FAILED";
    FORBIDDEN: "FORBIDDEN";
    NOT_FOUND: "NOT_FOUND";
    MESSAGE_TOO_LARGE: "MESSAGE_TOO_LARGE";
    INTERNAL_ERROR: "INTERNAL_ERROR";
    REQUEST_CLOSED: "REQUEST_CLOSED";
    CHAT_NOT_CONFIGURED: "CHAT_NOT_CONFIGURED";
    CHAT_UPSTREAM_ERROR: "CHAT_UPSTREAM_ERROR";
    CHAT_TIMEOUT: "CHAT_TIMEOUT";
    CONVERSATION_NOT_FOUND: "CONVERSATION_NOT_FOUND";
    LAYOUT_CONFLICT: "LAYOUT_CONFLICT";
}>;
export declare const officeErrorResultSchema: z.ZodObject<{
    reasonCode: z.ZodEnum<{
        INVALID_MESSAGE: "INVALID_MESSAGE";
        INVALID_REPLY: "INVALID_REPLY";
        OFFICE_NOT_INITIALIZED: "OFFICE_NOT_INITIALIZED";
        ACTOR_NOT_FOUND: "ACTOR_NOT_FOUND";
        INVALID_BINDING: "INVALID_BINDING";
        OFFICE_LIMIT: "OFFICE_LIMIT";
        CACHE_FULL: "CACHE_FULL";
        STALE_SEQ: "STALE_SEQ";
        DUPLICATE_SEQ: "DUPLICATE_SEQ";
        SEQ_CONFLICT: "SEQ_CONFLICT";
        REQUEST_TIMEOUT: "REQUEST_TIMEOUT";
        NO_RECEIVER: "NO_RECEIVER";
        RECEIVER_UNAVAILABLE: "RECEIVER_UNAVAILABLE";
        BUSINESS_QUEUE_FULL: "BUSINESS_QUEUE_FULL";
        DECISION_DUPLICATE: "DECISION_DUPLICATE";
        DECISION_EXPIRED: "DECISION_EXPIRED";
        DECISION_QUEUE_FULL: "DECISION_QUEUE_FULL";
        SERVER_CLOSING: "SERVER_CLOSING";
        CALLER_DISCONNECTED: "CALLER_DISCONNECTED";
        SCENE_SYNC_FAILED: "SCENE_SYNC_FAILED";
        BUSINESS_ERROR: "BUSINESS_ERROR";
        UI_REQUEST_EXPIRED: "UI_REQUEST_EXPIRED";
        UI_QUEUE_FULL: "UI_QUEUE_FULL";
        UI_WAIT_BUSY: "UI_WAIT_BUSY";
        UNSUPPORTED_UI_ACTION: "UNSUPPORTED_UI_ACTION";
        SNAPSHOT_REQUIRED: "SNAPSHOT_REQUIRED";
        AUTH_FAILED: "AUTH_FAILED";
        FORBIDDEN: "FORBIDDEN";
        NOT_FOUND: "NOT_FOUND";
        MESSAGE_TOO_LARGE: "MESSAGE_TOO_LARGE";
        INTERNAL_ERROR: "INTERNAL_ERROR";
        REQUEST_CLOSED: "REQUEST_CLOSED";
        CHAT_NOT_CONFIGURED: "CHAT_NOT_CONFIGURED";
        CHAT_UPSTREAM_ERROR: "CHAT_UPSTREAM_ERROR";
        CHAT_TIMEOUT: "CHAT_TIMEOUT";
        CONVERSATION_NOT_FOUND: "CONVERSATION_NOT_FOUND";
        LAYOUT_CONFLICT: "LAYOUT_CONFLICT";
    }>;
    details: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>;
    issues: z.ZodDefault<z.ZodArray<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>>;
}, z.core.$strict>;
export declare const participantRulesSchema: z.ZodObject<{
    min: z.ZodNumber;
    max: z.ZodNumber;
    roles: z.ZodArray<z.ZodObject<{
        role: z.ZodString;
        min: z.ZodNumber;
        max: z.ZodNumber;
    }, z.core.$strict>>;
    rules: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export declare const officeSceneSchema: z.ZodObject<{
    protocolVersion: z.ZodLiteral<"2.0">;
    sceneId: z.ZodString;
    command: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
    batch: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
    actors: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        templateId: z.ZodString;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>;
        presentation: z.ZodObject<{
            status: z.ZodEnum<{
                thinking: "thinking";
                idle: "idle";
                working: "working";
            }>;
            title: z.ZodString;
            sourceRevision: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    objects: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        templateId: z.ZodString;
        state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        stateRevision: z.ZodNumber;
        stateSchema: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>;
        interactions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            requiresHome: z.ZodBoolean;
            actorIds: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    capabilities: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        participants: z.ZodDefault<z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
            roles: z.ZodArray<z.ZodObject<{
                role: z.ZodString;
                min: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>>;
            rules: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const officeRuntimeStateSchema: z.ZodObject<{
    available: z.ZodBoolean;
    selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
    actors: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        templateId: z.ZodString;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>;
        presentation: z.ZodObject<{
            status: z.ZodEnum<{
                thinking: "thinking";
                idle: "idle";
                working: "working";
            }>;
            title: z.ZodString;
            sourceRevision: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    objects: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        templateId: z.ZodString;
        stateRevision: z.ZodNumber;
        interactions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            requiresHome: z.ZodBoolean;
            actorIds: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    pendingDecisions: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export declare const unavailableOfficeRuntime: () => {
    available: boolean;
    selectedConversationId: string;
    actors: never[];
    objects: never[];
    pendingDecisions: never[];
};
export declare function describeOfficeRuntime(scene: z.infer<typeof officeSceneSchema>, selectedConversationId: string, pendingDecisions: string[]): {
    available: boolean;
    selectedConversationId: string;
    actors: {
        id: string;
        name: string;
        templateId: string;
        position: {
            x: number;
            y: number;
        };
        presentation: {
            status: "thinking" | "idle" | "working";
            title: string;
            sourceRevision: number;
        };
    }[];
    objects: {
        id: string;
        name: string;
        state: Record<string, import("./schema.ts").JsonValue>;
        templateId: string;
        stateRevision: number;
        interactions: {
            id: string;
            name: string;
            requiresHome: boolean;
            actorIds: string[];
        }[];
    }[];
    pendingDecisions: string[];
};
export declare const officeReadResultSchema: z.ZodObject<{
    snapshot: z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1.0">;
        seq: z.ZodNumber;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>;
        conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                insights: z.ZodOptional<z.ZodObject<{
                    scope: z.ZodEnum<{
                        conversation: "conversation";
                        office: "office";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    periods: z.ZodArray<z.ZodObject<{
                        id: z.ZodEnum<{
                            last7Days: "last7Days";
                            last30Days: "last30Days";
                        }>;
                        label: z.ZodString;
                        metrics: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            label: z.ZodString;
                            value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                            unit: z.ZodDefault<z.ZodString>;
                            changePercent: z.ZodOptional<z.ZodNumber>;
                            sentiment: z.ZodDefault<z.ZodEnum<{
                                positive: "positive";
                                negative: "negative";
                                neutral: "neutral";
                            }>>;
                        }, z.core.$strict>>;
                        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"trend">;
                            unit: z.ZodDefault<z.ZodString>;
                            points: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"bars">;
                            unit: z.ZodDefault<z.ZodString>;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"distribution">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"activity">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                occurredAt: z.ZodISODateTime;
                                status: z.ZodEnum<{
                                    completed: "completed";
                                    running: "running";
                                    blocked: "blocked";
                                    failed: "failed";
                                }>;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                role: z.ZodDefault<z.ZodString>;
                online: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>>>;
            tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>;
                updatedAt: z.ZodISODateTime;
                assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                summary: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    note: "note";
                    "task.assigned": "task.assigned";
                    "task.started": "task.started";
                    "task.blocked": "task.blocked";
                    "task.completed": "task.completed";
                }>;
                summary: z.ZodString;
                occurredAt: z.ZodISODateTime;
                taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>>>;
            whiteboard: z.ZodDefault<z.ZodObject<{
                template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                title: z.ZodDefault<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>>;
                tagline: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
                note: z.ZodDefault<z.ZodString>;
                link: z.ZodDefault<z.ZodObject<{
                    label: z.ZodDefault<z.ZodString>;
                    url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                }, z.core.$strict>>;
                steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        system: z.ZodDefault<z.ZodObject<{
            cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    runtime: z.ZodObject<{
        available: z.ZodBoolean;
        selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
        actors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            presentation: z.ZodObject<{
                status: z.ZodEnum<{
                    thinking: "thinking";
                    idle: "idle";
                    working: "working";
                }>;
                title: z.ZodString;
                sourceRevision: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        objects: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            templateId: z.ZodString;
            stateRevision: z.ZodNumber;
            interactions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                requiresHome: z.ZodBoolean;
                actorIds: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        pendingDecisions: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const officeRuntimeReceiptSchema: z.ZodObject<{
    id: z.ZodString;
    seq: z.ZodNumber;
    runtime: z.ZodObject<{
        available: z.ZodBoolean;
        selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
        actors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            presentation: z.ZodObject<{
                status: z.ZodEnum<{
                    thinking: "thinking";
                    idle: "idle";
                    working: "working";
                }>;
                title: z.ZodString;
                sourceRevision: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        objects: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            templateId: z.ZodString;
            stateRevision: z.ZodNumber;
            interactions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                requiresHome: z.ZodBoolean;
                actorIds: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        pendingDecisions: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const officeWorkspaceReceiptSchema: z.ZodObject<{
    offices: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        seq: z.ZodNumber;
        runtime: z.ZodObject<{
            available: z.ZodBoolean;
            selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
            actors: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                templateId: z.ZodString;
                position: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                presentation: z.ZodObject<{
                    status: z.ZodEnum<{
                        thinking: "thinking";
                        idle: "idle";
                        working: "working";
                    }>;
                    title: z.ZodString;
                    sourceRevision: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            objects: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                templateId: z.ZodString;
                stateRevision: z.ZodNumber;
                interactions: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    requiresHome: z.ZodBoolean;
                    actorIds: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            pendingDecisions: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const officeSnapshotResultSchema: z.ZodObject<{
    teamId: z.ZodString;
    seq: z.ZodNumber;
    status: z.ZodEnum<{
        applied: "applied";
        cached: "cached";
        ignored: "ignored";
    }>;
    reasonCode: z.ZodOptional<z.ZodEnum<{
        STALE_SEQ: "STALE_SEQ";
        DUPLICATE_SEQ: "DUPLICATE_SEQ";
    }>>;
}, z.core.$strict>;
export declare const officeDecisionResultSchema: z.ZodObject<{
    teamId: z.ZodString;
    conversationId: z.ZodString;
    decisionId: z.ZodString;
    choiceId: z.ZodString;
    label: z.ZodString;
}, z.core.$strict>;
export declare const officeCapabilitiesResultSchema: z.ZodObject<{
    layouts: z.ZodArray<z.ZodObject<{
        id: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        name: z.ZodString;
        dataMessageType: z.ZodLiteral<"office.snapshot">;
        dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodString>;
            actions: z.ZodArray<z.ZodString>;
            localControls: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    scene: z.ZodObject<{
        protocolVersion: z.ZodLiteral<"2.0">;
        command: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        batch: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        capabilities: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            participants: z.ZodDefault<z.ZodObject<{
                min: z.ZodNumber;
                max: z.ZodNumber;
                roles: z.ZodArray<z.ZodObject<{
                    role: z.ZodString;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                }, z.core.$strict>>;
                rules: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        actors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
        }, z.core.$strict>>;
        objects: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
            stateSchema: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>;
            interactions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                requiresHome: z.ZodBoolean;
                actorIds: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    ui: z.ZodObject<{
        slots: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            persistent: z.ZodBoolean;
            update: z.ZodString;
        }, z.core.$strict>>;
        actions: z.ZodArray<z.ZodString>;
        actionSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        presentationSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        whiteboardSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
    }, z.core.$strict>;
    chat: z.ZodObject<{
        version: z.ZodLiteral<"1.0">;
        browserPath: z.ZodLiteral<"/api/pixoffice/chat">;
        method: z.ZodLiteral<"POST">;
        upstream: z.ZodObject<{
            configuredBy: z.ZodLiteral<"offices.initialize.chat.url">;
            direction: z.ZodLiteral<"pixoffice-server-to-chat-service">;
        }, z.core.$strict>;
        identity: z.ZodArray<z.ZodString>;
        requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        operations: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                send: "send";
                history: "history";
                resume: "resume";
                cancel: "cancel";
            }>;
            requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            responseContentType: z.ZodEnum<{
                "application/json": "application/json";
                "application/x-ndjson": "application/x-ndjson";
            }>;
            responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            timeoutMs: z.ZodNumber;
        }, z.core.$strict>>;
        stream: z.ZodObject<{
            eventSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            resumeFirstEvents: z.ZodArray<z.ZodString>;
            terminalEvents: z.ZodArray<z.ZodString>;
            terminalSnapshotStates: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        limits: z.ZodObject<{
            requestBytes: z.ZodNumber;
            historyResponseBytes: z.ZodNumber;
            replyCharacters: z.ZodNumber;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    supportedMessages: z.ZodArray<z.ZodString>;
    http: z.ZodObject<{
        path: z.ZodLiteral<"/api/pixoffice/messages">;
        method: z.ZodLiteral<"POST">;
        authentication: z.ZodLiteral<"bearer">;
        requestBytes: z.ZodNumber;
        businessTimeoutMs: z.ZodNumber;
    }, z.core.$strict>;
    animation: z.ZodObject<{
        requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        delivery: z.ZodLiteral<"best-effort">;
        completionAcknowledged: z.ZodLiteral<false>;
    }, z.core.$strict>;
    requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
    responses: z.ZodObject<{
        envelope: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        success: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        error: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        operations: z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            scope: z.ZodEnum<{
                office: "office";
                workspace: "workspace";
                operation: "operation";
            }>;
            codes: z.ZodArray<z.ZodNumber>;
            dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    rules: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export declare const officeWorkspaceStateSchema: z.ZodObject<{
    layout: z.ZodObject<{
        currentLayoutId: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
    chat: z.ZodObject<{
        configured: z.ZodBoolean;
    }, z.core.$strict>;
    offices: z.ZodArray<z.ZodObject<{
        snapshot: z.ZodObject<{
            schemaVersion: z.ZodLiteral<"1.0">;
            seq: z.ZodNumber;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>;
            conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    insights: z.ZodOptional<z.ZodObject<{
                        scope: z.ZodEnum<{
                            conversation: "conversation";
                            office: "office";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        periods: z.ZodArray<z.ZodObject<{
                            id: z.ZodEnum<{
                                last7Days: "last7Days";
                                last30Days: "last30Days";
                            }>;
                            label: z.ZodString;
                            metrics: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                label: z.ZodString;
                                value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                unit: z.ZodDefault<z.ZodString>;
                                changePercent: z.ZodOptional<z.ZodNumber>;
                                sentiment: z.ZodDefault<z.ZodEnum<{
                                    positive: "positive";
                                    negative: "negative";
                                    neutral: "neutral";
                                }>>;
                            }, z.core.$strict>>;
                            blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"trend">;
                                unit: z.ZodDefault<z.ZodString>;
                                points: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"bars">;
                                unit: z.ZodDefault<z.ZodString>;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"distribution">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"activity">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    occurredAt: z.ZodISODateTime;
                                    status: z.ZodEnum<{
                                        completed: "completed";
                                        running: "running";
                                        blocked: "blocked";
                                        failed: "failed";
                                    }>;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>], "type">>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                    role: z.ZodDefault<z.ZodString>;
                    online: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strict>>>;
                tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    status: z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    summary: z.ZodDefault<z.ZodString>;
                }, z.core.$strict>>>;
                events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    kind: z.ZodEnum<{
                        note: "note";
                        "task.assigned": "task.assigned";
                        "task.started": "task.started";
                        "task.blocked": "task.blocked";
                        "task.completed": "task.completed";
                    }>;
                    summary: z.ZodString;
                    occurredAt: z.ZodISODateTime;
                    taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>>>;
                whiteboard: z.ZodDefault<z.ZodObject<{
                    template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                    title: z.ZodDefault<z.ZodString>;
                    status: z.ZodDefault<z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>>;
                    tagline: z.ZodDefault<z.ZodString>;
                    description: z.ZodDefault<z.ZodString>;
                    note: z.ZodDefault<z.ZodString>;
                    link: z.ZodDefault<z.ZodObject<{
                        label: z.ZodDefault<z.ZodString>;
                        url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                    }, z.core.$strict>>;
                    steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    }, z.core.$strict>>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            system: z.ZodDefault<z.ZodObject<{
                cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        runtime: z.ZodObject<{
            available: z.ZodBoolean;
            selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
            actors: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                templateId: z.ZodString;
                position: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                presentation: z.ZodObject<{
                    status: z.ZodEnum<{
                        thinking: "thinking";
                        idle: "idle";
                        working: "working";
                    }>;
                    title: z.ZodString;
                    sourceRevision: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            objects: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                templateId: z.ZodString;
                stateRevision: z.ZodNumber;
                interactions: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    requiresHome: z.ZodBoolean;
                    actorIds: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            pendingDecisions: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const officeWorkspaceResultSchema: z.ZodObject<{
    capabilities: z.ZodObject<{
        layouts: z.ZodArray<z.ZodObject<{
            id: z.ZodEnum<{
                classic: "classic";
                members: "members";
            }>;
            name: z.ZodString;
            dataMessageType: z.ZodLiteral<"office.snapshot">;
            dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            ui: z.ZodObject<{
                slots: z.ZodArray<z.ZodString>;
                actions: z.ZodArray<z.ZodString>;
                localControls: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        scene: z.ZodObject<{
            protocolVersion: z.ZodLiteral<"2.0">;
            command: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            batch: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            capabilities: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                participants: z.ZodDefault<z.ZodObject<{
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    roles: z.ZodArray<z.ZodObject<{
                        role: z.ZodString;
                        min: z.ZodNumber;
                        max: z.ZodNumber;
                    }, z.core.$strict>>;
                    rules: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            actors: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                templateId: z.ZodString;
            }, z.core.$strict>>;
            objects: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                templateId: z.ZodString;
                stateSchema: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>;
                interactions: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    requiresHome: z.ZodBoolean;
                    actorIds: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                content: z.ZodString;
                persistent: z.ZodBoolean;
                update: z.ZodString;
            }, z.core.$strict>>;
            actions: z.ZodArray<z.ZodString>;
            actionSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            presentationSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            whiteboardSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        }, z.core.$strict>;
        chat: z.ZodObject<{
            version: z.ZodLiteral<"1.0">;
            browserPath: z.ZodLiteral<"/api/pixoffice/chat">;
            method: z.ZodLiteral<"POST">;
            upstream: z.ZodObject<{
                configuredBy: z.ZodLiteral<"offices.initialize.chat.url">;
                direction: z.ZodLiteral<"pixoffice-server-to-chat-service">;
            }, z.core.$strict>;
            identity: z.ZodArray<z.ZodString>;
            requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            operations: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    send: "send";
                    history: "history";
                    resume: "resume";
                    cancel: "cancel";
                }>;
                requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                responseContentType: z.ZodEnum<{
                    "application/json": "application/json";
                    "application/x-ndjson": "application/x-ndjson";
                }>;
                responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                timeoutMs: z.ZodNumber;
            }, z.core.$strict>>;
            stream: z.ZodObject<{
                eventSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                resumeFirstEvents: z.ZodArray<z.ZodString>;
                terminalEvents: z.ZodArray<z.ZodString>;
                terminalSnapshotStates: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            limits: z.ZodObject<{
                requestBytes: z.ZodNumber;
                historyResponseBytes: z.ZodNumber;
                replyCharacters: z.ZodNumber;
            }, z.core.$strict>;
            rules: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        supportedMessages: z.ZodArray<z.ZodString>;
        http: z.ZodObject<{
            path: z.ZodLiteral<"/api/pixoffice/messages">;
            method: z.ZodLiteral<"POST">;
            authentication: z.ZodLiteral<"bearer">;
            requestBytes: z.ZodNumber;
            businessTimeoutMs: z.ZodNumber;
        }, z.core.$strict>;
        animation: z.ZodObject<{
            requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            delivery: z.ZodLiteral<"best-effort">;
            completionAcknowledged: z.ZodLiteral<false>;
        }, z.core.$strict>;
        requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        responses: z.ZodObject<{
            envelope: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            success: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            error: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            operations: z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                scope: z.ZodEnum<{
                    office: "office";
                    workspace: "workspace";
                    operation: "operation";
                }>;
                codes: z.ZodArray<z.ZodNumber>;
                dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    state: z.ZodObject<{
        layout: z.ZodObject<{
            currentLayoutId: z.ZodEnum<{
                classic: "classic";
                members: "members";
            }>;
            revision: z.ZodNumber;
        }, z.core.$strict>;
        chat: z.ZodObject<{
            configured: z.ZodBoolean;
        }, z.core.$strict>;
        offices: z.ZodArray<z.ZodObject<{
            snapshot: z.ZodObject<{
                schemaVersion: z.ZodLiteral<"1.0">;
                seq: z.ZodNumber;
                workspace: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                }, z.core.$strict>;
                conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        insights: z.ZodOptional<z.ZodObject<{
                            scope: z.ZodEnum<{
                                conversation: "conversation";
                                office: "office";
                            }>;
                            updatedAt: z.ZodISODateTime;
                            periods: z.ZodArray<z.ZodObject<{
                                id: z.ZodEnum<{
                                    last7Days: "last7Days";
                                    last30Days: "last30Days";
                                }>;
                                label: z.ZodString;
                                metrics: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    label: z.ZodString;
                                    value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                    unit: z.ZodDefault<z.ZodString>;
                                    changePercent: z.ZodOptional<z.ZodNumber>;
                                    sentiment: z.ZodDefault<z.ZodEnum<{
                                        positive: "positive";
                                        negative: "negative";
                                        neutral: "neutral";
                                    }>>;
                                }, z.core.$strict>>;
                                blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    type: z.ZodLiteral<"trend">;
                                    unit: z.ZodDefault<z.ZodString>;
                                    points: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"bars">;
                                    unit: z.ZodDefault<z.ZodString>;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"distribution">;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"activity">;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        occurredAt: z.ZodISODateTime;
                                        status: z.ZodEnum<{
                                            completed: "completed";
                                            running: "running";
                                            blocked: "blocked";
                                            failed: "failed";
                                        }>;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>], "type">>;
                            }, z.core.$strict>>;
                        }, z.core.$strict>>;
                        sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                        role: z.ZodDefault<z.ZodString>;
                        online: z.ZodDefault<z.ZodBoolean>;
                    }, z.core.$strict>>>;
                    tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodEnum<{
                            completed: "completed";
                            running: "running";
                            blocked: "blocked";
                            failed: "failed";
                            queued: "queued";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                        summary: z.ZodDefault<z.ZodString>;
                    }, z.core.$strict>>>;
                    events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        kind: z.ZodEnum<{
                            note: "note";
                            "task.assigned": "task.assigned";
                            "task.started": "task.started";
                            "task.blocked": "task.blocked";
                            "task.completed": "task.completed";
                        }>;
                        summary: z.ZodString;
                        occurredAt: z.ZodISODateTime;
                        taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    }, z.core.$strict>>>;
                    whiteboard: z.ZodDefault<z.ZodObject<{
                        template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                        title: z.ZodDefault<z.ZodString>;
                        status: z.ZodDefault<z.ZodEnum<{
                            completed: "completed";
                            running: "running";
                            blocked: "blocked";
                            failed: "failed";
                            queued: "queued";
                        }>>;
                        tagline: z.ZodDefault<z.ZodString>;
                        description: z.ZodDefault<z.ZodString>;
                        note: z.ZodDefault<z.ZodString>;
                        link: z.ZodDefault<z.ZodObject<{
                            label: z.ZodDefault<z.ZodString>;
                            url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                        }, z.core.$strict>>;
                        steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            title: z.ZodString;
                            progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>>;
                system: z.ZodDefault<z.ZodObject<{
                    cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            runtime: z.ZodObject<{
                available: z.ZodBoolean;
                selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
                actors: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    templateId: z.ZodString;
                    position: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    presentation: z.ZodObject<{
                        status: z.ZodEnum<{
                            thinking: "thinking";
                            idle: "idle";
                            working: "working";
                        }>;
                        title: z.ZodString;
                        sourceRevision: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
                objects: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                    templateId: z.ZodString;
                    stateRevision: z.ZodNumber;
                    interactions: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        requiresHome: z.ZodBoolean;
                        actorIds: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                pendingDecisions: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const officeSupportedMessages: readonly ["offices.initialize", "office.snapshot", "office.read", "office.capabilities", "office.layout.read", "office.layout.set", "chat.updated", "decision.request", "ui.next", "ui.respond"];
export { officeUiManifest };
export declare const officeUiActionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"conversation.delete">;
    id: z.ZodString;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"actor.inspect">;
    actorId: z.ZodString;
    id: z.ZodString;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"employee.inspect">;
    employeeId: z.ZodString;
    id: z.ZodString;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>, ...z.ZodObject<{
    action: z.ZodLiteral<"task.start" | "task.block" | "task.complete">;
    taskId: z.ZodString;
    id: z.ZodString;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>[], z.ZodObject<{
    action: z.ZodLiteral<"task.assign">;
    taskId: z.ZodString;
    assigneeId: z.ZodString;
    id: z.ZodString;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"dialog.action">;
    interactionId: z.ZodString;
    optionId: z.ZodString;
    id: z.ZodString;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>], "action">;
export type OfficeUiAction = z.infer<typeof officeUiActionSchema>;
export declare const officeDialogSchema: z.ZodObject<{
    template: z.ZodLiteral<"detail-v1">;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodString;
    }, z.core.$strict>>>;
    actions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export declare const officeUiPresentationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    target: z.ZodLiteral<"result">;
    success: z.ZodBoolean;
    message: z.ZodDefault<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    target: z.ZodLiteral<"dialog">;
    content: z.ZodObject<{
        template: z.ZodLiteral<"detail-v1">;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
        fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, z.core.$strict>>>;
        actions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    target: z.ZodLiteral<"whiteboard">;
    snapshot: z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1.0">;
        seq: z.ZodNumber;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>;
        conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                insights: z.ZodOptional<z.ZodObject<{
                    scope: z.ZodEnum<{
                        conversation: "conversation";
                        office: "office";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    periods: z.ZodArray<z.ZodObject<{
                        id: z.ZodEnum<{
                            last7Days: "last7Days";
                            last30Days: "last30Days";
                        }>;
                        label: z.ZodString;
                        metrics: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            label: z.ZodString;
                            value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                            unit: z.ZodDefault<z.ZodString>;
                            changePercent: z.ZodOptional<z.ZodNumber>;
                            sentiment: z.ZodDefault<z.ZodEnum<{
                                positive: "positive";
                                negative: "negative";
                                neutral: "neutral";
                            }>>;
                        }, z.core.$strict>>;
                        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"trend">;
                            unit: z.ZodDefault<z.ZodString>;
                            points: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"bars">;
                            unit: z.ZodDefault<z.ZodString>;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"distribution">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"activity">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                occurredAt: z.ZodISODateTime;
                                status: z.ZodEnum<{
                                    completed: "completed";
                                    running: "running";
                                    blocked: "blocked";
                                    failed: "failed";
                                }>;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                role: z.ZodDefault<z.ZodString>;
                online: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>>>;
            tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>;
                updatedAt: z.ZodISODateTime;
                assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                summary: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    note: "note";
                    "task.assigned": "task.assigned";
                    "task.started": "task.started";
                    "task.blocked": "task.blocked";
                    "task.completed": "task.completed";
                }>;
                summary: z.ZodString;
                occurredAt: z.ZodISODateTime;
                taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>>>;
            whiteboard: z.ZodDefault<z.ZodObject<{
                template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                title: z.ZodDefault<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>>;
                tagline: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
                note: z.ZodDefault<z.ZodString>;
                link: z.ZodDefault<z.ZodObject<{
                    label: z.ZodDefault<z.ZodString>;
                    url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                }, z.core.$strict>>;
                steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        system: z.ZodDefault<z.ZodObject<{
            cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>], "target">;
export type OfficeUiPresentation = z.infer<typeof officeUiPresentationSchema>;
export declare const officeUiNextResultSchema: z.ZodObject<{
    actions: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        action: z.ZodLiteral<"conversation.delete">;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"actor.inspect">;
        actorId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"employee.inspect">;
        employeeId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, ...z.ZodObject<{
        action: z.ZodLiteral<"task.start" | "task.block" | "task.complete">;
        taskId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>[], z.ZodObject<{
        action: z.ZodLiteral<"task.assign">;
        taskId: z.ZodString;
        assigneeId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"dialog.action">;
        interactionId: z.ZodString;
        optionId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>], "action">>;
}, z.core.$strict>;
export declare const officeUiRespondResultSchema: z.ZodObject<{
    interactionId: z.ZodString;
    delivered: z.ZodLiteral<true>;
}, z.core.$strict>;
export declare function describeOfficeUi(): {
    actionSchema: z.core.ZodStandardJSONSchemaPayload<z.ZodDiscriminatedUnion<[z.ZodObject<{
        action: z.ZodLiteral<"conversation.delete">;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"actor.inspect">;
        actorId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"employee.inspect">;
        employeeId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, ...z.ZodObject<{
        action: z.ZodLiteral<"task.start" | "task.block" | "task.complete">;
        taskId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>[], z.ZodObject<{
        action: z.ZodLiteral<"task.assign">;
        taskId: z.ZodString;
        assigneeId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"dialog.action">;
        interactionId: z.ZodString;
        optionId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>], "action">>;
    presentationSchema: z.core.ZodStandardJSONSchemaPayload<z.ZodDiscriminatedUnion<[z.ZodObject<{
        target: z.ZodLiteral<"result">;
        success: z.ZodBoolean;
        message: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        target: z.ZodLiteral<"dialog">;
        content: z.ZodObject<{
            template: z.ZodLiteral<"detail-v1">;
            title: z.ZodString;
            description: z.ZodDefault<z.ZodString>;
            fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, z.core.$strict>>>;
            actions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        target: z.ZodLiteral<"whiteboard">;
        snapshot: z.ZodObject<{
            schemaVersion: z.ZodLiteral<"1.0">;
            seq: z.ZodNumber;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>;
            conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    insights: z.ZodOptional<z.ZodObject<{
                        scope: z.ZodEnum<{
                            conversation: "conversation";
                            office: "office";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        periods: z.ZodArray<z.ZodObject<{
                            id: z.ZodEnum<{
                                last7Days: "last7Days";
                                last30Days: "last30Days";
                            }>;
                            label: z.ZodString;
                            metrics: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                label: z.ZodString;
                                value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                unit: z.ZodDefault<z.ZodString>;
                                changePercent: z.ZodOptional<z.ZodNumber>;
                                sentiment: z.ZodDefault<z.ZodEnum<{
                                    positive: "positive";
                                    negative: "negative";
                                    neutral: "neutral";
                                }>>;
                            }, z.core.$strict>>;
                            blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"trend">;
                                unit: z.ZodDefault<z.ZodString>;
                                points: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"bars">;
                                unit: z.ZodDefault<z.ZodString>;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"distribution">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"activity">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    occurredAt: z.ZodISODateTime;
                                    status: z.ZodEnum<{
                                        completed: "completed";
                                        running: "running";
                                        blocked: "blocked";
                                        failed: "failed";
                                    }>;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>], "type">>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                    role: z.ZodDefault<z.ZodString>;
                    online: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strict>>>;
                tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    status: z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    summary: z.ZodDefault<z.ZodString>;
                }, z.core.$strict>>>;
                events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    kind: z.ZodEnum<{
                        note: "note";
                        "task.assigned": "task.assigned";
                        "task.started": "task.started";
                        "task.blocked": "task.blocked";
                        "task.completed": "task.completed";
                    }>;
                    summary: z.ZodString;
                    occurredAt: z.ZodISODateTime;
                    taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>>>;
                whiteboard: z.ZodDefault<z.ZodObject<{
                    template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                    title: z.ZodDefault<z.ZodString>;
                    status: z.ZodDefault<z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>>;
                    tagline: z.ZodDefault<z.ZodString>;
                    description: z.ZodDefault<z.ZodString>;
                    note: z.ZodDefault<z.ZodString>;
                    link: z.ZodDefault<z.ZodObject<{
                        label: z.ZodDefault<z.ZodString>;
                        url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                    }, z.core.$strict>>;
                    steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    }, z.core.$strict>>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            system: z.ZodDefault<z.ZodObject<{
                cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>], "target">>;
    whiteboardSchema: z.core.ZodStandardJSONSchemaPayload<z.ZodObject<{
        template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
        title: z.ZodDefault<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<{
            completed: "completed";
            running: "running";
            blocked: "blocked";
            failed: "failed";
            queued: "queued";
        }>>;
        tagline: z.ZodDefault<z.ZodString>;
        description: z.ZodDefault<z.ZodString>;
        note: z.ZodDefault<z.ZodString>;
        link: z.ZodDefault<z.ZodObject<{
            label: z.ZodDefault<z.ZodString>;
            url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
        }, z.core.$strict>>;
        steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
    slots: readonly [{
        readonly id: "whiteboard";
        readonly content: "task-board-v1";
        readonly persistent: true;
        readonly update: "office.snapshot";
    }, {
        readonly id: "dialog";
        readonly content: "detail-v1";
        readonly persistent: false;
        readonly update: "ui.respond";
    }, {
        readonly id: "computer.task";
        readonly content: "task";
        readonly persistent: true;
        readonly update: "office.snapshot";
    }, {
        readonly id: "actor.insights";
        readonly content: "agent-insights-v1";
        readonly persistent: false;
        readonly update: "office.snapshot";
    }, {
        readonly id: "decision";
        readonly content: "confirmation-or-choice";
        readonly persistent: false;
        readonly update: "decision.request";
    }];
    actions: readonly ["actor.inspect", "employee.inspect", "task.start", "task.block", "task.complete", "task.assign", "dialog.action", "conversation.delete"];
};
export declare const officeDecisionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"confirmation">;
    confirmLabel: z.ZodDefault<z.ZodString>;
    rejectLabel: z.ZodDefault<z.ZodString>;
    id: z.ZodString;
    actorId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"choice">;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>>;
    id: z.ZodString;
    actorId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
}, z.core.$strict>], "kind">;
export declare const officeRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"offices.initialize">;
    offices: z.ZodArray<z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1.0">;
        seq: z.ZodNumber;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>;
        conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                insights: z.ZodOptional<z.ZodObject<{
                    scope: z.ZodEnum<{
                        conversation: "conversation";
                        office: "office";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    periods: z.ZodArray<z.ZodObject<{
                        id: z.ZodEnum<{
                            last7Days: "last7Days";
                            last30Days: "last30Days";
                        }>;
                        label: z.ZodString;
                        metrics: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            label: z.ZodString;
                            value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                            unit: z.ZodDefault<z.ZodString>;
                            changePercent: z.ZodOptional<z.ZodNumber>;
                            sentiment: z.ZodDefault<z.ZodEnum<{
                                positive: "positive";
                                negative: "negative";
                                neutral: "neutral";
                            }>>;
                        }, z.core.$strict>>;
                        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"trend">;
                            unit: z.ZodDefault<z.ZodString>;
                            points: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"bars">;
                            unit: z.ZodDefault<z.ZodString>;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"distribution">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"activity">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                occurredAt: z.ZodISODateTime;
                                status: z.ZodEnum<{
                                    completed: "completed";
                                    running: "running";
                                    blocked: "blocked";
                                    failed: "failed";
                                }>;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                role: z.ZodDefault<z.ZodString>;
                online: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>>>;
            tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>;
                updatedAt: z.ZodISODateTime;
                assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                summary: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    note: "note";
                    "task.assigned": "task.assigned";
                    "task.started": "task.started";
                    "task.blocked": "task.blocked";
                    "task.completed": "task.completed";
                }>;
                summary: z.ZodString;
                occurredAt: z.ZodISODateTime;
                taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>>>;
            whiteboard: z.ZodDefault<z.ZodObject<{
                template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                title: z.ZodDefault<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>>;
                tagline: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
                note: z.ZodDefault<z.ZodString>;
                link: z.ZodDefault<z.ZodObject<{
                    label: z.ZodDefault<z.ZodString>;
                    url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                }, z.core.$strict>>;
                steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        system: z.ZodDefault<z.ZodObject<{
            cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    chat: z.ZodOptional<z.ZodObject<{
        url: z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>;
    }, z.core.$strict>>;
    layoutId: z.ZodOptional<z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.snapshot">;
    teamId: z.ZodString;
    snapshot: z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1.0">;
        seq: z.ZodNumber;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>;
        conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                insights: z.ZodOptional<z.ZodObject<{
                    scope: z.ZodEnum<{
                        conversation: "conversation";
                        office: "office";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    periods: z.ZodArray<z.ZodObject<{
                        id: z.ZodEnum<{
                            last7Days: "last7Days";
                            last30Days: "last30Days";
                        }>;
                        label: z.ZodString;
                        metrics: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            label: z.ZodString;
                            value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                            unit: z.ZodDefault<z.ZodString>;
                            changePercent: z.ZodOptional<z.ZodNumber>;
                            sentiment: z.ZodDefault<z.ZodEnum<{
                                positive: "positive";
                                negative: "negative";
                                neutral: "neutral";
                            }>>;
                        }, z.core.$strict>>;
                        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"trend">;
                            unit: z.ZodDefault<z.ZodString>;
                            points: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"bars">;
                            unit: z.ZodDefault<z.ZodString>;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"distribution">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"activity">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                occurredAt: z.ZodISODateTime;
                                status: z.ZodEnum<{
                                    completed: "completed";
                                    running: "running";
                                    blocked: "blocked";
                                    failed: "failed";
                                }>;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                role: z.ZodDefault<z.ZodString>;
                online: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>>>;
            tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>;
                updatedAt: z.ZodISODateTime;
                assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                summary: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    note: "note";
                    "task.assigned": "task.assigned";
                    "task.started": "task.started";
                    "task.blocked": "task.blocked";
                    "task.completed": "task.completed";
                }>;
                summary: z.ZodString;
                occurredAt: z.ZodISODateTime;
                taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>>>;
            whiteboard: z.ZodDefault<z.ZodObject<{
                template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                title: z.ZodDefault<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>>;
                tagline: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
                note: z.ZodDefault<z.ZodString>;
                link: z.ZodDefault<z.ZodObject<{
                    label: z.ZodDefault<z.ZodString>;
                    url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                }, z.core.$strict>>;
                steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        system: z.ZodDefault<z.ZodObject<{
            cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.read">;
    teamId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.capabilities">;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.layout.read">;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.layout.set">;
    layoutId: z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"chat.updated">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"ui.next">;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"ui.respond">;
    interactionId: z.ZodString;
    presentation: z.ZodDiscriminatedUnion<[z.ZodObject<{
        target: z.ZodLiteral<"result">;
        success: z.ZodBoolean;
        message: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        target: z.ZodLiteral<"dialog">;
        content: z.ZodObject<{
            template: z.ZodLiteral<"detail-v1">;
            title: z.ZodString;
            description: z.ZodDefault<z.ZodString>;
            fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, z.core.$strict>>>;
            actions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        target: z.ZodLiteral<"whiteboard">;
        snapshot: z.ZodObject<{
            schemaVersion: z.ZodLiteral<"1.0">;
            seq: z.ZodNumber;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>;
            conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    insights: z.ZodOptional<z.ZodObject<{
                        scope: z.ZodEnum<{
                            conversation: "conversation";
                            office: "office";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        periods: z.ZodArray<z.ZodObject<{
                            id: z.ZodEnum<{
                                last7Days: "last7Days";
                                last30Days: "last30Days";
                            }>;
                            label: z.ZodString;
                            metrics: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                label: z.ZodString;
                                value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                unit: z.ZodDefault<z.ZodString>;
                                changePercent: z.ZodOptional<z.ZodNumber>;
                                sentiment: z.ZodDefault<z.ZodEnum<{
                                    positive: "positive";
                                    negative: "negative";
                                    neutral: "neutral";
                                }>>;
                            }, z.core.$strict>>;
                            blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"trend">;
                                unit: z.ZodDefault<z.ZodString>;
                                points: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"bars">;
                                unit: z.ZodDefault<z.ZodString>;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"distribution">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"activity">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    occurredAt: z.ZodISODateTime;
                                    status: z.ZodEnum<{
                                        completed: "completed";
                                        running: "running";
                                        blocked: "blocked";
                                        failed: "failed";
                                    }>;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>], "type">>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                    role: z.ZodDefault<z.ZodString>;
                    online: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strict>>>;
                tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    status: z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    summary: z.ZodDefault<z.ZodString>;
                }, z.core.$strict>>>;
                events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    kind: z.ZodEnum<{
                        note: "note";
                        "task.assigned": "task.assigned";
                        "task.started": "task.started";
                        "task.blocked": "task.blocked";
                        "task.completed": "task.completed";
                    }>;
                    summary: z.ZodString;
                    occurredAt: z.ZodISODateTime;
                    taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>>>;
                whiteboard: z.ZodDefault<z.ZodObject<{
                    template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                    title: z.ZodDefault<z.ZodString>;
                    status: z.ZodDefault<z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>>;
                    tagline: z.ZodDefault<z.ZodString>;
                    description: z.ZodDefault<z.ZodString>;
                    note: z.ZodDefault<z.ZodString>;
                    link: z.ZodDefault<z.ZodObject<{
                        label: z.ZodDefault<z.ZodString>;
                        url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                    }, z.core.$strict>>;
                    steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    }, z.core.$strict>>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            system: z.ZodDefault<z.ZodObject<{
                cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>], "target">;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"decision.request">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
    decision: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"confirmation">;
        confirmLabel: z.ZodDefault<z.ZodString>;
        rejectLabel: z.ZodDefault<z.ZodString>;
        id: z.ZodString;
        actorId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"choice">;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            description: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>>;
        id: z.ZodString;
        actorId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>], "kind">;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>], "type">;
export declare const officeMessageSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"offices.initialize">;
    offices: z.ZodArray<z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1.0">;
        seq: z.ZodNumber;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>;
        conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                insights: z.ZodOptional<z.ZodObject<{
                    scope: z.ZodEnum<{
                        conversation: "conversation";
                        office: "office";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    periods: z.ZodArray<z.ZodObject<{
                        id: z.ZodEnum<{
                            last7Days: "last7Days";
                            last30Days: "last30Days";
                        }>;
                        label: z.ZodString;
                        metrics: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            label: z.ZodString;
                            value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                            unit: z.ZodDefault<z.ZodString>;
                            changePercent: z.ZodOptional<z.ZodNumber>;
                            sentiment: z.ZodDefault<z.ZodEnum<{
                                positive: "positive";
                                negative: "negative";
                                neutral: "neutral";
                            }>>;
                        }, z.core.$strict>>;
                        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"trend">;
                            unit: z.ZodDefault<z.ZodString>;
                            points: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"bars">;
                            unit: z.ZodDefault<z.ZodString>;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"distribution">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"activity">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                occurredAt: z.ZodISODateTime;
                                status: z.ZodEnum<{
                                    completed: "completed";
                                    running: "running";
                                    blocked: "blocked";
                                    failed: "failed";
                                }>;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                role: z.ZodDefault<z.ZodString>;
                online: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>>>;
            tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>;
                updatedAt: z.ZodISODateTime;
                assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                summary: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    note: "note";
                    "task.assigned": "task.assigned";
                    "task.started": "task.started";
                    "task.blocked": "task.blocked";
                    "task.completed": "task.completed";
                }>;
                summary: z.ZodString;
                occurredAt: z.ZodISODateTime;
                taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>>>;
            whiteboard: z.ZodDefault<z.ZodObject<{
                template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                title: z.ZodDefault<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>>;
                tagline: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
                note: z.ZodDefault<z.ZodString>;
                link: z.ZodDefault<z.ZodObject<{
                    label: z.ZodDefault<z.ZodString>;
                    url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                }, z.core.$strict>>;
                steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        system: z.ZodDefault<z.ZodObject<{
            cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    chat: z.ZodOptional<z.ZodObject<{
        url: z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>;
    }, z.core.$strict>>;
    layoutId: z.ZodOptional<z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.snapshot">;
    teamId: z.ZodString;
    snapshot: z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1.0">;
        seq: z.ZodNumber;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>;
        conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                insights: z.ZodOptional<z.ZodObject<{
                    scope: z.ZodEnum<{
                        conversation: "conversation";
                        office: "office";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    periods: z.ZodArray<z.ZodObject<{
                        id: z.ZodEnum<{
                            last7Days: "last7Days";
                            last30Days: "last30Days";
                        }>;
                        label: z.ZodString;
                        metrics: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            label: z.ZodString;
                            value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                            unit: z.ZodDefault<z.ZodString>;
                            changePercent: z.ZodOptional<z.ZodNumber>;
                            sentiment: z.ZodDefault<z.ZodEnum<{
                                positive: "positive";
                                negative: "negative";
                                neutral: "neutral";
                            }>>;
                        }, z.core.$strict>>;
                        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"trend">;
                            unit: z.ZodDefault<z.ZodString>;
                            points: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"bars">;
                            unit: z.ZodDefault<z.ZodString>;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"distribution">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"activity">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                occurredAt: z.ZodISODateTime;
                                status: z.ZodEnum<{
                                    completed: "completed";
                                    running: "running";
                                    blocked: "blocked";
                                    failed: "failed";
                                }>;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                role: z.ZodDefault<z.ZodString>;
                online: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>>>;
            tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>;
                updatedAt: z.ZodISODateTime;
                assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                summary: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    note: "note";
                    "task.assigned": "task.assigned";
                    "task.started": "task.started";
                    "task.blocked": "task.blocked";
                    "task.completed": "task.completed";
                }>;
                summary: z.ZodString;
                occurredAt: z.ZodISODateTime;
                taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>>>;
            whiteboard: z.ZodDefault<z.ZodObject<{
                template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                title: z.ZodDefault<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>>;
                tagline: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
                note: z.ZodDefault<z.ZodString>;
                link: z.ZodDefault<z.ZodObject<{
                    label: z.ZodDefault<z.ZodString>;
                    url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                }, z.core.$strict>>;
                steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        system: z.ZodDefault<z.ZodObject<{
            cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.read">;
    teamId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.capabilities">;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.layout.read">;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"office.layout.set">;
    layoutId: z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"chat.updated">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"ui.next">;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"ui.respond">;
    interactionId: z.ZodString;
    presentation: z.ZodDiscriminatedUnion<[z.ZodObject<{
        target: z.ZodLiteral<"result">;
        success: z.ZodBoolean;
        message: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        target: z.ZodLiteral<"dialog">;
        content: z.ZodObject<{
            template: z.ZodLiteral<"detail-v1">;
            title: z.ZodString;
            description: z.ZodDefault<z.ZodString>;
            fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, z.core.$strict>>>;
            actions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        target: z.ZodLiteral<"whiteboard">;
        snapshot: z.ZodObject<{
            schemaVersion: z.ZodLiteral<"1.0">;
            seq: z.ZodNumber;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>;
            conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    insights: z.ZodOptional<z.ZodObject<{
                        scope: z.ZodEnum<{
                            conversation: "conversation";
                            office: "office";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        periods: z.ZodArray<z.ZodObject<{
                            id: z.ZodEnum<{
                                last7Days: "last7Days";
                                last30Days: "last30Days";
                            }>;
                            label: z.ZodString;
                            metrics: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                label: z.ZodString;
                                value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                unit: z.ZodDefault<z.ZodString>;
                                changePercent: z.ZodOptional<z.ZodNumber>;
                                sentiment: z.ZodDefault<z.ZodEnum<{
                                    positive: "positive";
                                    negative: "negative";
                                    neutral: "neutral";
                                }>>;
                            }, z.core.$strict>>;
                            blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"trend">;
                                unit: z.ZodDefault<z.ZodString>;
                                points: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"bars">;
                                unit: z.ZodDefault<z.ZodString>;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"distribution">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"activity">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    occurredAt: z.ZodISODateTime;
                                    status: z.ZodEnum<{
                                        completed: "completed";
                                        running: "running";
                                        blocked: "blocked";
                                        failed: "failed";
                                    }>;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>], "type">>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                    role: z.ZodDefault<z.ZodString>;
                    online: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strict>>>;
                tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    status: z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    summary: z.ZodDefault<z.ZodString>;
                }, z.core.$strict>>>;
                events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    kind: z.ZodEnum<{
                        note: "note";
                        "task.assigned": "task.assigned";
                        "task.started": "task.started";
                        "task.blocked": "task.blocked";
                        "task.completed": "task.completed";
                    }>;
                    summary: z.ZodString;
                    occurredAt: z.ZodISODateTime;
                    taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>>>;
                whiteboard: z.ZodDefault<z.ZodObject<{
                    template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                    title: z.ZodDefault<z.ZodString>;
                    status: z.ZodDefault<z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>>;
                    tagline: z.ZodDefault<z.ZodString>;
                    description: z.ZodDefault<z.ZodString>;
                    note: z.ZodDefault<z.ZodString>;
                    link: z.ZodDefault<z.ZodObject<{
                        label: z.ZodDefault<z.ZodString>;
                        url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                    }, z.core.$strict>>;
                    steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    }, z.core.$strict>>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            system: z.ZodDefault<z.ZodObject<{
                cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>], "target">;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"decision.request">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
    decision: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"confirmation">;
        confirmLabel: z.ZodDefault<z.ZodString>;
        rejectLabel: z.ZodDefault<z.ZodString>;
        id: z.ZodString;
        actorId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"choice">;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            description: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>>;
        id: z.ZodString;
        actorId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>], "kind">;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>], "type">;
export declare const officeDeliverySchema: z.ZodObject<{
    type: z.ZodLiteral<"office.request">;
    responseToken: z.ZodString;
    remainingMs: z.ZodNumber;
    request: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"offices.initialize">;
        offices: z.ZodArray<z.ZodObject<{
            schemaVersion: z.ZodLiteral<"1.0">;
            seq: z.ZodNumber;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>;
            conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    insights: z.ZodOptional<z.ZodObject<{
                        scope: z.ZodEnum<{
                            conversation: "conversation";
                            office: "office";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        periods: z.ZodArray<z.ZodObject<{
                            id: z.ZodEnum<{
                                last7Days: "last7Days";
                                last30Days: "last30Days";
                            }>;
                            label: z.ZodString;
                            metrics: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                label: z.ZodString;
                                value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                unit: z.ZodDefault<z.ZodString>;
                                changePercent: z.ZodOptional<z.ZodNumber>;
                                sentiment: z.ZodDefault<z.ZodEnum<{
                                    positive: "positive";
                                    negative: "negative";
                                    neutral: "neutral";
                                }>>;
                            }, z.core.$strict>>;
                            blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"trend">;
                                unit: z.ZodDefault<z.ZodString>;
                                points: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"bars">;
                                unit: z.ZodDefault<z.ZodString>;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"distribution">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"activity">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    occurredAt: z.ZodISODateTime;
                                    status: z.ZodEnum<{
                                        completed: "completed";
                                        running: "running";
                                        blocked: "blocked";
                                        failed: "failed";
                                    }>;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>], "type">>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                    role: z.ZodDefault<z.ZodString>;
                    online: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strict>>>;
                tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    status: z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    summary: z.ZodDefault<z.ZodString>;
                }, z.core.$strict>>>;
                events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    kind: z.ZodEnum<{
                        note: "note";
                        "task.assigned": "task.assigned";
                        "task.started": "task.started";
                        "task.blocked": "task.blocked";
                        "task.completed": "task.completed";
                    }>;
                    summary: z.ZodString;
                    occurredAt: z.ZodISODateTime;
                    taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>>>;
                whiteboard: z.ZodDefault<z.ZodObject<{
                    template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                    title: z.ZodDefault<z.ZodString>;
                    status: z.ZodDefault<z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>>;
                    tagline: z.ZodDefault<z.ZodString>;
                    description: z.ZodDefault<z.ZodString>;
                    note: z.ZodDefault<z.ZodString>;
                    link: z.ZodDefault<z.ZodObject<{
                        label: z.ZodDefault<z.ZodString>;
                        url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                    }, z.core.$strict>>;
                    steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    }, z.core.$strict>>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            system: z.ZodDefault<z.ZodObject<{
                cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        chat: z.ZodOptional<z.ZodObject<{
            url: z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>;
        }, z.core.$strict>>;
        layoutId: z.ZodOptional<z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"office.snapshot">;
        teamId: z.ZodString;
        snapshot: z.ZodObject<{
            schemaVersion: z.ZodLiteral<"1.0">;
            seq: z.ZodNumber;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>;
            conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    insights: z.ZodOptional<z.ZodObject<{
                        scope: z.ZodEnum<{
                            conversation: "conversation";
                            office: "office";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        periods: z.ZodArray<z.ZodObject<{
                            id: z.ZodEnum<{
                                last7Days: "last7Days";
                                last30Days: "last30Days";
                            }>;
                            label: z.ZodString;
                            metrics: z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                label: z.ZodString;
                                value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                unit: z.ZodDefault<z.ZodString>;
                                changePercent: z.ZodOptional<z.ZodNumber>;
                                sentiment: z.ZodDefault<z.ZodEnum<{
                                    positive: "positive";
                                    negative: "negative";
                                    neutral: "neutral";
                                }>>;
                            }, z.core.$strict>>;
                            blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                type: z.ZodLiteral<"trend">;
                                unit: z.ZodDefault<z.ZodString>;
                                points: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"bars">;
                                unit: z.ZodDefault<z.ZodString>;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"distribution">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    value: z.ZodNumber;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>, z.ZodObject<{
                                type: z.ZodLiteral<"activity">;
                                items: z.ZodArray<z.ZodObject<{
                                    label: z.ZodString;
                                    occurredAt: z.ZodISODateTime;
                                    status: z.ZodEnum<{
                                        completed: "completed";
                                        running: "running";
                                        blocked: "blocked";
                                        failed: "failed";
                                    }>;
                                }, z.core.$strict>>;
                                id: z.ZodString;
                                title: z.ZodString;
                            }, z.core.$strict>], "type">>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                    role: z.ZodDefault<z.ZodString>;
                    online: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strict>>>;
                tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    status: z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    summary: z.ZodDefault<z.ZodString>;
                }, z.core.$strict>>>;
                events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    kind: z.ZodEnum<{
                        note: "note";
                        "task.assigned": "task.assigned";
                        "task.started": "task.started";
                        "task.blocked": "task.blocked";
                        "task.completed": "task.completed";
                    }>;
                    summary: z.ZodString;
                    occurredAt: z.ZodISODateTime;
                    taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                }, z.core.$strict>>>;
                whiteboard: z.ZodDefault<z.ZodObject<{
                    template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                    title: z.ZodDefault<z.ZodString>;
                    status: z.ZodDefault<z.ZodEnum<{
                        completed: "completed";
                        running: "running";
                        blocked: "blocked";
                        failed: "failed";
                        queued: "queued";
                    }>>;
                    tagline: z.ZodDefault<z.ZodString>;
                    description: z.ZodDefault<z.ZodString>;
                    note: z.ZodDefault<z.ZodString>;
                    link: z.ZodDefault<z.ZodObject<{
                        label: z.ZodDefault<z.ZodString>;
                        url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                    }, z.core.$strict>>;
                    steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    }, z.core.$strict>>>;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            system: z.ZodDefault<z.ZodObject<{
                cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"office.read">;
        teamId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"office.capabilities">;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"office.layout.read">;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"office.layout.set">;
        layoutId: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"chat.updated">;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"ui.next">;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"ui.respond">;
        interactionId: z.ZodString;
        presentation: z.ZodDiscriminatedUnion<[z.ZodObject<{
            target: z.ZodLiteral<"result">;
            success: z.ZodBoolean;
            message: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            target: z.ZodLiteral<"dialog">;
            content: z.ZodObject<{
                template: z.ZodLiteral<"detail-v1">;
                title: z.ZodString;
                description: z.ZodDefault<z.ZodString>;
                fields: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    value: z.ZodString;
                }, z.core.$strict>>>;
                actions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    label: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            target: z.ZodLiteral<"whiteboard">;
            snapshot: z.ZodObject<{
                schemaVersion: z.ZodLiteral<"1.0">;
                seq: z.ZodNumber;
                workspace: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                }, z.core.$strict>;
                conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        insights: z.ZodOptional<z.ZodObject<{
                            scope: z.ZodEnum<{
                                conversation: "conversation";
                                office: "office";
                            }>;
                            updatedAt: z.ZodISODateTime;
                            periods: z.ZodArray<z.ZodObject<{
                                id: z.ZodEnum<{
                                    last7Days: "last7Days";
                                    last30Days: "last30Days";
                                }>;
                                label: z.ZodString;
                                metrics: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    label: z.ZodString;
                                    value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                    unit: z.ZodDefault<z.ZodString>;
                                    changePercent: z.ZodOptional<z.ZodNumber>;
                                    sentiment: z.ZodDefault<z.ZodEnum<{
                                        positive: "positive";
                                        negative: "negative";
                                        neutral: "neutral";
                                    }>>;
                                }, z.core.$strict>>;
                                blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    type: z.ZodLiteral<"trend">;
                                    unit: z.ZodDefault<z.ZodString>;
                                    points: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"bars">;
                                    unit: z.ZodDefault<z.ZodString>;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"distribution">;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"activity">;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        occurredAt: z.ZodISODateTime;
                                        status: z.ZodEnum<{
                                            completed: "completed";
                                            running: "running";
                                            blocked: "blocked";
                                            failed: "failed";
                                        }>;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>], "type">>;
                            }, z.core.$strict>>;
                        }, z.core.$strict>>;
                        sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                        role: z.ZodDefault<z.ZodString>;
                        online: z.ZodDefault<z.ZodBoolean>;
                    }, z.core.$strict>>>;
                    tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodEnum<{
                            completed: "completed";
                            running: "running";
                            blocked: "blocked";
                            failed: "failed";
                            queued: "queued";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                        summary: z.ZodDefault<z.ZodString>;
                    }, z.core.$strict>>>;
                    events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        kind: z.ZodEnum<{
                            note: "note";
                            "task.assigned": "task.assigned";
                            "task.started": "task.started";
                            "task.blocked": "task.blocked";
                            "task.completed": "task.completed";
                        }>;
                        summary: z.ZodString;
                        occurredAt: z.ZodISODateTime;
                        taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    }, z.core.$strict>>>;
                    whiteboard: z.ZodDefault<z.ZodObject<{
                        template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                        title: z.ZodDefault<z.ZodString>;
                        status: z.ZodDefault<z.ZodEnum<{
                            completed: "completed";
                            running: "running";
                            blocked: "blocked";
                            failed: "failed";
                            queued: "queued";
                        }>>;
                        tagline: z.ZodDefault<z.ZodString>;
                        description: z.ZodDefault<z.ZodString>;
                        note: z.ZodDefault<z.ZodString>;
                        link: z.ZodDefault<z.ZodObject<{
                            label: z.ZodDefault<z.ZodString>;
                            url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                        }, z.core.$strict>>;
                        steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            title: z.ZodString;
                            progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>>;
                system: z.ZodDefault<z.ZodObject<{
                    cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>;
            }, z.core.$strict>;
        }, z.core.$strict>], "target">;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"decision.request">;
        teamId: z.ZodString;
        conversationId: z.ZodString;
        decision: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"confirmation">;
            confirmLabel: z.ZodDefault<z.ZodString>;
            rejectLabel: z.ZodDefault<z.ZodString>;
            id: z.ZodString;
            actorId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
            title: z.ZodString;
            description: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"choice">;
            options: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                description: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>;
            id: z.ZodString;
            actorId: z.ZodDefault<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
            title: z.ZodString;
            description: z.ZodDefault<z.ZodString>;
        }, z.core.$strict>], "kind">;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>], "type">;
}, z.core.$strict>;
export declare const officeClosedSchema: z.ZodObject<{
    type: z.ZodLiteral<"office.request.closed">;
    responseToken: z.ZodString;
}, z.core.$strict>;
export declare const officeSyncSchema: z.ZodObject<{
    type: z.ZodLiteral<"office.sync">;
    snapshot: z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1.0">;
        seq: z.ZodNumber;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>;
        conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                insights: z.ZodOptional<z.ZodObject<{
                    scope: z.ZodEnum<{
                        conversation: "conversation";
                        office: "office";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    periods: z.ZodArray<z.ZodObject<{
                        id: z.ZodEnum<{
                            last7Days: "last7Days";
                            last30Days: "last30Days";
                        }>;
                        label: z.ZodString;
                        metrics: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            label: z.ZodString;
                            value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                            unit: z.ZodDefault<z.ZodString>;
                            changePercent: z.ZodOptional<z.ZodNumber>;
                            sentiment: z.ZodDefault<z.ZodEnum<{
                                positive: "positive";
                                negative: "negative";
                                neutral: "neutral";
                            }>>;
                        }, z.core.$strict>>;
                        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"trend">;
                            unit: z.ZodDefault<z.ZodString>;
                            points: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"bars">;
                            unit: z.ZodDefault<z.ZodString>;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"distribution">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"activity">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                occurredAt: z.ZodISODateTime;
                                status: z.ZodEnum<{
                                    completed: "completed";
                                    running: "running";
                                    blocked: "blocked";
                                    failed: "failed";
                                }>;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                role: z.ZodDefault<z.ZodString>;
                online: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>>>;
            tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>;
                updatedAt: z.ZodISODateTime;
                assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                summary: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    note: "note";
                    "task.assigned": "task.assigned";
                    "task.started": "task.started";
                    "task.blocked": "task.blocked";
                    "task.completed": "task.completed";
                }>;
                summary: z.ZodString;
                occurredAt: z.ZodISODateTime;
                taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>>>;
            whiteboard: z.ZodDefault<z.ZodObject<{
                template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                title: z.ZodDefault<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>>;
                tagline: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
                note: z.ZodDefault<z.ZodString>;
                link: z.ZodDefault<z.ZodObject<{
                    label: z.ZodDefault<z.ZodString>;
                    url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                }, z.core.$strict>>;
                steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        system: z.ZodDefault<z.ZodObject<{
            cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const officeSyncStartSchema: z.ZodObject<{
    type: z.ZodLiteral<"office.sync.start">;
    stateId: z.ZodString;
    layout: z.ZodObject<{
        currentLayoutId: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        revision: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const officeSyncCompleteSchema: z.ZodObject<{
    type: z.ZodLiteral<"office.sync.complete">;
    offices: z.ZodArray<z.ZodObject<{
        teamId: z.ZodString;
        seq: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const officeSuccessResultSchema: z.ZodUnion<readonly [z.ZodObject<{
    capabilities: z.ZodObject<{
        layouts: z.ZodArray<z.ZodObject<{
            id: z.ZodEnum<{
                classic: "classic";
                members: "members";
            }>;
            name: z.ZodString;
            dataMessageType: z.ZodLiteral<"office.snapshot">;
            dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            ui: z.ZodObject<{
                slots: z.ZodArray<z.ZodString>;
                actions: z.ZodArray<z.ZodString>;
                localControls: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        scene: z.ZodObject<{
            protocolVersion: z.ZodLiteral<"2.0">;
            command: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            batch: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            capabilities: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                participants: z.ZodDefault<z.ZodObject<{
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    roles: z.ZodArray<z.ZodObject<{
                        role: z.ZodString;
                        min: z.ZodNumber;
                        max: z.ZodNumber;
                    }, z.core.$strict>>;
                    rules: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            actors: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                templateId: z.ZodString;
            }, z.core.$strict>>;
            objects: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                templateId: z.ZodString;
                stateSchema: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>;
                interactions: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    requiresHome: z.ZodBoolean;
                    actorIds: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                content: z.ZodString;
                persistent: z.ZodBoolean;
                update: z.ZodString;
            }, z.core.$strict>>;
            actions: z.ZodArray<z.ZodString>;
            actionSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            presentationSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            whiteboardSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        }, z.core.$strict>;
        chat: z.ZodObject<{
            version: z.ZodLiteral<"1.0">;
            browserPath: z.ZodLiteral<"/api/pixoffice/chat">;
            method: z.ZodLiteral<"POST">;
            upstream: z.ZodObject<{
                configuredBy: z.ZodLiteral<"offices.initialize.chat.url">;
                direction: z.ZodLiteral<"pixoffice-server-to-chat-service">;
            }, z.core.$strict>;
            identity: z.ZodArray<z.ZodString>;
            requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            operations: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    send: "send";
                    history: "history";
                    resume: "resume";
                    cancel: "cancel";
                }>;
                requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                responseContentType: z.ZodEnum<{
                    "application/json": "application/json";
                    "application/x-ndjson": "application/x-ndjson";
                }>;
                responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                timeoutMs: z.ZodNumber;
            }, z.core.$strict>>;
            stream: z.ZodObject<{
                eventSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                resumeFirstEvents: z.ZodArray<z.ZodString>;
                terminalEvents: z.ZodArray<z.ZodString>;
                terminalSnapshotStates: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            limits: z.ZodObject<{
                requestBytes: z.ZodNumber;
                historyResponseBytes: z.ZodNumber;
                replyCharacters: z.ZodNumber;
            }, z.core.$strict>;
            rules: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        supportedMessages: z.ZodArray<z.ZodString>;
        http: z.ZodObject<{
            path: z.ZodLiteral<"/api/pixoffice/messages">;
            method: z.ZodLiteral<"POST">;
            authentication: z.ZodLiteral<"bearer">;
            requestBytes: z.ZodNumber;
            businessTimeoutMs: z.ZodNumber;
        }, z.core.$strict>;
        animation: z.ZodObject<{
            requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            delivery: z.ZodLiteral<"best-effort">;
            completionAcknowledged: z.ZodLiteral<false>;
        }, z.core.$strict>;
        requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        responses: z.ZodObject<{
            envelope: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            success: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            error: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            operations: z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                scope: z.ZodEnum<{
                    office: "office";
                    workspace: "workspace";
                    operation: "operation";
                }>;
                codes: z.ZodArray<z.ZodNumber>;
                dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    state: z.ZodObject<{
        layout: z.ZodObject<{
            currentLayoutId: z.ZodEnum<{
                classic: "classic";
                members: "members";
            }>;
            revision: z.ZodNumber;
        }, z.core.$strict>;
        chat: z.ZodObject<{
            configured: z.ZodBoolean;
        }, z.core.$strict>;
        offices: z.ZodArray<z.ZodObject<{
            snapshot: z.ZodObject<{
                schemaVersion: z.ZodLiteral<"1.0">;
                seq: z.ZodNumber;
                workspace: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                }, z.core.$strict>;
                conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        insights: z.ZodOptional<z.ZodObject<{
                            scope: z.ZodEnum<{
                                conversation: "conversation";
                                office: "office";
                            }>;
                            updatedAt: z.ZodISODateTime;
                            periods: z.ZodArray<z.ZodObject<{
                                id: z.ZodEnum<{
                                    last7Days: "last7Days";
                                    last30Days: "last30Days";
                                }>;
                                label: z.ZodString;
                                metrics: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    label: z.ZodString;
                                    value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                    unit: z.ZodDefault<z.ZodString>;
                                    changePercent: z.ZodOptional<z.ZodNumber>;
                                    sentiment: z.ZodDefault<z.ZodEnum<{
                                        positive: "positive";
                                        negative: "negative";
                                        neutral: "neutral";
                                    }>>;
                                }, z.core.$strict>>;
                                blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    type: z.ZodLiteral<"trend">;
                                    unit: z.ZodDefault<z.ZodString>;
                                    points: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"bars">;
                                    unit: z.ZodDefault<z.ZodString>;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"distribution">;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"activity">;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        occurredAt: z.ZodISODateTime;
                                        status: z.ZodEnum<{
                                            completed: "completed";
                                            running: "running";
                                            blocked: "blocked";
                                            failed: "failed";
                                        }>;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>], "type">>;
                            }, z.core.$strict>>;
                        }, z.core.$strict>>;
                        sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                        role: z.ZodDefault<z.ZodString>;
                        online: z.ZodDefault<z.ZodBoolean>;
                    }, z.core.$strict>>>;
                    tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodEnum<{
                            completed: "completed";
                            running: "running";
                            blocked: "blocked";
                            failed: "failed";
                            queued: "queued";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                        summary: z.ZodDefault<z.ZodString>;
                    }, z.core.$strict>>>;
                    events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        kind: z.ZodEnum<{
                            note: "note";
                            "task.assigned": "task.assigned";
                            "task.started": "task.started";
                            "task.blocked": "task.blocked";
                            "task.completed": "task.completed";
                        }>;
                        summary: z.ZodString;
                        occurredAt: z.ZodISODateTime;
                        taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    }, z.core.$strict>>>;
                    whiteboard: z.ZodDefault<z.ZodObject<{
                        template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                        title: z.ZodDefault<z.ZodString>;
                        status: z.ZodDefault<z.ZodEnum<{
                            completed: "completed";
                            running: "running";
                            blocked: "blocked";
                            failed: "failed";
                            queued: "queued";
                        }>>;
                        tagline: z.ZodDefault<z.ZodString>;
                        description: z.ZodDefault<z.ZodString>;
                        note: z.ZodDefault<z.ZodString>;
                        link: z.ZodDefault<z.ZodObject<{
                            label: z.ZodDefault<z.ZodString>;
                            url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                        }, z.core.$strict>>;
                        steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            title: z.ZodString;
                            progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>>;
                system: z.ZodDefault<z.ZodObject<{
                    cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            runtime: z.ZodObject<{
                available: z.ZodBoolean;
                selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
                actors: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    templateId: z.ZodString;
                    position: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    presentation: z.ZodObject<{
                        status: z.ZodEnum<{
                            thinking: "thinking";
                            idle: "idle";
                            working: "working";
                        }>;
                        title: z.ZodString;
                        sourceRevision: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
                objects: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                    templateId: z.ZodString;
                    stateRevision: z.ZodNumber;
                    interactions: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        requiresHome: z.ZodBoolean;
                        actorIds: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                pendingDecisions: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    snapshot: z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1.0">;
        seq: z.ZodNumber;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>;
        conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                insights: z.ZodOptional<z.ZodObject<{
                    scope: z.ZodEnum<{
                        conversation: "conversation";
                        office: "office";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    periods: z.ZodArray<z.ZodObject<{
                        id: z.ZodEnum<{
                            last7Days: "last7Days";
                            last30Days: "last30Days";
                        }>;
                        label: z.ZodString;
                        metrics: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            label: z.ZodString;
                            value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                            unit: z.ZodDefault<z.ZodString>;
                            changePercent: z.ZodOptional<z.ZodNumber>;
                            sentiment: z.ZodDefault<z.ZodEnum<{
                                positive: "positive";
                                negative: "negative";
                                neutral: "neutral";
                            }>>;
                        }, z.core.$strict>>;
                        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"trend">;
                            unit: z.ZodDefault<z.ZodString>;
                            points: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"bars">;
                            unit: z.ZodDefault<z.ZodString>;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"distribution">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"activity">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                occurredAt: z.ZodISODateTime;
                                status: z.ZodEnum<{
                                    completed: "completed";
                                    running: "running";
                                    blocked: "blocked";
                                    failed: "failed";
                                }>;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                role: z.ZodDefault<z.ZodString>;
                online: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>>>;
            tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>;
                updatedAt: z.ZodISODateTime;
                assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                summary: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    note: "note";
                    "task.assigned": "task.assigned";
                    "task.started": "task.started";
                    "task.blocked": "task.blocked";
                    "task.completed": "task.completed";
                }>;
                summary: z.ZodString;
                occurredAt: z.ZodISODateTime;
                taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>>>;
            whiteboard: z.ZodDefault<z.ZodObject<{
                template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                title: z.ZodDefault<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>>;
                tagline: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
                note: z.ZodDefault<z.ZodString>;
                link: z.ZodDefault<z.ZodObject<{
                    label: z.ZodDefault<z.ZodString>;
                    url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                }, z.core.$strict>>;
                steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        system: z.ZodDefault<z.ZodObject<{
            cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    runtime: z.ZodObject<{
        available: z.ZodBoolean;
        selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
        actors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            presentation: z.ZodObject<{
                status: z.ZodEnum<{
                    thinking: "thinking";
                    idle: "idle";
                    working: "working";
                }>;
                title: z.ZodString;
                sourceRevision: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        objects: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            templateId: z.ZodString;
            stateRevision: z.ZodNumber;
            interactions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                requiresHome: z.ZodBoolean;
                actorIds: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        pendingDecisions: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    teamId: z.ZodString;
    seq: z.ZodNumber;
    status: z.ZodEnum<{
        applied: "applied";
        cached: "cached";
        ignored: "ignored";
    }>;
    reasonCode: z.ZodOptional<z.ZodEnum<{
        STALE_SEQ: "STALE_SEQ";
        DUPLICATE_SEQ: "DUPLICATE_SEQ";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    teamId: z.ZodString;
    conversationId: z.ZodString;
    decisionId: z.ZodString;
    choiceId: z.ZodString;
    label: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    layouts: z.ZodArray<z.ZodObject<{
        id: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        name: z.ZodString;
        dataMessageType: z.ZodLiteral<"office.snapshot">;
        dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodString>;
            actions: z.ZodArray<z.ZodString>;
            localControls: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    scene: z.ZodObject<{
        protocolVersion: z.ZodLiteral<"2.0">;
        command: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        batch: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        capabilities: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            participants: z.ZodDefault<z.ZodObject<{
                min: z.ZodNumber;
                max: z.ZodNumber;
                roles: z.ZodArray<z.ZodObject<{
                    role: z.ZodString;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                }, z.core.$strict>>;
                rules: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        actors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
        }, z.core.$strict>>;
        objects: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
            stateSchema: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>;
            interactions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                requiresHome: z.ZodBoolean;
                actorIds: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    ui: z.ZodObject<{
        slots: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            persistent: z.ZodBoolean;
            update: z.ZodString;
        }, z.core.$strict>>;
        actions: z.ZodArray<z.ZodString>;
        actionSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        presentationSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        whiteboardSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
    }, z.core.$strict>;
    chat: z.ZodObject<{
        version: z.ZodLiteral<"1.0">;
        browserPath: z.ZodLiteral<"/api/pixoffice/chat">;
        method: z.ZodLiteral<"POST">;
        upstream: z.ZodObject<{
            configuredBy: z.ZodLiteral<"offices.initialize.chat.url">;
            direction: z.ZodLiteral<"pixoffice-server-to-chat-service">;
        }, z.core.$strict>;
        identity: z.ZodArray<z.ZodString>;
        requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        operations: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                send: "send";
                history: "history";
                resume: "resume";
                cancel: "cancel";
            }>;
            requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            responseContentType: z.ZodEnum<{
                "application/json": "application/json";
                "application/x-ndjson": "application/x-ndjson";
            }>;
            responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            timeoutMs: z.ZodNumber;
        }, z.core.$strict>>;
        stream: z.ZodObject<{
            eventSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            resumeFirstEvents: z.ZodArray<z.ZodString>;
            terminalEvents: z.ZodArray<z.ZodString>;
            terminalSnapshotStates: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        limits: z.ZodObject<{
            requestBytes: z.ZodNumber;
            historyResponseBytes: z.ZodNumber;
            replyCharacters: z.ZodNumber;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    supportedMessages: z.ZodArray<z.ZodString>;
    http: z.ZodObject<{
        path: z.ZodLiteral<"/api/pixoffice/messages">;
        method: z.ZodLiteral<"POST">;
        authentication: z.ZodLiteral<"bearer">;
        requestBytes: z.ZodNumber;
        businessTimeoutMs: z.ZodNumber;
    }, z.core.$strict>;
    animation: z.ZodObject<{
        requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        delivery: z.ZodLiteral<"best-effort">;
        completionAcknowledged: z.ZodLiteral<false>;
    }, z.core.$strict>;
    requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
    responses: z.ZodObject<{
        envelope: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        success: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        error: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        operations: z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            scope: z.ZodEnum<{
                office: "office";
                workspace: "workspace";
                operation: "operation";
            }>;
            codes: z.ZodArray<z.ZodNumber>;
            dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    rules: z.ZodArray<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    currentLayoutId: z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>;
    revision: z.ZodNumber;
    layouts: z.ZodArray<z.ZodObject<{
        id: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        name: z.ZodString;
        dataMessageType: z.ZodLiteral<"office.snapshot">;
        dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodString>;
            actions: z.ZodArray<z.ZodString>;
            localControls: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    teamId: z.ZodString;
    conversationId: z.ZodString;
    forwarded: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    actions: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        action: z.ZodLiteral<"conversation.delete">;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"actor.inspect">;
        actorId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"employee.inspect">;
        employeeId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, ...z.ZodObject<{
        action: z.ZodLiteral<"task.start" | "task.block" | "task.complete">;
        taskId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>[], z.ZodObject<{
        action: z.ZodLiteral<"task.assign">;
        taskId: z.ZodString;
        assigneeId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"dialog.action">;
        interactionId: z.ZodString;
        optionId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>], "action">>;
}, z.core.$strict>, z.ZodObject<{
    interactionId: z.ZodString;
    delivered: z.ZodLiteral<true>;
}, z.core.$strict>]>;
export declare const officeReplySchema: z.ZodObject<{
    responseToken: z.ZodString;
    result: z.ZodObject<{
        code: z.ZodUnion<readonly [z.ZodLiteral<200>, z.ZodLiteral<400>, z.ZodLiteral<404>, z.ZodLiteral<409>, z.ZodLiteral<422>, z.ZodLiteral<500>, z.ZodLiteral<503>]>;
        msg: z.ZodString;
        data: z.ZodUnion<readonly [z.ZodObject<{
            offices: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                seq: z.ZodNumber;
                runtime: z.ZodObject<{
                    available: z.ZodBoolean;
                    selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
                    actors: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        templateId: z.ZodString;
                        position: z.ZodObject<{
                            x: z.ZodNumber;
                            y: z.ZodNumber;
                        }, z.core.$strict>;
                        presentation: z.ZodObject<{
                            status: z.ZodEnum<{
                                thinking: "thinking";
                                idle: "idle";
                                working: "working";
                            }>;
                            title: z.ZodString;
                            sourceRevision: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>>;
                    objects: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                        templateId: z.ZodString;
                        stateRevision: z.ZodNumber;
                        interactions: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            name: z.ZodString;
                            requiresHome: z.ZodBoolean;
                            actorIds: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    pendingDecisions: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            id: z.ZodString;
            seq: z.ZodNumber;
            runtime: z.ZodObject<{
                available: z.ZodBoolean;
                selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
                actors: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    templateId: z.ZodString;
                    position: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    presentation: z.ZodObject<{
                        status: z.ZodEnum<{
                            thinking: "thinking";
                            idle: "idle";
                            working: "working";
                        }>;
                        title: z.ZodString;
                        sourceRevision: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
                objects: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                    templateId: z.ZodString;
                    stateRevision: z.ZodNumber;
                    interactions: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        requiresHome: z.ZodBoolean;
                        actorIds: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                pendingDecisions: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            teamId: z.ZodString;
            seq: z.ZodNumber;
            status: z.ZodEnum<{
                applied: "applied";
                cached: "cached";
                ignored: "ignored";
            }>;
            reasonCode: z.ZodOptional<z.ZodEnum<{
                STALE_SEQ: "STALE_SEQ";
                DUPLICATE_SEQ: "DUPLICATE_SEQ";
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            teamId: z.ZodString;
            conversationId: z.ZodString;
            decisionId: z.ZodString;
            choiceId: z.ZodString;
            label: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            currentLayoutId: z.ZodEnum<{
                classic: "classic";
                members: "members";
            }>;
            revision: z.ZodNumber;
            layouts: z.ZodArray<z.ZodObject<{
                id: z.ZodEnum<{
                    classic: "classic";
                    members: "members";
                }>;
                name: z.ZodString;
                dataMessageType: z.ZodLiteral<"office.snapshot">;
                dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                ui: z.ZodObject<{
                    slots: z.ZodArray<z.ZodString>;
                    actions: z.ZodArray<z.ZodString>;
                    localControls: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            reasonCode: z.ZodEnum<{
                INVALID_MESSAGE: "INVALID_MESSAGE";
                INVALID_REPLY: "INVALID_REPLY";
                OFFICE_NOT_INITIALIZED: "OFFICE_NOT_INITIALIZED";
                ACTOR_NOT_FOUND: "ACTOR_NOT_FOUND";
                INVALID_BINDING: "INVALID_BINDING";
                OFFICE_LIMIT: "OFFICE_LIMIT";
                CACHE_FULL: "CACHE_FULL";
                STALE_SEQ: "STALE_SEQ";
                DUPLICATE_SEQ: "DUPLICATE_SEQ";
                SEQ_CONFLICT: "SEQ_CONFLICT";
                REQUEST_TIMEOUT: "REQUEST_TIMEOUT";
                NO_RECEIVER: "NO_RECEIVER";
                RECEIVER_UNAVAILABLE: "RECEIVER_UNAVAILABLE";
                BUSINESS_QUEUE_FULL: "BUSINESS_QUEUE_FULL";
                DECISION_DUPLICATE: "DECISION_DUPLICATE";
                DECISION_EXPIRED: "DECISION_EXPIRED";
                DECISION_QUEUE_FULL: "DECISION_QUEUE_FULL";
                SERVER_CLOSING: "SERVER_CLOSING";
                CALLER_DISCONNECTED: "CALLER_DISCONNECTED";
                SCENE_SYNC_FAILED: "SCENE_SYNC_FAILED";
                BUSINESS_ERROR: "BUSINESS_ERROR";
                UI_REQUEST_EXPIRED: "UI_REQUEST_EXPIRED";
                UI_QUEUE_FULL: "UI_QUEUE_FULL";
                UI_WAIT_BUSY: "UI_WAIT_BUSY";
                UNSUPPORTED_UI_ACTION: "UNSUPPORTED_UI_ACTION";
                SNAPSHOT_REQUIRED: "SNAPSHOT_REQUIRED";
                AUTH_FAILED: "AUTH_FAILED";
                FORBIDDEN: "FORBIDDEN";
                NOT_FOUND: "NOT_FOUND";
                MESSAGE_TOO_LARGE: "MESSAGE_TOO_LARGE";
                INTERNAL_ERROR: "INTERNAL_ERROR";
                REQUEST_CLOSED: "REQUEST_CLOSED";
                CHAT_NOT_CONFIGURED: "CHAT_NOT_CONFIGURED";
                CHAT_UPSTREAM_ERROR: "CHAT_UPSTREAM_ERROR";
                CHAT_TIMEOUT: "CHAT_TIMEOUT";
                CONVERSATION_NOT_FOUND: "CONVERSATION_NOT_FOUND";
                LAYOUT_CONFLICT: "LAYOUT_CONFLICT";
            }>;
            details: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>;
            issues: z.ZodDefault<z.ZodArray<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>>;
        }, z.core.$strict>]>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare function officeResultSchema(type: OfficeRequest['type'], teamSpecific?: boolean): z.ZodObject<{
    currentLayoutId: z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>;
    revision: z.ZodNumber;
    layouts: z.ZodArray<z.ZodObject<{
        id: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        name: z.ZodString;
        dataMessageType: z.ZodLiteral<"office.snapshot">;
        dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodString>;
            actions: z.ZodArray<z.ZodString>;
            localControls: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict> | z.ZodObject<{
    teamId: z.ZodString;
    conversationId: z.ZodString;
    forwarded: z.ZodNumber;
}, z.core.$strict> | z.ZodObject<{
    snapshot: z.ZodObject<{
        schemaVersion: z.ZodLiteral<"1.0">;
        seq: z.ZodNumber;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>;
        conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                insights: z.ZodOptional<z.ZodObject<{
                    scope: z.ZodEnum<{
                        conversation: "conversation";
                        office: "office";
                    }>;
                    updatedAt: z.ZodISODateTime;
                    periods: z.ZodArray<z.ZodObject<{
                        id: z.ZodEnum<{
                            last7Days: "last7Days";
                            last30Days: "last30Days";
                        }>;
                        label: z.ZodString;
                        metrics: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            label: z.ZodString;
                            value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                            unit: z.ZodDefault<z.ZodString>;
                            changePercent: z.ZodOptional<z.ZodNumber>;
                            sentiment: z.ZodDefault<z.ZodEnum<{
                                positive: "positive";
                                negative: "negative";
                                neutral: "neutral";
                            }>>;
                        }, z.core.$strict>>;
                        blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            type: z.ZodLiteral<"trend">;
                            unit: z.ZodDefault<z.ZodString>;
                            points: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"bars">;
                            unit: z.ZodDefault<z.ZodString>;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"distribution">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                value: z.ZodNumber;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>, z.ZodObject<{
                            type: z.ZodLiteral<"activity">;
                            items: z.ZodArray<z.ZodObject<{
                                label: z.ZodString;
                                occurredAt: z.ZodISODateTime;
                                status: z.ZodEnum<{
                                    completed: "completed";
                                    running: "running";
                                    blocked: "blocked";
                                    failed: "failed";
                                }>;
                            }, z.core.$strict>>;
                            id: z.ZodString;
                            title: z.ZodString;
                        }, z.core.$strict>], "type">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                role: z.ZodDefault<z.ZodString>;
                online: z.ZodDefault<z.ZodBoolean>;
            }, z.core.$strict>>>;
            tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                status: z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>;
                updatedAt: z.ZodISODateTime;
                assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                summary: z.ZodDefault<z.ZodString>;
            }, z.core.$strict>>>;
            events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    note: "note";
                    "task.assigned": "task.assigned";
                    "task.started": "task.started";
                    "task.blocked": "task.blocked";
                    "task.completed": "task.completed";
                }>;
                summary: z.ZodString;
                occurredAt: z.ZodISODateTime;
                taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            }, z.core.$strict>>>;
            whiteboard: z.ZodDefault<z.ZodObject<{
                template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                title: z.ZodDefault<z.ZodString>;
                status: z.ZodDefault<z.ZodEnum<{
                    completed: "completed";
                    running: "running";
                    blocked: "blocked";
                    failed: "failed";
                    queued: "queued";
                }>>;
                tagline: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
                note: z.ZodDefault<z.ZodString>;
                link: z.ZodDefault<z.ZodObject<{
                    label: z.ZodDefault<z.ZodString>;
                    url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                }, z.core.$strict>>;
                steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        system: z.ZodDefault<z.ZodObject<{
            cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
            networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    runtime: z.ZodObject<{
        available: z.ZodBoolean;
        selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
        actors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            presentation: z.ZodObject<{
                status: z.ZodEnum<{
                    thinking: "thinking";
                    idle: "idle";
                    working: "working";
                }>;
                title: z.ZodString;
                sourceRevision: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        objects: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            templateId: z.ZodString;
            stateRevision: z.ZodNumber;
            interactions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                requiresHome: z.ZodBoolean;
                actorIds: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        pendingDecisions: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict> | z.ZodObject<{
    teamId: z.ZodString;
    seq: z.ZodNumber;
    status: z.ZodEnum<{
        applied: "applied";
        cached: "cached";
        ignored: "ignored";
    }>;
    reasonCode: z.ZodOptional<z.ZodEnum<{
        STALE_SEQ: "STALE_SEQ";
        DUPLICATE_SEQ: "DUPLICATE_SEQ";
    }>>;
}, z.core.$strict> | z.ZodObject<{
    teamId: z.ZodString;
    conversationId: z.ZodString;
    decisionId: z.ZodString;
    choiceId: z.ZodString;
    label: z.ZodString;
}, z.core.$strict> | z.ZodObject<{
    layouts: z.ZodArray<z.ZodObject<{
        id: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        name: z.ZodString;
        dataMessageType: z.ZodLiteral<"office.snapshot">;
        dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodString>;
            actions: z.ZodArray<z.ZodString>;
            localControls: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    scene: z.ZodObject<{
        protocolVersion: z.ZodLiteral<"2.0">;
        command: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        batch: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        capabilities: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            participants: z.ZodDefault<z.ZodObject<{
                min: z.ZodNumber;
                max: z.ZodNumber;
                roles: z.ZodArray<z.ZodObject<{
                    role: z.ZodString;
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                }, z.core.$strict>>;
                rules: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        actors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
        }, z.core.$strict>>;
        objects: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
            stateSchema: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>;
            interactions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                requiresHome: z.ZodBoolean;
                actorIds: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    ui: z.ZodObject<{
        slots: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            persistent: z.ZodBoolean;
            update: z.ZodString;
        }, z.core.$strict>>;
        actions: z.ZodArray<z.ZodString>;
        actionSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        presentationSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        whiteboardSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
    }, z.core.$strict>;
    chat: z.ZodObject<{
        version: z.ZodLiteral<"1.0">;
        browserPath: z.ZodLiteral<"/api/pixoffice/chat">;
        method: z.ZodLiteral<"POST">;
        upstream: z.ZodObject<{
            configuredBy: z.ZodLiteral<"offices.initialize.chat.url">;
            direction: z.ZodLiteral<"pixoffice-server-to-chat-service">;
        }, z.core.$strict>;
        identity: z.ZodArray<z.ZodString>;
        requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        operations: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                send: "send";
                history: "history";
                resume: "resume";
                cancel: "cancel";
            }>;
            requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            responseContentType: z.ZodEnum<{
                "application/json": "application/json";
                "application/x-ndjson": "application/x-ndjson";
            }>;
            responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            timeoutMs: z.ZodNumber;
        }, z.core.$strict>>;
        stream: z.ZodObject<{
            eventSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            resumeFirstEvents: z.ZodArray<z.ZodString>;
            terminalEvents: z.ZodArray<z.ZodString>;
            terminalSnapshotStates: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        limits: z.ZodObject<{
            requestBytes: z.ZodNumber;
            historyResponseBytes: z.ZodNumber;
            replyCharacters: z.ZodNumber;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    supportedMessages: z.ZodArray<z.ZodString>;
    http: z.ZodObject<{
        path: z.ZodLiteral<"/api/pixoffice/messages">;
        method: z.ZodLiteral<"POST">;
        authentication: z.ZodLiteral<"bearer">;
        requestBytes: z.ZodNumber;
        businessTimeoutMs: z.ZodNumber;
    }, z.core.$strict>;
    animation: z.ZodObject<{
        requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        delivery: z.ZodLiteral<"best-effort">;
        completionAcknowledged: z.ZodLiteral<false>;
    }, z.core.$strict>;
    requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
    responses: z.ZodObject<{
        envelope: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        success: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        error: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        operations: z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            scope: z.ZodEnum<{
                office: "office";
                workspace: "workspace";
                operation: "operation";
            }>;
            codes: z.ZodArray<z.ZodNumber>;
            dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    rules: z.ZodArray<z.ZodString>;
}, z.core.$strict> | z.ZodObject<{
    capabilities: z.ZodObject<{
        layouts: z.ZodArray<z.ZodObject<{
            id: z.ZodEnum<{
                classic: "classic";
                members: "members";
            }>;
            name: z.ZodString;
            dataMessageType: z.ZodLiteral<"office.snapshot">;
            dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            ui: z.ZodObject<{
                slots: z.ZodArray<z.ZodString>;
                actions: z.ZodArray<z.ZodString>;
                localControls: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        scene: z.ZodObject<{
            protocolVersion: z.ZodLiteral<"2.0">;
            command: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            batch: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            capabilities: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                params: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                participants: z.ZodDefault<z.ZodObject<{
                    min: z.ZodNumber;
                    max: z.ZodNumber;
                    roles: z.ZodArray<z.ZodObject<{
                        role: z.ZodString;
                        min: z.ZodNumber;
                        max: z.ZodNumber;
                    }, z.core.$strict>>;
                    rules: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            actors: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                templateId: z.ZodString;
            }, z.core.$strict>>;
            objects: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                templateId: z.ZodString;
                stateSchema: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>>;
                interactions: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    requiresHome: z.ZodBoolean;
                    actorIds: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                content: z.ZodString;
                persistent: z.ZodBoolean;
                update: z.ZodString;
            }, z.core.$strict>>;
            actions: z.ZodArray<z.ZodString>;
            actionSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            presentationSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            whiteboardSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        }, z.core.$strict>;
        chat: z.ZodObject<{
            version: z.ZodLiteral<"1.0">;
            browserPath: z.ZodLiteral<"/api/pixoffice/chat">;
            method: z.ZodLiteral<"POST">;
            upstream: z.ZodObject<{
                configuredBy: z.ZodLiteral<"offices.initialize.chat.url">;
                direction: z.ZodLiteral<"pixoffice-server-to-chat-service">;
            }, z.core.$strict>;
            identity: z.ZodArray<z.ZodString>;
            requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            operations: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<{
                    send: "send";
                    history: "history";
                    resume: "resume";
                    cancel: "cancel";
                }>;
                requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                responseContentType: z.ZodEnum<{
                    "application/json": "application/json";
                    "application/x-ndjson": "application/x-ndjson";
                }>;
                responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                timeoutMs: z.ZodNumber;
            }, z.core.$strict>>;
            stream: z.ZodObject<{
                eventSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                resumeFirstEvents: z.ZodArray<z.ZodString>;
                terminalEvents: z.ZodArray<z.ZodString>;
                terminalSnapshotStates: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            limits: z.ZodObject<{
                requestBytes: z.ZodNumber;
                historyResponseBytes: z.ZodNumber;
                replyCharacters: z.ZodNumber;
            }, z.core.$strict>;
            rules: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        supportedMessages: z.ZodArray<z.ZodString>;
        http: z.ZodObject<{
            path: z.ZodLiteral<"/api/pixoffice/messages">;
            method: z.ZodLiteral<"POST">;
            authentication: z.ZodLiteral<"bearer">;
            requestBytes: z.ZodNumber;
            businessTimeoutMs: z.ZodNumber;
        }, z.core.$strict>;
        animation: z.ZodObject<{
            requestSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            responseSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            delivery: z.ZodLiteral<"best-effort">;
            completionAcknowledged: z.ZodLiteral<false>;
        }, z.core.$strict>;
        requests: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        responses: z.ZodObject<{
            envelope: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            success: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            error: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            operations: z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                scope: z.ZodEnum<{
                    office: "office";
                    workspace: "workspace";
                    operation: "operation";
                }>;
                codes: z.ZodArray<z.ZodNumber>;
                dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    state: z.ZodObject<{
        layout: z.ZodObject<{
            currentLayoutId: z.ZodEnum<{
                classic: "classic";
                members: "members";
            }>;
            revision: z.ZodNumber;
        }, z.core.$strict>;
        chat: z.ZodObject<{
            configured: z.ZodBoolean;
        }, z.core.$strict>;
        offices: z.ZodArray<z.ZodObject<{
            snapshot: z.ZodObject<{
                schemaVersion: z.ZodLiteral<"1.0">;
                seq: z.ZodNumber;
                workspace: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                }, z.core.$strict>;
                conversations: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    employees: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        insights: z.ZodOptional<z.ZodObject<{
                            scope: z.ZodEnum<{
                                conversation: "conversation";
                                office: "office";
                            }>;
                            updatedAt: z.ZodISODateTime;
                            periods: z.ZodArray<z.ZodObject<{
                                id: z.ZodEnum<{
                                    last7Days: "last7Days";
                                    last30Days: "last30Days";
                                }>;
                                label: z.ZodString;
                                metrics: z.ZodArray<z.ZodObject<{
                                    id: z.ZodString;
                                    label: z.ZodString;
                                    value: z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>;
                                    unit: z.ZodDefault<z.ZodString>;
                                    changePercent: z.ZodOptional<z.ZodNumber>;
                                    sentiment: z.ZodDefault<z.ZodEnum<{
                                        positive: "positive";
                                        negative: "negative";
                                        neutral: "neutral";
                                    }>>;
                                }, z.core.$strict>>;
                                blocks: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    type: z.ZodLiteral<"trend">;
                                    unit: z.ZodDefault<z.ZodString>;
                                    points: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"bars">;
                                    unit: z.ZodDefault<z.ZodString>;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"distribution">;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        value: z.ZodNumber;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>, z.ZodObject<{
                                    type: z.ZodLiteral<"activity">;
                                    items: z.ZodArray<z.ZodObject<{
                                        label: z.ZodString;
                                        occurredAt: z.ZodISODateTime;
                                        status: z.ZodEnum<{
                                            completed: "completed";
                                            running: "running";
                                            blocked: "blocked";
                                            failed: "failed";
                                        }>;
                                    }, z.core.$strict>>;
                                    id: z.ZodString;
                                    title: z.ZodString;
                                }, z.core.$strict>], "type">>;
                            }, z.core.$strict>>;
                        }, z.core.$strict>>;
                        sceneActorId: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>>;
                        role: z.ZodDefault<z.ZodString>;
                        online: z.ZodDefault<z.ZodBoolean>;
                    }, z.core.$strict>>>;
                    tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodEnum<{
                            completed: "completed";
                            running: "running";
                            blocked: "blocked";
                            failed: "failed";
                            queued: "queued";
                        }>;
                        updatedAt: z.ZodISODateTime;
                        assigneeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                        summary: z.ZodDefault<z.ZodString>;
                    }, z.core.$strict>>>;
                    events: z.ZodDefault<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        kind: z.ZodEnum<{
                            note: "note";
                            "task.assigned": "task.assigned";
                            "task.started": "task.started";
                            "task.blocked": "task.blocked";
                            "task.completed": "task.completed";
                        }>;
                        summary: z.ZodString;
                        occurredAt: z.ZodISODateTime;
                        taskId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        employeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                        fromEmployeeId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                    }, z.core.$strict>>>;
                    whiteboard: z.ZodDefault<z.ZodObject<{
                        template: z.ZodDefault<z.ZodLiteral<"task-board-v1">>;
                        title: z.ZodDefault<z.ZodString>;
                        status: z.ZodDefault<z.ZodEnum<{
                            completed: "completed";
                            running: "running";
                            blocked: "blocked";
                            failed: "failed";
                            queued: "queued";
                        }>>;
                        tagline: z.ZodDefault<z.ZodString>;
                        description: z.ZodDefault<z.ZodString>;
                        note: z.ZodDefault<z.ZodString>;
                        link: z.ZodDefault<z.ZodObject<{
                            label: z.ZodDefault<z.ZodString>;
                            url: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>>;
                        }, z.core.$strict>>;
                        steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            title: z.ZodString;
                            progress: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>>;
                system: z.ZodDefault<z.ZodObject<{
                    cpuPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    memoryPercent: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                    networkKbps: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            runtime: z.ZodObject<{
                available: z.ZodBoolean;
                selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
                actors: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    templateId: z.ZodString;
                    position: z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>;
                    presentation: z.ZodObject<{
                        status: z.ZodEnum<{
                            thinking: "thinking";
                            idle: "idle";
                            working: "working";
                        }>;
                        title: z.ZodString;
                        sourceRevision: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
                objects: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                    templateId: z.ZodString;
                    stateRevision: z.ZodNumber;
                    interactions: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        requiresHome: z.ZodBoolean;
                        actorIds: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                pendingDecisions: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict> | z.ZodObject<{
    actions: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        action: z.ZodLiteral<"conversation.delete">;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"actor.inspect">;
        actorId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"employee.inspect">;
        employeeId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, ...z.ZodObject<{
        action: z.ZodLiteral<"task.start" | "task.block" | "task.complete">;
        taskId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>[], z.ZodObject<{
        action: z.ZodLiteral<"task.assign">;
        taskId: z.ZodString;
        assigneeId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        action: z.ZodLiteral<"dialog.action">;
        interactionId: z.ZodString;
        optionId: z.ZodString;
        id: z.ZodString;
        teamId: z.ZodString;
        conversationId: z.ZodString;
    }, z.core.$strict>], "action">>;
}, z.core.$strict> | z.ZodObject<{
    interactionId: z.ZodString;
    delivered: z.ZodLiteral<true>;
}, z.core.$strict>;
export declare function officeBrowserResultSchema(type: OfficeRequest['type'], teamSpecific?: boolean): z.ZodObject<{
    currentLayoutId: z.ZodEnum<{
        classic: "classic";
        members: "members";
    }>;
    revision: z.ZodNumber;
    layouts: z.ZodArray<z.ZodObject<{
        id: z.ZodEnum<{
            classic: "classic";
            members: "members";
        }>;
        name: z.ZodString;
        dataMessageType: z.ZodLiteral<"office.snapshot">;
        dataSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
        ui: z.ZodObject<{
            slots: z.ZodArray<z.ZodString>;
            actions: z.ZodArray<z.ZodString>;
            localControls: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict> | z.ZodObject<{
    id: z.ZodString;
    seq: z.ZodNumber;
    runtime: z.ZodObject<{
        available: z.ZodBoolean;
        selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
        actors: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            templateId: z.ZodString;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>;
            presentation: z.ZodObject<{
                status: z.ZodEnum<{
                    thinking: "thinking";
                    idle: "idle";
                    working: "working";
                }>;
                title: z.ZodString;
                sourceRevision: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        objects: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
            templateId: z.ZodString;
            stateRevision: z.ZodNumber;
            interactions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                requiresHome: z.ZodBoolean;
                actorIds: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        pendingDecisions: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict> | z.ZodObject<{
    offices: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        seq: z.ZodNumber;
        runtime: z.ZodObject<{
            available: z.ZodBoolean;
            selectedConversationId: z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>;
            actors: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                templateId: z.ZodString;
                position: z.ZodObject<{
                    x: z.ZodNumber;
                    y: z.ZodNumber;
                }, z.core.$strict>;
                presentation: z.ZodObject<{
                    status: z.ZodEnum<{
                        thinking: "thinking";
                        idle: "idle";
                        working: "working";
                    }>;
                    title: z.ZodString;
                    sourceRevision: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            objects: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                state: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<import("./schema.ts").JsonValue, unknown, z.core.$ZodTypeInternals<import("./schema.ts").JsonValue, unknown>>>>;
                templateId: z.ZodString;
                stateRevision: z.ZodNumber;
                interactions: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    requiresHome: z.ZodBoolean;
                    actorIds: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            pendingDecisions: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict> | z.ZodObject<{
    teamId: z.ZodString;
    seq: z.ZodNumber;
    status: z.ZodEnum<{
        applied: "applied";
        cached: "cached";
        ignored: "ignored";
    }>;
    reasonCode: z.ZodOptional<z.ZodEnum<{
        STALE_SEQ: "STALE_SEQ";
        DUPLICATE_SEQ: "DUPLICATE_SEQ";
    }>>;
}, z.core.$strict> | z.ZodObject<{
    teamId: z.ZodString;
    conversationId: z.ZodString;
    decisionId: z.ZodString;
    choiceId: z.ZodString;
    label: z.ZodString;
}, z.core.$strict>;
export declare function officeCapabilities(scene: z.infer<typeof officeSceneSchema>, options?: {
    businessTimeoutMs?: number;
    chatTimeoutMs?: number;
}): {
    layouts: {
        id: "classic" | "members";
        name: string;
        dataMessageType: "office.snapshot";
        dataSchema: Record<string, import("./schema.ts").JsonValue>;
        ui: {
            slots: string[];
            actions: string[];
            localControls: string[];
        };
    }[];
    scene: {
        protocolVersion: "2.0";
        command: Record<string, import("./schema.ts").JsonValue>;
        batch: Record<string, import("./schema.ts").JsonValue>;
        capabilities: {
            id: string;
            name: string;
            params: Record<string, import("./schema.ts").JsonValue>;
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
        actors: {
            id: string;
            name: string;
            templateId: string;
        }[];
        objects: {
            id: string;
            name: string;
            templateId: string;
            stateSchema: Record<string, import("./schema.ts").JsonValue>;
            interactions: {
                id: string;
                name: string;
                requiresHome: boolean;
                actorIds: string[];
            }[];
        }[];
    };
    ui: {
        slots: {
            id: string;
            content: string;
            persistent: boolean;
            update: string;
        }[];
        actions: string[];
        actionSchema: Record<string, import("./schema.ts").JsonValue>;
        presentationSchema: Record<string, import("./schema.ts").JsonValue>;
        whiteboardSchema: Record<string, import("./schema.ts").JsonValue>;
    };
    chat: {
        version: "1.0";
        browserPath: "/api/pixoffice/chat";
        method: "POST";
        upstream: {
            configuredBy: "offices.initialize.chat.url";
            direction: "pixoffice-server-to-chat-service";
        };
        identity: string[];
        requests: Record<string, import("./schema.ts").JsonValue>;
        operations: {
            type: "send" | "history" | "resume" | "cancel";
            requestSchema: Record<string, import("./schema.ts").JsonValue>;
            responseContentType: "application/json" | "application/x-ndjson";
            responseSchema: Record<string, import("./schema.ts").JsonValue>;
            timeoutMs: number;
        }[];
        stream: {
            eventSchema: Record<string, import("./schema.ts").JsonValue>;
            resumeFirstEvents: string[];
            terminalEvents: string[];
            terminalSnapshotStates: string[];
        };
        limits: {
            requestBytes: number;
            historyResponseBytes: number;
            replyCharacters: number;
        };
        rules: string[];
    };
    supportedMessages: string[];
    http: {
        path: "/api/pixoffice/messages";
        method: "POST";
        authentication: "bearer";
        requestBytes: number;
        businessTimeoutMs: number;
    };
    animation: {
        requestSchema: Record<string, import("./schema.ts").JsonValue>;
        responseSchema: Record<string, import("./schema.ts").JsonValue>;
        delivery: "best-effort";
        completionAcknowledged: false;
    };
    requests: Record<string, import("./schema.ts").JsonValue>;
    responses: {
        envelope: Record<string, import("./schema.ts").JsonValue>;
        success: Record<string, import("./schema.ts").JsonValue>;
        error: Record<string, import("./schema.ts").JsonValue>;
        operations: {
            type: string;
            scope: "office" | "workspace" | "operation";
            codes: number[];
            dataSchema: Record<string, import("./schema.ts").JsonValue>;
        }[];
    };
    rules: string[];
};
export type OfficeRequest = z.infer<typeof officeRequestSchema>;
export type OfficeMessage = z.infer<typeof officeMessageSchema>;
export type OfficeDelivery = z.infer<typeof officeDeliverySchema>;
export type OfficeReply = z.infer<typeof officeReplySchema>;
