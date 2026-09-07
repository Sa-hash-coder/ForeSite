type StatusKey =
  | "pending_analysis"
  | "analysis_complete"
  | "under_review"
  | "action_assigned"
  | "resolved"
  | "closed";

const STATUS_MAP: Record<StatusKey, { label: string; color: string; bg: string }> = {
  pending_analysis:  { label: "Checking...",      color: "#92400e", bg: "#fef3c7" },
  analysis_complete: { label: "AI Done",          color: "#1e40af", bg: "#dbeafe" },
  under_review:      { label: "Under Review",     color: "#7c3aed", bg: "#ede9fe" },
  action_assigned:   { label: "Action Assigned",  color: "#c2410c", bg: "#ffedd5" },
  resolved:          { label: "Resolved",         color: "#15803d", bg: "#dcfce7" },
  closed:            { label: "Closed",           color: "#374151", bg: "#f3f4f6" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status as StatusKey] ?? { label: status, color: "#374151", bg: "#f3f4f6" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 600,
        color: s.color,
        backgroundColor: s.bg,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}
