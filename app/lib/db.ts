import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { hashPassword } from "./security";

const MONGO_URI = process.env.MONGO_URI;

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
    isFallback: false,
  };
}

// ─── Local Resilient Store Path ─────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "foresite_db.json");

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
  password: string; // salt:hash
  role: "worker" | "safety_officer" | "officer" | "maintenance" | "admin";
  department?: string;
  badgeId: string;
  createdAt: string;
}

export interface StoredReport {
  _id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  risk_score: number;
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  sif_probability: number;
  precursors: string[];
  hazards: string[];
  explanation: string;
  imageUrl?: string;
  audioUrl?: string;
  status: "pending_analysis" | "analysis_complete" | "under_review" | "action_assigned" | "resolved" | "closed";
  submittedBy: {
    _id: string;
    name: string;
    role: string;
    department?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoredAlert {
  _id: string;
  reportId: string;
  reportTitle: string;
  riskLevel: "CRITICAL" | "HIGH";
  riskScore: number;
  sifProbability: number;
  message: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface StoredTask {
  _id: string;
  orderNumber: string;
  reportId?: string;
  title: string;
  description: string;
  equipmentId: string;
  equipmentName: string;
  location: string;
  zone: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "dispatched" | "in_progress" | "clearance_submitted" | "officer_verified";
  assignedCrew: string;
  dispatchedBy: {
    name: string;
    role: string;
    badgeId: string;
  };
  safetyPermitId: string;
  lotoRequired: boolean;
  clearanceNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface LocalDatabase {
  users: StoredUser[];
  reports: StoredReport[];
  alerts: StoredAlert[];
  tasks: StoredTask[];
}

function getInitialDatabase(): LocalDatabase {
  const now = new Date().toISOString();
  return {
    users: [
      {
        _id: "usr_worker_01",
        name: "Rajan Mehta",
        email: "worker@plant.com",
        password: hashPassword("password123"),
        role: "worker",
        department: "Operations · Boiler Room B",
        badgeId: "WRK-1082",
        createdAt: now,
      },
      {
        _id: "usr_officer_01",
        name: "Officer Vikram Sharma",
        email: "officer@plant.com",
        password: hashPassword("password123"),
        role: "officer",
        department: "HSE Central Command",
        badgeId: "SAF-4019",
        createdAt: now,
      },
      {
        _id: "usr_maint_01",
        name: "Devon Vance",
        email: "maintenance@plant.com",
        password: hashPassword("password123"),
        role: "maintenance",
        department: "Unit M-4 Reliability Team",
        badgeId: "MNT-4401",
        createdAt: now,
      },
    ],
    reports: [
      {
        _id: "rep_001",
        title: "TK-80 Scaffolding – Missing handrail & perimeter barrier",
        description: "Frontline walkdown noticed 3 meters of perimeter kickboards and outer handrail absent on Tier 3 scaffolding. High fall hazard (SIF Precursor).",
        location: "Sector 4 North, Tank Farm",
        category: "unsafe_condition",
        severity: "critical",
        risk_score: 92,
        risk_level: "CRITICAL",
        sif_probability: 0.88,
        precursors: ["Working at Height Exposure", "Missing Fall Restraint Barrier"],
        hazards: ["Fall from Elevation", "Fatal Traumatic Impact"],
        explanation: "Tier 3 elevation lacking certified guardrails poses immediate SIF risk under OSHA 1926.451.",
        status: "action_assigned",
        submittedBy: {
          _id: "usr_worker_01",
          name: "Rajan Mehta",
          role: "worker",
          department: "Boiler Room B",
        },
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: now,
      },
      {
        _id: "rep_002",
        title: "V-204 Hydrocracker – Radial vibration anomaly on bearing",
        description: "AI vibration telemetry flagged 4.8 mm/s radial spike on feed pump bearing housing.",
        location: "Process Area 2, Hydro Unit",
        category: "equipment_failure",
        severity: "high",
        risk_score: 78,
        risk_level: "HIGH",
        sif_probability: 0.65,
        precursors: ["Rotating Machinery Bearing Failure", "Hydrocarbon Seal Compromise"],
        hazards: ["Mechanical Catastrophic Seizure", "Volatile Fluid Release"],
        explanation: "Excessive vibration exceeds operational baseline threshold of 2.5 mm/s. Immediate balancing under LOTO required.",
        status: "action_assigned",
        submittedBy: {
          _id: "usr_worker_01",
          name: "Rajan Mehta",
          role: "worker",
          department: "Operations",
        },
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: now,
      },
      {
        _id: "rep_003",
        title: "EX-12 Flange Line – Minor oily condensation on lower joint",
        description: "Worker walkdown observed slight weeping and oily condensation on lower flange joint.",
        location: "Cracking Platform East",
        category: "unsafe_condition",
        severity: "medium",
        risk_score: 45,
        risk_level: "MEDIUM",
        sif_probability: 0.28,
        precursors: ["Flange Gasket Degradation"],
        hazards: ["Fluid Leakage", "Surface Slip"],
        explanation: "Low-pressure condensation detected. Requires torque check and optical gas imaging.",
        status: "under_review",
        submittedBy: {
          _id: "usr_worker_01",
          name: "Rajan Mehta",
          role: "worker",
          department: "Operations",
        },
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: now,
      },
    ],
    alerts: [
      {
        _id: "alt_001",
        reportId: "rep_001",
        reportTitle: "TK-80 Scaffolding – Missing handrail & perimeter barrier",
        riskLevel: "CRITICAL",
        riskScore: 92,
        sifProbability: 0.88,
        message: "CRITICAL SIF PRECURSOR: Working at height without certified perimeter guardrail in Sector 4.",
        isAcknowledged: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        _id: "alt_002",
        reportId: "rep_002",
        reportTitle: "V-204 Hydrocracker – Radial vibration anomaly on bearing",
        riskLevel: "HIGH",
        riskScore: 78,
        sifProbability: 0.65,
        message: "HIGH RISK TELEMETRY: 4.8 mm/s radial vibration spike on Hydrocracker Pump C.",
        isAcknowledged: true,
        acknowledgedBy: "Officer Vikram Sharma",
        acknowledgedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
    tasks: [
      {
        _id: "tsk_001",
        orderNumber: "WO-9038",
        reportId: "rep_001",
        title: "TK-80 Scaffolding – Replace outer handrails & safety gates",
        description: "Erect certified 42-inch top-rails, mid-rails, and toe-boards on Tier 3 access walk.",
        equipmentId: "TK-80",
        equipmentName: "Crude Storage Tank Scaffolding",
        location: "Sector 4 North, Tank Farm",
        zone: "Zone TF-4",
        severity: "critical",
        status: "in_progress",
        assignedCrew: "Scaffolding & Rigging Team M-4",
        dispatchedBy: {
          name: "Officer Vikram Sharma",
          role: "Lead Safety Supervisor",
          badgeId: "SAF-4019",
        },
        safetyPermitId: "PTW-2026-0881",
        lotoRequired: true,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: now,
      },
      {
        _id: "tsk_002",
        orderNumber: "WO-9039",
        reportId: "rep_002",
        title: "V-204 Hydrocracker – Dynamic bearing balance & seal inspection",
        description: "Isolate 480V MCC breaker CB-440B under LOTO padlock. Inspect pump bearings.",
        equipmentId: "V-204",
        equipmentName: "Hydrocracker Reactor Vessel Pump C",
        location: "Process Area 2, Hydro Unit",
        zone: "Zone PR-2",
        severity: "high",
        status: "dispatched",
        assignedCrew: "Rotating Machinery Team M-4",
        dispatchedBy: {
          name: "Officer Priya Patel",
          role: "Operations Incident Officer",
          badgeId: "SAF-2184",
        },
        safetyPermitId: "PTW-2026-0879",
        lotoRequired: true,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: now,
      },
    ],
  };
}

function loadLocalStore(): LocalDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initial = getInitialDatabase();
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local db store, using memory fallback:", err);
    return getInitialDatabase();
  }
}

function saveLocalStore(db: LocalDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to local db store:", err);
  }
}

// ─── Unified Database Connection ───────────────────────────────────────────

export async function connectToDatabase() {
  if (MONGO_URI) {
    try {
      if (cached.conn) return cached.conn;
      if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 2000,
        });
      }
      cached.conn = await cached.promise;
      cached.isFallback = false;
      return cached.conn;
    } catch (err) {
      console.warn("MongoDB connection unavailable. Using resilient local store.", err);
      cached.isFallback = true;
    }
  } else {
    cached.isFallback = true;
  }
  return null;
}

// ─── Data Access Helpers (Zero-Crash Across Mongo & Local Store) ────────────

export const dbUsers = {
  async findByEmail(email: string): Promise<StoredUser | null> {
    const db = loadLocalStore();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  async findById(id: string): Promise<StoredUser | null> {
    const db = loadLocalStore();
    return db.users.find((u) => u._id === id) || null;
  },

  async create(userData: Omit<StoredUser, "_id" | "createdAt">): Promise<StoredUser> {
    const db = loadLocalStore();
    const newUser: StoredUser = {
      ...userData,
      _id: "usr_" + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveLocalStore(db);
    return newUser;
  },

  async list(): Promise<StoredUser[]> {
    const db = loadLocalStore();
    return db.users;
  },
};

export const dbReports = {
  async list(filters?: { status?: string; riskLevel?: string; category?: string; limit?: number; page?: number }) {
    const db = loadLocalStore();
    let result = [...db.reports];

    if (filters?.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters?.riskLevel) {
      result = result.filter((r) => r.risk_level === filters.riskLevel);
    }
    if (filters?.category) {
      result = result.filter((r) => r.category === filters.category);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = result.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;
    const paginated = result.slice(skip, skip + limit);

    return { reports: paginated, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  async findById(id: string): Promise<StoredReport | null> {
    const db = loadLocalStore();
    return db.reports.find((r) => r._id === id) || null;
  },

  async create(reportData: Omit<StoredReport, "_id" | "createdAt" | "updatedAt">): Promise<StoredReport> {
    const db = loadLocalStore();
    const now = new Date().toISOString();
    const newReport: StoredReport = {
      ...reportData,
      _id: "rep_" + Math.random().toString(36).substring(2, 10),
      createdAt: now,
      updatedAt: now,
    };
    db.reports.unshift(newReport);
    saveLocalStore(db);
    return newReport;
  },

  async updateById(id: string, updates: Partial<StoredReport>): Promise<StoredReport | null> {
    const db = loadLocalStore();
    const idx = db.reports.findIndex((r) => r._id === id);
    if (idx === -1) return null;
    db.reports[idx] = {
      ...db.reports[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(db);
    return db.reports[idx];
  },
};

export const dbAlerts = {
  async list(unacknowledgedOnly = false): Promise<StoredAlert[]> {
    const db = loadLocalStore();
    let list = [...db.alerts];
    if (unacknowledgedOnly) {
      list = list.filter((a) => !a.isAcknowledged);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(alertData: Omit<StoredAlert, "_id" | "createdAt">): Promise<StoredAlert> {
    const db = loadLocalStore();
    const newAlert: StoredAlert = {
      ...alertData,
      _id: "alt_" + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
    };
    db.alerts.unshift(newAlert);
    saveLocalStore(db);
    return newAlert;
  },

  async acknowledge(id: string, officerName: string): Promise<StoredAlert | null> {
    const db = loadLocalStore();
    const idx = db.alerts.findIndex((a) => a._id === id);
    if (idx === -1) return null;
    db.alerts[idx] = {
      ...db.alerts[idx],
      isAcknowledged: true,
      acknowledgedBy: officerName,
      acknowledgedAt: new Date().toISOString(),
    };
    saveLocalStore(db);
    return db.alerts[idx];
  },
};

export const dbTasks = {
  async list(filter?: { status?: string }): Promise<StoredTask[]> {
    const db = loadLocalStore();
    let list = [...db.tasks];
    if (filter?.status) {
      list = list.filter((t) => t.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findById(id: string): Promise<StoredTask | null> {
    const db = loadLocalStore();
    return db.tasks.find((t) => t._id === id || t.orderNumber === id) || null;
  },

  async create(taskData: Omit<StoredTask, "_id" | "createdAt" | "updatedAt">): Promise<StoredTask> {
    const db = loadLocalStore();
    const now = new Date().toISOString();
    const orderNum = "WO-" + (9040 + db.tasks.length);
    const newTask: StoredTask = {
      ...taskData,
      orderNumber: taskData.orderNumber || orderNum,
      _id: "tsk_" + Math.random().toString(36).substring(2, 10),
      createdAt: now,
      updatedAt: now,
    };
    db.tasks.unshift(newTask);
    saveLocalStore(db);
    return newTask;
  },

  async updateStatus(id: string, status: StoredTask["status"], clearanceNote?: string): Promise<StoredTask | null> {
    const db = loadLocalStore();
    const idx = db.tasks.findIndex((t) => t._id === id || t.orderNumber === id);
    if (idx === -1) return null;
    db.tasks[idx] = {
      ...db.tasks[idx],
      status,
      ...(clearanceNote ? { clearanceNote } : {}),
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(db);
    return db.tasks[idx];
  },
};

export const dbStats = {
  async getDashboardStats() {
    const db = loadLocalStore();
    const totalReports = db.reports.length;
    const criticalAlerts = db.alerts.filter((a) => !a.isAcknowledged && a.riskLevel === "CRITICAL").length;
    const openTasks = db.tasks.filter((t) => t.status === "dispatched" || t.status === "in_progress").length;
    const resolvedToday = db.tasks.filter((t) => t.status === "clearance_submitted" || t.status === "officer_verified").length;

    const riskDistribution = {
      CRITICAL: db.reports.filter((r) => r.risk_level === "CRITICAL").length,
      HIGH: db.reports.filter((r) => r.risk_level === "HIGH").length,
      MEDIUM: db.reports.filter((r) => r.risk_level === "MEDIUM").length,
      LOW: db.reports.filter((r) => r.risk_level === "LOW").length,
    };

    return {
      stats: {
        totalReports,
        criticalAlerts,
        openTasks,
        resolvedToday,
      },
      recentReports: db.reports.slice(0, 5),
      recentAlerts: db.alerts.slice(0, 5),
      riskDistribution,
    };
  },
};
