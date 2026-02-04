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
            <div className="relative p-4 rounded-xl bg-white dark:bg-card shadow-md border border-gray-200 dark:border-border overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">{t("orgPortal.settings")}</h1>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">{t("orgPortal.manageSettings")}</p>
                </div>
            </div>

            <div className="space-y-6 max-w-4xl">
                {/* Organization Settings */}
                <Card className="p-6 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-sidebar-accent/40 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600 dark:text-sidebar-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">{t("orgPortal.organizationInformation")}</h2>
                            <p className="text-sm text-gray-600 dark:text-muted-foreground">{t("orgPortal.updateOrganizationDetails")}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("orgPortal.organizationName")}</label>
                            <input
                                type="text"
                                value={settings.organizationName}
                                onChange={(e) =>
                                    setSettings((prev) => ({ ...prev, organizationName: e.target.value }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("auth.email")}</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Bell className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{t("orgPortal.notifications")}</h2>
                            <p className="text-sm text-gray-600">{t("orgPortal.notificationSettings")}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-gray-900">{t("orgPortal.emailNotifications")}</span>
                                <p className="text-xs text-gray-600">{t("orgPortal.receiveEmailNotifications")}</p>
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
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-gray-900">{t("orgPortal.pushNotifications")}</span>
                                <p className="text-xs text-gray-600">{t("orgPortal.receivePushNotifications")}</p>
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
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-gray-900">{t("orgPortal.projectUpdates")}</span>
                                <p className="text-xs text-gray-600">{t("orgPortal.getNotifiedProjectChanges")}</p>
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
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-gray-900">{t("orgPortal.creditAlerts")}</span>
                                <p className="text-xs text-gray-600">{t("orgPortal.getNotifiedCreditsLow")}</p>
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
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </Card>

                {/* Preferences */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{t("orgPortal.preferences")}</h2>
                            <p className="text-sm text-gray-600">{t("orgPortal.preferenceSettings")}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("common.language")}</label>
                            <select
                                value={settings.preferences.language}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        preferences: { ...prev.preferences, language: e.target.value },
                                    }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="en">{t("common.english")}</option>
                                <option value="es">{t("common.spanish")}</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("orgPortal.timezone")}</label>
                            <select
                                value={settings.preferences.timezone}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        preferences: { ...prev.preferences, timezone: e.target.value },
                                    }))
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time</option>
                                <option value="America/Chicago">Central Time</option>
                                <option value="America/Denver">Mountain Time</option>
                                <option value="America/Los_Angeles">Pacific Time</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Security */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{t("orgPortal.security")}</h2>
                            <p className="text-sm text-gray-600">{t("orgPortal.securitySettings")}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-gray-900">{t("orgPortal.twoFactor")}</span>
                                <p className="text-xs text-gray-600">{t("orgPortal.addExtraSecurity")}</p>
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
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
