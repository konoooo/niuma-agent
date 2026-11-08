import { Container, Graphics, Text } from 'pixi.js';
import { createOrthogonalProjection } from "./projection.js";
const placeholderView = (projection) => (prop, template) => {
    const root = new Container(), graphic = new Graphics(), bounds = template.footprint;
    const origin = projection.gridToScreen({ x: 0, y: 0 });
    graphic.poly(projection.areaPolygon(bounds).flatMap(p => [p.x - origin.x, p.y - origin.y])).fill({ color: 0xdce2de, alpha: .6 }).stroke({ color: 0x8c968f, width: 1 });
    const label = new Text({ text: prop.name, style: { fontSize: 10, fill: 0x67766b, wordWrap: true, wordWrapWidth: 90 } });
    label.anchor.set(.5, 1);
    root.addChild(graphic, label);
    return { roots: [root], hitTarget: root, update(p) { const point = projection.gridToScreen(p.position); root.position.set(point.x, point.y); root.zIndex = projection.depth(p.position); } };
};
/** Trusted view factories are assembled by the application, never downloaded by commands. */
export class PropViewRegistry {
    factories = new Map();
    fallback;
    constructor(projection = 50) { this.fallback = placeholderView(typeof projection === 'number' ? createOrthogonalProjection(projection) : projection); }
    register(id, factory) {
        if (this.factories.has(id))
            throw new Error(`Duplicate view: ${id}`);
        this.factories.set(id, factory);
    }
    create(prop, template) { return (this.factories.get(template.view) ?? this.fallback)(prop, template); }
}