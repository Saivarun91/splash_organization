"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check authentication
        if (typeof window !== "undefined") {
            // First check if token is passed via URL (from frontend portal switch)
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get("token");
            const userFromUrl = urlParams.get("user");
            const fromPortal = urlParams.get("from");

            if (tokenFromUrl && fromPortal === "frontend") {
                // Token passed from frontend portal - authenticate automatically
                try {
                    const decodedToken = decodeURIComponent(tokenFromUrl);
                    const decodedUser = userFromUrl ? JSON.parse(decodeURIComponent(userFromUrl)) : null;

                    // Verify user is organization owner
                    if (decodedUser && decodedUser.organization_role === "owner") {
                        localStorage.setItem("org_auth_token", decodedToken);
                        localStorage.setItem("org_user", JSON.stringify(decodedUser));
                        localStorage.setItem("org_user_id", decodedUser.id || "");
                        localStorage.setItem("org_organization_id", decodedUser.organization?.id || decodedUser.organization_id || "");

                        // Set preferred language if available
                        if (decodedUser.preferred_language) {
                            localStorage.setItem('preferredLanguage', decodedUser.preferred_language);
                        }

                        // Clean URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                        setIsAuthenticated(true);
                        setLoading(false);
                        return;
                    } else {
                        // Not an owner, redirect to login
                        router.push("/login?error=not_owner");
                        return;
                    }
                } catch (error) {
                    console.error("Error processing token from URL:", error);
                    router.push("/login?error=invalid_token");
                    return;
                }
            }

            // Check for existing token in localStorage
            const token = localStorage.getItem("org_auth_token");
            if (!token) {
                router.push("/login");
                return;
            }
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, [router]);

    const sidebarWidth = collapsed && !hovered ? 80 : 256;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                hovered={hovered}
                setHovered={setHovered}
            />
            <main
                className="flex-1 transition-all duration-300"
                style={{ marginLeft: `${sidebarWidth}px` }}
            >
                {children}
            </main>
        </div>
    );
}
