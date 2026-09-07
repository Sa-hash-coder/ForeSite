"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/app/lib/LanguageContext";

interface HoldToSpeakMicProps {
  onAudioChange: (base64Audio: string | null) => void;
  onTranscript: (text: string) => void;
}

interface IWindow extends Window {
  SpeechRecognition?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  webkitSpeechRecognition?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function HoldToSpeakMic({
  onAudioChange,
  onTranscript,
}: HoldToSpeakMicProps) {
  const { lang, t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isHeldRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  async function startAll() {
    if (isHeldRef.current) return;
    isHeldRef.current = true;
    setMicError(null);
    setLiveTranscript("");

    // 1. Start Audio Stream & MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Convert to base64 Data URI
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onAudioChange(base64);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks to release microphone hardware
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setMicError(t.errMicPermission);
      isHeldRef.current = false;
      return;
    }

    // 2. Start Speech-To-Text Recognition concurrently in background
    if (typeof window !== "undefined") {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass =
        win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";

          recognition.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            let finalStr = "";
            for (let i = 0; i < event.results.length; ++i) {
              finalStr += event.results[i][0].transcript + " ";
            }
            const trimmed = finalStr.trim();
            setLiveTranscript(trimmed);
            onTranscript(trimmed);
          };

          recognition.onerror = () => {
            // Silently continue audio recording even if speech recognition has error
          };

          recognition.start();
        } catch {
          // ignore
        }
      }
    }
  }

  function stopAll() {
    if (!isHeldRef.current) return;
    isHeldRef.current = false;
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }

  function deleteRecording() {
    setAudioUrl(null);
    setRecordingSeconds(0);
    setLiveTranscript("");
    onAudioChange(null);
  }

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return (
    <div style={s.card}>
      <div style={s.headerBox}>
        <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text)" }}>
          {t.voiceMainTitle}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          {t.voiceMainSubtitle}
        </div>
      </div>

      {micError && <div style={s.errorBox}>⚠️ {micError}</div>}

      {/* Main Mic Section */}
      {!audioUrl ? (
        <div style={s.micArea}>
          {/* Round Hold-To-Speak Button */}
          <div style={s.btnWrapper}>
            <button
              type="button"
              onMouseDown={startAll}
              onMouseUp={stopAll}
              onMouseLeave={stopAll}
              onTouchStart={(e) => {
                e.preventDefault();
                startAll();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopAll();
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                stopAll();
              }}
              style={{
                ...s.roundBtn,
                backgroundColor: isRecording ? "#dc2626" : "#1d4ed8",
                boxShadow: isRecording
                  ? "0 0 0 12px rgba(220, 38, 38, 0.25), 0 4px 14px rgba(220, 38, 38, 0.4)"
                  : "0 0 0 6px rgba(29, 78, 216, 0.15), 0 4px 12px rgba(29, 78, 216, 0.3)",
                transform: isRecording ? "scale(1.08)" : "scale(1)",
              }}
              aria-label={t.voiceHoldToSpeak}
            >
              <span style={{ fontSize: "36px", userSelect: "none" }}>
                {isRecording ? "🔴" : "🎙️"}
              </span>
            </button>
          </div>

          {/* Prompt / Status beneath mic */}
          <div style={s.statusTextWrapper}>
            {isRecording ? (
              <div style={s.activeRecordingStatus}>
                <span style={s.pulsingBadge}>
                  {t.voiceRecordingTimer}: {formatTimer(recordingSeconds)}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#b91c1c" }}>
                  {t.voiceListeningNow}
                </span>
              </div>
            ) : (
              <div style={s.idleStatus}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                  {t.voiceHoldToSpeak}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  (Release button when finished speaking)
                </span>
              </div>
            )}
          </div>

          {/* Live speech preview as they speak */}
          {isRecording && liveTranscript && (
            <div style={s.liveTranscriptBox}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8" }}>
                ✍️ {liveTranscript}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Recorded Player Preview Box */
        <div style={s.recordedCard}>
          <div style={s.recordedTop}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "18px" }}>✅</span>
              <span style={{ fontWeight: 700, color: "#15803d", fontSize: "14px" }}>
                {t.voiceRecordedSuccess} ({formatTimer(recordingSeconds)})
              </span>
            </div>

            <button type="button" onClick={deleteRecording} style={s.deleteBtn}>
              {t.voiceDelete}
            </button>
          </div>

          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={audioUrl} style={s.audioTag} />

          <button type="button" onClick={deleteRecording} style={s.reRecordBtn}>
            {t.voiceReRecord}
          </button>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    border: "2px solid #3b82f6",
    borderRadius: "12px",
    padding: "18px 16px",
    boxShadow: "0 2px 6px rgba(59, 130, 246, 0.08)",
  },
  headerBox: {
    marginBottom: "16px",
  },
  micArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 0 10px 0",
    gap: "14px",
  },
  btnWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  roundBtn: {
    width: "88px",
    height: "88px",
    borderRadius: "50%",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    touchAction: "none",
  },
  statusTextWrapper: {
    textAlign: "center",
  },
  idleStatus: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  activeRecordingStatus: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  pulsingBadge: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    fontSize: "13px",
    fontWeight: 800,
    padding: "3px 12px",
    borderRadius: "16px",
    border: "1px solid #fca5a5",
  },
  liveTranscriptBox: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "8px 12px",
    maxWidth: "90%",
    textAlign: "center",
  },
  recordedCard: {
    backgroundColor: "#f0fdf4",
    border: "1.5px solid #86efac",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  recordedTop: {
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
  audioTag: {
    width: "100%",
    height: "38px",
  },
  reRecordBtn: {
    backgroundColor: "#fff",
    border: "1px solid #86efac",
    color: "#15803d",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "12px",
  },
};
