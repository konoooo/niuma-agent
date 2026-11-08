/** Bound texture downloads across the office and sidebar without serializing whole packs. */
export declare class AssetLoadQueue {
    private active;
    private pending;
    private concurrency;
    constructor(concurrency?: number);
    run<T>(load: () => Promise<T>): Promise<T>;
    private drain;
}
export declare const textureLoadQueue: AssetLoadQueue;
