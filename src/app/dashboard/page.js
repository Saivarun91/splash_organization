"use client";

import { useState, useEffect } from "react";
import { Users, Coins, FolderKanban, Image as ImageIcon, Loader2 } from "lucide-react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
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
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
    const { t } = useLanguage();

    /* ---------------- NEW: SPLIT LOADING STATES ---------------- */
    const [pageLoading, setPageLoading] = useState(true);
    const [creditGraphLoading, setCreditGraphLoading] = useState(true);
    const [imageGraphLoading, setImageGraphLoading] = useState(true);

    /* ---------------- OLD STATES (UNCHANGED) ---------------- */
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCredits: 0,
        totalProjects: 0,
        imagesGenerated: 0,
    });
    const [organizationId, setOrganizationId] = useState(null);
    const [organizationName, setOrganizationName] = useState("");

    const [creditGraphTimeRange, setCreditGraphTimeRange] = useState("day");
    const [creditGraphCustomRange, setCreditGraphCustomRange] = useState({ startDate: "", endDate: "" });
    const [creditGraphData, setCreditGraphData] = useState([]);

    const [imageGraphTimeRange, setImageGraphTimeRange] = useState("day");
    const [imageGraphCustomRange, setImageGraphCustomRange] = useState({ startDate: "", endDate: "" });
    const [imageGraphData, setImageGraphData] = useState([]);

    /* ---------------- INITIAL LOAD: STATS FIRST ---------------- */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const orgId = localStorage.getItem("org_organization_id");
                if (!orgId) {
                    console.error("Organization ID not found");
                    setPageLoading(false);
                    return;
                }

                setOrganizationId(orgId);

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

                /* ✅ PAGE CAN RENDER NOW */
                setPageLoading(false);

                /* ✅ LOAD GRAPHS AFTER PAGE */
                fetchCreditGraphData(orgId);
                fetchImageGraphData(orgId);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setPageLoading(false);
            }
        };

        fetchData();
    }, []);

    /* ---------------- GRAPH RELOAD EFFECTS (UNCHANGED) ---------------- */
    useEffect(() => {
        if (organizationId) {
            fetchCreditGraphData(organizationId);
        }
    }, [creditGraphTimeRange, creditGraphCustomRange]);

    useEffect(() => {
        if (organizationId) {
            fetchImageGraphData(organizationId);
        }
    }, [imageGraphTimeRange, imageGraphCustomRange]);

    /* ---------------- CREDIT GRAPH FETCH ---------------- */
    const fetchCreditGraphData = async (orgId) => {
        try {
            setCreditGraphLoading(true);

            const params = {};
            const now = new Date();

            if (creditGraphTimeRange === "custom" && creditGraphCustomRange.startDate && creditGraphCustomRange.endDate) {
                params.start_date = creditGraphCustomRange.startDate;
                params.end_date = creditGraphCustomRange.endDate;
            } else if (creditGraphTimeRange === "day") {
                const startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                params.start_date = startDate.toISOString().split("T")[0];
            } else if (creditGraphTimeRange === "week") {
                const startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 28);
                params.start_date = startDate.toISOString().split("T")[0];
            } else if (creditGraphTimeRange === "month") {
                const startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 6);
                params.start_date = startDate.toISOString().split("T")[0];
            }

            const usageData = await organizationAPI.getOrganizationCreditUsage(orgId, params);
            if (usageData.usage_data) {
                processCreditGraphData(usageData.usage_data);
            }
        } catch (error) {
            console.error("Error fetching credit graph data:", error);
        } finally {
            setCreditGraphLoading(false);
        }
    };

    /* ---------------- IMAGE GRAPH FETCH ---------------- */
    const fetchImageGraphData = async (orgId) => {
        try {
            setImageGraphLoading(true);

            const data = await organizationAPI.getOrganizationImages(orgId, {
                limit: 1000,
                offset: 0,
            });

            if (data.images) {
                processImageGraphData(data.images);
            }
        } catch (error) {
            console.error("Error fetching image graph data:", error);
        } finally {
            setImageGraphLoading(false);
        }
    };

    /* ---------------- ALL PROCESSING FUNCTIONS (UNCHANGED) ---------------- */
    // processCreditGraphData(...)
    // processImageGraphData(...)
    // (PASTE YOUR EXISTING FUNCTIONS HERE AS-IS)
    // ⬆️ NO CHANGES REQUIRED — KEEP EXACTLY SAME CODE

    /* ---------------- STAT CARD (UNCHANGED) ---------------- */
    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className="p-4 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-center pb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-muted-foreground">{title}</span>
                <Icon className="w-6 h-6 text-gray-700 dark:text-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-foreground">{value.toLocaleString()}</div>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{title}</p>
            </div>
        </div>
    );

    /* ---------------- PAGE LOADER ONLY FOR INITIAL LOAD ---------------- */
    if (pageLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    /* ---------------- RENDER (UI aligned with frontend) ---------------- */
    return (
        <div className="space-y-6">

            {/* Welcome / Header – same as frontend */}
            <div className="relative p-4 rounded-xl bg-white shadow-md border border-gray-200 dark:bg-card dark:border-border overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">{t("dashboard.dashboard")}</h1>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
                        Welcome to {organizationName || t("dashboard.user")} {t("dashboard.dashboard").toLowerCase()}
                    </p>
                </div>
            </div>

            {/* STATS – same card style as frontend */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <StatCard title={t("dashboard.totalUsers")} value={stats.totalUsers} icon={ Users } color="bg-blue-500" />
                <StatCard title={t("dashboard.totalCredits")} value={stats.totalCredits} icon={ Coins } color="bg-green-500" />
                <StatCard title={t("dashboard.totalProjects")} value={stats.totalProjects} icon={ FolderKanban } color="bg-purple-500" />
                <StatCard title={t("dashboard.imagesGenerated")} value={stats.imagesGenerated} icon={ ImageIcon } color="bg-orange-500" />
            </div>

            {/* GRAPHS (ONLY LOADER ADDED) */}

                {/* CREDIT GRAPH */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Credit Consumption Graph */}
                <div className="p-6 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-1">{t("dashboard.creditConsumptionAnalytics")}</h2>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">{t("dashboard.trackCreditUsage")}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => setCreditGraphTimeRange("custom")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                creditGraphTimeRange === "custom"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                            {t("dashboard.customDates")}
                        </button>
                        <button
                            onClick={() => setCreditGraphTimeRange("day")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                creditGraphTimeRange === "day"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                            {t("dashboard.daily")}
                        </button>
                        <button
                            onClick={() => setCreditGraphTimeRange("week")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                creditGraphTimeRange === "week"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                            {t("dashboard.weekly")}
                        </button>
                        <button
                            onClick={() => setCreditGraphTimeRange("month")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                creditGraphTimeRange === "month"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                            {t("dashboard.monthly")}
                        </button>
                    </div>
                    {creditGraphTimeRange === "custom" && (
                        <div className="flex items-center gap-2 mb-6">
                            <input
                                type="date"
                                value={creditGraphCustomRange.startDate}
                                onChange={(e) =>
                                    setCreditGraphCustomRange((prev) => ({ ...prev, startDate: e.target.value }))
                                }
                                className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={creditGraphCustomRange.endDate}
                                onChange={(e) =>
                                    setCreditGraphCustomRange((prev) => ({ ...prev, endDate: e.target.value }))
                                }
                                className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                            />
                        </div>
                    )}
                    {creditGraphData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={creditGraphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorDebits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis 
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="line"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="credits" 
                                    stroke="#10b981" 
                                    fillOpacity={1} 
                                    fill="url(#colorCredits)" 
                                    strokeWidth={2.5}
                                    name="Credits Added" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="debits" 
                                    stroke="#ef4444" 
                                    fillOpacity={1} 
                                    fill="url(#colorDebits)" 
                                    strokeWidth={2.5}
                                    name="Credits Used" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        creditGraphLoading ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                Loading...
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                No data available for the selected time range
                            </div>
                        )
                    )}
                </div>

                {/* Images Generated Graph */}
                <div className="p-6 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-1">{t("dashboard.imagesGeneratedAnalytics")}</h2>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground">{t("dashboard.trackImageGeneration")}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => setImageGraphTimeRange("custom")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                imageGraphTimeRange === "custom"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                            {t("dashboard.customDates")}
                        </button>
                        <button
                            onClick={() => setImageGraphTimeRange("day")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                imageGraphTimeRange === "day"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                            {t("dashboard.daily")}
                        </button>
                        <button
                            onClick={() => setImageGraphTimeRange("week")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                imageGraphTimeRange === "week"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                            {t("dashboard.weekly")}
                        </button>
                        <button
                            onClick={() => setImageGraphTimeRange("month")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                imageGraphTimeRange === "month"
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                            {t("dashboard.monthly")}
                        </button>
                    </div>
                    {imageGraphTimeRange === "custom" && (
                        <div className="flex items-center gap-2 mb-6">
                            <input
                                type="date"
                                value={imageGraphCustomRange.startDate}
                                onChange={(e) =>
                                    setImageGraphCustomRange((prev) => ({ ...prev, startDate: e.target.value }))
                                }
                                className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={imageGraphCustomRange.endDate}
                                onChange={(e) =>
                                    setImageGraphCustomRange((prev) => ({ ...prev, endDate: e.target.value }))
                                }
                                className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                            />
                        </div>
                    )}
                    {imageGraphData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={imageGraphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis 
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="line"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#3b82f6" 
                                    fillOpacity={1} 
                                    fill="url(#colorImages)" 
                                    strokeWidth={2.5}
                                    name={t("dashboard.imagesGenerated")} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        
                        imageGraphLoading ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                Loading...
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                No data available for the selected time range
                            </div>
                        )
                    )
                }
                </div>
            </div>
        </div>
    );
}
