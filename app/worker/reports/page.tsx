"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_REPORTS } from "@/app/lib/mockData";
import type { ReportSummary } from "@/app/lib/api";
import StatusBadge from "@/app/components/StatusBadge";
import RiskBadge from "@/app/components/RiskBadge";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending_analysis", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "action_assigned", label: "Action Assigned" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function MyReportsPage() {
  const [reports] = useState<ReportSummary[]>(MOCK_REPORTS);
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? reports.filter((r) => r.status === filter)
    : reports;

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>My Reports</h1>
        <Link href="/worker/submit" style={s.newBtn}>+ New Report</Link>
      </div>

      {/* Status filter chips */}
      <div style={s.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
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
        <div style={s.emptyBox}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>📭</p>
          <p style={{ fontWeight: 600, color: "var(--text)" }}>
            No reports with this status
          </p>
        </div>
      )}

      {filtered.map((r) => (
        <Link href={`/worker/reports/${r._id}`} key={r._id} style={s.card}>
          <div style={s.cardTop}>
            <span style={s.cardTitle}>{r.title}</span>
            <StatusBadge status={r.status} />
          </div>
          <div style={s.cardMeta}>
            <span>📍 {r.location}</span>
            <span>•</span>
            <span style={{ textTransform: "capitalize" }}>{r.category.replace(/_/g, " ")}</span>
            <span>•</span>
            <span>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          {r.riskAssessment && (
            <div style={s.riskRow}>
              <span style={s.riskLabel}>Risk Level:</span>
              <RiskBadge level={r.riskAssessment.riskLevel} />
              <span style={s.riskScore}>Score: {r.riskAssessment.riskScore}/100</span>
            </div>
          )}
        </Link>
      ))}
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
    fontWeight: 700,
    color: "var(--text)",
  },
  newBtn: {
    backgroundColor: "var(--primary)",
    color: "#fff",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 600,
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  filterChip: {
    border: "1.5px solid var(--border)",
    borderRadius: "20px",
    padding: "5px 14px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "var(--text-muted)",
  },
  filterChipActive: {
    backgroundColor: "var(--primary-light)",
    borderColor: "var(--primary)",
    color: "var(--primary)",
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
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "8px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "var(--text)",
    flex: 1,
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "var(--text-muted)",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  riskRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "6px",
    borderTop: "1px solid var(--border)",
    paddingTop: "8px",
  },
  riskLabel: {
    fontSize: "13px",
    color: "var(--text-muted)",
  },
  riskScore: {
    fontSize: "13px",
    color: "var(--text-muted)",
  },
  emptyBox: {
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "40px 24px",
    textAlign: "center",
  },
};
