"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
} from "lucide-react";

export function Sidebar({ collapsed, setCollapsed, hovered, setHovered }) {
    const [expandedItems, setExpandedItems] = useState([]);
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/dashboard",
        },
        {
            label: "Users",
            icon: Users,
            path: "/dashboard/users",
        },
        {
            label: "Projects",
            icon: FolderKanban,
            path: "/dashboard/projects",
        },
        {
            label: "Billings and Plans",
            icon: CreditCard,
            path: "/dashboard/payments",
        },
        {
            label: "Credits Usage History",
            icon: History,
            path: "/dashboard/credits-history",
        },
        {
            label: "Gallery",
            icon: Image,
            path: "/dashboard/gallery",
        },
        {
            label: "Settings",
            icon: Settings,
            path: "/dashboard/settings",
        },
        {
            label: "Help and Learning",
            icon: HelpCircle,
            path: "/dashboard/help",
            children: [
                { label: "Feedback", icon: MessageSquare, path: "/dashboard/help/feedback" },
                { label: "Tutorials", icon: BookOpen, path: "/dashboard/help/tutorials" },
                { label: "Help Center", icon: FileQuestion, path: "/dashboard/help/help-center" },
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
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => (
                    <NavItem key={item.path} item={item} />
                ))}
            </nav>
        </aside>
    );
}
