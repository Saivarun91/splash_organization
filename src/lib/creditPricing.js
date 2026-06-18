export const DEFAULT_TIER_BY_IMAGE_TYPE = {
    plainBg: "regular",
    bgReplace: "regular",
    model: "premium",
    campaign: "premium",
    white_background: "regular",
    background_change: "regular",
    background_replace: "regular",
    model_with_ornament: "premium",
    real_model_with_ornament: "premium",
    campaign_shot_advanced: "premium",
    model_image: "premium",
    campaign_image: "premium",
}

export function normalizeTier(tier, fallback = "regular") {
    const value = (tier || fallback || "regular").toLowerCase()
    if (value === "premium") return "premium"
    return "regular"
}

export function getDefaultTierForImageType(imageType) {
    return DEFAULT_TIER_BY_IMAGE_TYPE[imageType] || "regular"
}

export function getGenerationCreditCost(settings, tier) {
    if (!settings) return 0
    const normalized = normalizeTier(tier)
    if (normalized === "premium") {
        return settings.credits_per_premium_generation ?? settings.credits_per_image_generation ?? 0
    }
    return settings.credits_per_regular_generation ?? settings.credits_per_image_generation ?? 0
}

export function getRegenerationCreditCost(settings, tier) {
    if (!settings) return 0
    const normalized = normalizeTier(tier)
    if (normalized === "premium") {
        return settings.credits_per_premium_regeneration ?? settings.credits_per_regeneration ?? 0
    }
    return settings.credits_per_regular_regeneration ?? settings.credits_per_regeneration ?? 0
}

export function resolveRegenerationTier({ storedTier, imageType }) {
    if (storedTier) return normalizeTier(storedTier)
    return getDefaultTierForImageType(imageType)
}

export function buildDefaultModelTiers() {
    return {
        plainBg: "regular",
        bgReplace: "regular",
        model: "premium",
        campaign: "premium",
    }
}

export function mergeModelTiers(existing = {}) {
    return {
        ...buildDefaultModelTiers(),
        ...existing,
    }
}

export function estimateProductUploadCredits(selections, settings) {
    if (!selections || !settings) return 0
    let total = 0
    Object.entries(selections).forEach(([, productSelections]) => {
        if (!productSelections || typeof productSelections !== "object") return
        const tiers = mergeModelTiers(productSelections.modelTiers)
        ;["plainBg", "bgReplace", "model", "campaign"].forEach((typeKey) => {
            if (productSelections[typeKey]) {
                total += getGenerationCreditCost(settings, tiers[typeKey])
            }
        })
    })
    return total
}
