/**
 * ForeSite Backend - AI Service Bridge
 * ====================================
 * Connects the Express backend to the Python AI microservice.
 * Sends incident report data to http://localhost:8000/analyze
 * and returns the risk score, SIF precursors, hazards, and fix suggestions.
 * 
 * Includes a safe built-in fallback so the backend never crashes
 * if the AI service is temporarily offline during development!
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || "dev-secret-key-change-in-production";

/**
 * Sends a report to the AI service for risk assessment and precursor detection.
 * @param {Object} report - Mongoose Report document or plain object
 * @returns {Promise<Object>} Risk assessment data matching the database schema
 */
async function analyzeReport(report) {
  const payload = {
    report_id: report._id ? report._id.toString() : "TEMP-" + Date.now(),
    title: report.title,
    description: report.description,
    location: report.location || null,
    category: report.category || null,
    severity: report.severity || null,
    image_base64: report.imageUrl || null,
    audio_base64: report.audioUrl || null,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": AI_SERVICE_API_KEY,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[aiService] AI microservice returned HTTP ${response.status}: ${errorText}`);
      return getFallbackAssessment(payload);
    }

    const data = await response.json();
    return {
      riskScore: data.risk_score,
      riskLevel: data.risk_level,
      sifProbability: data.sif_probability,
      precursors: data.precursors || [],
      hazards: data.hazards || [],
      recommendations: data.recommendations || [],
      explanation: data.explanation || "",
      modelVersion: data.model_version || "v1.1-gemini-hybrid",
      processingTimeMs: data.processing_time_ms || 0,
      isFallback: Boolean(data.is_fallback),
    };
  } catch (error) {
    console.warn(`[aiService] Could not reach AI service (${error.message}). Using safe local fallback.`);
    return getFallbackAssessment(payload);
  }
}

/**
 * Safe fallback assessment in case Python service is unreachable.
 * Allows the backend team to test report creation even if the Python service is offline.
 */
function getFallbackAssessment(payload) {
  const isHighKeywords = /wire|electric|height|harness|trench|gas|confined|scaffold/i.test(
    (payload.title || "") + " " + (payload.description || "")
  );

  return {
    riskScore: isHighKeywords ? 75 : 30,
    riskLevel: isHighKeywords ? "CRITICAL" : "LOW",
    sifProbability: isHighKeywords ? 0.75 : 0.15,
    precursors: isHighKeywords ? ["Potential Critical Precursor (Pending Review)"] : [],
    hazards: isHighKeywords ? ["Electrical / Mechanical Risk"] : ["General Safety Risk"],
    recommendations: [
      "Conduct immediate supervisor inspection.",
      "Verify safety barricades around affected zone."
    ],
    explanation: "Notice: AI service was offline or unreachable. Preliminary heuristic risk estimate applied. Safety officer manual review required.",
    modelVersion: "v1.1-offline-fallback",
    processingTimeMs: 5,
    isFallback: true,
  };
}

/**
 * Checks if the Python AI service is healthy and online.
 */
async function checkAiHealth() {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`, { method: "GET" });
    if (res.ok) {
      return await res.json();
    }
    return { status: "DOWN", error: `HTTP ${res.status}` };
  } catch (err) {
    return { status: "DOWN", error: err.message };
  }
}

module.exports = {
  analyzeReport,
  checkAiHealth,
};
