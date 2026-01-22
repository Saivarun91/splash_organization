"use client";

import { Palette } from "lucide-react";

export function AdminThemesAndBackgrounds({ collectionData }) {
    const item = collectionData?.items?.[0];

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Themes & Backgrounds</h3>
                    <p className="text-sm text-gray-600">Selected themes and background styles</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item?.selected_themes && item.selected_themes.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Themes</label>
                        <div className="flex flex-wrap gap-2">
                            {item.selected_themes.map((theme, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                >
                                    {theme}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {item?.selected_backgrounds && item.selected_backgrounds.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backgrounds</label>
                        <div className="flex flex-wrap gap-2">
                            {item.selected_backgrounds.map((bg, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                >
                                    {bg}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {item?.selected_poses && item.selected_poses.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Poses</label>
                        <div className="flex flex-wrap gap-2">
                            {item.selected_poses.map((pose, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                                >
                                    {pose}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {item?.selected_locations && item.selected_locations.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
                        <div className="flex flex-wrap gap-2">
                            {item.selected_locations.map((location, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                                >
                                    {location}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
