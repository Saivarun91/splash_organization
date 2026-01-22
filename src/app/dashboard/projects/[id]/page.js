"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FolderKanban, Workflow, Users, Image as ImageIcon, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminWorkflowTab } from "@/components/organization/AdminWorkflowTab";
import { AdminCollaboratorsTab } from "@/components/organization/AdminCollaboratorsTab";
import { ProjectImagesView } from "@/components/organization/ProjectImagesView";

// Mock data - replace with actual API calls
const mockProject = {
    id: 1,
    name: "Summer Collection 2024",
    about: "Vibrant summer fashion collection with beach themes",
    status: "progress",
    created_at: "2024-01-10",
    collection_id: "collection-1",
    members: [
        {
            user_id: "user-1",
            user_email: "john.doe@example.com",
            user_name: "John Doe",
            role: "owner",
        },
        {
            user_id: "user-2",
            user_email: "jane.smith@example.com",
            user_name: "Jane Smith",
            role: "editor",
        },
    ],
};

const mockCollectionData = {
    id: "collection-1",
    description: "Summer collection featuring vibrant colors, beach themes, and modern fashion",
    target_audience: "Young adults aged 18-35",
    campaign_season: "Summer 2024",
    items: [
        {
            selected_themes: ["Beach", "Tropical", "Casual"],
            selected_backgrounds: ["Ocean", "Beach", "Sunset"],
            selected_poses: ["Standing", "Walking", "Sitting"],
            selected_locations: ["Beach", "Resort", "Outdoor"],
            selected_colors: ["Blue", "Yellow", "White"],
            picked_colors: ["#3B82F6", "#FBBF24", "#FFFFFF"],
            color_instructions: "Use vibrant blues and yellows as primary colors",
            global_instructions: "Maintain a fresh, energetic, and modern aesthetic throughout all images",
            selected_model: {
                type: "ai",
                local_url: "/models/ai-model-1.jpg",
                cloud_url: "https://example.com/models/ai-model-1.jpg",
            },
            product_images: [
                {
                    uploaded_image_url: "https://example.com/products/product-1.jpg",
                    uploaded_image_path: "https://example.com/products/product-1.jpg",
                    generated_images: [
                        {
                            type: "white_background",
                            image_url: "https://example.com/generated/white-bg-1.jpg",
                            local_path: "https://example.com/generated/white-bg-1.jpg",
                            cloud_url: "https://example.com/generated/white-bg-1.jpg",
                            prompt: "Professional white background product photography with sharp focus and studio lighting",
                        },
                        {
                            type: "background_replace",
                            image_url: "https://example.com/generated/bg-replace-1.jpg",
                            local_path: "https://example.com/generated/bg-replace-1.jpg",
                            cloud_url: "https://example.com/generated/bg-replace-1.jpg",
                            prompt: "Product on beach background with ocean and sunset, vibrant colors",
                        },
                        {
                            type: "model_image",
                            image_url: "https://example.com/generated/model-1.jpg",
                            local_path: "https://example.com/generated/model-1.jpg",
                            cloud_url: "https://example.com/generated/model-1.jpg",
                            prompt: "Model wearing summer collection on beach, standing pose, vibrant blue and yellow colors",
                        },
                        {
                            type: "campaign_image",
                            image_url: "https://example.com/generated/campaign-1.jpg",
                            local_path: "https://example.com/generated/campaign-1.jpg",
                            cloud_url: "https://example.com/generated/campaign-1.jpg",
                            prompt: "Campaign shot featuring model in summer collection at beach resort, energetic and modern aesthetic",
                        },
                    ],
                },
            ],
        },
    ],
    generated_prompts: {
        white_background: "Professional white background product photography with sharp focus and studio lighting",
        background_replace: "Product on beach background with ocean and sunset, vibrant colors, maintaining product integrity",
        model_image: "Model wearing summer collection on beach, standing pose, vibrant blue and yellow colors, exact same model appearance",
        campaign_image: "Campaign shot featuring model in summer collection at beach resort, energetic and modern aesthetic, cohesive style",
    },
};

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [collectionData, setCollectionData] = useState(null);
    const [activeTab, setActiveTab] = useState("workflow");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In real app, fetch project data based on params.id
        // For now, using mock data
        setProject(mockProject);
        setCollectionData(mockCollectionData);
        setLoading(false);
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="text-gray-500">Loading project...</div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Project not found</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Projects</span>
            </button>

            {/* Project Detail View */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <FolderKanban className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                            <p className="text-sm text-gray-600 mt-1">{project.about || "No description"}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="border-b border-gray-200 bg-white px-6">
                            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b-0">
                                <TabsTrigger
                                    value="workflow"
                                    className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50"
                                >
                                    <Workflow size={18} className="mr-2" />
                                    Workflow
                                </TabsTrigger>
                                <TabsTrigger
                                    value="collaborators"
                                    className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50"
                                >
                                    <Users size={18} className="mr-2" />
                                    Collaborators
                                </TabsTrigger>
                                <TabsTrigger
                                    value="images"
                                    className="rounded-none border-b-2 border-transparent px-6 py-4 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50"
                                >
                                    <ImageIcon size={18} className="mr-2" />
                                    Image Analysis
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <TabsContent value="workflow" className="m-0 p-6">
                                <AdminWorkflowTab project={project} collectionData={collectionData} />
                            </TabsContent>

                            <TabsContent value="collaborators" className="m-0 p-6">
                                <AdminCollaboratorsTab project={project} />
                            </TabsContent>

                            <TabsContent value="images" className="m-0 p-6">
                                <ProjectImagesView project={project} collectionData={collectionData} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
