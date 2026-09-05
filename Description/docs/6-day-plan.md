# SIF-Sentinel — 6-Day Development Plan

## Team Assignments

| Person | Role | Primary Area |
|---|---|---|
| P1 | Tech Lead + Integration | Architecture, contracts, integration, DevOps |
| P2 | Worker Frontend | Worker-facing pages (submit, history, details) |
| P3 | Safety Officer Frontend | Officer dashboard, reports, alerts, analytics |
| P4 | Maintenance Frontend | Maintenance dashboard, tasks, resolution |
| P5 | AI/ML Engineer | Python AI service, risk engine, SIF precursor KB |
| P6 | Backend + Database + DevOps | Express API, MongoDB models, deployment config |

---

## Day 1 — Architecture, Environment, Skeleton, Contracts

**Goal:** Every developer has a running environment and understands exactly what they are building. Contracts are frozen. Skeletons exist for all layers.

### P1 — Tech Lead
- [ ] Rename/rebrand codebase: update `index.html` title to "SIF-Sentinel", update Sidebar logo/name
- [ ] Create all `docs/` documents (this file + architecture.md, api-contract.md, ai-contract.md, database-schema.md)
- [ ] Create `AGENTS.md`
- [ ] Create `mock/` directory with all mock JSON files
- [ ] Create `.env.example` (root + server)
- [ ] Set up GitHub repository, branch protection on `main`, create initial feature branches
- [ ] Create `mock/reports.json`, `mock/dashboard.json`, `mock/tasks.json`, `mock/ai-response.json`
- [ ] Brief all team members on architecture
- [ ] Define the new role constants: `['worker', 'safety_officer', 'maintenance', 'admin']`

**Deliverable:** All docs written, all mock data exists, GitHub ready

---

### P2 — Worker Frontend
- [ ] Read `docs/architecture.md`, `docs/api-contract.md`
- [ ] Create `src/pages/worker/` directory
- [ ] Create skeleton pages: `Dashboard.jsx`, `SubmitReport.jsx`, `MyReports.jsx`, `ReportDetail.jsx`
- [ ] Wire routes in `App.jsx` for `/worker` prefix with `RoleGuard allowedRoles={['worker']}`
- [ ] Add `worker` menu to Sidebar `roleMenus`
- [ ] Create `src/api/reportApi.js` (skeleton with mock data)
- [ ] Implement `SubmitReport.jsx` form with react-hook-form + zod (title, description, location, category, severity dropdowns)

**Deliverable:** Worker routes exist, report form renders and validates locally

---

### P3 — Safety Officer Frontend
- [ ] Read `docs/architecture.md`, `docs/api-contract.md`
- [ ] Create `src/pages/officer/` directory
- [ ] Create skeleton pages: `Dashboard.jsx`, `ReportList.jsx`, `ReportDetail.jsx`, `Alerts.jsx`, `Analytics.jsx`
- [ ] Wire routes in `App.jsx` for `/officer` prefix
- [ ] Add `safety_officer` menu to Sidebar `roleMenus`
- [ ] Create `src/api/dashboardApi.js`, `src/api/alertApi.js` (mock-backed)
- [ ] Implement `Dashboard.jsx` stat cards using mock data from `mock/dashboard.json`

**Deliverable:** Officer routes exist, dashboard renders with mock stats

---

### P4 — Maintenance Frontend
- [ ] Read `docs/architecture.md`, `docs/api-contract.md`
- [ ] Create `src/pages/maintenance/` directory
- [ ] Create skeleton pages: `Dashboard.jsx`, `TaskList.jsx`, `TaskDetail.jsx`
- [ ] Wire routes in `App.jsx` for `/maintenance` prefix
- [ ] Add `maintenance` menu to Sidebar `roleMenus`
- [ ] Create `src/api/taskApi.js` (mock-backed)
- [ ] Implement `TaskList.jsx` with mock task data

**Deliverable:** Maintenance routes exist, task list renders with mock data

---

### P5 — AI/ML
- [ ] Read `docs/ai-contract.md`
- [ ] Create `ai-service/` directory structure
- [ ] Create `ai-service/requirements.txt` (`flask`, `sentence-transformers`, `numpy`, `scikit-learn`)
- [ ] Create `ai-service/main.py` (Flask app with `/analyze` and `/health` routes)
- [ ] Create `ai-service/precursor_kb.py` with ~15 initial precursors (can expand Day 2)
- [ ] Implement rule-based fallback in `ai-service/risk_scorer.py`
- [ ] Test `/analyze` locally with curl and a sample report text
- [ ] Verify response matches ai-contract.md exactly

**Deliverable:** AI service starts, `/analyze` returns valid JSON for test inputs

---

### P6 — Backend + Database
- [ ] Read `docs/database-schema.md`, `docs/api-contract.md`
- [ ] Update `server/utils/constants.js` — replace old roles with new SIF-Sentinel roles
- [ ] Create new Mongoose models: `Report.js`, `RiskAssessment.js`, `Alert.js`, `MaintenanceTask.js`
- [ ] Update `User.js` — add `department` field, update role enum
- [ ] Create route/controller/service stubs for: `reportRoutes.js`, `dashboardRoutes.js`, `alertRoutes.js`, `taskRoutes.js`
- [ ] Mount new routes in `server.js`
- [ ] Verify server starts and `/api/health` responds

**Deliverable:** Server runs, all new routes return 200/stub JSON, new models exist

---

### End-of-Day 1 Acceptance Criteria
- [ ] All 6 developers have the repo cloned and running locally
- [ ] Frontend starts (`npm run dev`) with no errors
- [ ] Backend starts (`node server.js`) with no errors
- [ ] AI service starts (`python main.py`) with no errors
- [ ] All docs exist in `docs/`
- [ ] Mock data files exist in `mock/`
- [ ] New routes exist (even if returning stubs)
- [ ] New models exist

---

## Day 2 — Core Vertical Slice (Most Important Day)

**Goal:** The complete pipeline works end-to-end with real data. Worker → Backend → MongoDB → AI → Risk Score → Backend → MongoDB. This must work before ANYTHING else.

### P1 — Tech Lead
- [ ] Integration: test the full report submission flow end-to-end
- [ ] Fix any environment/CORS/integration issues
- [ ] Create demo seed script: `server/scripts/seed.js` (creates demo users + 5 sample reports with risk assessments)
- [ ] Verify `/api/auth/login` and `/api/auth/me` work for all 4 new roles
- [ ] Document any integration blockers immediately in team channel
- [ ] Start deployment configuration (Render for backend + Render for AI service)

**Deliverable:** Seed script works, full report → AI → risk score pipeline verified

---

### P2 — Worker Frontend
- [ ] Switch `reportApi.js` from mock to real API calls
- [ ] `SubmitReport.jsx`: connect to `POST /api/reports`, show success/error toast
- [ ] `MyReports.jsx`: fetch from `GET /api/reports`, show list with status badges
- [ ] Show AI analysis status indicator (pending → complete) with polling or refresh
- [ ] `ReportDetail.jsx`: fetch from `GET /api/reports/:id`, display risk score + precursors

**Deliverable:** Worker can submit a report, see it in their list, see the AI risk score

---

### P3 — Safety Officer Frontend
- [ ] Switch dashboard API from mock to real `GET /api/dashboard`
- [ ] `ReportList.jsx`: fetch from `GET /api/reports`, show risk level color badges
- [ ] `Alerts.jsx`: fetch from `GET /api/alerts`, show unacknowledged alerts
- [ ] Add acknowledge button → `PATCH /api/alerts/:id/acknowledge`
- [ ] `ReportDetail.jsx`: fetch full report including AI risk assessment display

**Deliverable:** Officer sees real reports + real alerts, can acknowledge alerts

---

### P4 — Maintenance Frontend
- [ ] `TaskList.jsx`: switch to real `GET /api/tasks`
- [ ] `TaskDetail.jsx`: fetch from `GET /api/tasks/:id`
- [ ] Add "Start Work" button → `PATCH /api/tasks/:id { status: 'in_progress' }`

**Deliverable:** Maintenance team can view and start tasks (even if task creation isn't fully wired yet)

---

### P5 — AI/ML
- [ ] Expand precursor KB to 30+ entries across all hazard categories
- [ ] Implement semantic embedding pipeline (sentence-transformers)
- [ ] Test with 10+ diverse report examples
- [ ] Tune risk score thresholds so LOW/MEDIUM/HIGH/CRITICAL are correctly distributed
- [ ] Add `/mock-analyze` endpoint (returns CRITICAL demo response)
- [ ] Measure response time — target < 500ms

**Deliverable:** AI analyzes reports accurately across all risk levels

---

### P6 — Backend
- [ ] Implement `POST /api/reports` fully: validate, save, call AI service, save RiskAssessment, create Alert if HIGH/CRITICAL
- [ ] Implement `GET /api/reports` with role-based filtering
- [ ] Implement `GET /api/reports/:id` with populated riskAssessment + tasks
- [ ] Implement `GET /api/alerts` and `PATCH /api/alerts/:id/acknowledge`
- [ ] Implement `GET /api/dashboard` with real aggregation
- [ ] Create `server/services/aiService.js` with fallback

**Deliverable:** All core endpoints work with real MongoDB data

---

### End-of-Day 2 Acceptance Criteria
- [ ] Worker submits report → backend saves it → AI analyzes it → risk score appears in the report
- [ ] CRITICAL report creates an alert automatically
- [ ] Safety officer sees the report with correct risk score
- [ ] Alert appears in alerts list
- [ ] All API endpoints return correct data shapes matching api-contract.md

---

## Day 3 — Main Feature Implementation

**Goal:** Complete all MUST HAVE features. Every user journey works end-to-end.

### P1 — Tech Lead
- [ ] Integration testing: officer assigns task → maintenance sees it → maintenance resolves → officer verifies
- [ ] Create integration test script (manual curl/Postman collection)
- [ ] Fix any integration bugs discovered
- [ ] Assist any blocked person
- [ ] Start staging deployment to Render (backend) and Vercel (frontend)

---

### P2 — Worker Frontend
- [ ] Image upload in `SubmitReport.jsx` (base64, reuse existing `FileUpload.jsx` component)
- [ ] `WorkerDashboard.jsx`: show summary stats (reports submitted, pending, resolved), recent report list
- [ ] Empty state and loading state for all worker pages
- [ ] Polish `ReportDetail.jsx`: show full AI precursors list, hazards, SIF probability bar
- [ ] Error state handling (network errors, 404s)

**Deliverable:** All worker screens polished and functional

---

### P3 — Safety Officer Frontend
- [ ] `ReportDetail.jsx`: add task assignment section (modal with assignee dropdown, priority, due date)
- [ ] Fetch maintenance users for dropdown: `GET /api/admin/maintenance-users`
- [ ] `POST /api/tasks` on form submit
- [ ] Filter/sort reports by risk level, status, date
- [ ] `Analytics.jsx`: wire to real data — risk distribution pie chart, daily trend line chart
- [ ] SIF precursor alert banner on ReportDetail for CRITICAL reports

**Deliverable:** Officer can view AI analysis AND assign corrective tasks

---

### P4 — Maintenance Frontend
- [ ] `TaskDetail.jsx`: display full report context (location, description, AI risk info)
- [ ] Resolution form: notes textarea + optional proof image upload
- [ ] `PATCH /api/tasks/:id { status: 'resolved', resolutionNotes, proofImageUrl }`
- [ ] Status timeline/progress indicator on task detail
- [ ] `MaintenanceDashboard.jsx`: assigned/in-progress/resolved count cards, overdue tasks

**Deliverable:** Maintenance team has complete task workflow (assigned → in progress → resolved)

---

### P5 — AI/ML
- [ ] Expand precursor KB to 50 entries
- [ ] Add 5+ test reports for edge cases and verify correct classification
- [ ] Improve explanation generation templates
- [ ] Document all precursors and weights in `ai-service/README.md`
- [ ] Add request logging to AI service
- [ ] Create `ai-service/test_analyzer.py` with automated test cases

**Deliverable:** AI service is well-tested and reliable

---

### P6 — Backend
- [ ] Implement `POST /api/tasks` with validation
- [ ] Implement `GET /api/tasks` with role-based filtering (maintenance sees own only)
- [ ] Implement `GET /api/tasks/:id` with populated report + riskAssessment
- [ ] Implement `PATCH /api/tasks/:id` with status transition validation
- [ ] Implement `POST /api/ai/analyze` (manual re-trigger for officer)
- [ ] Implement `GET /api/admin/maintenance-users`
- [ ] Add pagination to all list endpoints
- [ ] Add validation middleware to all new routes

**Deliverable:** Full task CRUD, all endpoints working correctly

---

### End-of-Day 3 Acceptance Criteria
- [ ] Complete flow works: Worker → Report → AI → Alert → Officer Review → Assign Task → Maintenance Resolves → Officer Verifies
- [ ] All 4 user roles can log in and access their correct dashboard
- [ ] Analytics charts show real data
- [ ] Task assignment and resolution workflow is complete

---

## Day 4 — Integration, AI Improvements, UI Polish

**Goal:** Everything works together reliably. UI is impressive for demo.

### P1 — Tech Lead
- [ ] Full end-to-end test of entire demo flow
- [ ] Fix all discovered integration bugs (priority)
- [ ] Staging deployment fully working
- [ ] Test with multiple concurrent users (seed 10+ reports of various risk levels)
- [ ] Create `docs/demo-flow.md`
- [ ] Verify fallback scenarios work (AI service down → fallback response)

---

### P2 — Worker Frontend
- [ ] UI polish: loading skeletons, transition animations
- [ ] Risk score display on worker's own reports (they can see their report status/risk)
- [ ] Search/filter own reports by status
- [ ] Responsive mobile check for worker pages

---

### P3 — Safety Officer Frontend
- [ ] Dashboard: add unacknowledged alerts banner (red, prominent)
- [ ] Real-time status badges that reflect latest data
- [ ] Analytics: add risk level distribution bar chart, SIF probability average
- [ ] SIF score visual (progress bar with color coding: green/yellow/orange/red)
- [ ] Report list: highlight CRITICAL rows with red border
- [ ] UI polish for demo impressiveness

---

### P4 — Maintenance Frontend
- [ ] Officer verification screen: `PATCH /api/tasks/:id { status: 'verified' }` button
- [ ] Show resolution notes and proof image in task detail
- [ ] Overdue task highlighting (due date in past + not resolved)
- [ ] UI polish

---

### P5 — AI/ML
- [ ] Run 20+ report samples, verify accuracy
- [ ] Write `ai-service/EXAMPLES.md` with 5 sample inputs/outputs for demo
- [ ] Prepare Docker deployment config or Render `render.yaml`
- [ ] Optimize startup time (lazy load model if > 30s)

---

### P6 — Backend
- [ ] Add request logging middleware
- [ ] Add rate limiting on `/api/reports` POST (prevent spam during demo)
- [ ] Test all endpoints with Postman/curl collection
- [ ] Verify all error responses match api-contract.md
- [ ] Add `PATCH /api/reports/:id` for status updates
- [ ] Production environment variable checklist

---

### End-of-Day 4 Acceptance Criteria
- [ ] Staging deployment is live and working
- [ ] Demo flow runs without errors on staging
- [ ] All UI states (loading, empty, error) handled
- [ ] AI fallback tested on staging

---

## Day 5 — Testing, Polish, Edge Cases

**Goal:** The application is stable. The demo flow is rehearsed. Edge cases don't crash the system.

### P1 — Tech Lead
- [ ] Full demo rehearsal on staging (3x run-through)
- [ ] Identify any remaining visual or functional issues
- [ ] Prepare demo seed data (5 pre-seeded reports at different risk levels for demo)
- [ ] Create demo accounts: worker@demo.com, officer@demo.com, maintenance@demo.com

---

### P2 + P3 + P4 — Frontend (all)
- [ ] Cross-browser testing (Chrome + Firefox)
- [ ] Mobile responsive check
- [ ] Fix any lingering UI bugs
- [ ] Ensure empty states and error states look polished
- [ ] Ensure loading states don't feel broken

---

### P5 — AI/ML
- [ ] Final accuracy verification
- [ ] Ensure the demo request ("Exposed electrical wiring near water pump") returns CRITICAL with 3+ precursors
- [ ] Verify deployment on Render works with acceptable startup time

---

### P6 — Backend
- [ ] Run all manual API tests one more time
- [ ] Check MongoDB Atlas indexes are set correctly
- [ ] Test rate limits and error cases
- [ ] Verify JWT expiry and refresh behavior is acceptable for demo

---

### End-of-Day 5 Acceptance Criteria
- [ ] Demo accounts exist and login works
- [ ] Demo seed data produces impressive dashboard (mix of LOW/MEDIUM/HIGH/CRITICAL)
- [ ] 3 full demo run-throughs completed without errors
- [ ] No console errors in browser during demo flow

---

## Day 6 — Final Deployment, Demo Prep, Buffer

**Goal:** Production deployment live. Team ready to demo. Buffer for last-minute fixes.

### All Team
- [ ] Final production deployment (Vercel + Render)
- [ ] Smoke test production environment with all 3 demo accounts
- [ ] Verify AI service cold-start time (Render free tier has cold starts)
- [ ] Prepare demo script (see `docs/demo-flow.md`)
- [ ] Screenshot/record demo if needed for backup
- [ ] Team rehearsal of live demo

### P1 — Contingency
- [ ] If any critical bug found before 2pm: fix it
- [ ] After 2pm: freeze code, only deploy fixes for show-stoppers
- [ ] Prepare backup plan: if AI service cold-starts during demo, pre-warm it before presentation

---

### End-of-Day 6 Acceptance Criteria
- [ ] Production URL is live
- [ ] All demo accounts work in production
- [ ] AI service is warm (pre-warmed before demo)
- [ ] Team can confidently demo the full flow in 3–5 minutes
