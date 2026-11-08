import { z } from 'zod';
export declare const chatPath = "/api/pixoffice/chat";
export declare const maxChatReplyCharacters = 50000;
export declare const chatTimeoutMs = 180000;
export declare const maxChatRequestBytes = 524288;
export declare const maxChatHistoryBytes: number;
export declare const chatControlTimeoutMs = 15000;
export declare const officeChatConfigSchema: z.ZodObject<{
    url: z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodURL]>;
}, z.core.$strict>;
export type OfficeChatConfig = z.infer<typeof officeChatConfigSchema>;
export type ChatTurn = {
    role: 'user' | 'assistant';
    content: string;
};
export declare const chatRequestSchema: z.ZodObject<{
    type: z.ZodLiteral<"send">;
    turnId: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        content: z.ZodString;
    }, z.core.$strict>>;
    version: z.ZodLiteral<"1.0">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export declare const chatHistoryRequestSchema: z.ZodObject<{
    type: z.ZodLiteral<"history">;
    cursor: z.ZodDefault<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    version: z.ZodLiteral<"1.0">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>;
export declare const chatResumeRequestSchema: z.ZodObject<{
    type: z.ZodLiteral<"resume">;
    turnId: z.ZodString;
    version: z.ZodLiteral<"1.0">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>;
export declare const chatCancelRequestSchema: z.ZodObject<{
    type: z.ZodLiteral<"cancel">;
    turnId: z.ZodString;
    version: z.ZodLiteral<"1.0">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>;
export declare const chatOperationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"send">;
    turnId: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            user: "user";
            assistant: "assistant";
        }>;
        content: z.ZodString;
    }, z.core.$strict>>;
    version: z.ZodLiteral<"1.0">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"history">;
    cursor: z.ZodDefault<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    version: z.ZodLiteral<"1.0">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"resume">;
    turnId: z.ZodString;
    version: z.ZodLiteral<"1.0">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"cancel">;
    turnId: z.ZodString;
    version: z.ZodLiteral<"1.0">;
    teamId: z.ZodString;
    conversationId: z.ZodString;
}, z.core.$strict>], "type">;
export type ChatOperation = z.infer<typeof chatOperationSchema>;
export type ChatHistoryRequest = z.infer<typeof chatHistoryRequestSchema>;
export type ChatResumeRequest = z.infer<typeof chatResumeRequestSchema>;
export type ChatCancelRequest = z.infer<typeof chatCancelRequestSchema>;
export declare const chatHistoryTurnSchema: z.ZodObject<{
    id: z.ZodString;
    user: z.ZodString;
    assistant: z.ZodString;
    state: z.ZodEnum<{
        error: "error";
        complete: "complete";
        pending: "pending";
        stopped: "stopped";
    }>;
    error: z.ZodDefault<z.ZodString>;
}, z.core.$strict>;
export type ChatHistoryTurn = z.infer<typeof chatHistoryTurnSchema>;
export declare const chatHistoryPageSchema: z.ZodObject<{
    turns: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        user: z.ZodString;
        assistant: z.ZodString;
        state: z.ZodEnum<{
            error: "error";
            complete: "complete";
            pending: "pending";
            stopped: "stopped";
        }>;
        error: z.ZodDefault<z.ZodString>;
    }, z.core.$strict>>;
    nextCursor: z.ZodString;
    hasMore: z.ZodBoolean;
    activeTurnId: z.ZodDefault<z.ZodString>;
}, z.core.$strict>;
export type ChatHistoryPage = z.infer<typeof chatHistoryPageSchema>;
export declare const chatCancelResultSchema: z.ZodObject<{
    stopped: z.ZodLiteral<true>;
}, z.core.$strict>;
export declare const chatEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"status">;
    phase: z.ZodEnum<{
        thinking: "thinking";
        streaming: "streaming";
    }>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"delta">;
    text: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"done">;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
    message: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"snapshot">;
    text: z.ZodString;
    state: z.ZodEnum<{
        error: "error";
        complete: "complete";
        pending: "pending";
        stopped: "stopped";
    }>;
    message: z.ZodDefault<z.ZodString>;
}, z.core.$strict>], "type">;
export type ChatEvent = z.infer<typeof chatEventSchema>;
export declare const chatProtocolSchema: z.ZodObject<{
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
export declare function describeChatProtocol(timeoutMs?: number): {
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
export interface OfficeChatSource {
    readonly kind: string;
    readonly historyKey?: string;
    stream(request: ChatRequest, signal: AbortSignal): AsyncIterable<ChatEvent>;
    history?(request: ChatHistoryRequest, signal: AbortSignal): Promise<ChatHistoryPage>;
    resume?(request: ChatResumeRequest, signal: AbortSignal): AsyncIterable<ChatEvent>;
    cancel?(request: ChatCancelRequest, signal: AbortSignal): Promise<void>;
}
export declare function readChatEvents(body: ReadableStream<Uint8Array>, signal: AbortSignal): AsyncIterable<ChatEvent>;
