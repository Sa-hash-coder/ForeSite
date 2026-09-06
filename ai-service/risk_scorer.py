"""
ForeSite - AI Risk Scorer (Stage 2)
====================================
This file contains the core AI logic for ForeSite.
It receives the incident report text, checks it against our SIF precursor
knowledge base, calculates a risk score (0-100), and generates an explanation.

How it works (in 5 simple steps):
1. Combine report text (title, description, and any image/voice findings).
2. Find matching SIF precursors using Sentence-Transformers (or keyword fallback).
3. Identify hazard categories (Electrocution, Fall, Toxic, etc.).
4. Calculate the risk score (0-100) and SIF probability.
5. Create a human-readable explanation summary for the safety team.
"""

import logging
import os
import re
import time
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
from config import (
    MODEL_NAME,
    CUSTOM_MODEL_PATH,
    SIMILARITY_THRESHOLD,
    MAX_PRECURSORS,
    MAX_HAZARDS,
    CONTEXT_BONUS,
    MAX_CONTEXT_BONUS,
    MODEL_VERSION,
)
from precursor_kb import PRECURSOR_KB

logger = logging.getLogger("foresite.risk_scorer")

# Cache the AI model in memory so it doesn't reload on every request
_model_instance = None
_model_source = None
_cached_kb_embeddings = None
_is_initialized = False


def load_ai_model():
    """
    Loads our Sentence-Transformer model into memory.
    1. First checks if we have a fine-tuned model saved in models/custom-sif-minilm/
    2. Otherwise uses the standard all-MiniLM-L6-v2 model.
    3. If sentence_transformers isn't installed, falls back to keyword matching.
    """
    global _model_instance, _model_source, _cached_kb_embeddings, _is_initialized
    if _is_initialized:
        return _model_instance, _model_source

    _is_initialized = True
    try:
        from sentence_transformers import SentenceTransformer

        # Step 1: Check for custom fine-tuned model from Colab
        if os.path.isdir(CUSTOM_MODEL_PATH):
            logger.info(f"Loading our fine-tuned safety model from: {CUSTOM_MODEL_PATH}")
            _model_instance = SentenceTransformer(CUSTOM_MODEL_PATH)
            _model_source = "custom-finetuned"
        else:
            logger.info(f"Loading pretrained base model: {MODEL_NAME}")
            _model_instance = SentenceTransformer(MODEL_NAME)
            _model_source = "base-pretrained"

        # Step 2: Pre-compute vector embeddings for all precursors in our knowledge base.
        # This makes comparisons on CPU take only a few milliseconds!
        texts = [f"{p['label']}: {p['description']}" for p in PRECURSOR_KB]
        _cached_kb_embeddings = _model_instance.encode(
            texts, 
            convert_to_numpy=True, 
            normalize_embeddings=True
        )
        logger.info(f"Successfully loaded model and cached {len(texts)} precursor embeddings.")

    except Exception as err:
        logger.warning(f"Note: Running in Rule-Based Mode ({err}).")
        _model_instance = None
        _model_source = "rule-fallback"

    return _model_instance, _model_source


def calculate_cosine_similarity(report_vector: np.ndarray, kb_vectors: np.ndarray) -> np.ndarray:
    """
    Calculates cosine similarity between the report embedding and all knowledge base embeddings.
    Cosine similarity measures how close two texts are in meaning (range: -1.0 to 1.0).
    """
    dot_products = np.dot(kb_vectors, report_vector)
    vector_norm = np.linalg.norm(report_vector)
    if vector_norm == 0:
        return np.zeros(len(kb_vectors))
    return dot_products / vector_norm


def match_precursors_by_keywords(text: str) -> List[Dict[str, Any]]:
    """
    Fallback method: If PyTorch/SentenceTransformers is not available,
    we look for specific safety keywords defined in our knowledge base.
    """
    text_clean = text.lower()
    matches = []

    for item in PRECURSOR_KB:
        hit_count = 0
        for keyword in item["keywords"]:
            # Simple word boundary regex match (e.g. finds 'bare wire' or 'harness')
            if re.search(r"\b" + re.escape(keyword) + r"\b", text_clean):
                hit_count += 1
        
        if hit_count > 0:
            # Score higher if more matching safety words appear
            sim_score = min(0.95, 0.65 + hit_count * 0.10)
            matches.append({
                "precursor": item,
                "similarity": sim_score
            })

    # Sort matches by score (highest first) and take the top ones
    matches.sort(key=lambda x: x["similarity"], reverse=True)
    return matches[:MAX_PRECURSORS]


def detect_sif_precursors(text: str) -> Tuple[List[Dict[str, Any]], bool]:
    """
    Detects Serious Injury & Fatality (SIF) precursors in the report text.
    Uses vector embeddings if available, otherwise uses keyword matching.
    Returns: (list_of_matches, is_fallback_flag)
    """
    model, source = load_ai_model()

    # If no embedding model, use keyword fallback
    if model is None or _cached_kb_embeddings is None:
        return match_precursors_by_keywords(text), True

    try:
        # Convert the incident report into a 384-dimensional vector
        report_vector = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
        similarities = calculate_cosine_similarity(report_vector, _cached_kb_embeddings)

        matched_items = []
        for i, sim in enumerate(similarities):
            if sim >= SIMILARITY_THRESHOLD:
                matched_items.append({
                    "precursor": PRECURSOR_KB[i],
                    "similarity": float(sim)
                })

        # If semantic search found nothing, do a quick keyword check just in case
        if not matched_items:
            keyword_hits = match_precursors_by_keywords(text)
            if keyword_hits:
                return keyword_hits, False

        matched_items.sort(key=lambda x: x["similarity"], reverse=True)
        return matched_items[:MAX_PRECURSORS], False

    except Exception as err:
        logger.warning(f"Inference warning ({err}). Falling back to rule-based match.")
        return match_precursors_by_keywords(text), True


def identify_hazards(text: str, matched_precursors: List[Dict[str, Any]]) -> List[str]:
    """
    Identifies high-level hazard categories (e.g. Electrocution, Fall, Crush).
    Combines categories from matched precursors and simple keyword triggers.
    """
    hazard_list = []
    text_lower = text.lower()

    # 1. Take categories directly from matched precursors
    for item in matched_precursors:
        cat = item["precursor"].get("hazard_category")
        if cat and cat not in hazard_list:
            hazard_list.append(cat)

    # 2. Safety vocabulary mapping to catch obvious hazards
    safety_dictionary = {
        "Electrocution": ["wire", "electric", "energized", "voltage", "cable", "shock", "copper"],
        "Arc Flash": ["switchgear", "panel", "arc flash", "spark", "substation"],
        "Fall from Height": ["ladder", "scaffold", "roof", "height", "fall", "edge", "floor hole"],
        "Crush Injury": ["suspended", "hoist", "crane", "pallet", "unstable stack", "crush"],
        "Caught-In/Between": ["roller", "conveyor", "entanglement", "missing guard", "pinch point"],
        "Amputation": ["blade", "saw", "gear", "nip point"],
        "Toxic Exposure": ["fumes", "gas", "chemical", "solvent", "acid", "h2s leak"],
        "Cave-In": ["trench", "excavation", "ditch", "cave-in", "collapse"],
        "Fire & Explosion": ["flammable", "fuel", "gas cylinder", "sparks near fuel"],
    }

    for category, keywords in safety_dictionary.items():
        if len(hazard_list) >= MAX_HAZARDS:
            break
        if category not in hazard_list:
            if any(word in text_lower for word in keywords):
                hazard_list.append(category)

    return hazard_list[:MAX_HAZARDS]


def compute_evidence_bonus(image_context: Optional[str], audio_context: Optional[str]) -> int:
    """
    Adds a small bonus score if visual or audio evidence confirms the hazard.
    For example: if the image clearly shows bare wires or someone without PPE.
    """
    bonus = 0

    if image_context:
        img_text = image_context.lower()
        if any(w in img_text for w in ["exposed", "bare", "damaged", "visible", "unsecured", "leak"]):
            bonus += CONTEXT_BONUS["image_confirms_hazard"]   # +5
        if any(w in img_text for w in ["no ppe", "missing helmet", "without harness", "unprotected"]):
            bonus += CONTEXT_BONUS["image_shows_ppe_violation"]  # +8

    if audio_context:
        aud_text = audio_context.lower()
        if any(w in aud_text for w in ["week", "weeks", "days", "long time", "ongoing", "prior"]):
            bonus += CONTEXT_BONUS["audio_confirms_known_hazard"]  # +6
        if any(w in aud_text for w in ["supervisor", "told", "reported before", "no action", "ignored"]):
            bonus += CONTEXT_BONUS["audio_shows_no_prior_action"]   # +4

    # Cap bonus so it doesn't artificially inflate safe situations
    return min(bonus, MAX_CONTEXT_BONUS)


def build_explanation_text(
    title: str,
    description: str,
    precursor_labels: List[str],
    hazards: List[str],
    risk_level: str,
    sif_probability: float,
    image_context: Optional[str],
    audio_context: Optional[str]
) -> str:
    """
    Builds a clear, professional explanation of the safety hazard for supervisors.
    Keeps it under 600 characters as required by the API contract.
    """
    sentences = []

    # Main finding
    main_precursors = ", ".join(precursor_labels[:2]) if precursor_labels else "workplace hazards"
    main_hazards = ", ".join(hazards[:2]) if hazards else "general safety risks"
    sentences.append(f"Report indicates {main_precursors} associated with {main_hazards}.")

    # Corroborated image findings
    if image_context:
        first_sentence = image_context.split(".")[0].strip()
        sentences.append(f"Image analysis confirmed: {first_sentence}.")

    # Corroborated voice note findings
    if audio_context:
        first_audio = audio_context.split(".")[0].strip()
        sentences.append(f"Audio record noted: {first_audio}.")

    # Actionable conclusion
    pct = int(sif_probability * 100)
    if risk_level in ["CRITICAL", "HIGH"]:
        sentences.append(f"Identified {len(precursor_labels)} SIF precursors with {pct}% SIF probability. Immediate mitigation required.")
    else:
        sentences.append(f"SIF probability is {pct}%. Standard maintenance recommended.")

    result = " ".join(sentences)
    if len(result) > 590:
        result = result[:587] + "..."
    return result


def analyze_report(
    report_id: str,
    title: str,
    description: str,
    location: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    image_context: Optional[str] = None,
    audio_context: Optional[str] = None,
    extraction_fallback: bool = False
) -> Dict[str, Any]:
    """
    The main analysis pipeline function:
    Combines inputs -> Runs detection -> Computes score -> Returns structured JSON.
    """
    start_time = time.time()

    # Step 1: Combine all text inputs into one comprehensive narrative
    combined_parts = [title, description]
    if location:
        combined_parts.append(f"Location: {location}")
    if category:
        combined_parts.append(f"Category: {category}")
    if image_context:
        combined_parts.append(f"Visual evidence: {image_context}")
    if audio_context:
        combined_parts.append(f"Audio notes: {audio_context}")

    full_text = " ".join(combined_parts)

    # Step 2: Detect SIF precursors
    matches, is_fallback = detect_sif_precursors(full_text)
    precursor_names = [m["precursor"]["label"] for m in matches]

    # Step 3: Identify hazards
    hazards = identify_hazards(full_text, matches)

    # Step 4: Calculate the mathematical risk score (0 to 100)
    if matches:
        # Get the highest severity weight among matched precursors
        max_severity = max(m["precursor"]["base_weight"] for m in matches)
        avg_severity = sum(m["precursor"]["base_weight"] for m in matches) / len(matches)
        
        # Base formula: 70% highest severity + 30% average severity, scaled to 80 points
        base_score = (max_severity * 0.70 + avg_severity * 0.30) * 80.0

        # Multi-precursor compound factor: more precursors = higher danger
        count_bonus = min(15.0, (len(matches) - 1) * 5.0)
        raw_score = base_score + count_bonus
    else:
        # Default low score for reports with no SIF precursors
        raw_score = 15.0

    # Add evidence bonuses from image/audio
    evidence_bonus = compute_evidence_bonus(image_context, audio_context)
    final_score = int(min(100, max(5, round(raw_score + evidence_bonus))))

    # Map score to standard risk levels
    if final_score >= 75:
        risk_level = "CRITICAL"
    elif final_score >= 50:
        risk_level = "HIGH"
    elif final_score >= 25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Calculate SIF probability (0.0 to 1.0)
    if final_score >= 75:
        sif_probability = round(min(0.98, 0.75 + (final_score - 75) * 0.009), 2)
    elif final_score >= 50:
        sif_probability = round(0.45 + (final_score - 50) * 0.011, 2)
    elif final_score >= 25:
        sif_probability = round(0.15 + (final_score - 25) * 0.011, 2)
    else:
        sif_probability = round(max(0.02, final_score * 0.005), 2)

    # Step 5: Build explanation
    explanation = build_explanation_text(
        title=title,
        description=description,
        precursor_labels=precursor_names,
        hazards=hazards,
        risk_level=risk_level,
        sif_probability=sif_probability,
        image_context=image_context,
        audio_context=audio_context
    )

    elapsed_ms = int((time.time() - start_time) * 1000)

    # Return the clean, standard response
    return {
        "risk_score": final_score,
        "risk_level": risk_level,
        "sif_probability": sif_probability,
        "precursors": precursor_names,
        "hazards": hazards,
        "explanation": explanation,
        "extracted_image_context": image_context,
        "extracted_audio_context": audio_context,
        "model_version": MODEL_VERSION,
        "processing_time_ms": elapsed_ms,
        "is_fallback": is_fallback,
        "extraction_fallback": extraction_fallback
    }
