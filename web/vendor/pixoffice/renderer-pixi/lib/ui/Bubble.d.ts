import { Container } from 'pixi.js';
export declare class Bubble extends Container {
    private bg;
    private messageText;
    private lifetime;
    constructor();
    show(text: string, duration?: number): void;
    hide(): void;
    update(dt: number): boolean;
    private redraw;
    /** 尾巴尖在容器内的 Y（与 redraw 里 lineTo(0, -4) 一致） */
    static readonly TAIL_TIP_Y = -4;
}
