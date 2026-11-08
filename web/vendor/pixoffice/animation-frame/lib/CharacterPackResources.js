import { Assets, Rectangle, Texture } from 'pixi.js';
import { characterFrameDependencies } from "./packSchema.js";
import { textureLoadQueue } from "./AssetLoadQueue.js";
/** Owns progressive atlas pages; callers retain the pack through ResourceLeaseCache. */
export class CharacterPackResources {
    manifest;
    pageUrls;
    textures = new Map();
    pages = new Map();
    pending = new Map();
    disposed = false;
    disposal;
    dependencies;
    constructor(manifest, pageUrls, dependencies = characterFrameDependencies) {
        this.manifest = manifest;
        this.pageUrls = pageUrls;
        this.dependencies = dependencies;
    }
    get isComplete() { return this.pages.size === this.manifest.pages.length; }
    ensureStartup() {
        return this.ensurePages(this.manifest.pages.flatMap((page, index) => page.group === 'startup' ? [index] : []));
    }
    ensureClips(names) {
        return this.ensurePages(this.dependencies(this.manifest, names).map(key => this.manifest.frames[key].page));
    }
    ensureAll() { return this.ensurePages(this.manifest.pages.map((_, index) => index)); }
    async ensurePages(indices) {
        if (this.disposed)
            throw new Error('Character pack disposed');
        const results = await Promise.allSettled([...new Set(indices)].map(index => this.loadPage(index)));
        const failed = results.find(result => result.status === 'rejected');
        if (failed?.status === 'rejected')
            throw failed.reason;
    }
    loadPage(index) {
        if (this.pages.has(index))
            return Promise.resolve();
        const existing = this.pending.get(index);
        if (existing)
            return existing;
        const pageUrl = this.pageUrls[index];
        const pending = textureLoadQueue.run(async () => {
            if (this.disposed)
                throw new Error('Character pack disposed');
            const texture = await Assets.load(pageUrl);
            const expected = this.manifest.pages[index];
            if (texture.width !== expected.width || texture.height !== expected.height) {
                await Assets.unload(pageUrl);
                throw new Error(`Character atlas dimensions mismatch: ${pageUrl}`);
            }
            this.pages.set(index, texture);
            if (this.disposed)
                throw new Error('Character pack disposed');
            for (const [key, frame] of Object.entries(this.manifest.frames)) {
                if (frame.page !== index)
                    continue;
                this.textures.set(key, new Texture({ source: texture.source,
                    frame: new Rectangle(frame.rect.x, frame.rect.y, frame.rect.width, frame.rect.height),
                    orig: new Rectangle(0, 0, this.manifest.canvas.width, this.manifest.canvas.height),
                    trim: new Rectangle(frame.offset.x, frame.offset.y, frame.rect.width, frame.rect.height),
                }));
            }
        }).finally(() => { this.pending.delete(index); });
        this.pending.set(index, pending);
        return pending;
    }
    dispose() {
        if (this.disposal)
            return this.disposal;
        this.disposed = true;
        return this.disposal = (async () => {
            await Promise.allSettled([...this.pending.values()]);
            for (const texture of this.textures.values())
                texture.destroy();
            this.textures.clear();
            await Promise.allSettled([...this.pages.keys()].map(index => Assets.unload(this.pageUrls[index])));
            this.pages.clear();
        })();
    }
}