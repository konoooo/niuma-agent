import { whiteboardTaskBoardSchema } from '@pixoffice/protocol/office-ui';
export { whiteboardTaskBoardSchema };
export { WhiteboardProgress } from "./whiteboardProgress.js";
export function whiteboardTaskBoard(state) {
    const result = whiteboardTaskBoardSchema.safeParse(state.taskBoard);
    return result.success && result.data.title ? result.data : null;
}