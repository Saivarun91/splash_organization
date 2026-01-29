/**
 * Utility functions for switching between frontend and organization portals
 */

/**
 * Switch to frontend portal from organization portal
 * Passes the authentication token via URL parameter
 */
export function switchToFrontendPortal() {
    if (typeof window === "undefined") return;
    
    const token = localStorage.getItem("org_auth_token");
    const user = localStorage.getItem("org_user");
    
    if (!token) {
        console.error("No token found");
        return;
    }
    
    // Get frontend URL from environment variable
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    
    // Encode token and user data to pass via URL
    const encodedToken = encodeURIComponent(token);
    const encodedUser = encodeURIComponent(user || "");
    
    // Redirect to frontend with token
    window.location.href = `${frontendUrl}/dashboard?token=${encodedToken}&user=${encodedUser}&from=org`;
}

/**
 * Check if user is organization owner
 */
export function isOrganizationOwner(user) {
    if (!user) return false;
    
    // Check if user object has organization_role property
    if (typeof user === "string") {
        try {
            user = JSON.parse(user);
        } catch (e) {
            return false;
        }
    }
    
    return user.organization_role === "owner";
}
