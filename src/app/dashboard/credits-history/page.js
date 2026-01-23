"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Search, Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { organizationAPI } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

export default function CreditsHistoryPage() {
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

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Credit Usage History</h2>
                            <p className="text-gray-600 mt-1">
                                {user?.full_name || user?.email} ({user?.email})
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedUser(null);
                                setDateFilter({ startDate: "", endDate: "" });
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
                            </div>
                            <input
                                type="date"
                                value={dateFilter.startDate}
                                onChange={(e) =>
                                    setDateFilter((prev) => ({ ...prev, startDate: e.target.value }))
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={dateFilter.endDate}
                                onChange={(e) =>
                                    setDateFilter((prev) => ({ ...prev, endDate: e.target.value }))
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {(dateFilter.startDate || dateFilter.endDate) && (
                                <button
                                    onClick={() => setDateFilter({ startDate: "", endDate: "" })}
                                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {logs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                                Balance After
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-900">
                                                            {log.date ? new Date(log.date).toLocaleDateString() : "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            log.change_type === "credit"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {log.change_type === "credit" ? "Credit" : "Debit"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`font-semibold ${
                                                            log.change_type === "credit"
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {log.change_type === "credit" ? "+" : "-"}
                                                        {log.credits_changed}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-gray-900 font-semibold">
                                                        {log.balance_after}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-gray-700">{log.reason || "N/A"}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600">No credit logs found for the selected date range</p>
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
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading credit history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Credits Usage History</h1>
                <p className="text-gray-600">View individual credit usage and consumption logs</p>
            </div>

            {creditUsage && creditUsage.summary && (
                <div className="mb-6 bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Total Debits</p>
                            <p className="text-2xl font-bold text-red-600">{creditUsage.summary.total_debits || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Credits</p>
                            <p className="text-2xl font-bold text-green-600">
                                {creditUsage.summary.total_credits || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Net Usage</p>
                            <p className="text-2xl font-bold text-gray-900">{creditUsage.summary.net_usage || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Current Balance</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {creditUsage.organization?.current_balance || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6 font-semibold text-gray-900">User</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-900">Email</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-900">Role</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {membersLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center">
                                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : paginatedMembers.length > 0 ? (
                                paginatedMembers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                    {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {user.full_name || user.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-gray-700">{user.email}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-gray-700 capitalize">{user.organization_role || "member"}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser(user);
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                View Credit Logs
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">No users found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredMembers.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} users
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
