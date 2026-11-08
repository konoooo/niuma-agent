import { SceneFault } from '@pixoffice/protocol';
export const FURNITURE_CELL_SIZE = 1;
export const cellKey = (p) => `${p.x},${p.y}`;
export const sameCell = (a, b) => a.x === b.x && a.y === b.y;
export const isCell = (p) => Number.isInteger(p.x) && Number.isInteger(p.y);
export const cellDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export const addCell = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export function furnitureFootprint(template) { return { ...template.footprint }; }
export function furnitureCells(template) {
    const bounds = furnitureFootprint(template), cells = [];
    for (let y = bounds.top; y < bounds.bottom; y++)
        for (let x = bounds.left; x < bounds.right; x++)
            cells.push({ x, y });
    return cells;
}
export function snapFurniture(point) { return { x: Math.round(point.x), y: Math.round(point.y) }; }
export function validateFurnitureFootprints(world, template) {
    const occupied = new Map();
    for (const prop of world.props) {
        if (!isCell(prop.position))
            throw new SceneFault('INVALID_CELL', '家具位置必须是整数格');
        for (const offset of furnitureCells(template(prop.templateId))) {
            const p = addCell(prop.position, offset), b = world.bounds;
            if (p.x < b.left || p.x >= b.right || p.y < b.top || p.y >= b.bottom)
                throw new SceneFault('OUT_OF_BOUNDS', `「${prop.name}」超出房间格子范围`);
            const other = occupied.get(cellKey(p));
            if (other)
                throw new SceneFault('OVERLAP', `「${prop.name}」与「${other}」占用了同一格`);
            occupied.set(cellKey(p), prop.name);
        }
    }
}