import { Container, HTMLText, Rectangle, Sprite, Texture } from 'pixi.js';
import { transformWorkSurface } from '@pixoffice/contracts/contactSurface';
import { createOfficePropViews } from "./index.js";
import { DeskEntity } from "./DeskEntity.js";
import { seatPixels } from "../projection.js";
import { TRIAL_COMPUTER, TRIAL_MONITOR_RIGHT, trialComputerPlacement } from "../workstationSurface.js";
import { WORKSTATION_DESK_OFFSET_Y, WORKSTATION_SEAT_Y } from "../workstationArtwork.js";
import { getReferenceOfficeTexture } from "../assets/loadReferenceOfficeAssets.js";
import { renderWhiteboardPreview, WHITEBOARD_PREVIEW_LAYOUT } from "../../taskBoard.js";
import { whiteboardTaskBoard, WhiteboardProgress } from "../../whiteboard.js";
const SCALE = 1.5;
export function referenceMonitorAnchor(position, placement = 'above') {
    const seat = seatPixels({ x: position.x + 1, y: position.y + 2 });
    const top = seat.y + SCALE * (-WORKSTATION_SEAT_Y + WORKSTATION_DESK_OFFSET_Y + trialComputerPlacement().topY);
    if (placement === 'right') {
        const computer = TRIAL_COMPUTER, scale = computer.targetWidth / computer.width * SCALE;
        return { x: seat.x + (TRIAL_MONITOR_RIGHT.x - computer.left - computer.width / 2) * scale + 6,
            y: top + (TRIAL_MONITOR_RIGHT.y - computer.top) * scale };
    }
    return { x: seat.x, y: top - 14 };
}
const ACCESSORY_FRAMES = {
    plant: { x: 45, y: 133, width: 381, height: 474 },
    mug: { x: 1467, y: 374, width: 231, height: 222 },
    books: { x: 1728, y: 185, width: 314, height: 446 },
};
export function referenceAccessoryPlacements(surface) {
    const { left, right, back, front } = surface.bounds;
    return [
        { id: 'plant', width: 26, x: left + 16, y: back + 13 },
        { id: 'mug', width: 14, x: right - 28, y: back + 8 },
        { id: 'books', width: 26, x: right - 13, y: front - 3 },
    ];
}
export const referenceWorkstationView = prop => {
    const seat = (p) => seatPixels({ x: p.position.x + 1, y: p.position.y + 2 });
    const asDesk = (p) => { const s = seat(p); return { id: p.id, x: s.x, y: s.y - WORKSTATION_SEAT_Y, seatX: s.x, seatY: s.y }; };
    const desk = new DeskEntity(asDesk(prop)), accessories = new Container();
    const texture = getReferenceOfficeTexture('desk-accessories');
    const sprites = new Map(), crops = [];
    if (texture) {
        for (const [id, frame] of Object.entries(ACCESSORY_FRAMES)) {
            const cropped = new Texture({ source: texture.source, frame: new Rectangle(frame.x, frame.y, frame.width, frame.height) });
            crops.push(cropped);
            const sprite = new Sprite(cropped);
            sprite.anchor.set(.5, 1);
            sprites.set(id, sprite);
            accessories.addChild(sprite);
        }
    }
    accessories.on('destroyed', () => crops.forEach(crop => crop.destroy()));
    const workSurface = () => { const s = seat(prop); return transformWorkSurface(desk.getWorkSurface(), SCALE, s.x * (1 - SCALE), s.y * (1 - SCALE)); };
    const parts = [desk.shadowGfx, desk.deskLayer, desk.chairLayer, desk.occupiedIndicator, desk.deskFrontLayer];
    desk.deskLayer.hitArea = new Rectangle(-55, -12, 110, 80);
    return { roots: [...parts, accessories], hitTarget: desk.deskLayer,
        getWorkSurface: workSurface,
        update(p, _template, actors) {
            prop = p;
            desk.setArtwork('trial');
            desk.setDesk(asDesk(p));
            desk.updateDepthZ();
            desk.setOccupied(actors.some(a => a.furniture?.propId === p.id && a.furniture.seated && !a.furniture.transitioning));
            const s = seat(p);
            for (const part of parts) {
                part.position.set(s.x + (part.x - s.x) * SCALE, s.y + (part.y - s.y) * SCALE);
                part.scale.set(SCALE);
            }
            accessories.position.set(s.x, s.y);
            accessories.zIndex = desk.deskLayer.zIndex + .1;
            for (const part of referenceAccessoryPlacements(workSurface())) {
                const sprite = sprites.get(part.id);
                if (!sprite)
                    continue;
                sprite.width = part.width;
                sprite.scale.y = sprite.scale.x;
                sprite.position.set(part.x - s.x, part.y - s.y);
            }
        } };
};
const conferenceTableView = () => {
    const root = new Container(), texture = getReferenceOfficeTexture('conference-table');
    if (texture) {
        const sprite = new Sprite(texture);
        sprite.anchor.set(.5, 1);
        sprite.width = 430;
        sprite.scale.y = sprite.scale.x;
        root.addChild(sprite);
    }
    root.hitArea = new Rectangle(-215, -180, 430, 180);
    return { roots: [root], hitTarget: root, update(prop) {
            root.position.set((prop.position.x + 4) * 50, (prop.position.y + 3) * 50 - 10);
            root.zIndex = (prop.position.y + 1.5) * 50;
        } };
};
const wallWhiteboardView = (progress) => () => {
    const root = new Container();
    const content = new HTMLText({ text: '', resolution: 2, style: { fontFamily: 'system-ui, sans-serif', fontSize: WHITEBOARD_PREVIEW_LAYOUT.fontSize,
            fill: 0x343b36, whiteSpace: 'normal', wordWrap: true, wordWrapWidth: WHITEBOARD_PREVIEW_LAYOUT.width,
            cssOverrides: ['font-size:inherit', 'line-height:inherit', 'color:inherit'] } });
    content.position.set(71, -157);
    content.scale.set(450 / WHITEBOARD_PREVIEW_LAYOUT.width);
    // The hanging whiteboard is part of the room image, so its perspective and shadow stay aligned.
    root.addChild(content);
    root.hitArea = new Rectangle(54, -164, 486, 188);
    let previous = '', elapsed = 0, revision = -1, boardId = '', board;
    const paint = () => {
        const state = board ? { taskBoard: progress.project(boardId, board) } : {};
        const key = JSON.stringify(state);
        if (key === previous)
            return;
        previous = key;
        content.text = renderWhiteboardPreview(state);
    };
    return { roots: [root], hitTarget: root, update(prop) {
            root.position.set(prop.position.x * 50, prop.position.y * 50);
            root.zIndex = prop.position.y * 50;
            if (revision !== prop.stateRevision || boardId !== prop.id) {
                revision = prop.stateRevision;
                boardId = prop.id;
                board = whiteboardTaskBoard(prop.state) ?? undefined;
                paint();
            }
        }, updateFrame(dt) {
            elapsed += dt;
            // HTML textures refresh at most four times a second, and only when a visible value changes.
            if (elapsed < .25)
                return;
            elapsed %= .25;
            paint();
        } };
};
export function createReferenceOfficePropViews(progress = new WhiteboardProgress()) {
    const registry = createOfficePropViews();
    registry.register('reference-workstation', referenceWorkstationView);
    registry.register('wall-whiteboard', wallWhiteboardView(progress));
    registry.register('conference-table', conferenceTableView);
    return registry;
}