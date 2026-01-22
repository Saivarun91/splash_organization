"use client";

import { User } from "lucide-react";

export function AdminModelSelection({ collectionData }) {
    const item = collectionData?.items?.[0];
    const selectedModel = item?.selected_model;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Model Preview Selection</h3>
                    <p className="text-sm text-gray-600">Selected model for image generation</p>
                </div>
            </div>

            {selectedModel ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
                        <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 capitalize">
                            {selectedModel.type || "AI Model"}
                        </div>
                    </div>

                    {selectedModel.cloud_url && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Model Preview</label>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <img
                                    src={selectedModel.cloud_url || selectedModel.local_url || "/placeholder.jpg"}
                                    alt="Model preview"
                                    className="w-full h-64 object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>No model selected</p>
                </div>
            )}
        </div>
    );
}
