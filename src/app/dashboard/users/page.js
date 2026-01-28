"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, FolderKanban, Image as ImageIcon, User, Shield, Crown, Loader2, UserPlus, X, Mail } from "lucide-react";
import { organizationAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

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

export default function UsersPage() {
    const router = useRouter();
    const { t } = useLanguage();
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

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newUserEmail.trim()) {
            setError(t("orgPortal.emailRequired"));
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
                    ? `${t("orgPortal.userCreatedSuccess")} ${newUserEmail}.`
                    : t("orgPortal.userAddedSuccess"));
                
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
            setError(err.message || "Failed to add user. Please try again.");
        } finally {
            setAddingUser(false);
        }
    };

    const UserCard = ({ user }) => (
        <div
            onClick={() => handleUserClick(user.id)}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
        >
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-2xl mb-4">
                    {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {user.full_name || user.email || "Unknown User"}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                <div className="flex items-center gap-2 mb-4">
                    <span
                        className={`px-3 py-1 rounded text-sm font-medium border flex items-center gap-1 ${getRoleColor(
                            user.organization_role
                        )}`}
                    >
                        {getRoleIcon(user.organization_role)}
                        {getRoleDisplayName(user.organization_role, t)}
                    </span>
                </div>
                <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <FolderKanban className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">{t("orgPortal.projects")}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            {user.projects_count || 0}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <ImageIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">{t("orgPortal.images")}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            {user.images_generated || 0}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">{t("orgPortal.loadingUsers")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("dashboard.users")}</h1>
                    <p className="text-gray-600">{t("orgPortal.manageUsers")}</p>
                </div>
                <button
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <UserPlus className="w-5 h-5" />
                    {t("orgPortal.addUser")}
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">{t("orgPortal.addUserToOrganization")}</h2>
                            <button
                                onClick={() => {
                                    setShowAddUserModal(false);
                                    setNewUserEmail("");
                                    setNewUserRole("member");
                                    setError("");
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("auth.email")} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        placeholder={t("auth.exampleEmail")}
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("orgPortal.role")} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="member">{t("orgPortal.member")}</option>
                                    <option value="chief_editor">{t("orgPortal.chiefEditor")}</option>
                                    <option value="creative_head">{t("orgPortal.creativeHead")}</option>
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
                                    {t("common.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingUser}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addingUser ? t("orgPortal.adding") : t("orgPortal.addUser")}
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
                        placeholder={t("orgPortal.searchUsers")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Role Filters */}
                {allRoles.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">{t("orgPortal.filterByRole")}</span>
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
                                <span>{getRoleDisplayName(role, t)}</span>
                            </button>
                        ))}
                        {selectedRoles.length > 0 && (
                            <button
                                onClick={() => setSelectedRoles([])}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            >
                                {t("orgPortal.clearFilters")}
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
                            ? t("orgPortal.noUsersFound")
                            : t("orgPortal.noUsersInOrg")}
                    </p>
                </div>
            )}
        </div>
    );
}
