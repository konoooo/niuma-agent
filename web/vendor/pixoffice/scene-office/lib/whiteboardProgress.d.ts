import type { WhiteboardTaskBoardData } from '@pixoffice/protocol/office-ui';
/** Display-only activity progress; the business payload is never changed. */
export declare class WhiteboardProgress {
    private entries;
    private now;
    private reduceMotion;
    private scope;
    setScope(scope: string): void;
    constructor(options?: {
        now?: () => number;
        reduceMotion?: boolean;
    });
    project(id: string, board: WhiteboardTaskBoardData): WhiteboardTaskBoardData;
}
