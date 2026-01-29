"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, X, Calendar, DollarSign, Loader2, AlertCircle, Eye } from "lucide-react";
import { paymentAPI, plansAPI, organizationAPI, invoiceAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { InvoiceView } from "@/components/InvoiceView";
import { Button } from "@/components/ui/button";

export default function PaymentsPage() {
    const { t } = useLanguage();
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
    const [invoiceConfig, setInvoiceConfig] = useState({ tax_rate: 18 });
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingDetails, setBillingDetails] = useState({
        billing_name: "",
        billing_address: "",
        billing_phone: "",
        billing_gst_number: "",
        billing_type: "individual",
    });

    useEffect(() => {
        const orgId = localStorage.getItem("org_organization_id");
        if (orgId) {
            setOrganizationId(orgId);
            fetchPaymentHistory(orgId);
            fetchOrganizationPlan(orgId);
        }

        // Fetch plans from API
        fetchPlans();
        // Fetch invoice / GST configuration
        fetchInvoiceConfig();

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

    const fetchInvoiceConfig = async () => {
        try {
            const config = await invoiceAPI.getConfig();
            if (config && typeof config.tax_rate !== "undefined") {
                setInvoiceConfig(config);
            }
        } catch (error) {
            console.warn("Failed to fetch invoice config, using default GST:", error);
        }
    };

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
            alert(t("orgPortal.pleaseWaitPaymentGateway"));
            return;
        }

        // Open billing details modal first
        setSelectedPlan(plan);
        setShowBillingModal(true);
    };

    const startPaymentWithBilling = async () => {
        if (!organizationId || !razorpayLoaded || !selectedPlan) {
            return;
        }

        const plan = selectedPlan;

        setProcessingPayment(true);
        try {
            // Base amount (before GST)
            const baseAmount = plan.price;
            const taxRate = invoiceConfig?.tax_rate || 18;
            const taxAmount = (baseAmount * taxRate) / 100;
            const totalAmount = baseAmount + taxAmount;

            // Create Razorpay order with plan + billing information
            const orderData = await paymentAPI.createRazorpayOrder(
                organizationId,
                baseAmount,
                plan.credits_per_month || 0,
                plan.id,
                {
                    billing_name: billingDetails.billing_name,
                    billing_address: billingDetails.billing_address,
                    billing_phone: billingDetails.billing_phone,
                    billing_gst_number: billingDetails.billing_gst_number,
                    billing_type: billingDetails.billing_type,
                }
            );

            if (!orderData.success) {
                throw new Error(orderData.error || "Failed to create order");
            }

            const options = {
                key: orderData.key_id,
                // Backend already includes GST in Razorpay order amount,
                // so use total_amount (if provided) for user display.
                amount: (orderData.total_amount || totalAmount) * 100,
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
                            alert(`${t("orgPortal.paymentSuccess")} ${plan.name} ${t("orgPortal.planActivated")}. ${creditsAdded} ${t("orgPortal.creditsAddedToAccount")}.`);
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
                            alert(t("orgPortal.paymentVerificationFailed") + ": " + (verifyData.error || t("orgPortal.unknownError")));
                        }
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        alert(t("orgPortal.paymentVerificationFailedContactSupport"));
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
            alert(t("orgPortal.failedToInitiatePayment") + ": " + (error.message || t("orgPortal.unknownError")));
            setProcessingPayment(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("orgPortal.paymentsAndSubscriptions")}</h1>
                <p className="text-gray-600">{t("orgPortal.managePaymentsAndPurchaseCredits")}</p>
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
                        {t("orgPortal.purchaseCredits")}
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-4 font-medium transition-colors ${
                            activeTab === "history"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {t("orgPortal.paymentHistory")}
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === "history" ? (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t("orgPortal.paymentHistory")}</h2>
                            {paymentHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">{t("orgPortal.noPaymentHistoryFound")}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">{t("orgPortal.date")}</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                                    {t("orgPortal.planType")}
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                                    {t("orgPortal.credits")}
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                                    {t("orgPortal.amount")}
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">{t("orgPortal.status")}</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                                    {t("orgPortal.transactionId")}
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold text-foreground">
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
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-foreground">
                                                                {payment.created_at
                                                                    ? new Date(payment.created_at).toLocaleDateString()
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-gray-900 font-medium">
                                                            {payment.plan_name || t("orgPortal.creditPurchase")}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="text-foreground font-semibold">
                                                            {payment.credits?.toLocaleString() || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-foreground font-semibold">
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
                                                        <span className="text-muted-foreground font-mono text-sm">
                                                            {payment.razorpay_order_id || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <Button
                                                            onClick={() => setSelectedInvoice({
                                                                transactionId: payment.razorpay_order_id || payment.id,
                                                                paymentData: payment
                                                            })}
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex items-center gap-2"
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
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t("orgPortal.plansAndSubscriptions")}</h2>
                            
                            {currentPlan && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-700 font-medium">{t("orgPortal.currentPlan")}</p>
                                            <p className="text-lg font-bold text-blue-900">{currentPlan.name}</p>
                                            <p className="text-sm text-blue-600">
                                                {currentPlan.credits_per_month?.toLocaleString() || 0} {t("orgPortal.creditsPerMonth")} • 
                                                {(currentPlan.currency === 'INR' ? '₹' : '$')}{currentPlan.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{currentPlan.billing_cycle === 'yearly' ? t("orgPortal.year") : t("orgPortal.month")}
                                            </p>
                                        </div>  
                                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                                            {t("orgPortal.active")}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!razorpayLoaded && (
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    <p className="text-yellow-700 text-sm">{t("orgPortal.loadingPaymentGateway")}</p>
                                </div>
                            )}

                            {plansLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    <span className="ml-3 text-gray-600">{t("orgPortal.loadingPlans")}</span>
                                </div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">{t("orgPortal.noPlansAvailable")}</p>
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
                                                            {t("orgPortal.mostPopular")}
                                                        </span>
                                                    </div>
                                                )}
                                                {isCurrentPlan && (
                                                    <div className="absolute top-4 right-4">
                                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                                            {t("orgPortal.current")}
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
                                                        {plan.credits_per_month?.toLocaleString() || 0} {t("orgPortal.creditsPerMonth")}
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
                                                            {t("orgPortal.processing")}
                                                        </>
                                                    ) : isCurrentPlan ? (
                                                        t("orgPortal.currentPlan")
                                                    ) : (
                                                        `${t("orgPortal.subscribeTo")} ${plan.name}`
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
            
            {/* Billing Details Modal */}
            {showBillingModal && selectedPlan && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {t("orgPortal.billingDetails") || "Billing Details"}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowBillingModal(false);
                                    setProcessingPayment(false);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600">
                            {t("orgPortal.enterBillingDetails") || "Please enter billing details required for GST invoice."}
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("orgPortal.billingName") || "Billing Name"}
                                </label>
                                <input
                                    type="text"
                                    value={billingDetails.billing_name}
                                    onChange={(e) =>
                                        setBillingDetails((prev) => ({ ...prev, billing_name: e.target.value }))
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t("orgPortal.billingAddress") || "Billing Address"}
                                </label>
                                <textarea
                                    rows={2}
                                    value={billingDetails.billing_address}
                                    onChange={(e) =>
                                        setBillingDetails((prev) => ({ ...prev, billing_address: e.target.value }))
                                    }
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t("orgPortal.phoneNumber") || "Phone Number"}
                                    </label>
                                    <input
                                        type="text"
                                        value={billingDetails.billing_phone}
                                        onChange={(e) =>
                                            setBillingDetails((prev) => ({ ...prev, billing_phone: e.target.value }))
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t("orgPortal.gstNumber") || "GST Number (optional)"}
                                    </label>
                                    <input
                                        type="text"
                                        value={billingDetails.billing_gst_number}
                                        onChange={(e) =>
                                            setBillingDetails((prev) => ({
                                                ...prev,
                                                billing_gst_number: e.target.value,
                                            }))
                                        }
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <span className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("orgPortal.billingType") || "Billing Type"}
                                </span>
                                <div className="flex gap-4 text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="billing_type"
                                            value="individual"
                                            checked={billingDetails.billing_type === "individual"}
                                            onChange={(e) =>
                                                setBillingDetails((prev) => ({
                                                    ...prev,
                                                    billing_type: e.target.value,
                                                }))
                                            }
                                        />
                                        <span>{t("orgPortal.individual") || "Individual"}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="billing_type"
                                            value="business"
                                            checked={billingDetails.billing_type === "business"}
                                            onChange={(e) =>
                                                setBillingDetails((prev) => ({
                                                    ...prev,
                                                    billing_type: e.target.value,
                                                }))
                                            }
                                        />
                                        <span>{t("orgPortal.business") || "Business"}</span>
                                    </label>
                                </div>
                            </div>

                            {/* GST Summary */}
                            <div className="mt-2 rounded-md bg-gray-50 border border-gray-200 p-3 text-sm">
                                <p className="font-semibold text-gray-800 mb-1">
                                    {t("orgPortal.orderSummary") || "Order Summary"}
                                </p>
                                <div className="flex justify-between text-gray-700">
                                    <span>{t("orgPortal.planAmount") || "Plan amount"}</span>
                                    <span>
                                        ₹{selectedPlan.price.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-700 mt-1">
                                    <span>
                                        {t("orgPortal.gst") || "GST"} ({invoiceConfig?.tax_rate ?? 18}%)
                                    </span>
                                    <span>
                                        ₹{(selectedPlan.price * (invoiceConfig?.tax_rate ?? 18) / 100).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-900 font-semibold mt-2 border-t border-gray-200 pt-2">
                                    <span>{t("orgPortal.totalPayable") || "Total payable"}</span>
                                    <span>
                                        ₹
                                        {(
                                            selectedPlan.price +
                                            selectedPlan.price * (invoiceConfig?.tax_rate ?? 18) / 100
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowBillingModal(false);
                                    setProcessingPayment(false);
                                }}
                            >
                                {t("common.cancel") || "Cancel"}
                            </Button>
                            <Button
                                onClick={startPaymentWithBilling}
                                disabled={processingPayment}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {processingPayment ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t("orgPortal.processing") || "Processing..."}
                                    </>
                                ) : (
                                    t("orgPortal.proceedToPay") || "Proceed to pay"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
