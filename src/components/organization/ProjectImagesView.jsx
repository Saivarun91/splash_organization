"use client";

import { useState } from "react";
import { FolderKanban, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProjectImagesView({ project, collectionData }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedProject, setSelectedProject] = useState(project);

    // Mock projects list - Replace with actual API call
    const projects = project ? [project] : [];

    // Get all images from the selected project
    const getProjectImages = () => {
        if (!selectedProject || !collectionData?.items?.[0]?.product_images) return [];

        const productImages = collectionData.items[0].product_images;
        const images = [];

        productImages.forEach((product, productIdx) => {
            if (product.generated_images) {
                product.generated_images.forEach((genImage, imgIdx) => {
                    images.push({
                        id: `project-${selectedProject.id}-product-${productIdx}-img-${imgIdx}`,
                        projectId: selectedProject.id,
                        projectName: selectedProject.name,
                        productIndex: productIdx,
                        imageIndex: imgIdx,
                        type: genImage.type,
                        imageUrl: genImage.image_url || genImage.local_path || genImage.cloud_url,
                        prompt: genImage.prompt,
                        productImage: product.uploaded_image_url || product.uploaded_image_path,
                        collectionData: collectionData,
                    });
                });
            }
        });

        return images;
    };

    const projectImages = getProjectImages();

    const getImageTypeBadge = (type) => {
        const badges = {
            white_background: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
            background_replace: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            model_image: "bg-gold-solid/10 text-gold-solid border border-gold-muted",
            campaign_image: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        };
        return badges[type] || "bg-secondary text-muted-foreground border border-border";
    };

    return (
        <div className="space-y-6">
            {/* Project Selector */}
            {projects.length > 1 && (
                <div className="bg-accent/10 rounded-lg p-4 border border-border">
                    <label className="block text-sm font-semibold text-foreground mb-2">Select Project</label>
                    <select
                        value={selectedProject?.id || ""}
                        onChange={(e) => {
                            const proj = projects.find((p) => p.id === e.target.value);
                            setSelectedProject(proj);
                            setSelectedImage(null);
                        }}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-gold-solid/40"
                    >
                        {projects.map((proj) => (
                            <option key={proj.id} value={proj.id}>
                                {proj.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Project Info */}
            {selectedProject && (
                <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground">{selectedProject.name}</h4>
                            <p className="text-sm text-muted-foreground">{projectImages.length} generated image(s)</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Images Grid */}
            {projectImages.length > 0 ? (
                <div>
                    <h4 className="text-lg font-semibold text-foreground mb-4">Generated Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {projectImages.map((image) => (
                            <div
                                key={image.id}
                                onClick={() => setSelectedImage(image)}
                                className="relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-card cursor-pointer hover:border-gold-solid transition-all hover:shadow-lg group"
                            >
                                <img
                                    src={image.imageUrl || "/placeholder.jpg"}
                                    alt={`${image.type} image`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`${getImageTypeBadge(image.type)} text-xs px-2 py-0.5 rounded-full font-semibold border`}>
                                        {image.type?.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-accent/10 rounded-lg border border-border">
                    <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg font-medium">No images found</p>
                    <p className="text-muted-foreground text-sm mt-2">
                        {selectedProject
                            ? "This project has no generated images yet."
                            : "Please select a project to view images."}
                    </p>
                </div>
            )}
        </div>
    );
}
