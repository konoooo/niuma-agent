import { type Texture } from 'pixi.js';
declare let schedule: <T>(job: () => Promise<T>) => Promise<T>;
export declare function configureOfficeAssets(options: {
    baseUrl: string;
    schedule?: typeof schedule;
}): void;
export declare function loadOfficeTexture(alias: string, name: string, background?: boolean): Promise<Texture>;
export {};
