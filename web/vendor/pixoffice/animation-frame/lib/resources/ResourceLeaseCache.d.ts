type Disposable = {
    dispose(): void | Promise<void>;
};
/** Scene and preview own separate leases; neither can unload the other's textures. */
export declare class ResourceLeaseCache<T extends Disposable> {
    private entries;
    private retiring;
    private load;
    private idleMs;
    constructor(load: (id: string) => Promise<T>, idleMs?: number);
    /** Hot replacement must retain lease ownership, not just reuse the global texture cache. */
    static retained<T extends Disposable>(load: (id: string) => Promise<T>, state?: {
        cache?: ResourceLeaseCache<T>;
    }): ResourceLeaseCache<T>;
    get(id: string): T | undefined;
    acquire(id: string): Promise<{
        value: T;
        release: () => void;
    }>;
    private evict;
    clearUnused(): void;
}
export {};
