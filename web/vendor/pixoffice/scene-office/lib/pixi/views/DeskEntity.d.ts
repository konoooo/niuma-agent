import { Container, Graphics } from 'pixi.js';
import type { Desk } from '../../types.ts';
export type WorkstationArtwork = 'classic' | 'trial';
export declare class DeskEntity {
    readonly deskId: string;
    readonly shadowGfx: Graphics;
    readonly deskLayer: Container<import("pixi.js").ContainerChild>;
    readonly deskFrontLayer: Container<import("pixi.js").ContainerChild>;
    readonly chairLayer: Container<import("pixi.js").ContainerChild>;
    readonly occupiedIndicator: Graphics;
    private desk;
    private deskTextures;
    private artwork;
    private mountedArtwork;
    private occupied;
    constructor(desk: Desk);
    /** 素材晚到或 HMR 后可重新挂载 PNG */
    remountSprites(): void;
    setArtwork(artwork: WorkstationArtwork): void;
    updateDepthZ(): void;
    setOccupied(occupied: boolean): void;
    getSeatPosition(): {
        x: number;
        y: number;
    };
    getWorkSurface(): import("@pixoffice/contracts/contactSurface").WorkSurface;
    setDesk(desk: Desk): void;
    private positionDesk;
    private mountSprites;
    private mountTrialSprites;
    private drawShadow;
    private drawChairFallback;
    private drawDeskFallback;
}
