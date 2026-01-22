"use client";

import { useState, useEffect } from "react";
import { Users, Coins, FolderKanban, Image as ImageIcon, Loader2 } from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { organizationAPI } from "@/lib/api";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCredits: 0,
        totalProjects: 0,
        imagesGenerated: 0,
    });
    const [organizationId, setOrganizationId] = useState(null);
    const [organizationName, setOrganizationName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get organization ID from localStorage
                const orgId = localStorage.getItem("org_organization_id");
                if (!orgId) {
                    console.error("Organization ID not found");
                    setLoading(false);
                    return;
                }

                setOrganizationId(orgId);

                // Fetch organization stats
                const statsData = await organizationAPI.getOrganizationStats(orgId);
                if (statsData.stats) {
                    setStats({
                        totalUsers: statsData.stats.total_members || 0,
                        totalCredits: statsData.stats.credit_balance || 0,
                        totalProjects: statsData.stats.total_projects || 0,
                        imagesGenerated: statsData.stats.total_images || 0,
                    });
                    setOrganizationName(statsData.organization_name || "");
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : value.toLocaleString()}
                    </p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">
                    Welcome to {organizationName || "your organization"} dashboard
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Users}
                    title="Total Users"
                    value={stats.totalUsers}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Coins}
                    title="Total Credits"
                    value={stats.totalCredits}
                    color="bg-green-500"
                />
                <StatCard
                    icon={FolderKanban}
                    title="Total Projects"
                    value={stats.totalProjects}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={ImageIcon}
                    title="Images Generated"
                    value={stats.imagesGenerated}
                    color="bg-orange-500"
                />
            </div>

            {/* Placeholder for charts - can be enhanced later */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Overview</h2>
                <p className="text-gray-600">
                    Charts and detailed analytics will be available here soon.
                </p>
            </div>
        </div>
    );
}
