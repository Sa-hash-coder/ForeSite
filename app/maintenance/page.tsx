"use client";

import React, { useState, useEffect } from "react";
import { getTasksApi, updateTaskStatusApi } from "@/app/lib/api";
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
  ArrowRight,
  Check,
  Cpu
} from "lucide-react";

// ─── Types & Models ─────────────────────────────────────────────────────────

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
}

interface EquipmentNode {
  id: string;
  tag: string;
  name: string;
  type: string;
  status: "operating" | "warning" | "critical";
  vibration: number; // mm/s
  temperature: number; // °C
  pressure: number; // PSI
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
  padlockId: string;
  status: "LOCKED_SAFE" | "PENDING_CLEARANCE";
}

// ─── Data (Concise & Lightweight) ──────────────────────────────────────────

const INITIAL_ORDERS: DispatchedOrder[] = [
  {
    id: "ord-001",
    orderNumber: "WO-9038",
    title: "TK-80 Scaffolding – Missing handrail & safety barrier replacement",
    equipmentId: "TK-80",
    equipmentName: "Crude Storage Tank Scaffolding",
    location: "Sector 4 North, Tank Farm",
    zone: "Zone TF-4",
    severity: "critical",
    status: "in_progress",
    dispatchedBy: { name: "Vikram Sharma", role: "Safety Supervisor", badgeId: "SAF-4019" },
    safetyPermitId: "PTW-0881",
    assignedCrew: "Scaffolding Team M-4",
    dispatchedAt: "12m ago",
    description: "3 meters of kickboards and outer handrail missing on Tier 3 access. SIF precursor requiring immediate barrier installation.",
    lotoRequired: true,
  },
  {
    id: "ord-002",
    orderNumber: "WO-9039",
    title: "V-204 Hydrocracker – Radial vibration spike & bearing check",
    equipmentId: "V-204",
    equipmentName: "Hydrocracker Reactor Vessel Pump",
    location: "Process Area 2, Hydro Unit",
    zone: "Zone PR-2",
    severity: "high",
    status: "dispatched",
    dispatchedBy: { name: "Priya Patel", role: "Incident Officer", badgeId: "SAF-2184" },
    safetyPermitId: "PTW-0879",
    assignedCrew: "Rotating Machinery M-4",
    dispatchedAt: "28m ago",
    description: "Vibration sensor detected 4.8 mm/s anomaly on pump bearing. Dynamic balancing and inspection required.",
    lotoRequired: true,
  },
  {
    id: "ord-003",
    orderNumber: "WO-9040",
    title: "EX-12 Flange Line – Gasket inspection & minor drip containment",
    equipmentId: "EX-12",
    equipmentName: "Heat Exchanger Flange B",
    location: "Cracking Platform East",
    zone: "Zone CP-1",
    severity: "medium",
    status: "dispatched",
    dispatchedBy: { name: "Vikram Sharma", role: "Safety Supervisor", badgeId: "SAF-4019" },
    safetyPermitId: "PTW-0875",
    assignedCrew: "Piping Crew M-2",
    dispatchedAt: "1h ago",
    description: "Minor oily condensation detected on lower flange. Torque check and optical gas imaging needed.",
    lotoRequired: false,
  },
  {
    id: "ord-004",
    orderNumber: "WO-9041",
    title: "P-101 Feed Pump – 500-hr preventive lubrication & seal test",
    equipmentId: "P-101",
    equipmentName: "Crude Feed Pump",
    location: "Crude Intake",
    zone: "Zone CU-1",
    severity: "low",
    status: "dispatched",
    dispatchedBy: { name: "Sunita Verma", role: "Compliance Inspector", badgeId: "SAF-3102" },
    safetyPermitId: "PTW-0868",
    assignedCrew: "Lube Tech Crew M-1",
    dispatchedAt: "2h ago",
    description: "Periodic bearing grease packing and mechanical seal barrier fluid check as per OSHA 1910.",
    lotoRequired: false,
  },
];

const INITIAL_NODES: EquipmentNode[] = [
  { id: "tk80", tag: "TK-80", name: "Crude Storage Tank", type: "Storage Tank", status: "critical", vibration: 0.8, temperature: 32, pressure: 14, activeOrderId: "WO-9038" },
  { id: "v204", tag: "V-204", name: "Hydrocracker Pump", type: "Pressure Pump", status: "warning", vibration: 4.8, temperature: 118, pressure: 145, activeOrderId: "WO-9039" },
  { id: "ex12", tag: "EX-12", name: "Heat Exchanger B", type: "Heat Exchanger", status: "warning", vibration: 2.7, temperature: 94, pressure: 122, activeOrderId: "WO-9040" },
  { id: "p101", tag: "P-101", name: "Crude Feed Pump", type: "Feed Pump", status: "operating", vibration: 1.4, temperature: 54, pressure: 82, activeOrderId: "WO-9041" },
  { id: "fcc01", tag: "FCC-01", name: "Catalytic Cracker", type: "Cracking Unit", status: "operating", vibration: 1.9, temperature: 88, pressure: 110 },
  { id: "hdp02", tag: "HDP-02", name: "Hydro Platform", type: "Piping Rig", status: "operating", vibration: 1.1, temperature: 62, pressure: 95 },
];

const INITIAL_LOTO: LotoPermit[] = [
  { id: "lot-1", tagNumber: "LOTO-041", assetTag: "TK-80", assetName: "Crude Storage Tank", isolationPoint: "Ladder Access Barrier", energyType: "Mechanical Fall Risk", lockedByOfficer: "Vikram Sharma", padlockId: "PAD-409", status: "LOCKED_SAFE" },
  { id: "lot-2", tagNumber: "LOTO-042", assetTag: "V-204", assetName: "Hydrocracker Pump", isolationPoint: "MCC Breaker CB-440B", energyType: "Electrical 480V", lockedByOfficer: "Priya Patel", padlockId: "PAD-412", status: "LOCKED_SAFE" },
  { id: "lot-3", tagNumber: "LOTO-043", assetTag: "EX-12", assetName: "Heat Exchanger B", isolationPoint: "Block Valve BV-12", energyType: "Fluid / 120 PSI", lockedByOfficer: "Vikram Sharma", padlockId: "PAD-108", status: "LOCKED_SAFE" },
];

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<"desk" | "orders" | "telemetry" | "loto" | "clearance">("desk");
  const [orders, setOrders] = useState<DispatchedOrder[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<DispatchedOrder | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [clearanceNote, setClearanceNote] = useState<string>("");

  // Sync tab with layout events & load live tasks from DB
  useEffect(() => {
    const handleTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail as any);
      }
    };
    window.addEventListener("maintenance-tab-change", handleTab);

    async function loadTasks() {
      try {
        const res = await getTasksApi();
        if (res.data && res.data.length > 0) {
          const mapped: DispatchedOrder[] = res.data.map((t: any) => ({
            id: t._id,
            orderNumber: t.orderNumber || "WO-9038",
            title: t.title,
            equipmentId: t.equipmentId || "TK-80",
            equipmentName: t.equipmentName || "Plant Equipment",
            location: t.location || "Plant Sector 4",
            zone: t.zone || "Zone 4",
            severity: t.severity || "high",
            status: t.status || "dispatched",
            dispatchedBy: t.dispatchedBy || { name: "Officer Command", role: "Safety Lead", badgeId: "SAF-4019" },
            safetyPermitId: t.safetyPermitId || "PTW-2026-0881",
            assignedCrew: t.assignedCrew || "Maintenance Crew M-4",
            dispatchedAt: "Recently",
            description: t.description,
            lotoRequired: t.lotoRequired ?? true,
          }));
          setOrders(mapped);
        }
      } catch (err) {
        console.warn("Using local orders:", err);
      }
    }
    loadTasks();

    return () => window.removeEventListener("maintenance-tab-change", handleTab);
  }, []);

  const changeTab = (tabId: "desk" | "orders" | "telemetry" | "loto" | "clearance") => {
    setActiveTab(tabId);
    const event = new CustomEvent("maintenance-tab-change", { detail: tabId });
    window.dispatchEvent(event);
  };

  const handleUpdateStatus = async (id: string, nextStatus: OrderStatus, note?: string) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: nextStatus } : o)));
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
    try {
      await updateTaskStatusApi(id, nextStatus, note);
    } catch (err) {
      console.warn("Status update persisted locally:", err);
    }
  };

  const handleSignOffClearance = (id: string) => {
    handleUpdateStatus(id, "clearance_submitted", clearanceNote);
    setSelectedOrder(null);
    setClearanceNote("");
  };

  const filteredOrders = orders
    .filter((o) => {
      if (orderFilter === "critical") return o.severity === "critical";
      if (orderFilter === "high") return o.severity === "high";
      if (orderFilter === "in_progress") return o.status === "in_progress";
      if (orderFilter === "clearance_submitted") return o.status === "clearance_submitted";
      return true;
    })
    .filter((o) => {
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
    borderRadius: 12,
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 1200, margin: "0 auto" }}>

      {/* ─── 1. TOP COMMAND BAR ────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.4px" }}>
            Maintenance Command Center
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "3px 0 0 0" }}>
            Plant Sector 4 · Work Orders, LOTO Permits &amp; Sensor Telemetry
          </p>
        </div>

        {/* View Mode Navigation Pills */}
        <div style={{ display: "flex", backgroundColor: "var(--surface-subtle)", padding: 3, borderRadius: 8, border: "1px solid var(--border)" }}>
          {[
            { id: "desk", label: "Operations Desk" },
            { id: "orders", label: `Work Orders (${orders.length})` },
            { id: "telemetry", label: "Fleet Telemetry" },
            { id: "loto", label: "LOTO Permits" },
            { id: "clearance", label: "Sign-Off" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => changeTab(tab.id as any)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "#0A192F" : "var(--text-muted)",
                backgroundColor: activeTab === tab.id ? "#FFFFFF" : "transparent",
                border: "none",
                cursor: "pointer",
                boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 2. REFINED 4 KPI SUMMARY CARDS (Light & Scannable) ───────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        
        {/* KPI 1: Active Work Orders */}
        <div style={{ ...cardStyle, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Active Orders
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", lineHeight: 1.2, marginTop: 4 }}>
                {orders.length}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                1 in repair · 3 queued
              </div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wrench style={{ width: 17, height: 17, color: "#0A192F" }} />
            </div>
          </div>
        </div>

        {/* KPI 2: Critical Items */}
        <div style={{ ...cardStyle, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Critical SIF
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#B91C1C", lineHeight: 1.2, marginTop: 4 }}>
                {orders.filter((o) => o.severity === "critical").length}
              </div>
              <div style={{ fontSize: 11, color: "#B91C1C", marginTop: 4, fontWeight: 600 }}>
                Immediate action
              </div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle style={{ width: 17, height: 17, color: "#B91C1C" }} />
            </div>
          </div>
        </div>

        {/* KPI 3: LOTO Permits */}
        <div style={{ ...cardStyle, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                LOTO Permits
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", lineHeight: 1.2, marginTop: 4 }}>
                {INITIAL_LOTO.length}
              </div>
              <div style={{ fontSize: 11, color: "#15803D", marginTop: 4, fontWeight: 600 }}>
                100% Padlock secure
              </div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock style={{ width: 17, height: 17, color: "#EA580C" }} />
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Sign-Off */}
        <div style={{ ...cardStyle, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                OSHA Clearance
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#15803D", lineHeight: 1.2, marginTop: 4 }}>
                {orders.filter((o) => o.status === "in_progress" || o.status === "clearance_submitted").length}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Ready for verification
              </div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 style={{ width: 17, height: 17, color: "#15803D" }} />
            </div>
          </div>
        </div>

      </div>

      {/* ─── TAB 1: OPERATIONS DESK (Concise & Focused) ───────────────── */}
      {activeTab === "desk" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 16 }} className="maintenance-content-grid">
          
          {/* LEFT: Quick Action Work Orders */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                  Active Dispatches
                </h3>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Assigned safety tasks from field officers</span>
              </div>
              <button
                onClick={() => changeTab("orders")}
                style={{ fontSize: 12, fontWeight: 700, color: "#0A192F", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                View Full Queue ({orders.length}) <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orders.slice(0, 3).map((order) => {
                const isCrit = order.severity === "critical";
                const isHigh = order.severity === "high";
                const sevColor = isCrit ? "#B91C1C" : isHigh ? "#EA580C" : "#475569";
                const sevBg = isCrit ? "#FEF2F2" : isHigh ? "#FFF7ED" : "var(--surface-subtle)";

                return (
                  <div
                    key={order.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      backgroundColor: "var(--surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#0A192F", fontFamily: "monospace" }}>
                          {order.orderNumber}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, backgroundColor: sevBg, color: sevColor, textTransform: "uppercase" }}>
                          {order.severity}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>
                          {order.equipmentId}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {order.title}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 2 }}>
                        {order.location} · {order.assignedCrew}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {order.status === "dispatched" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "in_progress")}
                          style={{ padding: "6px 12px", backgroundColor: "#0A192F", color: "#FFFFFF", borderRadius: 6, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" }}
                        >
                          Accept
                        </button>
                      )}
                      {order.status === "in_progress" && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{ padding: "6px 12px", backgroundColor: "#15803D", color: "#FFFFFF", borderRadius: 6, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" }}
                        >
                          Sign-Off
                        </button>
                      )}
                      {order.status === "clearance_submitted" && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D", display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <CheckCircle2 size={13} /> Submitted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: LOTO Snapshot + Telemetry Quick View */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            
            {/* LOTO Summary */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock style={{ width: 14, height: 14, color: "#EA580C" }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>Active LOTO Locks</span>
                </div>
                <button onClick={() => changeTab("loto")} style={{ fontSize: 11, fontWeight: 700, color: "#0A192F", background: "none", border: "none", cursor: "pointer" }}>
                  All ({INITIAL_LOTO.length}) →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {INITIAL_LOTO.map((loto) => (
                  <div key={loto.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: 6, backgroundColor: "var(--surface-subtle)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{loto.assetTag}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#EA580C", backgroundColor: "#FFF7ED", padding: "1px 5px", borderRadius: 4 }}>
                        {loto.padlockId}
                      </span>
                      <span style={{ fontSize: 10, color: "#15803D", fontWeight: 700 }}>Safe</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sensor Quick Watch */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Radio style={{ width: 14, height: 14, color: "#0A192F" }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>Telemetry Watch</span>
                </div>
                <button onClick={() => changeTab("telemetry")} style={{ fontSize: 11, fontWeight: 700, color: "#0A192F", background: "none", border: "none", cursor: "pointer" }}>
                  All (6) →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {INITIAL_NODES.slice(0, 3).map((node) => (
                  <div key={node.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: 6, backgroundColor: "var(--surface-subtle)" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{node.tag} · {node.name.split(" ")[0]}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: node.vibration > 3 ? "#B91C1C" : "var(--text-muted)", fontWeight: 600 }}>
                        {node.vibration} mm/s
                      </span>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: node.status === "critical" ? "#DC2626" : node.status === "warning" ? "#EA580C" : "#15803D" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ─── TAB 2: WORK ORDERS QUEUE (Light & Filterable) ────────────── */}
      {activeTab === "orders" && (
        <div style={cardStyle}>
          {/* Header Controls */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[
                { id: "all", label: `All (${orders.length})` },
                { id: "critical", label: "Critical" },
                { id: "high", label: "High" },
                { id: "in_progress", label: "In Progress" },
                { id: "clearance_submitted", label: "Sign-Off Ready" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: orderFilter === f.id ? 700 : 500,
                    backgroundColor: orderFilter === f.id ? "#0A192F" : "var(--surface-subtle)",
                    color: orderFilter === f.id ? "#FFFFFF" : "var(--text-muted)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "var(--surface-subtle)", padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)" }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: "none", background: "none", fontSize: 12, outline: "none", color: "var(--text)", width: 140 }}
              />
            </div>
          </div>

          {/* Orders List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No work orders matching your filter.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isCrit = order.severity === "critical";
                const isHigh = order.severity === "high";
                const sevColor = isCrit ? "#B91C1C" : isHigh ? "#EA580C" : "#475569";
                const sevBg = isCrit ? "#FEF2F2" : isHigh ? "#FFF7ED" : "var(--surface-subtle)";

                return (
                  <div
                    key={order.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "14px 16px",
                      backgroundColor: "var(--surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: "#0A192F" }}>
                          {order.orderNumber}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, backgroundColor: sevBg, color: sevColor, textTransform: "uppercase" }}>
                          {order.severity}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
                          {order.equipmentId}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-light)" }}>· {order.dispatchedAt}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {order.lotoRequired && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#EA580C", display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Lock size={12} /> LOTO
                          </span>
                        )}
                        {order.status === "dispatched" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "in_progress")}
                            style={{ padding: "5px 12px", backgroundColor: "#0A192F", color: "#FFFFFF", borderRadius: 6, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" }}
                          >
                            Accept Repair
                          </button>
                        )}
                        {order.status === "in_progress" && (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{ padding: "5px 12px", backgroundColor: "#15803D", color: "#FFFFFF", borderRadius: 6, fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" }}
                          >
                            Sign-Off Clearance
                          </button>
                        )}
                        {order.status === "clearance_submitted" && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={13} /> Clearance Pending Review
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                      {order.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
                      {order.description}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-light)", display: "flex", gap: 14 }}>
                      <span>Officer: {order.dispatchedBy.name}</span>
                      <span>Permit: {order.safetyPermitId}</span>
                      <span>Crew: {order.assignedCrew}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: FLEET TELEMETRY (Clean Matrix) ────────────────────── */}
      {activeTab === "telemetry" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                Equipment Telemetry Matrix
              </h3>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Continuous vibration, thermal &amp; pressure readings</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#15803D", fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#15803D", display: "inline-block" }} />
              6 Sensored Nodes Live
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {INITIAL_NODES.map((node) => {
              const isCrit = node.status === "critical";
              const isWarn = node.status === "warning";
              const statusColor = isCrit ? "#DC2626" : isWarn ? "#EA580C" : "#15803D";
              const statusBg = isCrit ? "#FEF2F2" : isWarn ? "#FFF7ED" : "#F0FDF4";

              return (
                <div key={node.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "14px", backgroundColor: "var(--surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)" }}>{node.tag}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{node.name}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4, backgroundColor: statusBg, color: statusColor, textTransform: "uppercase" }}>
                      {node.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "8px 10px", backgroundColor: "var(--surface-subtle)", borderRadius: 6, textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-light)" }}>VIB</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: node.vibration > 3 ? "#DC2626" : "var(--text)", marginTop: 2 }}>{node.vibration} mm/s</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-light)" }}>TEMP</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{node.temperature}°C</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-light)" }}>PRESSURE</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{node.pressure} PSI</div>
                    </div>
                  </div>

                  {node.activeOrderId && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Linked: <strong style={{ color: "#0A192F" }}>{node.activeOrderId}</strong></span>
                      <button onClick={() => changeTab("orders")} style={{ fontSize: 11, fontWeight: 700, color: "#0A192F", background: "none", border: "none", cursor: "pointer" }}>
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

      {/* ─── TAB 4: LOTO SAFETY PERMITS (Clean Register) ──────────────── */}
      {activeTab === "loto" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                Lockout / Tagout (LOTO) Register
              </h3>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>OSHA 1910.147 Control of Hazardous Energy Checklist</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, backgroundColor: "#F0FDF4", color: "#15803D" }}>
              All 3 Locks Active &amp; Safe
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border)", color: "var(--text-light)" }}>
                  <th style={{ padding: "8px 10px" }}>PERMIT</th>
                  <th style={{ padding: "8px 10px" }}>ASSET</th>
                  <th style={{ padding: "8px 10px" }}>ISOLATION POINT</th>
                  <th style={{ padding: "8px 10px" }}>ENERGY HAZARD</th>
                  <th style={{ padding: "8px 10px" }}>PADLOCK #</th>
                  <th style={{ padding: "8px 10px" }}>OFFICER</th>
                  <th style={{ padding: "8px 10px" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_LOTO.map((loto) => (
                  <tr key={loto.id} style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
                    <td style={{ padding: "10px", fontWeight: 700, fontFamily: "monospace" }}>{loto.tagNumber}</td>
                    <td style={{ padding: "10px", fontWeight: 700 }}>{loto.assetTag}</td>
                    <td style={{ padding: "10px", color: "var(--text-muted)" }}>{loto.isolationPoint}</td>
                    <td style={{ padding: "10px" }}>{loto.energyType}</td>
                    <td style={{ padding: "10px" }}>
                      <span style={{ padding: "2px 6px", borderRadius: 4, backgroundColor: "#FFF7ED", color: "#EA580C", fontWeight: 700, fontSize: 11 }}>
                        {loto.padlockId}
                      </span>
                    </td>
                    <td style={{ padding: "10px", color: "var(--text-muted)" }}>{loto.lockedByOfficer}</td>
                    <td style={{ padding: "10px" }}>
                      <span style={{ padding: "2px 7px", borderRadius: 4, backgroundColor: "#F0FDF4", color: "#15803D", fontWeight: 700, fontSize: 10 }}>
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

      {/* ─── TAB 5: CLEARANCE SIGN-OFF (Dedicated OSHA Action Desk) ───── */}
      {activeTab === "clearance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                  Hazard Clearance Sign-Off Desk
                </h3>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Lead technician safety sign-off certifying physical repair before returning machinery to operation
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 4, backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                OSHA 1910 COMPLIANCE
              </span>
            </div>

            {/* In-Progress Items Ready For Clearance */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 10 }}>
                Pending Field Verification ({orders.filter((o) => o.status === "in_progress" || o.status === "clearance_submitted").length})
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {orders
                  .filter((o) => o.status === "in_progress" || o.status === "clearance_submitted")
                  .map((order) => (
                    <div
                      key={order.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "14px 16px",
                        backgroundColor: "var(--surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#0A192F", fontFamily: "monospace" }}>{order.orderNumber}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text)" }}>{order.equipmentId}</span>
                          <span style={{ fontSize: 11, color: "var(--text-light)" }}>· Assigned to {order.assignedCrew}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{order.title}</div>
                      </div>

                      <div>
                        {order.status === "in_progress" ? (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{ padding: "8px 16px", backgroundColor: "#15803D", color: "#FFFFFF", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                          >
                            <Check size={14} /> Sign Off Clearance
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#15803D", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={15} /> Clearance Awaiting Officer Verification
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Previously Cleared History */}
            <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 10 }}>
                Recently Cleared This Week (2)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 6, backgroundColor: "var(--surface-subtle)", fontSize: 12 }}>
                  <div>
                    <strong>WO-9035</strong> · Flare Stack Pressure Relief Valve Calibration
                    <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 2 }}>Certified by Devon Vance · PTW-0850</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#15803D", fontWeight: 700 }}>OSHA Signed</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 6, backgroundColor: "var(--surface-subtle)", fontSize: 12 }}>
                  <div>
                    <strong>WO-9032</strong> · Crude Transfer Line Safety Eyewash Station Flush
                    <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 2 }}>Certified by Devon Vance · PTW-0842</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#15803D", fontWeight: 700 }}>OSHA Signed</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── INTERACTIVE MODAL: HAZARD CLEARANCE SIGN-OFF ─────────────── */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "rgba(10, 25, 47, 0.6)", backdropFilter: "blur(4px)" }}>
          <div style={{ width: "100%", maxWidth: 500, backgroundColor: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", padding: 24 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#15803D", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  SAFETY CLEARANCE SIGN-OFF
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", margin: "3px 0 0 0" }}>
                  {selectedOrder.orderNumber} · {selectedOrder.equipmentId}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: "var(--surface-subtle)", padding: 12, borderRadius: 6, marginBottom: 14, fontSize: 12, lineHeight: 1.4, color: "var(--text)" }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Work Scope:</div>
              {selectedOrder.title}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
                Resolution Note (Required for OSHA Audit Trail):
              </label>
              <textarea
                required
                rows={3}
                value={clearanceNote}
                onChange={(e) => setClearanceNote(e.target.value)}
                placeholder="Detail physical repair completion (e.g., replaced 3m outer barrier with OSHA steel handrails)..."
                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, outline: "none", boxSizing: "border-box", backgroundColor: "var(--surface)", color: "var(--text)" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, backgroundColor: "#FEFCE8", border: "1px solid #FEF08A", marginBottom: 18, fontSize: 11, color: "#854D0E" }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>Certifies all physical repairs are complete and site is safe for officer verification.</span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ flex: 1, padding: "9px", borderRadius: 6, backgroundColor: "var(--surface)", border: "1px solid var(--border)", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSignOffClearance(selectedOrder.id)}
                style={{ flex: 2, padding: "9px", borderRadius: 6, backgroundColor: "#0A192F", color: "#FFFFFF", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <CheckCircle2 size={15} />
                Submit Clearance
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Responsive tweaks */}
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
