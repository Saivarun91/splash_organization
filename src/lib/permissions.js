/**
 * Get user's role in the project
 * @param {Object} project - Project object
 * @param {Object} user - Current user object
 * @returns {string|null} - User's role or null if not a member
 */
export function getUserProjectRole(project, user) {
    if (!project) {
        return null
    }

    // 1. If project has a pre-determined user role from backend query, return it
    if (project.userRole) {
        return project.userRole
    }
    if (project.role) {
        return project.role
    }

    if (!user) {
        return null
    }

    // 2. Organization owner/admin get owner role
    const orgRole = user.organization_role;
    if (orgRole === 'owner' || orgRole === 'admin') {
        return 'owner'
    }

    // 3. Fallback to default role hierarchy checks based on same org comparison if available
    const userOrgId = user.organization?.id || user.organization_id;
    const projectOrgId = project.organization?.id || project.organization_id || project.organization;

    // Check if they belong to the same organization
    const isSameOrg = userOrgId && projectOrgId && String(userOrgId) === String(projectOrgId);

    // Default org-level role fallback
    let defaultRole = null;
    if (isSameOrg) {
        if (orgRole === 'chief_editor' || orgRole === 'creative_head') {
            defaultRole = 'editor';
        } else {
            defaultRole = 'viewer';
        }
    } else if (orgRole === 'chief_editor' || orgRole === 'creative_head') {
        // Even if we don't have project.organization, if the user is chief_editor/creative_head,
        // they should have editor permissions on projects in the org portal by default
        defaultRole = 'editor';
    } else if (orgRole === 'member') {
        defaultRole = 'viewer';
    }

    // Get explicit project role if any
    let explicitRole = null;
    if (project.team_members) {
        const member = project.team_members.find(
            (m) => m.user_id === user.id || m.user_id === String(user.id) || (m.user && (m.user.id === user.id || String(m.user.id) === String(user.id)))
        );
        if (member) {
            explicitRole = member.role;
        }
    }

    const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
    const roles = [];
    if (defaultRole) roles.push(defaultRole);
    if (explicitRole) roles.push(explicitRole);

    if (roles.length === 0) return null;

    return roles.reduce((max, current) => 
        (roleHierarchy[current] || 0) > (roleHierarchy[max] || 0) ? current : max
    );
}

/**
 * Check if a user has a specific role or higher in a project
 * @param {Object} project - Project object containing team_members
 * @param {Object} user - Current user object with id
 * @param {string} requiredRole - Required role: 'owner', 'editor', or 'viewer'
 * @returns {boolean} - True if user has required role or higher
 */
export function hasProjectRole(project, user, requiredRole = 'viewer') {
    const roleHierarchy = {
        owner: 3,
        editor: 2,
        viewer: 1,
    }

    const userRole = getUserProjectRole(project, user)
    const userRoleLevel = roleHierarchy[userRole] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0

    return userRoleLevel >= requiredRoleLevel
}

/**
 * Check if user can edit the project (owner or editor)
 * @param {Object} project - Project object
 * @param {Object} user - Current user object
 * @returns {boolean}
 */
export function canEditProject(project, user) {
    const role = getUserProjectRole(project, user);
    if (role === 'owner' || role === 'editor') {
        return true;
    }
    if (user?.organization_role === 'owner' || user?.organization_role === 'admin') {
        return true;
    }
    if (user?.organization_role === 'chief_editor' || user?.organization_role === 'creative_head') {
        return true;
    }
    return false;
}

/**
 * Check if user is project owner
 * @param {Object} project - Project object
 * @param {Object} user - Current user object
 * @returns {boolean}
 */
export function isProjectOwner(project, user) {
    const role = getUserProjectRole(project, user);
    if (role === 'owner') {
        return true;
    }
    if (user?.organization_role === 'owner' || user?.organization_role === 'admin') {
        return true;
    }
    return false;
}
