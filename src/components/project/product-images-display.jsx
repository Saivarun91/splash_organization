"use client"

import { useState } from "react"
import { Download, ExternalLink, RefreshCw, X, Sparkles, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { organizationAPI } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { ModelTierSelector } from "@/components/images/ModelTierSelector"
import { resolveRegenerationTier } from "@/lib/creditPricing"

function getProjectRegenContext(imageType) {
    if (imageType === "campaign_image") return "campaign"
    if (imageType === "model_image") return "model"
    return "themed"
}

export function ProductImagesDisplay({
    collectionData,
    showRegenerate = false,
    onRegenerateSuccess,
    canEdit = true
}) {
    const [regenerating, setRegenerating] = useState(null)
    const [showPromptModal, setShowPromptModal] = useState(null)
    const [customPrompt, setCustomPrompt] = useState("")
    const [error, setError] = useState(null)
    const [currentVersionMap, setCurrentVersionMap] = useState({})
    const [zoomedImage, setZoomedImage] = useState(null)
    const [useDifferentModel, setUseDifferentModel] = useState(false)
    const [selectedModel, setSelectedModel] = useState(null)
    const [regenModelTier, setRegenModelTier] = useState("regular")
    const [regenContext, setRegenContext] = useState("themed")
    const [availableModels, setAvailableModels] = useState({ ai_models: [], real_models: [] })
    const { token } = useAuth()
    
    if (!collectionData?.items?.[0]?.product_images) {
        return (
            <div className="mb-12">
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2 font-medium">No product images found</p>
                    <p className="text-sm text-gray-500">
                        Upload product images in Step 3 to get started
                    </p>
                </div>
            </div>
        )
    }

    const products = collectionData.items[0].product_images

    const handleRegenerate = async (product, generatedImage) => {
        if (useDifferentModel && !selectedModel) {
            setError("Please select a model for regeneration")
            return
        }

        if (!useDifferentModel && !customPrompt.trim()) {
            setError("Please enter a prompt for regeneration")
            return
        }

        const regKey = `${product.uploaded_image_path}_${generatedImage.local_path}`
        setRegenerating(regKey)
        setError(null)

        try {
            const response = await organizationAPI.regenerateProductModelImage(
                collectionData.id,
                product.uploaded_image_path,
                generatedImage.local_path,
                customPrompt,
                useDifferentModel,
                selectedModel,
                regenModelTier
            )

            if (response.success) {
                setShowPromptModal(null)
                setCustomPrompt("")
                setUseDifferentModel(false)
                setSelectedModel(null)
                if (onRegenerateSuccess) {
                    onRegenerateSuccess()
                }
            } else {
                setError(response.error || "Failed to regenerate image")
            }
        } catch (err) {
            console.error('Error regenerating image:', err)
            setError(err.message || "Failed to regenerate image")
        } finally {
            setRegenerating(null)
        }
    }

    const openPromptModal = async (product, generatedImage, isRegenerated = false) => {
        const imageType = generatedImage.type || "model_image"
        const context = getProjectRegenContext(imageType)
        setShowPromptModal({ product, generatedImage, isRegenerated })
        setCustomPrompt("")
        setUseDifferentModel(false)
        setSelectedModel(null)
        setRegenContext(context)
        setRegenModelTier(resolveRegenerationTier({
            storedTier: generatedImage.model_tier,
            imageType,
        }))
        setError(null)

        try {
            const modelsData = await organizationAPI.getAllModels(collectionData.id)
            if (modelsData.success) {
                setAvailableModels({
                    ai_models: modelsData.ai_models || [],
                    real_models: modelsData.real_models || []
                })
            }
        } catch (err) {
            console.error('Error loading models:', err)
        }
    }

    const handleEnhance = async (product, generatedImage) => {
        console.log("Enhancing image:", generatedImage.cloud_url)
        setError(null)

        try {
            const response = await organizationAPI.enhanceImage(
                generatedImage.cloud_url,
                collectionData.id,
                product.uploaded_image_path,
                generatedImage.local_path
            )

            if (response.success) {
                if (onRegenerateSuccess) {
                    onRegenerateSuccess()
                }
            } else {
                setError(response.error || "Failed to enhance image")
            }
        } catch (err) {
            console.error('Error enhancing image:', err)
            setError(err.message || "Failed to enhance image")
        }
    }

    const downloadImageAsBlob = async (imageUrl, filename) => {
        try {
            const response = await fetch(imageUrl, {
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                link.remove();
                window.URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
            console.error('Error downloading image:', error);
            try {
                const link = document.createElement("a");
                link.href = imageUrl;
                link.download = filename;
                link.target = '_blank';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => link.remove(), 100);
            } catch (fallbackError) {
                console.error('Fallback download also failed:', fallbackError);
                window.open(imageUrl, '_blank');
            }
        }
    };

    const handleDownloadImage = async (imageUrl, imageType, productIndex, imageIndex, versionType = '', versionIndex = null) => {
        const imageTypeLabel = imageType?.replace(/_/g, '-') || 'generated';
        let filename = `product-${productIndex}-${imageTypeLabel}-${imageIndex}`;

        if (versionType === 'regenerated' && versionIndex !== null) {
            filename += `-regenerated-v${versionIndex + 1}`;
        } else if (versionType === 'enhanced' && versionIndex !== null) {
            filename += `-enhanced-v${versionIndex + 1}`;
        }

        filename += '.png';
        await downloadImageAsBlob(imageUrl, filename);
    }

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                        Generated Product Images
                    </h3>
                    <p className="text-muted-foreground">
                        {products.length} product{products.length !== 1 ? 's' : ''} • Preview and manage your AI-generated images
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gold-solid/10 border border-gold-muted rounded-full">
                    <Sparkles className="w-4 h-4 text-gold-solid" />
                    <span className="text-sm font-medium text-gold-solid">AI Generated</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center">
                                <X className="w-3 h-3 text-red-400" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-red-400 font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {products.map((product, productIndex) => {
                    const hasGeneratedImages = product.generated_images && product.generated_images.length > 0

                    return (
                        <div key={productIndex} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold-gradient rounded-lg flex items-center justify-center text-primary-foreground font-semibold shadow-sm">
                                        <span>
                                            {productIndex + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-foreground">
                                            Product {productIndex + 1}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {hasGeneratedImages
                                                ? `${product.generated_images.length} generated image${product.generated_images.length !== 1 ? 's' : ''}`
                                                : 'No images generated yet'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                                <div className="md:col-span-1">
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <div className="aspect-square rounded-xl overflow-hidden bg-accent/10 border-2 border-gold-solid shadow-sm">
                                                <img
                                                    src={product.uploaded_image_url}
                                                    alt={`Product ${productIndex + 1}`}
                                                    className="w-full h-full object-cover cursor-zoom-in transition-transform hover:scale-105"
                                                    onClick={() => setZoomedImage(product.uploaded_image_url)}
                                                />
                                            </div>
                                            <div className="absolute top-3 left-3 bg-gold-solid text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                                                Original
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center font-medium">
                                            Source Image
                                        </p>
                                    </div>
                                </div>

                                {hasGeneratedImages ? (
                                    <div className="md:col-span-5">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                            {product.generated_images.map((img, imgIndex) => {
                                                const regKey = `${product.uploaded_image_path}_${img.local_path}`
                                                const totalVersions = 1 + (img.regenerated_images?.length || 0) + (img.enhanced_images?.length || 0)
                                                const currentIndex = currentVersionMap[regKey] || 0

                                                let imageToShow = img
                                                let versionType = 'original'

                                                if (currentIndex > 0) {
                                                    const regeneratedCount = img.regenerated_images?.length || 0
                                                    if (currentIndex <= regeneratedCount) {
                                                        imageToShow = img.regenerated_images[currentIndex - 1]
                                                        versionType = 'regenerated'
                                                    } else {
                                                        const enhancedIndex = currentIndex - regeneratedCount - 1
                                                        imageToShow = img.enhanced_images[enhancedIndex]
                                                        versionType = 'enhanced'
                                                    }
                                                }

                                                const isRegenerating = regenerating === regKey

                                                return (
                                                    <div key={imgIndex} className="group">
                                                        <div className="space-y-3">
                                                            <div className="relative aspect-square rounded-xl overflow-hidden bg-accent/10 border border-border shadow-sm hover:shadow-md hover:border-gold-muted transition-all">
                                                                <img
                                                                    src={imageToShow.cloud_url}
                                                                    alt={`${imageToShow.type} ${imgIndex + 1}`}
                                                                    className="w-full h-full object-cover cursor-zoom-in transition-transform hover:scale-105"
                                                                    onClick={() => setZoomedImage(imageToShow.cloud_url)}
                                                                />

                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full capitalize">
                                                                            {currentIndex === 0
                                                                                ? img.type?.replace("_", " ") || "Generated"
                                                                                : versionType === 'enhanced'
                                                                                    ? 'Enhanced'
                                                                                    : `v${currentIndex + 1}`
                                                                            }
                                                                        </div>
                                                                        {totalVersions > 1 && (
                                                                            <div className="flex gap-1 justify-center">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        setCurrentVersionMap((prev) => ({
                                                                                            ...prev,
                                                                                            [regKey]: Math.max(0, currentIndex - 1),
                                                                                        }))
                                                                                    }}
                                                                                    disabled={currentIndex === 0}
                                                                                    className="flex-1 bg-white/90 text-gray-700 text-xs p-1 rounded hover:bg-white transition-all disabled:opacity-40 font-medium"
                                                                                >
                                                                                    ←
                                                                                </button>
                                                                                {totalVersions > 1 && (
                                                                                    <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                                                                        {currentIndex + 1}/{totalVersions}
                                                                                    </div>
                                                                                )}
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        setCurrentVersionMap((prev) => ({
                                                                                            ...prev,
                                                                                            [regKey]: Math.min(totalVersions - 1, currentIndex + 1),
                                                                                        }))
                                                                                    }}
                                                                                    disabled={currentIndex === totalVersions - 1}
                                                                                    className="flex-1 bg-white/90 text-gray-700 text-xs p-1 rounded hover:bg-white transition-all disabled:opacity-40 font-medium"
                                                                                >
                                                                                    →
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex flex-col gap-2">
                                                                        <div className="flex gap-2 justify-center">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="secondary"
                                                                                className="gap-1 text-xs px-2 py-1 h-auto bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800"
                                                                                onClick={() => window.open(imageToShow.cloud_url, "_blank")}
                                                                            >
                                                                                <ExternalLink className="w-3 h-3" /> View
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="secondary"
                                                                                className="gap-1 text-xs px-2 py-1 h-auto bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    let versionIndex = null;
                                                                                    if (currentIndex > 0) {
                                                                                        const regeneratedCount = img.regenerated_images?.length || 0;
                                                                                        if (currentIndex <= regeneratedCount) {
                                                                                            versionIndex = currentIndex - 1;
                                                                                        } else {
                                                                                            versionIndex = currentIndex - regeneratedCount - 1;
                                                                                        }
                                                                                    }
                                                                                    handleDownloadImage(
                                                                                        imageToShow.cloud_url,
                                                                                        img.type || imageToShow.type,
                                                                                        productIndex + 1,
                                                                                        imgIndex + 1,
                                                                                        versionType,
                                                                                        versionIndex
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <Download className="w-3 h-3" /> Save
                                                                            </Button>
                                                                        </div>

                                                                        {showRegenerate && canEdit && (
                                                                            <div className="flex gap-2 justify-center">
                                                                                <Button
                                                                                    size="sm"
                                                                                    className="bg-gold-gradient hover:brightness-110 text-primary-foreground font-semibold border-0 gap-1 text-xs px-2 py-1 h-auto"
                                                                                    onClick={() => handleEnhance(product, imageToShow)}
                                                                                    disabled={isRegenerating}
                                                                                >
                                                                                    {isRegenerating ? 'Processing...' : 'Enhance'}
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    className="bg-gold-gradient hover:brightness-110 text-primary-foreground font-semibold border-0 gap-1 text-xs px-2 py-1 h-auto"
                                                                                    onClick={() => openPromptModal(product, imageToShow, currentIndex > 0)}
                                                                                    disabled={isRegenerating}
                                                                                >
                                                                                    {isRegenerating ? 'Processing...' : 'Regenerate'}
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="text-center">
                                                                <p className={`text-xs font-semibold ${currentIndex === 0
                                                                    ? "text-muted-foreground"
                                                                    : versionType === 'enhanced'
                                                                        ? "text-gold-solid"
                                                                        : "text-emerald-400"
                                                                    }`}>
                                                                    {currentIndex === 0
                                                                        ? img.type?.replace("_", " ") || "Generated"
                                                                        : versionType === 'enhanced'
                                                                            ? 'Enhanced'
                                                                            : `Regenerated v${currentIndex}`
                                                                    }
                                                                </p>
                                                                {currentIndex > 0 && (
                                                                    <p className={`text-xs font-medium ${versionType === 'enhanced' ? 'text-gold-solid' : 'text-emerald-400'}`}>
                                                                        ✓ {versionType === 'enhanced' ? 'Enhanced' : 'Improved'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="md:col-span-5 flex items-center justify-center border-2 border-dashed border-border rounded-xl p-12 bg-accent/10">
                                        <div className="text-center">
                                            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground font-medium mb-1">No generated images yet</p>
                                            <p className="text-sm text-muted-foreground">
                                                Generate images to see them appear here
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {zoomedImage && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-7xl max-h-[90vh]">
                        <img
                            src={zoomedImage}
                            alt="Zoomed preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setZoomedImage(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {showPromptModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-card border border-border text-foreground rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">
                                    Regenerate Image
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Use AI to improve your generated image
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowPromptModal(null)
                                    setCustomPrompt("")
                                    setError(null)
                                }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="bg-gold-solid/10 border border-gold-muted rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-gold-solid mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-foreground font-semibold text-sm">
                                        How Regeneration works
                                    </p>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        The AI will use your original product image, the original style prompt, and your new modifications
                                        to create an improved version. Just describe what you want to change!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center">
                                <label className="block text-sm font-semibold text-foreground mb-3">
                                    Original Product
                                </label>
                                <div className="border-2 border-gold-solid rounded-xl overflow-hidden shadow-sm">
                                    <img
                                        src={showPromptModal.product.uploaded_image_url}
                                        alt="Original Product"
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 font-medium">
                                    📦 Source Image
                                </p>
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gold-gradient rounded-full flex items-center justify-center mb-3 shadow-lg">
                                        <RefreshCw className="w-8 h-8 text-primary-foreground" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">
                                        New Enhanced Version
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Based on your instructions
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 p-4 bg-accent/10 rounded-xl border border-border">
                            <div className="flex items-center gap-3 mb-3">
                                <input
                                    type="checkbox"
                                    id="useDifferentModel"
                                    checked={useDifferentModel}
                                    onChange={(e) => {
                                        setUseDifferentModel(e.target.checked)
                                        if (!e.target.checked) setSelectedModel(null)
                                    }}
                                    className="w-4 h-4 text-gold-solid border-border bg-background rounded focus:ring-gold-solid/40"
                                />
                                <label htmlFor="useDifferentModel" className="text-sm font-semibold text-foreground cursor-pointer">
                                    🔄 Try with a different model
                                </label>
                            </div>
                            {useDifferentModel && (
                                <p className="text-xs text-amber-400 mb-3 bg-amber-500/10 border border-amber-500/20 p-2 rounded">
                                    ℹ️ The prompt will be disabled and use the original generated prompt when using a different model
                                </p>
                            )}

                            {useDifferentModel && (
                                <div className="mt-3 space-y-3">
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Select a different model to regenerate this image:
                                    </p>

                                    {availableModels.ai_models.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-foreground mb-2">AI Models</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {availableModels.ai_models.map((model, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedModel({ type: 'ai', ...model })}
                                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedModel?.local === model.local
                                                            ? 'border-gold-solid ring-2 ring-gold-solid/35'
                                                            : 'border-border hover:border-gold-muted'
                                                            }`}
                                                    >
                                                        <img
                                                            src={model.cloud}
                                                            alt="AI Model"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {selectedModel?.local === model.local && (
                                                            <div className="absolute inset-0 bg-gold-solid/20 flex items-center justify-center">
                                                                <div className="bg-gold-solid text-primary-foreground rounded-full p-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {availableModels.real_models.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-foreground mb-2">Real Models</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {availableModels.real_models.map((model, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedModel({ type: 'real', ...model })}
                                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedModel?.local === model.local
                                                            ? 'border-emerald-500 ring-2 ring-emerald-500/35'
                                                            : 'border-border hover:border-emerald-500/50'
                                                            }`}
                                                    >
                                                        <img
                                                            src={model.cloud}
                                                            alt="Real Model"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {selectedModel?.local === model.local && (
                                                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                                                <div className="bg-emerald-500 text-white rounded-full p-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 text-center truncate">
                                                            {model.name || 'Model'}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!selectedModel && useDifferentModel && (
                                        <p className="text-xs text-amber-400 mt-2">
                                            ⚠️ Please select a model to use for regeneration
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <ModelTierSelector
                            value={regenModelTier}
                            onChange={setRegenModelTier}
                            context={regenContext}
                            compact
                            className="mb-6"
                        />

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-foreground mb-3">
                                {useDifferentModel ? '📝 Using Original Prompt' : '✍️ Your Enhancement Instructions *'}
                            </label>
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                disabled={useDifferentModel}
                                className={`w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent min-h-[120px] resize-none text-foreground placeholder-muted-foreground ${useDifferentModel ? 'bg-accent/10 cursor-not-allowed opacity-60' : ''}`}
                                placeholder={useDifferentModel ? "Using original prompt from generated image..." : "Describe what you want to improve... (e.g., Make the background more vibrant, add soft shadows, change the lighting to golden hour, improve contrast...)"}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                {useDifferentModel
                                    ? '🔒 Prompt is locked when using a different model. The original prompt will be used automatically.'
                                    : '💬 Be specific about what you want to change or improve in the image'
                                }
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <X className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-red-400 text-sm font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!useDifferentModel && (
                            <div className="mb-6 p-4 bg-accent/10 rounded-xl border border-border">
                                <p className="text-xs font-semibold text-foreground mb-3">💡 Quick Enhancement Ideas:</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "Make colors more vibrant and saturated",
                                        "Add soft shadows and depth",
                                        "Change lighting to golden sunset",
                                        "Make background more blurred",
                                        "Add more contrast and sharpness",
                                        "Create a more elegant atmosphere",
                                        "Make it look more professional"
                                    ].map((example, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCustomPrompt(example)}
                                            className="text-xs px-3 py-2 bg-card border border-border rounded-lg hover:border-gold-solid hover:text-gold-solid text-foreground transition-all font-medium"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPromptModal(null)
                                    setCustomPrompt("")
                                    setError(null)
                                }}
                                className="px-6 border-border hover:bg-accent text-foreground hover:text-foreground bg-transparent"
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-gold-gradient text-primary-foreground font-semibold hover:brightness-110 px-6 border-0 shadow-md"
                                onClick={() => handleRegenerate(showPromptModal.product, showPromptModal.generatedImage)}
                                disabled={
                                    regenerating ||
                                    (useDifferentModel ? !selectedModel : !customPrompt.trim())
                                }
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {regenerating ? 'Enhancing...' : (useDifferentModel ? 'Generate with New Model' : 'Enhance Image')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
