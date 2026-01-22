"use client";

import { FileText } from "lucide-react";

export function AdminBriefAndConcept({ collectionData }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Brief & Concept</h3>
                    <p className="text-sm text-gray-600">Project vision and inspiration</p>
                </div>
            </div>

            <div className="space-y-6">
                {collectionData?.description && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                        <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                            {collectionData.description}
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    {collectionData?.target_audience && (
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                            <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                                {collectionData.target_audience}
                            </div>
                        </div>
                    )}

                    {collectionData?.campaign_season && (
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Season</label>
                            <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                                {collectionData.campaign_season}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
