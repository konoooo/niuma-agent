import { createCharacterResources } from '@pixoffice/animation-frame/resources';
import { CharacterManifestSchema, characterFrameDependencies } from "./packSchema.js";
export const { configureCharacterResources, characterResourceUrl, loadCharacterRegistry, readCharacterManifest, characterAssets, getCharacterPack, acquireCharacterPacks } = createCharacterResources({
    parseManifest: data => CharacterManifestSchema.parse(data), dependencies: characterFrameDependencies, cacheData: import.meta.hot?.data,
});