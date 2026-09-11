"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginApi } from "@/app/lib/api";
import { saveAuth } from "@/app/lib/auth";

export default function WorkerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme from document or system preference
  useEffect(() => {
    const rootTheme = document.documentElement.getAttribute("data-theme");
    if (rootTheme === "dark") {
      setIsDark(true);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPortalDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      return next;
    });
  }

  // Quick demo credentials loader
  function fillDemoCredentials() {
    setEmail("rajan@plant.com");
    setPassword("password123");
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(email.trim(), password);
      saveAuth(res.data.token, res.data.user);
      router.push("/worker");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials or network issue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Palette tokens
  const theme = isDark
    ? {
        bg: "#0b0f17",
        surface: "#131b26",
        surfaceSubtle: "#1a2433",
        border: "#243042",
        text: "#f1f5f9",
        textMuted: "#94a3b8",
        primary: "#3b82f6",
        primaryHover: "#2563eb",
        danger: "#ef4444",
        dangerLight: "rgba(239, 68, 68, 0.12)",
        warning: "#f59e0b",
        warningLight: "rgba(245, 158, 11, 0.12)",
        navBg: "#0f172a",
        navBorder: "#1e293b",
        inputBg: "#101722",
      }
    : {
        bg: "#f8fafc",
        surface: "#ffffff",
        surfaceSubtle: "#f1f5f9",
        border: "#e2e8f0",
        text: "#0f172a",
        textMuted: "#64748b",
        primary: "#2563eb",
        primaryHover: "#1d4ed8",
        danger: "#dc2626",
        dangerLight: "#fef2f2",
        warning: "#d97706",
        warningLight: "#fffbeb",
        navBg: "#0f172a",
        navBorder: "#1e293b",
        inputBg: "#ffffff",
      };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.bg,
        color: theme.text,
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      {/* Brand Navigation Bar */}
      <header
        style={{
          height: "64px",
          backgroundColor: theme.navBg,
          borderBottom: `1px solid ${theme.navBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>⚠️</span>
          <div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#f8fafc",
                letterSpacing: "0.03em",
                display: "block",
                lineHeight: 1.1,
              }}
            >
              ForeSite
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#94a3b8",
                letterSpacing: "0.12em",
                display: "block",
              }}
            >
              SAFETY INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Right Controls: Theme Toggle & Portal Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} ref={dropdownRef}>
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              color: "#f1f5f9",
              padding: "6px 10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{isDark ? "☀️" : "🌙"}</span>
            <span style={{ fontSize: "12px", fontWeight: 600 }}>
              {isDark ? "Light" : "Dark"}
            </span>
          </button>

          {/* Portal Switcher Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setPortalDropdownOpen((prev) => !prev)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "9999px",
                border: "1px solid rgba(255, 255, 255, 0.22)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              aria-haspopup="true"
              aria-expanded={portalDropdownOpen}
            >
              <span>👷 Worker Portal</span>
              <span
                style={{
                  fontSize: "10px",
                  transform: portalDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.15s ease",
                }}
              >
                ▼
              </span>
            </button>

            {portalDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "10px",
                  boxShadow: isDark
                    ? "0 10px 25px -5px rgba(0, 0, 0, 0.6)"
                    : "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
                  width: "270px",
                  zIndex: 200,
                  padding: "6px 0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "8px 16px 4px 16px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: theme.textMuted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Switch Portal
                </div>

                <Link
                  href="/login"
                  onClick={() => setPortalDropdownOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 16px",
                    textDecoration: "none",
                    backgroundColor: theme.surfaceSubtle,
                    color: theme.text,
                  }}
                >
                  <span style={{ fontSize: "18px" }}>👷</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13.5px" }}>Worker Portal</div>
                    <div style={{ fontSize: "11.5px", color: theme.textMuted }}>Safety reporting & observations</div>
                  </div>
                  <span style={{ marginLeft: "auto", color: theme.primary, fontWeight: 700 }}>✓</span>
                </Link>

                <Link
                  href="/admin-login"
                  onClick={() => setPortalDropdownOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 16px",
                    textDecoration: "none",
                    color: theme.text,
                  }}
                >
                  <span style={{ fontSize: "18px" }}>🛡️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13.5px" }}>Admin Portal</div>
                    <div style={{ fontSize: "11.5px", color: theme.textMuted }}>Safety officer & management console</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        {/* Login Card */}
        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: "12px",
            padding: "36px 32px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: isDark
              ? "0 4px 20px -2px rgba(0, 0, 0, 0.4)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Card Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "28px",
                backgroundColor: theme.surfaceSubtle,
                border: `1px solid ${theme.border}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                marginBottom: "12px",
              }}
            >
              <span>👷‍♂️</span>
            </div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: theme.text,
                margin: "0 0 6px 0",
                letterSpacing: "-0.01em",
              }}
            >
              Worker Sign In
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                color: theme.textMuted,
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              Access safety reporting, incident logs, and workplace updates
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: theme.dangerLight,
                border: `1px solid ${theme.danger}`,
                color: theme.danger,
                borderRadius: "8px",
                padding: "10px 12px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              role="alert"
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
              <div style={{ flex: 1, fontSize: "13px", lineHeight: "1.4" }}>
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Email Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="worker-email"
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: theme.text,
                }}
              >
                Work Email Address
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    fontSize: "14px",
                    color: theme.textMuted,
                    pointerEvents: "none",
                  }}
                >
                  ✉️
                </span>
                <input
                  id="worker-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajan@plant.com"
                  style={{
                    width: "100%",
                    backgroundColor: theme.inputBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "8px",
                    padding: "10px 14px 10px 38px",
                    fontSize: "14.5px",
                    color: theme.text,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="worker-password"
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: theme.text,
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.primary,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    fontSize: "14px",
                    color: theme.textMuted,
                    pointerEvents: "none",
                  }}
                >
                  🔒
                </span>
                <input
                  id="worker-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    backgroundColor: theme.inputBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "8px",
                    padding: "10px 14px 10px 38px",
                    fontSize: "14.5px",
                    color: theme.text,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: theme.primary,
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "15px",
                fontWeight: 700,
                marginTop: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.75 : 1,
                boxShadow: isDark
                  ? "0 2px 8px rgba(59, 130, 246, 0.35)"
                  : "0 2px 4px rgba(37, 99, 235, 0.25)",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span>⏳</span> Signing In...
                </span>
              ) : (
                "Sign In to Dashboard →"
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div
            style={{
              marginTop: "24px",
              padding: "12px 14px",
              backgroundColor: theme.warningLight,
              border: `1px dashed ${theme.warning}`,
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: theme.warning,
                marginBottom: "4px",
              }}
            >
              💡 Quick Demo Account
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                fontSize: "12px",
                color: theme.text,
                marginBottom: "8px",
              }}
            >
              <span>Email: <code>rajan@plant.com</code></span>
              <span>Pass: <code>password123</code></span>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.warning}`,
                color: theme.warning,
                borderRadius: "6px",
                padding: "5px 10px",
                fontSize: "11.5px",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Fill Demo Credentials
            </button>
          </div>

          {/* Bottom Help / Admin switch */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: theme.textMuted, margin: 0, lineHeight: 1.4 }}>
              Need administrator or safety officer access?{" "}
              <Link href="/admin-login" style={{ color: theme.primary, fontWeight: 600 }}>
                Go to Admin Portal
              </Link>
            </p>
          </div>
        </div>

        {/* Safety First Notice Footer */}
        <div
          style={{
            marginTop: "24px",
            fontSize: "12.5px",
            color: theme.textMuted,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>🛡️ Verified Industrial Incident & SIF Prevention System</span>
        </div>
      </main>
    </div>
  );
}
