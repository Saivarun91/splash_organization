"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, X, Calendar, DollarSign, Eye } from "lucide-react";
import { paymentAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { InvoiceView } from "@/components/InvoiceView";
import { Button } from "@/components/ui/button";

export default function PaymentHistoryPage() {
    const { t } = useLanguage();
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        const orgId = localStorage.getItem("org_organization_id");
        if (orgId) {
            setOrganizationId(orgId);
            fetchPaymentHistory(orgId);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchPaymentHistory = async (orgId) => {
        setLoading(true);
        try {
            const data = await paymentAPI.getPaymentHistory(orgId);
            if (data.transactions) {
                setPaymentHistory(data.transactions);
            }
        } catch (error) {
            console.error("Error fetching payment history:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("orgPortal.paymentHistory") || "Payment History"}</h1>
                <p className="text-gray-600">{t("orgPortal.viewAllPaymentTransactions") || "View all your payment transactions"}</p>
            </div>

            <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border">
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">{t("orgPortal.loading") || "Loading..."}</span>
                        </div>
                    ) : paymentHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">{t("orgPortal.noPaymentHistoryFound") || "No payment history found"}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-center py-3 px-4 font-semibold text-gray-900">{t("orgPortal.date") || "Date"}</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                            {t("orgPortal.planType") || "Plan Type"}
                                        </th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                            {t("orgPortal.credits") || "Credits"}
                                        </th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                            {t("orgPortal.amount") || "Amount"}
                                        </th>
                                        <th className="text-left py-3 px-10 font-semibold text-gray-900">{t("orgPortal.status") || "Status"}</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                            {t("orgPortal.transactionId") || "Transaction ID"}
                                        </th>
                                        <th className="text-center py-3 px-4 font-semibold text-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="border-b border-border hover:bg-accent/50"
                                        >
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-foreground">
                                                        {payment.created_at
                                                            ? new Date(payment.created_at).toLocaleDateString()
                                                            : "N/A"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-gray-900 font-medium">
                                                    {payment.plan_name || t("orgPortal.creditPurchase") || "Credit Purchase"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-foreground font-semibold">
                                                    {payment.credits?.toLocaleString() || 0}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-foreground font-semibold">
                                                        {payment.amount}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit mx-auto ${
                                                        payment.status === "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : payment.status === "pending" 
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {payment.status === "completed" ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        <X className="w-4 h-4" />
                                                    )}
                                                    {payment.status.charAt(0).toUpperCase() +
                                                        payment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-muted-foreground font-mono text-sm">
                                                    {payment.status !== "completed" ? "-" : payment.razorpay_order_id || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Button
                                                    onClick={() => setSelectedInvoice({
                                                        transactionId: payment.razorpay_order_id || payment.id,
                                                        paymentData: payment
                                                    })}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2"  
                                                    disabled={payment.status !== "completed"}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Invoice
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice View Modal */}
            {selectedInvoice && (
                <InvoiceView
                    transactionId={selectedInvoice.transactionId}
                    paymentData={selectedInvoice.paymentData}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
}
