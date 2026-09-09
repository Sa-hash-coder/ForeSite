"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LanguageProvider, useLanguage } from "@/app/lib/LanguageContext";

function WorkerNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, t, toggleLanguage } = useLanguage();

  const navLinks = [
    { href: "/worker", label: t.home },
    { href: "/worker/submit", label: t.reportIssue },
    { href: "/worker/reports", label: t.myReports },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Top navbar */}
      <nav style={navStyle.bar}>
        <div style={navStyle.left}>
          <Link href="/worker" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={navStyle.logo}>⚠️</span>
            <span style={navStyle.title}>{t.appTitle}</span>
          </Link>
        </div>

        {/* Desktop links */}
        <div style={navStyle.desktopLinks}>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                ...navStyle.link,
                ...(pathname === l.href ? navStyle.linkActive : {}),
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side: Language Switcher + User */}
        <div style={navStyle.right}>
          {/* Language Switch Button */}
          <button
            onClick={toggleLanguage}
            style={navStyle.langBtn}
            title="भाषा बदलें / Switch Language"
          >
            <span style={{ fontSize: "15px" }}>🌐</span>
            <span style={{ fontWeight: 700 }}>{lang === "en" ? "हिंदी" : "English"}</span>
          </button>

          <span style={navStyle.userName}>👤 {t.workerName}</span>

          {/* Mobile hamburger */}
          <button
            style={navStyle.hamburger}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={navStyle.mobileMenu}>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={navStyle.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ padding: "10px 24px" }}>
            <button
              onClick={() => {
                toggleLanguage();
                setMenuOpen(false);
              }}
              style={{
                ...navStyle.langBtn,
                width: "100%",
                justifyContent: "center",
                padding: "8px 16px",
              }}
            >
              🌐 {lang === "en" ? "हिंदी में बदलें (Hindi)" : "Switch to English"}
            </button>
          </div>
        </div>
      )}

      {/* Page content */}
      <main style={{ flex: 1, padding: "20px 16px", maxWidth: "720px", width: "100%", margin: "0 auto" }}>
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "16px",
          fontSize: "13px",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border)",
          backgroundColor: "#fff",
        }}
      >
        {t.footerText}
      </footer>
    </div>
  );
}

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WorkerNavbar>{children}</WorkerNavbar>
    </LanguageProvider>
  );
}

const navStyle: Record<string, React.CSSProperties> = {
  bar: {
    backgroundColor: "#1d4ed8",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "58px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    fontSize: "20px",
  },
  title: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "0.03em",
  },
  desktopLinks: {
    display: "flex",
    gap: "6px",
  },
  link: {
    color: "#dbeafe",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    padding: "6px 12px",
    borderRadius: "6px",
  },
  linkActive: {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.2)",
    fontWeight: 700,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  langBtn: {
    backgroundColor: "#fff",
    color: "#1d4ed8",
    border: "none",
    borderRadius: "20px",
    padding: "5px 12px",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  userName: {
    color: "#dbeafe",
    fontSize: "14px",
    fontWeight: 500,
  },
  hamburger: {
    display: "none",
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "22px",
    cursor: "pointer",
    padding: "4px 8px",
  },
  mobileMenu: {
    backgroundColor: "#1e40af",
    display: "flex",
    flexDirection: "column",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
  },
  mobileLink: {
    color: "#dbeafe",
    textDecoration: "none",
    fontSize: "15px",
    padding: "12px 24px",
    display: "block",
  },
};
