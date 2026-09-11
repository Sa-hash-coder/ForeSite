"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginApi } from "@/app/lib/api";
import { saveAuth } from "@/app/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginApi(email.trim(), password);
      saveAuth(res.data.token, res.data.user);
      router.push("/worker");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Header strip */}
      <div style={styles.header}>
        <span style={styles.headerLogo}>⚠</span>
        <span style={styles.headerTitle}>ForeSite</span>
      </div>

      <div style={styles.card}>
        <h1 style={styles.heading}>Worker Login</h1>
        <p style={styles.subheading}>Enter your work email and password to continue</p>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@company.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.helpText}>
          Forgot your password? Contact your Safety Officer or HR.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    width: "100%",
    backgroundColor: "#0A192F",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerLogo: {
    fontSize: "20px",
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "0.05em",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #D9DEE7",
    borderRadius: "8px",
    padding: "36px 32px",
    width: "100%",
    maxWidth: "420px",
    marginTop: "48px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  heading: {
    fontSize: "22px",
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: "6px",
  },
  subheading: {
    fontSize: "14px",
    color: "var(--text-muted)",
    marginBottom: "24px",
  },
  errorBox: {
    backgroundColor: "var(--danger-light)",
    border: "1px solid #fca5a5",
    color: "var(--danger)",
    padding: "10px 14px",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "16px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text)",
  },
  input: {
    border: "1px solid #D9DEE7",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "15px",
    color: "var(--text)",
    backgroundColor: "#fff",
    outline: "none",
    width: "100%",
  },
  button: {
    backgroundColor: "#0A192F",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "16px",
    fontWeight: 600,
    marginTop: "4px",
    width: "100%",
  },
  helpText: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginTop: "20px",
    textAlign: "center",
  },
};
