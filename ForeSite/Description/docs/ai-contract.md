# SIF-Sentinel — AI/ML Contract

## Overview

The AI service is a **stateless Python microservice** (Flask). It uses a **two-stage pipeline**:

1. **Extraction Stage** — Gemini API extracts structured hazard descriptions from images and voice notes
2. **Analysis Stage** — Custom SIF risk model analyzes the combined text corpus

The AI service never reads from or writes to MongoDB. The backend owns all persistence.

### Why This Architecture

- The custom model only needs to handle text — a solved, fast-to-train problem
- Gemini Vision/Audio handles multimodal inputs at state-of-the-art quality
- No computer vision or speech recognition training required
- Gemini's hazard descriptions are often MORE detailed than raw image analysis from a small custom model
- Fully within Gemini free tier quota for demo volume

---

## Service URL

- Development: `http://localhost:8000`
- Production: `https://sif-sentinel-ai.onrender.com`

Backend uses `AI_SERVICE_URL` and `AI_SERVICE_API_KEY` environment variables.

---

## Primary Endpoint

### POST /analyze

Analyze a safety report (text + optional image + optional audio) and return structured risk data.

**Authentication:**
```
X-API-Key: <AI_SERVICE_API_KEY>
```

**Request Body:**
```json
{
  "report_id": "64b2c3d4e5f6a7b8c9d0e2f3",
  "title": "Exposed electrical wiring near water pump",
  "description": "Found bare copper wiring approximately 2 meters from the main water pump in Sector 4. Wire insulation is completely stripped.",
  "location": "Sector 4, Water Treatment Plant",
  "category": "unsafe_condition",
  "severity": "high",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ...",
  "audio_base64": "data:audio/webm;base64,GkXfo..."
}
```

**Field Definitions:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `report_id` | string | Yes | For logging/tracing only |
| `title` | string | Yes | Short report title |
| `description` | string | Yes | Main text from report form |
| `location` | string | No | Used for context only |
| `category` | string | No | Hint for classifier |
| `severity` | string | No | Worker's self-assessment (not used to inflate score) |
| `image_base64` | string | No | Base64-encoded image (data URI format) |
| `audio_base64` | string | No | Base64-encoded audio (webm/mp3/wav) |

> **Image size limit:** 10MB. Backend must validate before sending.
> **Audio length limit:** 2 minutes. Backend must validate before sending.

---

**Response 200:**
```json
{
  "risk_score": 87,
  "risk_level": "CRITICAL",
  "sif_probability": 0.82,
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
  "explanation": "This report describes exposed energized wiring in proximity to water sources. The combination of electrical exposure, proximity to liquid, and lack of mention of lockout/tagout procedures are classic SIF precursors associated with electrocution fatalities. Image analysis confirmed: bare copper wiring visible with no insulation within 1 meter of water pipe junction. Immediate isolation and repair is critical.",
  "extracted_image_context": "Image shows: bare copper wires exposed near a metal pipe junction. No protective covering visible. Water pipe runs parallel approximately 1 meter away. Area appears wet.",
  "extracted_audio_context": "Transcript: Worker mentions the wiring has been in this state for approximately two weeks. No safety report was filed previously. Supervisor was made aware but no action taken.",
  "model_version": "v1.1-gemini-hybrid",
  "processing_time_ms": 1240,
  "is_fallback": false,
  "extraction_fallback": false
}
```

**Response Field Definitions:**
| Field | Type | Range | Notes |
|---|---|---|---|
| `risk_score` | integer | 0–100 | 0=no risk, 100=catastrophic |
| `risk_level` | string | LOW/MEDIUM/HIGH/CRITICAL | Derived from risk_score |
| `sif_probability` | float | 0.0–1.0 | SIF probability from combined analysis |
| `precursors` | string[] | 0–5 items | SIF precursor labels detected |
| `hazards` | string[] | 0–5 items | Hazard categories identified |
| `explanation` | string | max 600 chars | Human-readable, includes image/audio context |
| `extracted_image_context` | string\|null | max 300 chars | What Gemini extracted from image |
| `extracted_audio_context` | string\|null | max 300 chars | Transcript/summary from voice note |
| `model_version` | string | — | Pipeline version |
| `processing_time_ms` | integer | — | For monitoring |
| `is_fallback` | boolean | — | True if SIF analysis used rule-based fallback |
| `extraction_fallback` | boolean | — | True if Gemini extraction failed (text-only analysis used) |

**Risk Level Thresholds:**
```
risk_score 0–24   → LOW
risk_score 25–49  → MEDIUM
risk_score 50–74  → HIGH
risk_score 75–100 → CRITICAL
```

**Errors:**
```json
{ "error": "Description of error", "detail": "..." }
```
- `400` — Invalid request (missing required fields)
- `422` — Unprocessable (text too short)
- `500` — Internal AI service error

---

### GET /health

**Response 200:**
```json
{
  "status": "UP",
  "model_loaded": true,
  "model_version": "v1.1-gemini-hybrid",
  "gemini_available": true,
  "fallback_available": true
}
```

---

## Two-Stage AI Pipeline Architecture

```
STAGE 1: MULTIMODAL EXTRACTION (Gemini API)
════════════════════════════════════════════

Input Image (base64)          Input Audio (base64)
        |                             |
        v                             v
Gemini 1.5 Flash Vision       Gemini 1.5 Flash Audio
        |                             |
        v                             v
"Extracted hazard description"  "Voice transcript + summary"
        |                             |
        └──────────────┬──────────────┘
                       v
            Combined Text Corpus:
            [Original title + description]
            + [Image hazard description]
            + [Audio transcript]


STAGE 2: CUSTOM SIF ANALYSIS (Our Model)
════════════════════════════════════════
              Combined Text Corpus
                       |
                       v
              1. PREPROCESSING
                 - Lowercase, normalize
                 - Merge all text sources
                       |
                       v
              2. SEMANTIC EMBEDDING
                 - all-MiniLM-L6-v2
                 - 384-dimensional vector
                 - ~340ms CPU inference
                       |
                       v
              3. SIF PRECURSOR DETECTION
                 - Cosine similarity vs KB
                 - Threshold: 0.65
                 - ~50 pre-embedded precursors
                       |
                       v
              4. HAZARD CLASSIFICATION
                 - Keyword + pattern rules
                 - 9 hazard categories
                       |
                       v
              5. RISK SCORE CALCULATION
                 - Base hazard weight
                 - × Precursor multiplier
                 - × Context bonus (image/audio confirmed)
                 - Cap at 100
                       |
                       v
              6. EXPLANATION GENERATION
                 - Template-based (no LLM needed)
                 - Incorporates extracted contexts
                       |
                       v
                   JSON Response
```

---

## Gemini Extraction Prompts

### Image Extraction Prompt
```python
IMAGE_EXTRACTION_PROMPT = """
You are a workplace safety expert analyzing an image for a safety incident report system.

Describe ONLY what you observe that is relevant to safety hazards:
- Visible equipment conditions (damaged, missing guards, exposed parts)
- PPE compliance (who is wearing/not wearing what)
- Environmental hazards (spills, fire risks, structural issues)
- Proximity hazards (unsafe distances between workers and hazards)
- Any lockout/tagout violations
- Signs of electrical, chemical, fall, or mechanical hazards

Be specific and concise. Maximum 200 words. Focus on observable facts, not speculation.
If no safety hazards are visible, say "No visible safety hazards detected."
"""
```

### Audio Extraction Prompt
```python
AUDIO_EXTRACTION_PROMPT = """
You are transcribing a voice note from a worker reporting a safety concern.

1. Provide an accurate transcript of what was said.
2. Extract key safety facts mentioned:
   - How long the hazard has existed
   - Whether supervisors were informed
   - Previous incidents at this location
   - Number of workers at risk
   - Any urgency indicators

Format: First the transcript, then a "Key Facts:" section.
Maximum 250 words total.
"""
```

---

## Context Bonus (Risk Score Modifier)

When image or audio extraction provides additional evidence, the risk score gets a small bonus:

```python
CONTEXT_BONUS = {
    "image_confirms_hazard": +5,    # Image shows the hazard mentioned in text
    "image_shows_ppe_violation": +8, # Image shows PPE not being worn
    "audio_confirms_known_hazard": +6, # Audio says hazard has existed >24h
    "audio_shows_no_prior_action": +4, # Audio says supervisor was told but no action
    "image_only_fallback": 0,        # Image extraction failed — no bonus/penalty
}
# Total bonus capped at +15. Final score capped at 100.
```

---

## Fallback Strategy (Three Levels)

```
Level 1 — PREFERRED: Full pipeline
  Text + Image (Gemini Vision) + Audio (Gemini Audio) → Custom SIF Model

Level 2 — GRACEFUL DEGRADATION: Gemini unavailable or quota exceeded
  Text only → Custom SIF Model
  (extraction_fallback = true, no image/audio context in explanation)
  Risk score may be slightly lower — compensated by not penalizing text-only reports

Level 3 — EMERGENCY: sentence-transformers fails to load
  Text → Pure keyword-based fallback scorer
  (is_fallback = true, extraction_fallback = true)
  Returns is_fallback: true — backend logs, officer notified to review manually
```

**Fallback decision logic:**
```python
async def analyze(data):
    # Try Stage 1: Extract from image/audio
    image_context = ""
    audio_context = ""
    extraction_fallback = False

    try:
        if data.get("image_base64"):
            image_context = await gemini_extract_image(data["image_base64"])
        if data.get("audio_base64"):
            audio_context = await gemini_extract_audio(data["audio_base64"])
    except Exception as e:
        logger.warning(f"Gemini extraction failed: {e}")
        extraction_fallback = True
        # Continue with text-only — do NOT fail the whole request

    # Stage 2: Always runs regardless of Stage 1 result
    combined_text = build_corpus(data, image_context, audio_context)
    return sif_model.analyze(combined_text, extraction_fallback)
```

> **Key principle:** Gemini failure never fails the report. The report always gets analyzed. The risk score may be slightly lower without image/audio context, which is safer than blocking report submission.

---

## Gemini API Setup

**Recommended model:** `gemini-1.5-flash` (fast, free tier, multimodal)

**Free tier limits (as of 2026):**
- 15 requests/minute
- 1,000,000 tokens/day
- Sufficient for demo and development

**Installation:**
```bash
pip install google-generativeai
```

**Usage:**
```python
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")
```

**Alternative:** OpenAI GPT-4o mini + Whisper API (if team prefers OpenAI ecosystem)
```python
# Image: GPT-4o mini vision
# Audio: openai.audio.transcriptions.create (Whisper)
```

> **Team decision needed (Day 1):** Gemini or OpenAI? Recommendation: Gemini (free tier more generous, single API for both vision + audio).

---

## Performance Targets (Updated)

| Metric | Target | Maximum |
|---|---|---|
| Stage 1: Gemini image extraction | < 1500ms | 3000ms |
| Stage 1: Gemini audio extraction | < 2000ms | 4000ms |
| Stage 2: SIF model analysis | < 500ms | 2000ms |
| **Total (text only)** | **< 500ms** | **2000ms** |
| **Total (text + image)** | **< 2500ms** | **5000ms** |
| **Total (text + image + audio)** | **< 4000ms** | **7000ms** |

> For the demo: use text + image only. Skip audio to keep latency under 3 seconds.

---

## SIF Precursor Knowledge Base

`precursor_kb.py` — 50 pre-embedded precursors. Examples:

```python
PRECURSOR_KB = [
    {"label": "Energized Equipment Exposure",
     "description": "Worker or equipment is in contact with or near energized electrical equipment without proper isolation",
     "base_weight": 0.85},
    {"label": "Inadequate Isolation/Lockout",
     "description": "Lack of lockout/tagout procedure, energy not isolated before maintenance",
     "base_weight": 0.80},
    {"label": "Working at Height Without Protection",
     "description": "Worker elevated above 2 meters without fall arrest, guard rails, or harness",
     "base_weight": 0.85},
    {"label": "Confined Space Entry",
     "description": "Entry into confined space without permit, atmospheric testing, or rescue plan",
     "base_weight": 0.90},
    {"label": "Struck-By Moving Equipment",
     "description": "Worker in path of moving vehicle, crane load, or rotating machinery",
     "base_weight": 0.80},
    {"label": "Chemical Exposure Without PPE",
     "description": "Exposure to hazardous chemicals without appropriate PPE",
     "base_weight": 0.75},
    {"label": "Bypassed Safety Device",
     "description": "Safety guard, interlock, or protective device removed, disabled, or bypassed",
     "base_weight": 0.90},
    {"label": "Line of Fire",
     "description": "Worker positioned in the path of potential energy release, projectile, or pressurized flow",
     "base_weight": 0.85}
]
```

---

## Updated Environment Variables

Add to `ai-service/.env`:
```
PORT=8000
AI_API_KEY=dev-secret-key-change-in-production
LOG_LEVEL=INFO
MODEL_NAME=all-MiniLM-L6-v2
GEMINI_API_KEY=your_gemini_api_key_here
# OR if using OpenAI:
# OPENAI_API_KEY=your_openai_api_key_here
# EXTRACTION_PROVIDER=openai
EXTRACTION_PROVIDER=gemini
```

---

## Updated requirements.txt

```
flask==3.0.0
sentence-transformers==2.7.0
numpy==1.26.0
scikit-learn==1.4.0
gunicorn==21.2.0
google-generativeai==0.7.0
# If using OpenAI instead:
# openai==1.35.0
```

---

## Backend API Contract Update

`POST /api/reports` request body is **unchanged** — the backend receives `imageUrl` as base64.

When calling the AI service, the backend maps:
```js
// server/services/aiService.js
const aiPayload = {
  report_id: report._id.toString(),
  title: report.title,
  description: report.description,
  location: report.location,
  category: report.category,
  severity: report.severity,
  image_base64: report.imageUrl || null,   // ← forward image if present
  audio_base64: report.audioUrl || null,    // ← forward audio if present
}
```

---

## Demo Recommendation

For the demo, submit a report with:
1. **Text**: "Exposed electrical wiring near water pump, insulation stripped, near water pipe"
2. **Image**: A photo of exposed wiring (can be a stock photo for demo)

The system will:
1. Send text + image to AI service
2. Gemini describes the image: "Bare copper wires visible, no insulation, proximity to water source"
3. Combined corpus fed to SIF model
4. Result: CRITICAL (87+/100), 3 SIF precursors, "82% SIF probability"
5. `extracted_image_context` appears in the explanation — **visually impressive for judges**
