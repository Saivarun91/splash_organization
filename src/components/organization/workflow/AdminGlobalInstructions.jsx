"use client";

import { FileText } from "lucide-react";

export function AdminGlobalInstructions({ collectionData }) {
    const item = collectionData?.items?.[0];

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gold-solid/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold-solid" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-lg">Global Instructions</h3>
                    <p className="text-sm text-muted-foreground">Overall project guidelines</p>
                </div>
            </div>

            {item?.global_instructions ? (
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Instructions</label>
                    <div className="w-full px-4 py-3 border border-border rounded-lg bg-accent/10 text-foreground min-h-[100px]">
                        {item.global_instructions}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No global instructions provided</p>
                </div>
            )}
        </div>
    );
}
