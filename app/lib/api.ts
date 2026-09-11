/**
 * API client for ForeSite backend.
 * All calls go through here — adds auth token automatically.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Something went wrong. Please try again.");
  }

  return json;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function loginApi(email: string, password: string) {
  return request<{ success: true; data: { user: User; token: string } }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function getMeApi() {
  return request<{ success: true; data: User }>("/auth/me");
}

// ── Reports ──────────────────────────────────────────────────────────────────

export async function submitReportApi(payload: ReportPayload) {
  return request<{ success: true; data: ReportSummary }>("/reports", {
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

export async function getReportByIdApi(id: string) {
  return request<{ success: true; data: ReportDetail }>(`/reports/${id}`);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "worker" | "safety_officer" | "maintenance" | "admin";
  department?: string;
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
  };
  createdAt: string;
}

export interface ReportDetail extends ReportSummary {
  description: string;
  imageUrl?: string;
  submittedBy: { _id: string; name: string; department?: string };
  riskAssessment?: {
    riskScore: number;
    riskLevel: string;
    sifProbability: number;
    precursors: string[];
    hazards: string[];
    explanation: string;
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

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
