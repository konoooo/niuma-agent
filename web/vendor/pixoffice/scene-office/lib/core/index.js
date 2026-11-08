import { supportsOfficePose } from "./poseSupport.js";
import { builtinPlugins, createOfficeWorld } from "./pack.js";
export const officeScenePack = {
    manifest: { id: 'pixoffice.office', version: '1.0.0', apiVersion: 1 },
    plugins: builtinPlugins, createWorld: createOfficeWorld,
    supportsPose: supportsOfficePose,
};
export * from "./pack.js";
export { referenceOfficeScenePack, createReferenceOfficeWorld } from "./referenceOffice.js";
export { describeOfficeScene } from "./integration.js";