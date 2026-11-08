import { z } from 'zod';
export declare const agentInsightBlockSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>], "type">;
export declare const agentInsightsSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type AgentInsights = z.input<typeof agentInsightsSchema>;
export type AgentInsightBlock = z.input<typeof agentInsightBlockSchema>;
