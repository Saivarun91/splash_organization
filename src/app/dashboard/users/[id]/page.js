"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, FolderKanban, Image as ImageIcon, User, Shield, Crown, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";


// Mock data - replace with actual API call
const getRoleIcon = (role) => {
    switch (role) {
        case "owner":
            return <Crown className="w-4 h-4" />;
        case "chief_editor":
            return <Shield className="w-4 h-4" />;
        case "creative_head":
            return <CreativeHead className="w-4 h-4" />;
        default:
            return <User className="w-4 h-4" />;
    }
}; 

const getRoleColor = (role) => {
    switch (role) {
        case "owner":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "chief_editor":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "creative_head":
            return "bg-green-100 text-green-800 border-green-200";
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
                onClick={() => router.push("/dashboard/users")}
                className="flex items-center gap-2 mb-6"
            >
                <ArrowLeft className="w-5 h-5 text-gray-600 hover:text-gray-900" />
                <span className="text-gray-600 hover:text-gray-900">{t("orgPortal.backToUsers")}</span>
            </button>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-2xl">
                        {user.full_name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge
                                className={getRoleColor(user.organization_role)}
                            >
                                {getRoleDisplayName(user.organization_role, t)}
                            </Badge>
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
                            <p className="text-sm text-gray-600">{t("orgPortal.projects")}</p>
                            <p className="text-3xl font-bold text-gray-900">{user.projects_count}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{t("orgPortal.imagesGenerated")}</p>
                            <p className="text-3xl font-bold text-gray-900">{user.images_generated}</p>
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
                        className={`px-6 py-4 font-medium transition-colors rounded-t-lg ${
                            activeTab === "projects"
                                ? "bg-blue-500 text-white border-b-2 border-blue-600"
                                : "bg-gray-100 text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => setActiveTab("images")}
                        className={`px-6 py-4 font-medium transition-colors rounded-t-lg ${
                            activeTab === "images"
                                ? "bg-blue-500 text-white border-b-2 border-blue-600"
                                : "bg-gray-100 text-gray-600 hover:text-gray-900"
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
                                    {user.projects.map((project) => (
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
                                            <p className="text-sm text-gray-600">{t("orgPortal.role")}: {project.organization_role}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="flex-1">
                                {selectedProject ? (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">
                                            {t("orgPortal.teamMembers")} - {selectedProject.title}
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedProject.users.map((member) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                        {member.full_name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{member.full_name}</h4>
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
                                            <p className="text-xs text-gray-600">{image.date_created}</p>
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
