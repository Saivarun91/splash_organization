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
