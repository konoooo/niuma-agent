import { visualRequestSchema } from "./animation.js";
export function assessVisualRequest(manifest, request) {
    const parsed = visualRequestSchema.safeParse(request);
    if (!parsed.success)
        return { supported: false, missing: ['Invalid visual request'] };
    const missing = [];
    for (const id of request.variantIds) {
        const variant = manifest.capabilities.variants.find(item => item.variantId === id);
        if (!variant || variant.poseId !== request.poseId || variant.view !== request.view)
            missing.push(id);
    }
    if (!manifest.capabilities.combinations.some(ids => ids.length === request.variantIds.length && ids.every(id => request.variantIds.includes(id))))
        missing.push('combination');
    if (request.contactProfileId && !manifest.capabilities.contactProfiles.includes(request.contactProfileId))
        missing.push(request.contactProfileId);
    return missing.length ? { supported: false, missing } : { supported: true };
}