"use client";

import { Image as ImageIcon } from "lucide-react";

export function AdminImageGeneration({ collectionData }) {
    const generatedPrompts = collectionData?.generated_prompts || {};

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Final Image Generation</h3>
                    <p className="text-sm text-gray-600">Generated prompts for image creation</p>
                </div>
            </div>

            {Object.keys(generatedPrompts).length > 0 ? (
                <div className="space-y-4">
                    {Object.entries(generatedPrompts).map(([type, prompt]) => (
                        <div key={type} className="border border-gray-200 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                {type.replace(/_/g, " ")}
                            </label>
                            <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                                {prompt}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>No generated prompts available</p>
                </div>
            )}
        </div>
    );
}
