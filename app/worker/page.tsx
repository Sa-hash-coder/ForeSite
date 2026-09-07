"use client";

import Link from "next/link";
import { MOCK_USER, MOCK_REPORTS } from "@/app/lib/mockData";
import StatusBadge from "@/app/components/StatusBadge";
import RiskBadge from "@/app/components/RiskBadge";

export default function WorkerDashboard() {
  const user = MOCK_USER;
  const reports = MOCK_REPORTS;

  const total = reports.length;
  const pending = reports.filter((r) =>
    ["pending_analysis", "under_review", "action_assigned"].includes(r.status)
  ).length;
  const resolved = reports.filter((r) => ["resolved", "closed"].includes(r.status)).length;
  const recent = reports.slice(0, 5);

  return (
    <div>
      {/* Greeting */}
      <div style={s.greeting}>
        <h1 style={s.greetingText}>Hello, {user.name.split(" ")[0]} 👋</h1>
        <p style={s.greetingSubtext}>
          {user.department ? `Department: ${user.department}` : "Safety starts with you."}
        </p>
      </div>

      {/* Quick action */}
      <Link href="/worker/submit" style={s.bigButton}>
        <span style={{ fontSize: "22px" }}>📋</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: "16px" }}>Report a Safety Issue</div>
          <div style={{ fontSize: "13px", color: "#bfdbfe", marginTop: "2px" }}>
            Tap here to submit a new report
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: "var(--primary)" }}>{total}</div>
          <div style={s.statLabel}>Total Reports</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: "var(--warning)" }}>{pending}</div>
          <div style={s.statLabel}>In Progress</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: "var(--success)" }}>{resolved}</div>
          <div style={s.statLabel}>Resolved</div>
        </div>
      </div>

      {/* Recent reports */}
      <div>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Recent Reports</h2>
          <Link href="/worker/reports" style={s.seeAll}>See All →</Link>
        </div>

        {recent.map((r) => (
          <Link href={`/worker/reports/${r._id}`} key={r._id} style={s.reportCard}>
            <div style={s.reportTop}>
              <span style={s.reportTitle}>{r.title}</span>
              <StatusBadge status={r.status} />
            </div>
            <div style={s.reportMeta}>
              <span>📍 {r.location}</span>
              <span>•</span>
              <span>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              {r.riskAssessment && (
                <>
                  <span>•</span>
                  <RiskBadge level={r.riskAssessment.riskLevel} />
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  greeting: { marginBottom: "20px" },
  greetingText: { fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" },
  greetingSubtext: { color: "var(--text-muted)", fontSize: "14px" },
  bigButton: {
    display: "flex", alignItems: "center", gap: "14px",
    backgroundColor: "var(--primary)", color: "#fff", textDecoration: "none",
    padding: "18px 20px", borderRadius: "8px", marginBottom: "20px",
  },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" },
  statCard: { backgroundColor: "#fff", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", textAlign: "center" },
  statNum: { fontSize: "28px", fontWeight: 700, lineHeight: 1, marginBottom: "4px" },
  statLabel: { fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  sectionTitle: { fontSize: "16px", fontWeight: 700, color: "var(--text)" },
  seeAll: { color: "var(--primary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 },
  reportCard: {
    display: "block", backgroundColor: "#fff", border: "1px solid var(--border)",
    borderRadius: "8px", padding: "14px 16px", marginBottom: "10px",
    textDecoration: "none", color: "inherit",
  },
  reportTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" },
  reportTitle: { fontSize: "15px", fontWeight: 600, color: "var(--text)", flex: 1 },
  reportMeta: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap" },
};
