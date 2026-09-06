"""
ForeSite - AI Microservice API Server
Provides endpoints for SIF precursor detection, risk scoring, multimodal extraction, and health checks.
Strictly adheres to ForeSite AI Contract specifications.
"""

import json
import logging
import os
import sys
import time
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS

from config import PORT, AI_API_KEY, LOG_LEVEL, MODEL_VERSION
from multimodal_extractor import extract_from_image, extract_from_audio, get_gemini_client
from risk_scorer import analyze_report, load_ai_model

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("foresite.api")

app = Flask(__name__)
CORS(app)


def verify_api_key():
    """Verifies X-API-Key request header."""
    # Allow empty/dev API key if configured
    if not AI_API_KEY:
        return True

    header_key = request.headers.get("X-API-Key")
    if not header_key or header_key != AI_API_KEY:
        return False
    return True


@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint returning system status and model readiness.
    """
    model, source = load_ai_model()
    gemini_client = get_gemini_client()

    return jsonify({
        "status": "UP",
        "model_loaded": model is not None,
        "model_version": MODEL_VERSION,
        "model_source": source,
        "gemini_available": gemini_client is not None,
        "fallback_available": True
    }), 200


@app.route("/mock-analyze", methods=["POST", "GET"])
def mock_analyze():
    """
    Returns pre-baked high-fidelity CRITICAL SIF response for instant demos.
    """
    mock_file = Path(__file__).resolve().parent.parent / "Description" / "mock" / "ai-response.json"
    if mock_file.exists():
        with open(mock_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return jsonify(data), 200

    # Fallback built-in mock if file is displaced
    return jsonify({
        "risk_score": 91,
        "risk_level": "CRITICAL",
        "sif_probability": 0.89,
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
        "explanation": "This report describes exposed energized wiring in proximity to water sources — a classic SIF precursor combination. Image analysis confirmed bare copper conductors visible. Voice note revealed the hazard has been present for approximately 2 weeks. Immediate circuit isolation and repair is critical.",
        "extracted_image_context": "Image shows: bare copper wires exposed at a junction box. No insulation visible. Floor appears damp.",
        "extracted_audio_context": "Transcript: Worker states this wiring condition has existed for about two weeks with no action taken.",
        "model_version": MODEL_VERSION,
        "processing_time_ms": 420,
        "is_fallback": False,
        "extraction_fallback": False
    }), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Primary analysis endpoint.
    Performs Stage 1 multimodal extraction + Stage 2 SIF risk scoring.
    """
    if not verify_api_key():
        return jsonify({
            "error": "Unauthorized",
            "detail": "Invalid or missing X-API-Key header"
        }), 401

    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "error": "Bad Request",
            "detail": "Request body must be a valid JSON object"
        }), 400

    report_id = data.get("report_id")
    title = data.get("title")
    description = data.get("description")

    # Field validation as per contract
    if not report_id or not title or not description:
        return jsonify({
            "error": "Missing required fields",
            "detail": "Fields 'report_id', 'title', and 'description' are required"
        }), 400

    if len(str(description).strip()) < 5:
        return jsonify({
            "error": "Unprocessable Entity",
            "detail": "Field 'description' must contain at least 5 characters"
        }), 422

    # Stage 1: Multimodal extraction
    image_context = None
    audio_context = None
    extraction_fallback = False

    image_b64 = data.get("image_base64")
    audio_b64 = data.get("audio_base64")

    if image_b64:
        extracted_img, img_fallback = extract_from_image(image_b64)
        image_context = extracted_img
        if img_fallback:
            extraction_fallback = True

    if audio_b64:
        extracted_aud, aud_fallback = extract_from_audio(audio_b64)
        audio_context = extracted_aud
        if aud_fallback:
            extraction_fallback = True

    # Stage 2: SIF Precursor Detection & Risk Scoring
    try:
        result = analyze_report(
            report_id=str(report_id),
            title=str(title).strip(),
            description=str(description).strip(),
            location=data.get("location"),
            category=data.get("category"),
            severity=data.get("severity"),
            image_context=image_context,
            audio_context=audio_context,
            extraction_fallback=extraction_fallback
        )
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Analysis engine failure: {e}", exc_info=True)
        return jsonify({
            "error": "Internal AI Service Error",
            "detail": str(e)
        }), 500


if __name__ == "__main__":
    logger.info(f"Starting ForeSite AI Service on port {PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=False)
