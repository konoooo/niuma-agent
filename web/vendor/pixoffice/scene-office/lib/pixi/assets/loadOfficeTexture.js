import { Assets } from 'pixi.js';
let assetBase = '/assets/office';
let started = false;
let schedule = job => job();
export function configureOfficeAssets(options) {
    const next = options.baseUrl.replace(/\/$/, '');
    if (started && assetBase !== next)
        throw new Error('Configure office resources before loading');
    assetBase = next;
    if (options.schedule)
        schedule = options.schedule;
}
export function loadOfficeTexture(alias, name, background = false) {
    started = true;
    if (!Assets.resolver.hasKey(alias))
        Assets.add({ alias, src: `${assetBase}/${name}.webp` });
    const load = async () => {
        let texture;
        try {
            texture = await Assets.load(alias);
        }
        catch {
            texture = await Assets.load(`${assetBase}/${name}.png`);
        }
        if (!texture?.source)
            throw new Error(`Invalid office texture: ${name}`);
        texture.source.scaleMode = 'linear';
        return texture;
    };
    // The background must not wait behind sidebar character downloads.
    return background ? load() : schedule(load);
}