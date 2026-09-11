"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Shield,
  Sun,
  Moon,
  LogOut,
  Radio,
  User,
  Wrench,
  Activity,
  Layers,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState("desk");

  useEffect(() => {
    const saved = localStorage.getItem("foresite_theme") as "light" | "dark" | null;
    const initialTheme =
      saved || "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("foresite_theme", nextTheme);
  };

  const navItems = [
    { id: "desk", label: "Operations Desk", href: "#overview", icon: Activity },
    { id: "orders", label: "Officer Dispatches", href: "#work-orders", icon: Wrench },
    { id: "telemetry", label: "Fleet Telemetry", href: "#fleet-telemetry", icon: Radio },
    { id: "loto", label: "Active LOTO Permits", href: "#loto-log", icon: Lock },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault();
    setActiveTab(id);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark ? "#070b14" : "#f8fafc",
        color: isDark ? "#f1f5f9" : "#0f172a",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      {/* ─── Internal Application App-Bar ──────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: isDark ? "rgba(11, 19, 41, 0.94)" : "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          {/* Logo & Portal Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link
              href="/maintenance"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "8px",
                  background: isDark ? "#1e293b" : "#0A192F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Shield style={{ width: "22px", height: "22px", color: "#ffffff" }} strokeWidth={2.2} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "18px",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    color: isDark ? "#ffffff" : "#0F172A",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>ForeSite</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: isDark ? "rgba(59, 130, 246, 0.2)" : "#eff6ff",
                      color: isDark ? "#60a5fa" : "#1d4ed8",
                      letterSpacing: "0.04em",
                    }}
                  >
                    MAINTENANCE
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: isDark ? "#94a3b8" : "#64748b",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginTop: "2px",
                  }}
                >
                  Field Response & Telemetry Command
                </div>
              </div>
            </Link>

            {/* Live Officer Sync Status */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                background: isDark ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.1)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                marginLeft: "12px",
              }}
              className="hidden-mobile"
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              OFFICER DISPATCH SYNC ACTIVE
            </div>
          </div>

          {/* Operational Navigation Tabs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            className="hidden-mobile"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href, item.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "7px 14px",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive
                      ? (isDark ? "#ffffff" : "#0f172a")
                      : (isDark ? "#94a3b8" : "#64748b"),
                    background: isActive
                      ? (isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9")
                      : "transparent",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    border: isActive
                      ? (isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1")
                      : "1px solid transparent",
                  }}
                >
                  <Icon style={{ width: "15px", height: "15px", color: isActive ? "#3b82f6" : "inherit" }} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Tools: User Badge, Theme Switcher, Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Logged-In Technician Profile */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "5px 12px 5px 6px",
                borderRadius: "8px",
                background: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  background: isDark ? "#1e293b" : "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "12px",
                  color: isDark ? "#60a5fa" : "#1d4ed8",
                }}
              >
                DV
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a" }}>
                  Devon Vance
                </div>
                <div style={{ fontSize: "10.5px", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Unit M-4 • Shift A
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "6px",
                background: isDark ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                color: isDark ? "#fbbf24" : "#475569",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {isDark ? (
                <Sun style={{ width: "17px", height: "17px" }} />
              ) : (
                <Moon style={{ width: "17px", height: "17px" }} />
              )}
            </button>

            {/* Log Out Button back to Landing Page */}
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 12px",
                borderRadius: "6px",
                background: "transparent",
                color: isDark ? "#94a3b8" : "#64748b",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                transition: "all 0.15s",
              }}
            >
              <LogOut style={{ width: "15px", height: "15px" }} />
              <span className="hidden-mobile">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Page Body Content ─────────────────────────────────────────── */}
      <main>{children}</main>
    </div>
  );
}
