import type { Box, Point, Template, World } from '../model.ts';
export declare const FURNITURE_CELL_SIZE = 1;
export declare const cellKey: (p: Point) => string;
export declare const sameCell: (a: Point, b: Point) => boolean;
export declare const isCell: (p: Point) => boolean;
export declare const cellDistance: (a: Point, b: Point) => number;
export declare const addCell: (a: Point, b: Point) => {
    x: number;
    y: number;
};
export declare function furnitureFootprint(template: Template): Box;
export declare function furnitureCells(template: Template): Point[];
export declare function snapFurniture(point: Point): Point;
export declare function validateFurnitureFootprints(world: World, template: (id: string) => Template): void;
