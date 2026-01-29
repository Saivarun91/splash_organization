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
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCredits: 0,
        totalProjects: 0,
        imagesGenerated: 0,
    });
    const [organizationId, setOrganizationId] = useState(null);
    const [organizationName, setOrganizationName] = useState("");
    
    // Graph states
    const [creditGraphTimeRange, setCreditGraphTimeRange] = useState("day");
    const [creditGraphCustomRange, setCreditGraphCustomRange] = useState({ startDate: "", endDate: "" });
    const [creditGraphData, setCreditGraphData] = useState([]);
    
    const [imageGraphTimeRange, setImageGraphTimeRange] = useState("day");
    const [imageGraphCustomRange, setImageGraphCustomRange] = useState({ startDate: "", endDate: "" });
    const [imageGraphData, setImageGraphData] = useState([]);

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
                
                // Fetch data for graphs
                await fetchCreditGraphData(orgId);
                await fetchImageGraphData(orgId);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const fetchCreditGraphData = async (orgId) => {
        try {
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
        }
    };

    const fetchImageGraphData = async (orgId) => {
        try {
            const params = {
                limit: 1000,
                offset: 0,
            };
            
            const data = await organizationAPI.getOrganizationImages(orgId, params);
            if (data.images) {
                processImageGraphData(data.images);
            }
        } catch (error) {
            console.error("Error fetching image graph data:", error);
        }
    };

    const processCreditGraphData = (usageData) => {
        if (!usageData || usageData.length === 0) {
            setCreditGraphData([]);
            return;
        }

        const now = new Date();
        let startDate;
        let groupBy;

        switch (creditGraphTimeRange) {
            case "day":
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                groupBy = "day";
                break;
            case "week":
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 28);
                groupBy = "week";
                break;
            case "month":
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 6);
                groupBy = "month";
                break;
            case "custom":
                if (creditGraphCustomRange.startDate && creditGraphCustomRange.endDate) {
                    startDate = new Date(creditGraphCustomRange.startDate);
                    const endDate = new Date(creditGraphCustomRange.endDate);
                    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 30) {
                        groupBy = "day";
                    } else if (diffDays <= 90) {
                        groupBy = "week";
                    } else {
                        groupBy = "month";
                    }
                } else {
                    setCreditGraphData([]);
                    return;
                }
                break;
            default:
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 6);
                groupBy = "month";
        }

        const filteredData = usageData.filter((entry) => {
            if (!entry.date) return false;
            const entryDate = new Date(entry.date);
            return entryDate >= startDate;
        });

        const grouped = {};
        filteredData.forEach((entry) => {
            const date = new Date(entry.date);
            let key;

            if (groupBy === "day") {
                key = date.toISOString().split("T")[0];
            } else if (groupBy === "week") {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split("T")[0];
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            }

            if (!grouped[key]) {
                grouped[key] = { date: key, credits: 0, debits: 0 };
            }

            if (entry.change_type === "credit") {
                grouped[key].credits += entry.credits_changed;
            } else {
                grouped[key].debits += entry.credits_changed;
            }
        });

        const graphDataArray = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
        
        graphDataArray.forEach((item) => {
            if (groupBy === "day") {
                // Format as YYYY-MM-DD for day view
                item.date = item.date;
            } else if (groupBy === "week") {
                item.date = `Week of ${new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
            } else {
                const [year, month] = item.date.split("-");
                item.date = new Date(year, parseInt(month) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            }
        });

        setCreditGraphData(graphDataArray);
    };

    const processImageGraphData = (imagesData) => {
        if (!imagesData || imagesData.length === 0) {
            setImageGraphData([]);
            return;
        }

        const now = new Date();
        let startDate;
        let groupBy;

        switch (imageGraphTimeRange) {
            case "day":
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                groupBy = "day";
                break;
            case "week":
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 28);
                groupBy = "week";
                break;
            case "month":
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 6);
                groupBy = "month";
                break;
            case "custom":
                if (imageGraphCustomRange.startDate && imageGraphCustomRange.endDate) {
                    startDate = new Date(imageGraphCustomRange.startDate);
                    const endDate = new Date(imageGraphCustomRange.endDate);
                    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 30) {
                        groupBy = "day";
                    } else if (diffDays <= 90) {
                        groupBy = "week";
                    } else {
                        groupBy = "month";
                    }
                } else {
                    setImageGraphData([]);
                    return;
                }
                break;
            default:
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 6);
                groupBy = "month";
        }

        const filteredData = imagesData.filter((img) => {
            if (!img.created_at) return false;
            const imgDate = new Date(img.created_at);
            return imgDate >= startDate;
        });

        const grouped = {};
        filteredData.forEach((img) => {
            const date = new Date(img.created_at);
            let key;

            if (groupBy === "day") {
                key = date.toISOString().split("T")[0];
            } else if (groupBy === "week") {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split("T")[0];
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            }

            if (!grouped[key]) {
                grouped[key] = { date: key, count: 0 };
            }

            grouped[key].count += 1;
        });

        const graphDataArray = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
        
        graphDataArray.forEach((item) => {
            if (groupBy === "day") {
                // Format as YYYY-MM-DD for day view
                item.date = item.date;
            } else if (groupBy === "week") {
                item.date = `Week of ${new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
            } else {
                const [year, month] = item.date.split("-");
                item.date = new Date(year, parseInt(month) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            }
        });

        setImageGraphData(graphDataArray);
    };

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-foreground">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : value.toLocaleString()}
                    </p>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">{t("common.loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("dashboard.dashboard")}</h1>
                <p className="text-gray-600">
                    Welcome to {organizationName || t("dashboard.user")} {t("dashboard.dashboard").toLowerCase()}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Users}
                    title={t("dashboard.totalUsers")}
                    value={stats.totalUsers}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Coins}
                    title={t("dashboard.totalCredits")}
                    value={stats.totalCredits}
                    color="bg-green-500"
                />
                <StatCard
                    icon={FolderKanban}
                    title={t("dashboard.totalProjects")}
                    value={stats.totalProjects}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={ImageIcon}
                    title={t("dashboard.imagesGenerated")}
                    value={stats.imagesGenerated}
                    color="bg-orange-500"
                />
            </div>

            {/* Graphs Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Credit Consumption Graph */}
                <div className="bg-card text-card-foreground rounded-xl shadow-sm p-6 border border-border">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{t("dashboard.creditConsumptionAnalytics")}</h2>
                        <p className="text-sm text-gray-500">{t("dashboard.trackCreditUsage")}</p>
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
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                            No data available for the selected time range
                        </div>
                    )}
                </div>

                {/* Images Generated Graph */}
                <div className="bg-card text-card-foreground rounded-xl shadow-sm p-6 border border-border">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{t("dashboard.imagesGeneratedAnalytics")}</h2>
                        <p className="text-sm text-gray-500">{t("dashboard.trackImageGeneration")}</p>
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
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                            No data available for the selected time range
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
