import type { SceneRuntime } from '@pixoffice/runtime/SceneRuntime';
export declare function describeOfficeScene(runtime: SceneRuntime): {
    protocolVersion: "2.0";
    sceneId: string;
    command: Record<string, import("@pixoffice/protocol/schema").JsonValue>;
    batch: Record<string, import("@pixoffice/protocol/schema").JsonValue>;
    actors: {
        id: string;
        name: string;
        templateId: string;
        position: {
            x: number;
            y: number;
        };
        presentation: {
            status: "idle" | "working" | "thinking";
            title: string;
            sourceRevision: number;
        };
    }[];
    objects: {
        id: string;
        name: string;
        templateId: string;
        state: Record<string, import("@pixoffice/protocol/schema").JsonValue>;
        stateRevision: number;
        stateSchema: Record<string, import("@pixoffice/protocol/schema").JsonValue>;
        interactions: {
            id: string;
            name: string;
            requiresHome: boolean;
            actorIds: string[];
        }[];
    }[];
    capabilities: {
        id: string;
        name: string;
        params: Record<string, import("@pixoffice/protocol/schema").JsonValue>;
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
};
