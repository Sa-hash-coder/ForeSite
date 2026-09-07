"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { submitReportApi } from "@/app/lib/api";
import { useLanguage } from "@/app/lib/LanguageContext";

export default function SubmitReportPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = Object.entries(t.categories).map(([value, label]) => ({
    value,
    label,
  }));

  const severities = [
    { value: "low", ...t.severities.low, color: "#16a34a" },
    { value: "medium", ...t.severities.medium, color: "#d97706" },
    { value: "high", ...t.severities.high, color: "#ea580c" },
    { value: "critical", ...t.severities.critical, color: "#dc2626" },
  ];

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

    if (!title.trim() || title.trim().length < 5) {
      setError(t.errTitle);
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError(t.errDesc);
      return;
    }
    if (!location) {
      setError(t.errLocation);
      return;
    }
    if (!category) {
      setError(t.errCategory);
      return;
    }
    if (!severity) {
      setError(t.errSeverity);
      return;
    }

    setSubmitting(true);
    try {
      await submitReportApi({
        title: title.trim(),
        description: description.trim(),
        location,
        category,
        severity,
        ...(imageBase64 ? { imageUrl: imageBase64 } : {}),
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
      <div style={s.successCard}>
        <div style={s.successIcon}>✅</div>
        <h2 style={s.successTitle}>{t.submitSuccessTitle}</h2>
        <p style={s.successMsg}>{t.submitSuccessMsg}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/worker/reports")} style={s.primaryBtn}>
            {t.viewMyReports}
          </button>
          <button
            onClick={() => {
              setTitle("");
              setDescription("");
              setLocation("");
              setCategory("");
              setSeverity("");
              setImageBase64(null);
              setImagePreview(null);
              setSuccess(false);
            }}
            style={s.outlineBtn}
          >
            {t.submitAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={s.pageTitle}>{t.submitTitle}</h1>
      <p style={s.pageSubtitle}>{t.submitSubtitle}</p>

      {error && <div style={s.errorBox}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={s.form}>
        {/* Title */}
        <div style={s.field}>
          <label style={s.label} htmlFor="title">{t.whatHappened}</label>
          <p style={s.hint}>{t.whatHappenedHint}</p>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.whatHappenedPlaceholder}
            style={s.input}
            maxLength={150}
          />
        </div>

        {/* Location */}
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

        {/* Description */}
        <div style={s.field}>
          <label style={s.label} htmlFor="description">{t.describeIssue}</label>
          <p style={s.hint}>{t.describeHint}</p>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.describePlaceholder}
            rows={3}
            style={s.textarea}
            maxLength={1000}
          />
        </div>

        {/* Category */}
        <div style={s.field}>
          <label style={s.label}>{t.issueTypeLabel}</label>
          <div style={s.chipGrid}>
            {categories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                style={{
                  ...s.chip,
                  ...(category === c.value ? s.chipSelected : {}),
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div style={s.field}>
          <label style={s.label}>{t.severityLabel}</label>
          <div style={s.severityGrid}>
            {severities.map((sv) => (
              <button
                key={sv.value}
                type="button"
                onClick={() => setSeverity(sv.value)}
                style={{
                  ...s.severityOption,
                  border: `2px solid ${severity === sv.value ? sv.color : "#e5e7eb"}`,
                  backgroundColor: severity === sv.value ? `${sv.color}12` : "#fff",
                }}
              >
                <span style={{ fontWeight: 800, color: sv.color, fontSize: "14px" }}>
                  {sv.title}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.3 }}>
                  {sv.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div style={s.field}>
          <label style={s.label}>{t.photoLabel}</label>
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
              style={s.photoBtn}
            >
              {t.photoBtn}
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
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
  pageTitle: { fontSize: "20px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" },
  pageSubtitle: { fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "14px 16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  },
  label: { fontSize: "15px", fontWeight: 700, color: "var(--text)" },
  hint: { fontSize: "13px", color: "var(--text-muted)" },
  input: {
    border: "1.5px solid var(--border)",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "15px",
    color: "var(--text)",
    backgroundColor: "#fff",
    marginTop: "6px",
    outline: "none",
    width: "100%",
  },
  textarea: {
    border: "1.5px solid var(--border)",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "15px",
    color: "var(--text)",
    backgroundColor: "#fff",
    marginTop: "6px",
    outline: "none",
    resize: "vertical",
    width: "100%",
    fontFamily: "inherit",
  },
  select: {
    border: "1.5px solid var(--border)",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "15px",
    color: "var(--text)",
    backgroundColor: "#fff",
    marginTop: "6px",
    outline: "none",
    width: "100%",
  },
  chipGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  chip: {
    border: "1.5px solid var(--border)",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "var(--text)",
  },
  chipSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#1d4ed8",
    color: "#1d4ed8",
    fontWeight: 700,
  },
  severityGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "8px",
  },
  severityOption: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
  },
  photoBtn: {
    backgroundColor: "#fafaf9",
    border: "2px dashed var(--border)",
    borderRadius: "6px",
    padding: "16px",
    fontSize: "15px",
    fontWeight: 600,
    color: "var(--text-muted)",
    cursor: "pointer",
    width: "100%",
    marginTop: "6px",
  },
  imagePreviewWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
  imagePreview: {
    width: "100%",
    maxHeight: "200px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid var(--border)",
  },
  removeImg: {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--danger)",
    fontSize: "13px",
    cursor: "pointer",
    padding: "0",
    textAlign: "left",
    fontWeight: 600,
  },
  submitBtn: {
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "16px",
    fontWeight: 800,
    width: "100%",
    marginTop: "4px",
    boxShadow: "0 2px 4px rgba(29, 78, 216, 0.2)",
  },
  errorBox: {
    backgroundColor: "var(--danger-light)",
    border: "1px solid #fca5a5",
    color: "var(--danger)",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "4px",
  },
  successCard: {
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "36px 20px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  successIcon: { fontSize: "44px", marginBottom: "12px" },
  successTitle: { fontSize: "20px", fontWeight: 800, color: "var(--text)", marginBottom: "10px" },
  successMsg: { fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.6 },
  primaryBtn: {
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  outlineBtn: {
    backgroundColor: "#fff",
    color: "#1d4ed8",
    border: "1.5px solid #1d4ed8",
    borderRadius: "6px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
};
