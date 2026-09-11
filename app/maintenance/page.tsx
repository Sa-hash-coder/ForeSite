"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Radio,
  Lock,
  Search,
  Filter,
  Eye,
  FileCheck,
  Clock,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  X,
  FileText,
  AlertOctagon,
  ArrowRight
} from "lucide-react";

// ─── Interfaces ─────────────────────────────────────────────────────────────

type Severity = "critical" | "high" | "medium" | "low";
type OrderStatus = "dispatched" | "in_progress" | "clearance_submitted" | "officer_verified";

interface DispatchedOrder {
  id: string;
  orderNumber: string;
  title: string;
  equipmentId: string;
  equipmentName: string;
  location: string;
  zone: string;
  severity: Severity;
  status: OrderStatus;
  dispatchedBy: {
    name: string;
    role: string;
    badgeId: string;
  };
  safetyPermitId: string;
  assignedCrew: string;
  dispatchedAt: string;
  description: string;
  lotoRequired: boolean;
  telemetryTrigger?: {
    sensor: string;
    value: string;
    threshold: string;
  };
}

interface EquipmentNode {
  id: string;
  tag: string;
  name: string;
  type: string;
  severity: Severity;
  status: "operating" | "warning" | "critical";
  vibration: number; // mm/s
  temperature: number; // °C
  pressure: number; // PSI
  acousticIndex: number; // dB
  activeOrderId?: string;
}

interface LotoPermit {
  id: string;
  tagNumber: string;
  assetTag: string;
  assetName: string;
  isolationPoint: string;
  energyType: string;
  lockedByOfficer: string;
  crewLead: string;
  padlockId: string;
  status: "LOCKED_SAFE" | "PENDING_CLEARANCE";
}

// ─── Grounded Initial Data ──────────────────────────────────────────────────

const INITIAL_ORDERS: DispatchedOrder[] = [
  {
    id: "ord-001",
    orderNumber: "WO-9038",
    title: "TK-80 Scaffolding – Missing handrail & perimeter barrier replacement",
    equipmentId: "TK-80",
    equipmentName: "Crude Storage Tank & Scaffolding Tier 3",
    location: "Sector 4 North, Tank Farm",
    zone: "Zone TF-4",
    severity: "critical",
    status: "in_progress",
    dispatchedBy: {
      name: "Officer Vikram Sharma",
      role: "Lead Safety Supervisor",
      badgeId: "SAF-4019",
    },
    safetyPermitId: "PTW-2026-0881",
    assignedCrew: "Scaffolding & Rigging Team M-4",
    dispatchedAt: "12 min ago",
    description:
      "Frontline worker reported 3 meters of missing kickboards and outer handrail on elevated access tier. Fall hazard tier 1 (SIF Precursor). Immediate replacement and safety gate installation ordered.",
    lotoRequired: true,
  },
  {
    id: "ord-002",
    orderNumber: "WO-9039",
    title: "V-204 Hydrocracker – Radial vibration anomaly & bearing alignment",
    equipmentId: "V-204",
    equipmentName: "Hydrocracker Reactor Vessel Pump C",
    location: "Process Area 2, Hydro Unit",
    zone: "Zone PR-2",
    severity: "high",
    status: "dispatched",
    dispatchedBy: {
      name: "Officer Priya Patel",
      role: "Operations Incident Officer",
      badgeId: "SAF-2184",
    },
    safetyPermitId: "PTW-2026-0879",
    assignedCrew: "Rotating Machinery Team M-4",
    dispatchedAt: "28 min ago",
    description:
      "AI Sensor alert detected radial vibration spike exceeding 4.8 mm/s on pump bearing housing. Officer authorized immediate non-sparking inspection and dynamic balancing under LOTO isolation.",
    lotoRequired: true,
    telemetryTrigger: {
      sensor: "Radial Vibration Sensor B4",
      value: "4.8 mm/s",
      threshold: "2.5 mm/s max",
    },
  },
  {
    id: "ord-003",
    orderNumber: "WO-9040",
    title: "EX-12 Flange Line – Gasket integrity inspection & minor drip containment",
    equipmentId: "EX-12",
    equipmentName: "Heat Exchanger Flange Line B",
    location: "Cracking Platform East",
    zone: "Zone CP-1",
    severity: "medium",
    status: "dispatched",
    dispatchedBy: {
      name: "Officer Vikram Sharma",
      role: "Lead Safety Supervisor",
      badgeId: "SAF-4019",
    },
    safetyPermitId: "PTW-2026-0875",
    assignedCrew: "Piping & Valves Crew M-2",
    dispatchedAt: "1 hr ago",
    description:
      "Worker report logged minor oily condensation on lower flange joint during routine walkdown. Torque check and optical gas imaging required.",
    lotoRequired: false,
  },
  {
    id: "ord-004",
    orderNumber: "WO-9041",
    title: "P-101 Feed Pump – Scheduled preventive lubrication & seal clearance",
    equipmentId: "P-101",
    equipmentName: "Main Atmospheric Crude Feed Pump",
    location: "Crude Unit Intake",
    zone: "Zone CU-1",
    severity: "low",
    status: "dispatched",
    dispatchedBy: {
      name: "Officer Sunita Verma",
      role: "Compliance Inspector",
      badgeId: "SAF-3102",
    },
    safetyPermitId: "PTW-2026-0868",
    assignedCrew: "Lube Tech Crew M-1",
    dispatchedAt: "2 hr ago",
    description:
      "Periodic 500-hour bearing grease packing and mechanical seal barrier fluid check as mandated by OSHA 1910.",
    lotoRequired: false,
  },
];

const INITIAL_NODES: EquipmentNode[] = [
  { id: "node-tk80", tag: "TK-80", name: "Crude Storage Tank & Scaffolding", type: "Atmospheric Tank", severity: "critical", status: "critical", vibration: 0.8, temperature: 32, pressure: 14, acousticIndex: 35, activeOrderId: "WO-9038" },
  { id: "node-v204", tag: "V-204", name: "Hydrocracker Reactor Vessel", type: "Pressure Vessel", severity: "high", status: "warning", vibration: 4.8, temperature: 118, pressure: 145, acousticIndex: 78, activeOrderId: "WO-9039" },
  { id: "node-ex12", tag: "EX-12", name: "Heat Exchanger Flange Line", type: "Shell & Tube Exchanger", severity: "medium", status: "warning", vibration: 2.7, temperature: 94, pressure: 122, acousticIndex: 61, activeOrderId: "WO-9040" },
  { id: "node-p101", tag: "P-101", name: "Feed Pump 101", type: "Rotating Pump", severity: "low", status: "operating", vibration: 1.4, temperature: 54, pressure: 82, acousticIndex: 42, activeOrderId: "WO-9041" },
  { id: "node-fcc01", tag: "FCC-01", name: "Fluid Catalytic Cracking Unit", type: "Refinery Cracker", severity: "low", status: "operating", vibration: 1.9, temperature: 88, pressure: 110, acousticIndex: 49 },
  { id: "node-hdp02", tag: "HDP-02", name: "Hydro-Desulfurization Platform", type: "Platform & Piping", severity: "low", status: "operating", vibration: 1.1, temperature: 62, pressure: 95, acousticIndex: 39 },
];

const INITIAL_LOTO: LotoPermit[] = [
  { id: "lot-001", tagNumber: "LOTO-2026-041", assetTag: "TK-80", assetName: "Crude Storage Scaffolding Tier 3", isolationPoint: "Elevated Access Ladder Gate Lock", energyType: "Mechanical Fall Hazard", lockedByOfficer: "Officer Vikram Sharma", crewLead: "Devon Vance", padlockId: "PAD-RED-409", status: "LOCKED_SAFE" },
  { id: "lot-002", tagNumber: "LOTO-2026-042", assetTag: "V-204", assetName: "Hydrocracker Reactor Feed Pump C", isolationPoint: "Breaker CB-440B (480V Main MCC)", energyType: "Electrical (480V 3-Phase)", lockedByOfficer: "Officer Priya Patel", crewLead: "Devon Vance", padlockId: "PAD-RED-412", status: "LOCKED_SAFE" },
  { id: "lot-003", tagNumber: "LOTO-2026-043", assetTag: "EX-12", assetName: "Flange Line Isolation Block Valve", isolationPoint: "Block Valve BV-12-INLET", energyType: "Hydrocarbon Fluid / 120 PSI", lockedByOfficer: "Officer Vikram Sharma", crewLead: "Devon Vance", padlockId: "PAD-BLU-108", status: "LOCKED_SAFE" },
];

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<"desk" | "orders" | "telemetry" | "loto" | "clearance">("desk");
  const [orders, setOrders] = useState<DispatchedOrder[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<DispatchedOrder | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [clearanceNote, setClearanceNote] = useState<string>("");

  // Listen to sidebar tab change events
  useEffect(() => {
    const handleTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail as any);
      }
    };
    window.addEventListener("maintenance-tab-change", handleTab);
    return () => window.removeEventListener("maintenance-tab-change", handleTab);
  }, []);

  const handleUpdateStatus = (id: string, nextStatus: OrderStatus) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: nextStatus } : o)));
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
  };

  const handleSignOffClearance = (id: string) => {
    handleUpdateStatus(id, "clearance_submitted");
    setSelectedOrder(null);
    setClearanceNote("");
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "critical") return o.severity === "critical";
    if (orderFilter === "high") return o.severity === "high";
    if (orderFilter === "in_progress") return o.status === "in_progress";
    return true;
  }).filter((o) => {
    if (!searchQuery) return true;
    return (
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.equipmentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: "24px",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>

      {/* ─── 1. COMMAND HEADER ROW (Matching Officer Overview) ────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.5px" }}>
            Maintenance Operations Command
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "4px 0 0 0" }}>
            Real-time work orders dispatched by Safety Officers · Telemetry diagnostics &amp; LOTO clearance
          </p>
        </div>

        {/* View Mode Tabs */}
        <div style={{ display: "flex", backgroundColor: "var(--surface-subtle)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
          {[
            { id: "desk", label: "Operations Desk" },
            { id: "orders", label: `Work Orders (${orders.length})` },
            { id: "telemetry", label: "Fleet Telemetry" },
            { id: "loto", label: "LOTO Permits" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "8px 16px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "#0F172A" : "var(--text-muted)",
                backgroundColor: activeTab === tab.id ? "#FFFFFF" : "transparent",
                border: "none",
                cursor: "pointer",
                boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 2. TOP 4 KPI CARDS (Exact Officer Dashboard Architecture) ─ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        
        {/* Card 1: Active Work Orders */}
        <div style={{ ...cardStyle, borderTop: "4px solid #0A192F" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Active Work Orders
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>
                {orders.length}
              </div>
              <div style={{ fontSize: 12, color: "#15803D", marginTop: 8, fontWeight: 600 }}>
                1 in progress · 3 queued
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wrench style={{ width: 20, height: 20, color: "#0F172A" }} />
            </div>
          </div>
        </div>

        {/* Card 2: Critical Precursors */}
        <div style={{ ...cardStyle, borderTop: "4px solid #B91C1C" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Critical SIF Items
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#B91C1C", lineHeight: 1 }}>
                {orders.filter((o) => o.severity === "critical").length}
              </div>
              <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 8, fontWeight: 600 }}>
                High-priority fall &amp; leak risks
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle style={{ width: 20, height: 20, color: "#B91C1C" }} />
            </div>
          </div>
        </div>

        {/* Card 3: LOTO Isolations */}
        <div style={{ ...cardStyle, borderTop: "4px solid #EA580C" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Active LOTO Permits
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>
                {INITIAL_LOTO.length}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, fontWeight: 600 }}>
                100% Padlock compliance
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock style={{ width: 20, height: 20, color: "#EA580C" }} />
            </div>
          </div>
        </div>

        {/* Card 4: Verified Clearances */}
        <div style={{ ...cardStyle, borderTop: "4px solid #15803D" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Weekly Clearances
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#15803D", lineHeight: 1 }}>
                18
              </div>
              <div style={{ fontSize: 12, color: "#15803D", marginTop: 8, fontWeight: 600 }}>
                ↑ 100% OSHA 1910 sign-off
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 style={{ width: 20, height: 20, color: "#15803D" }} />
            </div>
          </div>
        </div>

      </div>

      {/* ─── 3. MAIN WORKSPACE BASED ON ACTIVE TAB ─────────────────────── */}
      {(activeTab === "desk" || activeTab === "orders") && (
        <div style={{ display: "grid", gridTemplateColumns: activeTab === "desk" ? "2fr 1fr" : "1fr", gap: 20 }} className="maintenance-content-grid">
          
          {/* LEFT: Dispatched Work Orders Queue */}
          <div style={cardStyle}>
            
            {/* Header + Filter Tools */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                  Officer Dispatches Queue
                </h3>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Prioritized by AI severity triage &amp; safety permits
                </span>
              </div>

              {/* Filter Pills */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {[
                  { id: "all", label: "All" },
                  { id: "critical", label: "Critical" },
                  { id: "high", label: "High" },
                  { id: "in_progress", label: "In Progress" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: orderFilter === f.id ? 700 : 500,
                      backgroundColor: orderFilter === f.id ? "#0A192F" : "var(--surface)",
                      color: orderFilter === f.id ? "#FFFFFF" : "var(--text-muted)",
                      border: `1px solid ${orderFilter === f.id ? "#0A192F" : "var(--border)"}`,
                      cursor: "pointer",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table / List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredOrders.map((order) => {
                const isCrit = order.severity === "critical";
                const isHigh = order.severity === "high";
                const sevColor = isCrit ? "#B91C1C" : isHigh ? "#EA580C" : "#CA8A04";
                const sevBg = isCrit ? "#FEF2F2" : isHigh ? "#FFF7ED" : "#FEFCE8";

                return (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: "#0F172A", padding: "2px 8px", backgroundColor: "var(--surface-subtle)", borderRadius: 6, border: "1px solid var(--border)" }}>
                          {order.orderNumber}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, backgroundColor: sevBg, color: sevColor, textTransform: "uppercase" }}>
                          {order.severity}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          Tag: <strong style={{ color: "var(--text)" }}>{order.equipmentId}</strong>
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-light)" }}>{order.dispatchedAt}</span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: "0 0 6px 0", lineHeight: 1.3 }}>
                        {order.title}
                      </h4>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                        {order.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 10, borderTop: "1px solid var(--surface-subtle)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                        <span>Officer: <strong style={{ color: "var(--text)" }}>{order.dispatchedBy.name}</strong></span>
                        <span>Permit: <code style={{ color: "#0A192F" }}>{order.safetyPermitId}</code></span>
                        {order.lotoRequired && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#EA580C", fontWeight: 700 }}>
                            <Lock style={{ width: 12, height: 12 }} /> LOTO Active
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {order.status === "dispatched" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "in_progress")}
                            style={{ padding: "6px 12px", backgroundColor: "#0A192F", color: "#FFFFFF", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}
                          >
                            Accept &amp; Begin Repair
                          </button>
                        )}
                        {order.status === "in_progress" && (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{ padding: "6px 12px", backgroundColor: "#15803D", color: "#FFFFFF", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}
                          >
                            Submit Hazard Clearance
                          </button>
                        )}
                        {order.status === "clearance_submitted" && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#15803D", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 style={{ width: 14, height: 14 }} /> Clearance Pending Officer Sign-Off
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: Telemetry Snapshot & Active LOTO */}
          {activeTab === "desk" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Active LOTO Energy Isolations */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Lock style={{ width: 16, height: 16, color: "#EA580C" }} />
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Active LOTO Isolations
                    </h3>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D" }}>OSHA 1910.147</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {INITIAL_LOTO.map((loto) => (
                    <div key={loto.id} style={{ backgroundColor: "var(--surface-subtle)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{loto.assetTag}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: "#FFF7ED", color: "#EA580C", padding: "2px 6px", borderRadius: 4 }}>
                          {loto.padlockId}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{loto.energyType}</div>
                      <div style={{ fontSize: 11, color: "var(--text-light)" }}>Locked by {loto.lockedByOfficer}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment Telemetry Alerts Snapshot */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Radio style={{ width: 16, height: 16, color: "#0F172A" }} />
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Plant Telemetry Nodes
                    </h3>
                  </div>
                  <button onClick={() => setActiveTab("telemetry")} style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }}>
                    View All →
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {INITIAL_NODES.slice(0, 4).map((node) => (
                    <div key={node.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, backgroundColor: "var(--surface-subtle)", border: "1px solid var(--border)" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>{node.tag} · {node.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          Vib: <strong style={{ color: node.vibration > 3 ? "#DC2626" : "inherit" }}>{node.vibration} mm/s</strong> · Temp: {node.temperature}°C
                        </div>
                      </div>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: node.status === "critical" ? "#DC2626" : node.status === "warning" ? "#EA580C" : "#15803D" }} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ─── 4. FULL FLEET TELEMETRY MATRIX TAB ───────────────────────── */}
      {activeTab === "telemetry" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                Equipment Fleet Telemetry Matrix
              </h3>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Continuous Modbus/OPC-UA vibration, thermal, and pressure sensors
              </span>
            </div>
            <button style={{ padding: "8px 14px", backgroundColor: "#0A192F", color: "white", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <RefreshCw style={{ width: 14, height: 14 }} /> Refresh Sensors
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            {INITIAL_NODES.map((node) => {
              const isCrit = node.status === "critical";
              const isWarn = node.status === "warning";
              const statusColor = isCrit ? "#DC2626" : isWarn ? "#EA580C" : "#15803D";

              return (
                <div key={node.id} style={{ backgroundColor: "var(--surface)", border: `1.5px solid ${isCrit ? "#FECACA" : "var(--border)"}`, borderRadius: 12, padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-light)", textTransform: "uppercase" }}>{node.type}</span>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: "2px 0 0 0" }}>
                        {node.tag} · {node.name}
                      </h4>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 6, backgroundColor: isCrit ? "#FEF2F2" : isWarn ? "#FFF7ED" : "#F0FDF4", color: statusColor }}>
                      {node.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "12px", backgroundColor: "var(--surface-subtle)", borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-light)", fontWeight: 700 }}>VIBRATION</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: node.vibration > 3 ? "#DC2626" : "var(--text)", marginTop: 2 }}>{node.vibration} mm/s</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-light)", fontWeight: 700 }}>TEMP</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{node.temperature}°C</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-light)", fontWeight: 700 }}>PRESSURE</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{node.pressure} PSI</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-light)", fontWeight: 700 }}>ACOUSTIC</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{node.acousticIndex} dB</div>
                    </div>
                  </div>

                  {node.activeOrderId && (
                    <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>Active Work Order: <strong style={{ color: "#0A192F" }}>{node.activeOrderId}</strong></span>
                      <button onClick={() => { setActiveTab("orders"); setOrderFilter("all"); }} style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", background: "none", border: "none", cursor: "pointer" }}>
                        View Order →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 5. FULL LOTO SAFETY PERMITS TAB ──────────────────────────── */}
      {activeTab === "loto" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                Lockout / Tagout (LOTO) Permit Registry
              </h3>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                OSHA 1910.147 Control of Hazardous Energy Safety Lock Handshakes
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}>
              ALL PADLOCKS ACCOUNTED FOR
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-light)" }}>
                  <th style={{ padding: "10px" }}>PERMIT TAG</th>
                  <th style={{ padding: "10px" }}>ASSET</th>
                  <th style={{ padding: "10px" }}>ISOLATION POINT</th>
                  <th style={{ padding: "10px" }}>ENERGY TYPE</th>
                  <th style={{ padding: "10px" }}>PADLOCK ID</th>
                  <th style={{ padding: "10px" }}>SAFETY OFFICER</th>
                  <th style={{ padding: "10px" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_LOTO.map((loto) => (
                  <tr key={loto.id} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
                    <td style={{ padding: "12px 10px", fontWeight: 700, fontFamily: "monospace" }}>{loto.tagNumber}</td>
                    <td style={{ padding: "12px 10px", fontWeight: 700 }}>{loto.assetTag}</td>
                    <td style={{ padding: "12px 10px", color: "var(--text-muted)" }}>{loto.isolationPoint}</td>
                    <td style={{ padding: "12px 10px" }}>{loto.energyType}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={{ padding: "2px 6px", borderRadius: 4, backgroundColor: "#FFF7ED", color: "#EA580C", fontWeight: 700, fontSize: 11 }}>
                        {loto.padlockId}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--text-muted)" }}>{loto.lockedByOfficer}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 10, backgroundColor: "#F0FDF4", color: "#15803D", fontWeight: 700, fontSize: 11 }}>
                        {loto.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 6. INTERACTIVE CLEARANCE SIGN-OFF MODAL ─────────────────── */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "rgba(11, 20, 38, 0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ width: "100%", maxWidth: 540, backgroundColor: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: 28 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#15803D", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  HAZARD MITIGATION SIGN-OFF
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", margin: "4px 0 0 0" }}>
                  {selectedOrder.orderNumber} · {selectedOrder.equipmentId}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div style={{ backgroundColor: "var(--surface-subtle)", padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 13, lineHeight: 1.5, color: "var(--text-muted)" }}>
              <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Work Order Scope:</div>
              {selectedOrder.title}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                Technician Clearance &amp; Repair Resolution Note:
              </label>
              <textarea
                required
                rows={3}
                value={clearanceNote}
                onChange={(e) => setClearanceNote(e.target.value)}
                placeholder="Describe corrective actions taken (e.g., replaced 3m handrail with OSHA-compliant steel guardrails, verified 200lb lateral load rating)..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, outline: "none", boxSizing: "border-box", backgroundColor: "var(--surface)", color: "var(--text)" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, backgroundColor: "#FEFCE8", border: "1px solid #FEF08A", marginBottom: 20, fontSize: 12, color: "#854D0E" }}>
              <ShieldCheck style={{ width: 18, height: 18, color: "#854D0E", flexShrink: 0 }} />
              <span>Digital clearance certifies that the physical hazard has been rectified and equipment is safe for officer verification.</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ flex: 1, padding: "11px", borderRadius: 8, backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", fontSize: 14, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSignOffClearance(selectedOrder.id)}
                style={{ flex: 2, padding: "11px", borderRadius: 8, backgroundColor: "#0A192F", color: "#FFFFFF", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <CheckCircle2 style={{ width: 16, height: 16 }} />
                Submit Hazard Clearance
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Responsive adjustments */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .maintenance-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
