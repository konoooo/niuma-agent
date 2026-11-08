import type { AgentState } from '../types.ts';
export type ApartmentPose = 'idle' | 'walking' | 'seated' | 'typing' | 'wave' | 'thinking' | 'surprised';
export declare function apartmentPoseForState(state: AgentState, animation?: string, atDesk?: boolean): ApartmentPose;
