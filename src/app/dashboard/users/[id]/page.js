"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, FolderKanban, Image as ImageIcon, User, Shield, Crown } from "lucide-react";

// Mock data - replace with actual API calls
const mockUserProjects = [
    {
        id: 1,
        name: "Summer Collection 2024",
        role: "Project Manager",
        teamMembers: [
            { id: 1, name: "John Doe", role: "Project Manager", email: "john.doe@example.com" },
            { id: 2, name: "Jane Smith", role: "Designer", email: "jane.smith@example.com" },
            { id: 3, name: "Mike Johnson", role: "Editor", email: "mike.johnson@example.com" },
        ],
    },
    {
        id: 2,
        name: "Jewelry Catalog",
        role: "Designer",
        teamMembers: [
            { id: 1, name: "John Doe", role: "Project Manager", email: "john.doe@example.com" },
            { id: 3, name: "Mike Johnson", role: "Designer", email: "mike.johnson@example.com" },
            { id: 4, name: "Sarah Williams", role: "Editor", email: "sarah.williams@example.com" },
        ],
    },
    {
        id: 3,
        name: "Product Showcase",
        role: "Editor",
        teamMembers: [
            { id: 1, name: "John Doe", role: "Project Manager", email: "john.doe@example.com" },
            { id: 2, name: "Jane Smith", role: "Designer", email: "jane.smith@example.com" },
            { id: 5, name: "David Brown", role: "Editor", email: "david.brown@example.com" },
        ],
    },
];

const mockUserImages = [
    { id: 1, url: "/api/placeholder/300/300", name: "Image 1", createdAt: "2024-01-15" },
    { id: 2, url: "/api/placeholder/300/300", name: "Image 2", createdAt: "2024-01-14" },
    { id: 3, url: "/api/placeholder/300/300", name: "Image 3", createdAt: "2024-01-13" },
    { id: 4, url: "/api/placeholder/300/300", name: "Image 4", createdAt: "2024-01-12" },
    { id: 5, url: "/api/placeholder/300/300", name: "Image 5", createdAt: "2024-01-11" },
    { id: 6, url: "/api/placeholder/300/300", name: "Image 6", createdAt: "2024-01-10" },
];

const mockUser = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    projectsCount: 12,
    imagesGenerated: 245,
};

const getRoleIcon = (role) => {
    switch (role) {
        case "Admin":
            return <Crown className="w-4 h-4" />;
        case "Manager":
            return <Shield className="w-4 h-4" />;
        default:
            return <User className="w-4 h-4" />;
    }
};

const getRoleColor = (role) => {
    switch (role) {
        case "Admin":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "Manager":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "Designer":
            return "bg-green-100 text-green-800 border-green-200";
        case "Editor":
            return "bg-orange-100 text-orange-800 border-orange-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

export default function UserDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id;
    const [activeTab, setActiveTab] = useState("projects");
    const [selectedProject, setSelectedProject] = useState(null);

    // In real app, fetch user data based on userId
    const user = mockUser;
    const userProjects = mockUserProjects;
    const userImages = mockUserImages;

    const handleProjectClick = (project) => {
        setSelectedProject(project);
    };

    return (
        <div className="p-8">
            {/* Header */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Users</span>
            </button>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-2xl">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span
                                className={`px-3 py-1 rounded text-sm font-medium border flex items-center gap-1 ${getRoleColor(
                                    user.role
                                )}`}
                            >
                                {getRoleIcon(user.role)}
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <FolderKanban className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Projects</p>
                            <p className="text-3xl font-bold text-gray-900">{user.projectsCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Images Generated</p>
                            <p className="text-3xl font-bold text-gray-900">{user.imagesGenerated}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => {
                            setActiveTab("projects");
                            setSelectedProject(null);
                        }}
                        className={`px-6 py-4 font-medium transition-colors ${
                            activeTab === "projects"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => setActiveTab("images")}
                        className={`px-6 py-4 font-medium transition-colors ${
                            activeTab === "images"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Images
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === "projects" ? (
                        <div className="flex gap-6">
                            {/* Projects List */}
                            <div className="w-1/3 border-r border-gray-200 pr-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Projects</h3>
                                <div className="space-y-3">
                                    {userProjects.map((project) => (
                                        <div
                                            key={project.id}
                                            onClick={() => handleProjectClick(project)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                selectedProject?.id === project.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                                            }`}
                                        >
                                            <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
                                            <p className="text-sm text-gray-600">Role: {project.role}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="flex-1">
                                {selectedProject ? (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">
                                            Team Members - {selectedProject.name}
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedProject.teamMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                                                        <p className="text-sm text-gray-600">{member.email}</p>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className={`px-3 py-1 rounded text-sm font-medium border ${
                                                                member.id === user.id
                                                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                                                    : getRoleColor(member.role)
                                                            }`}
                                                        >
                                                            {member.role}
                                                            {member.id === user.id && " (You)"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <p>Select a project to view team members</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Images Generated</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {userImages.map((image) => (
                                    <div
                                        key={image.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                            <ImageIcon className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-sm font-medium text-gray-900">{image.name}</p>
                                            <p className="text-xs text-gray-600">{image.createdAt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
