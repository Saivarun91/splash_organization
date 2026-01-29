"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, X, Calendar, DollarSign, Loader2, AlertCircle, Eye } from "lucide-react";
import { paymentAPI, plansAPI, organizationAPI } from "@/lib/api";
import { InvoiceView } from "@/components/InvoiceView";
import { Button } from "@/components/ui/button";

export default function PaymentsPage() {
    const [activeTab, setActiveTab] = useState("plans");
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [organizationId, setOrganizationId] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedCredits, setSelectedCredits] = useState({}); // Track selected credits for each Pro plan

    useEffect(() => {
        const orgId = localStorage.getItem("org_organization_id");
        if (orgId) {
            setOrganizationId(orgId);
            fetchPaymentHistory(orgId);
            fetchOrganizationPlan(orgId);
        }

        // Fetch plans from API
        fetchPlans();

        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);

        return () => {
            const scriptElement = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (scriptElement) {
                document.body.removeChild(scriptElement);
            }
        };
    }, []);

    const fetchPlans = async () => {
        setPlansLoading(true);
        try {
            const response = await plansAPI.getAll(true); // Fetch only active plans
            if (response.success && response.plans) {
                setPlans(response.plans);
            } else if (response.plans) {
                // Handle case where response might not have success field
                setPlans(Array.isArray(response.plans) ? response.plans : []);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
            setPlans([]);
        } finally {
            setPlansLoading(false);
        }
    };

    const fetchOrganizationPlan = async (orgId) => {
        try {
            const orgData = await organizationAPI.getOrganization(orgId);
            if (orgData && orgData.plan) {
                const planId = typeof orgData.plan === 'object' ? orgData.plan.id : orgData.plan;
                if (planId) {
                    const planResponse = await plansAPI.getById(planId);
                    if (planResponse.success && planResponse.plan) {
                        setCurrentPlan(planResponse.plan);
                    } else if (planResponse.plan) {
                        setCurrentPlan(planResponse.plan);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching organization plan:", error);
        }
    };

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

    const handlePurchasePlan = async (plan) => {
        if (!organizationId || !razorpayLoaded) {
            alert("Please wait for payment gateway to load");
            return;
        }

        setProcessingPayment(true);
        try {
            // Create Razorpay order with plan information
            const orderData = await paymentAPI.createRazorpayOrder(
                organizationId,
                plan.price,
                plan.credits_per_month || 0,
                plan.id
            );

            if (!orderData.success) {
                throw new Error(orderData.error || "Failed to create order");
            }

            const options = {
                key: orderData.key_id,
                amount: orderData.amount * 100, // Convert to paise
                currency: "INR",
                name: "Splash AI Studio",
                description: `Subscribe to ${plan.name} plan`,
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
                            const creditsAdded = plan.credits_per_month || 0;
                            alert(`Payment successful! ${plan.name} plan activated. ${creditsAdded} credits added to your account.`);
                            // Refresh payment history and organization data
                            fetchPaymentHistory(organizationId);
                            fetchOrganizationPlan(organizationId);
                            // Refresh plans to show updated status
                            fetchPlans();
                            // Reload page to show updated plan
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
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
        <div className="space-y-6 animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Payments and Subscriptions</h1>
                <p className="text-muted-foreground">Manage your payments and purchase credits</p>
            </div>

            <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border mb-6">
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab("plans")}
                        className={`px-6 py-4 font-medium transition-colors ${
                            activeTab === "plans"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Purchase Credits
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-4 font-medium transition-colors ${
                            activeTab === "history"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Payment History
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === "history" ? (
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-6">Payment History</h2>
                            {paymentHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No payment history found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-center py-3 px-4 font-semibold text-gray-900">{t("orgPortal.date")}</th>
                                                <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                                    {t("orgPortal.planType")}
                                                </th>
                                                <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                                    {t("orgPortal.credits")}
                                                </th>
                                                <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                                    {t("orgPortal.amount")}
                                                </th>
                                                <th className="text-left  py-3 px-10 font-semibold text-gray-900">{t("orgPortal.status")}</th>
                                                <th className="text-center py-3 px-4 font-semibold text-gray-900">
                                                    {t("orgPortal.transactionId")}
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
                                                        <div className="flex items-center gap-2">
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
                                                            {payment.plan_name || t("orgPortal.creditPurchase")}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <span className="text-foreground font-semibold">
                                                            {payment.credits?.toLocaleString() || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-foreground font-semibold">
                                                                {payment.amount}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit text-center ${
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
                                                            }) }
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
                    ) : (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Plans & Subscriptions</h2>
                            
                            {currentPlan && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-700 font-medium">Current Plan</p>
                                            <p className="text-lg font-bold text-blue-900">{currentPlan.name}</p>
                                            <p className="text-sm text-blue-600">
                                                {currentPlan.credits_per_month?.toLocaleString() || 0} credits/month • 
                                                {(currentPlan.currency === 'INR' ? '₹' : '$')}{currentPlan.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{currentPlan.billing_cycle === 'yearly' ? 'year' : 'month'}
                                            </p>
                                        </div>  
                                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!razorpayLoaded && (
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    <p className="text-yellow-700 text-sm">Loading payment gateway...</p>
                                </div>
                            )}

                            {plansLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    <span className="ml-3 text-gray-600">Loading plans...</span>
                                </div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No plans available at the moment</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {plans.map((plan) => {
                                        const isCurrentPlan = currentPlan && currentPlan.id === plan.id;
                                        const originalPrice = plan.original_price || plan.price;
                                        const hasDiscount = originalPrice > plan.price;
                                        
                                        return (
                                            <div
                                                key={plan.id}
                                                className={`border rounded-lg p-6 relative ${
                                                    plan.is_popular
                                                        ? "border-blue-500 shadow-lg scale-105"
                                                        : isCurrentPlan
                                                        ? "border-green-500 shadow-md"
                                                        : "border-gray-200 hover:shadow-md"
                                                }`}
                                            >
                                                {plan.is_popular && (
                                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                                            Most Popular
                                                        </span>
                                                    </div>
                                                )}
                                                {isCurrentPlan && (
                                                    <div className="absolute top-4 right-4">
                                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                                            Current
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="text-center mb-6">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                                    <div className="flex items-baseline justify-center gap-2">
                                                        {hasDiscount && (
                                                            <span className="text-lg text-gray-500 line-through">
                                                                {(plan.currency === 'INR' ? '₹' : '$')}{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        )}
                                                        <span className="text-4xl font-bold text-gray-900">
                                                            {(plan.currency === 'INR' ? '₹' : '$')}{plan.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                        <span className="text-gray-600">
                                                            /{plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                                                        </span>
                                                    </div>
                                                    {plan.description && (
                                                        <p className="text-gray-600 mt-2 text-sm">{plan.description}</p>
                                                    )}
                                                    <p className="text-gray-700 mt-2 font-semibold">
                                                        {plan.credits_per_month?.toLocaleString() || 0} Credits/month
                                                    </p>
                                                </div>
                                                {plan.features && plan.features.length > 0 && (
                                                    <ul className="space-y-3 mb-6">
                                                        {plan.features.map((feature, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                                <span className="text-gray-700">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {/* <div className="space-y-2 mb-6">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Check className="w-4 h-4 text-green-500" />
                                                        <span>Up to {plan.max_projects || 'Unlimited'} projects</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Check className="w-4 h-4 text-green-500" />
                                                        <span>AI features {plan.ai_features_enabled ? 'enabled' : 'disabled'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Check className="w-4 h-4 text-green-500" />
                                                        <span>Secure payment via Razorpay</span>
                                                    </div>
                                                </div> */}
                                                <button
                                                    onClick={() => handlePurchasePlan(plan)}
                                                    disabled={processingPayment || !razorpayLoaded || isCurrentPlan}
                                                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                                        isCurrentPlan
                                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                            : plan.is_popular
                                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {processingPayment ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : isCurrentPlan ? (
                                                        "Current Plan"
                                                    ) : (
                                                        `Subscribe to ${plan.name}`
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
