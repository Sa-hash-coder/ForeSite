"use client";

import { useLanguage } from "@/app/lib/LanguageContext";

type StatusKey =
  | "pending_analysis"
  | "analysis_complete"
  | "under_review"
  | "action_assigned"
  | "resolved"
  | "closed";

const STATUS_STYLE: Record<StatusKey, { color: string; bg: string }> = {
  pending_analysis: { color: "#92400e", bg: "#fef3c7" },
  analysis_complete: { color: "#1e40af", bg: "#dbeafe" },
  under_review: { color: "#6b21a8", bg: "#f3e8ff" },
  action_assigned: { color: "#c2410c", bg: "#ffedd5" },
  resolved: { color: "#15803d", bg: "#dcfce7" },
  closed: { color: "#374151", bg: "#f3f4f6" },
};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const key = status as StatusKey;
  const label = t.status[key] || status;
  const style = STATUS_STYLE[key] || { color: "#374151", bg: "#f3f4f6" };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        color: style.color,
        backgroundColor: style.bg,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
