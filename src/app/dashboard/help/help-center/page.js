"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, Book, Zap, CreditCard, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HelpCenterPage() {
    const { t } = useLanguage();
    const categories = [
        {
            icon: Zap,
            title: t("orgPortal.gettingStarted") || "Getting Started",
            description: t("orgPortal.learnBasicsAndSetup") || "Learn the basics and setup your account",
            articles: 12,
        },
        {
            icon: Book,
            title: t("orgPortal.imageGeneration") || "Image Generation",
            description: t("orgPortal.masterAllTypes") || "Master all image generation workflows",
            articles: 18,
        },
        {
            icon: CreditCard,
            title: t("orgPortal.billingCredits") || "Billing & Credits",
            description: t("orgPortal.manageSubscriptionAndCredits") || "Manage subscription and credit purchases",
            articles: 8,
        },
        {
            icon: Shield,
            title: t("orgPortal.accountSecurity") || "Account Security",
            description: t("orgPortal.keepAccountSafe") || "Keep your organization and account safe",
            articles: 10,
        },
    ];

    const faqs = [
        {
            question: t("orgPortal.faq1Question") || "How do I invite members to my organization?",
            answer: t("orgPortal.faq1Answer") || "You can invite members by navigating to the Users tab, clicking 'Add User', and entering their email address. They will receive an email invitation to join.",
        },
        {
            question: t("orgPortal.faq2Question") || "What are generation credits?",
            answer: t("orgPortal.faq2Answer") || "Credits are consumed whenever you generate images. The cost varies by model and options. Check the credits tab to view usage breakdown.",
        },
        {
            question: t("orgPortal.faq3Question") || "How does billing work?",
            answer: t("orgPortal.faq3Answer") || "Subscriptions are billed monthly. Credit purchases are processed instantly. You can manage cards and view past invoices under Settings > Payments.",
        },
        {
            question: t("orgPortal.faq4Question") || "Can I limit member credit usage?",
            answer: t("orgPortal.faq4Answer") || "Yes, organization owners can define quotas or allocate specific credit balances for each team member via the Users page.",
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in p-8 text-foreground bg-transparent">
            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    {t("orgPortal.howCanWeHelp") || "How can we help you?"}
                </h1>
                <p className="text-muted-foreground mb-6">
                    {t("orgPortal.searchKnowledgeBase") || "Search our knowledge base for answers, tutorials, and support details."}
                </p>
                <div className="relative max-w-lg mx-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder={t("orgPortal.searchArticlesGuides") || "Search articles, guides..."}
                        className="pl-12 h-12 text-base bg-card border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent rounded-xl"
                    />
                </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category, idx) => (
                    <Card
                        key={idx}
                        className="bg-card border border-border shadow-md rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-gold-muted cursor-pointer group"
                    >
                        <CardContent className="p-6 text-left">
                            <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center mb-4 shadow-md">
                                <category.icon className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-gold-solid transition-colors">
                                {category.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {category.description}
                            </p>
                            <p className="text-xs text-gold-solid font-semibold">
                                {category.articles} {t("orgPortal.articles") || "articles"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* FAQ Section */}
            <Card className="bg-card border border-border shadow-md rounded-xl">
                <CardHeader>
                    <CardTitle className="text-foreground">{t("orgPortal.frequentlyAskedQuestions") || "Frequently Asked Questions"}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {t("orgPortal.quickAnswersToCommonQuestions") || "Quick answers to questions you might have about Splash AI."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`pb-6 ${idx !== faqs.length - 1 ? "border-b border-border" : ""}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gold-solid/10 flex items-center justify-center mt-1">
                                    <HelpCircle className="w-5 h-5 text-gold-solid" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-foreground text-lg mb-2">
                                        {faq.question}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="bg-card/40 border border-gold-muted shadow-md rounded-xl bg-gradient-to-br from-gold-solid/5 to-transparent">
                <CardContent className="p-8 text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                        {t("orgPortal.stillNeedHelp") || "Still need help?"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {t("orgPortal.supportTeamHere") || "Our support team is here to help you solve any issues or questions."}
                    </p>
                    <Button className="bg-gold-gradient text-primary-foreground font-semibold hover:brightness-110 px-6 py-2.5 rounded-lg shadow-md border-0 transition-all">
                        {t("orgPortal.contactSupport") || "Contact Support"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
