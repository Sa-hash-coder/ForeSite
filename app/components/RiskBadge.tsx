type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const RISK_MAP: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  LOW:      { color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  MEDIUM:   { color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  HIGH:     { color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  CRITICAL: { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
};

export default function RiskBadge({ level }: { level: string }) {
  const r = RISK_MAP[level as RiskLevel] ?? { color: "#374151", bg: "#f3f4f6", border: "#d1d5db" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: "4px",
        fontSize: "13px",
        fontWeight: 700,
        color: r.color,
        backgroundColor: r.bg,
        border: `1.5px solid ${r.border}`,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {level}
    </span>
  );
}
