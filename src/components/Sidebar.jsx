"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { switchToFrontendPortal } from "@/lib/portalSwitch";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    CreditCard,
    History,
    Image,
    Settings,
    HelpCircle,
    MessageSquare,
    BookOpen,
    FileQuestion,
    ChevronLeft,
    ChevronRight,
    User,
    LogOut,
    Sparkles,
    Zap,
    Bell,
    MessageCircle,
} from "lucide-react";

export function Sidebar({ collapsed, setCollapsed, hovered, setHovered }) {
    const { t } = useLanguage();
    const [expandedItems, setExpandedItems] = useState([]);
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        {
            label: t("dashboard.dashboard"),
            icon: LayoutDashboard,
            path: "/dashboard",
        },
        {
            label: t("dashboard.users"),
            icon: Users,
            path: "/dashboard/users",
        },
        {
            label: t("dashboard.projects"),
            icon: FolderKanban,
            path: "/dashboard/projects",
        },
        {
            label: t("dashboard.payments") || "Payments",
            icon: CreditCard,
            path: "/dashboard/payments",
            children: [
                { label: t("dashboard.subscription") || "Subscription", icon: CreditCard, path: "/dashboard/payments" },
                { label: t("dashboard.paymentHistory") || "Payment History", icon: History, path: "/dashboard/payments/history" },
                { label: t("dashboard.creditsLogs") || "Credits Usage", icon: Zap, path: "/dashboard/payments/credits" },
            ],
        },
        {
            label: t("dashboard.gallery"),
            icon: Image,
            path: "/dashboard/gallery",
        },
        {
            label: t("dashboard.settings"),
            icon: Settings,
            path: "/dashboard/settings",
        },
        {
            label: t("dashboard.helpAndLearning"),
            icon: HelpCircle,
            path: "/dashboard/help",
            children: [
                { label: t("dashboard.feedback"), icon: MessageSquare, path: "/dashboard/help/feedback" },
                { label: t("dashboard.tutorials"), icon: BookOpen, path: "/dashboard/help/tutorials" },
                { label: t("dashboard.helpCenter"), icon: FileQuestion, path: "/dashboard/help/help-center" },
            ],
        },
    ];

    const toggleExpanded = (label) => {
        setExpandedItems((prev) =>
            prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
        );
    };

    const isActive = (path, hasChildren = false) => {
        if (hasChildren) {
            return pathname === path || pathname.startsWith(path + "/");
        }
        return pathname === path;
    };

    const isExpanded = !collapsed || (collapsed && hovered);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("org_auth_token");
            router.push("/login");
        }
    };

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-screen border-r border-gray-700 backdrop-blur-md bg-gray-900 text-white transition-all duration-300 font-sans text-base
                ${isExpanded ? "w-64" : "w-20"}
            `}
            onMouseEnter={() => setHovered && setHovered(true)}
            onMouseLeave={() => setHovered && setHovered(false)}
        >
            {/* Header - same as frontend */}
            <div className="flex items-center h-16 px-3 border-b border-gray-800">
                <Link href="/dashboard" className="flex items-center gap-2 flex-1 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                            <img src="/images/favicon.png" alt="Splash AI Studio" className="w-full h-full object-contain"  />
                        </div>
                    {isExpanded && (
                        <div className="flex items-center justify-center gap-2 group" >
                            <Link href="/dashboard" className="flex items-center justify-center gap-2 group" >
                                <img
                                    src="/images/sidebar.png"
                                    alt="Splash AI Studio"
                                    className="h-32 lg:h-40 w-auto object-contain hover:scale-105 transition-transform duration-300 translate-y-2 mb-px"
                                />
                            </Link>
                           
                </div>
                    )}
                </Link>

                <button
                    onClick={() => setCollapsed && setCollapsed(!collapsed)}
                    className="ml-2 flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                >
                    {collapsed ? (
                        <ChevronRight className="w-6 h-6 text-white" />
                    ) : (
                        <ChevronLeft className="w-6 h-6 text-white" />
                    )}
                </button>
            </div>

            {/* Navigation - same as frontend */}
            <nav className="p-3 space-y-2 overflow-y-auto h-[calc(100%-6.5rem)] pb-20">
                {navItems.map((item) => (
                    <div key={item.label}>
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => isExpanded && toggleExpanded(item.label)}
                                    className={`w-full flex items-center cursor-pointer ${isExpanded ? "gap-3" : "justify-center"} 
              px-3 py-2 rounded-md text-sm font-medium transition-colors 
              ${isActive(item.path, true)
                                            ? "bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-md"
                                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    <item.icon className={`${isExpanded ? "w-5 h-5" : "w-7 h-7"} transition-all`} />
                                    {isExpanded && (
                                        <>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <ChevronRight
                                                className={`w-4 h-4 transition-transform ${expandedItems.includes(item.label)
                                                    ? "rotate-90"
                                                    : ""
                                                    }`}
                                            />
                                        </>
                                    )}
                                </button>

                                {isExpanded && expandedItems.includes(item.label) && (
                                    <div className="ml-6 mt-1 space-y-1 animate-fadeIn">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.path}
                                                href={child.path}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                                                        ${isActive(child.path)
                                                            ? "bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-md"
                                                            : "text-gray-400 hover:text-white hover:bg-white/10"
                                                        }`}
                                            >
                                                <child.icon className="w-4 h-4" />
                                                <span>{child.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                href={item.path}
                                className={`flex items-center ${isExpanded ? "gap-3" : "justify-center my-3"} 
                                        px-3 py-2 rounded-md text-sm font-medium transition-colors my-3
                                        ${isActive(item.path)
                                            ? "bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-md"
                                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                                        }`}
                            >
                                <item.icon className={`transition-all w-5 h-5 ${isExpanded ? "" : "my-3"}`} />
                                {isExpanded && <span>{item.label}</span>}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer - same as frontend (Switch User + Logout + icons) */}
            <div className="absolute bottom-0 left-0 w-full border-t border-gray-800 bg-gray-900/80 backdrop-blur-md">
                <div className="flex flex-col items-center justify-center gap-2 py-3 px-4">
                    {/* Switch User */}
                    <button
                        onClick={switchToFrontendPortal}
                        className={`flex items-center ${isExpanded ? "gap-3 w-full text-left" : "justify-center"} 
                            text-gray-300 hover:text-white px-3 py-2 rounded-md hover:bg-white/10 transition`}
                        title={t("dashboard.switchToUserPortal")}
                    >
                        <User className="w-5 h-5" />
                        {isExpanded && <span>{t("dashboard.switchToUserPortal")}</span>}
                    </button>
                    {/* Logout */}
                    

                    {/* Footer icons (hidden when collapsed) - same as frontend */}
                    {isExpanded && (
                        <div className="flex justify-around w-full mt-2">
                            <button type="button" className="p-2 rounded-md hover:bg-white/10">
                                <MessageCircle className="w-5 h-5 text-gray-300 hover:text-white" />
                            </button>
                            <button type="button" className="p-2 rounded-md hover:bg-white/10 relative">
                                <Bell className="w-5 h-5 text-gray-300 hover:text-white" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full" />
                            </button>
                            <button type="button" className="p-2 rounded-md hover:bg-white/10">
                                <Settings className="w-5 h-5 text-gray-300 hover:text-white" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
