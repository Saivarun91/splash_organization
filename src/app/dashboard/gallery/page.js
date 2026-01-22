"use client";

import { useState, useEffect } from "react";
import { Grid, Download, RefreshCw, Eye, Loader2 } from "lucide-react";
import { organizationAPI } from "@/lib/api";

const getImageCategory = (imageType) => {
    if (imageType === "white_background") return "Plain";
    if (imageType === "background_change") return "Themed";
    if (imageType === "model_with_ornament" || imageType === "real_model_with_ornament") return "Model";
    if (imageType === "campaign_shot_advanced") return "Campaign";
    return "Other";
};

const getDaysAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
};

export default function GalleryPage() {
    const [images, setImages] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const orgId = localStorage.getItem("org_organization_id");
                if (!orgId) {
                    setLoading(false);
                    return;
                }

                setOrganizationId(orgId);
                const data = await organizationAPI.getOrganizationImages(orgId);
                if (data.images) {
                    setImages(data.images);
                }
            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    const filteredImages =
        filter === "all"
            ? images
            : images.filter((img) => {
                  if (filter === "plain") return img.image_type === "white_background";
                  if (filter === "themed") return img.image_type === "background_change";
                  if (filter === "model")
                      return img.image_type === "model_with_ornament" || img.image_type === "real_model_with_ornament";
                  if (filter === "campaign") return img.image_type === "campaign_shot_advanced";
                  return true;
              });

    const handleDownload = (image) => {
        window.open(image.image_url, "_blank");
    };

    const handleView = (image) => {
        window.open(image.image_url, "_blank");
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Organization Images</h1>
                    <p className="text-[#737373] text-lg">All images generated under your organization</p>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    {["all", "plain", "themed", "model", "campaign"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${
                                filter === f
                                    ? "bg-[#884cff] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {f === "all" ? "All" : f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-[#884cff] animate-spin mx-auto mb-4" />
                            <p className="text-[#737373]">Loading images...</p>
                        </div>
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 shadow-xl border border-white/20 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#884cff]/10 to-[#5a2fcf]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Grid className="w-12 h-12 text-[#884cff]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">No Images Yet</h3>
                        <p className="text-[#737373] mb-6">
                            {filter === "all"
                                ? "No images have been generated under this organization yet"
                                : "No images found for this filter"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {filteredImages.map((image) => (
                            <div key={image.id} className="group cursor-pointer">
                                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                                    <img
                                        src={image.image_url}
                                        alt={getImageCategory(image.image_type)}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display = "flex";
                                        }}
                                    />
                                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center hidden">
                                        <Grid className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 bg-black/40">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleView(image);
                                            }}
                                            className="p-2.5 bg-white rounded-full hover:bg-gray-100 transition-all shadow-lg"
                                            title="View in new tab"
                                        >
                                            <Eye size={16} className="text-gray-700" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(image);
                                            }}
                                            className="p-2.5 bg-white rounded-full hover:bg-gray-100 transition-all shadow-lg"
                                            title="Download"
                                        >
                                            <Download size={16} className="text-gray-700" />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-2">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        {getImageCategory(image.image_type)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Generated {getDaysAgo(image.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
