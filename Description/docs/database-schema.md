# SIF-Sentinel — Database Schema

## Collections Overview

```
users
reports
risk_assessments
alerts
maintenance_tasks
```

> **Principle**: Every collection is linked by ObjectId references. No embedded documents for cross-collection data. No unnecessary collections.

---

## 1. `users`

Extends the existing User model. Add `worker`, `safety_officer`, `maintenance`, `admin` roles.

### Schema

```js
{
  _id: ObjectId,
  name: String,           // required, 2–100 chars
  email: String,          // required, unique, lowercase
  password: String,       // required, bcrypt hashed
  role: String,           // enum: ['worker', 'safety_officer', 'maintenance', 'admin']
  department: String,     // optional — worker's department/area
  isActive: Boolean,      // default: true
  lastLogin: Date,        // updated on login
  createdAt: Date         // auto
}
```

### Indexes
- `email` — unique (already exists)
- `role` — for role-based queries

### Relationships
- `users._id` → referenced by `reports.submittedBy`
- `users._id` → referenced by `maintenance_tasks.assignedTo`

### Example Document
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Rajan Mehta",
  "email": "rajan@plant.com",
  "password": "$2b$12$hashed...",
  "role": "worker",
  "department": "Boiler Room B",
  "isActive": true,
  "lastLogin": "2026-09-05T08:00:00Z",
  "createdAt": "2026-09-01T10:00:00Z"
}
```

---

## 2. `reports`

Core collection. Every safety observation/incident submitted by a worker.

### Schema

```js
{
  _id: ObjectId,
  title: String,              // required, 5–200 chars
  description: String,        // required, min 20 chars
  location: String,           // required, e.g. "Boiler Room B, Unit 3"
  category: String,           // enum: ['near_miss', 'unsafe_condition', 'unsafe_act', 'equipment_failure', 'chemical_exposure', 'other']
  severity: String,           // enum: ['low', 'medium', 'high', 'critical'] — worker's self-assessment
  imageUrl: String,           // optional, base64 or URL (photo of hazard)
  audioUrl: String,           // optional, base64 audio — voice note from worker
  submittedBy: ObjectId,      // ref: users, required
  status: String,             // enum: ['pending_analysis', 'analysis_complete', 'under_review', 'action_assigned', 'resolved', 'closed']
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `submittedBy` — for worker's own report history
- `status` — for officer's dashboard filters
- `createdAt` — for sorting (default sort)
- `{ status: 1, createdAt: -1 }` — compound for dashboard queries

### Relationships
- `reports._id` → referenced by `risk_assessments.reportId`
- `reports._id` → referenced by `alerts.reportId`
- `reports._id` → referenced by `maintenance_tasks.reportId`

### Example Document
```json
{
  "_id": "64b2c3d4e5f6a7b8c9d0e2f3",
  "title": "Exposed electrical wiring near water pump",
  "description": "Found bare copper wiring approximately 2 meters from the main water pump in Sector 4. Wire insulation is completely stripped. Risk of electrocution if water contacts the wire during maintenance.",
  "location": "Sector 4, Water Treatment Plant",
  "category": "unsafe_condition",
  "severity": "high",
  "imageUrl": null,
  "submittedBy": "64a1b2c3d4e5f6a7b8c9d0e1",
  "status": "analysis_complete",
  "createdAt": "2026-09-05T09:15:00Z",
  "updatedAt": "2026-09-05T09:15:45Z"
}
```

---

## 3. `risk_assessments`

AI-generated analysis output. One-to-one with each report.

### Schema

```js
{
  _id: ObjectId,
  reportId: ObjectId,         // ref: reports, required, unique
  riskScore: Number,          // 0–100
  riskLevel: String,          // enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  sifProbability: Number,     // 0.0–1.0
  precursors: [String],       // list of detected SIF precursor labels
  hazards: [String],          // list of identified hazard types
  explanation: String,        // human-readable explanation from AI
  modelVersion: String,       // AI model/pipeline version (for tracking)
  processingTimeMs: Number,   // how long AI took
  isFallback: Boolean,        // true if rule-based fallback was used
  createdAt: Date
}
```

### Indexes
- `reportId` — unique (one per report)
- `riskLevel` — for alert filtering
- `sifProbability` — for priority sorting

### Example Document
```json
{
  "_id": "64c3d4e5f6a7b8c9d0e3f4a5",
  "reportId": "64b2c3d4e5f6a7b8c9d0e2f3",
  "riskScore": 87,
  "riskLevel": "CRITICAL",
  "sifProbability": 0.82,
  "precursors": [
    "Energized Equipment Exposure",
    "Inadequate Isolation/Lockout",
    "Proximity to Electrical Hazard"
  ],
  "hazards": [
    "Electrocution",
    "Arc Flash",
    "Burns"
  ],
  "explanation": "This report describes exposed energized wiring in proximity to water sources. The combination of electrical exposure, proximity to liquid, and lack of mention of lockout/tagout procedures are classic SIF precursors associated with electrocution fatalities.",
  "modelVersion": "v1.0-hybrid",
  "processingTimeMs": 340,
  "isFallback": false,
  "createdAt": "2026-09-05T09:15:45Z"
}
```

---

## 4. `alerts`

Auto-generated when AI produces HIGH or CRITICAL risk. Tracks officer acknowledgment.

### Schema

```js
{
  _id: ObjectId,
  reportId: ObjectId,         // ref: reports, required
  riskLevel: String,          // enum: ['HIGH', 'CRITICAL']
  riskScore: Number,          // snapshot of score at alert creation
  sifProbability: Number,     // snapshot
  message: String,            // short auto-generated alert message
  isAcknowledged: Boolean,    // default: false
  acknowledgedBy: ObjectId,   // ref: users (safety_officer)
  acknowledgedAt: Date,
  createdAt: Date
}
```

### Indexes
- `reportId`
- `isAcknowledged` — for unacknowledged alert count
- `createdAt` — for sorting

### Example Document
```json
{
  "_id": "64d4e5f6a7b8c9d0e4f5a6b7",
  "reportId": "64b2c3d4e5f6a7b8c9d0e2f3",
  "riskLevel": "CRITICAL",
  "riskScore": 87,
  "sifProbability": 0.82,
  "message": "CRITICAL: Exposed electrical wiring near water source — SIF precursors detected. Immediate action required.",
  "isAcknowledged": false,
  "acknowledgedBy": null,
  "acknowledgedAt": null,
  "createdAt": "2026-09-05T09:15:46Z"
}
```

---

## 5. `maintenance_tasks`

Created by safety officers. Assigned to maintenance team for resolution.

### Schema

```js
{
  _id: ObjectId,
  reportId: ObjectId,         // ref: reports, required
  title: String,              // required
  description: String,        // corrective action instructions
  assignedTo: ObjectId,       // ref: users (maintenance role), required
  assignedBy: ObjectId,       // ref: users (safety_officer role), required
  priority: String,           // enum: ['low', 'medium', 'high', 'critical']
  dueDate: Date,              // required
  status: String,             // enum: ['assigned', 'in_progress', 'resolved', 'verified']
  resolutionNotes: String,    // filled by maintenance on completion
  proofImageUrl: String,      // optional image upload by maintenance
  verifiedBy: ObjectId,       // ref: users (safety_officer)
  verifiedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `reportId`
- `assignedTo` — for maintenance team's task list
- `status` — for dashboard filters
- `priority, dueDate` — for sorting

### Example Document
```json
{
  "_id": "64e5f6a7b8c9d0e5f6a7b8c9",
  "reportId": "64b2c3d4e5f6a7b8c9d0e2f3",
  "title": "Replace and properly insulate exposed wiring in Sector 4",
  "description": "Immediately isolate the circuit. Replace stripped copper wiring with properly rated insulated cable. Apply lockout/tagout procedure during repair. Verify with electrical test equipment before re-energizing.",
  "assignedTo": "64a1b2c3d4e5f6a7b8c9d0e9",
  "assignedBy": "64a1b2c3d4e5f6a7b8c9d0e5",
  "priority": "critical",
  "dueDate": "2026-09-06T17:00:00Z",
  "status": "assigned",
  "resolutionNotes": null,
  "proofImageUrl": null,
  "verifiedBy": null,
  "verifiedAt": null,
  "createdAt": "2026-09-05T10:30:00Z",
  "updatedAt": "2026-09-05T10:30:00Z"
}
```

---

## Document Relationship Diagram

```
users
  |
  |--- submittedBy --> reports
  |                       |
  |                       |--- reportId --> risk_assessments (1:1)
  |                       |
  |                       |--- reportId --> alerts (1:1 for HIGH/CRITICAL)
  |                       |
  |                       |--- reportId --> maintenance_tasks (1:many)
  |
  |--- assignedTo  --> maintenance_tasks
  |--- assignedBy  --> maintenance_tasks
  |--- acknowledgedBy --> alerts
  |--- verifiedBy  --> maintenance_tasks
```

---

## Migration Strategy

The existing `users` collection must be **extended** (not replaced):
1. Add `department` field (optional, no migration needed for existing users)
2. Change `role` enum values: existing roles (`club_lead`, `cabinet`, `operations`, `admin`) must be REPLACED with new SIF-Sentinel roles (`worker`, `safety_officer`, `maintenance`, `admin`)
3. The new collections (`reports`, `risk_assessments`, `alerts`, `maintenance_tasks`) are all NEW — no migration needed

> **IMPORTANT**: The `admin` role name is kept for compatibility. All other role names change.
