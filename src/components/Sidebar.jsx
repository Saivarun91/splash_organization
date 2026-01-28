"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    User,
    LogOut,
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
            label: t("dashboard.billingsAndPlans"),
            icon: CreditCard,
            path: "/dashboard/payments",
        },
        {
            label: t("dashboard.creditsUsageHistory"),
            icon: History,
            path: "/dashboard/credits-history",
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

    const NavItem = ({ item, level = 0 }) => {
        const hasChildren = item.children && item.children.length > 0;
        const active = isActive(item.path, hasChildren);
        const isItemExpanded = expandedItems.includes(item.label);

        if (hasChildren) {
            return (
                <div>
                    <button
                        onClick={() => toggleExpanded(item.label)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            active
                                ? "bg-blue-600 text-white"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {isExpanded && (
                            <>
                                <span className="flex-1 text-left">{item.label}</span>
                                {isItemExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </>
                        )}
                    </button>
                    {isItemExpanded && isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                            {item.children.map((child) => {
                                const childActive = isActive(child.path);
                                return (
                                    <button
                                        key={child.path}
                                        onClick={() => router.push(child.path)}
                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                                            childActive
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                        }`}
                                    >
                                        <child.icon className="w-4 h-4 shrink-0" />
                                        <span className="text-sm">{child.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <button
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
                <item.icon className="w-5 h-5 shrink-0" />
                {isExpanded && <span>{item.label}</span>}
            </button>
        );
    };

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-screen border-r border-gray-700 backdrop-blur-md bg-gray-900 text-white transition-all duration-300 ${
                isExpanded ? "w-64" : "w-20"
            }`}
            onMouseEnter={() => setHovered && setHovered(true)}
            onMouseLeave={() => setHovered && setHovered(false)}
        >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
                {isExpanded && (
                    <h1 className="text-xl font-bold">Organization Portal</h1>
                )}
                {!isExpanded && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                )}
                {isExpanded && setCollapsed && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 rounded hover:bg-gray-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                {!isExpanded && (
                    <button
                        onClick={() => setCollapsed && setCollapsed(false)}
                        className="p-1 rounded hover:bg-gray-800"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
                {navItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                ))}
            </nav>

            {/* Footer - Switch User */}
            <div className="absolute bottom-0 left-0 w-full border-t border-gray-800 bg-gray-900/80 backdrop-blur-md">
                <div className="flex flex-col gap-2 py-3 px-4">
                    {/* Switch User Button */}
                    <button
                        onClick={switchToFrontendPortal}
                        className={`flex items-center ${isExpanded ? "gap-3 w-full text-left" : "justify-center"} 
                            text-gray-300 hover:text-white px-3 py-2 rounded-md hover:bg-white/10 transition`}
                        title={t("dashboard.switchToUserPortal")}
                    >
                        <User className="w-5 h-5" />
                        {isExpanded && <span>{t("dashboard.switchToUserPortal")}</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
