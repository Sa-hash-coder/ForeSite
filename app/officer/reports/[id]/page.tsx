'use client';

import { use, useEffect, useState, CSSProperties } from 'react';
import Link from 'next/link';
import { MOCK_REPORTS, MAINTENANCE_TASKS } from '@/app/lib/officerMockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskColor(score: number) {
  if (score >= 80) return '#dc2626';
  if (score >= 60) return '#ea580c';
  if (score >= 40) return '#d97706';
  return '#16a34a';
}
function riskBg(score: number) {
  if (score >= 80) return '#fef2f2';
  if (score >= 60) return '#fff7ed';
  if (score >= 40) return '#fffbeb';
  return '#f0fdf4';
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    pending: 'Pending', under_review: 'Under Review', action_assigned: 'Action Assigned',
    analysis_complete: 'Analysis Complete', resolved: 'Resolved',
  };
  return map[s] || s;
}

function statusBadgeStyle(status: string): CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#fef9c3', color: '#854d0e' }, under_review: { bg: '#e0f2fe', color: '#0369a1' },
    action_assigned: { bg: '#fff7ed', color: '#9a3412' }, analysis_complete: { bg: '#f3e8ff', color: '#6b21a8' },
    resolved: { bg: '#dcfce7', color: '#14532d' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151' };
  return { background: s.bg, color: s.color, borderRadius: 12, padding: '3px 11px', fontSize: 12, fontWeight: 600, display: 'inline-block' };
}

function taskStatusStyle(s: string): CSSProperties {
  if (s === 'done') return { background: 'var(--success-light)', color: 'var(--success)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, display: 'inline-block' };
  if (s === 'in_progress') return { background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, display: 'inline-block' };
  return { background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, display: 'inline-block' };
}

function catLabel(c: string) {
  const map: Record<string, string> = {
    electrical: 'Electrical', fall: 'Fall Risk', chemical: 'Chemical',
    fire: 'Fire', machinery: 'Machinery', structural: 'Structural', ppe: 'PPE',
  };
  return map[c] || c;
}

function catBg(c: string) {
  const map: Record<string, { bg: string; color: string }> = {
    electrical: { bg: '#fef3c7', color: '#92400e' }, fall: { bg: 'var(--primary-light)', color: 'var(--primary)' },
    chemical: { bg: '#ede9fe', color: '#5b21b6' }, fire: { bg: '#fee2e2', color: '#991b1b' },
    machinery: { bg: '#e0e7ff', color: '#3730a3' }, structural: { bg: '#f5f5f4', color: '#44403c' },
    ppe: { bg: '#dcfce7', color: '#14532d' },
  };
  return map[c] || { bg: '#f3f4f6', color: '#374151' };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const report = MOCK_REPORTS.find(r => r._id === id) || { ...MOCK_REPORTS[0], _id: id };
  const tasks = MAINTENANCE_TASKS.filter(t => t.reportId === report._id);

  const card: CSSProperties = {
    background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '20px 24px', marginBottom: 16,
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 20, width: 200, marginBottom: 20, borderRadius: 10 }} />
        <div className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
      </div>
    );
  }

  const cat = catBg(report.category);

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '12px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>✅</span> {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link href="/officer/reports" style={{ color: 'var(--primary)', fontWeight: 500 }}>Reports</Link>
        <span>›</span>
        <span style={{ color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
          {report.title}
        </span>
      </div>

      {/* Header card */}
      <div style={card}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <span style={{ ...statusBadgeStyle(report.status) }}>{statusLabel(report.status)}</span>
              <span style={{ background: cat.bg, color: cat.color, borderRadius: 999, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                {catLabel(report.category)}
              </span>
              <span style={{
                background: report.severity === 'critical' ? '#fef2f2' : report.severity === 'high' ? '#fff7ed' : '#fffbeb',
                color: report.severity === 'critical' ? '#dc2626' : report.severity === 'high' ? '#ea580c' : '#d97706',
                borderRadius: 10, padding: '3px 11px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' as const,
              }}>
                {report.severity}
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: '0 0 10px 0', lineHeight: 1.3 }}>
              {report.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                📍 {report.location} · {report.zone}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                👤 {report.submittedBy} · {report.department}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                🕐 {timeAgo(report.createdAt)}
              </div>
            </div>
          </div>
          {/* Risk Score Big Badge */}
          <div style={{
            width: 90, height: 90, borderRadius: '50%', border: `4px solid ${riskColor(report.riskScore)}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: riskBg(report.riskScore), flexShrink: 0,
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: riskColor(report.riskScore), lineHeight: 1 }}>
              {report.riskScore}
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: riskColor(report.riskScore), textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Risk Score
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Card */}
      <div style={{ ...card, borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>AI Analysis</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Automated hazard assessment</div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>
            Observation
          </div>
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>
            {report.description}
          </p>
        </div>

        {/* Danger level bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Danger Level
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: riskColor(report.riskScore) }}>
              {report.riskScore}/100
            </span>
          </div>
          <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${report.riskScore}%`,
              background: riskColor(report.riskScore), borderRadius: 6,
              transition: 'width 0.8s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#16a34a' }}>Very Low</span>
            <span style={{ fontSize: 10, color: '#dc2626' }}>Critical</span>
          </div>
        </div>

        {/* Immediate actions */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>
            Immediate Actions Required
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {report.immediateActions.map((action, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: '#fef2f2',
                  border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#dc2626', flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence */}
      {report.hasImage && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>📷 Photographic Evidence</div>
          <div style={{
            background: '#f9fafb', border: '2px dashed var(--border)', borderRadius: 8,
            height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: 13,
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
            <div style={{ fontWeight: 500 }}>Evidence photo attached</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Uploaded with report submission</div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
          📋 Safety Recommendations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {report.recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--primary)', flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, paddingTop: 3 }}>{rec}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Tasks */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
          🔧 Maintenance Tasks
        </div>
        {tasks.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
            No maintenance tasks assigned yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.map(task => (
              <div key={task._id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderRadius: 8, border: '1px solid var(--border)', background: '#fafafa',
              }}>
                <span style={taskStatusStyle(task.status)}>
                  {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Assigned to: {task.assignedTo || 'Unassigned'} · Due: {task.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div style={{
        ...card,
        display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'center',
        background: 'var(--surface)',
      }}>
        <button
          onClick={() => showToast('Task assigned successfully.')}
          style={{
            padding: '10px 22px', background: 'var(--primary)', color: '#fff', border: 'none',
            borderRadius: 10, fontSize: 14, fontWeight: 600, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-hover)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
        >
          🔧 Assign Task
        </button>
        <button
          onClick={() => showToast('Report marked as resolved.')}
          style={{
            padding: '10px 22px', background: 'var(--surface)', color: 'var(--success)',
            border: '1.5px solid var(--success)', borderRadius: 10, fontSize: 14, fontWeight: 600, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-subtle)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
        >
          ✅ Mark Resolved
        </button>
        <button
          onClick={() => showToast('Report escalated to senior management.')}
          style={{
            padding: '10px 22px', background: 'var(--surface)', color: 'var(--danger)',
            border: '1.5px solid var(--danger)', borderRadius: 10, fontSize: 14, fontWeight: 600, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-subtle)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
        >
          ⬆ Escalate
        </button>
        <div style={{ marginLeft: 'auto' }}>
          <Link href="/officer/reports" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            ← Back to Reports
          </Link>
        </div>
      </div>
    </div>
  );
}
