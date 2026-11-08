import type { Claim } from './model.ts';
export declare class ResourceManager {
    private capacities;
    private owners;
    define(id: string, capacity?: number): void;
    validate(claims: Claim[]): void;
    available(claims: Claim[]): boolean;
    acquire(owner: string, claims: Claim[]): boolean;
    release(owner: string): void;
    snapshot(): {
        resource: string;
        capacity: number;
        holders: string[];
    }[];
}
