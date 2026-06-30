export const DEFAULT_TIER_BY_IMAGE_TYPE = {
    plainBg: "regular",
    bgReplace: "regular",
    model: "regular",
    campaign: "regular",
    white_background: "regular",
    background_change: "regular",
    background_replace: "regular",
    model_with_ornament: "regular",
    real_model_with_ornament: "regular",
    campaign_shot_advanced: "regular",
    model_image: "regular",
    campaign_image: "regular",
}

export function normalizeTier(tier, fallback = "regular") {
    void tier
    void fallback
    // Premium tier is disabled for now.
    // if (value === "premium") return "premium"
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
        model: "regular",
        campaign: "regular",
    }
}

export function mergeModelTiers(existing = {}) {
    const merged = {
        ...buildDefaultModelTiers(),
        ...existing,
    }
    return Object.fromEntries(
        Object.entries(merged).map(([key, value]) => [key, normalizeTier(value)])
    )
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
