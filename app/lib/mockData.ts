/**
 * MOCK DATA — used while backend is not connected.
 * Replace API calls with these when NEXT_PUBLIC_USE_MOCK=true or backend is offline.
 */

import type { ReportSummary, ReportDetail, User } from "./api";

export const MOCK_USER: User = {
  _id: "64a1b2c3d4e5f6a7b8c9d001",
  name: "Rajan Mehta",
  email: "rajan@foresite.com",
  role: "worker",
  department: "Boiler Room B",
};

export const MOCK_REPORTS: ReportSummary[] = [
  {
    _id: "64b2c3d4e5f6a7b8c9d0e001",
    title: "Exposed electrical wiring near water pump",
    location: "Sector 4, Water Treatment Plant",
    category: "unsafe_condition",
    severity: "high",
    status: "analysis_complete",
    riskAssessment: { riskScore: 87, riskLevel: "CRITICAL", sifProbability: 0.82 },
    createdAt: "2026-09-05T09:15:00Z",
  },
  {
    _id: "64b2c3d4e5f6a7b8c9d0e002",
    title: "Worker not wearing harness on elevated platform",
    location: "Building C, Elevated Platform, Level 3",
    category: "unsafe_act",
    severity: "high",
    status: "action_assigned",
    riskAssessment: { riskScore: 79, riskLevel: "CRITICAL", sifProbability: 0.74 },
    createdAt: "2026-09-04T14:30:00Z",
  },
  {
    _id: "64b2c3d4e5f6a7b8c9d0e003",
    title: "Chemical leak detected near storage tanks",
    location: "Chemical Storage Area, Tank Farm",
    category: "chemical_exposure",
    severity: "high",
    status: "under_review",
    riskAssessment: { riskScore: 71, riskLevel: "HIGH", sifProbability: 0.65 },
    createdAt: "2026-09-03T11:00:00Z",
  },
  {
    _id: "64b2c3d4e5f6a7b8c9d0e004",
    title: "Forklift operating in pedestrian zone without barriers",
    location: "Main Warehouse Corridor, Building A",
    category: "unsafe_condition",
    severity: "medium",
    status: "analysis_complete",
    riskAssessment: { riskScore: 58, riskLevel: "HIGH", sifProbability: 0.52 },
    createdAt: "2026-09-02T09:45:00Z",
  },
  {
    _id: "64b2c3d4e5f6a7b8c9d0e005",
    title: "Wet floor near staircase without warning signs",
    location: "Block D, Ground Floor, Main Staircase",
    category: "unsafe_condition",
    severity: "medium",
    status: "resolved",
    riskAssessment: { riskScore: 28, riskLevel: "MEDIUM", sifProbability: 0.18 },
    createdAt: "2026-09-01T16:20:00Z",
  },
];

export const MOCK_REPORT_DETAIL: Record<string, ReportDetail> = {
  "64b2c3d4e5f6a7b8c9d0e001": {
    _id: "64b2c3d4e5f6a7b8c9d0e001",
    title: "Exposed electrical wiring near water pump",
    description:
      "Found bare copper wiring approximately 2 meters from the main water pump in Sector 4. Wire insulation is completely stripped. Risk of electrocution if water contacts the wire during maintenance.",
    location: "Sector 4, Water Treatment Plant",
    category: "unsafe_condition",
    severity: "high",
    status: "analysis_complete",
    submittedBy: { _id: "64a1", name: "Rajan Mehta", department: "Boiler Room B" },
    riskAssessment: {
      riskScore: 87,
      riskLevel: "CRITICAL",
      sifProbability: 0.82,
      precursors: ["Energized Equipment Exposure", "Inadequate Isolation/Lockout", "Proximity to Electrical Hazard"],
      hazards: ["Electrocution", "Arc Flash", "Burns"],
      explanation:
        "This report describes exposed energized wiring in proximity to water sources. The combination of electrical exposure, proximity to liquid, and lack of mention of lockout/tagout procedures are classic SIF precursors associated with electrocution fatalities.",
    },
    maintenanceTasks: [],
    createdAt: "2026-09-05T09:15:00Z",
    updatedAt: "2026-09-05T09:15:45Z",
  },
  "64b2c3d4e5f6a7b8c9d0e002": {
    _id: "64b2c3d4e5f6a7b8c9d0e002",
    title: "Worker not wearing harness on elevated platform",
    description:
      "During routine inspection at the elevated platform in Building C (approx. 8 meters height), observed a maintenance worker not wearing fall protection harness while working near the edge to check equipment readings.",
    location: "Building C, Elevated Platform, Level 3",
    category: "unsafe_act",
    severity: "high",
    status: "action_assigned",
    submittedBy: { _id: "64a2", name: "Priya Nair", department: "Quality Control" },
    riskAssessment: {
      riskScore: 79,
      riskLevel: "CRITICAL",
      sifProbability: 0.74,
      precursors: ["Working at Height Without Protection", "Line of Fire"],
      hazards: ["Fall from Height", "Struck-By"],
      explanation:
        "Working at height without fall protection at 8 meters is a leading cause of occupational fatalities. The line-of-fire exposure near an elevated edge compounds the risk significantly.",
    },
    maintenanceTasks: [
      {
        _id: "t001",
        title: "Install safety harness anchor points and conduct safety briefing",
        status: "in_progress",
        assignedTo: { name: "Vikram Singh" },
        dueDate: "2026-09-06T17:00:00Z",
      },
    ],
    createdAt: "2026-09-04T14:30:00Z",
    updatedAt: "2026-09-04T14:31:00Z",
  },
  "64b2c3d4e5f6a7b8c9d0e003": {
    _id: "64b2c3d4e5f6a7b8c9d0e003",
    title: "Chemical leak detected near storage tanks",
    description:
      "Small puddle of yellowish liquid observed near Tank 7 in the chemical storage area. Slight sulfuric smell noted. No signage on tank. Workers in adjacent area without respiratory protection.",
    location: "Chemical Storage Area, Tank Farm",
    category: "chemical_exposure",
    severity: "high",
    status: "under_review",
    submittedBy: { _id: "64a3", name: "Suresh Kumar", department: "Chemical Processing" },
    riskAssessment: {
      riskScore: 71,
      riskLevel: "HIGH",
      sifProbability: 0.65,
      precursors: ["Chemical Exposure Without PPE", "Line of Fire"],
      hazards: ["Chemical Burns", "Toxic Inhalation", "Fire/Explosion"],
      explanation:
        "An unidentified chemical leak without proper PPE for nearby workers presents high risk of chemical exposure. The sulfuric odor suggests potential acid or hazardous chemical involvement.",
    },
    maintenanceTasks: [],
    createdAt: "2026-09-03T11:00:00Z",
    updatedAt: "2026-09-03T11:01:00Z",
  },
  "64b2c3d4e5f6a7b8c9d0e004": {
    _id: "64b2c3d4e5f6a7b8c9d0e004",
    title: "Forklift operating in pedestrian zone without barriers",
    description:
      "Forklift operations observed in the main warehouse corridor during active shift hours. No physical barriers or warning cones present to separate pedestrian and vehicle traffic lanes.",
    location: "Main Warehouse Corridor, Building A",
    category: "unsafe_condition",
    severity: "medium",
    status: "analysis_complete",
    submittedBy: { _id: "64a1", name: "Rajan Mehta", department: "Boiler Room B" },
    riskAssessment: {
      riskScore: 58,
      riskLevel: "HIGH",
      sifProbability: 0.52,
      precursors: ["Struck-By Moving Equipment"],
      hazards: ["Struck-By", "Crush Injury"],
      explanation:
        "Shared vehicle and pedestrian zones without physical barriers are a leading cause of struck-by incidents. The lack of traffic management controls creates serious risk of fatality.",
    },
    maintenanceTasks: [],
    createdAt: "2026-09-02T09:45:00Z",
    updatedAt: "2026-09-02T09:46:00Z",
  },
  "64b2c3d4e5f6a7b8c9d0e005": {
    _id: "64b2c3d4e5f6a7b8c9d0e005",
    title: "Wet floor near staircase without warning signs",
    description:
      "Water spillage observed near the main staircase entrance in Block D. No wet floor signs placed. Cleaning crew has been notified but no action taken in the past 30 minutes.",
    location: "Block D, Ground Floor, Main Staircase",
    category: "unsafe_condition",
    severity: "medium",
    status: "resolved",
    submittedBy: { _id: "64a4", name: "Meena Sharma", department: "Administration" },
    riskAssessment: {
      riskScore: 28,
      riskLevel: "MEDIUM",
      sifProbability: 0.18,
      precursors: [],
      hazards: ["Slip/Trip/Fall"],
      explanation:
        "Wet floor near staircase presents a slip and fall hazard. Staircase falls can result in serious injury. Prompt housekeeping action is required.",
    },
    maintenanceTasks: [
      {
        _id: "t002",
        title: "Clean spill and place wet floor signs",
        status: "verified",
        assignedTo: { name: "Cleaning Team" },
        dueDate: "2026-09-01T17:30:00Z",
      },
    ],
    createdAt: "2026-09-01T16:20:00Z",
    updatedAt: "2026-09-01T17:00:00Z",
  },
};
