/**
 * ForeSite Unified Client API
 * Connects directly to Next.js API route handlers (/api/...)
 */

const BASE_URL =
  typeof window !== "undefined"
    ? "" // Client-side: use relative path so it calls the Next.js server directly
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("foresite_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Ensure path starts with /api if not already present
  const endpoint = path.startsWith("/api") ? path : `/api${path}`;
  const fullUrl = `${BASE_URL}${endpoint}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.message || "Request failed. Please check network connection.");
  }

  return json;
}

// ── Auth Endpoints ──────────────────────────────────────────────────────────

export async function loginApi(email: string, password: string) {
  return request<{ success: true; data: { user: User; token: string } }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function registerApi(payload: {
  name: string;
  email: string;
  password: string;
  role: "worker" | "officer" | "maintenance";
  department?: string;
}) {
  return request<{ success: true; data: { user: User; token: string } }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function getMeApi() {
  return request<{ success: true; data: User }>("/auth/me");
}

// ── Report Endpoints ────────────────────────────────────────────────────────

export async function submitReportApi(payload: ReportPayload) {
  return request<{ success: true; data: ReportDetail }>("/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyReportsApi(page = 1) {
  return request<{
    success: true;
    data: ReportSummary[];
    pagination: Pagination;
  }>(`/reports?page=${page}&limit=20`);
}

export async function getAllReportsApi(filters?: {
  status?: string;
  riskLevel?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.riskLevel) params.set("riskLevel", filters.riskLevel);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));

  const query = params.toString() ? `?${params.toString()}` : "";
  return request<{
    success: true;
    data: ReportSummary[];
    pagination: Pagination;
  }>(`/reports${query}`);
}

export async function getReportByIdApi(id: string) {
  return request<{ success: true; data: ReportDetail }>(`/reports/${id}`);
}

export async function updateReportStatusApi(id: string, status: string) {
  return request<{ success: true; data: ReportDetail }>(`/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ── Alerts Endpoints ────────────────────────────────────────────────────────

export async function getAlertsApi(unacknowledgedOnly = false) {
  const q = unacknowledgedOnly ? "?unacknowledgedOnly=true" : "";
  return request<{ success: true; data: AlertItem[] }>(`/alerts${q}`);
}

export async function acknowledgeAlertApi(id: string, officerName?: string) {
  return request<{ success: true; data: AlertItem }>(`/alerts`, {
    method: "PATCH",
    body: JSON.stringify({ id, officerName }),
  });
}

// ── Maintenance Tasks / Work Orders Endpoints ───────────────────────────────

export async function getTasksApi(status?: string) {
  const q = status ? `?status=${status}` : "";
  return request<{ success: true; data: TaskItem[] }>(`/tasks${q}`);
}

export async function createTaskApi(payload: {
  title: string;
  description?: string;
  equipmentId?: string;
  equipmentName?: string;
  location?: string;
  severity?: string;
  assignedCrew?: string;
  lotoRequired?: boolean;
  reportId?: string;
}) {
  return request<{ success: true; data: TaskItem }>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTaskStatusApi(
  id: string,
  status: "dispatched" | "in_progress" | "clearance_submitted" | "officer_verified",
  clearanceNote?: string
) {
  return request<{ success: true; data: TaskItem }>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, clearanceNote }),
  });
}

// ── Dashboard Statistics Endpoint ───────────────────────────────────────────

export async function getDashboardStatsApi() {
  return request<{
    success: true;
    data: {
      stats: {
        totalReports: number;
        criticalAlerts: number;
        openTasks: number;
        resolvedToday: number;
      };
      recentReports: ReportSummary[];
      recentAlerts: AlertItem[];
      riskDistribution: Record<string, number>;
    };
  }>("/dashboard");
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "worker" | "safety_officer" | "officer" | "maintenance" | "admin";
  department?: string;
  badgeId?: string;
}

export interface ReportPayload {
  title: string;
  description: string;
  location: string;
  category: string;
  severity: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface ReportSummary {
  _id: string;
  title: string;
  location: string;
  category: string;
  severity: string;
  status: string;
  imageUrl?: string;
  riskAssessment?: {
    riskScore: number;
    riskLevel: string;
    sifProbability: number;
    precursors?: string[];
    hazards?: string[];
    explanation?: string;
  };
  submittedBy?: {
    _id: string;
    name: string;
    role?: string;
    department?: string;
  };
  createdAt: string;
}

export interface ReportDetail extends ReportSummary {
  description: string;
  imageUrl?: string;
  audioUrl?: string;
  submittedBy?: {
    _id: string;
    name: string;
    role?: string;
    department?: string;
  };
  maintenanceTasks?: {
    _id: string;
    title: string;
    status: string;
    assignedTo?: { name: string };
    dueDate?: string;
  }[];
  updatedAt: string;
}

export interface AlertItem {
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

export interface TaskItem {
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

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
