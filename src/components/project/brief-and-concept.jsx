"use client"

import { useState, useEffect } from "react"
import { FileText } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export function BriefAndConcept({ onRequestSuggestions, collectionData, suggestionsRequested: parentSuggestionsRequested, canEdit = true, onFormDataChange }) {
    const { t } = useLanguage()
    const [description, setDescription] = useState("")
    const [targetAudience, setTargetAudience] = useState("")
    const [campaignSeason, setCampaignSeason] = useState("")
    const [hasDescription, setHasDescription] = useState(false)

    useEffect(() => {
        if (collectionData?.description) {
            setDescription(collectionData.description)
            setHasDescription(true)
        }
        if (collectionData?.target_audience) {
            setTargetAudience(collectionData.target_audience)
        }
        if (collectionData?.campaign_season) {
            setCampaignSeason(collectionData.campaign_season)
        }
    }, [collectionData?.description, collectionData?.target_audience, collectionData?.campaign_season])

    useEffect(() => {
        if (onFormDataChange) {
            onFormDataChange({
                description,
                targetAudience,
                campaignSeason,
                hasDescription
            })
        }
    }, [description, targetAudience, campaignSeason, hasDescription, onFormDataChange])

    const handleDescriptionChange = (e) => {
        const value = e.target.value
        setDescription(value)
        setHasDescription(value.trim().length > 0)
    }

    return (
        <div className="space-y-4 text-foreground">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary border border-border rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">{t("images.briefAndConcept")}</h3>
                    <p className="text-sm text-muted-foreground">{t("images.defineProjectVision")}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-3">
                    <label htmlFor="project-description" className="block text-sm font-medium text-foreground">{t("images.projectDescriptionOptional")}</label>
                    <textarea
                        id="project-description"
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder={t("images.enterProjectDescription")}
                        className="w-full h-32 px-4 py-3 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent resize-none disabled:bg-secondary disabled:text-muted-foreground disabled:cursor-not-allowed placeholder:text-muted-foreground/60"
                        disabled={!canEdit}
                    />
                </div>
                <div className="flex justify-center w-full items-center gap-3">
                    <div className="space-y-3 w-1/2">
                        <label htmlFor="target-audience" className="block text-sm font-medium text-foreground">{t("images.targetAudience")}</label>
                        <input
                            id="target-audience"
                            type="text"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder={t("images.enterTargetAudience")}
                            className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent disabled:bg-secondary disabled:text-muted-foreground disabled:cursor-not-allowed placeholder:text-muted-foreground/60"
                            disabled={!canEdit}
                        />
                    </div>

                    <div className="space-y-3 w-1/2">
                        <label htmlFor="campaign-season" className="block text-sm font-medium text-foreground">{t("images.campaignSeason")}</label>
                        <input
                            id="campaign-season"
                            type="text"
                            value={campaignSeason}
                            onChange={(e) => setCampaignSeason(e.target.value)}
                            placeholder={t("images.enterCampaignSeason")}
                            className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent disabled:bg-secondary disabled:text-muted-foreground disabled:cursor-not-allowed placeholder:text-muted-foreground/60"
                            disabled={!canEdit}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
