"""
ForeSite - AI Service Verification & Test Suite
Tests endpoints, schemas, authentication, risk calculations, and fallback mechanisms.
"""

import json
import os
import sys
from pathlib import Path

# Ensure ai-service is in sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from main import app
from risk_scorer import analyze_report, load_ai_model
from precursor_kb import PRECURSOR_KB

def test_kb_integrity():
    print("\n--- Test 1: Precursor Knowledge Base Integrity ---")
    assert len(PRECURSOR_KB) >= 20, f"Expected at least 20 precursors, found {len(PRECURSOR_KB)}"
    for p in PRECURSOR_KB:
        assert "id" in p
        assert "label" in p
        assert "description" in p
        assert "base_weight" in p
        assert "keywords" in p
        assert "remediation_steps" in p and len(p["remediation_steps"]) > 0
        assert 0.0 <= p["base_weight"] <= 1.0
    print(f"PASSED: Knowledge Base contains {len(PRECURSOR_KB)} valid SIF precursors with remediation steps.")

def test_engine_critical_hazard():
    print("\n--- Test 2: Engine Analysis of Critical Hazard ---")
    result = analyze_report(
        report_id="test-rep-01",
        title="Exposed electrical wiring near water pump",
        description="Found bare copper wiring approximately 2 meters from the main water pump in Sector 4. Wire insulation is completely stripped and damp.",
        location="Sector 4",
        category="unsafe_condition",
        image_context="Image shows: bare copper wires exposed near water pipe junction.",
        audio_context="Transcript: Worker mentions wiring has been exposed for 2 weeks with no supervisor action."
    )

    print(f"Result: Score={result['risk_score']}, Level={result['risk_level']}, Precursors={result['precursors']}")
    print(f"Suggestions: {result['recommendations']}")
    assert result["risk_score"] >= 75, f"Expected CRITICAL score >=75, got {result['risk_score']}"
    assert result["risk_level"] == "CRITICAL"
    assert result["sif_probability"] >= 0.70
    assert len(result["precursors"]) > 0
    assert len(result["hazards"]) > 0
    assert len(result["recommendations"]) > 0
    assert "explanation" in result and len(result["explanation"]) <= 600
    print("PASSED: Critical hazard correctly identified and scored with fix recommendations.")

def test_engine_low_hazard():
    print("\n--- Test 3: Engine Analysis of Low Hazard ---")
    result = analyze_report(
        report_id="test-rep-02",
        title="Clean mop water on hallway tile",
        description="Small clean water puddle left after morning cleaning. Yellow caution cone is not placed.",
        location="Reception hallway",
        category="near_miss"
    )

    print(f"Result: Score={result['risk_score']}, Level={result['risk_level']}, Precursors={result['precursors']}")
    assert result["risk_score"] < 50, f"Expected LOW/MEDIUM score < 50, got {result['risk_score']}"
    assert result["risk_level"] in ["LOW", "MEDIUM"]
    print("PASSED: Low risk incident correctly scored.")

def test_flask_endpoints():
    print("\n--- Test 4: Flask API Endpoints & Auth ---")
    client = app.test_client()

    # 1. Health endpoint
    res = client.get("/health")
    assert res.status_code == 200, f"Health returned {res.status_code}"
    health_data = res.get_json()
    assert health_data["status"] == "UP"
    assert "model_loaded" in health_data
    assert "gemini_available" in health_data
    print("PASSED: /health responded 200 OK.")

    # 2. Mock analyze endpoint
    res = client.post("/mock-analyze")
    assert res.status_code == 200
    mock_data = res.get_json()
    assert mock_data["risk_score"] >= 80
    assert mock_data["risk_level"] == "CRITICAL"
    print("PASSED: /mock-analyze returned high-fidelity demo payload.")

    # 3. Auth failure test
    res = client.post("/analyze", json={
        "report_id": "123",
        "title": "test",
        "description": "testing unauthorized request"
    }, headers={"X-API-Key": "wrong-key"})
    assert res.status_code == 401, f"Expected 401 Unauthorized, got {res.status_code}"
    print("PASSED: Unauthorized request rejected with 401.")

    # 4. Validation error test (missing description)
    res = client.post("/analyze", json={
        "report_id": "123",
        "title": "Missing description test"
    }, headers={"X-API-Key": "dev-secret-key-change-in-production"})
    assert res.status_code == 400, f"Expected 400 Bad Request, got {res.status_code}"
    print("PASSED: Missing required field rejected with 400.")

    # 5. Full valid request
    res = client.post("/analyze", json={
        "report_id": "64b2c3d4e5f6a7b8c9d0e2f3",
        "title": "Unsecured scaffolding on 4th floor",
        "description": "Workers on 4th floor scaffolding without harness or mid-rails. Planks are not tied down.",
        "location": "Tower B, 4th Floor"
    }, headers={"X-API-Key": "dev-secret-key-change-in-production"})
    assert res.status_code == 200, f"Expected 200 OK, got {res.status_code}"
    data = res.get_json()

    # Verify against ai-contract.md specs
    required_fields = [
        "risk_score", "risk_level", "sif_probability", "precursors",
        "hazards", "recommendations", "explanation", "extracted_image_context", "extracted_audio_context",
        "model_version", "processing_time_ms", "is_fallback", "extraction_fallback"
    ]
    for field in required_fields:
        assert field in data, f"Missing contract field: {field}"

    assert isinstance(data["recommendations"], list) and len(data["recommendations"]) > 0, "Expected recommendations"
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert 0.0 <= data["sif_probability"] <= 1.0
    print(f"PASSED: /analyze response matches AI contract perfectly: Score={data['risk_score']} Level={data['risk_level']} Recs={len(data['recommendations'])} Time={data['processing_time_ms']}ms")

def test_severity_boost():
    """
    Test 5: Worker self-reported severity should nudge the final risk score.
    A 'critical' self-report should give a higher score than 'low' for same incident.
    """
    print("\n--- Test 5: Severity Boost Influence ---")
    base_params = {
        "report_id": "test-sev-01",
        "title": "Worker climbing unmarked ladder",
        "description": "Old wooden ladder being used to reach storage shelf above warehouse floor. No spotter present.",
        "location": "Warehouse Bay 2"
    }

    result_low = analyze_report(**base_params, severity="low")
    result_critical = analyze_report(**base_params, severity="critical")

    print(f"Score with severity=low     : {result_low['risk_score']}")
    print(f"Score with severity=critical: {result_critical['risk_score']}")

    assert result_critical["risk_score"] >= result_low["risk_score"], (
        f"Expected critical ({result_critical['risk_score']}) >= low ({result_low['risk_score']})"
    )
    print("PASSED: severity=critical produced >= score compared to severity=low.")


if __name__ == "__main__":
    print("Starting ForeSite AI Service Verification Tests...")
    test_kb_integrity()
    test_engine_critical_hazard()
    test_engine_low_hazard()
    test_flask_endpoints()
    test_severity_boost()
    print("\n==========================================")
    print("ALL AI SERVICE TESTS PASSED SUCCESSFULLY!")
    print("==========================================")
