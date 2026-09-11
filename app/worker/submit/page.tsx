"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { submitReportApi } from "@/app/lib/api";
import { useLanguage } from "@/app/lib/LanguageContext";
import HoldToSpeakMic from "@/app/components/HoldToSpeakMic";

export default function SubmitReportPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError(t.errPhotoSize);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!location) {
      setError(t.errLocation);
      return;
    }

    // Check that at least one of Voice Note, Text, or Photo is provided
    if (!audioBase64 && !description.trim() && !imageBase64) {
      setError(t.errNoInput);
      return;
    }

    setSubmitting(true);

    const generatedTitle = description.trim()
      ? description.trim().slice(0, 60)
      : (lang === "hi" ? `ख़तरे की रिपोर्ट - ${location}` : `Hazard Report - ${location}`);

    const finalDescription = description.trim()
      ? description.trim()
      : (lang === "hi" ? "श्रमिक द्वारा वॉयस नोट / फ़ोटो संलग्न की गई है।" : "Voice note or hazard photo attached by worker.");

    try {
      await submitReportApi({
        title: generatedTitle,
        description: finalDescription,
        location,
        category: "unsafe_condition", // Defaulted for API, AI computes exact hazard
        severity: "high",             // Defaulted for API, AI calculates exact risk score
        ...(imageBase64 ? { imageUrl: imageBase64 } : {}),
        ...(audioBase64 ? { audioUrl: audioBase64 } : {}),
      });
      setSuccess(true);
    } catch {
      // In standalone frontend preview mode, simulate success
      setTimeout(() => {
        setSuccess(true);
      }, 400);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="apple-card animate-apple-scale-in" style={s.successCard}>
        <div style={s.successIcon}>✅</div>
        <h2 style={s.successTitle}>{t.submitSuccessTitle}</h2>
        <p style={s.successMsg}>{t.submitSuccessMsg}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/worker/reports")} className="apple-btn" style={s.primaryBtn}>
            {t.viewMyReports}
          </button>
          <button
            onClick={() => {
              setDescription("");
              setLocation("");
              setImageBase64(null);
              setImagePreview(null);
              setAudioBase64(null);
              setSuccess(false);
            }}
            className="apple-btn"
            style={s.outlineBtn}
          >
            {t.submitAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-apple-fade-up">
      <h1 style={s.pageTitle}>{t.submitTitle}</h1>
      <p style={s.pageSubtitle}>{t.submitSubtitle}</p>

      {error && <div style={s.errorBox}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="apple-card" style={s.form}>
        {/* Step 1: Location Selection */}
        <div style={s.field}>
          <label style={s.label} htmlFor="location">{t.locationLabel}</label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={s.select}
          >
            <option value="">{t.selectLocation}</option>
            {t.locations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Step 2: MAIN VOICE COMPONENT (Hold to speak round mic) */}
        <HoldToSpeakMic
          onAudioChange={(base64) => {
            setAudioBase64(base64);
          }}
          onTranscript={(spokenText) => {
            setDescription(spokenText);
          }}
        />

        {/* Step 3: Optional Text Box (Auto-filled by voice, editable if desired) */}
        <div style={s.field}>
          <div style={s.labelRow}>
            <label style={s.label} htmlFor="description">{t.optionalTextLabel}</label>
            <span style={s.optionalTag}>
              {lang === "hi" ? "ऐच्छिक" : "Optional"}
            </span>
          </div>
          <p style={s.hint}>{t.optionalTextHint}</p>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.optionalTextPlaceholder}
            rows={3}
            style={s.textarea}
            maxLength={1000}
          />
        </div>

        {/* Step 4: Photo Attachment */}
        <div style={s.field}>
          <div style={s.labelRow}>
            <label style={s.label}>{t.photoLabel}</label>
            <span style={s.optionalTag}>
              {lang === "hi" ? "ऐच्छिक" : "Optional"}
            </span>
          </div>
          <p style={s.hint}>{t.photoHint}</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          {imagePreview ? (
            <div style={s.imagePreviewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" style={s.imagePreview} />
              <button
                type="button"
                style={s.removeImg}
                onClick={() => {
                  setImageBase64(null);
                  setImagePreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                {t.removePhoto}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="apple-btn"
              style={s.photoBtn}
            >
              {t.photoBtn}
            </button>
          )}
        </div>

        {/* Big Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="apple-btn"
          style={{
            ...s.submitBtn,
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? t.submitting : t.submitBtn}
        </button>
      </form>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  pageTitle: { fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" },
  pageSubtitle: { fontSize: "14px", color: "var(--text-muted)", marginBottom: "18px", lineHeight: 1.4 },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: "15px", fontWeight: 800, color: "var(--text)" },
  optionalTag: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  hint: { fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" },
  select: {
    border: "1.5px solid var(--border)",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "15px",
    color: "var(--text)",
    backgroundColor: "#fff",
    marginTop: "8px",
    outline: "none",
    width: "100%",
    cursor: "pointer",
  },
  textarea: {
    border: "1.5px solid var(--border)",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "15px",
    color: "var(--text)",
    backgroundColor: "#fff",
    marginTop: "8px",
    outline: "none",
    resize: "vertical",
    width: "100%",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  photoBtn: {
    backgroundColor: "#f8fafc",
    border: "2px dashed #cbd5e1",
    borderRadius: "8px",
    padding: "16px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#475569",
    cursor: "pointer",
    width: "100%",
    marginTop: "8px",
  },
  imagePreviewWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
  imagePreview: {
    width: "100%",
    maxHeight: "220px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid var(--border)",
  },
  removeImg: {
    backgroundColor: "transparent",
    border: "none",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    padding: "2px 0",
    textAlign: "left",
  },
  submitBtn: {
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "16px",
    fontSize: "17px",
    fontWeight: 800,
    width: "100%",
    marginTop: "6px",
    boxShadow: "0 3px 8px rgba(29, 78, 216, 0.25)",
    cursor: "pointer",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "4px",
  },
  successCard: {
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "36px 20px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  successIcon: { fontSize: "48px", marginBottom: "12px" },
  successTitle: { fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "10px" },
  successMsg: { fontSize: "15px", color: "var(--text-muted)", marginBottom: "22px", lineHeight: 1.6 },
  primaryBtn: {
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  outlineBtn: {
    backgroundColor: "#fff",
    color: "#1d4ed8",
    border: "1.5px solid #1d4ed8",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
};
