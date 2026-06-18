"use client";

import { FileText } from "lucide-react";

export function AdminBriefAndConcept({ collectionData }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-solid/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold-solid" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-lg">Brief & Concept</h3>
                    <p className="text-sm text-muted-foreground">Project vision and inspiration</p>
                </div>
            </div>

            <div className="space-y-6">
                {collectionData?.description && (
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Project Description</label>
                        <div className="w-full px-4 py-3 border border-border rounded-lg bg-accent/10 text-foreground">
                            {collectionData.description}
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    {collectionData?.target_audience && (
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-foreground mb-2">Target Audience</label>
                            <div className="w-full px-4 py-3 border border-border rounded-lg bg-accent/10 text-foreground">
                                {collectionData.target_audience}
                            </div>
                        </div>
                    )}

                    {collectionData?.campaign_season && (
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-foreground mb-2">Campaign Season</label>
                            <div className="w-full px-4 py-3 border border-border rounded-lg bg-accent/10 text-foreground">
                                {collectionData.campaign_season}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
