import type { Agent, AgentState } from '../types.ts';
import type { SceneReadPort } from '@pixoffice/runtime';
import type { SceneCommand } from '@pixoffice/protocol';
import type { World } from '@pixoffice/runtime/model';
export declare function commandBase(runtime: SceneReadPort): {
    protocolVersion: "2.0";
    sceneId: string;
    commandId: string;
};
export declare function visitCommand(runtime: SceneReadPort, visitorNo: number, hostNos: number[], message: (no: number, name: string) => string): SceneCommand;
export declare function presentationCommand(runtime: SceneReadPort, id: string, state: AgentState, task?: string): SceneCommand;
export declare function projectAgents(runtime: SceneReadPort, includeMissions?: boolean, preview?: World): Agent[];
