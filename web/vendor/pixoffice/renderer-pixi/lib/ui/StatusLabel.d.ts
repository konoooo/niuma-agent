import { Container } from 'pixi.js';
export declare class StatusLabel extends Container {
    private nameText;
    private taskText;
    private stateDot;
    private taskBg;
    private taskLayer;
    private nameBg;
    private currentState;
    private namePlateKey;
    constructor(name: string);
    setName(name: string): void;
    setTask(task?: string): void;
    private layoutTaskAboveName;
    setState(state: string): void;
    /** 发顶 Y：名字贴在发顶上方，任务叠在名字上面 */
    layout(crownTopY: number): void;
    layoutBeside(x: number, y: number, scale?: number, crownTopY?: number): void;
    /** 名字/任务标签块顶边 Y（Agent 本地坐标） */
    getLabelTopY(crownTopY: number): number;
    private paintStateDot;
}
