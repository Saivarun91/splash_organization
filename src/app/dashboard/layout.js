"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default function DashboardLayout({ children }) {
    const [collapsed, setCollapsed] = useState(true);
    const [hovered, setHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        // Check authentication
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("org_auth_token");
            if (!token) {
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
            }
        }
        setLoading(false);
    }, []);

    // Compute sidebar width dynamically
    const sidebarWidth = isMobile ? 0 : collapsed && !hovered ? 80 : 256; // px

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20">
                <p className="text-foreground">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20">
            <Sidebar
                collapsed={collapsed}
                hovered={hovered}
                setHovered={setHovered}
                setCollapsed={setCollapsed}
                isMobile={isMobile}
            />

            <div className="flex-1 flex flex-col">
                {/* Topbar — reacts to sidebar collapse */}
                <Topbar collapsed={collapsed && !hovered} />

                {/* Main content below topbar */}
                <main
                    className="flex-1 overflow-y-auto p-8 transition-all duration-300 mt-16"
                    style={{
                        marginLeft: `${isMobile ? 0 : sidebarWidth}px`,
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
