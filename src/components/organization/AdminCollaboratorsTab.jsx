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
                return "bg-purple-100 text-purple-800";
            case "editor":
                return "bg-blue-100 text-blue-800";
            case "viewer":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Collaborators</h3>
                <p className="text-gray-600">View all team members and their access levels</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <span className="text-gray-600 text-sm font-medium">Total Members</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-blue-600">{teamMembers.length}</div>
                </Card>

                <Card className="p-6 border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <span className="text-gray-600 text-sm font-medium">Created On</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                            📅
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                        {new Date(project.created_at).toLocaleDateString()}
                    </div>
                </Card>

                <Card className="p-6 border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <span className="text-gray-600 text-sm font-medium">Pending Invites</span>
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-orange-600" />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-orange-600">{pendingInvites.length}</div>
                </Card>
            </div>

            {/* Team Members */}
            <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Team Members</h4>
                <div className="space-y-3">
                    {teamMembers.length === 0 ? (
                        <Card className="p-8 border-gray-200 text-center">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                            <p className="text-gray-600">No team members yet</p>
                        </Card>
                    ) : (
                        teamMembers.map((member) => {
                            const RoleIcon = getRoleIcon(member.role);

                            return (
                                <Card
                                    key={member.user_id}
                                    className="p-4 border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_email}`}
                                                />
                                                <AvatarFallback>{getInitials(member.user_name || member.user_email)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {member.user_name || member.full_name || "Unknown User"}
                                                </p>
                                                <p className="text-xs text-gray-600">{member.user_email || member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getRoleBadgeColor(member.role)}>
                                                <RoleIcon className="w-3 h-3 mr-1" />
                                                {member.role}
                                            </Badge>
                                            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
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
                <h4 className="text-lg font-bold text-gray-900 mb-4">Role Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-purple-600" />
                            </div>
                            <h5 className="font-bold text-gray-900">Owner</h5>
                        </div>
                        <ul className="space-y-3">
                            <li className="text-gray-600 text-sm">• Full project access</li>
                            <li className="text-gray-600 text-sm">• Manage team members</li>
                            <li className="text-gray-600 text-sm">• Delete project</li>
                            <li className="text-gray-600 text-sm">• Change project settings</li>
                        </ul>
                    </Card>

                    <Card className="p-6 border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Edit3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h5 className="font-bold text-gray-900">Editor</h5>
                        </div>
                        <ul className="space-y-3">
                            <li className="text-gray-600 text-sm">• Edit project content</li>
                            <li className="text-gray-600 text-sm">• Upload and manage images</li>
                            <li className="text-gray-600 text-sm">• Modify workflows</li>
                            <li className="text-gray-600 text-sm">• Cannot manage team</li>
                        </ul>
                    </Card>

                    <Card className="p-6 border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-gray-600" />
                            </div>
                            <h5 className="font-bold text-gray-900">Viewer</h5>
                        </div>
                        <ul className="space-y-3">
                            <li className="text-gray-600 text-sm">• View project details</li>
                            <li className="text-gray-600 text-sm">• View all images</li>
                            <li className="text-gray-600 text-sm">• Cannot make changes</li>
                            <li className="text-gray-600 text-sm">• Cannot invite others</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
