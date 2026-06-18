"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Copy,
    UserPlus,
    Users,
    Mail,
    Crown,
    Edit3,
    Eye,
    MoreVertical,
    Star,
    Loader2,
    CheckCircle,
    UserCog,
} from "lucide-react"
import InviteModal from "@/components/project/InviteModal"
import { organizationAPI } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function CollaboratorsTab({ projectId, projectData, project }) {
    // Use project prop if available, otherwise use projectId/projectData
    const actualProjectId = project?.id || project?.slug || projectId
    const actualProjectData = project || projectData
    const { token, user } = useAuth()
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [inviteLoading, setInviteLoading] = useState(false)
    const [teamMembers, setTeamMembers] = useState([])
    const [pendingInvites, setPendingInvites] = useState([])
    const [loading, setLoading] = useState(true)
    const [successMessage, setSuccessMessage] = useState("")
    const [roleChangeLoading, setRoleChangeLoading] = useState(null)

    useEffect(() => {
        if (projectId) {
            fetchProjectData()
            fetchPendingInvites()
        }
    }, [projectId])

    const fetchProjectData = async () => {
        try {
            setLoading(true)
            const data = await organizationAPI.getProject(projectId)
            // team_members now has: user_id, user_email, user_name, role
            setTeamMembers(data.team_members || [])
        } catch (err) {
            console.error("Error fetching project data:", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPendingInvites = async () => {
        try {
            const data = await organizationAPI.listInvites(projectId)
            setPendingInvites(data.pending_invites || [])
        } catch (err) {
            console.error("Error fetching invites:", err)
        }
    }

    const handleInvite = async (email, role) => {
        setInviteLoading(true)
        setSuccessMessage("")
        try {
            await organizationAPI.inviteUser(projectId, email, role)
            setSuccessMessage(`Invitation sent to ${email}!`)
            setTimeout(() => setSuccessMessage(""), 5000)
            fetchProjectData()
            fetchPendingInvites()
        } catch (err) {
            throw new Error(err.message || "Failed to send invitation")
        } finally {
            setInviteLoading(false)
        }
    }

    const copyInviteLink = () => {
        const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/projects/${projectId}/invite`
        navigator.clipboard.writeText(inviteLink)
        setSuccessMessage("Invite link copied to clipboard!")
        setTimeout(() => setSuccessMessage(""), 3000)
    }

    const handleRoleChange = async (memberId, memberEmail, newRole) => {
        if (!isOwner) {
            setSuccessMessage("Only project owners can change member roles")
            setTimeout(() => setSuccessMessage(""), 3000)
            return
        }

        setRoleChangeLoading(memberId)
        try {
            await organizationAPI.updateMemberRole(projectId, memberId, newRole)
            setSuccessMessage(`Successfully updated ${memberEmail}'s role to ${newRole}`)
            setTimeout(() => setSuccessMessage(""), 5000)
            await fetchProjectData()
        } catch (err) {
            console.error("Error updating role:", err)
            setSuccessMessage(`Failed to update role: ${err.message}`)
            setTimeout(() => setSuccessMessage(""), 5000)
        } finally {
            setRoleChangeLoading(null)
        }
    }

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "owner":
                return "bg-gold-solid/10 text-gold-solid border border-gold-solid/20"
            case "editor":
                return "bg-secondary text-foreground border border-border"
            case "viewer":
                return "bg-muted/50 text-muted-foreground border border-border"
            default:
                return "bg-muted/30 text-muted-foreground border border-border"
        }
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case "owner":
                return Crown
            case "editor":
                return Edit3
            case "viewer":
                return Eye
            default:
                return Users
        }
    }

    const getInitials = (name) => {
        if (!name) return "?"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const isOwner = teamMembers.some(
        (member) => member.user_id === user?.id && member.role === "owner"
    ) || (user?.organization_role === "owner")

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold-solid" />
            </div>
        )
    }

    const totalMembers = teamMembers.length
    const activeMembers = teamMembers.filter((m) => m.role !== "viewer").length
    const createdDate = projectData?.created_at
        ? new Date(projectData.created_at).toLocaleDateString()
        : "N/A"

    return (
        <div className="flex min-h-screen bg-transparent text-foreground">
            {/* Invite Modal */}
            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInvite}
                loading={inviteLoading}
                projectId={projectId}
            />

            {/* Main Content */}
            <div className="flex-1 py-4">
                {/* Success Messages */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 animate-fade-in text-green-400">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-semibold">{successMessage}</span>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <Card className="p-6 border-border bg-card hover:shadow-lg transition-shadow text-foreground">
                        <div className="flex items-start justify-between mb-4">
                            <span className="text-muted-foreground text-sm font-medium">Total Members</span>
                            <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                                <Users className="w-4 h-4 text-gold-solid" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-gold-solid">{totalMembers}</div>
                    </Card>

                    <Card className="p-6 border-border bg-card hover:shadow-lg transition-shadow text-foreground">
                        <div className="flex items-start justify-between mb-4">
                            <span className="text-muted-foreground text-sm font-medium">Created On</span>
                            <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center text-gold-solid">📅</div>
                        </div>
                        <div className="text-2xl font-bold text-gold-solid">{createdDate}</div>
                    </Card>

                    <Card className="p-6 border-border bg-card hover:shadow-lg transition-shadow text-foreground">
                        <div className="flex items-start justify-between mb-4">
                            <span className="text-muted-foreground text-sm font-medium">Pending Invites</span>
                            <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                                <Mail className="w-4 h-4 text-gold-solid" />
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-gold-solid">{pendingInvites.length}</div>
                    </Card>
                </div>

                {/* Project Collaborators Section */}
                <div className="mb-12">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">Project Collaborators</h2>
                            <p className="text-muted-foreground text-sm">Manage your team members and their access levels</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={copyInviteLink}
                                variant="outline"
                                className="gap-2 bg-transparent border-border hover:bg-sidebar-accent text-foreground"
                            >
                                <Copy className="w-4 h-4" />
                                Copy Invite Link
                            </Button>
                            {isOwner && (
                                <Button
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="gap-2 bg-gold-gradient text-primary-foreground hover:brightness-110 font-semibold border-0"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Invite Team Member
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full gap-6">
                        {/* Active Members */}
                        <div className="mb-8 flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-2">Team Members</h3>
                            <p className="text-muted-foreground text-sm mb-4">All members with access to this project</p>
                            <div className="space-y-3">
                                {teamMembers.length === 0 ? (
                                    <Card className="p-8 border-border bg-card text-center">
                                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground">No team members yet</p>
                                    </Card>
                                ) : (
                                    teamMembers.map((member) => {
                                        const RoleIcon = getRoleIcon(member.role)
                                        const canChangeRole = isOwner && member.user_id !== user?.id && member.role !== "owner"
                                        const isChangingRole = roleChangeLoading === member.user_id

                                        return (
                                            <Card
                                                key={member.user_id}
                                                className="p-4 border-border bg-card hover:shadow-md transition-shadow text-foreground"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10 border border-border">
                                                            <AvatarImage
                                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_email}`}
                                                            />
                                                            <AvatarFallback>
                                                                {getInitials(member.user_name || member.user_email)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                {member.user_name || "Unknown User"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {member.user_email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getRoleBadgeColor(member.role)}>
                                                            <RoleIcon className="w-3 h-3 mr-1" />
                                                            {member.role}
                                                        </Badge>
                                                        <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/10">
                                                            Active
                                                        </Badge>
                                                        {member.role === "owner" && (
                                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                                        )}
                                                        {canChangeRole && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="p-1 h-auto hover:bg-sidebar-accent"
                                                                        disabled={isChangingRole}
                                                                    >
                                                                        {isChangingRole ? (
                                                                            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                                                        ) : (
                                                                            <UserCog className="w-5 h-5 text-muted-foreground" />
                                                                        )}
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 bg-card border border-border text-foreground">
                                                                    <div className="px-2 py-1.5 text-sm font-semibold text-foreground">
                                                                        Change Role
                                                                    </div>
                                                                    <DropdownMenuSeparator className="bg-border" />
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleRoleChange(member.user_id, member.user_email, "owner")}
                                                                        disabled={member.role === "owner"}
                                                                        className="cursor-pointer hover:bg-sidebar-accent"
                                                                    >
                                                                        <Crown className="w-4 h-4 mr-2 text-gold-solid" />
                                                                        <span>Owner</span>
                                                                        {member.role === "owner" && (
                                                                            <CheckCircle className="w-4 h-4 ml-auto text-gold-solid" />
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleRoleChange(member.user_id, member.user_email, "editor")}
                                                                        disabled={member.role === "editor"}
                                                                        className="cursor-pointer hover:bg-sidebar-accent"
                                                                    >
                                                                        <Edit3 className="w-4 h-4 mr-2 text-gold-solid" />
                                                                        <span>Editor</span>
                                                                        {member.role === "editor" && (
                                                                            <CheckCircle className="w-4 h-4 ml-auto text-gold-solid" />
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleRoleChange(member.user_id, member.user_email, "viewer")}
                                                                        disabled={member.role === "viewer"}
                                                                        className="cursor-pointer hover:bg-sidebar-accent"
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                                                                        <span>Viewer</span>
                                                                        {member.role === "viewer" && (
                                                                            <CheckCircle className="w-4 h-4 ml-auto text-muted-foreground" />
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Pending Requests */}
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-2">Pending Invitations</h3>
                            <p className="text-muted-foreground text-sm mb-4">Invitations waiting for response</p>
                            <div className="space-y-3">
                                {pendingInvites.length === 0 ? (
                                    <Card className="p-8 border-border bg-card text-center">
                                        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground">No pending invitations</p>
                                    </Card>
                                ) : (
                                    pendingInvites.map((invite) => (
                                        <Card
                                            key={invite.id}
                                            className="p-4 border-border bg-card hover:shadow-md transition-shadow text-foreground"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10 border border-border">
                                                        <AvatarImage
                                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${invite.invitee}`}
                                                        />
                                                        <AvatarFallback>
                                                            {getInitials(invite.invitee || "User")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {invite.invitee}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Invited by {invite.inviter}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="border-border text-muted-foreground">
                                                        {invite.role}
                                                    </Badge>
                                                    <Badge variant="outline" className="border-yellow-500/20 text-yellow-400 bg-yellow-500/10">
                                                        Pending
                                                    </Badge>
                                                    {isOwner && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="p-1 h-auto"
                                                        >
                                                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role Permissions */}
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Role Permissions</h2>
                    <div className="grid grid-cols-3 gap-6">
                        <Card className="p-6 border-border bg-card hover:shadow-lg transition-shadow text-foreground">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gold-solid/10 flex items-center justify-center">
                                    <Crown className="w-5 h-5 text-gold-solid" />
                                </div>
                                <h3 className="font-bold text-foreground">Owner</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="text-muted-foreground text-sm">• Full project access</li>
                                <li className="text-muted-foreground text-sm">• Manage team members</li>
                                <li className="text-muted-foreground text-sm">• Delete project</li>
                                <li className="text-muted-foreground text-sm">• Change project settings</li>
                            </ul>
                        </Card>

                        <Card className="p-6 border-border bg-card hover:shadow-lg transition-shadow text-foreground">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center">
                                    <Edit3 className="w-5 h-5 text-gold-solid" />
                                </div>
                                <h3 className="font-bold text-foreground">Editor</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="text-muted-foreground text-sm">• Edit project content</li>
                                <li className="text-muted-foreground text-sm">• Upload and manage images</li>
                                <li className="text-muted-foreground text-sm">• Modify workflows</li>
                                <li className="text-muted-foreground text-sm">• Cannot manage team</li>
                            </ul>
                        </Card>

                        <Card className="p-6 border-border bg-card hover:shadow-lg transition-shadow text-foreground">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <h3 className="font-bold text-foreground">Viewer</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="text-muted-foreground text-sm">• View project details</li>
                                <li className="text-muted-foreground text-sm">• View all images</li>
                                <li className="text-muted-foreground text-sm">• Cannot make changes</li>
                                <li className="text-muted-foreground text-sm">• Cannot invite others</li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
