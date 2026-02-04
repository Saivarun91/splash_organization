"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Grid, Download, RefreshCw, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { organizationAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const getImageCategory = (imageType, t) => {
    if (imageType === "white_background") return t("orgPortal.plain");
    if (imageType === "background_change") return t("orgPortal.themed");
    if (imageType === "model_with_ornament" || imageType === "real_model_with_ornament") return t("orgPortal.model");
    if (imageType === "campaign_shot_advanced") return t("orgPortal.campaign");
    return t("orgPortal.other");
};

const getDaysAgo = (dateString, t) => {
    if (!dateString) return t("orgPortal.recently");
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t("orgPortal.today");
    if (diffDays === 1) return `1 ${t("orgPortal.day")} ${t("orgPortal.ago")}`;
    return `${diffDays} ${t("orgPortal.days")} ${t("orgPortal.ago")}`;
};

const ITEMS_PER_PAGE = 18;

export default function GalleryPage() {
    const { t } = useLanguage();
    const [images, setImages] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const observerTarget = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const orgId = localStorage.getItem("org_organization_id");
                if (!orgId) {
                    setLoading(false);
                    return;
                }

                setOrganizationId(orgId);
                await fetchImages(orgId, 1);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchImages = async (orgId, page = 1, append = false) => {
        if (append) setLoadingMore(true);
        try {
            const offset = (page - 1) * ITEMS_PER_PAGE;
            const params = {
                limit: ITEMS_PER_PAGE,
                offset: offset,
            };
            
            if (filter !== "all") {
                if (filter === "plain") {
                    params.image_type = "white_background";
                } else if (filter === "themed") {
                    params.image_type = "background_change";
                } else if (filter === "campaign") {
                    params.image_type = "campaign_shot_advanced";
                }
                // Note: "model" filter needs special handling as it includes both model_with_ornament and real_model_with_ornament
                // We'll filter on the frontend for model type since backend doesn't support OR queries easily
            }

            const data = await organizationAPI.getOrganizationImages(orgId, params);
            if (data.images) {
                if (append) {
                    setImages((prev) => [...prev, ...data.images]);
                } else {
                    setImages(data.images);
                }
                setTotalCount(data.total_count || 0);
                setHasMore(data.images.length === ITEMS_PER_PAGE && (offset + data.images.length) < (data.total_count || 0));
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            if (append) setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (organizationId) {
            setCurrentPage(1);
            fetchImages(organizationId, 1, false);
        }
    }, [filter]);

    // Intersection Observer for lazy loading
    const lastImageElementRef = useCallback(
        (node) => {
            if (loadingMore) return;
            if (observerTarget.current) observerTarget.current.disconnect();
            observerTarget.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    fetchImages(organizationId, nextPage, true);
                }
            });
            if (node) observerTarget.current.observe(node);
        },
        [loadingMore, hasMore, currentPage, organizationId]
    );

    // Filter images - handle model type specially since it includes two image types
    const filteredImages = useMemo(() => {
        if (filter === "all") return images;
        if (filter === "model") {
            return images.filter(
                (img) =>
                    img.image_type === "model_with_ornament" || img.image_type === "real_model_with_ornament"
            );
        }
        return images.filter((img) => {
            if (filter === "plain") return img.image_type === "white_background";
            if (filter === "themed") return img.image_type === "background_change";
            if (filter === "campaign") return img.image_type === "campaign_shot_advanced";
            return true;
        });
    }, [images, filter]);

    const handleDownload = (image) => {
        window.open(image.image_url, "_blank");
    };

    const handleView = (image) => {
        window.open(image.image_url, "_blank");
    };

    return (
        <div className="space-y-6">
            <div className="relative p-4 rounded-xl bg-white dark:bg-card shadow-md border border-gray-200 dark:border-border overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">{t("orgPortal.organizationImages")}</h1>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">{t("orgPortal.allImagesGeneratedUnderOrg")}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {["all", "plain", "themed", "model", "campaign"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                            filter === f
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-gray-100 dark:bg-sidebar-accent/40 text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-sidebar-accent/60"
                        }`}
                    >
                        {f === "all" ? t("orgPortal.all") : f === "plain" ? t("orgPortal.plain") : f === "themed" ? t("orgPortal.themed") : f === "model" ? t("orgPortal.model") : f === "campaign" ? t("orgPortal.campaign") : f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-indigo-600 dark:text-sidebar-primary animate-spin mx-auto mb-4" />
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">{t("orgPortal.loadingImages")}</p>
                    </div>
                </div>
            ) : filteredImages.length === 0 ? (
                <div className="p-8 md:p-16 bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border text-center">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-sidebar-accent/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Grid className="w-10 h-10 text-indigo-600 dark:text-sidebar-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">{t("orgPortal.noImagesYet")}</h3>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">
                        {filter === "all"
                            ? t("orgPortal.noImagesGeneratedYet")
                            : t("orgPortal.noImagesFoundForFilter")}
                    </p>
                </div>
            ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {filteredImages.map((image, index) => (
                                <div
                                    key={image.id}
                                    ref={index === filteredImages.length - 1 ? lastImageElementRef : null}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-square bg-gray-100 dark:bg-sidebar-accent/30 rounded-xl overflow-hidden mb-2 border border-gray-200 dark:border-border">
                                        <img
                                            src={image.image_url}
                                            alt={getImageCategory(image.image_type, t)}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
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
                                                title={t("orgPortal.viewInNewTab")}
                                            >
                                                <Eye size={16} className="text-gray-700" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload(image);
                                                }}
                                                className="p-2.5 bg-white rounded-full hover:bg-gray-100 transition-all shadow-lg"
                                                title={t("orgPortal.download")}
                                            >
                                                <Download size={16} className="text-gray-700" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl p-3 shadow-sm">
                                        <p className="text-sm font-medium text-gray-900 dark:text-foreground mb-1">
                                            {getImageCategory(image.image_type, t)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-muted-foreground">
                                            {t("orgPortal.generated")} {getDaysAgo(image.created_at, t)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {loadingMore && (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-sidebar-primary animate-spin" />
                            </div>
                        )}
                        {!hasMore && filteredImages.length > 0 && (
                            <div className="text-center py-8 text-sm text-gray-500 dark:text-muted-foreground">
                                <p>{t("orgPortal.allImagesLoaded").replace("{count}", totalCount)}</p>
                            </div>
                        )}
                    </>
                )}
        </div>
    );
}
