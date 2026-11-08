import { resolveVisualRequest } from "./AnimationPresenter.js";
export class AnimationResources {
    leases = new Map();
    ready = new Set();
    released = false;
    pending;
    get(id) { return this.leases.get(id); }
    get size() { return this.leases.size; }
    get completed() { return this.ready.size; }
    get isComplete() { return this.completed === this.size; }
    static async load(actors, registry, resolve, signal, report) {
        const resources = new AnimationResources();
        const results = await Promise.allSettled([...new Set(actors.map(actor => actor.appearanceId))].map(async (id) => {
            const manifest = await resolve(id);
            signal.throwIfAborted();
            const lease = await registry.acquire(manifest, signal);
            resources.leases.set(id, lease);
            const requests = actors.filter(actor => actor.appearanceId === id).map(actor => resolveVisualRequest(lease.manifest, actor.intent));
            await lease.prepare(requests, signal);
            signal.throwIfAborted();
            report(id);
        }));
        const failed = results.find(result => result.status === 'rejected');
        if (failed?.status === 'rejected' || signal.aborted) {
            resources.release();
            throw failed?.status === 'rejected' ? failed.reason : signal.reason;
        }
        return resources;
    }
    prepareAll(signal, report) {
        if (this.released)
            return Promise.reject(new Error('Animation resources released'));
        if (this.pending)
            return this.pending;
        this.pending = (async () => {
            const results = await Promise.allSettled([...this.leases].map(async ([id, lease]) => {
                if (this.ready.has(id))
                    return;
                const requests = lease.manifest.capabilities.combinations.map(variantIds => {
                    const variant = lease.manifest.capabilities.variants.find(v => v.variantId === variantIds[0]);
                    return { variantIds, poseId: variant.poseId, view: variant.view };
                });
                await lease.prepare(requests, signal);
                signal.throwIfAborted();
                if (this.released)
                    throw new Error('Animation resources released');
                this.ready.add(id);
                report();
            }));
            const failed = results.find(result => result.status === 'rejected');
            if (failed?.status === 'rejected')
                throw failed.reason;
        })().finally(() => { this.pending = undefined; });
        return this.pending;
    }
    release() {
        if (this.released)
            return;
        this.released = true;
        for (const [id, lease] of this.leases) {
            try {
                lease.release();
            }
            catch (error) {
                console.warn(`[AnimationResources] release failed: ${id}`, error);
            }
        }
    }
}