import { createSceneRuntime } from '@pixoffice/runtime';
import { assertProductAppearance, sceneProductSchema, visualAssetManifestSchema } from '@pixoffice/contracts';
import { SceneView } from "./SceneView.js";
/** The host selects a trusted module. Unselected scenes are never imported. */
export async function mountScene(host, load, options = {}) {
    const signal = options.signal ?? new AbortController().signal;
    signal.throwIfAborted();
    const assembly = await load(signal);
    signal.throwIfAborted();
    const product = assembly.product && sceneProductSchema.parse(assembly.product);
    const runtime = createSceneRuntime(assembly.scene, { ...assembly.runtimeOptions, ...options.runtime });
    let view, observer, disposed = false;
    const dispose = () => {
        if (disposed)
            return;
        disposed = true;
        signal.removeEventListener('abort', dispose);
        observer?.disconnect();
        try {
            view?.destroy();
        }
        finally {
            runtime.dispose();
        }
    };
    signal.addEventListener('abort', dispose, { once: true });
    try {
        view = new SceneView({ ...options.view, ...assembly, runtime,
            resolveAppearance: async (id) => {
                const manifest = await assembly.resolveAppearance(id);
                if (product)
                    assertProductAppearance(product, manifest);
                return manifest;
            },
            onStep: elapsed => options.step ? options.step(runtime, elapsed) : runtime.tick(elapsed), dispatchCommand: command => runtime.submit(command) });
        await view.init(host, Math.max(1, host.clientWidth), Math.max(1, host.clientHeight));
        signal.throwIfAborted();
        const mountedView = view;
        observer = new ResizeObserver(() => mountedView.resize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight)));
        observer.observe(host);
        return { runtime, view, dispose };
    }
    catch (error) {
        dispose();
        throw error;
    }
}
/** URLs are host-owned, not guessed from a scene name or a global registry. */
export function createAppearanceResolver(urlForId, signal) {
    const cache = new Map();
    return (id) => {
        const cached = cache.get(id);
        if (cached)
            return cached;
        const result = (async () => {
            const url = urlForId(id);
            const response = await fetch(url, { signal });
            if (!response.ok)
                throw new Error(`Appearance ${id}: HTTP ${response.status}`);
            const manifest = visualAssetManifestSchema.parse(await response.json());
            manifest.source.uri = new URL(manifest.source.uri, response.url || url).href;
            return manifest;
        })().catch(error => { cache.delete(id); throw error; });
        cache.set(id, result);
        return result;
    };
}