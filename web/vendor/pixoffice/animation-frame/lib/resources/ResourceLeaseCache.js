/** Scene and preview own separate leases; neither can unload the other's textures. */
export class ResourceLeaseCache {
    entries = new Map();
    retiring = new Map();
    load;
    idleMs;
    constructor(load, idleMs = 30000) { this.load = load; this.idleMs = idleMs; }
    /** Hot replacement must retain lease ownership, not just reuse the global texture cache. */
    static retained(load, state) {
        const cache = state?.cache ?? new ResourceLeaseCache(load);
        cache.load = load;
        if (state)
            state.cache = cache;
        return cache;
    }
    get(id) { return this.entries.get(id)?.value; }
    async acquire(id) {
        let entry = this.entries.get(id);
        if (!entry) {
            const created = { references: 0, promise: (this.retiring.get(id) ?? Promise.resolve()).then(() => this.load(id)) };
            created.promise = created.promise.then(value => { created.value = value; return value; }).catch(error => {
                if (this.entries.get(id) === created)
                    this.entries.delete(id);
                throw error;
            });
            entry = created;
            this.entries.set(id, entry);
        }
        if (entry.timer)
            clearTimeout(entry.timer);
        entry.references++;
        let value;
        try {
            value = await entry.promise;
        }
        catch (error) {
            entry.references--;
            throw error;
        }
        let released = false;
        return { value, release: () => {
                if (released)
                    return;
                released = true;
                entry.references--;
                if (entry.references === 0)
                    entry.timer = setTimeout(() => this.evict(id, entry), this.idleMs);
            } };
    }
    evict(id, entry) {
        if (entry.references || this.entries.get(id) !== entry)
            return;
        this.entries.delete(id);
        if (entry.timer)
            clearTimeout(entry.timer);
        const retirement = Promise.resolve().then(() => entry.value?.dispose()).catch(error => {
            console.warn(`[Characters] Resource disposal failed: ${id}`, error);
        }).finally(() => { if (this.retiring.get(id) === retirement)
            this.retiring.delete(id); });
        this.retiring.set(id, retirement);
    }
    clearUnused() { for (const [id, entry] of this.entries)
        this.evict(id, entry); }
}