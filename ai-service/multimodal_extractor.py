"""
ForeSite - Multimodal Extractor (Stage 1)
Extracts structured hazard descriptions and audio transcripts using Gemini 1.5 Flash API.
Includes resilient fallback when API key is missing or quota/network fails.
"""

import base64
import logging
import re
from typing import Tuple, Optional
from config import GEMINI_API_KEY

logger = logging.getLogger("foresite.multimodal")

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

# Lazy initialization of Gemini client
_genai_client = None
_genai_initialized = False

def get_gemini_client():
    global _genai_client, _genai_initialized
    if _genai_initialized:
        return _genai_client
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        logger.info("No valid GEMINI_API_KEY configured. Multimodal extraction will use fallback mode.")
        _genai_initialized = True
        _genai_client = None
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _genai_client = genai.GenerativeModel("gemini-1.5-flash")
        _genai_initialized = True
        logger.info("Google Gemini 1.5 Flash client initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to initialize google.generativeai: {e}")
        _genai_client = None
        _genai_initialized = True

    return _genai_client


def _clean_base64(data_str: str) -> Tuple[bytes, str]:
    """
    Parses data URI or raw base64 string, returning (binary_bytes, mime_type).
    """
    mime_type = "image/jpeg"
    if "," in data_str:
        header, encoded = data_str.split(",", 1)
        mime_match = re.search(r"data:([^;]+);base64", header)
        if mime_match:
            mime_type = mime_match.group(1)
    else:
        encoded = data_str

    raw_bytes = base64.b64decode(encoded)
    return raw_bytes, mime_type


def extract_from_image(image_base64: Optional[str]) -> Tuple[Optional[str], bool]:
    """
    Extracts visible hazard description from base64 image.
    Returns (extracted_text, is_fallback).
    """
    if not image_base64 or not image_base64.strip():
        return None, False

    client = get_gemini_client()
    if client is None:
        return None, True

    try:
        raw_bytes, mime_type = _clean_base64(image_base64)
        image_part = {
            "mime_type": mime_type,
            "data": raw_bytes
        }

        response = client.generate_content([IMAGE_EXTRACTION_PROMPT, image_part])
        text = response.text.strip() if response and response.text else None
        
        # Limit to 300 chars as per contract specification
        if text and len(text) > 300:
            text = text[:297] + "..."
        return text, False
    except Exception as e:
        logger.warning(f"Gemini image extraction failed gracefully: {e}")
        return None, True


def extract_from_audio(audio_base64: Optional[str]) -> Tuple[Optional[str], bool]:
    """
    Transcribes and extracts safety facts from base64 audio.
    Returns (extracted_text, is_fallback).
    """
    if not audio_base64 or not audio_base64.strip():
        return None, False

    client = get_gemini_client()
    if client is None:
        return None, True

    try:
        raw_bytes, mime_type = _clean_base64(audio_base64)
        audio_part = {
            "mime_type": mime_type if "audio" in mime_type else "audio/webm",
            "data": raw_bytes
        }

        response = client.generate_content([AUDIO_EXTRACTION_PROMPT, audio_part])
        text = response.text.strip() if response and response.text else None

        # Limit to 300 chars as per contract specification
        if text and len(text) > 300:
            text = text[:297] + "..."
        return text, False
    except Exception as e:
        logger.warning(f"Gemini audio extraction failed gracefully: {e}")
        return None, True
