import { whiteboardTaskBoardSchema } from '@pixoffice/protocol/office-ui';
import type { WhiteboardTaskBoardData } from '@pixoffice/protocol/office-ui';
export { whiteboardTaskBoardSchema };
export type { WhiteboardTaskBoardData };
export { WhiteboardProgress } from './whiteboardProgress.ts';
export declare function whiteboardTaskBoard(state: Record<string, unknown>): WhiteboardTaskBoardData | null;
