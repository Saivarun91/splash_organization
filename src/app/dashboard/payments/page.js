"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, X, Calendar, DollarSign, Loader2, AlertCircle, Eye } from "lucide-react";
import { paymentAPI, plansAPI, organizationAPI, invoiceAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ContactSalesModal } from "@/components/ContactSalesModal";

export default function PaymentsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState(null);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [selectedCredits, setSelectedCredits] = useState({}); // Track selected credits for each Pro plan
    const [selectedCreditOption, setSelectedCreditOption] = useState(0); // Selected credit option index for Pro plan
    const [invoiceConfig, setInvoiceConfig] = useState({ tax_rate: 18 });
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [showContactSalesModal, setShowContactSalesModal] = useState(false);
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
            let allPlans = [];
            if (response.success && response.plans) {
                allPlans = response.plans;
            } else if (response.plans) {
                allPlans = Array.isArray(response.plans) ? response.plans : [];
            }
            // Filter to only Pro and Enterprise plans, Pro first
            const proPlan = allPlans.find((p) => (p.name || "").toLowerCase() === "pro");
            const enterprisePlan = allPlans.find((p) => (p.name || "").toLowerCase() === "enterprise");
            const filteredPlans = [];
            if (proPlan) filteredPlans.push(proPlan);
            if (enterprisePlan) filteredPlans.push(enterprisePlan);
            setPlans(filteredPlans);
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
            // For Pro plan, use selected credit option; for Enterprise, use plan price (0 or custom)
            let baseAmount = plan.price;
            let creditsToAdd = plan.credits_per_month || 0;
            
            // If Pro plan, get amount and credits from selected credit option
            if ((plan.name || "").toLowerCase() === "pro") {
                const creditOptions = plan.credit_options || plan.custom_settings?.credit_options || [];
                const selectedOption = creditOptions[selectedCreditOption] || creditOptions[0];
                if (selectedOption) {
                    baseAmount = selectedOption.amount || plan.price;
                    creditsToAdd = selectedOption.credits || 0;
                }
            }

            const taxRate = invoiceConfig?.tax_rate || 18;
            const taxAmount = (baseAmount * taxRate) / 100;
            const totalAmount = baseAmount + taxAmount;

            // Create Razorpay order with plan + billing information
            const orderData = await paymentAPI.createRazorpayOrder(
                organizationId,
                baseAmount,
                creditsToAdd,
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
                            // For Pro plan, use credits from selected option
                            let creditsAdded = plan.credits_per_month || 0;
                            if ((plan.name || "").toLowerCase() === "pro") {
                                const creditOptions = plan.credit_options || plan.custom_settings?.credit_options || [];
                                const selectedOption = creditOptions[selectedCreditOption] || creditOptions[0];
                                creditsAdded = selectedOption?.credits || creditsAdded;
                            }
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
                    color: "#cd9639",
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
        <div className="space-y-6">
            <div className="relative p-4 rounded-xl bg-card shadow-md border border-border overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-tr from-gold-solid/20 to-gold-muted/10 opacity-10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-foreground mb-1">{t("orgPortal.paymentsAndSubscriptions") || "Subscription & Billing"}</h1>
                    <p className="text-sm text-muted-foreground">{t("orgPortal.managePaymentsAndPurchaseCredits") || "Purchase credits and manage your subscription"}</p>
                </div>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-sm border border-border mb-6 text-foreground">
                <div className="p-6">
                    <div>
                            <h2 className="text-xl font-semibold text-foreground mb-6">{t("orgPortal.paymentsAndSubscriptions")}</h2>
                            
                            {currentPlan && (
                                <div className="mb-6 p-4 bg-gold-solid/10 border border-gold-muted rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gold-solid font-medium">{t("orgPortal.currentPlan")}</p>
                                            <p className="text-lg font-bold text-gold-solid">{currentPlan.name}</p>
                                            <p className="text-sm text-gold-solid/80">
                                                {currentPlan.credits_per_month?.toLocaleString() || 0} {t("orgPortal.creditsPerMonth")} • 
                                                {(currentPlan.currency === 'INR' ? '₹' : '$')}{currentPlan.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{currentPlan.billing_cycle === 'yearly' ? t("orgPortal.year") : t("orgPortal.month")}
                                            </p>
                                        </div>  
                                        <span className="px-3 py-1 bg-gold-gradient text-primary-foreground rounded-full text-sm font-semibold shadow-md">
                                            {t("orgPortal.active")}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!razorpayLoaded && (
                                <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                    <p className="text-amber-400 text-sm">{t("orgPortal.loadingPaymentGateway")}</p>
                                </div>
                            )}

                            {plansLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-gold-solid" />
                                    <span className="ml-3 text-muted-foreground">{t("orgPortal.loadingPlans")}</span>
                                </div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-12">
                                    <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">{t("orgPortal.noPlansAvailable")}</p>
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
                                        {plans.map((plan) => {
                                            const isCurrentPlan = currentPlan && currentPlan.id === plan.id;
                                            const isPro = (plan.name || "").toLowerCase() === "pro";
                                            const isEnterprise = (plan.name || "").toLowerCase() === "enterprise";
                                            
                                            // Get credit options for Pro plan
                                            const creditOptions = isPro 
                                                ? (plan.credit_options || plan.custom_settings?.credit_options || [])
                                                : [];
                                            const selectedOption = creditOptions[selectedCreditOption] || creditOptions[0];
                                            
                                            // Amount display: Pro uses selected option, Enterprise uses custom display
                                            let displayAmount = plan.price;
                                            let amountLabel = "";
                                            if (isPro && selectedOption) {
                                                displayAmount = selectedOption.amount || plan.price;
                                                amountLabel = "one-time";
                                            } else if (isEnterprise) {
                                                const amountDisplay = plan.custom_settings?.amount_display || plan.amount_display || "As you go";
                                                displayAmount = null; // Will show text instead
                                                amountLabel = amountDisplay;
                                            } else {
                                                amountLabel = `/${plan.billing_cycle === 'yearly' ? 'year' : 'month'}`;
                                            }
                                            
                                            const ctaText = plan.custom_settings?.cta_text || plan.cta_text || (isPro ? "Pay" : "Contact Sales");
                                            
                                            return (
                                                <div
                                                    key={plan.id}
                                                    className={`border-2 rounded-xl p-6 relative flex flex-col justify-between ${
                                                        isPro
                                                            ? "border-gold-solid/30 bg-card shadow-lg ring-1 ring-gold-muted/20"
                                                            : isEnterprise
                                                            ? "border-border bg-card shadow-lg"
                                                            : isCurrentPlan
                                                            ? "border-emerald-500 shadow-md bg-card"
                                                            : "border-border bg-card hover:shadow-md"
                                                    }`}
                                                >
                                                    <div>
                                                        {isCurrentPlan && (
                                                            <div className="absolute top-4 right-4">
                                                                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                                    {t("orgPortal.current")}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="text-center mb-6">
                                                            <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                                                            {plan.description && (
                                                                <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
                                                            )}
                                                            <div className="mt-4">
                                                                {displayAmount !== null ? (
                                                                    <div className="flex items-baseline justify-center gap-2">
                                                                        <span className="text-4xl font-bold text-foreground">
                                                                            {(plan.currency === 'INR' ? '₹' : '$')}{displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </span>
                                                                        {amountLabel && (
                                                                            <span className="text-muted-foreground">{amountLabel}</span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-3xl font-bold text-foreground">{amountLabel}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Credit options dropdown for Pro plan */}
                                                        {isPro && creditOptions.length > 0 && (
                                                            <div className="mb-6">
                                                                <label className="block text-sm font-medium text-foreground mb-2">
                                                                    Choose credits
                                                                </label>
                                                                <select
                                                                    value={selectedCreditOption}
                                                                    onChange={(e) => setSelectedCreditOption(Number(e.target.value))}
                                                                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                                                                >
                                                                    {creditOptions.map((opt, index) => (
                                                                        <option key={index} value={index} className="bg-card text-foreground">
                                                                            ${opt.amount} – {opt.credits} credits
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                        
                                                        {plan.features && plan.features.length > 0 && (
                                                            <ul className="space-y-3 mb-6">
                                                                {plan.features.map((feature, index) => (
                                                                    <li key={index} className="flex items-start gap-2">
                                                                        <Check className="w-5 h-5 text-gold-solid flex-shrink-0 mt-0.5" />
                                                                        <span className="text-muted-foreground">{feature}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                    
                                                    {isEnterprise ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowContactSalesModal(true)}
                                                            disabled={isCurrentPlan}
                                                            className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border border-border text-foreground hover:bg-accent ${
                                                                isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""
                                                            }`}
                                                        >
                                                            {ctaText}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePurchasePlan(plan)}
                                                            disabled={processingPayment || !razorpayLoaded || isCurrentPlan}
                                                            className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                                                                isCurrentPlan
                                                                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                                                                    : isPro
                                                                    ? "bg-gold-gradient text-primary-foreground hover:brightness-110 shadow-lg"
                                                                    : "bg-secondary text-foreground hover:bg-accent"
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
                                                                ctaText
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                </div>
            </div>
            
            {/* Billing Details Modal */}
            {showBillingModal && selectedPlan && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 text-foreground animate-scale-in">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                                {t("orgPortal.billingDetails") || "Billing Details"}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowBillingModal(false);
                                    setProcessingPayment(false);
                                }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {t("orgPortal.enterBillingDetails") || "Please enter billing details required for GST invoice."}
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-foreground">
                                    {t("orgPortal.billingName") || "Billing Name *"}
                                </label>
                                <input
                                    type="text"
                                    value={billingDetails.billing_name}
                                    onChange={(e) =>
                                        setBillingDetails((prev) => ({ ...prev, billing_name: e.target.value }))
                                    }
                                    className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground">
                                    {t("orgPortal.billingAddress") || "Billing Address *"}
                                </label>
                                <textarea
                                    rows={2}
                                    value={billingDetails.billing_address}
                                    onChange={(e) =>
                                        setBillingDetails((prev) => ({ ...prev, billing_address: e.target.value }))
                                    }
                                    className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-foreground">
                                        {t("orgPortal.phoneNumber") || "Phone Number *"}
                                    </label>
                                    <input
                                        type="text"
                                        value={billingDetails.billing_phone || ""}
                                        onChange={(e) =>
                                            setBillingDetails((prev) => ({ ...prev, billing_phone: e.target.value }))
                                        }
                                        className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground">
                                        {t("orgPortal.gstNumber") || "GST Number (optional)"}
                                    </label>
                                    <input
                                        type="text"
                                        value={billingDetails.billing_gst_number || ""}
                                        onChange={(e) =>
                                            setBillingDetails((prev) => ({
                                                ...prev,
                                                billing_gst_number: e.target.value,
                                            }))
                                        }
                                        className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <span className="block text-sm font-medium text-foreground mb-1">
                                    {t("orgPortal.billingType") || "Billing Type"}
                                </span>
                                <div className="flex gap-4 text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer text-foreground">
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
                                            className="accent-gold-solid cursor-pointer"
                                        />
                                        <span>{t("orgPortal.individual") || "Individual"}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-foreground">
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
                                            className="accent-gold-solid cursor-pointer"
                                        />
                                        <span>{t("orgPortal.business") || "Business"}</span>
                                    </label>
                                </div>
                            </div>

                            {/* GST Summary */}
                            <div className="mt-2 rounded-md bg-background border border-border p-3 text-sm text-foreground">
                                <p className="font-semibold text-foreground mb-1">
                                    {t("orgPortal.orderSummary") || "Order Summary"}
                                </p>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{t("orgPortal.planAmount") || "Plan amount"}</span>
                                    <span>
                                        ₹{(() => {
                                            // For Pro plan, use selected credit option amount
                                            if ((selectedPlan.name || "").toLowerCase() === "pro") {
                                                const creditOptions = selectedPlan.credit_options || selectedPlan.custom_settings?.credit_options || [];
                                                const selectedOption = creditOptions[selectedCreditOption] || creditOptions[0];
                                                return (selectedOption?.amount || selectedPlan.price).toFixed(2);
                                            }
                                            return selectedPlan.price.toFixed(2);
                                        })()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground mt-1">
                                    <span>
                                        {t("orgPortal.gst") || "GST"} ({invoiceConfig?.tax_rate ?? 18}%)
                                    </span>
                                    <span>
                                        ₹{(() => {
                                            let baseAmount = selectedPlan.price;
                                            if ((selectedPlan.name || "").toLowerCase() === "pro") {
                                                const creditOptions = selectedPlan.credit_options || selectedPlan.custom_settings?.credit_options || [];
                                                const selectedOption = creditOptions[selectedCreditOption] || creditOptions[0];
                                                baseAmount = selectedOption?.amount || selectedPlan.price;
                                            }
                                            return (baseAmount * (invoiceConfig?.tax_rate ?? 18) / 100).toFixed(2);
                                        })()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-foreground font-bold mt-2 border-t border-border pt-2">
                                    <span>{t("orgPortal.totalPayable") || "Total payable"}</span>
                                    <span>
                                        ₹
                                        {(() => {
                                            let baseAmount = selectedPlan.price;
                                            if ((selectedPlan.name || "").toLowerCase() === "pro") {
                                                const creditOptions = selectedPlan.credit_options || selectedPlan.custom_settings?.credit_options || [];
                                                const selectedOption = creditOptions[selectedCreditOption] || creditOptions[0];
                                                baseAmount = selectedOption?.amount || selectedPlan.price;
                                            }
                                            const taxAmount = baseAmount * (invoiceConfig?.tax_rate ?? 18) / 100;
                                            return (baseAmount + taxAmount).toFixed(2);
                                        })()}
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
                                className="bg-gold-gradient text-primary-foreground font-semibold hover:brightness-110 shadow-lg"
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

            <ContactSalesModal open={showContactSalesModal} onOpenChange={setShowContactSalesModal} />
        </div>
    );
}
