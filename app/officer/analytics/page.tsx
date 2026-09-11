'use client';

import { useEffect, useState, CSSProperties } from 'react';
import { WEEKLY_TREND, CATEGORY_STATS, MOCK_REPORTS } from '@/app/lib/officerMockData';

// ─── Time-range data ──────────────────────────────────────────────────────────

const DATA_7 = [
  { label: 'Mon', total: 2, critical: 1 },
  { label: 'Tue', total: 1, critical: 0 },
  { label: 'Wed', total: 3, critical: 2 },
  { label: 'Thu', total: 4, critical: 2 },
  { label: 'Fri', total: 3, critical: 1 },
  { label: 'Sat', total: 2, critical: 1 },
  { label: 'Sun', total: 1, critical: 0 },
];

const DATA_30 = [
  { label: 'W1', total: 5, critical: 1 }, { label: 'W2', total: 7, critical: 2 },
  { label: 'W3', total: 6, critical: 1 }, { label: 'W4', total: 9, critical: 3 },
];

const DATA_3M = WEEKLY_TREND.slice(-6).map(w => ({ label: w.week, total: w.total, critical: w.critical }));

type Range = '7d' | '30d' | '3m';

const DEPT_DATA = [
  { dept: 'Manufacturing', reports: 5, avgRisk: 68, resolution: 60 },
  { dept: 'Logistics', reports: 3, avgRisk: 75, resolution: 33 },
  { dept: 'Construction', reports: 2, avgRisk: 88, resolution: 0 },
  { dept: 'Chemical Processing', reports: 1, avgRisk: 95, resolution: 0 },
  { dept: 'Facilities', reports: 3, avgRisk: 44, resolution: 67 },
  { dept: 'Engineering', reports: 1, avgRisk: 61, resolution: 100 },
];

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function LineChart({ data }: { data: { label: string; total: number; critical: number }[] }) {
  const W = 600, H = 220, PL = 40, PR = 20, PT = 20, PB = 40;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const maxVal = Math.max(...data.map(d => d.total), 1);

  const xPos = (i: number) => PL + (i / (data.length - 1)) * chartW;
  const yPos = (v: number) => PT + chartH - (v / maxVal) * chartH;

  const totalPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(d.total)}`).join(' ');
  const critPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(d.critical)}`).join(' ');

  const yLines = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxVal * f));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 220 }}>
      {/* Grid lines */}
      {yLines.map(v => (
        <g key={v}>
          <line x1={PL} y1={yPos(v)} x2={W - PR} y2={yPos(v)} stroke="var(--border)" strokeDasharray="4 3" />
          <text x={PL - 5} y={yPos(v) + 4} fontSize={10} textAnchor="end" fill="var(--text-muted)">{v}</text>
        </g>
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text key={i} x={xPos(i)} y={H - 8} fontSize={10} textAnchor="middle" fill="var(--text-muted)">{d.label}</text>
      ))}

      {/* Total line */}
      <path d={totalPath} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={xPos(i)} cy={yPos(d.total)} r={4} fill="var(--primary)" stroke="var(--surface)" strokeWidth={1.5} />
      ))}

      {/* Critical line */}
      <path d={critPath} fill="none" stroke="var(--danger)" strokeWidth={2} strokeLinejoin="round" strokeDasharray="6 3" />
      {data.map((d, i) => (
        <circle key={i} cx={xPos(i)} cy={yPos(d.critical)} r={3.5} fill="var(--danger)" stroke="var(--surface)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

function DonutChart() {
  const segments = [
    { label: 'Pending', count: 3, color: 'var(--warning)' },
    { label: 'Under Review', count: 3, color: 'var(--primary)' },
    { label: 'Action Assigned', count: 3, color: 'var(--orange)' },
    { label: 'Resolved', count: 6, color: 'var(--success)' },
  ];
  const total = segments.reduce((s, x) => s + x.count, 0);
  const R = 70, cx = 90, cy = 90;

  let angle = -Math.PI / 2;
  const arcs = segments.map(seg => {
    const frac = seg.count / total;
    const span = frac * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    angle += span;
    const x2 = cx + R * Math.cos(angle);
    const y2 = cy + R * Math.sin(angle);
    return { ...seg, x1, y1, x2, y2, span, large: span > Math.PI ? 1 : 0 };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg viewBox="0 0 180 180" style={{ width: 160, height: 160, flexShrink: 0 }}>
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={`M${cx},${cy} L${arc.x1},${arc.y1} A${R},${R} 0 ${arc.large},1 ${arc.x2},${arc.y2} Z`}
            fill={arc.color}
            stroke="var(--surface)"
            strokeWidth={2}
          />
        ))}
        {/* Donut hole */}
        <circle cx={cx} cy={cy} r={42} fill="var(--surface)" />
        <text x={cx} y={cy - 6} fontSize={14} fontWeight="bold" textAnchor="middle" fill="var(--text)">{total}</text>
        <text x={cx} y={cx + 10} fontSize={9} textAnchor="middle" fill="var(--text-muted)">reports</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.count} reports</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('30d');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const chartData = range === '7d' ? DATA_7 : range === '30d' ? DATA_30 : DATA_3M;

  const card: CSSProperties = {
    background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '20px 24px',
  };

  // Histogram buckets
  const buckets = [
    { label: '0–20', count: MOCK_REPORTS.filter(r => r.riskScore < 20).length, color: '#16a34a' },
    { label: '20–40', count: MOCK_REPORTS.filter(r => r.riskScore >= 20 && r.riskScore < 40).length, color: '#65a30d' },
    { label: '40–60', count: MOCK_REPORTS.filter(r => r.riskScore >= 40 && r.riskScore < 60).length, color: '#d97706' },
    { label: '60–80', count: MOCK_REPORTS.filter(r => r.riskScore >= 60 && r.riskScore < 80).length, color: '#ea580c' },
    { label: '80–100', count: MOCK_REPORTS.filter(r => r.riskScore >= 80).length, color: '#dc2626' },
  ];
  const maxBucket = Math.max(...buckets.map(b => b.count), 1);
  const maxCat = Math.max(...CATEGORY_STATS.map(c => c.count));

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 40, borderRadius: 12, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
        </div>
        <div className="skeleton" style={{ height: 260, borderRadius: 16, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Time range tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {(['7d', '30d', '3m'] as Range[]).map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: '9px 20px', border: 'none', fontSize: 13, fontWeight: 600,
            background: range === r ? 'var(--primary)' : 'var(--surface)',
            color: range === r ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.15s ease', borderRight: r !== '3m' ? '1px solid var(--border)' : 'none',
          }}>
            {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '3 Months'}
          </button>
        ))}
      </div>

      {/* KPI mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Avg Resolution Time', value: '2.4 days', icon: '⏱' },
          { label: 'Reports This Week', value: '12', icon: '📋' },
          { label: 'SIF Risk Score Avg', value: '67', icon: '⚠️' },
          { label: 'Repeat Zones', value: '4', icon: '🔄' },
        ].map(stat => (
          <div key={stat.label} style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Reports Over Time</div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, background: 'var(--primary)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Reports</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, background: 'var(--danger)', borderTop: '2px dashed var(--danger)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Critical</span>
            </div>
          </div>
        </div>
        <LineChart data={chartData} />
      </div>

      {/* Category + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Category bar chart */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Reports by Category</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160 }}>
            {CATEGORY_STATS.map(cat => {
              const barH = Math.round((cat.count / maxCat) * 140);
              return (
                <div key={cat.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: cat.color }}>{cat.count}</div>
                  <div style={{ width: '100%', height: barH, background: cat.color, borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease' }} />
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                    {cat.category.replace(' ', '\n')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut chart */}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Status Distribution</div>
          <DonutChart />
        </div>
      </div>

      {/* Risk Histogram */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Risk Score Distribution</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 140 }}>
          {buckets.map(b => {
            const h = Math.round((b.count / maxBucket) * 120);
            return (
              <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.count}</div>
                <div style={{ width: '100%', height: h, background: b.color, borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease' }} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{b.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department table */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Department Performance</div>
        <div style={{ overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Department', 'Reports', 'Avg Risk Score', 'Resolution Rate'].map(h => (
                  <th key={h} style={{
                    padding: '9px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                    textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface-subtle)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEPT_DATA.map((row, i) => (
                <tr key={row.dept} style={{ background: i % 2 === 1 ? 'var(--surface-subtle)' : 'var(--surface)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{row.dept}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text)' }}>{row.reports}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>
                    <span style={{
                      color: row.avgRisk >= 80 ? '#dc2626' : row.avgRisk >= 60 ? '#ea580c' : '#d97706',
                      fontWeight: 700,
                    }}>{row.avgRisk}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--surface-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${row.resolution}%`,
                          background: row.resolution >= 80 ? '#16a34a' : row.resolution >= 50 ? '#d97706' : '#dc2626',
                          borderRadius: 999, transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 32 }}>{row.resolution}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
