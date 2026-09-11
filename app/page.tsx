"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  HardHat, ShieldCheck, Wrench, ArrowRight, User, Lock,
  LogIn, UserPlus, X, Zap, BarChart2, Bell, FileCheck,
  Check, Activity, Cpu, Radio, Menu, ChevronRight, FileText,
  TrendingUp, Users, Shield, ArrowUpRight
} from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";

type Role = "worker" | "officer" | "maintenance" | null;
type Tab = "login" | "signup";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 35);
    const id = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(id);
      } else {
        setVal(start);
      }
    }, 20);
    return () => clearInterval(id);
  }, [to]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function ForeSiteLanding() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    { label: "Home", href: "#", active: true },
    { label: "Platform", href: "#portals" },
    { label: "Features", href: "#features" },
    { label: "Solutions", href: "#portals" },
    { label: "Resources", href: "#features" },
    { label: "About", href: "#stats" },
  ];

  const portalCards = [
    {
      role: "worker" as Role,
      category: "FIELD OPERATIONS",
      icon: HardHat,
      title: "Field Worker Portal",
      description: "Hands-free safety reporting from the field. Engineered for high-noise and restricted industrial units.",
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
      description: "Central command intelligence. Automated AI severity triage, SIF precursor detection, and work order dispatch.",
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
      description: "Direct repair execution queue. Log telemetry, assign technical crews, and certify hazard clearance.",
      capabilities: [
        "Prioritized repair work orders",
        "Equipment telemetry logs",
        "Verified hazard closure sign-off"
      ],
      linkText: "Open Maintenance Queue →",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", color: "#111827", fontFamily: "system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>

      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, backgroundColor: "rgba(255,255,255,0.97)", backdropFilter: "blur(8px)", borderBottom: "1px solid #E2E8F0", width: "100%" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo + Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#0A192F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck style={{ width: 20, height: 20, color: "white" }} strokeWidth={2.4} />
              </div>
              <div>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", display: "block", lineHeight: 1.1, letterSpacing: "-0.5px" }}>ForeSite</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#64748B", letterSpacing: "0.16em", textTransform: "uppercase", display: "block", marginTop: 3 }}>SAFER OPERATIONS. BRIGHTER TOMORROW.</span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="hide-mobile">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  style={{
                    fontSize: 15,
                    fontWeight: item.active ? 700 : 500,
                    color: item.active ? "#0F172A" : "#475569",
                    textDecoration: "none",
                    position: "relative",
                    paddingBottom: 4,
                  }}
                >
                  {item.label}
                  {item.active && (
                    <span style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 2.5, backgroundColor: "#1D4ED8", borderRadius: 2 }} />
                  )}
                </a>
              ))}
            </nav>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <button
              onClick={() => openAuth("login")}
              style={{ padding: "9px 20px", fontSize: 14, fontWeight: 600, borderRadius: 6, color: "#0F172A", backgroundColor: "white", border: "1.5px solid #D9DEE7", cursor: "pointer" }}
              className="hide-mobile-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth("signup")}
              style={{ padding: "9px 22px", fontSize: 14, fontWeight: 700, borderRadius: 6, color: "white", backgroundColor: "#0A192F", border: "none", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
            >
              Get Started
            </button>
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              style={{ padding: "8px", borderRadius: 6, border: "1px solid #E2E8F0", color: "#475569", backgroundColor: "transparent", cursor: "pointer", display: "none" }}
              className="show-mobile"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileNavOpen && (
          <div style={{ borderTop: "1px solid #E2E8F0", backgroundColor: "white", padding: "12px 20px 24px" }}>
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 14px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: item.active ? 700 : 500,
                  color: item.active ? "#1D4ED8" : "#475569",
                  backgroundColor: item.active ? "#EFF6FF" : "transparent",
                  textDecoration: "none",
                  marginBottom: 4,
                }}
              >
                {item.label}
              </a>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid #F1F5F9" }}>
              <button onClick={() => { setMobileNavOpen(false); openAuth("login"); }} style={{ flex: 1, padding: "10px", fontSize: 14, fontWeight: 600, border: "1px solid #D9DEE7", borderRadius: 6, cursor: "pointer", backgroundColor: "white" }}>Sign In</button>
              <button onClick={() => { setMobileNavOpen(false); openAuth("signup"); }} style={{ flex: 1, padding: "10px", fontSize: 14, fontWeight: 700, border: "none", borderRadius: 6, cursor: "pointer", backgroundColor: "#0A192F", color: "white" }}>Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", width: "100%", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", overflow: "hidden" }}>

        {/* Refinery Background — covers full right 60%, very subtle */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: "35%",
            backgroundImage: "url('/refinery_bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.09,
            maskImage: "linear-gradient(to right, transparent 0%, black 40%, black 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 40%, black 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Engineer silhouette — extreme right only */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "18%",
            backgroundImage: "url('/engineer.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            opacity: 0.13,
            maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to left, black 0%, transparent 100%)",
            pointerEvents: "none",
          }}
          className="hide-mobile"
        />

        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 32px 80px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="hero-grid">

            {/* LEFT: Text Content */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>

              {/* Eyebrow */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748B" }}>
                  AI FOR A SAFER TOMORROW
                </span>
                <span style={{ width: 64, height: 1, backgroundColor: "#CBD5E1", display: "block" }} />
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: "clamp(2.6rem, 4vw, 3.8rem)",
                fontWeight: 900,
                color: "#0F172A",
                lineHeight: 1.06,
                letterSpacing: "-1.5px",
                marginBottom: 24,
              }}>
                Detect risks early.<br />
                Prevent serious incidents.
              </h1>

              {/* Subtext */}
              <p style={{ fontSize: "clamp(15px, 1.1vw, 17px)", color: "#475569", lineHeight: 1.7, maxWidth: 520, marginBottom: 36 }}>
                ForeSite uses AI and NLP to analyze unsafe-act, unsafe-condition and near-miss reports, helping identify Serious Injury &amp; Fatality (SIF) precursors before they escalate.
              </p>

              {/* Value Pillars */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 36px", marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Shield style={{ width: 22, height: 22, color: "#0F172A", flexShrink: 0 }} strokeWidth={2.2} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", lineHeight: 1.3 }}>Proactive Risk<br />Detection</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <BarChart2 style={{ width: 22, height: 22, color: "#0F172A", flexShrink: 0 }} strokeWidth={2.2} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", lineHeight: 1.3 }}>Data-Driven<br />Safety Insights</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Users style={{ width: 22, height: 22, color: "#0F172A", flexShrink: 0 }} strokeWidth={2.2} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", lineHeight: 1.3 }}>Safer People.<br />Stronger Operations.</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                <button
                  onClick={() => openAuth("signup")}
                  style={{ padding: "14px 32px", borderRadius: 8, backgroundColor: "#0A192F", color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(10,25,47,0.4)" }}
                >
                  Get Started <ArrowRight style={{ width: 18, height: 18 }} />
                </button>
                <a
                  href="#portals"
                  style={{ padding: "14px 28px", borderRadius: 8, backgroundColor: "white", color: "#0F172A", fontWeight: 700, fontSize: 16, border: "1.5px solid #D9DEE7", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                >
                  Explore Platform
                </a>
              </div>
            </div>

            {/* RIGHT: SCADA Site Safety Monitor */}
            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                width: "100%",
                maxWidth: 620,
                backgroundColor: "#0B1426",
                borderRadius: 16,
                border: "1px solid #1E2F4D",
                padding: "28px 28px 24px",
                color: "#F8FAFC",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 4px 20px rgba(0,0,0,0.2)",
              }}>

                {/* Header Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, borderBottom: "1px solid #1A2744", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Activity style={{ width: 18, height: 18, color: "#38BDF8" }} />
                    <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", color: "#E2E8F0", textTransform: "uppercase" }}>Site Safety Monitor</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block", boxShadow: "0 0 8px #10B981" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981", letterSpacing: "0.08em" }}>LIVE</span>
                  </div>
                </div>

                {/* P&ID Schematic + KPI Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 16, marginBottom: 20 }}>

                  {/* P&ID Schematic */}
                  <div style={{ backgroundColor: "#070E1A", borderRadius: 10, border: "1px solid #17243E", padding: 16, position: "relative", height: 190, overflow: "hidden" }}>
                    {/* Dot grid */}
                    <div style={{ position: "absolute", inset: 0, opacity: 0.2, backgroundImage: "radial-gradient(#334155 1px, transparent 1px)", backgroundSize: "13px 13px" }} />
                    {/* Pipes SVG */}
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                      <line x1="12%" y1="38%" x2="88%" y2="38%" stroke="#1E3A5F" strokeWidth="2.5" />
                      <line x1="50%" y1="38%" x2="50%" y2="80%" stroke="#1E3A5F" strokeWidth="2.5" />
                      <line x1="50%" y1="80%" x2="88%" y2="80%" stroke="#1E3A5F" strokeWidth="2.5" />
                      <rect x="63%" y="24%" width="52" height="28" fill="#0D1A30" stroke="#253858" strokeWidth="1.5" rx="4" />
                      <rect x="60%" y="66%" width="54" height="28" fill="#0D1A30" stroke="#253858" strokeWidth="1.5" rx="4" />
                    </svg>
                    <span style={{ position: "absolute", top: "18%", right: "11%", fontSize: 10, fontFamily: "monospace", color: "#94A3B8" }}>FCC-01</span>
                    <span style={{ position: "absolute", bottom: "12%", right: "11%", fontSize: 10, fontFamily: "monospace", color: "#94A3B8" }}>HDP-02</span>
                    {/* Nodes */}
                    <div style={{ position: "absolute", top: "31%", left: "8%", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }} />
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#CBD5E1" }}>P-101</span>
                    </div>
                    <div style={{ position: "absolute", top: "31%", left: "43%", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#F59E0B", display: "inline-block" }} />
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#F59E0B", fontWeight: 700 }}>V-204</span>
                    </div>
                    <div style={{ position: "absolute", top: "72%", left: "28%", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#EF4444", display: "inline-block" }} />
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#F87171", fontWeight: 700 }}>TK-80</span>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* KPI 1 */}
                    <div style={{ backgroundColor: "#0E182B", border: "1px solid #1A2744", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Reports</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#F8FAFC", marginTop: 2, lineHeight: 1 }}>
                          1,243 <span style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>↑ 12%</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 22 }}>
                        <span style={{ width: 5, height: 8, backgroundColor: "#1E293B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                        <span style={{ width: 5, height: 14, backgroundColor: "#1E293B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                        <span style={{ width: 5, height: 11, backgroundColor: "#1E293B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                        <span style={{ width: 5, height: 22, backgroundColor: "#10B981", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                      </div>
                    </div>
                    {/* KPI 2 */}
                    <div style={{ backgroundColor: "#0E182B", border: "1px solid #1A2744", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>SIF Precursors</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#F8FAFC", marginTop: 2, lineHeight: 1 }}>
                          18 <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 600 }}>↑ 5%</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 22 }}>
                        <span style={{ width: 5, height: 11, backgroundColor: "#1E293B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                        <span style={{ width: 5, height: 8, backgroundColor: "#1E293B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                        <span style={{ width: 5, height: 14, backgroundColor: "#1E293B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                        <span style={{ width: 5, height: 22, backgroundColor: "#EF4444", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                      </div>
                    </div>
                    {/* KPI 3 */}
                    <div style={{ backgroundColor: "#0E182B", border: "1px solid #1A2744", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>High Risk Items</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#F8FAFC", marginTop: 2, lineHeight: 1 }}>
                          7 <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>↑ 2%</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 22 }}>
                        <span style={{ width: 5, height: 6, backgroundColor: "#1E293B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                        <span style={{ width: 5, height: 11, backgroundColor: "#1E293B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                        <span style={{ width: 5, height: 15, backgroundColor: "#1E293B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                        <span style={{ width: 5, height: 22, backgroundColor: "#F59E0B", borderRadius: "2px 2px 0 0", display: "inline-block" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Findings */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748B" }}>Recent High-Risk Findings</span>
                    <a href="#portals" style={{ fontSize: 12, fontWeight: 600, color: "#38BDF8", textDecoration: "none" }}>View All →</a>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { level: "CRITICAL", color: "#EF4444", text: "TK-80 Scaffolding – Missing handrail", time: "12 min ago" },
                      { level: "HIGH", color: "#F97316", text: "V-204 Hydrocracker – Unusual vibration pattern", time: "28 min ago" },
                      { level: "MEDIUM", color: "#F59E0B", text: "EX-12 Flange Line – Minor leak observed", time: "1 hr ago" },
                      { level: "LOW", color: "#10B981", text: "P-101 Feed Pump – Routine maintenance due", time: "2 hr ago" },
                    ].map((row) => (
                      <div key={row.level} style={{ backgroundColor: "#08101E", border: "1px solid #162238", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: row.color, display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: row.color, width: 64, flexShrink: 0 }}>{row.level}</span>
                          <span style={{ fontSize: 12, color: "#CBD5E1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.text}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#64748B", flexShrink: 0, marginLeft: 8 }}>{row.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FEATURE RIBBON ──────────────────────────────────────────── */}
      <section id="features" style={{ backgroundColor: "white", borderBottom: "1px solid #E2E8F0", padding: "48px 0" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40 }} className="feature-grid">
            {[
              { icon: FileText, title: "Unified Safety Data", desc: "Ingest and analyze reports from across your organization." },
              { icon: Cpu, title: "AI-Powered Insights", desc: "Identify SIF precursors using advanced NLP models." },
              { icon: TrendingUp, title: "Actionable Intelligence", desc: "Prioritize risks and enable timely corrective action." },
              { icon: Users, title: "Built for High-Risk Sites", desc: "Designed for refineries, chemical plants, and heavy operations." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 22, height: 22, color: "#0F172A" }} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{title}</h4>
                  <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PORTALS SECTION ─────────────────────────────────────────── */}
      <section id="portals" style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#1D4ED8", display: "block", marginBottom: 10 }}>OPERATIONAL ACCESS TIERS</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.5px" }}>Three Portals, One Unified Platform</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }} className="portal-grid">
            {portalCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.role}
                  onClick={() => openAuth("login", card.role)}
                  style={{ backgroundColor: "white", border: "1px solid #D9DEE7", borderRadius: 14, padding: "36px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", flexDirection: "column", transition: "box-shadow 0.15s, border-color 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#94A3B8"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.09)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#D9DEE7"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748B", marginBottom: 16 }}>{card.category}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 22, height: 22, color: "#0F172A" }} strokeWidth={2} />
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>{card.title}</h3>
                  </div>
                  <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.65, marginBottom: 24 }}>{card.description}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {card.capabilities.map((cap) => (
                      <li key={cap} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#475569" }}>
                        <Check style={{ width: 16, height: 16, color: "#1D4ED8", flexShrink: 0 }} />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #F1F5F9", fontSize: 14, fontWeight: 700, color: "#1D4ED8" }}>
                    {card.linkText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─────────────────────────────────────────────── */}
      <section id="stats" style={{ paddingBottom: 80 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ backgroundColor: "white", border: "1px solid #D9DEE7", borderRadius: 14, padding: "56px 48px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }} className="stats-grid">
              {[
                { to: 2, suffix: "s", label: "Alert Latency" },
                { to: 100, suffix: "%", label: "OSHA 1910 Compliance" },
                { to: 3, suffix: "", label: "Operational Portals" },
                { to: 10, suffix: "+", label: "Speech Languages" },
              ].map(({ to, suffix, label }) => (
                <div key={label}>
                  <div style={{ fontSize: "clamp(2.5rem, 4vw, 3.8rem)", fontWeight: 900, color: "#0F172A", marginBottom: 8, letterSpacing: "-2px", lineHeight: 1 }}>
                    <Counter to={to} suffix={suffix} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #E2E8F0", backgroundColor: "white", padding: "28px 0" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <ShieldCheck style={{ width: 20, height: 20, color: "#0F172A" }} />
            <span style={{ fontWeight: 700, color: "#0F172A" }}>ForeSite Safety Systems</span>
            <span style={{ color: "#64748B" }}>· Safer Operations. Brighter Tomorrow.</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} style={{ fontSize: 14, color: "#64748B", textDecoration: "none", fontWeight: 500 }}>{item.label}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ─── AUTH MODAL ──────────────────────────────────────────────── */}
      {authOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "rgba(11,20,38,0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ width: "100%", maxWidth: 440, backgroundColor: "white", borderRadius: 14, border: "1px solid #D9DEE7", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>
                {activeTab === "login" ? "Operational Sign In" : "Register Site Credentials"}
              </h3>
              <button onClick={() => setAuthOpen(false)} style={{ padding: 4, borderRadius: 6, border: "none", backgroundColor: "transparent", cursor: "pointer", color: "#64748B" }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", backgroundColor: "#F1F5F9", borderRadius: 8, padding: 4, marginBottom: 24 }}>
              {(["login", "signup"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 13, fontWeight: activeTab === t ? 700 : 500, color: activeTab === t ? "#0F172A" : "#64748B", backgroundColor: activeTab === t ? "white" : "transparent", border: "none", cursor: "pointer", boxShadow: activeTab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Role Selector */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
              {([
                { r: "worker" as Role, label: "Worker", icon: HardHat },
                { r: "officer" as Role, label: "Officer", icon: ShieldCheck },
                { r: "maintenance" as Role, label: "Maintain", icon: Wrench },
              ]).map(({ r, label, icon: Icon }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  style={{ padding: "12px 8px", borderRadius: 8, border: `1.5px solid ${selectedRole === r ? "#1D4ED8" : "#D9DEE7"}`, backgroundColor: selectedRole === r ? "#EFF6FF" : "white", color: selectedRole === r ? "#1D4ED8" : "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                >
                  <Icon style={{ width: 20, height: 20 }} />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {activeTab === "signup" && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #D9DEE7", outline: "none", boxSizing: "border-box" }} />
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Corporate Site Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@refinery.com" style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #D9DEE7", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1.5px solid #D9DEE7", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{ width: "100%", padding: "13px", borderRadius: 8, backgroundColor: "#0A192F", color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", marginTop: 4 }}
              >
                {isLoading ? "Validating..." : activeTab === "login" ? "Enter Operational Portal" : "Complete Registration"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── RESPONSIVE STYLES ───────────────────────────────────────── */}
      <style>{`
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .feature-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 28px !important; }
          .portal-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .hero-grid { gap: 28px !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hide-mobile { display: none !important; }
          .hide-mobile-sm { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
          .hide-mobile-sm { display: inline-flex !important; }
        }
        @media (min-width: 1025px) {
          .hide-mobile { display: flex !important; }
        }
      `}</style>

    </div>
  );
}
