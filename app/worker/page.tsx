"use client";

import Link from "next/link";
import { MOCK_REPORTS } from "@/app/lib/mockData";
import { useLanguage } from "@/app/lib/LanguageContext";
import StatusBadge from "@/app/components/StatusBadge";
import DangerBadge from "@/app/components/DangerBadge";

export default function WorkerDashboard() {
  const { lang, t } = useLanguage();
  const reports = MOCK_REPORTS;

  const total = reports.length;
  const pending = reports.filter((r) =>
    ["pending_analysis", "under_review", "action_assigned"].includes(r.status)
  ).length;
  const resolved = reports.filter((r) => ["resolved", "closed"].includes(r.status)).length;
  const recent = reports.slice(0, 4);

  return (
    <div>
      {/* Friendly, clear greeting */}
      <div style={s.greeting}>
        <h1 style={s.greetingText}>{t.greeting}</h1>
        <p style={s.greetingSubtext}>{t.greetingSub}</p>
      </div>

      {/* Main Action Button - Large, Touch-Friendly */}
      <Link href="/worker/submit" style={s.bigButton}>
        <span style={{ fontSize: "28px" }}>🚨</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "0.01em" }}>
            {t.reportBtnTitle}
          </div>
          <div style={{ fontSize: "13px", color: "#dbeafe", marginTop: "3px" }}>
            {t.reportBtnSub}
          </div>
        </div>
      </Link>

      {/* Status counts */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: "var(--primary)" }}>{total}</div>
          <div style={s.statLabel}>{t.statTotal}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: "#d97706" }}>{pending}</div>
          <div style={s.statLabel}>{t.statPending}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: "#16a34a" }}>{resolved}</div>
          <div style={s.statLabel}>{t.statResolved}</div>
        </div>
      </div>

      {/* Recent reports list */}
      <div>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>{t.recentReports}</h2>
          <Link href="/worker/reports" style={s.seeAll}>{t.seeAll}</Link>
        </div>

        {recent.map((r) => {
          const displayTitle = lang === "hi" && r.titleHi ? r.titleHi : r.title;
          const displayLocation = lang === "hi" && r.locationHi ? r.locationHi : r.location;

          return (
            <Link href={`/worker/reports/${r._id}`} key={r._id} style={s.reportCard}>
              <div style={s.reportTop}>
                <span style={s.reportTitle}>{displayTitle}</span>
                <StatusBadge status={r.status} />
              </div>

              <div style={s.reportMeta}>
                <span>📍 {displayLocation}</span>
                <span>•</span>
                <span>
                  {new Date(r.createdAt).toLocaleDateString(
                    lang === "hi" ? "hi-IN" : "en-IN",
                    { day: "numeric", month: "short" }
                  )}
                </span>
              </div>

              {/* Clear danger level badge */}
              {r.riskAssessment && (
                <div style={s.dangerRow}>
                  <DangerBadge level={r.riskAssessment.riskLevel} />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  greeting: { marginBottom: "18px" },
  greetingText: { fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" },
  greetingSubtext: { color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.4 },
  bigButton: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    backgroundColor: "#1d4ed8",
    color: "#fff",
    textDecoration: "none",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(29, 78, 216, 0.2)",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "22px",
  },
  statCard: {
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "14px 10px",
    textAlign: "center",
  },
  statNum: { fontSize: "26px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" },
  statLabel: { fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  sectionTitle: { fontSize: "16px", fontWeight: 700, color: "var(--text)" },
  seeAll: { color: "#1d4ed8", textDecoration: "none", fontSize: "14px", fontWeight: 600 },
  reportCard: {
    display: "block",
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "14px 16px",
    marginBottom: "10px",
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  reportTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" },
  reportTitle: { fontSize: "15px", fontWeight: 700, color: "var(--text)", flex: 1, lineHeight: 1.35 },
  reportMeta: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap" },
  dangerRow: { marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #f3f4f6" },
};
