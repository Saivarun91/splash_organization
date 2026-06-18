"use client";

import { Droplet } from "lucide-react";

export function AdminColorPalette({ collectionData }) {
    const item = collectionData?.items?.[0];

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gold-solid/10 rounded-lg flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-gold-solid" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-lg">Color Palette</h3>
                    <p className="text-sm text-muted-foreground">Selected colors and instructions</p>
                </div>
            </div>

            <div className="space-y-4">
                {item?.selected_colors && item.selected_colors.length > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Selected Colors</label>
                        <div className="flex flex-wrap gap-2">
                            {item.selected_colors.map((color, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-secondary text-foreground border border-border rounded-full text-sm font-medium"
                                >
                                    {color}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {item?.picked_colors && item.picked_colors.length > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Color Values</label>
                        <div className="flex flex-wrap gap-3">
                            {item.picked_colors.map((color, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div
                                        className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="text-sm font-mono text-muted-foreground">{color}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {item?.color_instructions && (
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Color Instructions</label>
                        <div className="w-full px-4 py-3 border border-border rounded-lg bg-accent/10 text-foreground">
                            {item.color_instructions}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
