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

    const handleProfileClick = () => {
        if (typeof window === "undefined") return;
        
        const token = localStorage.getItem("org_auth_token");
        const userStr = localStorage.getItem("org_user");
        
        if (!token) {
            console.error("No token found");
            return;
        }
        
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
        const encodedToken = encodeURIComponent(token);
        const encodedUser = encodeURIComponent(userStr || "");
        
        window.location.href = `${frontendUrl}/dashboard/my-account/profile?token=${encodedToken}&user=${encodedUser}&from=org`;
    };

    /* ======================= JSX (aligned with frontend) ======================= */
    return (
        <header
            className={`fixed top-0 right-0 z-30 h-16 flex items-center bg-card/90 backdrop-blur-md border-b border-border text-foreground px-6 transition-all duration-300 font-sans text-base ${
                collapsed ? "left-20" : "left-64"
            }`}
        >
            {/* Search */}
            <div className="flex-1 flex justify-center">
                <div className="relative w-1/3">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full border-b border-border text-foreground text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder-muted-foreground bg-transparent"
                    />
                    <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">

                {/* Live credits */}
                {liveCredits != null && (
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-card/50 border border-gold-muted rounded-lg">
                        {creditsLoading ? (
                            <Loader2 className="w-4 h-4 text-gold-solid animate-spin" />
                        ) : (
                            <>
                                <Coins className="w-4 h-4 text-gold-solid" />
                                <span className="text-xs sm:text-sm font-semibold text-gold-solid whitespace-nowrap">
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
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                    >
                        <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center text-sm font-semibold text-primary-foreground">
                            {getUserInitials()}
                        </div>
                        <span className="text-foreground text-sm font-medium hidden md:inline">
                            {getUserDisplayName()}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden text-foreground">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-border bg-secondary/50">
                                <p className="text-sm font-semibold truncate">
                                    {getUserDisplayName()}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email}
                                </p>
                            </div>

                            {/* Profile */}
                            <button
                                onClick={handleProfileClick}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition"
                            >
                                <User className="w-4 h-4 text-gold-solid" />
                                {t("common.profile")}
                            </button>

                            {/* Switch to User Panel */}
                            <button
                                onClick={switchToFrontendPortal}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition"
                            >
                                <SquareUser className="w-4 h-4 text-gold-solid" />
                                Switch to User Panel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
