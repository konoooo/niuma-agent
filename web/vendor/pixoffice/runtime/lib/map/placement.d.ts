import type { Template, World } from '../model.ts';
import type { NavigationAdapter } from '../navigationAdapter.ts';
import type { MapDocument } from '@pixoffice/protocol/map';
export { furnitureCells, snapFurniture } from './furnitureGrid.ts';
export declare function checkFurniturePlacement(document: MapDocument, prop: MapDocument['props'][number], current: World, template: (id: string) => Template, navigation: NavigationAdapter): {
    valid: true;
    error?: undefined;
} | {
    valid: false;
    error: import("@pixoffice/protocol").SceneError;
};
