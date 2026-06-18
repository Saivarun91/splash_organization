"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if user is an organization member
      if (data.user && !data.user.organization_role) {
        throw new Error("Only organization members can access this portal");
      }

      if (data.user && !data.user.organization && !data.user.organization_id) {
        throw new Error("You must be associated with an organization to access this portal");
      }

      if (data.token) {
        localStorage.setItem("org_auth_token", data.token);
        localStorage.setItem("org_user", JSON.stringify(data.user));
        localStorage.setItem("org_user_id", data.user.id);
        localStorage.setItem("org_organization_id", data.user.organization?.id || data.user.organization_id || "");
        
        // Set preferred language if available
        if (data.user?.preferred_language) {
          localStorage.setItem('preferredLanguage', data.user.preferred_language);
          console.log('[Login] Setting preferred language:', data.user.preferred_language);
        } else {
          // Default to 'en' if not set
          localStorage.setItem('preferredLanguage', 'en');
          console.log('[Login] No preferred language, defaulting to en');
        }
        
        // Dispatch custom event to notify LanguageContext about user login
        // Use a small delay to ensure localStorage is set
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('org_user_updated', { 
            detail: { preferred_language: data.user?.preferred_language || 'en' }
          }));
        }, 100);
        
        router.push("/dashboard");
      } else {
        setError("Invalid login response");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-surface-gradient px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-foreground">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-gradient rounded-2xl mb-4 shadow-md">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight text-foreground">{t("orgPortal.organizationPortal")}</h1>
            <p className="text-muted-foreground">{t("orgPortal.signInToManage")}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                {t("auth.email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors disabled:opacity-50"
                  placeholder={t("auth.exampleEmail")}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                {t("auth.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors disabled:opacity-50"
                  placeholder={t("auth.atLeast8Chars")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-gradient text-primary-foreground py-3 px-4 rounded-lg font-semibold hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? t("auth.signingIn") : t("auth.signin")}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("orgPortal.onlyOwnersCanAccess")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
