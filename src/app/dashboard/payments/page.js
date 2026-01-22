"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, X, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { paymentAPI, organizationAPI } from "@/lib/api";

const CREDIT_PACKAGES = [
    { id: 1, name: "Starter", credits: 1000, price: 99, popular: false },
    { id: 2, name: "Professional", credits: 5000, price: 449, popular: true },
    { id: 3, name: "Enterprise", credits: 15000, price: 1299, popular: false },
];

export default function PaymentsPage() {
    const [activeTab, setActiveTab] = useState("plans");
    const [loading, setLoading] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [organizationId, setOrganizationId] = useState(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        const orgId = localStorage.getItem("org_organization_id");
        if (orgId) {
            setOrganizationId(orgId);
            fetchPaymentHistory(orgId);
        }

        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const fetchPaymentHistory = async (orgId) => {
        try {
            const data = await paymentAPI.getPaymentHistory(orgId);
            if (data.transactions) {
                setPaymentHistory(data.transactions);
            }
        } catch (error) {
            console.error("Error fetching payment history:", error);
        }
    };

    const handlePurchaseCredits = async (packageItem) => {
        if (!organizationId || !razorpayLoaded) {
            alert("Please wait for payment gateway to load");
            return;
        }

        setProcessingPayment(true);
        try {
            // Create Razorpay order
            const orderData = await paymentAPI.createRazorpayOrder(
                organizationId,
                packageItem.price,
                packageItem.credits
            );

            if (!orderData.success) {
                throw new Error(orderData.error || "Failed to create order");
            }

            const options = {
                key: orderData.key_id,
                amount: orderData.amount * 100, // Convert to paise
                currency: "INR",
                name: "Splash AI Studio",
                description: `Purchase ${packageItem.credits} credits`,
                order_id: orderData.order_id,
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyData = await paymentAPI.verifyPayment(
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature
                        );

                        if (verifyData.success) {
                            alert(`Payment successful! ${packageItem.credits} credits added to your account.`);
                            // Refresh payment history
                            fetchPaymentHistory(organizationId);
                            // Refresh organization data
                            window.location.reload();
                        } else {
                            alert("Payment verification failed: " + (verifyData.error || "Unknown error"));
                        }
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        alert("Payment verification failed. Please contact support.");
                    } finally {
                        setProcessingPayment(false);
                    }
                },
                prefill: {
                    email: localStorage.getItem("org_user")
                        ? JSON.parse(localStorage.getItem("org_user")).email
                        : "",
                },
                theme: {
                    color: "#884cff",
                },
                modal: {
                    ondismiss: function () {
                        setProcessingPayment(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Payment error:", error);
            alert("Failed to initiate payment: " + (error.message || "Unknown error"));
            setProcessingPayment(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments and Subscriptions</h1>
                <p className="text-gray-600">Manage your payments and purchase credits</p>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("plans")}
                        className={`px-6 py-4 font-medium transition-colors ${
                            activeTab === "plans"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Purchase Credits
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-4 font-medium transition-colors ${
                            activeTab === "history"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Payment History
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === "history" ? (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment History</h2>
                            {paymentHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No payment history found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                                    Credits
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                                    Amount
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                                    Transaction ID
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paymentHistory.map((payment) => (
                                                <tr
                                                    key={payment.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-900">
                                                                {payment.created_at
                                                                    ? new Date(payment.created_at).toLocaleDateString()
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-gray-900 font-semibold">
                                                            {payment.credits}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-900 font-semibold">
                                                                ₹{payment.amount}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${
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
                                                    <td className="py-4 px-4">
                                                        <span className="text-gray-600 font-mono text-sm">
                                                            {payment.razorpay_order_id || "N/A"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Purchase Credits</h2>
                            {!razorpayLoaded && (
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    <p className="text-yellow-700 text-sm">Loading payment gateway...</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {CREDIT_PACKAGES.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`border rounded-lg p-6 relative ${
                                            plan.popular
                                                ? "border-blue-500 shadow-lg scale-105"
                                                : "border-gray-200 hover:shadow-md"
                                        }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                                            </div>
                                            <p className="text-gray-600 mt-2">{plan.credits.toLocaleString()} Credits</p>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">
                                                    {plan.credits.toLocaleString()} Credits
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">Instant credit addition</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">Secure payment via Razorpay</span>
                                            </li>
                                        </ul>
                                        <button
                                            onClick={() => handlePurchaseCredits(plan)}
                                            disabled={processingPayment || !razorpayLoaded}
                                            className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                                plan.popular
                                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {processingPayment ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                "Purchase Credits"
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
