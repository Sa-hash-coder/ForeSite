'use client';

import { useEffect, useState, CSSProperties } from 'react';
import { getAlertsApi, acknowledgeAlertApi } from '@/app/lib/api';
import Link from 'next/link';
import { ACTIVE_ALERTS, ActiveAlert } from '@/app/lib/officerMockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function catLabel(c: string) {
  const m: Record<string, string> = {
    electrical: 'Electrical', fall: 'Fall Risk', chemical: 'Chemical',
    fire: 'Fire', machinery: 'Machinery', structural: 'Structural', ppe: 'PPE',
  };
  return m[c] || c;
}

function catStyle(c: string): CSSProperties {
  const m: Record<string, { bg: string; color: string }> = {
    electrical: { bg: '#fef3c7', color: '#92400e' }, fall: { bg: 'var(--primary-light)', color: 'var(--primary)' },
    chemical: { bg: '#ede9fe', color: '#5b21b6' }, fire: { bg: '#fee2e2', color: '#991b1b' },
    machinery: { bg: '#e0e7ff', color: '#3730a3' }, structural: { bg: '#f5f5f4', color: '#44403c' },
    ppe: { bg: '#dcfce7', color: '#14532d' },
  };
  const s = m[c] || { bg: '#f3f4f6', color: '#374151' };
  return { background: s.bg, color: s.color, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 500, display: 'inline-block' };
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type Tab = 'all' | 'critical' | 'high';
type SortOpt = 'newest' | 'highest_risk';

export default function AlertsPage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [sort, setSort] = useState<SortOpt>('highest_risk');
  const [alerts, setAlerts] = useState<ActiveAlert[]>([...ACTIVE_ALERTS]);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await getAlertsApi();
        if (res.data && res.data.length > 0) {
          const mapped: ActiveAlert[] = res.data.map((a: any) => ({
            _id: a._id,
            title: a.reportTitle || a.message,
            category: "machinery" as any,
            severity: (a.riskLevel?.toLowerCase() === "critical" ? "critical" : "high") as any,
            riskScore: a.riskScore || 85,
            zone: "Sector 4",
            location: "Plant Sector 4 North",
            timeAgo: "Recently",
            acknowledged: a.isAcknowledged,
            submittedBy: "Lead Safety Inspector",
          }));
          setAlerts(mapped);
        }
      } catch (err) {
        console.warn("Using offline alerts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const filtered = alerts
    .filter(a => tab === 'all' || a.severity === tab)
    .sort((a, b) => {
      if (sort === 'highest_risk') return b.riskScore - a.riskScore;
      return 0;
    });

  const unackCount = alerts.filter(a => !a.acknowledged).length;

  const toggle = async (id: string) => {
    setAlerts(prev => prev.map(a => a._id === id ? { ...a, acknowledged: !a.acknowledged } : a));
    try {
      await acknowledgeAlertApi(id, "Safety Officer");
    } catch (err) {
      console.warn("Failed to sync acknowledgment:", err);
    }
  };

  const card: CSSProperties = {
    background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 32, width: 240, marginBottom: 20, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 40, borderRadius: 12, marginBottom: 16 }} />
        {[0,1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16, marginBottom: 12 }} />)}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Active Alerts</h2>
          <span style={{ background: '#dc2626', color: '#fff', borderRadius: 999, fontSize: 12, fontWeight: 700, padding: '2px 10px' }}>
            {unackCount}
          </span>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as SortOpt)} style={{
          padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13,
          background: 'var(--surface)', color: 'var(--text)', outline: 'none', cursor: 'pointer',
        }}>
          <option value="highest_risk">Highest Risk First</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Info bar */}
      <div style={{
        background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14,
        padding: '12px 18px', marginBottom: 20, fontSize: 13, color: '#991b1b',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>⚡</span>
        Showing unresolved reports with HIGH or CRITICAL risk level requiring immediate attention.
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 20, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', width: 'fit-content',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {(['all', 'critical', 'high'] as Tab[]).map((t, i) => {
          const count = alerts.filter(a => t === 'all' || a.severity === t).length;
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '9px 18px', border: 'none', fontSize: 13, fontWeight: 600,
              background: tab === t ? 'var(--primary)' : 'var(--surface)',
              color: tab === t ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              {t === 'all' ? 'All' : t === 'critical' ? '🔴 Critical' : '🟠 High'}
              <span style={{
                background: tab === t ? 'rgba(255,255,255,0.25)' : 'var(--surface-subtle)',
                color: tab === t ? '#fff' : 'var(--text-muted)',
                borderRadius: 999, fontSize: 11, padding: '0 8px',
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <div style={{
          ...card, padding: '48px', textAlign: 'center', color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No alerts for this category</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>All risks in this severity level have been addressed.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(alert => (
            <div key={alert._id} style={{
              ...card,
              opacity: alert.acknowledged ? 0.65 : 1,
              transition: 'opacity 0.2s ease',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Risk score circle */}
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                    background: alert.severity === 'critical' ? '#fef2f2' : '#fff7ed',
                    border: `3px solid ${alert.severity === 'critical' ? '#dc2626' : '#ea580c'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      fontSize: 18, fontWeight: 800, lineHeight: 1,
                      color: alert.severity === 'critical' ? '#dc2626' : '#ea580c',
                    }}>
                      {alert.riskScore}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
                      <span style={{
                        background: alert.severity === 'critical' ? '#fef2f2' : '#fff7ed',
                        color: alert.severity === 'critical' ? '#dc2626' : '#ea580c',
                        borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                        textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                      }}>
                        {alert.severity}
                      </span>
                      <span style={catStyle(alert.category)}>{catLabel(alert.category)}</span>
                      {alert.acknowledged && (
                        <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{alert.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      📍 {alert.zone} · {alert.location}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      👤 {alert.submittedBy} · {alert.timeAgo}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <Link href={`/officer/reports/${ACTIVE_ALERTS.findIndex(a => a._id === alert._id) === 0 ? 'rpt-003' : alert._id.replace('alt-', 'rpt-0')}`}>
                      <button style={{
                        padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 10,
                        background: 'var(--surface)', color: 'var(--text)', fontSize: 12, fontWeight: 500,
                        transition: 'all 0.15s ease', whiteSpace: 'nowrap' as const,
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-subtle)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                      >
                        👁 View Report
                      </button>
                    </Link>
                    <button style={{
                      padding: '8px 16px', border: 'none', borderRadius: 10,
                      background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 600,
                      transition: 'all 0.15s ease', whiteSpace: 'nowrap' as const,
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-hover)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
                    >
                      🔧 Assign Task
                    </button>
                    <button
                      onClick={() => toggle(alert._id)}
                      style={{
                        padding: '8px 16px', border: `1px solid ${alert.acknowledged ? 'var(--border)' : '#16a34a'}`,
                        borderRadius: 10, background: 'var(--surface)',
                        color: alert.acknowledged ? 'var(--text-muted)' : '#16a34a',
                        fontSize: 12, fontWeight: 500, transition: 'all 0.15s ease', whiteSpace: 'nowrap' as const,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-subtle)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                    >
                      {alert.acknowledged ? '↩ Unacknowledge' : '✓ Acknowledge'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Critical strip */}
              {alert.severity === 'critical' && !alert.acknowledged && (
                <div style={{
                  background: '#fef2f2', borderTop: '1px solid #fca5a5',
                  padding: '7px 18px', fontSize: 12, fontWeight: 600, color: '#dc2626',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>⚡</span> Immediate action required — Critical risk level
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
