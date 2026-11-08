const classicViews = { north: 'back', east: 'right', south: 'front', west: 'left' };
const dimetricViews = { north: 'back-right', east: 'front-right', south: 'front-left', west: 'back-left' };
function projection(id, forward, inverse, views) {
    const areaPolygon = (b) => [forward({ x: b.left, y: b.top }), forward({ x: b.right, y: b.top }), forward({ x: b.right, y: b.bottom }), forward({ x: b.left, y: b.bottom })];
    return {
        id, gridToScreen: forward, screenToGrid: inverse,
        cellCenter: p => forward({ x: p.x + .5, y: p.y + .5 }),
        cellPolygon: p => areaPolygon({ left: p.x, top: p.y, right: p.x + 1, bottom: p.y + 1 }),
        areaPolygon,
        bounds: area => {
            const points = areaPolygon(area);
            return { left: Math.min(...points.map(p => p.x)), top: Math.min(...points.map(p => p.y)), right: Math.max(...points.map(p => p.x)), bottom: Math.max(...points.map(p => p.y)) };
        },
        depth: p => forward(p).y,
        viewDirection: direction => views[direction],
    };
}
function positive(value) {
    if (!Number.isFinite(value) || value <= 0)
        throw new Error('Projection dimensions must be finite and positive');
    return value;
}
/** Compatibility projection used by the existing three scene products. */
export function createOrthogonalProjection(cellPixels = 50) {
    const size = positive(cellPixels);
    return projection('pixoffice.orthogonal', p => ({ x: p.x * size, y: p.y * size }), p => ({ x: p.x / size, y: p.y / size }), classicViews);
}
/** 45-degree yaw / 30-degree elevation. Width is exactly twice the tile height. */
export function createDimetricProjection(tileWidth = 64) {
    const halfWidth = positive(tileWidth) / 2, halfHeight = tileWidth / 4;
    return projection('pixoffice.dimetric-2:1', p => ({ x: (p.x - p.y) * halfWidth, y: (p.x + p.y) * halfHeight }), p => ({ x: (p.x / halfWidth + p.y / halfHeight) / 2, y: (p.y / halfHeight - p.x / halfWidth) / 2 }), dimetricViews);
}
export function pickGridCell(projection, screen) {
    const point = projection.screenToGrid(screen);
    // Tolerate round-off at exact tile boundaries without changing ordinary sub-cell picks.
    const snap = (n) => Math.abs(n - Math.round(n)) < 1e-9 ? Math.round(n) : n;
    return { x: Math.floor(snap(point.x)), y: Math.floor(snap(point.y)) };
}