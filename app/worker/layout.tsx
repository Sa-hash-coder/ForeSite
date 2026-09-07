"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getStoredUser, logout } from "@/app/lib/auth";
import type { User } from "@/app/lib/api";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.replace("/worker/login");
      return;
    }
    if (u.role !== "worker") {
      router.replace("/worker/login");
      return;
    }
    setUser(u);
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/worker/login");
  }

  const navLinks = [
    { href: "/worker",          label: "🏠 Home"        },
    { href: "/worker/submit",   label: "📋 Report Issue" },
    { href: "/worker/reports",  label: "📁 My Reports"  },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Top navbar */}
      <nav style={navStyle.bar}>
        <div style={navStyle.left}>
          <span style={navStyle.logo}>⚠</span>
          <span style={navStyle.title}>ForeSite</span>
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

        {/* User + logout */}
        <div style={navStyle.right}>
          {user && (
            <span style={navStyle.userName}>{user.name.split(" ")[0]}</span>
          )}
          <button onClick={handleLogout} style={navStyle.logoutBtn}>
            Sign Out
          </button>
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
          <button onClick={handleLogout} style={navStyle.mobileLinkBtn}>
            🚪 Sign Out
          </button>
        </div>
      )}

      {/* Page content */}
      <main style={{ flex: 1, padding: "24px 16px", maxWidth: "720px", width: "100%", margin: "0 auto" }}>
        {children}
      </main>

      {/* Bottom footer */}
      <footer style={{ textAlign: "center", padding: "16px", fontSize: "12px", color: "var(--text-light)", borderTop: "1px solid var(--border)", backgroundColor: "#fff" }}>
        ForeSite Safety Platform &nbsp;•&nbsp; Report issues to your Safety Officer
      </footer>
    </div>
  );
}

const navStyle: Record<string, React.CSSProperties> = {
  bar: {
    backgroundColor: "#1d4ed8",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "56px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logo: {
    fontSize: "18px",
    color: "#fbbf24",
  },
  title: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "0.04em",
  },
  desktopLinks: {
    display: "flex",
    gap: "4px",
  },
  link: {
    color: "#bfdbfe",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    padding: "6px 12px",
    borderRadius: "4px",
  },
  linkActive: {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userName: {
    color: "#bfdbfe",
    fontSize: "14px",
  },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "#fff",
    padding: "5px 12px",
    borderRadius: "4px",
    fontSize: "13px",
    cursor: "pointer",
  },
  hamburger: {
    display: "none",
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "20px",
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
    color: "#bfdbfe",
    textDecoration: "none",
    fontSize: "15px",
    padding: "12px 24px",
    display: "block",
  },
  mobileLinkBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#bfdbfe",
    fontSize: "15px",
    padding: "12px 24px",
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
  },
};
