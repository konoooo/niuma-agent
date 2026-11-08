import type { WorkSurface } from '@pixoffice/contracts/contactSurface';
import type { Point } from '@pixoffice/runtime/model';
import type { PropViewFactory } from '@pixoffice/renderer-pixi/PropViewRegistry';
import { WhiteboardProgress } from '../../whiteboard.ts';
export declare function referenceMonitorAnchor(position: Point, placement?: 'above' | 'right'): Point;
export declare function referenceAccessoryPlacements(surface: WorkSurface): ({
    id: "plant";
    width: number;
    x: number;
    y: number;
} | {
    id: "mug";
    width: number;
    x: number;
    y: number;
} | {
    id: "books";
    width: number;
    x: number;
    y: number;
})[];
export declare const referenceWorkstationView: PropViewFactory;
export declare function createReferenceOfficePropViews(progress?: WhiteboardProgress): import("@pixoffice/renderer-pixi/PropViewRegistry").PropViewRegistry;
