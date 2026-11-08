import type { Point } from './model.ts';
export declare const pathDistance: (points: Point[]) => number;
export declare const axisAligned: (a: Point, b: Point) => boolean;
export declare function compactPath(points: Point[]): Point[];
export declare function comparePaths(a: Point[], b: Point[]): number;
export declare function elbowPaths(from: Point, to: Point, clear: (a: Point, b: Point) => boolean): Point[][];
/** Shorten a four-way A* route without reintroducing diagonal corner cuts. */
export declare function shortenPath(points: Point[], clear: (a: Point, b: Point) => boolean): Point[];
