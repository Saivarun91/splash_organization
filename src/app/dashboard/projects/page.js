"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Search, Clock, Users, Eye, Loader2 } from "lucide-react";
import { organizationAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const getTimeAgo = (dateString, t) => {
    if (!dateString) return t("orgPortal.unknown");
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
        return t("orgPortal.justNow");
    } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? t("orgPortal.hour") : t("orgPortal.hours")} ${t("orgPortal.ago")}`;
    } else if (diffInDays === 1) {
        return `1 ${t("orgPortal.day")} ${t("orgPortal.ago")}`;
    } else {
        return `${diffInDays} ${t("orgPortal.days")} ${t("orgPortal.ago")}`;
    }
};

const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
        case "active":
        case "progress":
            return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
        case "completed":
            return "bg-green-500/10 text-green-400 border border-green-500/20";
        case "draft":
        default:
            return "bg-secondary text-muted-foreground border border-border";
    }
};

const getStatusText = (status, t) => {
    switch (status?.toLowerCase()) {
        case "active":
        case "progress":
            return t("orgPortal.inProgress");
        case "completed":
            return t("orgPortal.completed");
        case "draft":
            return t("orgPortal.draft");
        default:
            return status || t("orgPortal.unknown");
    }
};

export default function ProjectsPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const orgId = localStorage.getItem("org_organization_id");
                if (!orgId) {
                    setLoading(false);
                    return;
                }

                setOrganizationId(orgId);
                const data = await organizationAPI.getOrganization(orgId);
                if (data.projects) {
                    // Projects already include image counts and members from backend
                    setProjects(data.projects);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.about && project.about.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus =
            statusFilter === "all" ||
            project.status?.toLowerCase() === statusFilter?.toLowerCase() ||
            (statusFilter === "progress" && project.status?.toLowerCase() === "active");
        return matchesSearch && matchesStatus;
    });

    const handleProjectClick = (project) => {
        // Use slug if available, otherwise fallback to ID
        const projectIdentifier = project.slug || project.id;
        router.push(`/dashboard/projects/${projectIdentifier}`);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-gold-solid animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t("orgPortal.loadingProjects")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="relative p-6 rounded-2xl border border-border bg-card shadow-md overflow-hidden animate-fadeIn">
                <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-tr from-gold-solid/20 to-gold-muted/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-foreground mb-1">{t("orgPortal.projects")}</h1>
                    <p className="text-sm text-muted-foreground">{t("orgPortal.manageAndMonitorProjects")}</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t("orgPortal.searchProjects")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    />
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">{t("orgPortal.filterByStatus")}</span>
                    {["all", "progress", "completed"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                statusFilter === status
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card text-card-foreground border border-border hover:bg-accent"
                            }`}
                        >
                            {status === "all"
                                ? t("orgPortal.all")
                                : status === "progress"
                                ? t("orgPortal.inProgress")
                                : t("orgPortal.completed")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => {
                        const updatedAt = project.updated_at || project.created_at;
                        const imageCount = project.totalImages || 0;
                        const collaborators = project.members || [];

                        return (
                            <div
                                key={project.id}
                                onClick={() => handleProjectClick(project)}
                                className="group bg-card text-card-foreground border border-border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-gold-muted/50"
                            >
                                {/* Header Section */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                        <FolderKanban className="w-7 h-7 text-primary-foreground" />
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(
                                            project.status
                                        )}`}
                                    >
                                        {getStatusText(project.status, t)}
                                    </span>
                                </div>

                                {/* Project Title and Description */}
                                <div className="mb-5">
                                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-gold-solid transition-colors">
                                        {project.name}
                                    </h3>
                                    {project.about && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{project.about}</p>
                                    )}
                                </div>

                                {/* Stats Section */}
                                <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-border">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                            {t("orgPortal.images")}
                                        </p>
                                        <p className="text-lg font-bold text-gold-solid">
                                            {imageCount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                            {t("orgPortal.updated")}
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {getTimeAgo(updatedAt, t)}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Section */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {collaborators.length > 0 ? (
                                            <>
                                                <div className="flex -space-x-2">
                                                    {collaborators.slice(0, 3).map((member, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-semibold text-primary-foreground border-2 border-card shadow-sm"
                                                            title={member.user_name || member.email || "Member"}
                                                        >
                                                            {(member.user_name || member.email || "A")
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    ))}
                                                </div>
                                                {collaborators.length > 3 && (
                                                    <span className="text-xs font-medium text-muted-foreground ml-1">
                                                        +{collaborators.length - 3} more
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">{t("orgPortal.noCollaborators")}</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold text-gold-solid group-hover:brightness-110 transition-colors flex items-center gap-1.5">
                                        <Eye size={16} />
                                        {t("orgPortal.viewDetails")}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg font-medium">{t("orgPortal.noProjectsFound")}</p>
                    <p className="text-muted-foreground/60 text-sm mt-2">
                        {searchQuery || statusFilter !== "all"
                            ? t("orgPortal.tryAdjustingSearchOrFilters")
                            : t("orgPortal.noProjectsYet")}
                    </p>
                </div>
            )}
        </div>
    );
}
