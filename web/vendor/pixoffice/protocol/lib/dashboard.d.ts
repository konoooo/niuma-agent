import { z } from 'zod';
export declare const maxOfficeMembers = 6;
export declare const officeMemberLimitMessage = "\u529E\u516C\u5BA4\u5DF2\u6EE1\uFF0C\u6700\u591A 6 \u4F4D\u6210\u5458";
export declare function officeMemberOccupancy(conversations: readonly {
    employees: readonly {
        id: string;
        sceneActorId?: string;
    }[];
}[]): {
    memberIds: Set<string>;
    actorIds: Set<string>;
};
export declare const officeMemberInputSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodDefault<z.ZodString>;
    sceneActorId: z.ZodString;
}, z.core.$strict>;
export type OfficeMemberInput = z.infer<typeof officeMemberInputSchema>;
export declare const dashboardSnapshotSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<"1.0">;
    conversationId: z.ZodOptional<z.ZodString>;
    seq: z.ZodOptional<z.ZodNumber>;
    workspace: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>;
    employees: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sceneActorId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodLiteral<"">]>>;
        name: z.ZodString;
        role: z.ZodOptional<z.ZodString>;
        online: z.ZodOptional<z.ZodBoolean>;
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
    }, z.core.$strict>>;
    tasks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        assigneeId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<{
            completed: "completed";
            running: "running";
            blocked: "blocked";
            failed: "failed";
            queued: "queued";
        }>;
        progress: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        updatedAt: z.ZodISODateTime;
        summary: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    events: z.ZodArray<z.ZodObject<{
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
        taskId: z.ZodOptional<z.ZodString>;
        employeeId: z.ZodOptional<z.ZodString>;
        fromEmployeeId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    system: z.ZodOptional<z.ZodObject<{
        cpuPercent: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        memoryPercent: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
        networkKbps: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<-1>, z.ZodNumber]>>;
    }, z.core.$strict>>;
    whiteboard: z.ZodOptional<z.ZodObject<{
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
export declare function validateDashboardSnapshot(snapshot: {
    employees: {
        id: string;
    }[];
    tasks: {
        id: string;
        assigneeId?: string;
    }[];
}, context: z.RefinementCtx): void;
export type DashboardSnapshot = z.input<typeof dashboardSnapshotSchema>;
export type DashboardConversation = Pick<DashboardSnapshot, 'employees' | 'tasks' | 'events' | 'whiteboard'> & {
    id: string;
    title: string;
};
export type DashboardTask = DashboardSnapshot['tasks'][number];
export type DashboardAction = {
    type: 'task.start' | 'task.block' | 'task.complete';
    taskId: string;
} | {
    type: 'task.assign';
    taskId: string;
    assigneeId: string;
};
export interface OfficeDataSource {
    readonly kind: string;
    readonly canExecute?: boolean;
    readonly replayEvents?: boolean;
    getSnapshot(): Promise<DashboardSnapshot>;
    getConversations?(): readonly DashboardConversation[];
    selectConversation?(id: string): void;
    createEmployee?(input: OfficeMemberInput): Promise<void>;
    subscribe(listener: () => void): () => void;
    execute(action: DashboardAction): Promise<void>;
}
export declare function parseDashboardSnapshot(value: unknown): DashboardSnapshot;
