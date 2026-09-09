import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not set in .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json() as {
      imageBase64?: string;   // full data URL: "data:image/jpeg;base64,..."
      transcript?: string;    // voice transcript (optional)
      lang?: string;          // "hi" | "en"
    };

    const { imageBase64, transcript = "", lang = "en" } = body;

    if (!imageBase64 && !transcript) {
      return NextResponse.json(
        { error: "Provide at least an image or a transcript" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    // Build prompt parts
    const parts: Parameters<typeof model.generateContent>[0] extends { contents: infer C } ? C : never[] = [];

    // If image provided, add it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentParts: any[] = [];

    if (imageBase64) {
      // Strip data URL prefix to get raw base64
      const base64Data = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;
      const mimeMatch = imageBase64.match(/data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

      contentParts.push({
        inlineData: { data: base64Data, mimeType },
      });
    }

    const transcriptNote = transcript
      ? `\n\nWorker also said (voice note): "${transcript}"`
      : "";

    contentParts.push({
      text: `You are an industrial workplace safety AI analyzing a hazard report.
${imageBase64 ? "Analyze the image carefully." : "No image provided."}${transcriptNote}

Based on ALL available information (image + voice note), return ONLY a JSON object:
{
  "hazard_detected": true,
  "hazard_type": "short type e.g. gas_leak_fire | electrical | structural | fall | chemical | machinery",
  "danger_level": "CRITICAL | HIGH | MEDIUM | LOW",
  "risk_score": <number 1-100>,
  "title_en": "Short hazard title in English (max 8 words)",
  "title_hi": "हिंदी में छोटा शीर्षक (max 8 words)",
  "what_was_observed": "1-2 sentence plain English description of the hazard",
  "immediate_actions": [
    "Most urgent action (evacuate/shut off/call etc.)",
    "Second action",
    "Third action"
  ],
  "suggestions_en": [
    "Safety suggestion 1",
    "Safety suggestion 2",
    "Safety suggestion 3"
  ],
  "suggestions_hi": [
    "हिंदी सुझाव 1",
    "हिंदी सुझाव 2",
    "हिंदी सुझाव 3"
  ],
  "repair_tasks": [
    "Repair task 1",
    "Repair task 2"
  ]
}

Rules:
- danger_level CRITICAL if fire/explosion/collapse/electrocution risk
- risk_score 80-100 for CRITICAL, 60-79 HIGH, 30-59 MEDIUM, 1-29 LOW
- Return ONLY the JSON, no markdown, no explanation`,
    });

    const result = await model.generateContent({ contents: [{ role: "user", parts: contentParts }] });
    const rawText = result.response.text().trim();

    // Strip markdown code fences if model adds them
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    let analysisJson;
    try {
      analysisJson = JSON.parse(cleaned);
    } catch {
      // Return raw text for debugging
      return NextResponse.json({ raw: rawText, error: "Model did not return valid JSON" }, { status: 200 });
    }

    return NextResponse.json({ analysis: analysisJson, lang });

  } catch (err: unknown) {
    console.error("Analysis error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
