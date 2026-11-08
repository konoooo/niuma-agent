import { z } from 'zod';
export declare const whiteboardTaskBoardSchema: z.ZodObject<{
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
}, z.core.$strict>;
type WhiteboardInput = z.input<typeof whiteboardTaskBoardSchema>;
export type WhiteboardTaskBoardData = WhiteboardInput & Required<Pick<WhiteboardInput, 'template' | 'title' | 'status' | 'steps'>>;
export declare const emptyWhiteboard: () => {
    template: "task-board-v1";
    title: string;
    status: "completed" | "running" | "blocked" | "failed" | "queued";
    tagline: string;
    description: string;
    note: string;
    link: {
        label: string;
        url: string;
    };
    steps: {
        id: string;
        title: string;
        progress: number;
    }[];
};
export declare const officeUiManifest: {
    readonly slots: readonly [{
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
    readonly actions: readonly ["actor.inspect", "employee.inspect", "task.start", "task.block", "task.complete", "task.assign", "dialog.action", "conversation.delete"];
};
export {};
