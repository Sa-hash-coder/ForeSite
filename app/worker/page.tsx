"use client";

import React from "react";
import Link from "next/link";
import { MOCK_REPORTS } from "@/app/lib/mockData";
import { useLanguage } from "@/app/lib/LanguageContext";
import StatusBadge from "@/app/components/StatusBadge";
import DangerBadge from "@/app/components/DangerBadge";

export default function WorkerDashboard() {
  const { lang, t } = useLanguage();
  const reports = MOCK_REPORTS;

  const total = reports.length || 12;
  const underReview = reports.filter((r) =>
    ["pending_analysis", "under_review", "action_assigned"].includes(r.status)
  ).length || 4;
  const resolved = reports.filter((r) => ["resolved", "closed"].includes(r.status)).length || 6;
  const critical = reports.filter((r) => r.riskAssessment?.riskLevel === "CRITICAL" || r.severity === "critical").length || 2;

  const recent = reports.slice(0, 3);

  return (
    <div style={styles.container}>
      {/* ── Mobile Greeting Header ───────────────────────────────────── */}
      <div className="mobile-greeting-header animate-apple-fade-down" style={styles.mobileGreeting}>
        <h1 style={styles.mobileGreetingTitle}>{t.greeting}</h1>
        <p style={styles.mobileGreetingSub}>{t.greetingSub}</p>
      </div>

      {/* ── 4 Stat Cards Grid ────────────────────────────────────────── */}
      <div className="stats-grid-responsive" style={styles.statsGrid}>
        {/* 1. Total Reports */}
        <div className="apple-card animate-apple-fade-up delay-1" style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: "#eff6ff", color: "#2563eb" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div style={styles.statNumber}>{total}</div>
            <div style={styles.statLabel}>{t.statTotal}</div>
          </div>
        </div>

        {/* 2. Under Review */}
        <div className="apple-card animate-apple-fade-up delay-2" style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: "#fff7ed", color: "#ea580c" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div style={styles.statNumber}>{underReview}</div>
            <div style={styles.statLabel}>{lang === "hi" ? "जांच के अधीन" : "Under Review"}</div>
          </div>
        </div>

        {/* 3. Resolved */}
        <div className="apple-card animate-apple-fade-up delay-3" style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: "#f0fdf4", color: "#16a34a" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div style={styles.statNumber}>{resolved}</div>
            <div style={styles.statLabel}>{lang === "hi" ? "हल किया गया" : "Resolved"}</div>
          </div>
        </div>

        {/* 4. Critical */}
        <div className="apple-card animate-apple-fade-up delay-4" style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: "#fef2f2", color: "#dc2626" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div style={styles.statNumber}>{critical}</div>
            <div style={styles.statLabel}>{lang === "hi" ? "गंभीर ख़तरा" : "Critical"}</div>
          </div>
        </div>
      </div>

      {/* ── Middle Row: Banner CTA + Your Impact ─────────────────────── */}
      <div className="middle-row-responsive" style={styles.middleRow}>
        {/* Left: Blue Banner Card */}
        <div className="apple-card animate-apple-scale-in delay-2" style={styles.bannerCard}>
          <div style={styles.bannerContent}>
            <h2 style={styles.bannerTitle}>{lang === "hi" ? "कोई ख़तरा देखा? अभी रिपोर्ट करें।" : "See a hazard? Report it now."}</h2>
            <p style={styles.bannerSub}>
              {lang === "hi"
                ? "फ़ोटो अपलोड करें, AI को जांचने दें और अपने शहर को सुरक्षित बनाएं।"
                : "Upload a photo, let AI analyze it, and help make your city safer."}
            </p>
            <Link href="/worker/submit" className="apple-btn" style={styles.bannerBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{lang === "hi" ? "रिपोर्ट दर्ज करें" : "Submit Report"}</span>
            </Link>
          </div>

          {/* Right Upload Photo Dropzone Box */}
          <Link href="/worker/submit" className="banner-dropzone-box apple-btn" style={styles.uploadDropzone}>
            <div style={styles.dropzoneInner}>
              <div style={styles.uploadIconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <span style={styles.uploadDropzoneLabel}>
                {lang === "hi" ? "फ़ोटो अपलोड करें" : "Upload Photo"}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Your Impact Card */}
        <div className="apple-card animate-apple-fade-up delay-3" style={styles.impactCard}>
          <div style={styles.impactHeader}>
            <div style={styles.impactIconWrap}>🌱</div>
            <div>
              <h3 style={styles.impactTitle}>{lang === "hi" ? "आपका प्रभाव" : "Your Impact"}</h3>
              <p style={styles.impactSub}>
                {lang === "hi"
                  ? "आपकी रिपोर्ट स्वच्छ, सुरक्षित और बेहतर शहर बनाने में मदद करती हैं।"
                  : "Your reports help create cleaner, safer, and smarter cities."}
              </p>
            </div>
          </div>

          <div style={styles.impactList}>
            <div style={styles.impactItem}>
              <span style={styles.checkIcon}>✓</span>
              <span>{lang === "hi" ? "AI चालित विश्लेषण" : "AI-powered analysis"}</span>
            </div>
            <div style={styles.impactItem}>
              <span style={styles.checkIcon}>✓</span>
              <span>{lang === "hi" ? "त्वरित समाधान" : "Faster resolution"}</span>
            </div>
            <div style={styles.impactItem}>
              <span style={styles.checkIcon}>✓</span>
              <span>{lang === "hi" ? "सुरक्षित समुदाय" : "Safer communities"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Recent Reports + AI Insights ─────────────────── */}
      <div className="bottom-row-responsive" style={styles.bottomRow}>
        {/* Left: Recent Reports List */}
        <div className="apple-card animate-apple-fade-up delay-4" style={styles.recentSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>{lang === "hi" ? "हालिया रिपोर्ट्स" : "Recent Reports"}</h3>
            <Link href="/worker/reports" className="apple-btn" style={styles.viewAllLink}>
              {lang === "hi" ? "सभी देखें →" : "View All →"}
            </Link>
          </div>

          <div style={styles.reportsList}>
            {recent.map((r) => {
              const displayTitle = lang === "hi" && r.titleHi ? r.titleHi : r.title;
              const displayLocation = lang === "hi" && r.locationHi ? r.locationHi : r.location;

              return (
                <Link href={`/worker/reports/${r._id}`} key={r._id} className="apple-card" style={styles.reportCard}>
                  {/* Photo thumbnail */}
                  <div style={styles.reportThumbWrap}>
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.imageUrl} alt={displayTitle} style={styles.reportThumb} />
                    ) : (
                      <div style={styles.reportThumbFallback}>⚠️</div>
                    )}
                  </div>

                  {/* Report details */}
                  <div style={styles.reportInfo}>
                    <h4 style={styles.reportTitle}>{displayTitle}</h4>
                    <div style={styles.reportMeta}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{displayLocation}</span>
                      <span>·</span>
                      <span>
                        {new Date(r.createdAt).toLocaleDateString(
                          lang === "hi" ? "hi-IN" : "en-IN",
                          { day: "numeric", month: "short" }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Badges on right */}
                  <div style={styles.reportBadges}>
                    {r.riskAssessment && <DangerBadge level={r.riskAssessment.riskLevel} />}
                    <StatusBadge status={r.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: AI Insights Donut Chart Card */}
        <div className="apple-card animate-apple-fade-up delay-5" style={styles.insightsCard}>
          <h3 style={styles.sectionTitle}>{lang === "hi" ? "AI अंतर्दृष्टि" : "AI Insights"}</h3>

          {/* Donut Graphic */}
          <div style={styles.donutContainer}>
            <svg width="150" height="150" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
              {/* Road Damage 42% */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#2563eb" strokeWidth="4" strokeDasharray="42 58" strokeDashoffset="25" />
              {/* Streetlights 25% */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="83" />
              {/* Garbage 17% */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="17 83" strokeDashoffset="58" />
              {/* Water Leakage 8% */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#06b6d4" strokeWidth="4" strokeDasharray="8 92" strokeDashoffset="41" />
              {/* Others 8% */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8 92" strokeDashoffset="33" />
            </svg>
            <div style={styles.donutCenter}>
              <div style={styles.donutNum}>{total}</div>
              <div style={styles.donutLabel}>{lang === "hi" ? "रिपोर्ट्स" : "Reports"}</div>
            </div>
          </div>

          {/* Legend breakdown */}
          <div style={styles.legendGrid}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, backgroundColor: "#2563eb" }} />
              <span style={styles.legendName}>{lang === "hi" ? "सड़क क्षति" : "Road Damage"}</span>
              <span style={styles.legendPct}>42%</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, backgroundColor: "#f59e0b" }} />
              <span style={styles.legendName}>{lang === "hi" ? "स्ट्रीटलाइट्स" : "Streetlights"}</span>
              <span style={styles.legendPct}>25%</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, backgroundColor: "#10b981" }} />
              <span style={styles.legendName}>{lang === "hi" ? "कचरा" : "Garbage"}</span>
              <span style={styles.legendPct}>17%</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, backgroundColor: "#06b6d4" }} />
              <span style={styles.legendName}>{lang === "hi" ? "जल रिसाव" : "Water Leakage"}</span>
              <span style={styles.legendPct}>8%</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.dot, backgroundColor: "#94a3b8" }} />
              <span style={styles.legendName}>{lang === "hi" ? "अन्य" : "Others"}</span>
              <span style={styles.legendPct}>8%</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .mobile-greeting-header {
          display: none !important;
        }

        /* Responsive rules for Desktop vs Mobile / Android screen sizes */
        @media (max-width: 860px) {
          .mobile-greeting-header {
            display: block !important;
            margin-bottom: 12px;
          }
          .stats-grid-responsive {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .middle-row-responsive,
          .bottom-row-responsive {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .banner-dropzone-box {
            display: none !important;
          }
        }

        @media (min-width: 861px) {
          .stats-grid-responsive {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    maxWidth: 1200,
    margin: "0 auto",
  },
  mobileGreeting: {
    padding: "0 4px",
  },
  mobileGreetingTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "var(--text)",
    margin: "0 0 4px 0",
    letterSpacing: "-0.3px",
  },
  mobileGreetingSub: {
    fontSize: 13,
    color: "var(--text-muted)",
    margin: 0,
  },
  statsGrid: {
    display: "grid",
    gap: 16,
  },
  statCard: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "18px 16px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "var(--shadow-sm)",
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 800,
    color: "var(--text)",
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "var(--text-muted)",
    fontWeight: 600,
  },
  middleRow: {
    display: "grid",
    gap: 20,
  },
  bannerCard: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    borderRadius: 16,
    padding: 24,
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
    position: "relative",
    overflow: "hidden",
  },
  bannerContent: {
    flex: 1,
    zIndex: 2,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.2,
    margin: "0 0 8px 0",
  },
  bannerSub: {
    fontSize: 13,
    color: "#dbeafe",
    lineHeight: 1.4,
    margin: "0 0 16px 0",
  },
  bannerBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    color: "var(--primary)",
    fontWeight: 700,
    fontSize: 14,
    padding: "10px 18px",
    borderRadius: 10,
    textDecoration: "none",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },
  uploadDropzone: {
    width: 130,
    height: 110,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    border: "2px dashed #bfdbfe",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    flexShrink: 0,
    boxShadow: "var(--shadow-sm)",
    zIndex: 2,
  },
  dropzoneInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  uploadIconCircle: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadDropzoneLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--primary)",
  },
  impactCard: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  impactHeader: {
    display: "flex",
    gap: 14,
    marginBottom: 16,
  },
  impactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
    fontSize: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  impactTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: "var(--text)",
    margin: "0 0 4px 0",
  },
  impactSub: {
    fontSize: 13,
    color: "var(--text-muted)",
    margin: 0,
    lineHeight: 1.4,
  },
  impactList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  impactItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
  },
  checkIcon: {
    color: "#16a34a",
    fontWeight: 800,
  },
  bottomRow: {
    display: "grid",
    gap: 20,
  },
  recentSection: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "var(--shadow-sm)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: "var(--text)",
    margin: 0,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--primary)",
    textDecoration: "none",
  },
  reportsList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  reportCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: 12,
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface)",
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.15s ease",
  },
  reportThumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "var(--surface-subtle)",
    flexShrink: 0,
  },
  reportThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  reportThumbFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  reportInfo: {
    flex: 1,
    minWidth: 0,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--text)",
    margin: "0 0 4px 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  reportMeta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "var(--text-muted)",
  },
  reportBadges: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  insightsCard: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  donutContainer: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "16px 0",
  },
  donutCenter: {
    position: "absolute",
    textAlign: "center",
  },
  donutNum: {
    fontSize: 22,
    fontWeight: 800,
    color: "var(--text)",
    lineHeight: 1,
  },
  donutLabel: {
    fontSize: 11,
    color: "var(--text-muted)",
    fontWeight: 600,
    marginTop: 2,
  },
  legendGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 8,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendName: {
    color: "var(--text)",
    fontWeight: 600,
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  legendPct: {
    color: "var(--text-muted)",
    fontWeight: 700,
  },
};
