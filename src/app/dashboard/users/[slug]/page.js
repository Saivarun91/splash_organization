"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    User, 
    Mail, 
    Calendar, 
    Image as ImageIcon, 
    FolderKanban, 
    CreditCard, 
    ArrowLeft, 
    Loader2,
    ExternalLink
} from "lucide-react";
import { organizationAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
        case "owner":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "chief_editor":
        case "creative_head":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "member":
            return "bg-green-100 text-green-800 border-green-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const getRoleDisplayName = (role, t) => {
    if (!role) return t("orgPortal.member");
    switch (role.toLowerCase()) {
        case "owner":
            return t("orgPortal.owner");
        case "chief_editor":
            return t("orgPortal.chiefEditor");
        case "creative_head":
            return t("orgPortal.creativeHead");
        case "member":
            return t("orgPortal.member");
        default:
            return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ");
    }
};

export default function UserDetailPage({ params }) {
    const router = useRouter();
    const { t } = useLanguage();
    const resolvedParams = use(params);
    const userSlug = resolvedParams.slug;
    
    const [user, setUser] = useState(null);
    const [images, setImages] = useState([]);
    const [projects, setProjects] = useState([]);
    const [creditHistory, setCreditHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [organizationId, setOrganizationId] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [imagesPage, setImagesPage] = useState(1);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [imagesHasMore, setImagesHasMore] = useState(true);
    const [imagesTotal, setImagesTotal] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const orgId = localStorage.getItem("org_organization_id");
                if (!orgId) {
                    setError("Organization ID not found");
                    setLoading(false);
                    return;
                }

                setOrganizationId(orgId);

                // Fetch user data
                const userData = await organizationAPI.getUserBySlug(orgId, userSlug);
                setUser(userData);

                // Fetch user projects
                const projectsData = await organizationAPI.getUserProjects(orgId, userSlug);
                console.log("Projects data:", projectsData);
                setProjects(projectsData.projects || []);

                // Fetch credit history
                const creditData = await organizationAPI.getUserCreditHistory(orgId, userSlug);
                setCreditHistory(creditData.entries || []);

                // Don't fetch images immediately - let them load separately
                // Images will be loaded when user clicks on Images tab or when component mounts
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError(err.message || "Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        if (userSlug) {
            fetchUserData();
        }
    }, [userSlug]);

    const fetchImages = async (orgId, slug, page = 1, append = false) => {
        try {
            setImagesLoading(true);
            const limit = 20; // Load 20 images per page
            const imagesData = await organizationAPI.getUserImages(orgId, slug, { page, limit });
            console.log("Images data:", imagesData);
            console.log("Total images:", imagesData.pagination?.total || imagesData.images?.length || 0);
            
            // Filter out images without valid URLs
            const validImages = (imagesData.images || []).filter((img) => {
                const url = img.generated_image_url || img.image_url;
                return typeof url === "string" && url.trim().length > 0;
            });
            
            console.log("Valid images:", validImages.length);
            
            if (append) {
                setImages(prev => [...prev, ...validImages]);
            } else {
                setImages(validImages);
            }
            
            const total = imagesData.pagination?.total || 0;
            const pages = imagesData.pagination?.pages || 1;
            
            setImagesPage(page);
            setImagesTotal(total);
            setImagesHasMore(page < pages && validImages.length === limit);
        } catch (err) {
            console.error("Error fetching images:", err);
        } finally {
            setImagesLoading(false);
        }
    };

    // Load more images when scrolling to bottom
    const loadMoreImages = useCallback(() => {
        if (!imagesLoading && imagesHasMore && organizationId && userSlug) {
            setImagesPage(prev => {
                const nextPage = prev + 1;
                fetchImages(organizationId, userSlug, nextPage, true);
                return nextPage;
            });
        }
    }, [imagesLoading, imagesHasMore, organizationId, userSlug, fetchImages]);

    // Intersection Observer for lazy loading
    const observerRef = useRef(null);
    const lastImageElementRef = useCallback((node) => {
        if (imagesLoading) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && imagesHasMore) {
                loadMoreImages();
            }
        });
        if (node) observerRef.current.observe(node);
    }, [imagesLoading, imagesHasMore, loadMoreImages]);

    // Load images when Images tab is clicked
    useEffect(() => {
        if (activeTab === "images" && images.length === 0 && !imagesLoading && organizationId && userSlug) {
            fetchImages(organizationId, userSlug, 1, false);
        }
    }, [activeTab, organizationId, userSlug]);

    useEffect(() => {
        if (organizationId && userSlug && images.length === 0 && !imagesLoading) {
          fetchImages(organizationId, userSlug, 1, false);
        }
      }, [organizationId, userSlug]);
      
    const getImageSrc = (image) => {
        const url =
          image.generated_image_url?.trim() ||
          image.image_url?.trim();
      
        return url || "/placeholder.png";
      };
      
    const handleProjectClick = (project, e) => {
        e?.preventDefault();
        const projectSlug = project.slug || project.id;
        const url = `/dashboard/projects/${projectSlug}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {error ? "Error loading user" : "User not found"}
                    </h1>
                    {error && <p className="text-red-600 mb-4">{error}</p>}
                    <Link
                        href="/dashboard/users"
                        className="text-blue-600 hover:underline flex items-center gap-2 justify-center"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/dashboard/users"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user.full_name || user.email}</h1>
                    <p className="text-gray-600">User Details</p>
                </div>
            </div>

            {/* User Info Card */}
            <div className="bg-card text-card-foreground border border-border rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-600">Full Name</p>
                            <p className="font-semibold">{user.full_name || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={getRoleColor(user.organization_role)}>
                            {getRoleDisplayName(user.organization_role, t)}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-600">Joined</p>
                            <p className="font-semibold">{formatDate(user.created_at)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card text-card-foreground border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FolderKanban className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-gray-600">Projects</p>
                    </div>
                    <p className="text-3xl font-bold">{projects.length}</p>
                </div>
                <div className="bg-card text-card-foreground border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <ImageIcon className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-gray-600">Images Generated</p>
                    </div>
                    <p className="text-3xl font-bold">{images.length}</p>
                </div>
                <div className="bg-card text-card-foreground border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <p className="text-sm text-gray-600">Credit Transactions</p>
                    </div>
                    <p className="text-3xl font-bold">{creditHistory.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-4 px-2 border-b-2 transition-colors ${
                            activeTab === "overview"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("projects")}
                        className={`pb-4 px-2 border-b-2 transition-colors ${
                            activeTab === "projects"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Projects 
                    </button>
                    <button
                        onClick={() => setActiveTab("images")}
                        className={`pb-4 px-2 border-b-2 transition-colors ${
                            activeTab === "images"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Images 
                    </button>
                    <button
                        onClick={() => setActiveTab("credits")}
                        className={`pb-4 px-2 border-b-2 transition-colors ${
                            activeTab === "credits"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Credit History 
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Projects Preview */}
                        <div>
                            <h2 className="text-xl font-bold mb-4">Recent Projects</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.slice(0, 6).map((project) => (
                                    <div
                                        key={project.id}
                                        onClick={(e) => handleProjectClick(project, e)}
                                        className="bg-card text-card-foreground border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                                    >
                                        <h3 className="font-semibold mb-2">{project.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {project.about || "No description"}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{formatDate(project.created_at)}</span>
                                            <span className="flex items-center gap-1">
                                                <ImageIcon className="w-3 h-3" />
                                                {project.totalImages || 0}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {projects.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No projects found</p>
                            )}
                        </div>

                        {/* Images Preview */}
{/* Images Preview */}
<div>
  <h2 className="text-xl font-bold mb-4">Recent Images</h2>

  {/* 🔄 Loading state */}
  {imagesLoading && images.length === 0 && (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-lg border border-border bg-gray-100 animate-pulse flex items-center justify-center"
        >
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ))}
    </div>
  )}

  {/* 🖼 Images loaded */}
  {!imagesLoading && images.length > 0 && (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {images.slice(0, 12).map((image) => (
        <div
          key={image.id}
          className="aspect-square rounded-lg overflow-hidden border border-border hover:shadow-md transition-all cursor-pointer"
        >
          <img
            src={getImageSrc(image)}
            alt={image.prompt || "Generated image"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        </div>
      ))}
    </div>
  )}

  {/* ⏳ Not loaded yet */}
  {!imagesLoading && images.length === 0 && (
    <button
      onClick={() => {
        setActiveTab("images");
        if (organizationId && userSlug) {
          fetchImages(organizationId, userSlug, 1, false);
        }
      }}
      className="text-blue-600 hover:underline text-sm"
    >
      
    </button>
  )}

  {/* ➡️ View all */}
  {/* {images.length > 12 && (
    <button
      onClick={() => setActiveTab("images")}
      className="mt-4 text-blue-600 hover:underline text-sm"
    >
      View all {imagesTotal || images.length} images →
    </button>
  )} */}
</div>

                    </div>
                )}

                {activeTab === "projects" && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={(e) => handleProjectClick(project, e)}
                                    className="bg-card text-card-foreground border border-border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                                            {project.name}
                                        </h3>
                                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                        {project.about || "No description"}
                                    </p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            {formatDate(project.created_at)}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-600">
                                            <ImageIcon className="w-4 h-4" />
                                            {project.totalImages || 0} images
                                        </span>
                                    </div>
                                    {project.status && (
                                        <Badge className="mt-3" variant="outline">
                                            {project.status}
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                        {projects.length === 0 && (
                            <p className="text-gray-500 text-center py-12">No projects found</p>
                        )}
                    </div>
                )}

{activeTab === "images" && (
  <div>
    {imagesTotal > 0 && (
      <div className="mb-4 text-sm text-gray-600">
        {/* Showing {images.length} of {imagesTotal} images */}
      </div>
    )}
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {images.map((image, index) => {
        const imageSrc =
          image.generated_image_url?.trim() ||
          image.image_url?.trim() ||
          "/placeholder.png";
        
        const isLastImage = index === images.length - 1;

        return (
          <div
            key={image.id}
            ref={isLastImage ? lastImageElementRef : null}
            className="aspect-square rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all cursor-pointer group relative"
          >
            <img
              src={imageSrc}
              alt={image.prompt || "Generated image"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://via.placeholder.com/300x300?text=No+Image";
              }}
            />

            {image.prompt && (
              <div
                className="
                  absolute inset-0
                  pointer-events-none
                  bg-black/0
                  group-hover:bg-black/60
                  transition-colors
                  p-2
                  flex items-end
                "
              >
                <p className="text-white text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.prompt}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>

    {imagesLoading && (
      <div className="text-center py-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm text-gray-500 mt-2">Loading more images...</p>
      </div>
    )}

    {images.length === 0 && !imagesLoading && (
      <p className="text-gray-500 text-center py-12">No images found</p>
    )}

    {!imagesHasMore && images.length > 0 && (
      <p className="text-gray-500 text-center py-4 text-sm">
        All images loaded ({images.length} total)
      </p>
    )}
  </div>
)}


                {activeTab === "credits" && (
                    <div>
                        <div className="bg-card text-card-foreground border border-border rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Credits
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Balance After
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Reason
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {creditHistory.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDateTime(entry.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge
                                                        variant={
                                                            entry.change_type === "deduction"
                                                                ? "destructive"
                                                                : "default"
                                                        }
                                                    >
                                                        {entry.change_type}
                                                    </Badge>
                                                </td>
                                                <td
                                                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                                        entry.change_type === "deduction"
                                                            ? "text-red-600"
                                                            : "text-green-600"
                                                    }`}
                                                >
                                                    {entry.change_type === "deduction" ? "-" : "+"}
                                                    {entry.credits_changed || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {entry.balance_after || 0}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {entry.reason || "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {creditHistory.length === 0 && (
                            <p className="text-gray-500 text-center py-12">No credit history found</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
