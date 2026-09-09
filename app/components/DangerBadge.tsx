"use client";

import { useLanguage } from "@/app/lib/LanguageContext";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const RISK_CONFIG: Record<
  RiskLevel,
  {
    bg: string;
    border: string;
    text: string;
    icon: string;
  }
> = {
  LOW: {
    bg: "#f0fdf4",
    border: "#86efac",
    text: "#15803d",
    icon: "🟢",
  },
  MEDIUM: {
    bg: "#fefce8",
    border: "#fde047",
    text: "#a16207",
    icon: "🟡",
  },
  HIGH: {
    bg: "#fff7ed",
    border: "#fdba74",
    text: "#c2410c",
    icon: "🟠",
  },
  CRITICAL: {
    bg: "#fef2f2",
    border: "#fca5a5",
    text: "#b91c1c",
    icon: "🔴",
  },
};

export default function DangerBadge({
  level,
  showSubtext = false,
}: {
  level: string;
  showSubtext?: boolean;
}) {
  const { t } = useLanguage();
  const normalizedLevel = (level?.toUpperCase() || "LOW") as RiskLevel;
  const cfg = RISK_CONFIG[normalizedLevel] || RISK_CONFIG.LOW;
  const info = t.dangerLevels[normalizedLevel] || t.dangerLevels.LOW;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: "2px" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 700,
          color: cfg.text,
          backgroundColor: cfg.bg,
          border: `1.5px solid ${cfg.border}`,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          width: "fit-content",
        }}
      >
        <span>{cfg.icon}</span>
        <span>{info.label}</span>
      </span>
      {showSubtext && (
        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
          {info.sub}
        </span>
      )}
    </div>
  );
}
