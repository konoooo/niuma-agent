import { SceneRuntime } from "./SceneRuntime.js";
import { GridNavigation } from "./navigation.js";
import { scenePackManifestSchema } from "./scenePack.js";
export function createSceneRuntime(pack, options = {}) {
    scenePackManifestSchema.parse(pack.manifest);
    return new SceneRuntime({
        ...options, world: pack.createWorld(options.sceneId), plugins: [...pack.plugins],
        supportsPose: options.supportsPose ?? pack.supportsPose,
        createNavigation: options.createNavigation ?? (templates => new GridNavigation(templates)),
    });
}