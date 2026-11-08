import { type WhiteboardTaskBoardData } from './whiteboard.ts';
declare const surfaces: {
    readonly paper: {
        readonly row: "#ffffffb3";
        readonly border: "1px solid #e4e8ed";
        readonly shadow: "0 1px 3px #2339570a";
        readonly track: "#e8ecf0";
    };
    readonly wall: {
        readonly row: "transparent";
        readonly border: "none";
        readonly shadow: "none";
        readonly track: "#78848e26";
    };
};
type WhiteboardSurface = keyof typeof surfaces;
export declare const WHITEBOARD_PREVIEW_LAYOUT: {
    readonly width: 778;
    readonly height: 314;
    readonly fontSize: 26;
};
/** Fixed presentation markup. Backend content is text/data, never HTML or CSS. */
export declare function renderTaskBoard(data: WhiteboardTaskBoardData, surface?: WhiteboardSurface): string;
export declare function renderWhiteboardContent(state: Record<string, unknown>, surface?: WhiteboardSurface): string;
/** The scene retains the reader's columns with denser spacing for larger, legible text. */
export declare function renderWhiteboardPreview(state: Record<string, unknown>): string;
export {};
