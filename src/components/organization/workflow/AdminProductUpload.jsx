"use client";

import { Upload } from "lucide-react";

export function AdminProductUpload({ collectionData }) {
    const item = collectionData?.items?.[0];
    const productImages = item?.product_images || [];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-solid/10 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gold-solid" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-lg">Product Upload</h3>
                    <p className="text-sm text-muted-foreground">Uploaded product images</p>
                </div>
            </div>

            {productImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {productImages.map((product, idx) => (
                        <div key={idx} className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                            <img
                                src={product.uploaded_image_url || product.uploaded_image_path || "/placeholder.jpg"}
                                alt={`Product ${idx + 1}`}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-3 bg-secondary/50 border-t border-border">
                                <p className="text-sm font-medium text-foreground">Product {idx + 1}</p>
                                {product.generated_images && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {product.generated_images.length} generated image(s)
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-border">
                    <p>No product images uploaded</p>
                </div>
            )}
        </div>
    );
}
