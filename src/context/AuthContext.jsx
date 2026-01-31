"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { organizationAPI } from "@/lib/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load saved token & user from localStorage (client-side only)
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Check for existing token in localStorage (organization portal uses org_auth_token)
            const savedToken = localStorage.getItem("org_auth_token");
            const savedUser = localStorage.getItem("org_user");

            if (savedToken && savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    setToken(savedToken);
                    setUser(userData);
                } catch (e) {
                    console.error("Error parsing user data:", e);
                }
            }
            setIsLoading(false);
        }
    }, []);

    // LOGIN function
    const login = async (email, password) => {
        try {
            const data = await organizationAPI.login(email, password);

            if (data?.token) {
                setToken(data.token);
                setUser(data.user);

                localStorage.setItem("org_auth_token", data.token);
                localStorage.setItem("org_user", JSON.stringify(data.user));
                
                if (data.user.preferred_language) {
                    localStorage.setItem('preferredLanguage', data.user.preferred_language);
                }

                toast.success("Login successful");
                return { success: true };
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.message || "Login failed");
            return { success: false, error: error.message };
        }
    };

    // LOGOUT function
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("org_auth_token");
        localStorage.removeItem("org_user");
        localStorage.removeItem("org_user_id");
        localStorage.removeItem("org_organization_id");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
