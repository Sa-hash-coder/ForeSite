export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 0",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid #e5e7eb",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
