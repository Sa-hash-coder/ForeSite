"use client";

import { use } from "react";
import Link from "next/link";
import { MOCK_REPORT_DETAIL } from "@/app/lib/mockData";
import StatusBadge from "@/app/components/StatusBadge";
import RiskBadge from "@/app/components/RiskBadge";

const TASK_STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  verified: "Verified ✓",
};

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Get from mock data or fallback to first report
  const report = MOCK_REPORT_DETAIL[id] || Object.values(MOCK_REPORT_DETAIL)[0];

  if (!report) {
    return (
      <div style={s.errorBox}>
        <p>⚠ Report not found</p>
        <Link href="/worker/reports" style={s.backLink}>← Back to My Reports</Link>
      </div>
    );
  }

  const risk = report.riskAssessment;

  return (
    <div>
      <Link href="/worker/reports" style={s.backLink}>← Back to My Reports</Link>

      {/* Title card */}
      <div style={s.card}>
        <div style={s.titleRow}>
          <h1 style={s.title}>{report.title}</h1>
          <StatusBadge status={report.status} />
        </div>
        <div style={s.metaRow}>
          <span>📍 {report.location}</span>
          <span>•</span>
          <span style={{ textTransform: "capitalize" }}>{report.category.replace(/_/g, " ")}</span>
          <span>•</span>
          <span>{new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {/* Description */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>What you reported</h2>
        <p style={s.bodyText}>{report.description}</p>
        {report.imageUrl && (
          <div style={{ marginTop: "12px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={report.imageUrl} alt="Report photo" style={s.photo} />
          </div>
        )}
      </div>

      {/* AI Risk Assessment */}
      {risk ? (
        <div style={{ ...s.card, border: `1.5px solid ${riskBorderColor(risk.riskLevel)}` }}>
          <h2 style={s.sectionTitle}>Safety Check Result</h2>

          <div style={s.riskRow}>
            <div style={s.riskBlock}>
              <div style={s.riskNum}>{risk.riskScore}</div>
              <div style={s.riskNumLabel}>Risk Score (out of 100)</div>
            </div>
            <div>
              <RiskBadge level={risk.riskLevel} />
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                SIF Probability: {Math.round(risk.sifProbability * 100)}%
              </div>
            </div>
          </div>

          {risk.explanation && (
            <div style={s.explanationBox}>
              <p style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.7 }}>
                {risk.explanation}
              </p>
            </div>
          )}

          {risk.precursors && risk.precursors.length > 0 && (
            <div style={{ marginTop: "14px" }}>
              <p style={s.subLabel}>Hazard Signals Detected:</p>
              <ul style={s.list}>
                {risk.precursors.map((p, i) => (
                  <li key={i} style={s.listItem}>⚠ {p}</li>
                ))}
              </ul>
            </div>
          )}

          {risk.hazards && risk.hazards.length > 0 && (
            <div style={{ marginTop: "14px" }}>
              <p style={s.subLabel}>Type of Hazard:</p>
              <div style={s.hazardChips}>
                {risk.hazards.map((h, i) => (
                  <span key={i} style={s.hazardChip}>{h}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={s.pendingCard}>
          <span style={{ fontSize: "24px" }}>⏳</span>
          <div>
            <p style={{ fontWeight: 600, color: "var(--text)" }}>Safety check in progress</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              The report is being reviewed.
            </p>
          </div>
        </div>
      )}

      {/* Maintenance tasks */}
      {report.maintenanceTasks && report.maintenanceTasks.length > 0 && (
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Action Being Taken</h2>
          {report.maintenanceTasks.map((t) => (
            <div key={t._id} style={s.taskCard}>
              <div style={s.taskTop}>
                <span style={s.taskTitle}>{t.title}</span>
                <span style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "10px",
                  backgroundColor: "#f0fdf4",
                  color: "#15803d",
                }}>
                  {TASK_STATUS_LABELS[t.status] ?? t.status}
                </span>
              </div>
              {t.assignedTo && (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  👷 Assigned to: {t.assignedTo.name}
                </p>
              )}
              {t.dueDate && (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  📅 Due: {new Date(t.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function riskBorderColor(level: string): string {
  if (level === "CRITICAL") return "#fca5a5";
  if (level === "HIGH") return "#fdba74";
  if (level === "MEDIUM") return "#fcd34d";
  return "#86efac";
}

const s: Record<string, React.CSSProperties> = {
  backLink: {
    display: "inline-block",
    color: "var(--primary)",
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "none",
    marginBottom: "16px",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "10px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "var(--text)",
    flex: 1,
    lineHeight: 1.4,
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    fontSize: "13px",
    color: "var(--text-muted)",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: "10px",
  },
  bodyText: {
    fontSize: "15px",
    color: "var(--text)",
    lineHeight: 1.7,
  },
  photo: {
    width: "100%",
    maxHeight: "240px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid var(--border)",
  },
  riskRow: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "12px",
  },
  riskBlock: {
    textAlign: "center",
  },
  riskNum: {
    fontSize: "36px",
    fontWeight: 800,
    color: "var(--text)",
    lineHeight: 1,
  },
  riskNumLabel: {
    fontSize: "11px",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  explanationBox: {
    backgroundColor: "var(--bg)",
    borderRadius: "6px",
    padding: "12px",
    marginTop: "12px",
    borderLeft: "3px solid var(--primary)",
  },
  subLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--text-muted)",
    marginBottom: "6px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  listItem: {
    fontSize: "14px",
    color: "var(--text)",
    padding: "4px 0",
  },
  hazardChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  hazardChip: {
    backgroundColor: "#fff7ed",
    border: "1px solid #fdba74",
    color: "#c2410c",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 500,
  },
  pendingCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "#fffbeb",
    border: "1px solid #fcd34d",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
  },
  taskCard: {
    border: "1px solid var(--border)",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "8px",
  },
  taskTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
  taskTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text)",
    flex: 1,
  },
  errorBox: {
    backgroundColor: "var(--danger-light)",
    border: "1px solid #fca5a5",
    color: "var(--danger)",
    padding: "16px",
    borderRadius: "8px",
  },
};
