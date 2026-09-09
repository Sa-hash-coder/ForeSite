import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not set in .env.local" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const lang = (formData.get("lang") as string) || "en";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const groq = new Groq({ apiKey });

    // Groq's Whisper large-v3 — supports Hindi, English, Hinglish
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      language: lang === "hi" ? "hi" : "en",
      response_format: "text",
    });

    // Groq returns a string when response_format is "text"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = transcription as any;
    const text: string = (typeof raw === "string" ? raw : raw?.text ?? "").trim();

    return NextResponse.json({ text });
  } catch (err: unknown) {
    console.error("Transcription error:", err);
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
