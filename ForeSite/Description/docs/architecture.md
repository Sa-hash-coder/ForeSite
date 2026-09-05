# SIF-Sentinel — System Architecture

## Overview

SIF-Sentinel is an AI-powered industrial safety intelligence platform. It processes safety/incident reports, identifies Serious Injury and Fatality (SIF) precursors, scores risk, and routes corrective actions through a closed-loop workflow.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 + Recharts |
| State Management | Zustand |
| HTTP Client | Axios |
| Forms | react-hook-form + zod |
| Backend | Node.js + Express v5 |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| AI Service | Python (Flask) + Sentence Transformers + rule-based risk engine |
| Frontend Hosting | Vercel (or similar static host) |
| Backend Hosting | Render |
| AI Service Hosting | Render |
| DB Hosting | MongoDB Atlas |

> **NOTE**: The existing codebase is React + Vite (NOT Next.js). Do NOT introduce Next.js. The existing stack is retained and adapted.

---

## High-Level Architecture

```
Worker (Browser)
       |
       v
React Frontend (Vite + React 19)
       |  [HTTP REST — Axios]
       v
Express.js Backend (Node.js)
       |                    \
       v                     v
MongoDB Atlas        Python AI Service (Flask)
(persistence)        (risk scoring + SIF detection)
                             |
                             v
                     Rule Engine + Sentence Transformers
                     (semantic similarity, precursor KB)
```

---

## Data Flow: Complete End-to-End

```
1. Worker logs in → JWT issued → stored in localStorage
2. Worker fills Report Form → POST /api/reports
3. Backend validates → saves Report (status: pending_analysis) to MongoDB
4. Backend calls POST http://ai-service/analyze (async or sync)
5. AI Service processes text → returns RiskAssessment JSON
6. Backend saves RiskAssessment → updates Report status → creates Alert if HIGH/CRITICAL
7. Safety Officer dashboard polls/loads → GET /api/dashboard
8. Officer views Report → sees AI risk score + SIF precursors
9. Officer assigns task → POST /api/tasks
10. Maintenance sees task → PATCH /api/tasks/:id (status updates)
11. Maintenance resolves → PATCH /api/tasks/:id (status: resolved + notes)
12. Officer verifies → PATCH /api/tasks/:id (status: verified)
13. Report closed → PATCH /api/reports/:id (status: closed)
```

---

## Component Ownership

| Component | Owns | Must Not Touch |
|---|---|---|
| React Frontend | src/ | server/, ai-service/ |
| Express Backend | server/ | src/, ai-service/ (except HTTP calls) |
| AI Service | ai-service/ | server/, src/ |
| MongoDB | Atlas cloud | All code must go through Mongoose models |

---

## Authentication & Authorization Flow

```
Login → POST /api/auth/login → JWT (payload: { id, email, role })
                                       |
                            All subsequent requests:
                            Authorization: Bearer <token>
                                       |
                            auth.js middleware verifies JWT
                                       |
                            roleGuard.js checks role vs allowed roles
```

**Roles for SIF-Sentinel:**
- `worker` — submits reports
- `safety_officer` — views AI analysis, assigns tasks
- `maintenance` — resolves assigned tasks
- `admin` — user management, system config

---

## AI Service Architecture

```
POST /analyze
    |
    v
STAGE 1 — MULTIMODAL EXTRACTION (Gemini API)
    |
    ├── image_base64 → Gemini 1.5 Flash Vision → "hazard description text"
    ├── audio_base64 → Gemini 1.5 Flash Audio  → "voice transcript + key facts"
    └── (if Gemini unavailable → skip silently, use text only, extraction_fallback: true)
    |
    v
Combined Text Corpus:
[Written description] + [Image hazard description] + [Audio transcript]
    |
    v
STAGE 2 — CUSTOM SIF ANALYSIS (Our Model)
    |
    ├── Text Preprocessing (clean, normalize, merge sources)
    ├── Sentence Embedding (all-MiniLM-L6-v2)
    ├── Cosine Similarity vs SIF Precursor Knowledge Base (50 entries)
    ├── Rule-Based Hazard Classifier (keyword + pattern matching)
    ├── Weighted Risk Score Calculator (+ context bonus if image/audio)
    └── Template-Based Explanation Generator
    |
    v
JSON Response { risk_score, risk_level, sif_probability, precursors,
                hazards, explanation, extracted_image_context,
                extracted_audio_context, is_fallback, extraction_fallback }
```

**Why this approach:**
- Our custom model only trains on text — much simpler, much faster to build
- Gemini handles computer vision and speech at state-of-the-art quality with zero training
- Gemini's hazard descriptions are often richer than a small custom vision model would produce
- Free tier (Gemini 1.5 Flash): 15 req/min, 1M tokens/day — sufficient for demo
- If Gemini is unavailable, Stage 2 runs on text only — service never goes down

---

## File/Directory Boundaries

```
even_pro/
├── src/                    ← FRONTEND ONLY (Person 2, 3, 4)
│   ├── api/               ← API client layer (all HTTP calls go here)
│   ├── components/        ← Shared UI components
│   ├── pages/             ← Role-specific pages
│   ├── stores/            ← Zustand state
│   ├── guards/            ← Route guards
│   └── hooks/             ← Custom hooks
├── server/                 ← BACKEND ONLY (Person 6)
│   ├── models/            ← Mongoose schemas
│   ├── routes/            ← Express route definitions
│   ├── controllers/       ← Thin request/response handlers
│   ├── services/          ← Business logic
│   ├── middleware/        ← auth, roleGuard, errorHandler, validate
│   ├── utils/             ← ApiError, helpers, constants
│   └── config/            ← db.js
├── ai-service/             ← AI ONLY (Person 5) [NEW]
│   ├── main.py            ← Flask app entry point
│   ├── analyzer.py        ← Core analysis pipeline
│   ├── precursor_kb.py    ← SIF precursor knowledge base
│   ├── risk_scorer.py     ← Risk scoring logic
│   ├── requirements.txt
│   └── Dockerfile
├── docs/                   ← SHARED TRUTH (Person 1 owns)
├── mock/                   ← Mock data (Person 1 creates, all consume)
└── AGENTS.md               ← AI agent rules
```

---

## Inter-Service Communication

| From | To | Protocol | Auth |
|---|---|---|---|
| Frontend | Backend | REST/HTTP | Bearer JWT |
| Backend | AI Service | REST/HTTP | API Key (env var) |
| Backend | MongoDB | Mongoose ODM | Connection string |
| AI Service | (nothing) | — | — |

> The AI Service is STATELESS. It never writes to MongoDB directly. The backend receives AI results and persists them.

---

## Validation Boundaries

| What | Where |
|---|---|
| Form validation (client) | zod + react-hook-form |
| Request validation (server) | express-validator (existing middleware) |
| Business rule validation | Service layer (server/services/) |
| AI input sanitization | AI service (ai-service/analyzer.py) |

---

## Deployment Architecture

```
Vercel                      Render (Web Service 1)    Render (Web Service 2)
[React Frontend]  ←HTTP→   [Express Backend]  ←HTTP→  [Python AI Service]
                                    |
                            MongoDB Atlas
                            [Cloud Database]
```

**Environment Variables:**
- Frontend: `VITE_API_URL` (backend URL)
- Backend: `MONGODB_URI`, `JWT_SECRET`, `AI_SERVICE_URL`, `AI_SERVICE_API_KEY`, `CLIENT_URL`
- AI Service: `PORT`, `MODEL_NAME` (optional), `LOG_LEVEL`
