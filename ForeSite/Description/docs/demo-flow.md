# SIF-Sentinel — Demo Flow

## 3–5 Minute Demo Script

This is the exact sequence to follow during the hackathon presentation. Do not deviate. Every step has been tested.

---

## Pre-Demo Checklist (Do this 30 minutes before)

- [ ] Open 3 browser windows (or use 3 different browsers / incognito windows)
- [ ] Pre-warm the AI service: send one POST request to `/api/reports` with sample data
- [ ] Log in each window:
  - Window 1: `worker@demo.com` / `demo1234`
  - Window 2: `officer@demo.com` / `demo1234`
  - Window 3: `maintenance@demo.com` / `demo1234`
- [ ] Verify the Officer dashboard already shows 4–6 pre-seeded reports at various risk levels
- [ ] Have a CRITICAL pre-seeded report ready in the system
- [ ] Verify the AI service health: `GET /api/health` returns `"aiService": "UP"`

---

## Demo Flow (5 Minutes)

### STEP 1 — Worker Submits a Report (45 seconds)

**Window 1 — Worker View**

1. Show Worker Dashboard: "This is Rajan, a floor worker at our industrial plant."
2. Click **Submit Report**
3. Fill in the form LIVE:
   - Title: `Exposed electrical wiring near high-pressure water line`
   - Location: `Sector 4, Boiler Room B`
   - Category: `Unsafe Condition`
   - Severity: `High`
   - Description: `I found stripped copper wiring approximately 2 meters from the main high-pressure water line in Sector 4. The insulation is completely stripped. If water contacts the wire during scheduled maintenance tomorrow, there is a serious electrocution risk.`
4. Click **Submit**
5. Show the success toast: "Report submitted"
6. Show the report appearing in "My Reports" with status "Under Analysis"

**Talking points:**
> "Any worker can submit a safety concern in under 60 seconds. No complex forms. No bureaucracy. The system immediately begins AI analysis."

---

### STEP 2 — AI Analysis Results (45 seconds)

**Window 1 — Worker View (or switch to Officer Window)**

1. Click on the submitted report
2. Show the AI Risk Panel:
   - **Risk Score: 87/100 — CRITICAL**
   - **SIF Probability: 82%**
   - **Precursors detected**: Energized Equipment Exposure, Inadequate Isolation/Lockout, Proximity to Electrical Hazard
   - **Hazards**: Electrocution, Arc Flash, Burns
   - **Explanation**: Read the AI-generated explanation aloud briefly

**Talking points:**
> "Within seconds, our AI identifies this as a CRITICAL risk with an 82% probability of causing a Serious Injury or Fatality. It doesn't just give a score — it tells you WHY. It has identified 3 specific SIF precursors that are statistically associated with electrocution fatalities. This is the intelligence that saves lives."

---

### STEP 3 — Safety Officer Dashboard (60 seconds)

**Window 2 — Officer View**

1. Show Officer Dashboard: "This is Dr. Ananya, the Safety Officer."
2. Point out the **CRITICAL ALERT BANNER** at the top
3. Click on Alerts: show the new unacknowledged alert
4. Click on **Reports List**: show the report highlighted in red (CRITICAL)
5. Click on the report → show full AI analysis panel
6. Click **Acknowledge Alert**

**Talking points:**
> "The Safety Officer doesn't have to wade through 200 reports. The AI surfaces the critical risks immediately. The CRITICAL alert appears before she even looks at the report list. She can see exactly what the AI found and why."

---

### STEP 4 — Assign Corrective Action (60 seconds)

**Window 2 — Officer View**

1. Still on the Report Detail page
2. Click **Assign Corrective Action**
3. Fill in the assignment modal:
   - Title: `Immediate wiring replacement — Sector 4`
   - Assigned to: `Vikram Singh (Electrical Maintenance)`
   - Priority: `Critical`
   - Due: `Tomorrow 5:00 PM`
   - Description: `Isolate circuit, replace exposed wiring with rated insulated cable, apply LOTO procedure, verify with electrical meter.`
4. Click **Assign Task**
5. Show task appears in system

**Talking points:**
> "With one click, the Safety Officer assigns a corrective action. The maintenance team member gets the full context — including the AI risk analysis — so they understand the urgency."

---

### STEP 5 — Maintenance Resolution (60 seconds)

**Window 3 — Maintenance View**

1. Show Maintenance Dashboard: "This is Vikram, the Electrical Maintenance technician."
2. Show **CRITICAL** task highlighted at top of task list
3. Click on the task
4. Show the full task detail including:
   - The AI risk context
   - The safety officer's instructions
   - The due date (tomorrow)
5. Click **Start Work** → status changes to In Progress
6. Fill in the resolution:
   - Notes: `Replaced stripped wiring with IEC-rated 2.5mm² insulated cable. Applied full LOTO procedure. Tested with digital multimeter — zero continuity to ground. Area safe.`
7. Click **Mark as Resolved**

**Talking points:**
> "Vikram sees exactly what's wrong, why it's dangerous, and what he needs to do — without a single phone call. He documents his resolution, creating a permanent safety record."

---

### STEP 6 — Closed Loop & Analytics (30 seconds)

**Window 2 — Officer View**

1. Show the task is now showing as "Resolved — Pending Verification"
2. Click **Verify Resolution**
3. Show the original report status change to "Closed"
4. Switch to **Analytics** page
5. Show risk distribution chart — the CRITICAL count decreased by 1

**Talking points:**
> "The safety record is closed. This is the closed-loop that's missing from most industrial safety systems. Every report → every risk → every action → every resolution is tracked and auditable. And over time, we can see which departments generate the most SIF precursors and where to focus preventive effort."

---

## Key Messages to Emphasize

1. **Speed**: From hazard observed to risk scored in < 5 seconds
2. **Intelligence**: Not just a score — actual SIF precursor identification with explanation
3. **Closed-loop**: Nothing falls through the cracks — every risk is tracked to resolution
4. **Role-appropriate views**: Each user sees exactly what they need, nothing more
5. **Demo-able in 3 minutes**: Simple enough for non-technical audience to understand

---

## What NOT to Demo

| Feature | Why Not |
|---|---|
| Admin user management | Not impressive to audience, risk of confusion |
| Profile editing | Not relevant to safety flow |
| Registration flow | Too slow, wastes demo time |
| AI manual re-trigger | Too technical |
| Error states | Don't trigger them on purpose |

---

## Backup Plans

| Problem | Backup |
|---|---|
| AI service cold start (Render free tier) | Pre-warm 5 minutes before demo; have a pre-seeded CRITICAL report ready |
| Live submission AI analysis slow | Click pre-seeded CRITICAL report instead |
| MongoDB Atlas connection issue | Use local MongoDB with seeded data |
| Network connectivity | Have offline screenshots of all key screens as final backup |
| Login fails | Have auth tokens pre-stored in localStorage of demo browsers |

---

## Demo Seed Data

Run `node server/scripts/seed.js` to create:
- 3 demo user accounts (worker, officer, maintenance)
- 10 reports: 2 CRITICAL, 3 HIGH, 3 MEDIUM, 2 LOW
- 5 risk assessments (for pre-seeded reports)
- 2 alerts (for the CRITICAL reports)
- 3 maintenance tasks (various statuses)
