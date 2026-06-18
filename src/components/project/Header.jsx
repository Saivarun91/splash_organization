"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Edit2, Trash2, CheckCircle, Clock, Loader2 } from "lucide-react"
import { organizationAPI } from "@/lib/api"
import { useLanguage } from "@/context/LanguageContext"
import toast from "react-hot-toast"

export function Header({ project, onProjectUpdate }) {
    const router = useRouter()
    const { t } = useLanguage()
    const [updating, setUpdating] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editName, setEditName] = useState("")
    const [editDescription, setEditDescription] = useState("")

    // Normalize incoming data
    const projectData = {
        id: project?.id,
        title: project?.title || project?.name || t("images.untitledProject"),
        description: project?.description || project?.about || "",
        status: project?.status?.toLowerCase() || "progress",
        userRole: project?.userRole || "owner",
    }

    const getInitial = (title) => (title ? title.charAt(0).toUpperCase() : "?")

    const isCompleted = projectData.status === "completed"

    // Update edit fields when project prop changes
    useEffect(() => {
        if (project) {
            const currentTitle = project?.title || project?.name || t("images.untitledProject")
            const currentDescription = project?.description || project?.about || ""
            setEditName(currentTitle)
            setEditDescription(currentDescription)
        }
    }, [project])

    // Toggle between only "progress" and "completed"
    const handleStatusToggle = async () => {
        const newStatus = isCompleted ? "progress" : "completed"
        setUpdating(true)

        try {
            const response = await organizationAPI.updateProjectStatus(projectData.id, newStatus)

            if (response.status || response.id) {
                onProjectUpdate?.({ ...projectData, status: newStatus })
            }
        } catch (error) {
            console.error("Error updating project status:", error)
            toast.error(t("images.failedToUpdate"))
        } finally {
            setUpdating(false)
        }
    }

    // Styling based on status
    const getStatusStyle = () => {
        if (isCompleted) {
            return {
                border: "border-emerald-500/20",
                bg: "bg-emerald-500/10",
                dot: "bg-emerald-400",
                text: "text-emerald-400",
            }
        }
        return {
            border: "border-amber-500/20",
            bg: "bg-amber-500/10",
            dot: "bg-amber-400",
            text: "text-amber-400",
        }
    }

    const statusStyle = getStatusStyle()

    // Human-readable display label
    const displayStatus =
        projectData.status === "progress" ? (t("images.inProgress") || "In Progress") : (t("images.completed") || "Completed")

    // Handle edit button click
    const handleEditClick = () => {
        // Use the latest project data when opening the modal
        const currentTitle = project?.title || project?.name || "Untitled Project"
        const currentDescription = project?.description || project?.about || ""
        setEditName(currentTitle)
        setEditDescription(currentDescription)
        setIsEditModalOpen(true)
    }

    // Handle save project changes
    const handleSaveProject = async () => {
        if (!editName.trim()) {
            toast.error(t("images.projectNameRequired") || "Project name is required")
            return
        }

        setIsSaving(true)
        try {
            const response = await organizationAPI.updateProject(
                projectData.id,
                {
                    name: editName.trim(),
                    about: editDescription.trim(),
                }
            )

            if (response.id || response.name) {
                // Update parent with backend response format
                onProjectUpdate?.({
                    ...project,
                    name: response.name || editName.trim(),
                    about: response.about || editDescription.trim(),
                    status: response.status || projectData.status,
                })
                setIsEditModalOpen(false)
                toast.success(t("images.projectUpdated") || "Project updated successfully")
            }
        } catch (error) {
            console.error("Error updating project:", error)
            toast.error(t("images.failedToUpdate") || "Failed to update project")
        } finally {
            setIsSaving(false)
        }
    }

    // Handle delete project
    const handleDeleteProject = async () => {
        if (!confirm(t("images.deleteConfirm") || "Are you sure you want to delete this project?")) {
            return
        }

        setIsDeleting(true)
        try {
            await organizationAPI.deleteProject(projectData.id)

            toast.success("Project deleted successfully")
            router.push("/dashboard/projects")
        } catch (error) {
            console.error("Error deleting project:", error)
            toast.error("Failed to delete project. Please try again.")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="border-b border-border bg-card px-8 py-6 text-foreground">
            <div className="flex items-center justify-between">
                {/* Left section: Title + Status */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center text-primary-foreground shadow-sm">
                            <span className="text-sm font-bold">
                                {getInitial(projectData.title)}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {projectData.title}
                        </h1>
                    </div>

                    {/* Status badge */}
                    <div className="ml-4">
                        <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusStyle.border} ${statusStyle.bg}`}
                        >
                            <div
                                className={`w-2.5 h-2.5 ${statusStyle.dot} rounded-full ${isCompleted ? "" : "animate-pulse"
                                    }`}
                            ></div>
                            <span className={`text-sm font-semibold ${statusStyle.text}`}>
                                {displayStatus}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Right section: Action buttons */}
                {projectData.userRole === "owner" && (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className={`gap-2 border-0 font-semibold ${isCompleted
                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                }`}
                            onClick={handleStatusToggle}
                            disabled={updating}
                        >
                            {isCompleted ? (
                                <>
                                    <Clock className="w-4 h-4" />
                                    {updating ? (t("common.loading") || "Loading...") : (t("images.markAsInProgress") || "Mark as In Progress")}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    {updating ? (t("common.loading") || "Loading...") : (t("images.markAsCompleted") || "Mark as Completed")}
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-border text-foreground hover:bg-accent bg-transparent"
                            onClick={handleEditClick}
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </Button>

                        <Button
                            size="sm"
                            className="gap-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            onClick={handleDeleteProject}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {(t("images.deleting") || "Deleting...")}
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    {(t("images.deleteProject") || "Delete Project")}
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit Project Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Edit Project</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {t("images.updateProjectDetails") || "Update details of your project below."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="project-name" className="text-sm font-semibold text-foreground">
                                {t("images.projectName") || "Project Name"}
                            </label>
                            <Input
                                id="project-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder={t("images.enterProjectName") || "Enter project name"}
                                disabled={isSaving}
                                className="bg-background border-border text-foreground focus:ring-2 focus:ring-gold-solid/40"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="project-description" className="text-sm font-semibold text-foreground">
                                {t("images.projectDescription") || "Project Description"}
                            </label>
                            <Textarea
                                id="project-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder={t("images.enterProjectDescription") || "Enter description"}
                                rows={4}
                                disabled={isSaving}
                                className="bg-background border-border text-foreground focus:ring-2 focus:ring-gold-solid/40"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={isSaving}
                            className="border-border hover:bg-accent text-foreground hover:text-foreground bg-transparent"
                        >
                            {t("images.cancel") || "Cancel"}
                        </Button>
                        <Button
                            onClick={handleSaveProject}
                            disabled={isSaving || !editName.trim()}
                            className="bg-gold-gradient text-primary-foreground font-semibold hover:brightness-110 border-0 shadow-md"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t("profile.saving") || "Saving..."}
                                </>
                            ) : (
                                t("images.saveChanges") || "Save changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
