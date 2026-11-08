import { SceneFault } from '@pixoffice/protocol';
export class ResourceManager {
    capacities = new Map();
    owners = new Map();
    define(id, capacity = 1) {
        if (!Number.isInteger(capacity) || capacity < 1)
            throw new SceneFault('INVALID_RESOURCE', id);
        this.capacities.set(id, capacity);
    }
    validate(claims) {
        const seen = new Set();
        for (const c of claims) {
            if (seen.has(c.resource) || !this.capacities.has(c.resource) || !Number.isInteger(c.units) || c.units < 1 || c.units > this.capacities.get(c.resource))
                throw new SceneFault('INVALID_RESOURCE', c.resource);
            seen.add(c.resource);
        }
    }
    available(claims) {
        this.validate(claims);
        return claims.every(c => {
            const used = [...this.owners.values()].flat().filter(v => v.resource === c.resource).reduce((n, v) => n + v.units, 0);
            return used + c.units <= this.capacities.get(c.resource);
        });
    }
    acquire(owner, claims) {
        if (this.owners.has(owner))
            throw new SceneFault('RESOURCE_OWNER_EXISTS', owner);
        if (!this.available(claims))
            return false;
        this.owners.set(owner, structuredClone(claims));
        return true;
    }
    release(owner) { this.owners.delete(owner); }
    snapshot() { return [...this.capacities].map(([resource, capacity]) => ({ resource, capacity, holders: [...this.owners].filter(([, claims]) => claims.some(c => c.resource === resource)).map(([id]) => id) })); }
}