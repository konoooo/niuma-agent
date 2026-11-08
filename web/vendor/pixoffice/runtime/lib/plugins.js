import { z } from 'zod';
import { SceneFault } from '@pixoffice/protocol';
import { jsonObjectSchema } from '@pixoffice/protocol/schema';
import { isCell, furnitureCells, sameCell } from "./map/furnitureGrid.js";
function validateTemplate(t) {
    const b = t.footprint;
    const fail = () => { throw new SceneFault('INVALID_TEMPLATE', `家具 ${t.id} 必须使用整数占地、入口格和使用格`); };
    if (!Object.values(b).every(Number.isInteger) || b.right <= b.left || b.bottom <= b.top || b.right - b.left > 128 || b.bottom - b.top > 128)
        fail();
    if (Object.values(t.anchors).some(p => !isCell(p)))
        fail();
    const body = furnitureCells(t);
    for (const interaction of Object.values(t.interactions ?? {})) {
        if (!t.anchors[interaction.anchor] || !interaction.approaches.length || interaction.approaches.some(a => !t.anchors[a]))
            fail();
        if (interaction.cells.some(p => !isCell(p) || !body.some(c => sameCell(c, p))))
            fail();
        if (interaction.approaches.some(a => body.some(c => sameCell(c, t.anchors[a]))))
            fail();
        const target = t.anchors[interaction.anchor];
        if (body.some(c => sameCell(c, target)) && !interaction.cells.some(c => sameCell(c, target)))
            fail();
        if (interaction.resource && t.resources[interaction.resource] !== undefined && t.resources[interaction.resource] !== 1)
            fail();
    }
}
export class PluginHost {
    entries = new Map();
    register(plugin) {
        if (plugin.apiVersion !== 1 || this.entries.has(plugin.id))
            throw new SceneFault('PLUGIN_CONFLICT', plugin.id);
        for (const dependency of plugin.dependencies ?? [])
            if (!this.entries.get(dependency)?.enabled)
                throw new SceneFault('MISSING_DEPENDENCY', dependency);
        const existing = [...this.entries.values()].flatMap(e => e.plugin.capabilities?.map(c => c.id) ?? []);
        const templates = [...this.entries.values()].flatMap(e => e.plugin.templates?.map(t => t.id) ?? []);
        const ids = plugin.capabilities?.map(c => c.id) ?? [];
        const templateIds = plugin.templates?.map(t => t.id) ?? [];
        if (new Set(ids).size !== ids.length || ids.some(id => existing.includes(id)) || new Set(templateIds).size !== templateIds.length || templateIds.some(id => templates.includes(id)))
            throw new SceneFault('PLUGIN_CONFLICT', plugin.id);
        plugin.templates?.forEach(validateTemplate);
        for (const template of plugin.templates ?? [])
            if (template.initialState !== undefined) {
                jsonObjectSchema.parse(template.initialState);
                plugin.stateSchemas?.[template.id]?.parse(template.initialState);
            }
        this.entries.set(plugin.id, { plugin, enabled: true });
    }
    capability(id) {
        for (const { plugin, enabled } of this.entries.values()) {
            const capability = plugin.capabilities?.find(c => c.id === id);
            if (capability && enabled)
                return { pluginId: plugin.id, capability };
        }
        throw new SceneFault('UNSUPPORTED_CAPABILITY', id);
    }
    template(id) {
        for (const { plugin, enabled } of this.entries.values()) {
            const template = plugin.templates?.find(t => t.id === id);
            if (template && enabled)
                return structuredClone(template);
        }
        throw new SceneFault('MISSING_TEMPLATE', id);
    }
    validateState(templateId, state) {
        for (const { plugin, enabled } of this.entries.values()) {
            const schema = plugin.stateSchemas?.[templateId];
            if (enabled && schema)
                return schema.parse(state);
        }
        throw new SceneFault('STATE_READONLY', templateId);
    }
    validateWorld(world) {
        for (const { plugin, enabled } of this.entries.values())
            if (enabled) {
                for (const prop of world.props) {
                    const schema = plugin.stateSchemas?.[prop.templateId];
                    if (schema)
                        prop.state = jsonObjectSchema.parse(schema.parse(prop.state));
                }
                plugin.validateWorld?.(structuredClone(world));
            }
    }
    setEnabled(id, enabled, inUse) {
        const entry = this.entries.get(id);
        if (!entry)
            throw new SceneFault('PLUGIN_NOT_FOUND', id);
        if (entry.enabled === enabled)
            return;
        if (!enabled && (inUse(id) || (entry.plugin.templates?.length ?? 0) > 0))
            throw new SceneFault('BUSY', '场景对象或活动正在使用此插件');
        if (!enabled && [...this.entries.values()].some(e => e.enabled && e.plugin.dependencies?.includes(id)))
            throw new SceneFault('DEPENDENCY_IN_USE', id);
        if (enabled && entry.plugin.dependencies?.some(d => !this.entries.get(d)?.enabled))
            throw new SceneFault('MISSING_DEPENDENCY', id);
        entry.enabled = enabled;
    }
    list() { return [...this.entries.values()].map(({ plugin: p, enabled }) => ({ id: p.id, name: p.name, version: p.version, enabled, capabilities: p.capabilities?.map(c => c.id) ?? [] })); }
    templates() { return structuredClone([...this.entries.values()].filter(e => e.enabled).flatMap(e => e.plugin.templates ?? [])); }
    describe() {
        return this.list().map(p => ({ ...p,
            stateSchemas: Object.fromEntries(Object.entries(this.entries.get(p.id).plugin.stateSchemas ?? {}).map(([id, schema]) => [id, z.toJSONSchema(schema, { io: 'input' })])),
            operations: p.enabled ? p.capabilities.map(id => { const { capability: c } = this.capability(id); return { id, name: c.name, params: z.toJSONSchema(c.params, { io: 'input' }), participants: c.participants ?? { min: 0, max: -1, roles: [], rules: [] } }; }) : [], }));
    }
}