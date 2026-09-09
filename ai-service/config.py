import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

PORT = int(os.getenv("PORT", "8000"))
AI_API_KEY = os.getenv("AI_API_KEY", "dev-secret-key-change-in-production")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Model settings
MODEL_NAME = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
CUSTOM_MODEL_PATH = os.getenv("CUSTOM_MODEL_PATH", str(BASE_DIR / "models" / "custom-sif-minilm"))

# Multimodal settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
EXTRACTION_PROVIDER = os.getenv("EXTRACTION_PROVIDER", "gemini")

# Language translation settings
# Set TRANSLATION_ENABLED=false to disable Hindi→English translation (e.g. in environments without Gemini)
TRANSLATION_ENABLED = os.getenv("TRANSLATION_ENABLED", "true").lower() != "false"

# Thresholds & Scoring
SIMILARITY_THRESHOLD = 0.60
MAX_PRECURSORS = 5
MAX_HAZARDS = 5

CONTEXT_BONUS = {
    "image_confirms_hazard": 5,
    "image_shows_ppe_violation": 8,
    "audio_confirms_known_hazard": 6,
    "audio_shows_no_prior_action": 4,
    "image_only_fallback": 0,
}
MAX_CONTEXT_BONUS = 15

MODEL_VERSION = "v1.1-gemini-hybrid"
