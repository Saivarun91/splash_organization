"use client";

import { Droplet } from "lucide-react";

export function AdminColorPalette({ collectionData }) {
    const item = collectionData?.items?.[0];

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Color Palette</h3>
                    <p className="text-sm text-gray-600">Selected colors and instructions</p>
                </div>
            </div>

            <div className="space-y-4">
                {item?.selected_colors && item.selected_colors.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Selected Colors</label>
                        <div className="flex flex-wrap gap-2">
                            {item.selected_colors.map((color, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                                >
                                    {color}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {item?.picked_colors && item.picked_colors.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Values</label>
                        <div className="flex flex-wrap gap-3">
                            {item.picked_colors.map((color, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div
                                        className="w-12 h-12 rounded-lg border-2 border-gray-200"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="text-sm font-mono text-gray-700">{color}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {item?.color_instructions && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Instructions</label>
                        <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                            {item.color_instructions}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
