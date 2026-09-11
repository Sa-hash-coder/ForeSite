"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Activity,
  Wrench,
  Radio,
  Lock,
  CheckCircle2,
  Bell,
  Sun,
  Moon,
  LogOut,
  Search,
  Menu,
  X
} from "lucide-react";
import LanguageSwitchButton from "@/app/components/LanguageSwitchButton";

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("foresite_theme") as "light" | "dark" | null;
    const initialTheme = saved || "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("foresite_theme", nextTheme);
  };

  const isDark = theme === "dark";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg)", width: "100%" }}>
      
      {/* ─── 1. FIXED LEFT SIDEBAR (Matching Officer Desk) ────────────── */}
      <aside
        style={{
          width: 250,
          backgroundColor: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
        }}
        className="maintenance-sidebar"
      >
        {/* Logo & Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: "#0A192F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck style={{ width: 20, height: 20, color: "#ffffff" }} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", lineHeight: 1.1, letterSpacing: "-0.4px" }}>
              ForeSite
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>
              Maintenance Desk
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: "20px 14px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 12, marginBottom: 6 }}>
            Command Modules
          </div>

          {[
            { label: "Operations Desk", id: "desk", icon: Activity, tag: "LIVE" },
            { label: "Work Orders Queue", id: "orders", icon: Wrench, count: 4 },
            { label: "Fleet Telemetry", id: "telemetry", icon: Radio, count: 6 },
            { label: "LOTO Safety Permits", id: "loto", icon: Lock, count: 3 },
            { label: "Clearance Sign-Off", id: "clearance", icon: CheckCircle2, tag: "OSHA" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const event = new CustomEvent("maintenance-tab-change", { detail: item.id });
                window.dispatchEvent(event);
                setMobileMenuOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 14px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-subtle)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <item.icon style={{ width: 17, height: 17, color: "#0F172A" }} />
                <span>{item.label}</span>
              </div>
              {item.count && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 10, backgroundColor: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0" }}>
                  {item.count}
                </span>
              )}
              {item.tag && (
                <span style={{ fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 4, backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                  {item.tag}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", backgroundColor: "var(--surface-subtle)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>Unit M-4 Shift A · Lead</div>
          <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 2 }}>ISO 45001 Verified</div>
        </div>
      </aside>

      {/* ─── 2. MAIN CANVAS WRAPPER ───────────────────────────────────── */}
      <div style={{ flex: 1, marginLeft: 250, display: "flex", flexDirection: "column", minHeight: "100vh", width: "calc(100% - 250px)" }} className="maintenance-main">
        
        {/* Top Sticky Header */}
        <header
          style={{
            height: 64,
            backgroundColor: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Left Title & Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
              Maintenance Command Desk
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 9px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: "#F0FDF4",
                color: "#15803D",
                border: "1px solid #BBF7D0",
              }}
              className="hide-mobile"
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#15803D", display: "inline-block" }} />
              <span>OFFICER DISPATCH SYNC ACTIVE</span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LanguageSwitchButton variant="header" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text)",
              }}
            >
              {isDark ? <Sun style={{ width: 16, height: 16, color: "#F59E0B" }} /> : <Moon style={{ width: 16, height: 16, color: "#64748B" }} />}
            </button>

            {/* Notification Bell */}
            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                cursor: "pointer",
                color: "var(--text)",
              }}
            >
              <Bell style={{ width: 16, height: 16, color: "#64748B" }} />
              <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", backgroundColor: "#DC2626" }} />
            </button>

            {/* Technician Profile Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 4px 6px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "#0A192F", color: "#FFFFFF", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                DV
              </div>
              <div className="hide-mobile" style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Devon Vance</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Lead Tech M-4</div>
              </div>
            </div>

            {/* Sign Out */}
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-muted)",
                textDecoration: "none",
              }}
              className="hide-mobile"
            >
              <LogOut style={{ width: 14, height: 14 }} />
              <span>Sign Out</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "28px", flex: 1 }}>{children}</main>

      </div>

      {/* Responsive Breakpoint CSS */}
      <style jsx global>{`
        @media (max-width: 960px) {
          .maintenance-sidebar {
            display: none !important;
          }
          .maintenance-main {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
