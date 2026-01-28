"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function Topbar({ collapsed }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

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

    // Close notification sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                const bellButton = event.target.closest('button[data-notification-button]');
                if (!bellButton) {
                    setShowNotifications(false);
                }
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const getUserDisplayName = () => {
        if (user?.full_name) {
            return user.full_name;
        }
        if (user?.username) {
            return user.username;
        }
        if (user?.email) {
            return user.email.split('@')[0];
        }
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

    return (
        <>
            <header
                className={`fixed top-0 right-0 z-30 h-16 flex items-center bg-white border-b border-gray-200 shadow-sm px-6 transition-all duration-300 ${
                    collapsed ? "left-20" : "left-64"
                }`}
            >
                {/* Middle Section (Search) */}
                <div className="flex-1 flex justify-center">
                    <div className="relative w-1/3">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full border-b border-gray-300 text-gray-900 text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 bg-transparent"
                        />
                        <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <div className="relative" ref={notificationRef}>
                        <button
                            data-notification-button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <Bell className="w-5 h-5 text-gray-700 cursor-pointer" />
                        </button>

                        {/* Notification Sidebar Modal */}
                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col">
                                {/* Header */}
                                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-8 text-center">
                                    <p className="text-gray-500 text-sm">No notifications</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                        onClick={() => router.push("/dashboard/settings")}
                    >
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                            {getUserInitials()}
                        </div>
                        <span className="text-gray-900 text-sm hidden md:inline">{getUserDisplayName()}</span>
                    </button>
                </div>
            </header>
        </>
    );
}

