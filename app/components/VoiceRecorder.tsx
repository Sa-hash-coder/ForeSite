"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/app/lib/LanguageContext";

interface VoiceRecorderProps {
  onAudioChange: (base64Audio: string | null) => void;
}

export default function VoiceRecorder({ onAudioChange }: VoiceRecorderProps) {
  const { t } = useLanguage();
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Convert to base64 data URI
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onAudioChange(base64);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      setError(t.errMicPermission);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  function deleteAudio() {
    setAudioUrl(null);
    setRecordingTime(0);
    onAudioChange(null);
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return (
    <div style={s.container}>
      <label style={s.label}>{t.voiceNoteLabel}</label>
      <p style={s.hint}>{t.voiceNoteHint}</p>

      {error && <div style={s.error}>{error}</div>}

      {!audioUrl && !recording && (
        <button type="button" onClick={startRecording} style={s.recordBtn}>
          <span style={{ fontSize: "20px" }}>🎙️</span>
          <span>{t.voiceNoteRecord}</span>
        </button>
      )}

      {recording && (
        <div style={s.recordingBox}>
          <div style={s.recordingIndicator}>
            <span style={s.pulsingDot}>🔴</span>
            <span style={s.recordingText}>{t.voiceNoteRecording}</span>
            <span style={s.timerBadge}>{formatTime(recordingTime)}</span>
          </div>

          <button type="button" onClick={stopRecording} style={s.stopBtn}>
            {t.voiceNoteStop}
          </button>
        </div>
      )}

      {audioUrl && (
        <div style={s.playerBox}>
          <div style={s.playerHeader}>
            <span style={{ fontWeight: 700, color: "#15803d", fontSize: "14px" }}>
              ✅ {t.voiceNoteRecorded} ({formatTime(recordingTime)})
            </span>
            <button type="button" onClick={deleteAudio} style={s.deleteBtn}>
              {t.voiceNoteDelete}
            </button>
          </div>

          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={audioUrl} style={s.audioElement} />
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "14px 16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  },
  label: {
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--text)",
  },
  hint: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginBottom: "4px",
  },
  recordBtn: {
    backgroundColor: "#eff6ff",
    border: "2px solid #3b82f6",
    color: "#1d4ed8",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "4px",
  },
  recordingBox: {
    backgroundColor: "#fef2f2",
    border: "2px solid #ef4444",
    borderRadius: "8px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "4px",
  },
  recordingIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  pulsingDot: {
    fontSize: "16px",
  },
  recordingText: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#b91c1c",
    flex: 1,
  },
  timerBadge: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 700,
  },
  stopBtn: {
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },
  playerBox: {
    backgroundColor: "#f0fdf4",
    border: "1.5px solid #86efac",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "4px",
  },
  playerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    padding: "2px 6px",
  },
  audioElement: {
    width: "100%",
    height: "36px",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: 600,
  },
};
