"use client";

import { Users, Mail, Crown, Edit3, Eye, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AdminCollaboratorsTab({ project }) {
    // Mock data - Replace with actual API call
    const teamMembers = project.members || project.team_members || [
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
    ];

    const pendingInvites = []; // Mock - replace with actual data

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "owner":
                return "bg-gold-solid/10 text-gold-solid border border-gold-solid/20";
            case "editor":
                return "bg-secondary text-foreground border border-border";
            case "viewer":
                return "bg-muted/50 text-muted-foreground border border-border";
            default:
                return "bg-muted/30 text-muted-foreground border border-border";
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "owner":
                return Crown;
            case "editor":
                return Edit3;
            case "viewer":
                return Eye;
            default:
                return Users;
        }
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Project Collaborators</h3>
                <p className="text-muted-foreground">View all team members and their access levels</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-border hover:shadow-lg transition-shadow bg-card text-foreground">
                    <div className="flex items-start justify-between mb-4">
                        <span className="text-muted-foreground text-sm font-medium">Total Members</span>
                        <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                            <Users className="w-4 h-4 text-gold-solid" />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-gold-solid">{teamMembers.length}</div>
                </Card>

                <Card className="p-6 border-border hover:shadow-lg transition-shadow bg-card text-foreground">
                    <div className="flex items-start justify-between mb-4">
                        <span className="text-muted-foreground text-sm font-medium">Created On</span>
                        <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center text-gold-solid">
                            📅
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gold-solid">
                        {new Date(project.created_at).toLocaleDateString()}
                    </div>
                </Card>

                <Card className="p-6 border-border hover:shadow-lg transition-shadow bg-card text-foreground">
                    <div className="flex items-start justify-between mb-4">
                        <span className="text-muted-foreground text-sm font-medium">Pending Invites</span>
                        <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
                            <Mail className="w-4 h-4 text-gold-solid" />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-gold-solid">{pendingInvites.length}</div>
                </Card>
            </div>

            {/* Team Members */}
            <div>
                <h4 className="text-lg font-bold text-foreground mb-4">Team Members</h4>
                <div className="space-y-3">
                    {teamMembers.length === 0 ? (
                        <Card className="p-8 border-border bg-card text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground">No team members yet</p>
                        </Card>
                    ) : (
                        teamMembers.map((member) => {
                            const RoleIcon = getRoleIcon(member.role);

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
                                                <AvatarFallback>{getInitials(member.user_name || member.user_email)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {member.user_name || member.full_name || "Unknown User"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{member.user_email || member.email}</p>
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
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Role Permissions */}
            <div>
                <h4 className="text-lg font-bold text-foreground mb-4">Role Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 border-border bg-card hover:shadow-lg transition-shadow text-foreground">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gold-solid/10 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-gold-solid" />
                            </div>
                            <h5 className="font-bold text-foreground">Owner</h5>
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
                            <h5 className="font-bold text-foreground">Editor</h5>
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
                            <h5 className="font-bold text-foreground">Viewer</h5>
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
    );
}
