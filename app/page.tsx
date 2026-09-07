import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>ForeSite</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>Workplace Safety Reporting Platform</p>
        <Link
          href="/worker/login"
          style={{
            display: "inline-block",
            backgroundColor: "var(--primary)",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: "6px",
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "1rem",
          }}
        >
          Worker Login
        </Link>
      </div>
    </div>
  );
}
