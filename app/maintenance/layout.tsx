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
  const [activeTab, setActiveTab] = useState<string>("desk");

  useEffect(() => {
    const saved = localStorage.getItem("foresite_theme") as "light" | "dark" | null;
    const initialTheme = saved || "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener("maintenance-tab-change", handleTabChange);
    return () => window.removeEventListener("maintenance-tab-change", handleTabChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("foresite_theme", nextTheme);
  };

  const isDark = theme === "dark";

  const navItems = [
    { label: "Operations Desk", id: "desk", icon: Activity, tag: "LIVE" },
    { label: "Work Orders Queue", id: "orders", icon: Wrench, count: 4 },
    { label: "Fleet Telemetry", id: "telemetry", icon: Radio, count: 6 },
    { label: "LOTO Safety Permits", id: "loto", icon: Lock, count: 3 },
    { label: "Clearance Sign-Off", id: "clearance", icon: CheckCircle2, tag: "OSHA" },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    const event = new CustomEvent("maintenance-tab-change", { detail: id });
    window.dispatchEvent(event);
    setMobileMenuOpen(false);
  };

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

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 14px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? "#FFFFFF" : "var(--text)",
                  backgroundColor: isActive ? "#0A192F" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-subtle)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <item.icon style={{ width: 17, height: 17, color: isActive ? "#FFFFFF" : "#0F172A" }} />
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 10,
                      backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "var(--surface-subtle)",
                      color: isActive ? "#FFFFFF" : "#0F172A",
                      border: isActive ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {item.count}
                  </span>
                )}
                {item.tag && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: 4,
                      backgroundColor: isActive ? "rgba(255, 255, 255, 0.25)" : "#FEF2F2",
                      color: isActive ? "#FFFFFF" : "#DC2626",
                      border: isActive ? "none" : "1px solid #FECACA",
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", backgroundColor: "var(--surface-subtle)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>Unit M-4 Shift A · Lead</div>
          <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 2 }}>ISO 45001 &amp; OSHA 1910 Verified</div>
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
          }}
        >
          {/* Mobile Menu Toggle & Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="maintenance-mobile-btn"
              style={{
                display: "none",
                background: "none",
                border: "none",
                color: "var(--text)",
                cursor: "pointer",
                padding: 4,
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6, backgroundColor: "var(--surface-subtle)", border: "1px solid var(--border)", color: "#0A192F" }}>
                PLANT SECTOR 4
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#15803D", display: "inline-block" }} />
                Modbus Telemetry Online
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LanguageSwitchButton />

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text)",
              }}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Switch Portal Button */}
            <Link
              href="/officer"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                color: "#0A192F",
                backgroundColor: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Officer Portal →
            </Link>

            {/* Profile Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, borderLeft: "1px solid var(--border)" }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  backgroundColor: "#0A192F",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                DV
              </div>
              <div className="maintenance-tech-info">
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>Devon Vance</div>
                <div style={{ fontSize: 10, color: "var(--text-light)" }}>Lead Reliability Tech</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Children / Content */}
        <main style={{ flex: 1, padding: "28px" }}>
          {children}
        </main>

      </div>

      {/* Responsive Style */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .maintenance-sidebar {
            display: ${mobileMenuOpen ? "flex" : "none"} !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .maintenance-main {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .maintenance-mobile-btn {
            display: block !important;
          }
          .maintenance-tech-info {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
