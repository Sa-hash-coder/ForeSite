"""
ForeSite - Language Processor
==============================
Detects the language of incoming report text and translates it to English
before it reaches the risk scoring engine.

Supports Hindi (hi), Hinglish (mixed Hindi-English), and falls back gracefully
when the Gemini API is unavailable — in that case the original text is passed
through unchanged so the system never hard-fails.

Design goals:
  - Zero new dependencies (reuses the existing Gemini client from multimodal_extractor)
  - English text skips translation entirely → zero added latency
  - All translation metadata is returned so the API response can inform the caller
"""

import logging
import re
from typing import Tuple, Optional

from config import GEMINI_API_KEY

logger = logging.getLogger("foresite.language")

# ---------------------------------------------------------------------------
# Prompt used to detect + translate in a SINGLE Gemini call to save latency
# ---------------------------------------------------------------------------
DETECT_AND_TRANSLATE_PROMPT = """\
You are a multilingual workplace safety assistant for an Indian industrial safety platform.

Your task has two steps:

1. DETECT the language of the text below. Use ISO 639-1 codes:
   - "en" = English (or mostly English / Hinglish leaning English)
   - "hi" = Hindi (Devanagari script or Romanized Hindi)
   - "hinglish" = Mixed Hindi-English (Hinglish)
   - "other" = Any other language

2. If the detected language is NOT "en", translate the text to clear, professional English
   suitable for a safety incident report. Preserve all technical details, locations, numbers,
   and severity indicators. Do NOT add or remove information.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "detected_language": "<code>",
  "is_english": <true|false>,
  "translated_text": "<English translation, or the original text if already English>"
}

Text to process:
"""


# Lazy singleton — reuses the same Gemini model instance as multimodal_extractor
_translation_client = None
_translation_initialized = False


def _get_translation_client():
    """Returns a Gemini GenerativeModel for text-only translation calls."""
    global _translation_client, _translation_initialized

    if _translation_initialized:
        return _translation_client

    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        logger.info(
            "No valid GEMINI_API_KEY — language translation will be skipped (passthrough mode)."
        )
        _translation_initialized = True
        _translation_client = None
        return None

    try:
        import google.generativeai as genai
        # Use the same API key already configured by multimodal_extractor
        # genai.configure() is idempotent, safe to call again
        genai.configure(api_key=GEMINI_API_KEY)
        # gemini-1.5-flash is fast and cheap for short text tasks
        _translation_client = genai.GenerativeModel("gemini-1.5-flash")
        _translation_initialized = True
        logger.info("Language processor: Gemini client ready.")
    except Exception as e:
        logger.warning(f"Language processor: Failed to init Gemini client: {e}")
        _translation_client = None
        _translation_initialized = True

    return _translation_client


def _contains_devanagari(text: str) -> bool:
    """Fast heuristic: checks if text contains any Devanagari Unicode characters."""
    return bool(re.search(r"[\u0900-\u097F]", text))


def _looks_english(text: str) -> bool:
    """
    Quick pre-check: if the text is overwhelmingly ASCII (> 95%) and has no
    Devanagari, it's almost certainly English — skip the Gemini call entirely.
    """
    if _contains_devanagari(text):
        return False
    total = len(text)
    if total == 0:
        return True
    ascii_count = sum(1 for c in text if ord(c) < 128)
    return (ascii_count / total) > 0.95


def translate_if_needed(
    title: str,
    description: str,
) -> Tuple[str, str, str, bool]:
    """
    Main entry point called by main.py before risk analysis.

    Detects language and translates title + description to English if needed.

    Args:
        title:       Report title (may be Hindi/Hinglish)
        description: Report description (may be Hindi/Hinglish)

    Returns:
        (translated_title, translated_description, detected_language, was_translated)

    Guarantees:
        Never raises — falls back to original text on any error.
    """
    # Combine for detection (description carries more signal than title alone)
    combined = f"{title}. {description}"

    # Fast path: skip Gemini call entirely for English text
    if _looks_english(combined):
        logger.debug("Language processor: Text is English — skipping translation.")
        return title, description, "en", False

    client = _get_translation_client()

    if client is None:
        # Gemini unavailable — pass through original text, flag as untranslated
        logger.warning(
            "Language processor: Gemini unavailable. Passing original text to risk engine."
        )
        return title, description, "unknown", False

    # --- Translate title and description separately so each stays focused ---
    translated_title, lang_title = _translate_field(client, title, "title")
    translated_desc, lang_desc = _translate_field(client, description, "description")

    # Use whichever field gave us a concrete language code (description wins)
    detected_language = lang_desc if lang_desc not in ("en", "unknown") else lang_title
    was_translated = detected_language not in ("en", "unknown")

    if was_translated:
        logger.info(
            f"Language processor: Translated from '{detected_language}' to English. "
            f"Title: '{title[:40]}' → '{translated_title[:40]}'"
        )
    else:
        logger.debug(f"Language processor: Detected as '{detected_language}', no translation needed.")

    return translated_title, translated_desc, detected_language, was_translated


def _translate_field(client, text: str, field_name: str) -> Tuple[str, str]:
    """
    Calls Gemini to detect + translate a single text field.

    Returns (translated_text, detected_language_code).
    Falls back to original text on any error.
    """
    if not text or not text.strip():
        return text, "en"

    try:
        import json

        prompt = DETECT_AND_TRANSLATE_PROMPT + text.strip()
        response = client.generate_content(prompt)
        raw = response.text.strip() if response and response.text else ""

        # Strip any accidental markdown fences (e.g. ```json ... ```)
        raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
        raw = re.sub(r"\s*```$", "", raw, flags=re.MULTILINE)

        parsed = json.loads(raw)
        detected_lang = parsed.get("detected_language", "unknown")
        is_english = parsed.get("is_english", False)
        translated = parsed.get("translated_text", text)

        if is_english or not translated:
            return text, detected_lang

        return str(translated).strip(), detected_lang

    except Exception as e:
        logger.warning(
            f"Language processor: Translation failed for {field_name} ('{text[:40]}'): {e}. "
            f"Using original text."
        )
        return text, "unknown"
