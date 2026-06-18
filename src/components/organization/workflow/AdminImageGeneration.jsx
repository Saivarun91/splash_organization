"use client";

import { Image as ImageIcon } from "lucide-react";

export function AdminImageGeneration({ collectionData }) {
    const generatedPrompts = collectionData?.generated_prompts || {};

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-solid/10 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gold-solid" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-lg">Final Image Generation</h3>
                    <p className="text-sm text-muted-foreground">Generated prompts for image creation</p>
                </div>
            </div>

            {Object.keys(generatedPrompts).length > 0 ? (
                <div className="space-y-4">
                    {Object.entries(generatedPrompts).map(([type, prompt]) => (
                        <div key={type} className="border border-border rounded-lg p-4 bg-card shadow-sm">
                            <label className="block text-sm font-medium text-muted-foreground mb-2 capitalize">
                                {type.replace(/_/g, " ")}
                            </label>
                            <div className="w-full px-4 py-3 border border-border rounded-lg bg-secondary/50 text-foreground text-sm">
                                {prompt}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-border">
                    <p>No generated prompts available</p>
                </div>
            )}
        </div>
    );
}
