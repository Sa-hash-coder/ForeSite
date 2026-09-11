"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  HardHat, ShieldCheck, Wrench, ArrowRight, User, Lock,
  LogIn, UserPlus, X, Zap, BarChart2, Bell, FileCheck,
  Check, Activity, Cpu, Radio, ChevronRight
} from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";

type Role = "worker" | "officer" | "maintenance" | null;
type Tab = "login" | "signup";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 40);
    const id = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(id);
      } else {
        setVal(start);
      }
    }, 24);
    return () => clearInterval(id);
  }, [to]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function ForeSiteLanding() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [selectedRole, setSelectedRole] = useState<Role>("worker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const openAuth = (tab: Tab, role?: Role) => {
    setActiveTab(tab);
    if (role) setSelectedRole(role);
    setAuthOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (selectedRole === "worker") router.push("/worker");
    else if (selectedRole === "officer") router.push("/officer");
    else router.push("/worker");
    setIsLoading(false);
  };

  const navLinks = [
    { label: "Home", href: "#" },
    { label: "Portals", href: "#portals" },
    { label: "Features", href: "#features" },
    { label: "Stats", href: "#stats" },
  ];

  const portalCards = [
    {
      role: "worker" as Role,
      category: "FIELD OPERATIONS",
      icon: HardHat,
      title: "Field Worker Portal",
      description: "Hands-free safety reporting from the field. Engineered for high-noise and restricted zones.",
      capabilities: [
        "Multilingual voice transcription",
        "Photo hazard documentation",
        "Personal incident history tracking"
      ],
      linkText: "Open Field Worker Portal →",
    },
    {
      role: "officer" as Role,
      category: "SAFETY SUPERVISION",
      icon: ShieldCheck,
      title: "Safety Officer Desk",
      description: "Central command intelligence. Automated AI severity triage and direct work order dispatch.",
      capabilities: [
        "Site hazard density heatmap",
        "Direct work order dispatch",
        "OSHA compliance audit exports"
      ],
      linkText: "Open Safety Officer Desk →",
    },
    {
      role: "maintenance" as Role,
      category: "REPAIR & MITIGATION",
      icon: Wrench,
      title: "Maintenance Queue",
      description: "Direct repair execution queue. Log telemetry, assign crews, and certify hazard clearance.",
      capabilities: [
        "Prioritized repair work orders",
        "Equipment telemetry logs",
        "Verified hazard closure sign-off"
      ],
      linkText: "Open Maintenance Queue →",
    },
  ];

  const enterpriseFeatures = [
    {
      icon: Zap,
      title: "AI Severity Scoring",
      description: "Natural language analysis evaluates observations and assigns Low, Medium, High, or Critical risk tiers instantly."
    },
    {
      icon: Bell,
      title: "Sub-2s Alert Broadcast",
      description: "Immediate auditory siren and synthesized voice broadcasts propagate to personnel in affected site sectors."
    },
    {
      icon: BarChart2,
      title: "Command Analytics",
      description: "Zone risk heatmaps, frequency trends, and mean time to resolution (MTTR) metrics for operational oversight."
    },
    {
      icon: FileCheck,
      title: "Audit-Ready Exports",
      description: "Generate styled XML workbooks and RFC-compliant CSV files pre-formatted for regulatory and insurance audits."
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F7FA",
      color: "#111827",
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: "15px",
      lineHeight: "1.5",
    }}>

      {/* ─── 1. NAVBAR ────────────────────────────────────────── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "#FFFFFF",
        borderBottom: "1px solid #D9DEE7",
        height: "64px",
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 28px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#0F172A" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: "#0F172A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF"
              }}>
                <ShieldCheck style={{ width: "18px", height: "18px" }} strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>ForeSite</span>
            </a>

            {/* Nav Links */}
            <nav style={{ display: "flex", alignItems: "center", gap: "22px" }}>
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: item.label === "Home" ? "#1D4ED8" : "#475569",
                    textDecoration: "none",
                    transition: "color 0.15s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1D4ED8")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = item.label === "Home" ? "#1D4ED8" : "#475569")}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ThemeToggle />
            <button
              onClick={() => openAuth("login")}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                background: "#1D4ED8",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1E40AF")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1D4ED8")}
            >
              Log In
            </button>
            <button
              onClick={() => openAuth("signup")}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                background: "#FFFFFF",
                color: "#111827",
                fontSize: "14px",
                fontWeight: 600,
                border: "1px solid #D9DEE7",
                cursor: "pointer",
                transition: "border-color 0.15s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94A3B8")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D9DEE7")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION ─────────────────────────────────── */}
      <section style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #D9DEE7",
        padding: "88px 0 96px",
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 28px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "56px",
          alignItems: "center"
        }}>
          
          {/* LEFT COLUMN: Clean Enterprise Value Prop */}
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#1D4ED8",
              marginBottom: "16px"
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1D4ED8" }} />
              Industrial Safety Intelligence
            </div>

            <h1 style={{
              fontSize: "clamp(2.6rem, 5vw, 3.6rem)",
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "20px"
            }}>
              See the warning signs before they become incidents.
            </h1>

            <p style={{
              fontSize: "16px",
              color: "#475569",
              lineHeight: 1.65,
              maxWidth: "540px",
              marginBottom: "36px",
              fontWeight: 400
            }}>
              ForeSite connects frontline observations, AI-powered risk detection, and corrective action into one unified safety intelligence platform built for refinery and high-risk operations.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => openAuth("signup")}
                style={{
                  padding: "12px 24px",
                  borderRadius: "6px",
                  background: "#1D4ED8",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1E40AF")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#1D4ED8")}
              >
                Get Started <ArrowRight style={{ width: "16px", height: "16px" }} />
              </button>

              <a
                href="#portals"
                style={{
                  padding: "12px 22px",
                  borderRadius: "6px",
                  background: "#FFFFFF",
                  color: "#111827",
                  fontSize: "15px",
                  fontWeight: 600,
                  border: "1px solid #D9DEE7",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  transition: "border-color 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94A3B8")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D9DEE7")}
              >
                Explore Platform
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Industrial Safety Visual (Operational Site Schematic) */}
          <div style={{
            background: "#0F172A",
            borderRadius: "8px",
            border: "1px solid #1E293B",
            padding: "24px",
            color: "#F8FAFC",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          }}>
            {/* Header bar of the schematic terminal */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
              borderBottom: "1px solid #1E293B",
              marginBottom: "18px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity style={{ width: "16px", height: "16px", color: "#1D4ED8" }} />
                <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", color: "#E2E8F0" }}>
                  SITE TELEMETRY MONITOR · UNIT ALPHA
                </span>
              </div>
              <span style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#15803D",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#15803D" }} />
                ACTIVE
              </span>
            </div>

            {/* Schematic Grid Canvas */}
            <div style={{
              height: "170px",
              border: "1px solid #1E293B",
              borderRadius: "6px",
              background: "#090D16",
              position: "relative",
              overflow: "hidden",
              marginBottom: "18px",
              backgroundImage: "radial-gradient(#1E293B 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}>
              {/* Process piping lines */}
              <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                <line x1="15%" y1="35%" x2="85%" y2="35%" stroke="#1E293B" strokeWidth="2" />
                <line x1="45%" y1="35%" x2="45%" y2="75%" stroke="#1E293B" strokeWidth="2" />
                <line x1="45%" y1="75%" x2="80%" y2="75%" stroke="#1E293B" strokeWidth="2" />
                <rect x="22%" y="22%" width="46" height="36" fill="#131B2E" stroke="#334155" strokeWidth="1" rx="3" />
                <rect x="68%" y="22%" width="52" height="36" fill="#131B2E" stroke="#334155" strokeWidth="1" rx="3" />
                <rect x="62%" y="62%" width="56" height="32" fill="#131B2E" stroke="#334155" strokeWidth="1" rx="3" />
              </svg>

              {/* Node labels */}
              <div style={{ position: "absolute", top: "27px", left: "26%", fontSize: "9px", fontFamily: "monospace", color: "#94A3B8" }}>SEC-01</div>
              <div style={{ position: "absolute", top: "27px", left: "72%", fontSize: "9px", fontFamily: "monospace", color: "#94A3B8" }}>FCC-04</div>
              <div style={{ position: "absolute", top: "67px", left: "66%", fontSize: "9px", fontFamily: "monospace", color: "#94A3B8" }}>HYD-02</div>

              {/* Target Markers with Risk Status */}
              <div style={{ position: "absolute", top: "30%", left: "15%", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#15803D" }} />
                <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#94A3B8" }}>P-101</span>
              </div>
              <div style={{ position: "absolute", top: "28%", left: "54%", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EA580C" }} />
                <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#EA580C", fontWeight: 700 }}>V-204</span>
              </div>
              <div style={{ position: "absolute", top: "68%", left: "38%", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#B91C1C" }} />
                <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#F87171", fontWeight: 700 }}>TK-80</span>
              </div>
            </div>

            {/* 4 Risk Indicators Table */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              
              <div style={{
                background: "#131C2E",
                border: "1px solid #1E293B",
                borderRadius: "6px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>TK-80 Scaffolding</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#F87171" }}>CRITICAL</div>
                </div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#B91C1C" }} />
              </div>

              <div style={{
                background: "#131C2E",
                border: "1px solid #1E293B",
                borderRadius: "6px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>V-204 Hydrocracker</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#EA580C" }}>HIGH</div>
                </div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EA580C" }} />
              </div>

              <div style={{
                background: "#131C2E",
                border: "1px solid #1E293B",
                borderRadius: "6px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>EX-12 Flange Line</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#CA8A04" }}>MEDIUM</div>
                </div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#CA8A04" }} />
              </div>

              <div style={{
                background: "#131C2E",
                border: "1px solid #1E293B",
                borderRadius: "6px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>P-101 Feed Pump</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#15803D" }}>LOW</div>
                </div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#15803D" }} />
              </div>

            </div>

            {/* Footer metric line */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "12px",
              marginTop: "12px",
              borderTop: "1px solid #1E293B",
              fontSize: "11px",
              color: "#64748B"
            }}>
              <span>SURVEILLANCE: 4 OF 4 ZONES</span>
              <span>OSHA 1910 STANDARD</span>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 3. PORTAL SECTION ───────────────────────────────── */}
      <section id="portals" style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "80px 28px 72px"
      }}>
        <div style={{ marginBottom: "36px" }}>
          <div style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#1D4ED8",
            marginBottom: "8px"
          }}>
            SYSTEM ACCESS TIERS
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em" }}>
            Operational Portals
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px"
        }}>
          {portalCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                onClick={() => openAuth("login", card.role)}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D9DEE7",
                  borderRadius: "8px",
                  padding: "28px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  cursor: "pointer",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#94A3B8";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#D9DEE7";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
                }}
              >
                <div>
                  <div style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#64748B",
                    marginBottom: "14px"
                  }}>
                    {card.category}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      background: "#F1F5F9",
                      color: "#0F172A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Icon style={{ width: "18px", height: "18px" }} strokeWidth={2} />
                    </div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                      {card.title}
                    </h3>
                  </div>

                  <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "20px" }}>
                    {card.description}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {card.capabilities.map((cap) => (
                      <li key={cap} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#475569" }}>
                        <Check style={{ width: "14px", height: "14px", color: "#1D4ED8", flexShrink: 0 }} />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1D4ED8",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {card.linkText}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 4. CORE CAPABILITIES (Built for High-Risk Environments) ─ */}
      <section id="features" style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 28px 80px"
      }}>
        <div style={{ marginBottom: "36px" }}>
          <div style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#1D4ED8",
            marginBottom: "8px"
          }}>
            COMPREHENSIVE SITE PROTECTION
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em" }}>
            Built for high-risk industrial environments
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px"
        }}>
          {enterpriseFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D9DEE7",
                  borderRadius: "8px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)"
                }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px"
                }}>
                  <Icon style={{ width: "18px", height: "18px" }} strokeWidth={2} />
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                  {feat.title}
                </h4>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 5. STATS STRIP ──────────────────────────────────── */}
      <section id="stats" style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 28px 88px"
      }}>
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #D9DEE7",
          borderRadius: "8px",
          padding: "36px 32px"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "28px",
            textAlign: "center"
          }}>
            <div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: "#0F172A", lineHeight: 1, marginBottom: "8px" }}>
                <Counter to={2} suffix="s" />
              </div>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748B", fontWeight: 600 }}>
                Alert Broadcast Latency
              </div>
            </div>

            <div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: "#0F172A", lineHeight: 1, marginBottom: "8px" }}>
                <Counter to={100} suffix="%" />
              </div>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748B", fontWeight: 600 }}>
                OSHA 1910 Alignment
              </div>
            </div>

            <div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: "#0F172A", lineHeight: 1, marginBottom: "8px" }}>
                <Counter to={3} suffix="" />
              </div>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748B", fontWeight: 600 }}>
                Unified Role Access Tiers
              </div>
            </div>

            <div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: "#0F172A", lineHeight: 1, marginBottom: "8px" }}>
                <Counter to={10} suffix="+" />
              </div>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748B", fontWeight: 600 }}>
                Field Speech Languages
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. FOOTER ────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid #D9DEE7",
        background: "#FFFFFF",
        padding: "28px 0"
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "13px",
          color: "#64748B"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck style={{ width: "16px", height: "16px", color: "#1D4ED8" }} />
            <span style={{ fontWeight: 600, color: "#0F172A" }}>ForeSite Safety Systems</span>
            <span>· Industrial Intelligence Architecture</span>
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} style={{ color: "#64748B", textDecoration: "none" }}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ─── 7. AUTH MODAL (Restrained Enterprise Styling) ────── */}
      {authOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "rgba(15, 23, 42, 0.6)"
        }}>
          <div style={{
            width: "100%",
            maxWidth: "420px",
            background: "#FFFFFF",
            borderRadius: "8px",
            border: "1px solid #D9DEE7",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
            padding: "28px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                {activeTab === "login" ? "Operational Sign In" : "Register Credentials"}
              </h3>
              <button
                onClick={() => setAuthOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Tab switch */}
            <div style={{ display: "flex", background: "#F1F5F9", borderRadius: "6px", padding: "3px", marginBottom: "20px" }}>
              <button
                onClick={() => setActiveTab("login")}
                style={{
                  flex: 1,
                  padding: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  background: activeTab === "login" ? "#FFFFFF" : "transparent",
                  color: activeTab === "login" ? "#0F172A" : "#64748B",
                  boxShadow: activeTab === "login" ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                style={{
                  flex: 1,
                  padding: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  background: activeTab === "signup" ? "#FFFFFF" : "transparent",
                  color: activeTab === "signup" ? "#0F172A" : "#64748B",
                  boxShadow: activeTab === "signup" ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
                }}
              >
                Create Account
              </button>
            </div>

            {/* Role selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" }}>
              {[
                { r: "worker" as Role, label: "Worker", icon: HardHat },
                { r: "officer" as Role, label: "Officer", icon: ShieldCheck },
                { r: "maintenance" as Role, label: "Maintain", icon: Wrench },
              ].map(({ r, label, icon: Icon }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  style={{
                    padding: "10px 6px",
                    borderRadius: "6px",
                    border: selectedRole === r ? "1px solid #1D4ED8" : "1px solid #D9DEE7",
                    background: selectedRole === r ? "#EFF6FF" : "#FFFFFF",
                    color: selectedRole === r ? "#1D4ED8" : "#475569",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 600
                  }}
                >
                  <Icon style={{ width: "16px", height: "16px" }} />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {activeTab === "signup" && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1px solid #D9DEE7",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Corporate Site Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@refinery.com"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #D9DEE7",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #D9DEE7",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: "6px",
                  padding: "11px",
                  borderRadius: "6px",
                  background: "#1D4ED8",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1E40AF")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#1D4ED8")}
              >
                {isLoading ? "Validating Credentials..." : activeTab === "login" ? "Enter Operational Portal" : "Complete Registration"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
