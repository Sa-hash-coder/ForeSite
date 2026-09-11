"use client";

import React from "react";
import { useLanguage } from "@/app/lib/LanguageContext";

interface Props {
  variant?: "header" | "pill" | "badge" | "bottom-nav" | "compact";
  className?: string;
  style?: React.CSSProperties;
}

export default function LanguageSwitchButton({ variant = "header", className = "", style = {} }: Props) {
  const { lang, toggleLanguage } = useLanguage();

  if (variant === "bottom-nav") {
    return (
      <button
        onClick={toggleLanguage}
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          padding: "6px 8px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          transition: "all 0.15s ease",
          ...style,
        }}
        title="भाषा बदलें / Switch Language"
        aria-label="Switch Language"
      >
        <span style={{ fontSize: 18, lineHeight: 1, marginBottom: 3 }}>🌐</span>
        <span>{lang === "en" ? "हिंदी" : "Eng"}</span>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={toggleLanguage}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 20,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text)",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.15s ease",
          ...style,
        }}
        title="भाषा बदलें / Switch Language"
        aria-label="Switch Language"
      >
        <span style={{ fontSize: 14 }}>🌐</span>
        <span>{lang === "en" ? "हिंदी" : "EN"}</span>
      </button>
    );
  }

  // Default "header" / "pill" style
  return (
    <button
      onClick={toggleLanguage}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--text)",
        fontSize: 13,
        fontWeight: 700,
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
        ...style,
      }}
      title="भाषा बदलें / Switch Language (Hindi / English)"
      aria-label="Switch Language"
    >
      <span style={{ fontSize: 15 }}>🌐</span>
      <span style={{ color: "var(--primary)" }}>
        {lang === "en" ? "हिंदी" : "English"}
      </span>
      <span
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          background: "var(--primary-light)",
          color: "var(--primary)",
          padding: "1px 6px",
          borderRadius: 6,
          fontWeight: 800,
        }}
      >
        {lang === "en" ? "HI" : "EN"}
      </span>
    </button>
  );
}
