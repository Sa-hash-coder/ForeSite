# ForeSite — REST API Contract

> **CRITICAL RULE**: This document is the source of truth for all API communication.
> No developer may change request/response shapes without updating this document first.
> Frontend developers must consume exactly these formats. Backend must produce exactly these formats.

---

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://foresite-api.onrender.com/api`

Frontend uses `VITE_API_URL` environment variable.

---

## Common Response Envelope

All endpoints return this envelope:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Paginated Success:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

---

## Authentication Endpoints

### POST /api/auth/login

Login with email and password.

- **Auth required**: No
- **Role required**: None

**Request Body:**
```json
{
  "email": "rajan@plant.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64a1...",
      "name": "Rajan Mehta",
      "email": "rajan@plant.com",
      "role": "worker",
      "department": "Boiler Room B"
    },
    "token": "eyJhbGci..."
  }
}
```

**Errors:** `400` (validation), `401` (invalid credentials), `403` (account deactivated)

---

### POST /api/auth/register

Register a new user.

- **Auth required**: No (or Admin only in production — for demo, open)
- **Role required**: None

**Request Body:**
```json
{
  "name": "Rajan Mehta",
  "email": "rajan@plant.com",
  "password": "password123",
  "role": "worker",
  "department": "Boiler Room B"
}
```

**Validation:**
- `name`: required, 2–100 chars
- `email`: required, valid email, unique
- `password`: required, min 6 chars
- `role`: required, one of `['worker', 'safety_officer', 'maintenance', 'admin']`
- `department`: optional

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGci..."
  }
}
```

**Errors:** `400` (validation), `409` (email exists)

---

### GET /api/auth/me

Get current authenticated user profile.

- **Auth required**: Yes
- **Role required**: Any

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "64a1...",
    "name": "Rajan Mehta",
    "email": "rajan@plant.com",
    "role": "worker",
    "department": "Boiler Room B"
  }
}
```

**Errors:** `401` (no/invalid token)

---

## Report Endpoints

### POST /api/reports

Submit a new safety report.

- **Auth required**: Yes
- **Role required**: `worker`

**Request Body:**
```json
{
  "title": "Exposed electrical wiring near water pump",
  "description": "Found bare copper wiring approximately 2 meters from the main water pump...",
  "location": "Sector 4, Water Treatment Plant",
  "category": "unsafe_condition",
  "severity": "high",
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
  "audioUrl": "data:audio/webm;base64,GkXfo..."
}
```

**Validation:**
- `title`: required, 5–200 chars
- `description`: required, min 20 chars
- `location`: required
- `category`: required, one of `['near_miss', 'unsafe_condition', 'unsafe_act', 'equipment_failure', 'chemical_exposure', 'other']`
- `severity`: required, one of `['low', 'medium', 'high', 'critical']`
- `imageUrl`: optional, base64 data URI (max 10MB)
- `audioUrl`: optional, base64 data URI for voice note (webm/mp3/wav, max 2 min)

> **Image + Audio Handling**: The backend forwards `imageUrl` and `audioUrl` to the AI service. Gemini API extracts hazard descriptions from the image and transcribes the voice note. The extracted text is merged with the written description before SIF risk analysis. See `docs/ai-contract.md` for full pipeline details.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "64b2...",
    "title": "Exposed electrical wiring near water pump",
    "status": "pending_analysis",
    "submittedBy": { "_id": "64a1...", "name": "Rajan Mehta" },
    "createdAt": "2026-09-05T09:15:00Z"
  }
}
```

**Side Effects:** Triggers async AI analysis. Report status will change to `analysis_complete` after AI responds.

**Errors:** `400` (validation), `401`, `403`

---

### GET /api/reports

Get reports list (filtered by role).

- **Auth required**: Yes
- **Role required**: Any
  - `worker`: sees only own reports
  - `safety_officer`, `admin`: sees all reports
  - `maintenance`: sees reports linked to their tasks

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by status |
| `riskLevel` | string | Filter by risk level (LOW/MEDIUM/HIGH/CRITICAL) |
| `category` | string | Filter by category |
| `page` | number | Default: 1 |
| `limit` | number | Default: 20, max: 100 |
| `sortBy` | string | Default: `createdAt` |
| `sortOrder` | string | `asc` or `desc` (default: `desc`) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64b2...",
      "title": "Exposed electrical wiring near water pump",
      "location": "Sector 4",
      "category": "unsafe_condition",
      "severity": "high",
      "status": "analysis_complete",
      "submittedBy": { "_id": "64a1...", "name": "Rajan Mehta" },
      "riskAssessment": {
        "riskScore": 87,
        "riskLevel": "CRITICAL",
        "sifProbability": 0.82
      },
      "createdAt": "2026-09-05T09:15:00Z"
    }
  ],
  "pagination": { "total": 45, "page": 1, "limit": 20, "totalPages": 3 }
}
```

**Errors:** `401`, `403`

---

### GET /api/reports/:id

Get a single report with full details.

- **Auth required**: Yes
- **Role required**: Any (worker sees own only)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "64b2...",
    "title": "Exposed electrical wiring near water pump",
    "description": "Found bare copper wiring...",
    "location": "Sector 4, Water Treatment Plant",
    "category": "unsafe_condition",
    "severity": "high",
    "imageUrl": null,
    "status": "analysis_complete",
    "submittedBy": { "_id": "64a1...", "name": "Rajan Mehta", "department": "Boiler Room B" },
    "riskAssessment": {
      "riskScore": 87,
      "riskLevel": "CRITICAL",
      "sifProbability": 0.82,
      "precursors": ["Energized Equipment Exposure", "Inadequate Isolation/Lockout"],
      "hazards": ["Electrocution", "Arc Flash"],
      "explanation": "This report describes..."
    },
    "maintenanceTasks": [
      {
        "_id": "64e5...",
        "title": "Replace and properly insulate exposed wiring",
        "status": "assigned",
        "assignedTo": { "name": "Vikram Singh" },
        "dueDate": "2026-09-06T17:00:00Z"
      }
    ],
    "createdAt": "2026-09-05T09:15:00Z",
    "updatedAt": "2026-09-05T09:15:45Z"
  }
}
```

**Errors:** `401`, `403`, `404`

---

### PATCH /api/reports/:id

Update report status (officer only, for closing/reviewing).

- **Auth required**: Yes
- **Role required**: `safety_officer`, `admin`

**Request Body:**
```json
{
  "status": "closed"
}
```

**Allowed status transitions:**
- `under_review` → `action_assigned` (when task created)
- `action_assigned` → `resolved` (when task verified)
- `resolved` → `closed`

**Response 200:**
```json
{
  "success": true,
  "data": { ...updatedReport }
}
```

**Errors:** `400`, `401`, `403`, `404`

---

## Dashboard Endpoint

### GET /api/dashboard

Get aggregated statistics for the safety officer dashboard.

- **Auth required**: Yes
- **Role required**: `safety_officer`, `admin`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalReports": 142,
      "criticalAlerts": 3,
      "pendingAnalysis": 5,
      "openTasks": 12,
      "resolvedToday": 4
    },
    "recentReports": [
      {
        "_id": "64b2...",
        "title": "Exposed electrical wiring...",
        "riskLevel": "CRITICAL",
        "riskScore": 87,
        "status": "analysis_complete",
        "createdAt": "2026-09-05T09:15:00Z"
      }
    ],
    "riskDistribution": {
      "LOW": 45,
      "MEDIUM": 67,
      "HIGH": 22,
      "CRITICAL": 8
    },
    "trendData": [
      { "date": "2026-09-01", "reports": 8, "critical": 1 },
      { "date": "2026-09-02", "reports": 12, "critical": 2 }
    ]
  }
}
```

**Errors:** `401`, `403`

---

## Alert Endpoints

### GET /api/alerts

Get all active (unacknowledged) alerts.

- **Auth required**: Yes
- **Role required**: `safety_officer`, `admin`

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `isAcknowledged` | boolean | Filter acknowledged/unacknowledged |
| `riskLevel` | string | Filter by HIGH or CRITICAL |
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64d4...",
      "reportId": { "_id": "64b2...", "title": "Exposed electrical wiring..." },
      "riskLevel": "CRITICAL",
      "riskScore": 87,
      "sifProbability": 0.82,
      "message": "CRITICAL: Exposed electrical wiring near water source — SIF precursors detected.",
      "isAcknowledged": false,
      "createdAt": "2026-09-05T09:15:46Z"
    }
  ],
  "pagination": { ... }
}
```

---

### PATCH /api/alerts/:id/acknowledge

Acknowledge an alert.

- **Auth required**: Yes
- **Role required**: `safety_officer`, `admin`

**Request Body:** (empty)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "64d4...",
    "isAcknowledged": true,
    "acknowledgedBy": "64a5...",
    "acknowledgedAt": "2026-09-05T10:00:00Z"
  }
}
```

**Errors:** `401`, `403`, `404`

---

## Maintenance Task Endpoints

### POST /api/tasks

Create a maintenance task (officer assigns).

- **Auth required**: Yes
- **Role required**: `safety_officer`, `admin`

**Request Body:**
```json
{
  "reportId": "64b2...",
  "title": "Replace and properly insulate exposed wiring in Sector 4",
  "description": "Immediately isolate the circuit. Replace stripped copper wiring...",
  "assignedTo": "64a1b2c3d4e5f6a7b8c9d0e9",
  "priority": "critical",
  "dueDate": "2026-09-06T17:00:00Z"
}
```

**Validation:**
- `reportId`: required, valid ObjectId
- `title`: required, 5–200 chars
- `assignedTo`: required, valid ObjectId of maintenance user
- `priority`: required, one of `['low', 'medium', 'high', 'critical']`
- `dueDate`: required, ISO date string, must be in future

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "64e5...",
    "reportId": "64b2...",
    "title": "Replace and properly insulate exposed wiring...",
    "assignedTo": { "_id": "64a9...", "name": "Vikram Singh" },
    "assignedBy": { "_id": "64a5...", "name": "Dr. Ananya Sharma" },
    "priority": "critical",
    "dueDate": "2026-09-06T17:00:00Z",
    "status": "assigned",
    "createdAt": "2026-09-05T10:30:00Z"
  }
}
```

**Errors:** `400`, `401`, `403`, `404`

---

### GET /api/tasks

Get tasks list (filtered by role).

- **Auth required**: Yes
- **Role required**: Any
  - `maintenance`: sees only own assigned tasks
  - `safety_officer`, `admin`: sees all tasks

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by status |
| `priority` | string | Filter by priority |
| `assignedTo` | string | Filter by assignee (officer use) |
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64e5...",
      "reportId": { "_id": "64b2...", "title": "Exposed electrical wiring..." },
      "title": "Replace and properly insulate...",
      "priority": "critical",
      "status": "assigned",
      "dueDate": "2026-09-06T17:00:00Z",
      "assignedTo": { "name": "Vikram Singh" }
    }
  ],
  "pagination": { ... }
}
```

---

### GET /api/tasks/:id

Get a single task with full details.

- **Auth required**: Yes
- **Role required**: `maintenance` (own tasks), `safety_officer`, `admin`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "64e5...",
    "reportId": {
      "_id": "64b2...",
      "title": "Exposed electrical wiring...",
      "location": "Sector 4",
      "description": "Found bare copper wiring...",
      "riskAssessment": {
        "riskScore": 87,
        "riskLevel": "CRITICAL",
        "precursors": ["Energized Equipment Exposure"]
      }
    },
    "title": "Replace and properly insulate exposed wiring",
    "description": "Immediately isolate the circuit...",
    "priority": "critical",
    "status": "in_progress",
    "dueDate": "2026-09-06T17:00:00Z",
    "assignedTo": { "name": "Vikram Singh", "email": "vikram@plant.com" },
    "assignedBy": { "name": "Dr. Ananya Sharma" },
    "resolutionNotes": null,
    "proofImageUrl": null,
    "createdAt": "2026-09-05T10:30:00Z"
  }
}
```

---

### PATCH /api/tasks/:id

Update task status (maintenance resolves, officer verifies).

- **Auth required**: Yes
- **Role required**: `maintenance` (for `in_progress`, `resolved`), `safety_officer` (for `verified`)

**Request Body (maintenance updating):**
```json
{
  "status": "resolved",
  "resolutionNotes": "Replaced the exposed wiring with properly rated insulated cable. Applied lockout/tagout during repair. Tested with electrical meter — no continuity to ground.",
  "proofImageUrl": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Request Body (officer verifying):**
```json
{
  "status": "verified"
}
```

**Allowed status transitions:**
- `assigned` → `in_progress` (maintenance)
- `in_progress` → `resolved` (maintenance, must include `resolutionNotes`)
- `resolved` → `verified` (safety_officer only)

**Response 200:**
```json
{
  "success": true,
  "data": { ...updatedTask }
}
```

**Errors:** `400`, `401`, `403`, `404`

---

## AI Analysis Endpoint

### POST /api/ai/analyze

Manually re-trigger AI analysis for a report (for debugging/retry).

- **Auth required**: Yes
- **Role required**: `safety_officer`, `admin`

**Request Body:**
```json
{
  "reportId": "64b2..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "riskScore": 87,
    "riskLevel": "CRITICAL",
    "sifProbability": 0.82,
    "precursors": ["Energized Equipment Exposure"],
    "hazards": ["Electrocution", "Arc Flash"],
    "explanation": "..."
  }
}
```

**Errors:** `400`, `401`, `403`, `404`, `502` (AI service unavailable)

---

## User Management (Admin)

### GET /api/admin/users

Get all users (admin only).

- **Auth required**: Yes
- **Role required**: `admin`

**Query Parameters:** `role`, `isActive`, `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [ ...users ],
  "pagination": { ... }
}
```

### GET /api/admin/maintenance-users

Get all users with `maintenance` role (for officer's assignment dropdown).

- **Auth required**: Yes
- **Role required**: `safety_officer`, `admin`

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "_id": "64a9...", "name": "Vikram Singh", "department": "Electrical" }
  ]
}
```

### PATCH /api/admin/users/:id

Update user (activate/deactivate/change role).

- **Auth required**: Yes
- **Role required**: `admin`

---

## Health Check

### GET /api/health

- **Auth required**: No

**Response 200:**
```json
{
  "status": "UP",
  "timestamp": "2026-09-05T09:00:00Z",
  "environment": "production",
  "aiService": "UP"
}
```

---

## Status Code Reference

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |
| 502 | Bad Gateway (AI service down) |
