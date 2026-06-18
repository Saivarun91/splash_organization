import { useState, useEffect } from "react"
import { ProductImagesDisplay } from "./product-images-display"
import { organizationAPI } from "@/lib/api"

export function ImageGrid({ project, collectionData: initialCollectionData, onDataRefresh, canEdit = true }) {
    const [collectionData, setCollectionData] = useState(initialCollectionData)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        setCollectionData(initialCollectionData)
    }, [initialCollectionData])

    const handleRegenerateSuccess = async () => {
        // Refresh the collection data to show new regenerated image
        const collectionId = project?.collection?.id || project?.collection_id
        if (!collectionId) return

        try {
            setRefreshing(true)
            const updatedData = await organizationAPI.getCollection(collectionId)
            setCollectionData(updatedData)

            // Notify parent component if callback is provided
            if (onDataRefresh) {
                onDataRefresh(updatedData)
            }
        } catch (error) {
            console.error('Error refreshing collection data:', error)
        } finally {
            setRefreshing(false)
        }
    }

    if (!collectionData?.items?.[0]?.product_images || collectionData.items[0].product_images.length === 0) {
        return (
            <div className="mb-12 text-foreground">
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card/50">
                    <p className="text-muted-foreground mb-2">No images generated yet</p>
                    <p className="text-sm text-muted-foreground">
                        Click "Generate Product Images" above to create your final images
                    </p>
                </div>
            </div>
        )
    }

    const hasAnyGeneratedImages = collectionData.items[0].product_images.some(
        product => product.generated_images && product.generated_images.length > 0
    )

    if (!hasAnyGeneratedImages) {
        return (
            <div className="mb-12 text-foreground">
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card/50">
                    <p className="text-muted-foreground mb-2">No images generated yet</p>
                    <p className="text-sm text-muted-foreground">
                        Click "Generate Product Images" above to create your final images
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {refreshing && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                    <p className="text-sm">
                        ✨ Refreshing images...
                    </p>
                </div>
            )}
            <ProductImagesDisplay
                collectionData={collectionData}
                showRegenerate={canEdit}
                onRegenerateSuccess={handleRegenerateSuccess}
                canEdit={canEdit}
            />
        </div>
    )
}
