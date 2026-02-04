"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  FolderKanban,
  Image as ImageIcon,
  User,
  Shield,
  Crown,
  Loader2,
  UserPlus,
  X,
  Mail,
  Trash2,
} from "lucide-react";
import { organizationAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge";

/* ---------- Helpers ---------- */
const getRoleIcon = (role) => {
  switch (role?.toLowerCase()) {
    case "owner":
      return <Crown className="w-3.5 h-3.5" />;
    case "chief_editor":
    case "creative_head":
      return <Shield className="w-3.5 h-3.5" />;
    default:
      return <User className="w-3.5 h-3.5" />;
  }
};

const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case "owner":
      return "border-purple-200 text-purple-700 bg-purple-50";
    case "chief_editor":
    case "creative_head":
      return "border-blue-200 text-blue-700 bg-blue-50";
    case "member":
      return "border-green-200 text-green-700 bg-green-50";
    default:
      return "border-gray-200 text-gray-700 bg-gray-50";
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

/* ---------- Page ---------- */
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
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const orgId = localStorage.getItem("org_organization_id");
        if (!orgId) return;

        setOrganizationId(orgId);
        const data = await organizationAPI.getOrganizationMembers(orgId);
        if (data.members) setUsers(data.members);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const allRoles = [...new Set(users.map((u) => u.organization_role || "member"))];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRoles.length === 0 ||
      selectedRoles.includes(user.organization_role || "member");
    return matchesSearch && matchesRole;
  });

  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleUserClick = (user) => {
    router.push(`/dashboard/users/${user.slug || user.id}`);
  };

  const handleDeleteUser = async (userId, email, e) => {
    e.stopPropagation();
    if (!confirm(`Remove ${email} from organization?`)) return;

    setDeletingUserId(userId);
    setError("");
    setSuccess("");

    try {
      const res = await organizationAPI.removeUser(organizationId, userId);
      if (res.success) {
        setSuccess(`User ${email} removed successfully`);
        const data = await organizationAPI.getOrganizationMembers(organizationId);
        if (data.members) setUsers(data.members);
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      setError(err.message || "Failed to remove user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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

  /* ---------- User Card ---------- */
  const UserCard = ({ user }) => {
    const isOwner = user.organization_role === "owner";
    const isDeleting = deletingUserId === user.id;

    return (
      <div
        onClick={() => handleUserClick(user)}
        tabIndex={0}
        role="button"
        className="
          rounded-xl border border-border bg-card p-5
          transition-all duration-200
          hover:shadow-lg hover:-translate-y-0.5
          focus:outline-none focus:ring-2 focus:ring-ring
        "
      >
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">
              {user.full_name || user.email}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
          </div>

          <Badge
            variant="outline"
            className={`flex items-center gap-1 text-xs ${getRoleColor(
              user.organization_role
            )}`}
          >
            {getRoleIcon(user.organization_role)}
            {getRoleDisplayName(user.organization_role, t)}
          </Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {t("orgPortal.projects")}
            </p>
            <p className="text-lg font-semibold">
              {user.projects_count || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {t("orgPortal.images")}
            </p>
            <p className="text-lg font-semibold">
              {user.images_generated || 0}
            </p>
          </div>
        </div>

        {!isOwner && (
          <button
            onClick={(e) => handleDeleteUser(user.id, user.email, e)}
            disabled={isDeleting}
            className="
              mt-4 flex items-center gap-2 text-sm text-destructive
              hover:underline disabled:opacity-50
            "
          >
            <Trash2 className="w-4 h-4" />
            {t("orgPortal.removeUser")}
          </button>
        )}
      </div>
    );
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {t("orgPortal.loadingUsers")}
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("dashboard.users")}
          </h1>
          <p className="text-muted-foreground">
            {t("orgPortal.manageUsers")}
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="
            inline-flex items-center gap-2 rounded-lg
            bg-primary px-5 py-2.5 text-sm font-medium
            text-primary-foreground hover:bg-primary/90
          "
        >
          <UserPlus className="w-4 h-4" />
          {t("orgPortal.addUser")}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("orgPortal.searchUsers")}
          className="
            w-full rounded-lg border border-input
            bg-background px-10 py-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-ring
          "
        />
      </div>

      {/* Role Filters */}
      {allRoles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allRoles.map((role) => (
            <button
              key={role}
              onClick={() => toggleRole(role)}
              className={`
                rounded-full px-4 py-1.5 text-sm font-medium transition
                ${
                  selectedRoles.includes(role)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }
              `}
            >
              {getRoleDisplayName(role, t)}
            </button>
          ))}
        </div>
      )}

      {/* Users Grid */}
      {filteredUsers.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {t("orgPortal.noUsersFound")}
          </p>
        </div>
      )}
    </div>
  );
}
