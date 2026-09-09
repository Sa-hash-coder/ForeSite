"use client";

/**
 * HoldToSpeakMic — Brave/Firefox/Chrome compatible voice recorder.
 *
 * Uses MediaRecorder (works in all browsers including Brave) to capture audio,
 * then sends to /api/transcribe which uses Groq Whisper large-v3.
 * No browser Speech API is used — zero privacy-blocking issues.
 */

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/app/lib/LanguageContext";

interface Props {
  onAudioChange: (base64Audio: string | null) => void;
  onTranscript: (text: string) => void;
}

type Phase = "idle" | "recording" | "transcribing" | "done";

export default function HoldToSpeakMic({ onAudioChange, onTranscript }: Props) {
  const { lang, t } = useLanguage();

  const [speechLang, setSpeechLang] = useState<"hi" | "en">(lang === "hi" ? "hi" : "en");
  const [phase, setPhase]           = useState<Phase>("idle");
  const [seconds, setSeconds]       = useState(0);
  const [audioUrl, setAudioUrl]     = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [detLang, setDetLang]       = useState<"hi" | "en" | null>(null);
  const [errMsg, setErrMsg]         = useState<string | null>(null);
  const [noKey, setNoKey]           = useState(false);

  const speechLangR = useRef(speechLang);
  const timerR      = useRef<ReturnType<typeof setInterval> | null>(null);
  const mrRef       = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);

  useEffect(() => { speechLangR.current = speechLang; }, [speechLang]);
  useEffect(() => { setSpeechLang(lang === "hi" ? "hi" : "en"); }, [lang]);
  useEffect(() => () => { cleanup(); }, []); // eslint-disable-line

  function isHindi(s: string) { return /[\u0900-\u097F]/.test(s); }
  function fmt(s: number) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }

  function cleanup() {
    if (timerR.current) { clearInterval(timerR.current); timerR.current = null; }
    if (mrRef.current && mrRef.current.state !== "inactive") {
      try { mrRef.current.stop(); } catch { /* ok */ }
    }
  }

  // ─── Send audio blob → /api/transcribe → get text ───────────
  async function transcribeAudio(blob: Blob): Promise<string> {
    const fd = new FormData();
    // Groq Whisper needs a named file with audio extension
    fd.append("audio", new File([blob], "recording.webm", { type: blob.type || "audio/webm" }));
    fd.append("lang", speechLangR.current);

    const res = await fetch("/api/transcribe", { method: "POST", body: fd });
    const json = await res.json();

    if (!res.ok) {
      if (json.error?.includes("GROQ_API_KEY")) {
        setNoKey(true);
      }
      throw new Error(json.error || "Transcription failed");
    }
    return (json.text as string) || "";
  }

  // ─── Start recording ─────────────────────────────────────────
  async function startRecording() {
    if (phase === "recording" || phase === "transcribing") return;

    setErrMsg(null);
    setTranscript("");
    setAudioUrl(null);
    setDetLang(null);
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErrMsg(lang === "hi"
        ? "माइक की अनुमति दें — Brave में 🦁 आइकन → Site Settings → Mic → Allow"
        : "Mic blocked — click the 🦁 icon in Brave address bar → Site Settings → Microphone → Allow");
      return;
    }

    const mr = new MediaRecorder(stream, { mimeType: getSupportedMime() });
    mrRef.current = mr;
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunksRef.current, { type: mr.mimeType });
      const url  = URL.createObjectURL(blob);
      setAudioUrl(url);

      // base64 for parent component
      const fr = new FileReader();
      fr.onloadend = () => onAudioChange(fr.result as string);
      fr.readAsDataURL(blob);

      // ── Transcribe ───────────────────────────────────────────
      setPhase("transcribing");
      try {
        const text = await transcribeAudio(blob);
        if (text) {
          setTranscript(text);
          setDetLang(isHindi(text) ? "hi" : "en");
          onTranscript(text);
        }
        setPhase("done");
      } catch (err) {
        console.error(err);
        setErrMsg(err instanceof Error ? err.message : "Transcription failed");
        setPhase("done");
      }
    };

    mr.start(500);
    setPhase("recording");
    setSeconds(0);
    timerR.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  // ─── Stop recording ──────────────────────────────────────────
  function stopRecording() {
    if (phase !== "recording") return;
    cleanup();
    // onstop fires → transcription begins
    if (mrRef.current && mrRef.current.state !== "inactive") {
      mrRef.current.stop();
    }
  }

  // ─── Delete ──────────────────────────────────────────────────
  function deleteRecording() {
    cleanup();
    setPhase("idle");
    setTranscript(""); setAudioUrl(null); setDetLang(null); setSeconds(0);
    onAudioChange(null); onTranscript("");
  }

  // ─── Pick best supported audio MIME type ─────────────────────
  function getSupportedMime(): string {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  }

  // ─────────────────────────────────────────────────────────────
  const isRec          = phase === "recording";
  const isTranscribing = phase === "transcribing";
  const isDone         = phase === "done";

  return (
    <div style={S.card}>

      {/* Header */}
      <div style={S.row}>
        <div>
          <div style={S.title}>{t.voiceMainTitle}</div>
          <div style={S.sub}>{t.voiceMainSubtitle}</div>
        </div>
        <button
          type="button"
          disabled={isRec || isTranscribing}
          onClick={() => setSpeechLang((l) => l === "hi" ? "en" : "hi")}
          style={S.langBtn}
        >
          {speechLang === "hi" ? "🇮🇳 हिंदी" : "🇬🇧 English"}
        </button>
      </div>

      {/* API key missing warning */}
      {noKey && (
        <div style={{ ...S.err, background: "#fff7ed", borderColor: "#fdba74", color: "#9a3412" }}>
          ⚙️ {lang === "hi"
            ? "GROQ_API_KEY नहीं मिली। .env.local में GROQ_API_KEY=gsk_... add करें और server restart करें।"
            : "GROQ_API_KEY missing. Add GROQ_API_KEY=gsk_... to .env.local and restart the server."}
        </div>
      )}

      {/* Error */}
      {errMsg && !noKey && <div style={S.err}>⚠️ {errMsg}</div>}

      {/* Big round button */}
      <div style={S.col}>
        <button
          type="button"
          onClick={isRec ? stopRecording : isTranscribing ? undefined : isDone ? deleteRecording : startRecording}
          disabled={isTranscribing}
          style={{
            ...S.micBtn,
            background: isRec ? "#dc2626" : isTranscribing ? "#7c3aed" : isDone ? "#1d4ed8" : "#1d4ed8",
            boxShadow: isRec
              ? "0 0 0 18px rgba(220,38,38,0.15), 0 6px 24px rgba(220,38,38,0.4)"
              : isTranscribing
              ? "0 0 0 18px rgba(124,58,237,0.15), 0 6px 24px rgba(124,58,237,0.4)"
              : "0 0 0 10px rgba(29,78,216,0.12), 0 4px 16px rgba(29,78,216,0.3)",
            transform: (isRec || isTranscribing) ? "scale(1.08)" : "scale(1)",
            cursor: isTranscribing ? "wait" : "pointer",
          }}
          aria-label="microphone"
        >
          <span style={{ fontSize: 38, lineHeight: 1 }}>
            {isRec ? "⏹️" : isTranscribing ? "⏳" : isDone ? "🔄" : "🎙️"}
          </span>
        </button>

        {/* Status */}
        {isRec && (
          <div style={S.col}>
            <span style={S.pill}>🔴 {fmt(seconds)}</span>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#b91c1c", textAlign: "center" }}>
              {lang === "hi" ? "रिकॉर्ड हो रहा है — बोलते रहें" : "Recording — keep speaking"}
            </div>
            <div style={{ fontSize: 12, color: "#b91c1c" }}>
              {lang === "hi" ? "बोलना खत्म हो जाए तो ⏹ दबाएं" : "Tap ⏹ when done"}
            </div>
          </div>
        )}

        {isTranscribing && (
          <div style={S.col}>
            <span style={{ ...S.pill, background: "#ede9fe", color: "#5b21b6", borderColor: "#c4b5fd" }}>
              ⏳ {lang === "hi" ? "AI text बना रहा है…" : "AI is converting…"}
            </span>
            <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>
              {lang === "hi" ? "Whisper AI सुन रहा है — 10-15 सेकंड" : "Whisper AI processing — 10–15 sec"}
            </div>
          </div>
        )}

        {isDone && !isTranscribing && (
          <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d", textAlign: "center" }}>
            ✅ {t.voiceRecordedSuccess} ({fmt(seconds)})
            <br />
            <button type="button" onClick={deleteRecording} style={{ ...S.del, fontSize: 13, marginTop: 4 }}>
              🔄 {lang === "hi" ? "दोबारा बोलें" : "Re-record"}
            </button>
          </div>
        )}

        {phase === "idle" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>
              {lang === "hi" ? "🎙️ दबाएं और बोलें" : "🎙️ Tap & Speak"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
              {lang === "hi" ? "Brave, Chrome, Firefox — सब में काम करता है" : "Works in Brave, Chrome & Firefox"}
            </div>
          </div>
        )}
      </div>

      {/* Done result */}
      {(isDone || isTranscribing) && (
        <div style={S.doneCard}>
          {audioUrl && !isTranscribing && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#15803d" }}>✅ {t.voiceRecordedSuccess}</span>
                <button type="button" onClick={deleteRecording} style={S.del}>{t.voiceDelete}</button>
              </div>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls src={audioUrl} style={{ width: "100%", height: 36 }} />
            </>
          )}

          {/* Transcript */}
          <div style={S.txBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: "#1e3a8a" }}>✍️ {t.convertedTextTitle}</span>
              {detLang && !isTranscribing && (
                <span style={S.badge}>
                  {detLang === "hi" ? "🇮🇳 " + t.detectedHindi : "🇬🇧 " + t.detectedEnglish}
                </span>
              )}
            </div>

            {isTranscribing ? (
              <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>
                {lang === "hi" ? "⏳ Whisper AI text बना रहा है…" : "⏳ Whisper AI is transcribing your audio…"}
              </div>
            ) : transcript ? (
              <textarea
                value={transcript}
                rows={3}
                onChange={(e) => { setTranscript(e.target.value); onTranscript(e.target.value); }}
                style={S.ta}
                placeholder={lang === "hi" ? "यहाँ सुधार सकते हैं…" : "Edit if needed…"}
              />
            ) : (
              <div style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>
                {lang === "hi"
                  ? "⚠️ आवाज़ नहीं पकड़ी। दोबारा बोलें या नीचे टाइप करें।"
                  : "⚠️ No speech in audio. Try again or type below."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card:     { background: "#fff", border: "2px solid #3b82f6", borderRadius: 12, padding: "18px 16px", boxShadow: "0 2px 8px rgba(59,130,246,0.08)" },
  row:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  col:      { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 0" },
  title:    { fontWeight: 800, fontSize: 16, color: "var(--text)" },
  sub:      { fontSize: 13, color: "var(--text-muted)", marginTop: 2 },
  langBtn:  { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#1d4ed8", cursor: "pointer" },
  err:      { background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 10 },
  micBtn:   { width: 104, height: 104, borderRadius: "50%", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s ease", outline: "none", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" },
  pill:     { background: "#fee2e2", color: "#991b1b", fontSize: 14, fontWeight: 800, padding: "3px 14px", borderRadius: 20, border: "1px solid #fca5a5" },
  doneCard: { background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: 14, marginTop: 14, display: "flex", flexDirection: "column", gap: 8 },
  del:      { background: "transparent", border: "none", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 },
  txBox:    { background: "#fff", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px" },
  badge:    { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 },
  ta:       { width: "100%", fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.6, border: "none", outline: "none", resize: "vertical", fontFamily: "inherit", background: "transparent" },
};
