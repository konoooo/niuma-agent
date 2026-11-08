import type { Persistence } from '../model.ts';
export declare function sceneStorageKey(sceneId: string, productNamespace?: string): string;
export declare function browserPersistence(storage: Storage, sceneId: string, productNamespace?: string): Persistence;
