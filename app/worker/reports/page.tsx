"use client";

import { useState, useEffect } from "react";
import { getMyReportsApi } from "@/app/lib/api";
import Link from "next/link";
import { MOCK_REPORTS } from "@/app/lib/mockData";
import { useLanguage } from "@/app/lib/LanguageContext";
import StatusBadge from "@/app/components/StatusBadge";
import DangerBadge from "@/app/components/DangerBadge";

export default function MyReportsPage() {
  const { lang, t } = useLanguage();
  const [reports, setReports] = useState<any[]>(MOCK_REPORTS);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await getMyReportsApi();
        if (res.data && res.data.length > 0) {
          setReports(res.data);
        }
      } catch (err) {
        console.warn("Using cached reports:", err);
      }
    }
    loadReports();
  }, []);
  const [filter, setFilter] = useState("");

  const statusFilters = [
    { value: "", label: lang === "hi" ? "सभी (All)" : "All" },
    { value: "action_assigned", label: t.status.action_assigned },
    { value: "under_review", label: t.status.under_review },
    { value: "resolved", label: t.status.resolved },
  ];

  const filtered = filter
    ? reports.filter((r) => r.status === filter)
    : reports;

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>{t.myReports}</h1>
        <Link href="/worker/submit" className="apple-btn" style={s.newBtn}>+ {t.reportIssue}</Link>
      </div>

      {/* Status filter chips */}
      <div style={s.filterRow}>
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="apple-pill"
            style={{
              ...s.filterChip,
              ...(filter === f.value ? s.filterChipActive : {}),
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="apple-card animate-apple-scale-in" style={s.emptyBox}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>📭</p>
          <p style={{ fontWeight: 600, color: "var(--text)" }}>
            {t.noReportsYet}
          </p>
        </div>
      )}

      {filtered.map((r, idx) => {
        const displayTitle = lang === "hi" && r.titleHi ? r.titleHi : r.title;
        const displayLocation = lang === "hi" && r.locationHi ? r.locationHi : r.location;
        const delayClass = `delay-${(idx % 4) + 1}`;

        return (
          <Link href={`/worker/reports/${r._id}`} key={r._id} className={`apple-card animate-apple-fade-up ${delayClass}`} style={s.card}>
            <div style={s.cardTop}>
              <span style={s.cardTitle}>{displayTitle}</span>
              <StatusBadge status={r.status} />
            </div>

            <div style={s.cardMeta}>
              <span>📍 {displayLocation}</span>
              <span>•</span>
              <span>
                {new Date(r.createdAt).toLocaleDateString(
                  lang === "hi" ? "hi-IN" : "en-IN",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </span>
            </div>

            {r.riskAssessment && (
              <div style={s.dangerRow}>
                <DangerBadge level={r.riskAssessment.riskLevel} />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 800,
    color: "var(--text)",
  },
  newBtn: {
    backgroundColor: "#0A192F",
    color: "#fff",
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 700,
  },
  filterRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  filterChip: {
    border: "1.5px solid var(--border)",
    borderRadius: "20px",
    padding: "5px 12px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "var(--text-muted)",
  },
  filterChipActive: {
    backgroundColor: "#0A192F",
    borderColor: "#0A192F",
    color: "#ffffff",
    fontWeight: 700,
  },
  card: {
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
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "6px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--text)",
    flex: 1,
    lineHeight: 1.35,
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "var(--text-muted)",
    flexWrap: "wrap",
  },
  dangerRow: {
    marginTop: "10px",
    paddingTop: "8px",
    borderTop: "1px solid #f3f4f6",
  },
  emptyBox: {
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "40px 24px",
    textAlign: "center",
  },
};
