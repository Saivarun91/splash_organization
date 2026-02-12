"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, ChevronDown, SquareUser, Coins, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { switchToFrontendPortal } from "@/lib/portalSwitch";
import { useCredits } from "@/context/CreditsContext";
import { useLanguage } from "@/context/LanguageContext";
import toast from "react-hot-toast";

export function Topbar({ collapsed }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileRef = useRef(null);
    const { organizationCredits, userCredits, creditsLoading } = useCredits();
    const liveCredits = organizationCredits?.balance ?? userCredits?.balance;
    const { t } = useLanguage();
    const notify = (message) => toast(message);
    /* -------------------- Load User -------------------- */
    useEffect(() => {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem("org_user");
            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (e) {
                    console.error("Error parsing user data:", e);
                }
            }
        }
    }, []);

    /* -------------------- Outside Click (Profile Menu) -------------------- */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }
        };

        if (liveCredits && liveCredits < 100) {
            notify(`You have ${liveCredits} credits left. Please top up your credits.`);
        } else if (liveCredits && liveCredits >= 100) {
            notify(`You have ${liveCredits} credits left. You can continue using the platform.`);
        } else {
            notify(`You have no credits left. Please top up your credits.`);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* -------------------- Helpers -------------------- */
    const getUserDisplayName = () => {
        if (user?.full_name) return user.full_name;
        if (user?.username) return user.username;
        if (user?.email) return user.email.split("@")[0];
        return "User";
    };

    const getUserInitials = () => {
        const name = getUserDisplayName();
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    /* ======================= JSX (aligned with frontend) ======================= */
    return (
        <header
            className={`fixed top-0 right-0 z-30 h-16 flex items-center bg-white dark:bg-card border-b border-gray-200 dark:border-border shadow-sm px-6 transition-all duration-300 font-sans text-base ${
                collapsed ? "left-20" : "left-64"
            }`}
        >
            {/* Search */}
            <div className="flex-1 flex justify-center">
                <div className="relative w-1/3">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full border-b border-gray-300 dark:border-border text-gray-900 dark:text-foreground text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-muted-foreground bg-transparent"
                    />
                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">

                {/* Live credits */}
                {liveCredits && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        {creditsLoading ? (
                            <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                        ) : (
                            <>
                                <Coins className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-800">
                                    {liveCredits.toLocaleString()} {t("orgPortal.credits")}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                            {getUserInitials()}
                        </div>
                        <span className="text-gray-900 dark:text-foreground text-sm font-medium hidden md:inline">
                            {getUserDisplayName()}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-muted-foreground" />
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-lg z-50 overflow-hidden">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-border bg-gray-50 dark:bg-sidebar-accent/40">
                                <p className="text-sm font-semibold text-gray-900 dark:text-foreground">
                                    {getUserDisplayName()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
                                    {user?.email}
                                </p>
                            </div>

                            {/* Profile */}
                            <button
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-foreground hover:bg-indigo-50 dark:hover:bg-sidebar-accent/40 transition"
                            >
                                <User className="w-4 h-4 text-indigo-600 dark:text-sidebar-primary" />
                                {t("profile")}
                            </button>

                            {/* Switch to User Panel */}
                            <button
                                onClick={switchToFrontendPortal}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-foreground hover:bg-purple-50 dark:hover:bg-sidebar-accent/40 transition"
                            >
                                <SquareUser className="w-4 h-4 text-purple-600 dark:text-sidebar-primary" />
                                Switch to User Panel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
