"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Search, Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { organizationAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const ITEMS_PER_PAGE = 10;

export default function CreditsHistoryPage() {
    const { t } = useLanguage();
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });
    const [members, setMembers] = useState([]);
    const [creditUsage, setCreditUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [membersLoading, setMembersLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orgId = localStorage.getItem("org_organization_id");
                if (!orgId) {
                    setLoading(false);
                    return;
                }

                setOrganizationId(orgId);

                // Fetch members with pagination
                await fetchMembers(orgId, 1);

                // Fetch credit usage
                const usageData = await organizationAPI.getOrganizationCreditUsage(orgId);
                if (usageData.usage_data) {
                    setCreditUsage(usageData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchMembers = async (orgId, page = 1) => {
        setMembersLoading(true);
        try {
            const membersData = await organizationAPI.getOrganizationMembers(orgId);
            if (membersData.members) {
                setMembers(membersData.members);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setMembersLoading(false);
        }
    };

    const filteredMembers = members.filter(
        (user) =>
            (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const getUserCreditLogs = (userEmail) => {
        if (!creditUsage || !creditUsage.usage_data) return [];
    
        return creditUsage.usage_data.filter((log) => {
            return log.user_email === userEmail;
        });
    };
    
    const getFilteredLogs = () => {
        if (!selectedUser) return [];
        const logs = getUserCreditLogs(selectedUser.email);

        return logs.filter((log) => {
            if (!log.date) return false;
            const logDate = new Date(log.date);
            const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
            const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

            if (startDate && logDate < startDate) return false;
            if (endDate && logDate > endDate) return false;
            return true;
        });
    };

    const CreditLogsModal = () => {
        if (!selectedUser) return null;

        const logs = getFilteredLogs();
        const user = members.find((m) => m.id === selectedUser.id);
        console.log(user);
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col text-foreground animate-scale-in">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">{t("orgPortal.creditUsageHistory") || "Credit Usage History"}</h2>
                            <p className="text-muted-foreground mt-1">
                                {user?.full_name || user?.email} ({user?.email})
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedUser(null);
                                setDateFilter({ startDate: "", endDate: "" });
                            }}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-muted-foreground hover:text-foreground" />
                        </button>
                    </div>

                    <div className="p-6 border-b border-border bg-accent/10">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">{t("orgPortal.filterByDate") || "Filter by date"}:</span>
                            </div>
                            <input
                                type="date"
                                value={dateFilter.startDate}
                                onChange={(e) =>
                                    setDateFilter((prev) => ({ ...prev, startDate: e.target.value }))
                                }
                                className="px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                            />
                            <span className="text-muted-foreground">{t("orgPortal.to") || "to"}</span>
                            <input
                                type="date"
                                value={dateFilter.endDate}
                                onChange={(e) =>
                                    setDateFilter((prev) => ({ ...prev, endDate: e.target.value }))
                                }
                                className="px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                            />
                            {(dateFilter.startDate || dateFilter.endDate) && (
                                <button
                                    onClick={() => setDateFilter({ startDate: "", endDate: "" })}
                                    className="px-4 py-2 text-sm text-foreground bg-secondary border border-border rounded-lg hover:bg-accent transition-colors"
                                >
                                    {t("orgPortal.clearFilter") || "Clear"}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {logs.length > 0 ? (
                            <div className="overflow-x-auto text-foreground">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-accent/20">
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">{t("orgPortal.date") || "Date"}</th>
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">{t("orgPortal.type") || "Type"}</th>
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">{t("orgPortal.amount") || "Amount"}</th>
                                            <th className="text-left py-3 px-4 font-semibold text-foreground text-center">
                                                {t("orgPortal.balanceAfter") || "Balance After"}
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-foreground">{t("orgPortal.reason") || "Reason"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="border-b border-border hover:bg-accent/30 transition-colors"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-foreground">
                                                            {log.date ? new Date(log.date).toLocaleDateString() : "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            log.change_type === "credit"
                                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                        }`}
                                                    >
                                                        {log.change_type === "credit" ? (t("orgPortal.credit") || "Credit") : (t("orgPortal.debit") || "Debit")}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-semibold">
                                                    <span
                                                        className={
                                                            log.change_type === "credit"
                                                                ? "text-emerald-400"
                                                                : "text-red-400"
                                                        }
                                                    >
                                                        {log.change_type === "credit" ? "+" : "-"}
                                                        {log.credits_changed}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center font-semibold text-foreground">
                                                    {log.balance_after}
                                                </td>
                                                <td className="py-4 px-4 text-muted-foreground">
                                                    {log.reason || "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">{t("orgPortal.noCreditLogsFound") || "No credit logs found"}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-gold-solid animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t("orgPortal.loadingCreditHistory") || "Loading credit history..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{t("orgPortal.creditsUsageHistory") || "Credits Usage History"}</h1>
                <p className="text-muted-foreground">{t("orgPortal.viewIndividualCreditUsage") || "View individual credit usage by organization members"}</p>
            </div>

            {creditUsage && creditUsage.summary && (
                <div className="mb-6 bg-card rounded-lg shadow-md p-6 border border-border text-foreground">
                    <h2 className="text-lg font-semibold text-foreground mb-4">{t("orgPortal.summary") || "Summary"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{t("orgPortal.totalDebits") || "Total Debits"}</p>
                            <p className="text-2xl font-bold text-red-400">{creditUsage.summary.total_debits || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("orgPortal.totalCredits") || "Total Credits"}</p>
                            <p className="text-2xl font-bold text-emerald-400">
                                {creditUsage.summary.total_credits || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("orgPortal.netUsage") || "Net Usage"}</p>
                            <p className="text-2xl font-bold text-foreground">{creditUsage.summary.net_usage || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("orgPortal.currentBalance") || "Current Balance"}</p>
                            <p className="text-2xl font-bold text-gold-solid">
                                {creditUsage.organization?.current_balance || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t("orgPortal.searchUsers") || "Search users..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-card border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden text-foreground">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-accent/30 border-b border-border">
                            <tr>
                                <th className="text-left py-4 px-6 font-semibold text-foreground">{t("orgPortal.user") || "User"}</th>
                                <th className="text-left py-4 px-6 font-semibold text-foreground">{t("orgPortal.email") || "Email"}</th>
                                <th className="text-left py-4 px-6 font-semibold text-foreground">{t("orgPortal.role") || "Role"}</th>
                                <th className="text-left py-4 px-6 font-semibold text-foreground">{t("orgPortal.actions") || "Actions"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {membersLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center">
                                        <Loader2 className="w-6 h-6 text-gold-solid animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : paginatedMembers.length > 0 ? (
                                paginatedMembers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-border hover:bg-accent/30 transition-colors cursor-pointer"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-primary-foreground font-semibold shadow-sm">
                                                    {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-foreground">
                                                    {user.full_name || user.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-muted-foreground">{user.email}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-muted-foreground capitalize">{user.organization_role || "member"}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser(user);
                                                }}
                                                className="px-4 py-2 bg-gold-gradient text-primary-foreground font-semibold rounded-lg hover:brightness-110 shadow-md transition-all text-sm"
                                            >
                                                {t("orgPortal.viewCreditLogs") || "View Credit Logs"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-12">
                                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">{t("orgPortal.noUsersFound") || "No users found"}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredMembers.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-accent/10">
                        <div className="text-sm text-muted-foreground">
                            {t("orgPortal.showingUsers")?.replace("{start}", startIndex + 1)?.replace("{end}", Math.min(endIndex, filteredMembers.length))?.replace("{total}", filteredMembers.length) || `Showing ${startIndex + 1}-${Math.min(endIndex, filteredMembers.length)} of ${filteredMembers.length} users`}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-border rounded-lg hover:bg-accent text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-foreground">
                                {t("orgPortal.pageOf")?.replace("{current}", currentPage)?.replace("{total}", totalPages) || `Page ${currentPage} of ${totalPages}`}
                            </span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-border rounded-lg hover:bg-accent text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CreditLogsModal />
        </div>
    );
}
