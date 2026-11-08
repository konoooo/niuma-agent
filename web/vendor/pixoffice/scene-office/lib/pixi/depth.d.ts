import type { Agent, Desk } from '../types.ts';
/** 与 DeskEntity 桌沿锚点对齐：此线以上（y 更小）人在桌后 */
export declare const DESK_DEPTH_SPLIT_OFFSET: number;
/** 椅背前沿：此线以上椅子挡人，以下人挡椅子（坐着时 y ≈ seatY 在上方） */
export declare const CHAIR_DEPTH_SPLIT_OFFSET: number;
/** The chair back hides an occupant at the aligned seat, not someone approaching on the floor. */
export declare function computeAgentDepthZ(agent: Pick<Agent, 'x' | 'y' | 'seatTransition'>): number;
export declare function getDeskDepthSplitY(desk: Desk): number;
export declare function getChairDepthSplitY(desk: Desk): number;
export declare function isAgentNearDesk(desk: Desk, ax: number, ay: number): boolean;
type AgentPos = {
    x: number;
    y: number;
};
/**
 * 桌沿为界：人在上方 → 桌子 z 更大挡住人；人在下方 → 桌子 z 更小被人挡住
 */
export declare function computeDeskLayerZ(desk: Desk, agents: AgentPos[]): number;
/**
 * 椅背为界：与桌子相同的 Y 轴规则，分界在座位略前方
 */
export declare function computeChairLayerZ(desk: Desk, agents: AgentPos[], chairAhead?: number): number;
export {};
