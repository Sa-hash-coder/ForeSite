"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { submitReportApi } from "@/app/lib/api";

const CATEGORIES = [
  { value: "near_miss",          label: "Near Miss" },
  { value: "unsafe_condition",   label: "Unsafe Condition" },
  { value: "unsafe_act",         label: "Unsafe Act" },
  { value: "equipment_failure",  label: "Equipment Failure" },
  { value: "chemical_exposure",  label: "Chemical Exposure" },
  { value: "other",              label: "Other" },
];

const SEVERITIES = [
  { value: "low",      label: "Low — Minor, no injury likely",            color: "#15803d" },
  { value: "medium",   label: "Medium — Could cause injury if not fixed",  color: "#92400e" },
  { value: "high",     label: "High — Serious injury risk",                color: "#c2410c" },
  { value: "critical", label: "Critical — Immediate danger",               color: "#991b1b" },
];

const LOCATIONS = [
  "Boiler Room A", "Boiler Room B", "Chemical Storage", "Control Room",
  "Electrical Panel Room", "Loading Bay", "Maintenance Workshop",
  "Roof / Height Work Area", "Server Room", "Water Treatment Plant",
  "Warehouse", "Other / Not Listed",
];

export default function SubmitReportPage() {
  const router = useRouter();

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

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Please choose an image under 10 MB.");
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
      setError("Please write a title of at least 5 characters.");
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      setError("Please describe the issue in at least 20 characters.");
      return;
    }
    if (!location) {
      setError("Please select a location.");
      return;
    }
    if (!category) {
      setError("Please select the type of issue.");
      return;
    }
    if (!severity) {
      setError("Please select how serious this is.");
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div style={s.successCard}>
        <div style={s.successIcon}>✅</div>
        <h2 style={s.successTitle}>Report Submitted!</h2>
        <p style={s.successMsg}>
          Your report has been received. The Safety Officer will review it and take action.
          You can track its progress in <strong>My Reports</strong>.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/worker/reports")} style={s.primaryBtn}>
            View My Reports
          </button>
          <button
            onClick={() => {
              setTitle(""); setDescription(""); setLocation(""); setCategory("");
              setSeverity(""); setImageBase64(null); setImagePreview(null);
              setSuccess(false);
            }}
            style={s.outlineBtn}
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={s.pageTitle}>Report a Safety Issue</h1>
      <p style={s.pageSubtitle}>
        Fill in the details below. All fields marked <strong>*</strong> are required.
      </p>

      {error && <div style={s.errorBox}>⚠ {error}</div>}

      <form onSubmit={handleSubmit} style={s.form}>

        {/* Title */}
        <div style={s.field}>
          <label style={s.label} htmlFor="title">What happened? *</label>
          <p style={s.hint}>Write a short title describing the problem</p>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Broken guard rail near staircase"
            style={s.input}
            maxLength={200}
          />
          <span style={s.charCount}>{title.length}/200</span>
        </div>

        {/* Description */}
        <div style={s.field}>
          <label style={s.label} htmlFor="description">Describe the issue in detail *</label>
          <p style={s.hint}>Where exactly? What did you see? Who is at risk?</p>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. The guard rail on the 2nd floor staircase is broken. It has been like this for 3 days. Workers use this staircase every hour. Someone could fall."
            rows={5}
            style={s.textarea}
            maxLength={2000}
          />
          <span style={s.charCount}>{description.length}/2000</span>
        </div>

        {/* Location */}
        <div style={s.field}>
          <label style={s.label} htmlFor="location">Location *</label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={s.select}
          >
            <option value="">-- Select location --</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div style={s.field}>
          <label style={s.label}>Type of Issue *</label>
          <div style={s.chipGrid}>
            {CATEGORIES.map((c) => (
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
          <label style={s.label}>How serious is this? *</label>
          <div style={s.severityGrid}>
            {SEVERITIES.map((sv) => (
              <button
                key={sv.value}
                type="button"
                onClick={() => setSeverity(sv.value)}
                style={{
                  ...s.severityOption,
                  border: `2px solid ${severity === sv.value ? sv.color : "#e5e7eb"}`,
                  backgroundColor: severity === sv.value ? `${sv.color}10` : "#fff",
                }}
              >
                <span style={{ fontWeight: 700, color: sv.color, fontSize: "14px" }}>
                  {sv.value.toUpperCase()}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {sv.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div style={s.field}>
          <label style={s.label}>Add a Photo (optional)</label>
          <p style={s.hint}>A photo helps the safety team understand the problem faster</p>
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
                onClick={() => { setImageBase64(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
              >
                ✕ Remove photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={s.photoBtn}
            >
              📷 Take or Choose Photo
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
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  pageTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: "4px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "var(--text-muted)",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "16px",
  },
  label: {
    fontSize: "15px",
    fontWeight: 700,
    color: "var(--text)",
  },
  hint: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  input: {
    border: "1px solid var(--border)",
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
    border: "1px solid var(--border)",
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
    border: "1px solid var(--border)",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "15px",
    color: "var(--text)",
    backgroundColor: "#fff",
    marginTop: "6px",
    outline: "none",
    width: "100%",
  },
  charCount: {
    fontSize: "12px",
    color: "var(--text-light)",
    alignSelf: "flex-end",
    marginTop: "2px",
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
    backgroundColor: "var(--primary-light)",
    borderColor: "var(--primary)",
    color: "var(--primary)",
    fontWeight: 700,
  },
  severityGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "8px",
  },
  severityOption: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "10px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left",
  },
  photoBtn: {
    backgroundColor: "var(--bg)",
    border: "2px dashed var(--border)",
    borderRadius: "6px",
    padding: "18px",
    fontSize: "15px",
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
  },
  submitBtn: {
    backgroundColor: "var(--primary)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "15px",
    fontSize: "17px",
    fontWeight: 700,
    width: "100%",
    marginTop: "4px",
  },
  errorBox: {
    backgroundColor: "var(--danger-light)",
    border: "1px solid #fca5a5",
    color: "var(--danger)",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "4px",
  },
  successCard: {
    backgroundColor: "#fff",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "40px 24px",
    textAlign: "center",
  },
  successIcon: { fontSize: "48px", marginBottom: "16px" },
  successTitle: { fontSize: "22px", fontWeight: 700, color: "var(--text)", marginBottom: "12px" },
  successMsg: { fontSize: "15px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.7 },
  primaryBtn: {
    backgroundColor: "var(--primary)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  outlineBtn: {
    backgroundColor: "#fff",
    color: "var(--primary)",
    border: "1.5px solid var(--primary)",
    borderRadius: "6px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
