import { z } from 'zod';
import type { ActivityPlan, ObjectStateChange, Template, World } from './model.ts';
export type PluginContext = {
    world: World;
    participants: {
        entityId: string;
        role: string;
    }[];
    template: (id: string) => Template;
};
export type Capability = {
    id: string;
    name: string;
    params: z.ZodType;
    participants?: {
        min: number;
        max: number;
        roles: {
            role: string;
            min: number;
            max: number;
        }[];
        rules: string[];
    };
    build(context: PluginContext, params: unknown): ActivityPlan;
    /** Pure state proposals, validated and committed together before releasing activity claims. */
    complete?(context: PluginContext, params: unknown): ObjectStateChange[];
};
export type ScenePlugin = {
    id: string;
    name: string;
    version: string;
    apiVersion: 1;
    dependencies?: string[];
    templates?: Template[];
    capabilities?: Capability[];
    stateSchemas?: Record<string, z.ZodType>;
    /** Scene-owned structural invariants, independent of editable geometry. */
    validateWorld?(world: World): void;
};
export declare class PluginHost {
    private entries;
    register(plugin: ScenePlugin): void;
    capability(id: string): {
        pluginId: string;
        capability: Capability;
    };
    template(id: string): Template;
    validateState(templateId: string, state: unknown): Record<string, unknown>;
    validateWorld(world: World): void;
    setEnabled(id: string, enabled: boolean, inUse: (id: string) => boolean): void;
    list(): {
        id: string;
        name: string;
        version: string;
        enabled: boolean;
        capabilities: string[];
    }[];
    templates(): Template[];
    describe(): {
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
}
