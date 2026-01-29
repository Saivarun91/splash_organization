"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, FolderKanban, Image as ImageIcon, User, Shield, Crown, Loader2, UserPlus, X, Mail, Trash2 } from "lucide-react";
import { organizationAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge";

const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
        case "owner":
            return <Crown className="w-4 h-4" />;
        case "chief_editor":
        case "creative_head":
            return <Shield className="w-4 h-4" />;
        default:
            return <User className="w-4 h-4" />;
    }
};

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

const getRoleDisplayName = (role) => {
    if (!role) return "Member";
    switch (role.toLowerCase()) {
        case "owner":
            return "Owner";
        case "chief_editor":
            return "Chief Editor";
        case "creative_head":
            return "Creative Head";
        case "member":
            return "Member";
        default:
            return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ");
    }
};

export default function UsersPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserRole, setNewUserRole] = useState("member");
    const [addingUser, setAddingUser] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deletingUserId, setDeletingUserId] = useState(null);

    useEffect(() => { 
        const fetchUsers = async () => {
            try {
                const orgId = localStorage.getItem("org_organization_id");
                if (!orgId) {
                    setLoading(false);
                    return;
                }

                setOrganizationId(orgId);
                const data = await organizationAPI.getOrganizationMembers(orgId);
                if (data.members) {
                    console.log("data.members", data.members);
                    setUsers(data.members);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, []);

    const allRoles = [...new Set(users.map((user) => user.organization_role || "member"))];

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole =
            selectedRoles.length === 0 || selectedRoles.includes(user.organization_role || "member");
        return matchesSearch && matchesRole;
    });

    const toggleRole = (role) => {
        setSelectedRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
        );
    };

    const handleUserClick = (userId) => {
        router.push(`/dashboard/users/${userId}`);
    };

    const handleDeleteUser = async (userId, userEmail, e) => {
        e.stopPropagation(); // Prevent triggering the card click
        
        if (!window.confirm(`Are you sure you want to remove ${userEmail} from this organization?`)) {
            return;
        }

        setDeletingUserId(userId);
        setError("");
        setSuccess("");

        try {
            const response = await organizationAPI.removeUser(organizationId, userId);
            
            if (response.success) {
                setSuccess(`User ${userEmail} removed successfully!`);
                
                // Refresh users list
                const data = await organizationAPI.getOrganizationMembers(organizationId);
                if (data.members) {
                    setUsers(data.members);
                }
                
                // Clear success message after 5 seconds
                setTimeout(() => setSuccess(""), 5000);
            }
        } catch (err) {
            setError(err.message || "Failed to remove user. Please try again.");
        } finally {
            setDeletingUserId(null);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newUserEmail.trim()) {
            setError("Email is required");
            return;
        }

        if (!organizationId) {
            setError("Organization ID not found");
            return;
        }

        setAddingUser(true);

        try {
            const response = await organizationAPI.addUser(organizationId, newUserEmail.trim(), newUserRole);
            
            if (response.success) {
                setSuccess(response.user_created 
                    ? `User created successfully! An email with temporary password has been sent to ${newUserEmail}.`
                    : `User added to organization successfully!`);
                
                // Reset form
                setNewUserEmail("");
                setNewUserRole("member");
                setShowAddUserModal(false);
                
                // Refresh users list
                const data = await organizationAPI.getOrganizationMembers(organizationId);
                if (data.members) {
                    setUsers(data.members);
                }
                
                // Clear success message after 5 seconds
                setTimeout(() => setSuccess(""), 5000);
            }
        } catch (err) {
            // The error message from apiRequest already contains the error from the backend
            // Check if it mentions existing organization
            let errorMessage = err.message || "Failed to add user. Please try again.";
            
            // The backend returns error in format: "This email is already in {org_name}"
            // or in the error field of the JSON response
            setError(errorMessage);
        } finally {
            setAddingUser(false);
        }
    };

    const UserCard = ({ user }) => {
        const isOwner = user.organization_role === "owner";
        const isDeleting = deletingUserId === user.id;

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') { handleUserClick(user.id); }
        };
        return (
            <div
                onClick={() => handleUserClick(user.id)}
                onKeyDown={handleKeyDown}
                title={user.full_name} 
                aria-label={user.full_name} 
                role="button" 
                tabIndex={0} 
                style={{ cursor: 'pointer' }} 
                className="bg-card text-card-foreground border border-border rounded-xl p-6 hover:shadow-md transition-all cursor-pointer relative"
            >
                {/* Delete button - only show if not owner */}
                {!isOwner && (
                    <button
                        onClick={(e) => handleDeleteUser(user.id, user.email, e)}
                        disabled={isDeleting} 
                        className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove user from organization"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                )}
                
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-2xl mb-4">
                        {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">
                        {user.full_name || user.email || "Unknown User"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                    <div className="flex items-center gap-2 mb-4">
                        <span
                            className={`px-3 py-1 rounded text-sm font-medium border flex items-center gap-1 ${getRoleColor(
                                user.organization_role
                            )}`}
                        >
                            {getRoleIcon(user.organization_role)}
                            {getRoleDisplayName(user.organization_role)}
                        </span>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <FolderKanban className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Projects</span>
                            </div>
                            <div className="text-xl font-bold text-foreground">
                                {user.projects_count || 0}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Images</span>
                            </div>
                            <div className="text-xl font-bold text-foreground">
                                {user.images_generated || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Users</h1>
                    <p className="text-muted-foreground">Manage organization users and their roles</p>
                </div>
                <button
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <UserPlus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-card text-card-foreground rounded-xl shadow-sm p-6 w-full max-w-md border border-border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-foreground">Add User to Organization</h2>
                            <button
                                onClick={() => {
                                    setShowAddUserModal(false);
                                    setNewUserEmail("");
                                    setNewUserRole("member");
                                    setError("");
                                }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="email"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                                >
                                    <option value="member">Member</option>
                                    <option value="chief_editor">Chief Editor</option>
                                    <option value="creative_head">Creative Head</option>
                                </select>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddUserModal(false);
                                        setNewUserEmail("");
                                        setNewUserRole("member");
                                        setError("");
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingUser}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addingUser ? "Adding..." : "Add User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Role Filters */}
                {allRoles.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">Filter by Role:</span>
                        {allRoles.map((role) => (
                            <button
                                key={role}
                                onClick={() => toggleRole(role)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-1 ${
                                    selectedRoles.includes(role)
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {getRoleIcon(role)}
                                <span>{getRoleDisplayName(role)}</span>
                            </button>
                        ))}
                        {selectedRoles.length > 0 && (
                            <button
                                onClick={() => setSelectedRoles([])}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Users Grid */}
            {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map((user) => (
                        <UserCard key={user.id} user={user} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                        {searchQuery || selectedRoles.length > 0
                            ? "No users found matching your filters"
                            : "No users found in this organization"}
                    </p>
                </div>
            )}
        </div>
    );
}
