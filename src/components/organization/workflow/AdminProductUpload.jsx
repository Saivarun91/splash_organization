"use client";

import { Upload } from "lucide-react";

export function AdminProductUpload({ collectionData }) {
    const item = collectionData?.items?.[0];
    const productImages = item?.product_images || [];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Product Upload</h3>
                    <p className="text-sm text-gray-600">Uploaded product images</p>
                </div>
            </div>

            {productImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {productImages.map((product, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                            <img
                                src={product.uploaded_image_url || product.uploaded_image_path || "/placeholder.jpg"}
                                alt={`Product ${idx + 1}`}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-3 bg-gray-50">
                                <p className="text-sm font-medium text-gray-900">Product {idx + 1}</p>
                                {product.generated_images && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        {product.generated_images.length} generated image(s)
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>No product images uploaded</p>
                </div>
            )}
        </div>
    );
}
