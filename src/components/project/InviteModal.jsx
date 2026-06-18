"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { X, UserPlus, Crown, Edit3, Eye, Search, Loader2 } from "lucide-react"
import { organizationAPI } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function InviteModal({ isOpen, onClose, onInvite, loading, projectId }) {
    const { token } = useAuth()
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedRole, setSelectedRole] = useState("viewer")
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [availableUsers, setAvailableUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(false)

    const roles = [
        {
            value: "owner",
            label: "Owner",
            icon: Crown,
            description: "Full access and can manage team",
            color: "text-gold-solid",
            bgColor: "bg-gold-solid/10",
        },
        {
            value: "editor",
            label: "Editor",
            icon: Edit3,
            description: "Can edit and contribute",
            color: "text-gold-solid",
            bgColor: "bg-sidebar-accent",
        },
        {
            value: "viewer",
            label: "Viewer",
            icon: Eye,
            description: "Can only view the project",
            color: "text-muted-foreground",
            bgColor: "bg-muted",
        },
    ]

    useEffect(() => {
        if (isOpen && projectId) {
            fetchAvailableUsers()
        }
    }, [isOpen, projectId])

    const fetchAvailableUsers = async () => {
        try {
            setLoadingUsers(true)
            const data = await organizationAPI.getAvailableUsers(projectId)
            setAvailableUsers(data.available_users || [])
        } catch (err) {
            console.error("Error fetching available users:", err)
            setError("Failed to load available users")
        } finally {
            setLoadingUsers(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!selectedUser) {
            setError("Please select a user to invite")
            return
        }

        try {
            await onInvite(selectedUser.email, selectedRole)
            // Reset form on success
            setSelectedUser(null)
            setSelectedRole("viewer")
            setSearchQuery("")
            onClose()
        } catch (err) {
            setError(err.message || "Failed to send invitation")
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

    const filteredUsers = availableUsers.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-foreground">
                {/* Header */}
                <div className="bg-gold-gradient p-6 text-primary-foreground">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-foreground/15 rounded-xl flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Invite Team Member</h2>
                                <p className="text-primary-foreground/80 text-sm mt-1">
                                    Select an existing user to invite to this project
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/25 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-primary-foreground" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        {/* Search Users */}
                        <div>
                            <label htmlFor="search-input" className="block text-sm font-semibold text-foreground mb-2">
                                Search Users
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="search-input"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full pl-11 pr-4 py-3 border border-input bg-background text-foreground rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Available Users List */}
                        <div>
                            <div className="block text-sm font-semibold text-foreground mb-3">
                                Available Users ({filteredUsers.length})
                            </div>
                            <div className="border border-border rounded-xl max-h-64 overflow-y-auto">
                                {loadingUsers ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-gold-solid" />
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        {searchQuery ? "No users found matching your search" : "No available users to invite"}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {filteredUsers.map((user) => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => setSelectedUser(user)}
                                                className={`w-full p-4 flex items-center gap-3 hover:bg-sidebar-accent transition-colors text-left ${selectedUser?.id === user.id ? "bg-sidebar-accent/80 border-l-4 border-gold-solid" : ""
                                                    }`}
                                            >
                                                <Avatar className="w-10 h-10 border border-border">
                                                    <AvatarImage
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(user.full_name || user.username)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">
                                                        {user.full_name || user.username}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                {selectedUser?.id === user.id && (
                                                    <Badge className="bg-gold-solid text-primary-foreground text-xs font-semibold">
                                                        Selected
                                                    </Badge>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <p className="text-sm text-red-400 flex items-center gap-2">
                                    <span className="text-lg">⚠️</span>
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Role Selection */}
                        {selectedUser && (
                            <div>
                                <div className="block text-sm font-semibold text-foreground mb-3">
                                    Select Role for {selectedUser.full_name || selectedUser.username}
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {roles.map((role) => {
                                        const Icon = role.icon
                                        return (
                                            <button
                                                key={role.value}
                                                type="button"
                                                onClick={() => setSelectedRole(role.value)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${selectedRole === role.value
                                                    ? "border-gold-solid bg-gold-solid/10 shadow-md scale-105"
                                                    : "border-border hover:border-gold-muted/50"
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg ${role.bgColor} flex items-center justify-center mb-3`}>
                                                    <Icon className={`w-5 h-5 ${role.color}`} />
                                                </div>
                                                <h3 className="font-bold text-foreground mb-1">
                                                    {role.label}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {role.description}
                                                </p>
                                                {selectedRole === role.value && (
                                                    <Badge className="mt-2 bg-gold-solid text-primary-foreground text-xs font-semibold">
                                                        Selected
                                                    </Badge>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 border-t border-border flex gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 py-3 bg-transparent border-border hover:bg-sidebar-accent text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !selectedUser}
                            className="flex-1 py-3 bg-gold-gradient text-primary-foreground hover:brightness-110 font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Send Invitation
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
