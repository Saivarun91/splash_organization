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
            white_background: "bg-blue-100 text-blue-800",
            background_replace: "bg-green-100 text-green-800",
            model_image: "bg-purple-100 text-purple-800",
            campaign_image: "bg-orange-100 text-orange-800",
        };
        return badges[type] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="space-y-6">
            {/* Project Selector */}
            {projects.length > 1 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                    <select
                        value={selectedProject?.id || ""}
                        onChange={(e) => {
                            const proj = projects.find((p) => p.id === e.target.value);
                            setSelectedProject(proj);
                            setSelectedImage(null);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
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
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">{selectedProject.name}</h4>
                            <p className="text-sm text-gray-600">{projectImages.length} generated image(s)</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Images Grid */}
            {projectImages.length > 0 ? (
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Generated Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {projectImages.map((image) => (
                            <div
                                key={image.id}
                                onClick={() => setSelectedImage(image)}
                                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 cursor-pointer hover:border-blue-500 transition-all hover:shadow-lg group"
                            >
                                <img
                                    src={image.imageUrl || "/placeholder.jpg"}
                                    alt={`${image.type} image`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <Badge className={getImageTypeBadge(image.type)}>
                                        {image.type?.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                                    </Badge>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">No images found</p>
                    <p className="text-gray-500 text-sm mt-2">
                        {selectedProject
                            ? "This project has no generated images yet."
                            : "Please select a project to view images."}
                    </p>
                </div>
            )}
        </div>
    );
}
