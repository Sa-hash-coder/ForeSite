"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LanguageProvider, useLanguage } from "@/app/lib/LanguageContext";
import LanguageSwitchButton from "@/app/components/LanguageSwitchButton";

function WorkerAppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = pathname === "/worker";
  const isSubmit = pathname === "/worker/submit";
  const isReports = pathname.startsWith("/worker/reports");
  const isProfile = pathname === "/worker/profile";

  const navItems = [
    {
      label: lang === "hi" ? "डैशबोर्ड" : "Dashboard",
      href: "/worker",
      exact: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: lang === "hi" ? "रिपोर्ट जमा करें" : "Submit Report",
      href: "/worker/submit",
      exact: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      label: lang === "hi" ? "मेरी रिपोर्ट्स" : "My Reports",
      href: "/worker/reports",
      exact: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      label: lang === "hi" ? "प्रोफ़ाइल" : "Profile",
      href: "/worker/profile",
      exact: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <div style={s.layoutWrapper}>
      {/* ── Desktop Left Sidebar ───────────────────────────────────── */}
      <aside className="worker-sidebar" style={s.sidebar}>
        {/* Logo */}
        <div style={s.sidebarHeader}>
          <Link href="/worker" style={s.brandWrap}>
            <div style={s.logoBadge}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div style={s.brandTitle}>ForeSite</div>
              <div style={s.brandSubtitle}>Worker Portal</div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav style={s.sidebarNav}>
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...s.navItem,
                  color: isActive ? "var(--primary)" : "var(--text)",
                  background: isActive ? "var(--primary-light)" : "transparent",
                  fontWeight: isActive ? 700 : 500,
                  borderLeft: isActive ? "4px solid var(--primary)" : "4px solid transparent",
                }}
              >
                <div style={{ color: isActive ? "var(--primary)" : "var(--text-light)" }}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Illustration */}
        <div style={s.sidebarFooter}>
          <div style={s.citySvgWrap}>
            <svg width="100%" height="40" viewBox="0 0 200 40" fill="none" style={{ opacity: 0.25 }}>
              <rect x="10" y="15" width="15" height="25" fill="var(--primary)" />
              <rect x="30" y="5" width="20" height="35" fill="var(--primary)" />
              <rect x="55" y="20" width="12" height="20" fill="var(--primary)" />
              <rect x="72" y="10" width="25" height="30" fill="var(--primary)" />
              <rect x="102" y="18" width="18" height="22" fill="var(--primary)" />
              <rect x="125" y="8" width="22" height="32" fill="var(--primary)" />
              <rect x="152" y="14" width="15" height="26" fill="var(--primary)" />
              <rect x="172" y="22" width="18" height="18" fill="var(--primary)" />
            </svg>
          </div>
          <div style={s.footerMotto}>Safer Cities. Stronger Communities.</div>
        </div>
      </aside>

      {/* ── Main Canvas Content ────────────────────────────────────── */}
      <div className="worker-main-canvas" style={s.mainCanvas}>
        {/* Top Header Bar */}
        <header className="apple-glass" style={s.topbar}>
          <div style={s.topbarLeft}>
            {/* Mobile Hamburger toggle */}
            <button
              className="worker-mobile-hamburger apple-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={s.hamburgerBtn}
              aria-label="Toggle Menu"
            >
              ☰
            </button>

            {/* Mobile Brand Title */}
            <div className="worker-mobile-brand" style={s.mobileBrand}>
              <span style={{ fontWeight: 800, fontSize: 17, color: "var(--text)" }}>ForeSite</span>
            </div>

            {/* Desktop Header Subtitle */}
            <div className="worker-desktop-header-title" style={s.desktopHeaderTitle}>
              <span style={s.greetingTitle}>{t.greeting}</span>
              <span style={s.greetingSub}>{t.greetingSub}</span>
            </div>
          </div>

          <div style={s.topbarRight}>
            {/* Language Switch Button */}
            <LanguageSwitchButton variant="header" />

            {/* Notification Bell Icon */}
            <button className="apple-btn" style={s.iconBtn} title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={s.bellBadge} />
            </button>

            {/* User Profile Avatar */}
            <Link href="/worker/profile" className="apple-btn" style={s.userAvatarBtn}>
              <div style={s.userAvatar}>AT</div>
              <span className="worker-desktop-username" style={s.userName}>Aniket Tiwari</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="bottom-nav-safe apple-page-enter" key={pathname} style={s.pageContainer}>
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="worker-mobile-bottom-nav apple-glass" style={s.bottomNav}>
          <div style={s.bottomNavInner}>
            {/* 1. Home / Dashboard Tab */}
            <Link
              href="/worker"
              className="apple-pill"
              style={{
                ...s.bottomNavItem,
                color: isHome ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: isHome ? 700 : 500 }}>
                {lang === "hi" ? "होम" : "Home"}
              </span>
            </Link>

            {/* 2. Floating Report Action Button */}
            <Link href="/worker/submit" className="apple-btn" style={s.centerActionButton} aria-label={t.reportIssue}>
              <div style={s.actionButtonCircle}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span style={s.actionButtonLabel}>
                {lang === "hi" ? "रिपोर्ट" : "Report"}
              </span>
            </Link>

            {/* 3. My Reports Tab */}
            <Link
              href="/worker/reports"
              style={{
                ...s.bottomNavItem,
                color: isReports ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: isReports ? 700 : 500 }}>
                {lang === "hi" ? "रिपोर्ट्स" : "Reports"}
              </span>
            </Link>

            {/* 4. Profile Tab */}
            <Link
              href="/worker/profile"
              style={{
                ...s.bottomNavItem,
                color: isProfile ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: isProfile ? 700 : 500 }}>
                {lang === "hi" ? "प्रोफ़ाइल" : "Profile"}
              </span>
            </Link>
          </div>
        </nav>
      </div>

      <style jsx global>{`
        /* Desktop layout rules */
        .worker-sidebar {
          display: flex !important;
        }
        .worker-main-canvas {
          margin-left: 240px;
          width: calc(100% - 240px);
        }
        .worker-mobile-hamburger,
        .worker-mobile-brand,
        .worker-mobile-bottom-nav {
          display: none !important;
        }

        /* Mobile layout rules */
        @media (max-width: 860px) {
          .worker-sidebar {
            display: none !important;
          }
          .worker-main-canvas {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .worker-mobile-hamburger,
          .worker-mobile-brand,
          .worker-mobile-bottom-nav {
            display: flex !important;
          }
          .worker-desktop-header-title,
          .worker-desktop-username {
            display: none !important;
          }
          .bottom-nav-safe {
            padding: 16px 16px 120px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WorkerAppContent>{children}</WorkerAppContent>
    </LanguageProvider>
  );
}

const s: Record<string, React.CSSProperties> = {
  layoutWrapper: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "var(--bg)",
  },
  sidebar: {
    width: 240,
    backgroundColor: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 60,
  },
  sidebarHeader: {
    padding: "20px 20px 16px",
    borderBottom: "1px solid var(--border)",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "var(--primary-light)",
    border: "1px solid var(--primary-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontWeight: 800,
    fontSize: 17,
    color: "var(--text)",
    lineHeight: 1.1,
    letterSpacing: "-0.3px",
  },
  brandSubtitle: {
    fontSize: 11,
    color: "var(--text-muted)",
    fontWeight: 600,
    marginTop: 2,
  },
  sidebarNav: {
    flex: 1,
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 14,
    textDecoration: "none",
    transition: "all 0.15s ease",
  },
  sidebarFooter: {
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    backgroundColor: "var(--surface-subtle)",
    textAlign: "center",
  },
  citySvgWrap: {
    marginBottom: 6,
  },
  footerMotto: {
    fontSize: 11,
    color: "var(--text-muted)",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  mainCanvas: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  topbar: {
    height: 64,
    backgroundColor: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    position: "sticky",
    top: 0,
    zIndex: 40,
    boxShadow: "var(--shadow-sm)",
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface)",
    fontSize: 18,
    color: "var(--text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  mobileBrand: {
    display: "flex",
    alignItems: "center",
  },
  desktopHeaderTitle: {
    display: "flex",
    flexDirection: "column",
  },
  greetingTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--text)",
    lineHeight: 1.2,
  },
  greetingSub: {
    fontSize: 11,
    color: "var(--text-muted)",
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface)",
    color: "var(--text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
  },
  bellBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: "50%",
    backgroundColor: "var(--danger)",
  },
  userAvatarBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    backgroundColor: "var(--primary)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--text)",
  },
  pageContainer: {
    flex: 1,
    padding: "24px 28px",
    boxSizing: "border-box",
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    justifyContent: "center",
    pointerEvents: "none",
  },
  bottomNavInner: {
    pointerEvents: "auto",
    width: "100%",
    height: 64,
    backgroundColor: "var(--surface)",
    borderTop: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "0 8px calc(env(safe-area-inset-bottom, 0px) + 4px)",
    boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.06)",
  },
  bottomNavItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textDecoration: "none",
    gap: 2,
  },
  centerActionButton: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    transform: "translateY(-10px)",
    gap: 2,
  },
  actionButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "var(--primary)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
    border: "3px solid var(--surface)",
  },
  actionButtonLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "var(--primary)",
    letterSpacing: "0.03em",
  },
};
