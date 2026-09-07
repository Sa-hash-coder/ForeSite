"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/app/lib/LanguageContext";

interface VoiceDictateButtonProps {
  onTranscript: (text: string) => void;
  append?: boolean;
}

// Interface for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface IWindow extends Window {
  SpeechRecognition?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  webkitSpeechRecognition?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function VoiceDictateButton({ onTranscript }: VoiceDictateButtonProps) {
  const { lang, t } = useLanguage();
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  function toggleDictation() {
    if (typeof window === "undefined") return;
    const windowWithSpeech = window as unknown as IWindow;
    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert(t.errVoiceNotSupported);
      return;
    }

    if (listening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch {
      setListening(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleDictation}
      style={{
        ...s.btn,
        backgroundColor: listening ? "#fee2e2" : "#f0fdf4",
        borderColor: listening ? "#ef4444" : "#86efac",
        color: listening ? "#dc2626" : "#15803d",
      }}
      title={listening ? t.voiceTypingListening : t.voiceTypingStart}
    >
      <span style={{ fontSize: "14px" }}>{listening ? "🔴" : "🎙️"}</span>
      <span style={{ fontSize: "12px", fontWeight: 700 }}>
        {listening ? t.voiceTypingListening : t.voiceTypingStart}
      </span>
    </button>
  );
}

const s: Record<string, React.CSSProperties> = {
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "16px",
    border: "1.5px solid",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.15s ease",
  },
};
