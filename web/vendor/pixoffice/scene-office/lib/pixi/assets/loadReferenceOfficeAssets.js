import { loadOfficeTexture } from "./loadOfficeTexture.js";
const textures = new Map();
export const getReferenceOfficeTexture = (name) => textures.get(name);
export const loadReferenceOfficeBackground = () => loadOfficeTexture('office-reference-room-whiteboard-v3', 'reference-v1/room-whiteboard-v3', true);
export async function loadReferenceOfficeObjects(report) {
    await Promise.all(['conference-table', 'desk-accessories'].map(async (name) => {
        textures.set(name, await loadOfficeTexture(`office-reference-${name}`, `reference-v1/${name}`));
        report(name);
    }));
}