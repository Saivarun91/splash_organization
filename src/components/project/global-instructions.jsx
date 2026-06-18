import React, { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function GlobalInstructions({
    collectionData,
    project,
    onSave,
    canEdit = true,
    onInstructionsChange
}) {
    const { t } = useLanguage()
    const [instructions, setInstructions] = useState("")

    // Load existing instructions when collection data changes
    useEffect(() => {
        const item = collectionData?.items?.[0]
        if (item) {
            setInstructions(item.global_instructions || "")
        }
    }, [collectionData])

    // Notify parent of instruction changes
    useEffect(() => {
        if (onInstructionsChange) {
            onInstructionsChange(instructions)
        }
    }, [instructions, onInstructionsChange])

    return (
        <div className="space-y-4 text-foreground">
            <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold-solid" />
                <h3 className="font-bold text-foreground text-lg">{t("images.additionalInstructions")}</h3>
            </div>

            <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    Provide specific instructions for how the uploaded content and selections should be used in the generated images:
                </p>
                <textarea
                    placeholder="e.g., 'Use the uploaded theme images as primary inspiration', 'Apply the selected colors as accent colors', 'Make sure the model poses match the uploaded reference images', 'Use the background images to create similar atmospheres'"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full h-24 px-4 py-3 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent resize-none disabled:bg-secondary disabled:text-muted-foreground disabled:cursor-not-allowed placeholder:text-muted-foreground/60"
                    disabled={!canEdit}
                />
            </div>
        </div>
    )
}
