"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/app/lib/LanguageContext";

export default function WorkerProfilePage() {
  const { lang, t } = useLanguage();

  return (
    <div style={styles.container}>
      {/* Profile Header Card */}
      <div style={styles.card}>
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>AT</div>
        </div>
        <h1 style={styles.name}>{lang === "hi" ? "अनिकेत तिवारी" : "Aniket Tiwari"}</h1>
        <p style={styles.role}>{lang === "hi" ? "समुदाय कार्यकर्ता" : "Community Worker"}</p>
        <p style={styles.memberSince}>{lang === "hi" ? "सितंबर 2026 से सदस्य" : "Member since Sept 2026"}</p>

        {/* Stats Grid */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <div style={styles.statNum}>12</div>
            <div style={styles.statLabel}>{lang === "hi" ? "रिपोर्ट्स" : "Reports"}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNum}>6</div>
            <div style={styles.statLabel}>{lang === "hi" ? "हल किया" : "Resolved"}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNum}>4.8 ★</div>
            <div style={styles.statLabel}>{lang === "hi" ? "रेटिंग" : "Rating"}</div>
          </div>
        </div>
      </div>

      {/* Profile Options List */}
      <div style={styles.menuCard}>
        <button style={styles.menuItem}>
          <div style={styles.menuLeft}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span style={styles.menuText}>{lang === "hi" ? "प्रोफ़ाइल संपादित करें" : "Edit Profile"}</span>
          </div>
          <span style={styles.arrow}>›</span>
        </button>

        <button style={styles.menuItem}>
          <div style={styles.menuLeft}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={styles.menuText}>{lang === "hi" ? "उपलब्धियां" : "Achievements"}</span>
          </div>
          <span style={styles.arrow}>›</span>
        </button>

        <button style={styles.menuItem}>
          <div style={styles.menuLeft}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span style={styles.menuText}>{lang === "hi" ? "सहायता एवं समर्थन" : "Help & Support"}</span>
          </div>
          <span style={styles.arrow}>›</span>
        </button>

        <button style={{ ...styles.menuItem, borderBottom: "none" }}>
          <div style={styles.menuLeft}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span style={{ ...styles.menuText, color: "var(--danger)" }}>{lang === "hi" ? "लॉग आउट" : "Logout"}</span>
          </div>
          <span style={{ ...styles.arrow, color: "var(--danger)" }}>›</span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 600,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  card: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  avatarWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    backgroundColor: "var(--primary)",
    color: "#fff",
    fontSize: 24,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(10, 25, 47, 0.25)",
  },
  name: {
    fontSize: 20,
    fontWeight: 800,
    color: "var(--text)",
    margin: "0 0 4px 0",
  },
  role: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0F172A",
    margin: "0 0 2px 0",
  },
  memberSince: {
    fontSize: 12,
    color: "var(--text-muted)",
    margin: "0 0 20px 0",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    paddingTop: 16,
    borderTop: "1px solid var(--border)",
  },
  statBox: {
    backgroundColor: "var(--surface-subtle)",
    borderRadius: 12,
    padding: "12px 8px",
  },
  statNum: {
    fontSize: 20,
    fontWeight: 800,
    color: "var(--text)",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "var(--text-muted)",
    fontWeight: 600,
  },
  menuCard: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
  },
  menuItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.15s ease",
  },
  menuLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text)",
  },
  arrow: {
    fontSize: 20,
    color: "var(--text-light)",
    fontWeight: 400,
  },
};
