"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/app/lib/LanguageContext";

interface VoiceReadAloudButtonProps {
  textToRead: string;
}

export default function VoiceReadAloudButton({ textToRead }: VoiceReadAloudButtonProps) {
  const { lang, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Stop speech when component unmounts or language changes
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lang]);

  function handleToggleSpeech() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Audio speech synthesis is not supported on this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = textToRead.replace(/[🚫🛑⚠️⚡🪝👷😷🚪🦺🚶👀🧹•\-]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95; // Slightly slower for maximum clarity
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }

  return (
    <button
      type="button"
      onClick={handleToggleSpeech}
      style={{
        ...s.btn,
        backgroundColor: isPlaying ? "#fee2e2" : "#eff6ff",
        borderColor: isPlaying ? "#f87171" : "#93c5fd",
        color: isPlaying ? "#b91c1c" : "#1d4ed8",
      }}
      title={isPlaying ? t.stopListenAdviceBtn : t.listenAdviceBtn}
    >
      <span style={{ fontSize: "16px" }}>{isPlaying ? "⏹️" : "🔊"}</span>
      <span style={{ fontWeight: 700 }}>
        {isPlaying ? t.stopListenAdviceBtn : t.listenAdviceBtn}
      </span>
    </button>
  );
}

const s: Record<string, React.CSSProperties> = {
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1.5px solid",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
};
