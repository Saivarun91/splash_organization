"use client";

import { useState } from "react";
import { MessageSquare, Lightbulb, Bug, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/context/LanguageContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function FeedbackPage() {
    const { t } = useLanguage();
    const [feedbackType, setFeedbackType] = useState("feature-requests");

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(t("orgPortal.thankYouFeedback") || "Thank you for your feedback!");
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8 text-foreground">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gold-from to-gold-to bg-clip-text text-transparent">
                    {t("orgPortal.feedbackFeatureRequests") || "Feedback & Feature Requests"}
                </h1>
                <p className="text-muted-foreground">{t("orgPortal.helpImprove") || "Help us improve by sharing your thoughts or reporting issues."}</p>
            </div>

            {/* Feedback Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        icon: Lightbulb,
                        title: t("orgPortal.featureRequests") || "Feature Requests",
                        description: t("orgPortal.suggestNewFeatures") || "Suggest new features",
                        color: "from-amber-500 to-yellow-400",
                        value: "feature-requests",
                    },
                    {
                        icon: Bug,
                        title: t("orgPortal.bugReports") || "Bug Reports",
                        description: t("orgPortal.reportIssues") || "Report technical issues",
                        color: "from-red-500 to-red-400",
                        value: "bug-reports",
                    },
                    {
                        icon: Sparkles,
                        title: t("orgPortal.generalFeedback") || "General Feedback",
                        description: t("orgPortal.shareThoughts") || "Share your experience",
                        color: "from-gold-from to-gold-to",
                        value: "general-feedback",
                    },
                ].map((type, idx) => {
                    const isActive = feedbackType === type.value;
                    return (
                        <div
                            key={idx}
                            onClick={() => setFeedbackType(type.value)}
                            className={`cursor-pointer border rounded-xl p-6 text-center transition-all duration-300 shadow-md hover:-translate-y-1 ${
                                isActive
                                    ? "border-gold-solid ring-1 ring-gold-solid/35 bg-card"
                                    : "bg-card border-border"
                            }`}
                        >
                            <div
                                className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-r ${type.color} text-white`}
                            >
                                <type.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-1 text-foreground">{type.title}</h3>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                    );
                })}
            </div>

            {/* Feedback Form */}
            <div className="bg-card rounded-xl shadow-lg border border-border">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">{t("orgPortal.submitFeedback") || "Submit Feedback"}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("orgPortal.weReadEverySubmission") || "We read every single submission and prioritize changes based on user input."}
                    </p>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Feedback Type */}
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-foreground">{t("orgPortal.feedbackType") || "Feedback Type"}</Label>
                            <Select value={feedbackType} onValueChange={setFeedbackType}>
                                <SelectTrigger id="type" className="bg-background border-border text-foreground focus:ring-2 focus:ring-gold-solid/40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="feature-requests">{t("orgPortal.featureRequests") || "Feature Requests"}</SelectItem>
                                    <SelectItem value="bug-reports">{t("orgPortal.bugReports") || "Bug Reports"}</SelectItem>
                                    <SelectItem value="general-feedback">{t("orgPortal.generalFeedback") || "General Feedback"}</SelectItem>
                                    <SelectItem value="ui-ux">UI/UX Improvement</SelectItem>
                                    <SelectItem value="performance">Performance Issue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-foreground">{t("orgPortal.subject") || "Subject"} *</Label>
                            <Input
                                id="subject"
                                placeholder={t("orgPortal.enterSubject") || "What is this feedback about?"}
                                required
                                className="bg-background border-border text-foreground focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent placeholder-muted-foreground"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-foreground">{t("orgPortal.description") || "Description"} *</Label>
                            <Textarea
                                id="description"
                                placeholder={t("orgPortal.enterMessage") || "Please describe in detail..."}
                                rows={6}
                                required
                                className="bg-background border-border text-foreground focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent placeholder-muted-foreground"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">{t("auth.email") || "Email"} ({t("common.optional") || "optional"})</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t("auth.exampleEmail") || "you@example.com"}
                                className="bg-background border-border text-foreground focus:ring-2 focus:ring-gold-solid/40 focus:border-transparent placeholder-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("orgPortal.weReachOut") || "We will only reach out to you if we need clarification."}
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-gold-gradient text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md hover:brightness-110 transition border-0"
                            size="lg"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {t("orgPortal.submitFeedback") || "Submit Feedback"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-card/40 border border-border rounded-xl shadow-md">
                <div className="p-6">
                    <h3 className="font-semibold mb-3 text-foreground">Recent Updates Based on Your Feedback</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-gold-solid mt-1">✓</span>
                            <span>Added human model upload feature with auto-background detection</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gold-solid mt-1">✓</span>
                            <span>Improved generation speed by 40% across all image types</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gold-solid mt-1">✓</span>
                            <span>Introduced project collaboration with role-based permissions</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
