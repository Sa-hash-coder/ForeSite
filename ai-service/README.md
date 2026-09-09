# ForeSite AI Microservice

A lightweight Python Flask microservice that performs **SIF (Serious Injury & Fatality) precursor detection** and **risk scoring** on workplace incident reports, with optional multimodal input support via Google Gemini 1.5 Flash.

---

## Architecture — Two-Stage Pipeline

`
               +----------------------+
  image/audio  |  Stage 1: Gemini 1.5 |
  base64 ----> |  Flash (Multimodal)  | --> hazard description text
               +----------------------+
                          |
               +----------------------------+
  title +      |  Stage 2: SentenceTransf.  |
  description >|  all-MiniLM-L6-v2 / rules  | --> risk score + precursors + recommendations
               +----------------------------+
`

**Stage 1** (Multimodal Extraction): Gemini reads images and voice notes and outputs a text description of visible hazards.

**Stage 2** (Semantic Risk Scoring): Combined text is compared against 23 SIF precursor entries in our Knowledge Base using cosine similarity. Matching entries determine the risk score, hazard categories, and fix recommendations.

### Fallback Levels
| Level | When | What runs |
|---|---|---|
| Level 1 (Full) | Gemini + sentence_transformers both available | Full pipeline |
| Level 2 (Text-only) | Gemini down / no API key | Skip image/audio, run Stage 2 |
| Level 3 (Rules) | sentence_transformers not installed | Keyword matching against precursor KB |

---

## Project Structure

`
ai-service/
+-- main.py                  # Flask API server -- 3 endpoints
+-- config.py                # Env vars and scoring constants
+-- precursor_kb.py          # 23 SIF precursor entries
+-- risk_scorer.py           # Stage 2: semantic scoring + recommendations
+-- multimodal_extractor.py  # Stage 1: Gemini image + audio analysis
+-- requirements.txt         # Python dependencies
+-- Dockerfile               # Production Docker image (Gunicorn)
+-- .env.example             # Template for environment variables
+-- EXAMPLES.md              # 5 demo scenarios with curl commands
+-- test_ai_service.py       # 5-test verification suite
+-- training/
    +-- prepare_dataset.py   # Generates OSHA-aligned training pairs locally
    +-- train_colab.py       # Fine-tunes all-MiniLM-L6-v2 on Google Colab GPU
`

---

## Running Locally

### Prerequisites
`powershell
# Use Anaconda Python (the system default may not have pip)
& "C:\Users\saura\anaconda3\python.exe" -m pip install flask flask-cors numpy scikit-learn google-generativeai python-dotenv
# Optional (enables semantic scoring instead of keyword fallback):
& "C:\Users\saura\anaconda3\python.exe" -m pip install sentence-transformers
`

### Setup .env
`
cp .env.example .env
# Fill in AI_API_KEY and GEMINI_API_KEY
`

### Start the server
`powershell
& "C:\Users\saura\anaconda3\python.exe" main.py
# Server starts on http://localhost:8000
`

### Run tests
`powershell
& "C:\Users\saura\anaconda3\python.exe" test_ai_service.py
`

---

## API Endpoints

### GET /health
Returns service status, model loaded state, and Gemini availability.

### POST /analyze
Headers: X-API-Key: <your-key>, Content-Type: application/json

Body fields: report_id, title, description (required), location, category, severity, image_base64, audio_base64 (optional, image max 10 MB)

### POST /mock-analyze
Returns a pre-built CRITICAL demo payload for UI testing.

---

## Risk Scoring Formula

`
base_score  = (max_precursor_weight x 0.70 + avg_precursor_weight x 0.30) x 80
count_bonus = min(15, (num_precursors - 1) x 5)
sev_boost   = SEVERITY_BOOST[worker_severity]   # -5 (low) to +12 (critical)
evidence    = image_bonus + audio_bonus  (capped at 15)

final_score = clamp(base_score + count_bonus + sev_boost + evidence, 5, 100)
`

| Risk Level | Score Range | SIF Probability Band |
|---|---|---|
| LOW | 5 - 24 | 0.02 - 0.15 |
| MEDIUM | 25 - 49 | 0.15 - 0.45 |
| HIGH | 50 - 74 | 0.45 - 0.75 |
| CRITICAL | 75 - 100 | 0.75 - 0.98 |

---

## Fine-Tuning on Google Colab (Optional but Recommended)

1. Run training/prepare_dataset.py locally to generate training/training_pairs.json.
2. Upload the file to Google Drive.
3. Open training/train_colab.py in Google Colab and run all cells.
4. Download the custom-sif-minilm.zip output.
5. Extract it to ai-service/models/custom-sif-minilm/.
6. Restart the Flask server -- it will auto-detect and load the fine-tuned model.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| PORT | No (default 8000) | Port to listen on |
| AI_API_KEY | Yes | Secret key for X-API-Key header auth |
| GEMINI_API_KEY | No | Google AI Studio API key for multimodal |
| CUSTOM_MODEL_PATH | No | Path to fine-tuned model |
| MODEL_NAME | No | HuggingFace model fallback (all-MiniLM-L6-v2) |
| LOG_LEVEL | No (default INFO) | Logging verbosity |
