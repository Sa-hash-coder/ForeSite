# ForeSite AI — Live Demo Showcase & Examples
=====================================================
Use this guide for live project demos, presentations, and testing.
It provides 5 pre-tested industrial scenarios covering the spectrum from **Critical Life-Threatening Hazards** to **Low-Risk Housekeeping Issues**.

---

## Scenario 1: Critical Electrical & Moisture Exposure
> **Presentation Pitch**: *"Here a worker finds exposed high-voltage wiring right next to an active water pump. The AI recognizes the deadly combination of electricity + moisture and flags it as CRITICAL with immediate Lockout/Tagout instructions."*

### Test Command (PowerShell):
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/analyze" `
  -Method POST `
  -Headers @{ "X-API-Key" = "dev-secret-key-change-in-production"; "Content-Type" = "application/json" } `
  -Body '{
    "report_id": "DEMO-001",
    "title": "Exposed electrical wiring near water pump",
    "description": "Found bare copper wiring approximately 2 meters from the main water pump in Sector 4. Wire insulation is completely stripped and floor is wet.",
    "location": "Sector 4, Water Treatment Plant",
    "category": "unsafe_condition"
  }'
```

### Expected AI Analysis:
- **Risk Score**: ~`85–90` (CRITICAL)
- **SIF Probability**: `0.84+`
- **Precursors**: `Energized Equipment Exposure`, `Proximity to Electrical Hazard`
- **Hazard**: `Electrocution`
- **Fix Suggestions**:
  1. Immediately de-energize and lock out (LOTO) electrical feed at source breaker.
  2. Install red perimeter barricade tape and 'DANGER - HIGH VOLTAGE' warning signage.
  3. Replace damaged cables with IP67-rated insulated industrial conduit before re-energizing.

---

## Scenario 2: Fatal Fall Precursor (Working at Height)
> **Presentation Pitch**: *"Falls are OSHA's #1 cause of worker fatalities. Here, workers are on elevated scaffolding without harnesses or toe-boards. The AI detects fall precursors and triggers an immediate Stop-Work recommendation."*

### Test Command (PowerShell):
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/analyze" `
  -Method POST `
  -Headers @{ "X-API-Key" = "dev-secret-key-change-in-production"; "Content-Type" = "application/json" } `
  -Body '{
    "report_id": "DEMO-002",
    "title": "Workers on 4th floor scaffolding without harness",
    "description": "Two subcontractors observed installing exterior panels on 4th floor scaffolding without fall arrest harnesses or lifelines. Mid-rail is missing.",
    "location": "Tower B, Exterior Facade",
    "category": "unsafe_act"
  }'
```

### Expected AI Analysis:
- **Risk Score**: ~`88–92` (CRITICAL)
- **SIF Probability**: `0.88+`
- **Precursors**: `Working at Height Without Protection`, `Unsecured or Damaged Scaffolding`
- **Hazard**: `Fall from Height`
- **Fix Suggestions**:
  1. Issue a Stop-Work notice until full-body harnesses with dual shock-absorbing lanyards are donned.
  2. Verify certified 5,000-lb rated anchor points or horizontal lifeline installations.
  3. Red-tag scaffold as 'DO NOT USE' until re-inspected by a certified competent person.

---

## Scenario 3: Confined Space Atmospheric Hazard
> **Presentation Pitch**: *"Entering confined spaces without testing the atmosphere is a classic invisible killer. The AI catches the absence of permits and gas detection."*

### Test Command (PowerShell):
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/analyze" `
  -Method POST `
  -Headers @{ "X-API-Key" = "dev-secret-key-change-in-production"; "Content-Type" = "application/json" } `
  -Body '{
    "report_id": "DEMO-003",
    "title": "Unpermitted vessel entry in tank farm",
    "description": "Cleaning crew opened manhole and entered underground storage vessel without atmospheric gas testing or entry permit. Distinct rotten egg sulfur odor reported.",
    "location": "Tank Farm Storage Pit #3",
    "category": "unsafe_act"
  }'
```

### Expected AI Analysis:
- **Risk Score**: ~`90–95` (CRITICAL)
- **SIF Probability**: `0.90+`
- **Precursors**: `Confined Space Entry Without Permit`, `Hazardous Atmosphere Accumulation`
- **Hazard**: `Asphyxiation`, `Toxic Exposure`
- **Fix Suggestions**:
  1. Order immediate evacuation of confined space until Confined Space Entry Permit is authorized.
  2. Perform mandatory 4-gas atmospheric testing (Oxygen, CO, H2S, LEL) at top, middle, and bottom.
  3. Station a dedicated rescue attendant at entry hatch with retrieval winch and tripod system.

---

## Scenario 4: Machine Guarding & Amputation Risk
> **Presentation Pitch**: *"A worker disabled the safety interlock to work faster. ForeSite identifies this as a high-severity caught-in/between precursor."*

### Test Command (PowerShell):
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/analyze" `
  -Method POST `
  -Headers @{ "X-API-Key" = "dev-secret-key-change-in-production"; "Content-Type" = "application/json" } `
  -Body '{
    "report_id": "DEMO-004",
    "title": "Machine guard interlock bypassed on press",
    "description": "Operator bypassed the door safety interlock switch on the 50-ton hydraulic stamping press with a zip tie to clear jams without stopping the cycle.",
    "location": "Workshop Building 2, Press Line",
    "category": "unsafe_condition"
  }'
```

### Expected AI Analysis:
- **Risk Score**: ~`82–86` (CRITICAL)
- **SIF Probability**: `0.80+`
- **Precursors**: `Bypassed Safety Device`, `Rotating Parts and Nip Point Exposure`
- **Hazard**: `Caught-In/Between`, `Amputation`
- **Fix Suggestions**:
  1. Shut down machinery immediately until safety interlocks are restored and tested.
  2. Re-install heavy-gauge wire mesh / steel guards covering all operational hazard zones.
  3. Conduct safety audit to replace tampered interlock keys with tamper-resistant switches.

---

## Scenario 5: Low-Risk Housekeeping Incident
> **Presentation Pitch**: *"ForeSite does not overreact to minor incidents. When a worker reports clean mop water with no caution sign, the AI correctly scores it as LOW/MEDIUM risk."*

### Test Command (PowerShell):
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/analyze" `
  -Method POST `
  -Headers @{ "X-API-Key" = "dev-secret-key-change-in-production"; "Content-Type" = "application/json" } `
  -Body '{
    "report_id": "DEMO-005",
    "title": "Clean mop water puddle in entrance hallway",
    "description": "Small puddle of clean mop water left after cleaning. Floor is somewhat slippery and yellow caution sign was forgotten.",
    "location": "Administration Building, Front Lobby",
    "category": "near_miss"
  }'
```

### Expected AI Analysis:
- **Risk Score**: ~`25–35` (LOW / MEDIUM)
- **SIF Probability**: `0.15–0.25`
- **Precursors**: `Slippery Walkways and Minor Trip Hazards`
- **Hazard**: `Slip and Trip`
- **Fix Suggestions**:
  1. Place high-visibility 'CAUTION - WET FLOOR' warning cones around the spill immediately.
  2. Mop and squeegee standing liquid dry; check overhead pipes/valves for recurring leaks.
