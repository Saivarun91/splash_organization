"use client";

import { FileText } from "lucide-react";

export function AdminGlobalInstructions({ collectionData }) {
    const item = collectionData?.items?.[0];

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Global Instructions</h3>
                    <p className="text-sm text-gray-600">Overall project guidelines</p>
                </div>
            </div>

            {item?.global_instructions ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 min-h-[100px]">
                        {item.global_instructions}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>No global instructions provided</p>
                </div>
            )}
        </div>
    );
}
