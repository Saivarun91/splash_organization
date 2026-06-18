"use client";

import { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Globe, Save, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        organizationName: "My Organization",
        email: "admin@organization.com",
        notifications: {
            email: true,
            push: false,
            projectUpdates: true,
            creditAlerts: true,
        },
        preferences: {
            language: "en",
            timezone: "UTC",
            theme: "light",
        },
        security: {
            twoFactor: false,
            sessionTimeout: 30,
        },
    });

    const handleSave = async () => {
        setLoading(true);
        // In real app, save to API
        setTimeout(() => {
            setLoading(false);
            alert("Settings saved successfully!");
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="relative p-4 rounded-xl bg-card shadow-md border border-border overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-tr from-gold-solid/20 to-gold-muted/10 opacity-10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-foreground mb-1">{t("orgPortal.settings")}</h1>
                    <p className="text-sm text-muted-foreground">{t("orgPortal.manageSettings")}</p>
                </div>
            </div>

            <div className="space-y-6 max-w-4xl">
                {/* Organization Settings */}
                <Card className="p-6 bg-card border border-border rounded-xl shadow-sm text-foreground">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gold-solid/10 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-gold-solid" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{t("orgPortal.organizationInformation")}</h2>
                            <p className="text-sm text-muted-foreground">{t("orgPortal.updateOrganizationDetails")}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">{t("orgPortal.organizationName")}</label>
                            <input
                                type="text"
                                value={settings.organizationName}
                                onChange={(e) =>
                                    setSettings((prev) => ({ ...prev, organizationName: e.target.value }))
                                }
                                className="block w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">{t("auth.email")}</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                                className="block w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                            />
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="p-6 bg-card border border-border rounded-xl shadow-sm text-foreground">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <Bell className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{t("orgPortal.notifications")}</h2>
                            <p className="text-sm text-muted-foreground">{t("orgPortal.notificationSettings")}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-foreground">{t("orgPortal.emailNotifications")}</span>
                                <p className="text-xs text-muted-foreground">{t("orgPortal.receiveEmailNotifications")}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notifications.email}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, email: e.target.checked },
                                    }))
                                }
                                className="w-5 h-5 text-gold-solid accent-gold-solid rounded bg-background border border-input focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                            />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-foreground">{t("orgPortal.pushNotifications")}</span>
                                <p className="text-xs text-muted-foreground">{t("orgPortal.receivePushNotifications")}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notifications.push}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, push: e.target.checked },
                                    }))
                                }
                                className="w-5 h-5 text-gold-solid accent-gold-solid rounded bg-background border border-input focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                            />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-foreground">{t("orgPortal.projectUpdates")}</span>
                                <p className="text-xs text-muted-foreground">{t("orgPortal.getNotifiedProjectChanges")}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notifications.projectUpdates}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, projectUpdates: e.target.checked },
                                    }))
                                }
                                className="w-5 h-5 text-gold-solid accent-gold-solid rounded bg-background border border-input focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                            />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-foreground">{t("orgPortal.creditAlerts")}</span>
                                <p className="text-xs text-muted-foreground">{t("orgPortal.getNotifiedCreditsLow")}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notifications.creditAlerts}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, creditAlerts: e.target.checked },
                                    }))
                                }
                                className="w-5 h-5 text-gold-solid accent-gold-solid rounded bg-background border border-input focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                            />
                        </label>
                    </div>
                </Card>

                {/* Preferences */}
                <Card className="p-6 bg-card border border-border rounded-xl shadow-sm text-foreground">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gold-solid/10 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-gold-solid" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{t("orgPortal.preferences")}</h2>
                            <p className="text-sm text-muted-foreground">{t("orgPortal.preferenceSettings")}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">{t("common.language")}</label>
                            <select
                                value={settings.preferences.language}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        preferences: { ...prev.preferences, language: e.target.value },
                                    }))
                                }
                                className="block w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors cursor-pointer"
                            >
                                <option value="en" className="bg-card text-foreground">{t("common.english")}</option>
                                <option value="es" className="bg-card text-foreground">{t("common.spanish")}</option>
                                <option value="fr" className="bg-card text-foreground">French</option>
                                <option value="de" className="bg-card text-foreground">German</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">{t("orgPortal.timezone")}</label>
                            <select
                                value={settings.preferences.timezone}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        preferences: { ...prev.preferences, timezone: e.target.value },
                                    }))
                                }
                                className="block w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors cursor-pointer"
                            >
                                <option value="UTC" className="bg-card text-foreground">UTC</option>
                                <option value="America/New_York" className="bg-card text-foreground">Eastern Time</option>
                                <option value="America/Chicago" className="bg-card text-foreground">Central Time</option>
                                <option value="America/Denver" className="bg-card text-foreground">Mountain Time</option>
                                <option value="America/Los_Angeles" className="bg-card text-foreground">Pacific Time</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Security */}
                <Card className="p-6 bg-card border border-border rounded-xl shadow-sm text-foreground">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{t("orgPortal.security")}</h2>
                            <p className="text-sm text-muted-foreground">{t("orgPortal.securitySettings")}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-foreground">{t("orgPortal.twoFactor")}</span>
                                <p className="text-xs text-muted-foreground">{t("orgPortal.addExtraSecurity")}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.security.twoFactor}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        security: { ...prev.security, twoFactor: e.target.checked },
                                    }))
                                }
                                className="w-5 h-5 text-gold-solid accent-gold-solid rounded bg-background border border-input focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer"
                            />
                        </label>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                {t("orgPortal.sessionTimeout")}
                            </label>
                            <input
                                type="number"
                                value={settings.security.sessionTimeout}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        security: { ...prev.security, sessionTimeout: parseInt(e.target.value) },
                                    }))
                                }
                                className="block w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                                min="5"
                                max="120"
                            />
                        </div>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full sm:w-auto bg-gold-gradient text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t("orgPortal.saving")}
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                {t("orgPortal.saveSettings")}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
