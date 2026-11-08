import { materializeMap } from "./MapDraft.js";
import { sceneError } from '@pixoffice/protocol';
import { validateFurnitureFootprints } from "./furnitureGrid.js";
export { furnitureCells, snapFurniture } from "./furnitureGrid.js";
export function checkFurniturePlacement(document, prop, current, template, navigation) {
    const next = { ...document, props: [...document.props.filter(p => p.id !== prop.id), prop] };
    try {
        // Pointer previews only check geometry; atomic drops run full reachability validation.
        const world = materializeMap(next, current, template);
        validateFurnitureFootprints(world, template);
        navigation.validate(world, { connectivity: false });
        return { valid: true };
    }
    catch (error) {
        return { valid: false, error: sceneError(error) };
    }
}