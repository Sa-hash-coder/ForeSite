'use client';

import { useEffect, useState, CSSProperties } from 'react';
import Link from 'next/link';
import {
  MOCK_REPORTS,
  WEEKLY_TREND,
  CATEGORY_STATS,
  ACTIVE_ALERTS,
  HEATMAP_ZONES,
} from '@/app/lib/officerMockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function severityColor(s: string) {
  if (s === 'critical') return 'var(--danger)';
  if (s === 'high') return 'var(--orange)';
  if (s === 'medium') return 'var(--warning)';
  return 'var(--success)';
}

function riskPillStyle(score: number): CSSProperties {
  const bg = score >= 80 ? '#fef2f2' : score >= 60 ? '#fff7ed' : score >= 40 ? '#fffbeb' : '#f0fdf4';
  const color = score >= 80 ? '#dc2626' : score >= 60 ? '#ea580c' : score >= 40 ? '#d97706' : '#16a34a';
  return {
    background: bg,
    color,
    borderRadius: 12,
    padding: '2px 9px',
    fontSize: 12,
    fontWeight: 700,
    display: 'inline-block',
  };
}

function statusBadgeStyle(status: string): CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    pending:           { bg: '#fef9c3', color: '#854d0e' },
    under_review:      { bg: '#e0f2fe', color: '#0369a1' },
    action_assigned:   { bg: '#fff7ed', color: '#9a3412' },
    analysis_complete: { bg: '#f3e8ff', color: '#6b21a8' },
    resolved:          { bg: '#dcfce7', color: '#14532d' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151' };
  return {
    background: s.bg,
    color: s.color,
    borderRadius: 12,
    padding: '2px 9px',
    fontSize: 11,
    fontWeight: 600,
    display: 'inline-block',
    whiteSpace: 'nowrap' as const,
  };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard({ h = 140 }: { h?: number }) {
  return <div className="skeleton" style={{ height: h, borderRadius: 14 }} />;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function OfficerOverview() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[0,1,2,3].map(i => <SkeletonCard key={i} h={120} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
          <SkeletonCard h={260} />
          <SkeletonCard h={260} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <SkeletonCard h={300} />
          <SkeletonCard h={300} />
        </div>
        <SkeletonCard h={120} />
      </div>
    );
  }

  const card: CSSProperties = {
    background: 'var(--surface)',
    borderRadius: 16,
    border: '1px solid var(--border)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    padding: '24px',
  };

  const recentReports = [...MOCK_REPORTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const topAlerts = ACTIVE_ALERTS.filter(a => !a.acknowledged).slice(0, 3);

  const maxTrend = Math.max(...WEEKLY_TREND.map(w => w.total));
  const chartWeeks = WEEKLY_TREND.slice(-8);

  const topZones = [...HEATMAP_ZONES]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  return (
    <div>
      {/* ── KPI Row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {/* Total Reports */}
        <div className="apple-card animate-apple-fade-up delay-1" style={{ ...card, borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Reports</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>47</div>
              <div style={{ fontSize: 13, color: '#16a34a', marginTop: 8, fontWeight: 600 }}>↑ 12% vs last month</div>
            </div>
            <div style={{ color: 'var(--primary)', opacity: 0.8 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
          </div>
        </div>

        {/* Critical / High */}
        <div className="apple-card animate-apple-fade-up delay-2" style={{ ...card, borderTop: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Critical / High</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--danger)', lineHeight: 1 }}>8</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Requires immediate action</div>
            </div>
            <div style={{ color: 'var(--danger)', opacity: 0.8 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="apple-card animate-apple-fade-up delay-3" style={{ ...card, borderTop: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Pending Review</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--warning)', lineHeight: 1 }}>13</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Awaiting assessment</div>
            </div>
            <div style={{ color: 'var(--warning)', opacity: 0.8 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="apple-card animate-apple-fade-up delay-4" style={{ ...card, borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Resolved</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--success)', lineHeight: 1 }}>26</div>
              <div style={{ fontSize: 13, color: '#16a34a', marginTop: 8, fontWeight: 600 }}>↑ 8% this month</div>
            </div>
            <div style={{ color: 'var(--success)', opacity: 0.8 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart Row ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Bar chart */}
        <div className="apple-card animate-apple-fade-up delay-2" style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Weekly Reports (Last 8 Weeks)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180 }}>
            {/* Y-axis */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 180, paddingBottom: 24 }}>
              {[15, 10, 5, 0].map(v => (
                <div key={v} style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1, textAlign: 'right', width: 20 }}>{v}</div>
              ))}
            </div>
            {/* Bars */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flex: 1, height: 180, position: 'relative' }}>
              {/* Grid lines */}
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  bottom: 24 + (i * (156 / 3)),
                  borderTop: '1px dashed var(--border)',
                }} />
              ))}
              {chartWeeks.map((w, idx) => {
                const totalH = Math.round((w.total / maxTrend) * 156);
                const critH = Math.round((w.critical / maxTrend) * 156);
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ width: '100%', position: 'relative', height: totalH }}>
                      {/* Total bar */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: totalH, background: 'var(--primary-light)', borderRadius: '6px 6px 0 0' }} />
                      {/* Critical overlay */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: critH, background: 'var(--danger)', borderRadius: critH === totalH ? '6px 6px 0 0' : '0' }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }}>
                      {w.week.split(' ')[0]}<br />{w.week.split(' ')[1]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, background: 'var(--primary-light)', borderRadius: 4 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Total</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, background: 'var(--danger)', borderRadius: 4 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Critical</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="apple-card animate-apple-fade-up delay-3" style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Category Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CATEGORY_STATS.map(cat => (
              <div key={cat.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{cat.category}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.count}</span>
                </div>
                <div style={{ height: 8, background: 'var(--surface-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${cat.percentage}%`, background: cat.color, borderRadius: 999, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Two-Column ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Recent Reports */}
        <div className="apple-card animate-apple-fade-up delay-3" style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Recent Reports</div>
            <Link href="/officer/reports" className="apple-btn" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentReports.map((r, i) => (
              <Link key={r._id} href={`/officer/reports/${r._id}`}
                className="apple-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 8px',
                  borderRadius: 10,
                  borderBottom: i < recentReports.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={riskPillStyle(r.riskScore)}>{r.riskScore}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.location}</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(r.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="apple-card animate-apple-fade-up delay-4" style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Active Alerts</div>
            <Link href="/officer/alerts" className="apple-btn" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topAlerts.map(alert => (
              <div key={alert._id} className="apple-card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 16px',
                borderRadius: 14,
                background: alert.severity === 'critical' ? 'var(--danger-light)' : 'var(--warning-light)',
                border: `1px solid ${alert.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'}`,
              }}>
                <div style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: alert.severity === 'critical' ? 'var(--danger)' : 'var(--warning)',
                  lineHeight: 1,
                  minWidth: 40,
                  textAlign: 'center',
                }}>
                  {alert.riskScore}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{alert.zone} · {alert.timeAgo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Zone Risk Summary ────────────────────────────────── */}
      <div className="apple-card animate-apple-fade-up delay-5" style={card}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Top Risk Zones</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {topZones.map(zone => {
            const isCrit = zone.riskScore >= 80;
            const isHigh = zone.riskScore >= 60;
            const bg = isCrit ? 'var(--danger-light)' : isHigh ? 'var(--warning-light)' : 'var(--surface-subtle)';
            const color = isCrit ? 'var(--danger)' : isHigh ? 'var(--warning)' : 'var(--text)';
            const border = isCrit ? 'var(--danger)' : isHigh ? 'var(--warning)' : 'var(--border)';
            return (
              <div key={zone.id} className="apple-card" style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: '16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color }}>{zone.riskScore}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{zone.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{zone.incidents} incidents</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
