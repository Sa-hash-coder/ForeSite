"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingUp,
  FileText,
  Cpu,
  Users,
  Clock,
  Radio,
  Sliders,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Zap,
  Lock,
  Search,
  Filter,
  Eye,
  Camera,
  Layers,
  ArrowUpRight,
  HardHat,
  AlertOctagon,
  FileCheck,
} from "lucide-react";

// ─── Interfaces ─────────────────────────────────────────────────────────────

type Severity = "critical" | "high" | "medium" | "low";
type OrderStatus =
  | "dispatched"
  | "acknowledged"
  | "in_progress"
  | "clearance_submitted"
  | "officer_verified";

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
  timeAgo: string;
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
  status: "operating" | "warning" | "critical" | "maintenance";
  vibration: number; // mm/s
  temperature: number; // °C
  pressure: number; // PSI
  acousticIndex: number; // dB
  activeOrderId?: string;
  x: number; // SVG % coordinate
  y: number; // SVG % coordinate
}

interface LotoPermit {
  id: string;
  tagNumber: string;
  assetTag: string;
  assetName: string;
  isolationPoint: string;
  energyType: "Electrical (480V)" | "Hydraulic (150 PSI)" | "Chemical / Vapor" | "Pneumatic";
  lockedByOfficer: string;
  crewLead: string;
  padlockId: string;
  verifiedAt: string;
  status: "LOCKED_SAFE" | "PENDING_CLEARANCE";
}

// ─── Initial Grounded Mock Data ─────────────────────────────────────────────

const INITIAL_NODES: EquipmentNode[] = [
  {
    id: "node-p101",
    tag: "P-101",
    name: "Feed Pump 101",
    type: "Rotating Pump",
    severity: "low",
    status: "operating",
    vibration: 1.4,
    temperature: 54,
    pressure: 82,
    acousticIndex: 42,
    activeOrderId: "WO-9041",
    x: 18,
    y: 42,
  },
  {
    id: "node-v204",
    tag: "V-204",
    name: "Hydrocracker Reactor Vessel",
    type: "Pressure Vessel",
    severity: "high",
    status: "warning",
    vibration: 4.8,
    temperature: 118,
    pressure: 145,
    acousticIndex: 78,
    activeOrderId: "WO-9039",
    x: 52,
    y: 35,
  },
  {
    id: "node-tk80",
    tag: "TK-80",
    name: "Crude Storage Tank & Scaffolding",
    type: "Atmospheric Tank",
    severity: "critical",
    status: "critical",
    vibration: 0.8,
    temperature: 32,
    pressure: 14,
    acousticIndex: 35,
    activeOrderId: "WO-9038",
    x: 36,
    y: 75,
  },
  {
    id: "node-fcc01",
    tag: "FCC-01",
    name: "Fluid Catalytic Cracking Unit",
    type: "Refinery Cracker",
    severity: "low",
    status: "operating",
    vibration: 1.9,
    temperature: 88,
    pressure: 110,
    acousticIndex: 49,
    x: 82,
    y: 26,
  },
  {
    id: "node-hdp02",
    tag: "HDP-02",
    name: "Hydro-Desulfurization Platform",
    type: "Platform & Piping",
    severity: "low",
    status: "operating",
    vibration: 1.1,
    temperature: 62,
    pressure: 95,
    acousticIndex: 39,
    x: 68,
    y: 72,
  },
  {
    id: "node-ex12",
    tag: "EX-12",
    name: "Heat Exchanger Flange Line",
    type: "Shell & Tube Exchanger",
    severity: "medium",
    status: "warning",
    vibration: 2.7,
    temperature: 94,
    pressure: 122,
    acousticIndex: 61,
    activeOrderId: "WO-9040",
    x: 84,
    y: 74,
  },
];

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
    timeAgo: "12 min ago",
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
    timeAgo: "28 min ago",
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
    title: "EX-12 Flange Line – Gasket re-torque & cold seal verification",
    equipmentId: "EX-12",
    equipmentName: "Heat Exchanger Flange Line EX-12",
    location: "Utilities Corridor East",
    zone: "Zone UC-1",
    severity: "medium",
    status: "acknowledged",
    dispatchedBy: {
      name: "Officer Rohan Desai",
      role: "Industrial Hygiene Officer",
      badgeId: "SAF-7721",
    },
    safetyPermitId: "PTW-2026-0872",
    assignedCrew: "Piping & Flange Crew B",
    dispatchedAt: "1 hr ago",
    timeAgo: "1 hr ago",
    description:
      "Weep detected at line flange union. Chemical sniff test clear of volatile gases. Officer approved cold torque verification and sealant gasket ring replacement.",
    lotoRequired: true,
  },
  {
    id: "ord-004",
    orderNumber: "WO-9041",
    title: "P-101 Feed Pump – 500-hr lubrication check & seal inspection",
    equipmentId: "P-101",
    equipmentName: "Feed Pump 101 High Pressure Unit",
    location: "Boiler House Auxiliary Bay",
    zone: "Zone BH-1",
    severity: "low",
    status: "clearance_submitted",
    dispatchedBy: {
      name: "Safety Command Central Desk",
      role: "Automated Maintenance Dispatch",
      badgeId: "SYS-AUTO",
    },
    safetyPermitId: "PTW-2026-0865",
    assignedCrew: "Lubrication & Rotating Crew C",
    dispatchedAt: "2 hr ago",
    timeAgo: "2 hr ago",
    description:
      "Scheduled 500-hour bearing oil replenishment and seal inspection. Clearance checklist uploaded by crew, currently awaiting final Safety Officer inspection sign-off.",
    lotoRequired: false,
  },
];

const INITIAL_LOTO_PERMITS: LotoPermit[] = [
  {
    id: "loto-1",
    tagNumber: "LOTO-881",
    assetTag: "TK-80",
    assetName: "Crude Storage Tank Scaffolding",
    isolationPoint: "Feed Valve Isolation V-08 & Perimeter Barrier",
    energyType: "Hydraulic (150 PSI)",
    lockedByOfficer: "Officer Vikram Sharma (SAF-4019)",
    crewLead: "Devon Vance (Lead M-4)",
    padlockId: "MASTER-LOCK-RED-#441",
    verifiedAt: "10:14 AM Today",
    status: "LOCKED_SAFE",
  },
  {
    id: "loto-2",
    tagNumber: "LOTO-879",
    assetTag: "V-204",
    assetName: "Hydrocracker Reactor Vessel",
    isolationPoint: "480V Breaker Panel MCC-2, Circuit Breaker #14",
    energyType: "Electrical (480V)",
    lockedByOfficer: "Officer Priya Patel (SAF-2184)",
    crewLead: "Devon Vance (Lead M-4)",
    padlockId: "MASTER-LOCK-RED-#412",
    verifiedAt: "09:45 AM Today",
    status: "LOCKED_SAFE",
  },
  {
    id: "loto-3",
    tagNumber: "LOTO-872",
    assetTag: "EX-12",
    assetName: "Heat Exchanger Flange Line",
    isolationPoint: "Steam Supply Header Isolation Valve ST-12",
    energyType: "Chemical / Vapor",
    lockedByOfficer: "Officer Rohan Desai (SAF-7721)",
    crewLead: "Marcus Brody (Crew B)",
    padlockId: "MASTER-LOCK-YELLOW-#209",
    verifiedAt: "08:30 AM Today",
    status: "LOCKED_SAFE",
  },
];

export default function MaintenancePortal() {
  const [nodes, setNodes] = useState<EquipmentNode[]>(INITIAL_NODES);
  const [orders, setOrders] = useState<DispatchedOrder[]>(INITIAL_ORDERS);
  const [lotoPermits, setLotoPermits] = useState<LotoPermit[]>(INITIAL_LOTO_PERMITS);
  const [selectedNode, setSelectedNode] = useState<EquipmentNode>(INITIAL_NODES[2]); // Default TK-80
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending_officer">("all");
  const [isDark, setIsDark] = useState(false);

  // Sync theme with layout data-theme attribute
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // Modals state
  const [telemetryModalNode, setTelemetryModalNode] = useState<EquipmentNode | null>(null);
  const [signOffModalOrder, setSignOffModalOrder] = useState<DispatchedOrder | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [signOffNotes, setSignOffNotes] = useState("");
  const [checklist, setChecklist] = useState({
    lotoVerified: false,
    hardwareInstalled: false,
    perimeterCleared: false,
    telemetryNormal: false,
  });

  // Simulated live telemetry pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => {
          const delta = (Math.random() - 0.5) * 0.1;
          const tempDelta = Math.round((Math.random() - 0.5) * 1.5);
          return {
            ...n,
            vibration: Number(Math.max(0.4, n.vibration + delta).toFixed(2)),
            temperature: Math.max(25, n.temperature + tempDelta),
          };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (filterSeverity !== "all" && o.severity !== filterSeverity) return false;
    if (
      activeTab === "active" &&
      (o.status === "officer_verified" || o.status === "clearance_submitted")
    )
      return false;
    if (activeTab === "pending_officer" && o.status !== "clearance_submitted") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.equipmentId.toLowerCase().includes(q) ||
        o.dispatchedBy.name.toLowerCase().includes(q) ||
        o.assignedCrew.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Technician Acknowledgment (Never self-initiates, only acknowledges officer orders)
  const handleAcknowledge = (orderId: string) => {
    setAcknowledgingId(orderId);
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: "in_progress", timeAgo: "Active now" }
            : o
        )
      );
      setAcknowledgingId(null);
    }, 600);
  };

  // Submit Clearance to Safety Officer
  const handleSubmitClearance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signOffModalOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === signOffModalOrder.id
          ? {
              ...o,
              status: "clearance_submitted",
              timeAgo: "Just submitted",
            }
          : o
      )
    );
    setSignOffModalOrder(null);
    setSignOffNotes("");
    setChecklist({
      lotoVerified: false,
      hardwareInstalled: false,
      perimeterCleared: false,
      telemetryNormal: false,
    });
  };

  // Status badge helper (dark-mode aware)
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "dispatched":
        return {
          label: "DISPATCHED (Awaiting Crew)",
          bg: isDark ? "rgba(59, 130, 246, 0.16)" : "#eff6ff",
          color: isDark ? "#60a5fa" : "#1d4ed8",
          border: isDark ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe",
        };
      case "acknowledged":
      case "in_progress":
        return {
          label: "FIELD WORK IN PROGRESS",
          bg: isDark ? "rgba(245, 158, 11, 0.16)" : "#fef3c7",
          color: isDark ? "#fbbf24" : "#b45309",
          border: isDark ? "rgba(245, 158, 11, 0.3)" : "#fde68a",
        };
      case "clearance_submitted":
        return {
          label: "AWAITING OFFICER VERIFICATION",
          bg: isDark ? "rgba(168, 85, 247, 0.16)" : "#f3e8ff",
          color: isDark ? "#c084fc" : "#7e22ce",
          border: isDark ? "rgba(168, 85, 247, 0.3)" : "#e9d5ff",
        };
      case "officer_verified":
        return {
          label: "OFFICER VERIFIED & CLEARED",
          bg: isDark ? "rgba(16, 185, 129, 0.16)" : "#ecfdf5",
          color: isDark ? "#34d399" : "#047857",
          border: isDark ? "rgba(16, 185, 129, 0.3)" : "#a7f3d0",
        };
    }
  };

  return (
    <div
      style={{
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "24px 24px 80px",
      }}
    >
      {/* ─── 1. TECHNICIAN SHIFT BRIEFING & OPERATIONAL CONTEXT BAR ───────── */}
      <div
        id="overview"
        style={{
          background: isDark ? "#0c1427" : "#ffffff",
          borderRadius: "12px",
          padding: "18px 24px",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.35)" : "0 1px 3px rgba(0,0,0,0.04)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: isDark ? "rgba(59, 130, 246, 0.18)" : "#eff6ff",
              border: isDark ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isDark ? "#60a5fa" : "#1d4ed8",
              flexShrink: 0,
            }}
          >
            <HardHat style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  margin: 0,
                  color: isDark ? "#f8fafc" : "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                Maintenance Operations Console
              </h1>
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "4px",
                  background: isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
                  color: isDark ? "#34d399" : "#059669",
                  border: isDark ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid #a7f3d0",
                }}
              >
                ACTIVE SHIFT A
              </span>
            </div>
            <div
              style={{
                fontSize: "12.5px",
                color: isDark ? "#94a3b8" : "#64748b",
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <span>
                Technician: <strong style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>Devon Vance</strong> (Lead M-4)
              </span>
              <span>•</span>
              <span>
                Shift: <strong style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>07:00 – 19:00 UTC</strong>
              </span>
              <span>•</span>
              <span>
                Sector: <strong style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>Sector 4 North (Hydrocracker & Tank Farm)</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Safety Officer Connection Protocol Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: isDark ? "rgba(37, 99, 235, 0.1)" : "rgba(37, 99, 235, 0.05)",
            border: isDark ? "1px solid rgba(37, 99, 235, 0.25)" : "1px solid #bfdbfe",
            fontSize: "12px",
            color: isDark ? "#93c5fd" : "#1e40af",
          }}
        >
          <Shield style={{ width: "16px", height: "16px", color: isDark ? "#60a5fa" : "#2563eb", flexShrink: 0 }} />
          <span>
            <strong>Officer Dispatch Sync:</strong> Operations strictly authorized under verified PTW & LOTO permits.
          </span>
        </div>
      </div>

      {/* ─── 2. OPERATIONAL KPIS ───────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* KPI 1: Dispatched (Awaiting Crew) */}
        <div
          style={{
            background: isDark ? "#0c1427" : "#ffffff",
            borderRadius: "10px",
            padding: "16px 20px",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>
              Officer Dispatches
            </span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#f8fafc" : "#0f172a" }}>
              {orders.filter((o) => o.status === "dispatched").length}
            </span>
            <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600 }}>Awaiting Crew Response</span>
          </div>
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#94a3b8", marginTop: "4px" }}>
            Requires technician acknowledgment
          </div>
        </div>

        {/* KPI 2: Active In-Progress */}
        <div
          style={{
            background: isDark ? "#0c1427" : "#ffffff",
            borderRadius: "10px",
            padding: "16px 20px",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>
              In Field Work
            </span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#f8fafc" : "#0f172a" }}>
              {orders.filter((o) => o.status === "in_progress" || o.status === "acknowledged").length}
            </span>
            <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>Crews Mobilized</span>
          </div>
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#94a3b8", marginTop: "4px" }}>
            TK-80 Scaffolding repair active
          </div>
        </div>

        {/* KPI 3: LOTO Isolations */}
        <div
          style={{
            background: isDark ? "#0c1427" : "#ffffff",
            borderRadius: "10px",
            padding: "16px 20px",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>
              Active LOTO Isolations
            </span>
            <Lock style={{ width: "14px", height: "14px", color: "#ef4444" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#f8fafc" : "#0f172a" }}>
              {lotoPermits.length}
            </span>
            <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600 }}>Padlocks Verified</span>
          </div>
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#94a3b8", marginTop: "4px" }}>
            Zero unauthorized energy releases
          </div>
        </div>

        {/* KPI 4: Awaiting Officer Sign-Off */}
        <div
          style={{
            background: isDark ? "#0c1427" : "#ffffff",
            borderRadius: "10px",
            padding: "16px 20px",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>
              Clearance Submissions
            </span>
            <FileCheck style={{ width: "14px", height: "14px", color: "#a855f7" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#f8fafc" : "#0f172a" }}>
              {orders.filter((o) => o.status === "clearance_submitted").length}
            </span>
            <span style={{ fontSize: "12px", color: "#a855f7", fontWeight: 600 }}>Pending Officer Sign-Off</span>
          </div>
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#94a3b8", marginTop: "4px" }}>
            Dual-custody verification flow
          </div>
        </div>
      </div>

      {/* ─── 3. CENTERPIECE: SITE SAFETY MONITOR (Theme Match) & NODE DETAIL ─ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.25fr 0.75fr",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Exact Dark Slate "SITE SAFETY MONITOR" Card from Image Theme */}
        <div
          style={{
            background: "#0b1329", // Exact dark navy from image
            borderRadius: "16px",
            padding: "24px 28px",
            boxShadow: "0 20px 40px -10px rgba(11, 19, 41, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)",
            color: "#f8fafc",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Activity style={{ width: "18px", height: "18px", color: "#60a5fa" }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                  letterSpacing: "0.06em",
                  color: "#f1f5f9",
                  textTransform: "uppercase",
                }}
              >
                SITE SAFETY MONITOR
              </span>
            </div>

            {/* Glowing Live Badge matching image */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#10b981",
                letterSpacing: "0.06em",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 10px #10b981",
                  display: "inline-block",
                }}
              />
              LIVE
            </div>
          </div>

          {/* Schematic Flow Topology (Left) & 3 Stats (Right) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "20px",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            {/* Interactive SVG Flow Diagram */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "10px",
                padding: "16px 12px",
                position: "relative",
                minHeight: "160px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "14px",
                  fontSize: "10.5px",
                  color: "#64748b",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Unit Process Flow Topology
              </div>

              <svg
                viewBox="0 0 400 200"
                style={{
                  width: "100%",
                  height: "150px",
                  display: "block",
                  overflow: "visible",
                  marginTop: "14px",
                }}
              >
                {/* Connecting Process Lines */}
                <line
                  x1="75"
                  y1="80"
                  x2="210"
                  y2="70"
                  stroke="#1e293b"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
                <line x1="210" y1="70" x2="145" y2="150" stroke="#1e293b" strokeWidth="2" />
                <line x1="210" y1="70" x2="330" y2="55" stroke="#1e293b" strokeWidth="2" />
                <line x1="210" y1="70" x2="270" y2="145" stroke="#1e293b" strokeWidth="2" />
                <line x1="270" y1="145" x2="335" y2="150" stroke="#1e293b" strokeWidth="2" />

                {/* Pulsing signal indicator */}
                <circle cx="140" cy="75" r="3" fill="#60a5fa" opacity="0.8">
                  <animate attributeName="cx" values="75;210" dur="4s" repeatCount="indefinite" />
                </circle>

                {/* Node: P-101 */}
                <g
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setSelectedNode(nodes.find((n) => n.tag === "P-101") || nodes[0])
                  }
                >
                  <circle
                    cx="75"
                    cy="80"
                    r="8"
                    fill={selectedNode.tag === "P-101" ? "#3b82f6" : "#0f172a"}
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                  <circle cx="75" cy="80" r="3" fill="#10b981" />
                  <text
                    x="75"
                    y="104"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="700"
                  >
                    P-101
                  </text>
                </g>

                {/* Node: V-204 (Warning Orange) */}
                <g
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setSelectedNode(nodes.find((n) => n.tag === "V-204") || nodes[1])
                  }
                >
                  <circle
                    cx="210"
                    cy="70"
                    r="8"
                    fill={selectedNode.tag === "V-204" ? "#3b82f6" : "#0f172a"}
                    stroke="#f97316"
                    strokeWidth="2.5"
                  />
                  <circle cx="210" cy="70" r="3" fill="#f97316" />
                  <text
                    x="210"
                    y="94"
                    textAnchor="middle"
                    fill="#f97316"
                    fontSize="11"
                    fontWeight="700"
                  >
                    V-204
                  </text>
                </g>

                {/* Node: TK-80 (Critical Red) */}
                <g
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setSelectedNode(nodes.find((n) => n.tag === "TK-80") || nodes[2])
                  }
                >
                  <circle
                    cx="145"
                    cy="150"
                    r="9"
                    fill={selectedNode.tag === "TK-80" ? "#ef4444" : "#0f172a"}
                    stroke="#ef4444"
                    strokeWidth="2.5"
                  />
                  <circle cx="145" cy="150" r="3" fill="#ffffff" />
                  <text
                    x="145"
                    y="174"
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="11"
                    fontWeight="800"
                  >
                    TK-80
                  </text>
                </g>

                {/* Node: FCC-01 */}
                <g
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setSelectedNode(nodes.find((n) => n.tag === "FCC-01") || nodes[3])
                  }
                >
                  <circle
                    cx="330"
                    cy="55"
                    r="8"
                    fill={selectedNode.tag === "FCC-01" ? "#3b82f6" : "#0f172a"}
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                  <circle cx="330" cy="55" r="3" fill="#10b981" />
                  <text
                    x="330"
                    y="79"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="700"
                  >
                    FCC-01
                  </text>
                </g>

                {/* Node: HDP-02 */}
                <g
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setSelectedNode(nodes.find((n) => n.tag === "HDP-02") || nodes[4])
                  }
                >
                  <circle
                    cx="270"
                    cy="145"
                    r="8"
                    fill={selectedNode.tag === "HDP-02" ? "#3b82f6" : "#0f172a"}
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                  <circle cx="270" cy="145" r="3" fill="#10b981" />
                  <text
                    x="270"
                    y="169"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="700"
                  >
                    HDP-02
                  </text>
                </g>

                {/* Node: EX-12 */}
                <g
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setSelectedNode(nodes.find((n) => n.tag === "EX-12") || nodes[5])
                  }
                >
                  <circle
                    cx="335"
                    cy="150"
                    r="8"
                    fill={selectedNode.tag === "EX-12" ? "#3b82f6" : "#0f172a"}
                    stroke="#eab308"
                    strokeWidth="2.5"
                  />
                  <circle cx="335" cy="150" r="3" fill="#eab308" />
                  <text
                    x="335"
                    y="174"
                    textAnchor="middle"
                    fill="#eab308"
                    fontSize="11"
                    fontWeight="700"
                  >
                    EX-12
                  </text>
                </g>
              </svg>
            </div>

            {/* 3 Stats with Sparklines (Exact Reproduction from Image) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Stat 1: Vibration */}
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Radial Vibration
                  </div>
                  <div style={{ fontSize: "19px", fontWeight: 800, color: "#f8fafc" }}>
                    {selectedNode.vibration}{" "}
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                      mm/s
                    </span>
                  </div>
                </div>
                {/* Sparkline curve SVG */}
                <svg width="60" height="26" viewBox="0 0 60 26">
                  <path
                    d="M 2 18 Q 15 4 30 14 T 58 8"
                    fill="none"
                    stroke={selectedNode.vibration > 3 ? "#f97316" : "#3b82f6"}
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Stat 2: Operating Temp */}
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Core Temperature
                  </div>
                  <div style={{ fontSize: "19px", fontWeight: 800, color: "#f8fafc" }}>
                    {selectedNode.temperature}{" "}
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                      °C
                    </span>
                  </div>
                </div>
                <svg width="60" height="26" viewBox="0 0 60 26">
                  <path
                    d="M 2 20 Q 20 6 35 15 T 58 6"
                    fill="none"
                    stroke={selectedNode.temperature > 100 ? "#ef4444" : "#10b981"}
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Stat 3: Pressure */}
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    Line Pressure
                  </div>
                  <div style={{ fontSize: "19px", fontWeight: 800, color: "#f8fafc" }}>
                    {selectedNode.pressure}{" "}
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                      PSI
                    </span>
                  </div>
                </div>
                <svg width="60" height="26" viewBox="0 0 60 26">
                  <path
                    d="M 2 12 Q 18 22 34 8 T 58 14"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Recent High-Risk Findings List (Matching the Image) */}
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Recent Officer Dispatches</span>
              <span>Click to inspect</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {orders.slice(0, 4).map((order) => {
                const isSelected = selectedNode.tag === order.equipmentId;
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      const matched = nodes.find((n) => n.tag === order.equipmentId);
                      if (matched) setSelectedNode(matched);
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "85px 1fr 80px",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: isSelected
                        ? "rgba(59, 130, 246, 0.18)"
                        : "rgba(255, 255, 255, 0.02)",
                      border: isSelected
                        ? "1px solid rgba(59, 130, 246, 0.4)"
                        : "1px solid rgba(255, 255, 255, 0.04)",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background:
                            order.severity === "critical"
                              ? "#ef4444"
                              : order.severity === "high"
                              ? "#f97316"
                              : order.severity === "medium"
                              ? "#eab308"
                              : "#10b981",
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "10.5px",
                          letterSpacing: "0.04em",
                          color:
                            order.severity === "critical"
                              ? "#ef4444"
                              : order.severity === "high"
                              ? "#f97316"
                              : order.severity === "medium"
                              ? "#eab308"
                              : "#10b981",
                        }}
                      >
                        {order.severity.toUpperCase()}
                      </span>
                    </div>

                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "#e2e8f0",
                        fontWeight: 500,
                      }}
                    >
                      {order.title}
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "11px",
                        color: "#64748b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.timeAgo}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Equipment Diagnostics & Safety Clearance Card */}
        <div
          style={{
            background: isDark ? "#0c1427" : "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.35)" : "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            {/* Header with Tag & Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    background: isDark ? "rgba(59, 130, 246, 0.2)" : "#eff6ff",
                    color: isDark ? "#60a5fa" : "#1d4ed8",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: 800,
                    fontSize: "15px",
                    fontFamily: "monospace",
                  }}
                >
                  {selectedNode.tag}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    background:
                      selectedNode.status === "critical"
                        ? "rgba(239, 68, 68, 0.15)"
                        : selectedNode.status === "warning"
                        ? "rgba(245, 158, 11, 0.15)"
                        : "rgba(16, 185, 129, 0.15)",
                    color:
                      selectedNode.status === "critical"
                        ? "#ef4444"
                        : selectedNode.status === "warning"
                        ? "#f59e0b"
                        : "#10b981",
                  }}
                >
                  {selectedNode.status}
                </span>
              </div>

              <button
                onClick={() => setTelemetryModalNode(selectedNode)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: isDark ? "#60a5fa" : "#2563eb",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span>Full Telemetry</span>
                <ExternalLink style={{ width: "13px", height: "13px" }} />
              </button>
            </div>

            <h3
              style={{
                fontSize: "17px",
                fontWeight: 700,
                margin: "0 0 6px 0",
                color: isDark ? "#f8fafc" : "#0f172a",
              }}
            >
              {selectedNode.name}
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: isDark ? "#94a3b8" : "#64748b",
                margin: "0 0 16px 0",
              }}
            >
              Type: <strong>{selectedNode.type}</strong>
            </p>

            {/* Real-Time Sensor Readings Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Radial Vibration
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: selectedNode.vibration > 3 ? "#f97316" : isDark ? "#f8fafc" : "#0f172a",
                  }}
                >
                  {selectedNode.vibration} mm/s
                </div>
                <div style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>
                  ISO 10816 Limit: 2.5 mm/s
                </div>
              </div>

              <div
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Acoustic Noise
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: isDark ? "#f8fafc" : "#0f172a",
                  }}
                >
                  {selectedNode.acousticIndex} dB
                </div>
                <div style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>
                  Normal threshold &lt; 85 dB
                </div>
              </div>
            </div>

            {/* Associated Work Order or Officer Dispatch Info */}
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid #e2e8f0",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: isDark ? "#94a3b8" : "#64748b",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Linked Officer Dispatch
              </div>
              {selectedNode.activeOrderId ? (
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: isDark ? "#60a5fa" : "#1d4ed8",
                      marginBottom: "4px",
                    }}
                  >
                    {selectedNode.activeOrderId} – Active Safety Permit
                  </div>
                  <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b" }}>
                    Authorizing Officer:{" "}
                    <strong style={{ color: isDark ? "#e2e8f0" : "#334155" }}>
                      {orders.find((o) => o.equipmentId === selectedNode.tag)?.dispatchedBy.name ||
                        "Officer On Duty"}
                    </strong>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: isDark ? "#64748b" : "#94a3b8" }}>
                  No active work order. Operating within normal safety parameters.
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Button for Selected Node */}
          <div>
            {orders.find((o) => o.equipmentId === selectedNode.tag) ? (
              <a
                href="#work-orders"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: "8px",
                  background: isDark ? "#1e293b" : "#0b192e",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxSizing: "border-box",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "none",
                }}
              >
                <span>Jump to Work Order ({selectedNode.tag})</span>
                <ArrowRight style={{ width: "15px", height: "15px" }} />
              </a>
            ) : (
              <button
                onClick={() => setTelemetryModalNode(selectedNode)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
                  cursor: "pointer",
                }}
              >
                <Radio style={{ width: "15px", height: "15px", color: "#3b82f6" }} />
                <span>Stream Real-Time Telemetry</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── 4. SAFETY OFFICER DISPATCHED WORK ORDERS QUEUE ─────────────────── */}
      <section
        id="work-orders"
        style={{
          background: isDark ? "#0c1427" : "#ffffff",
          borderRadius: "14px",
          padding: "24px",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.03)",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11.5px",
                fontWeight: 700,
                color: isDark ? "#60a5fa" : "#1d4ed8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              <Shield style={{ width: "14px", height: "14px" }} />
              Officer Authorized Execution Queue
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: 0,
                color: isDark ? "#f8fafc" : "#0f172a",
              }}
            >
              Dispatched Work Orders
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: isDark ? "#94a3b8" : "#64748b",
                margin: "4px 0 0 0",
              }}
            >
              Authorized directly by Safety Officers. Technicians acknowledge orders, execute under LOTO, and submit clearance for officer sign-off.
            </p>
          </div>

          {/* Quick Filters and Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Search Input */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "12px",
                  width: "15px",
                  height: "15px",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Search orders, officer, equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "8px 12px 8px 34px",
                  borderRadius: "6px",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #cbd5e1",
                  fontSize: "13px",
                  width: "250px",
                  background: isDark ? "#070b14" : "#ffffff",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  outline: "none",
                }}
              />
            </div>

            {/* Severity Filter Dropdown */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #cbd5e1",
                fontSize: "13px",
                background: isDark ? "#070b14" : "#ffffff",
                color: isDark ? "#f8fafc" : "#0f172a",
                fontWeight: 500,
                outline: "none",
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Tier Only</option>
              <option value="high">High Tier</option>
              <option value="medium">Medium Tier</option>
              <option value="low">Low Tier</option>
            </select>
          </div>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "9px 16px",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === "all"
                  ? isDark
                    ? "2px solid #60a5fa"
                    : "2px solid #0b192e"
                  : "2px solid transparent",
              fontWeight: activeTab === "all" ? 700 : 500,
              color:
                activeTab === "all"
                  ? isDark
                    ? "#ffffff"
                    : "#0f172a"
                  : isDark
                  ? "#94a3b8"
                  : "#64748b",
              cursor: "pointer",
              fontSize: "13.5px",
            }}
          >
            All Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("active")}
            style={{
              padding: "9px 16px",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === "active"
                  ? isDark
                    ? "2px solid #60a5fa"
                    : "2px solid #0b192e"
                  : "2px solid transparent",
              fontWeight: activeTab === "active" ? 700 : 500,
              color:
                activeTab === "active"
                  ? isDark
                    ? "#ffffff"
                    : "#0f172a"
                  : isDark
                  ? "#94a3b8"
                  : "#64748b",
              cursor: "pointer",
              fontSize: "13.5px",
            }}
          >
            Active Field Work (
            {
              orders.filter(
                (o) => o.status !== "officer_verified" && o.status !== "clearance_submitted"
              ).length
            }
            )
          </button>

          <button
            onClick={() => setActiveTab("pending_officer")}
            style={{
              padding: "9px 16px",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === "pending_officer"
                  ? isDark
                    ? "2px solid #60a5fa"
                    : "2px solid #0b192e"
                  : "2px solid transparent",
              fontWeight: activeTab === "pending_officer" ? 700 : 500,
              color:
                activeTab === "pending_officer"
                  ? isDark
                    ? "#ffffff"
                    : "#0f172a"
                  : isDark
                  ? "#94a3b8"
                  : "#64748b",
              cursor: "pointer",
              fontSize: "13.5px",
            }}
          >
            Pending Officer Clearance (
            {orders.filter((o) => o.status === "clearance_submitted").length})
          </button>
        </div>

        {/* Orders Cards Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredOrders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                color: isDark ? "#94a3b8" : "#64748b",
                fontSize: "14px",
              }}
            >
              No work orders match the selected filters.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              const node = nodes.find((n) => n.tag === order.equipmentId);

              return (
                <div
                  key={order.id}
                  style={{
                    background: isDark ? "#070b14" : "#ffffff",
                    borderRadius: "10px",
                    border: isDark
                      ? "1px solid rgba(255, 255, 255, 0.08)"
                      : "1px solid #cbd5e1",
                    padding: "20px 22px",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(0,0,0,0.25)"
                      : "0 1px 3px rgba(0,0,0,0.03)",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  {/* Order Top Line: Number, Status, Severity, Time */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "15px",
                          fontFamily: "monospace",
                          color: isDark ? "#f8fafc" : "#0f172a",
                        }}
                      >
                        {order.orderNumber}
                      </span>

                      {/* Status Badge */}
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          padding: "3px 9px",
                          borderRadius: "4px",
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>

                      {/* Severity Pill */}
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background:
                            order.severity === "critical"
                              ? "rgba(239, 68, 68, 0.14)"
                              : order.severity === "high"
                              ? "rgba(249, 115, 22, 0.14)"
                              : "rgba(234, 179, 8, 0.14)",
                          color:
                            order.severity === "critical"
                              ? "#ef4444"
                              : order.severity === "high"
                              ? "#f97316"
                              : "#eab308",
                          border:
                            order.severity === "critical"
                              ? "1px solid rgba(239, 68, 68, 0.3)"
                              : "1px solid rgba(249, 115, 22, 0.3)",
                          textTransform: "uppercase",
                        }}
                      >
                        {order.severity}
                      </span>

                      {/* LOTO Tag */}
                      {order.lotoRequired && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: isDark ? "rgba(239, 68, 68, 0.15)" : "#fee2e2",
                            color: isDark ? "#f87171" : "#b91c1c",
                            border: isDark
                              ? "1px solid rgba(239, 68, 68, 0.3)"
                              : "1px solid #fecaca",
                          }}
                        >
                          <Lock style={{ width: "11px", height: "11px" }} />
                          LOTO MANDATORY
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        color: isDark ? "#94a3b8" : "#64748b",
                      }}
                    >
                      <Clock style={{ width: "13px", height: "13px" }} />
                      <span>Dispatched {order.timeAgo}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: isDark ? "#f8fafc" : "#0f172a",
                      margin: "0 0 6px 0",
                    }}
                  >
                    {order.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: isDark ? "#94a3b8" : "#475569",
                      lineHeight: 1.55,
                      margin: "0 0 14px 0",
                    }}
                  >
                    {order.description}
                  </p>

                  {/* Operational Details Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      background: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
                      border: isDark
                        ? "1px solid rgba(255, 255, 255, 0.05)"
                        : "1px solid #e2e8f0",
                      marginBottom: "16px",
                      fontSize: "12.5px",
                    }}
                  >
                    <div>
                      <span style={{ color: isDark ? "#64748b" : "#94a3b8", display: "block" }}>
                        Authorizing Safety Officer:
                      </span>
                      <strong style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>
                        {order.dispatchedBy.name} ({order.dispatchedBy.badgeId})
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: isDark ? "#64748b" : "#94a3b8", display: "block" }}>
                        Permit to Work (PTW):
                      </span>
                      <strong
                        style={{
                          color: isDark ? "#60a5fa" : "#1d4ed8",
                          fontFamily: "monospace",
                        }}
                      >
                        {order.safetyPermitId}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: isDark ? "#64748b" : "#94a3b8", display: "block" }}>
                        Target Location / Unit:
                      </span>
                      <strong style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>
                        {order.location} ({order.equipmentId})
                      </strong>
                    </div>

                    {order.telemetryTrigger && (
                      <div>
                        <span style={{ color: isDark ? "#64748b" : "#94a3b8", display: "block" }}>
                          Trigger Sensor:
                        </span>
                        <strong style={{ color: "#f97316" }}>
                          {order.telemetryTrigger.value} (Limit: {order.telemetryTrigger.threshold})
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {node && (
                        <button
                          onClick={() => setTelemetryModalNode(node)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            borderRadius: "6px",
                            background: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                            border: isDark
                              ? "1px solid rgba(255, 255, 255, 0.1)"
                              : "1px solid #cbd5e1",
                            color: isDark ? "#93c5fd" : "#1d4ed8",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Activity style={{ width: "13px", height: "13px" }} />
                          <span>Inspect Telemetry ({order.equipmentId})</span>
                        </button>
                      )}
                    </div>

                    {/* Step Transitions: Acknowledge -> Submit Clearance -> Verified */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {order.status === "dispatched" && (
                        <button
                          onClick={() => handleAcknowledge(order.id)}
                          disabled={acknowledgingId === order.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            background: isDark ? "#2563eb" : "#1d4ed8",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                          }}
                        >
                          {acknowledgingId === order.id ? (
                            <>
                              <RefreshCw
                                style={{
                                  width: "13px",
                                  height: "13px",
                                  animation: "spin 1s linear infinite",
                                }}
                              />
                              <span>Mobilizing Crew...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                              <span>Acknowledge & Deploy Crew</span>
                            </>
                          )}
                        </button>
                      )}

                      {(order.status === "acknowledged" || order.status === "in_progress") && (
                        <button
                          onClick={() => setSignOffModalOrder(order)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            background: isDark ? "#059669" : "#047857",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(5, 150, 105, 0.3)",
                          }}
                        >
                          <FileText style={{ width: "14px", height: "14px" }} />
                          <span>Submit Hazard Clearance Sign-Off</span>
                        </button>
                      )}

                      {order.status === "clearance_submitted" && (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            borderRadius: "6px",
                            background: isDark
                              ? "rgba(168, 85, 247, 0.15)"
                              : "#f3e8ff",
                            color: isDark ? "#c084fc" : "#7e22ce",
                            border: isDark
                              ? "1px solid rgba(168, 85, 247, 0.3)"
                              : "1px solid #e9d5ff",
                            fontSize: "12.5px",
                            fontWeight: 600,
                          }}
                        >
                          <Clock style={{ width: "13px", height: "13px" }} />
                          <span>Awaiting Safety Officer Physical Verification</span>
                        </div>
                      )}

                      {order.status === "officer_verified" && (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            borderRadius: "6px",
                            background: isDark
                              ? "rgba(16, 185, 129, 0.15)"
                              : "#ecfdf5",
                            color: isDark ? "#34d399" : "#047857",
                            border: isDark
                              ? "1px solid rgba(16, 185, 129, 0.3)"
                              : "1px solid #a7f3d0",
                            fontSize: "12.5px",
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                          <span>Certified Closed by Safety Officer</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ─── 5. ACTIVE LOTO ENERGY ISOLATIONS LOG ──────────────────────────── */}
      <section
        id="loto-log"
        style={{
          background: isDark ? "#0c1427" : "#ffffff",
          borderRadius: "14px",
          padding: "24px",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.03)",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11.5px",
                fontWeight: 700,
                color: "#ef4444",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              <Lock style={{ width: "14px", height: "14px" }} />
              OSHA Standard 1910.147 Isolation Registry
            </div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                margin: 0,
                color: isDark ? "#f8fafc" : "#0f172a",
              }}
            >
              Active LOTO Permits & Padlock Registry
            </h2>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "20px",
              background: isDark ? "rgba(239, 68, 68, 0.15)" : "#fee2e2",
              color: isDark ? "#f87171" : "#b91c1c",
              border: isDark ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid #fecaca",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            <Lock style={{ width: "12px", height: "12px" }} />
            <span>3 Hazardous Energy Isolations Verified</span>
          </div>
        </div>

        {/* LOTO Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: isDark
                    ? "1px solid rgba(255, 255, 255, 0.08)"
                    : "1px solid #e2e8f0",
                  color: isDark ? "#94a3b8" : "#64748b",
                  fontSize: "11.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ padding: "10px 12px" }}>Tag #</th>
                <th style={{ padding: "10px 12px" }}>Equipment</th>
                <th style={{ padding: "10px 12px" }}>Energy Type</th>
                <th style={{ padding: "10px 12px" }}>Physical Point</th>
                <th style={{ padding: "10px 12px" }}>Locked By Officer</th>
                <th style={{ padding: "10px 12px" }}>Crew Padlock ID</th>
                <th style={{ padding: "10px 12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {lotoPermits.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: isDark
                      ? "1px solid rgba(255, 255, 255, 0.04)"
                      : "1px solid #f1f5f9",
                  }}
                >
                  <td style={{ padding: "12px", fontWeight: 700, fontFamily: "monospace", color: isDark ? "#60a5fa" : "#1d4ed8" }}>
                    {p.tagNumber}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a" }}>
                      {p.assetTag}
                    </div>
                    <div style={{ fontSize: "11.5px", color: isDark ? "#94a3b8" : "#64748b" }}>
                      {p.assetName}
                    </div>
                  </td>
                  <td style={{ padding: "12px", color: isDark ? "#e2e8f0" : "#334155" }}>
                    {p.energyType}
                  </td>
                  <td style={{ padding: "12px", color: isDark ? "#94a3b8" : "#64748b" }}>
                    {p.isolationPoint}
                  </td>
                  <td style={{ padding: "12px", color: isDark ? "#e2e8f0" : "#1e293b", fontWeight: 500 }}>
                    {p.lockedByOfficer}
                  </td>
                  <td style={{ padding: "12px", fontFamily: "monospace", color: isDark ? "#f8fafc" : "#0f172a" }}>
                    {p.padlockId}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
                        color: isDark ? "#34d399" : "#047857",
                        border: isDark ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #a7f3d0",
                      }}
                    >
                      ISOLATED (SAFE)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── 6. FLEET TELEMETRY REAL-TIME MATRIX ───────────────────────────── */}
      <section
        id="fleet-telemetry"
        style={{
          background: isDark ? "#0c1427" : "#ffffff",
          borderRadius: "14px",
          padding: "24px",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11.5px",
                fontWeight: 700,
                color: isDark ? "#60a5fa" : "#1d4ed8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              <Radio style={{ width: "14px", height: "14px" }} />
              Real-Time Vibration & Process Health
            </div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                margin: 0,
                color: isDark ? "#f8fafc" : "#0f172a",
              }}
            >
              Refinery Equipment Telemetry
            </h2>
          </div>

          <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b" }}>
            Telemetry stream refreshed every 3.0s via edge sensors
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: isDark
                    ? "1px solid rgba(255, 255, 255, 0.08)"
                    : "1px solid #e2e8f0",
                  color: isDark ? "#94a3b8" : "#64748b",
                  fontSize: "11.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ padding: "10px 12px" }}>Tag</th>
                <th style={{ padding: "10px 12px" }}>Asset Name</th>
                <th style={{ padding: "10px 12px" }}>Type</th>
                <th style={{ padding: "10px 12px" }}>Radial Vibration</th>
                <th style={{ padding: "10px 12px" }}>Temperature</th>
                <th style={{ padding: "10px 12px" }}>Pressure</th>
                <th style={{ padding: "10px 12px" }}>Status</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Diagnostic Action</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => (
                <tr
                  key={n.id}
                  style={{
                    borderBottom: isDark
                      ? "1px solid rgba(255, 255, 255, 0.04)"
                      : "1px solid #f1f5f9",
                  }}
                >
                  <td style={{ padding: "12px", fontWeight: 700, fontFamily: "monospace", color: isDark ? "#60a5fa" : "#1d4ed8" }}>
                    {n.tag}
                  </td>
                  <td style={{ padding: "12px", fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a" }}>
                    {n.name}
                  </td>
                  <td style={{ padding: "12px", color: isDark ? "#94a3b8" : "#64748b" }}>
                    {n.type}
                  </td>
                  <td style={{ padding: "12px", fontWeight: 700, color: n.vibration > 3 ? "#f97316" : isDark ? "#e2e8f0" : "#1e293b" }}>
                    {n.vibration} mm/s
                  </td>
                  <td style={{ padding: "12px", color: isDark ? "#e2e8f0" : "#1e293b" }}>
                    {n.temperature}°C
                  </td>
                  <td style={{ padding: "12px", color: isDark ? "#e2e8f0" : "#1e293b" }}>
                    {n.pressure} PSI
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background:
                          n.status === "critical"
                            ? "rgba(239, 68, 68, 0.15)"
                            : n.status === "warning"
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(16, 185, 129, 0.15)",
                        color:
                          n.status === "critical"
                            ? "#ef4444"
                            : n.status === "warning"
                            ? "#f59e0b"
                            : "#10b981",
                      }}
                    >
                      {n.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button
                      onClick={() => setTelemetryModalNode(n)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "4px",
                        background: isDark ? "rgba(59, 130, 246, 0.15)" : "#eff6ff",
                        border: isDark ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid #bfdbfe",
                        color: isDark ? "#60a5fa" : "#1d4ed8",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Inspect Spectrum
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── MODAL 1: EQUIPMENT TELEMETRY INSPECTOR ─────────────────────────── */}
      {telemetryModalNode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: isDark ? "#0c1427" : "#ffffff",
              color: isDark ? "#f8fafc" : "#0f172a",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "16px",
                borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Activity style={{ width: "20px", height: "20px", color: "#60a5fa" }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
                    Live Telemetry Diagnostics: {telemetryModalNode.tag}
                  </h3>
                  <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b" }}>
                    {telemetryModalNode.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTelemetryModalNode(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: isDark ? "#94a3b8" : "#64748b",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Real-Time Telemetry Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "14px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Radial Vibration (RMS)
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>
                  {telemetryModalNode.vibration} mm/s
                </div>
                <div style={{ fontSize: "11px", color: "#f97316", marginTop: "2px" }}>
                  ISO 10816 Limit: 2.5 mm/s
                </div>
              </div>

              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Bearing Surface Temperature
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>
                  {telemetryModalNode.temperature} °C
                </div>
                <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", marginTop: "2px" }}>
                  Normal Operating Range &lt; 90°C
                </div>
              </div>

              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Line Gauge Pressure
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>
                  {telemetryModalNode.pressure} PSI
                </div>
                <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", marginTop: "2px" }}>
                  Operating Target: 80 - 150 PSI
                </div>
              </div>

              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Acoustic Ultrasonic Index
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>
                  {telemetryModalNode.acousticIndex} dB
                </div>
                <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", marginTop: "2px" }}>
                  Noise ceiling 85 dB
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setTelemetryModalNode(null)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "6px",
                  background: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Close Diagnostic View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: OSHA 1910 CLEARANCE SIGN-OFF ──────────────────────────── */}
      {signOffModalOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: isDark ? "#0c1427" : "#ffffff",
              color: isDark ? "#f8fafc" : "#0f172a",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "620px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "16px",
                borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isDark ? "#60a5fa" : "#1d4ed8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Dual-Custody Hazard Clearance Sign-Off
                </div>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700 }}>
                  {signOffModalOrder.orderNumber}: {signOffModalOrder.equipmentId}
                </h3>
              </div>
              <button
                onClick={() => setSignOffModalOrder(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: isDark ? "#94a3b8" : "#64748b",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <form onSubmit={handleSubmitClearance}>
              {/* Officer Authorization Reference */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
                  border: isDark ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid #bfdbfe",
                  fontSize: "12.5px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  Permit ID:{" "}
                  <strong style={{ fontFamily: "monospace", color: isDark ? "#60a5fa" : "#1d4ed8" }}>
                    {signOffModalOrder.safetyPermitId}
                  </strong>
                </div>
                <div style={{ marginTop: "4px", color: isDark ? "#94a3b8" : "#475569" }}>
                  Authorizing Officer: <strong>{signOffModalOrder.dispatchedBy.name}</strong> ({signOffModalOrder.dispatchedBy.role})
                </div>
              </div>

              {/* Safety Protocol Checklist */}
              <div style={{ marginBottom: "18px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: isDark ? "#94a3b8" : "#64748b",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  Technician Field Verification Checklist:
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.lotoVerified}
                      onChange={(e) =>
                        setChecklist({ ...checklist, lotoVerified: e.target.checked })
                      }
                      style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                    />
                    <span>
                      <strong>Energy Isolation & LOTO:</strong> Verified lockout locks tagged and energy de-energized prior to work.
                    </span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.hardwareInstalled}
                      onChange={(e) =>
                        setChecklist({ ...checklist, hardwareInstalled: e.target.checked })
                      }
                      style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                    />
                    <span>
                      <strong>Hardware & Spec Compliance:</strong> Replacement components torqued to OEM specification.
                    </span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.perimeterCleared}
                      onChange={(e) =>
                        setChecklist({ ...checklist, perimeterCleared: e.target.checked })
                      }
                      style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                    />
                    <span>
                      <strong>Housekeeping & Perimeter Clearance:</strong> Tools removed, debris cleared, and access gates reinstated.
                    </span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checklist.telemetryNormal}
                      onChange={(e) =>
                        setChecklist({ ...checklist, telemetryNormal: e.target.checked })
                      }
                      style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                    />
                    <span>
                      <strong>Cold Run & Diagnostic Test:</strong> Sensor diagnostics returned within normal ISO threshold limits.
                    </span>
                  </label>
                </div>
              </div>

              {/* Field Technician Work Notes */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: isDark ? "#94a3b8" : "#64748b",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Work Completed Description & Part Numbers:
                </label>
                <textarea
                  required
                  rows={3}
                  value={signOffNotes}
                  onChange={(e) => setSignOffNotes(e.target.value)}
                  placeholder="e.g., Replaced 3m scaffold kickboards and installed new safety gate latch. Torqued bolts to 65 ft-lb."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid #cbd5e1",
                    fontSize: "13px",
                    background: isDark ? "#070b14" : "#ffffff",
                    color: isDark ? "#f8fafc" : "#0f172a",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              {/* Form Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSignOffModalOrder(null)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "6px",
                    background: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
                    color: isDark ? "#f8fafc" : "#0f172a",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !checklist.lotoVerified ||
                    !checklist.hardwareInstalled ||
                    !checklist.perimeterCleared ||
                    !checklist.telemetryNormal ||
                    !signOffNotes.trim()
                  }
                  style={{
                    padding: "9px 20px",
                    borderRadius: "6px",
                    background:
                      checklist.lotoVerified &&
                      checklist.hardwareInstalled &&
                      checklist.perimeterCleared &&
                      checklist.telemetryNormal &&
                      signOffNotes.trim()
                        ? "#059669"
                        : "#475569",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    border: "none",
                    cursor:
                      checklist.lotoVerified &&
                      checklist.hardwareInstalled &&
                      checklist.perimeterCleared &&
                      checklist.telemetryNormal &&
                      signOffNotes.trim()
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Submit to Officer for Final Inspection Sign-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
