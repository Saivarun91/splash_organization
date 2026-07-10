"use client";

import { User } from "lucide-react";
import SmartImage from "@/utils/SmartImage";
import { getModelImageSources } from "@/components/images/GeneratedSmartImage";

export function AdminModelSelection({ collectionData }) {
    const item = collectionData?.items?.[0];
    const selectedModel = item?.selected_model;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-solid/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-gold-solid" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-lg">Model Preview Selection</h3>
                    <p className="text-sm text-muted-foreground">Selected model for image generation</p>
                </div>
            </div>

            {selectedModel ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Model Type</label>
                        <div className="px-4 py-3 border border-border rounded-lg bg-accent/10 text-foreground font-medium capitalize">
                            {selectedModel.type || "AI Model"}
                        </div>
                    </div>

                    {(selectedModel.cloud_url || selectedModel.local_url) && (
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Model Preview</label>
                            <div className="border border-border rounded-lg overflow-hidden relative h-64">
                                <SmartImage
                                    {...getModelImageSources(selectedModel)}
                                    fill
                                    sizes="100vw"
                                    alt="Model preview"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No model selected</p>
                </div>
            )}
        </div>
    );
}
