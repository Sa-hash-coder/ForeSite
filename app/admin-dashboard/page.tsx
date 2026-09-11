"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, logout, isLoggedIn } from "@/app/lib/auth";
import type { User } from "@/app/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/admin-login");
      return;
    }

    const current = getStoredUser();
    setUser(current);

    fetch("/api/reports")
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setReports(response.data);
        }
      })
      .catch(console.error);

    const rootTheme =
      document.documentElement.getAttribute("data-theme");

    if (rootTheme === "dark") setIsDark(true);
  }, [router]);

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

  function handleLogout() {
    logout();
    router.push("/admin-login");
  }

  const theme = isDark
    ? {
      bg: "#0b0f17",
      surface: "#131b26",
      surfaceSubtle: "#1a2433",
      border: "#243042",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      primary: "#3b82f6",
      danger: "#ef4444",
      warning: "#f59e0b",
      success: "#22c55e",
      navBg: "#0f172a",
      navBorder: "#1e293b",
    }
    : {
      bg: "#f8fafc",
      surface: "#ffffff",
      surfaceSubtle: "#f1f5f9",
      border: "#e2e8f0",
      text: "#0f172a",
      textMuted: "#64748b",
      primary: "#2563eb",
      danger: "#dc2626",
      warning: "#d97706",
      success: "#16a34a",
      navBg: "#0f172a",
      navBorder: "#1e293b",
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
      }}
    >
      {/* Top Navbar */}
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
              ADMIN & SAFETY CONSOLE
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            type="button"
            onClick={toggleTheme}
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

          <span style={{ fontSize: "13px", color: "#94a3b8" }}>
            👤 {user?.name || "Administrator"} ({user?.role || "admin"})
          </span>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: "32px 24px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        {/* Welcome Banner */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, margin: "0 0 6px 0", color: theme.text }}>
            Safety Officer & Management Dashboard
          </h1>
          <p style={{ fontSize: "14px", color: theme.textMuted, margin: 0 }}>
            Real-time SIF precursor alerts, plant observations, and maintenance tasks
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "13px", color: theme.textMuted, fontWeight: 600 }}>Total Reports</div>
            <div style={{ fontSize: "28px", fontWeight: 800 }}>
              {reports.length}
            </div>
            <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>Active observations</div>
          </div>

          <div
            style={{
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "13px", color: theme.textMuted, fontWeight: 600 }}>Critical SIF Alerts</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: theme.danger, marginTop: "6px" }}>3</div>
            <div style={{ fontSize: "12px", color: theme.danger, marginTop: "4px" }}>Immediate action needed</div>
          </div>

          <div
            style={{
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "13px", color: theme.textMuted, fontWeight: 600 }}>Open Maintenance Tasks</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: theme.warning, marginTop: "6px" }}>8</div>
            <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>Assigned to technicians</div>
          </div>

          <div
            style={{
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "13px", color: theme.textMuted, fontWeight: 600 }}>Resolved Today</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: theme.success, marginTop: "6px" }}>4</div>
            <div style={{ fontSize: "12px", color: theme.success, marginTop: "4px" }}>Verified & inspected</div>
          </div>
        </div>

        {/* Quick Links / Status Section */}
        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: "10px",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: theme.text }}>
              Recent Critical Reports
            </h2>
          </div>

          {reports.slice(0, 5).map((report) => (
            <Link
              key={report._id}
              href={`/admin/reports/${report._id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  backgroundColor: theme.surfaceSubtle,
                  borderRadius: "8px",
                  border: `1px solid ${theme.border}`,
                  marginBottom: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {report.title}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: theme.textMuted,
                      marginTop: "2px",
                    }}
                  >
                    {report.location || "Industrial Site"} • SIF Probability:{" "}
                    {report.sif_probability ?? 0}%
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor:
                      (report.sif_probability ?? 0) > 70
                        ? "rgba(220,38,38,0.15)"
                        : "rgba(245,158,11,0.15)",
                    color:
                      (report.sif_probability ?? 0) > 70
                        ? theme.danger
                        : theme.warning,
                    fontWeight: 700,
                    fontSize: "12px",
                    padding: "4px 10px",
                    borderRadius: "4px",
                  }}
                >
                  {(report.sif_probability ?? 0) > 70
                    ? "CRITICAL"
                    : "WARNING"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
