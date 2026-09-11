'use client';

import { useEffect, useState, CSSProperties } from 'react';
import Link from 'next/link';
import { MOCK_REPORTS, OfficerReport, ReportStatus, Severity } from '@/app/lib/officerMockData';
import { exportToCSV, exportToExcel, ExportColumn } from '@/app/lib/exportUtils';

const REPORT_EXPORT_COLUMNS: ExportColumn<OfficerReport>[] = [
  { header: 'Report ID', accessor: r => r._id },
  { header: 'Title', accessor: r => r.title },
  { header: 'Category', accessor: r => r.category },
  { header: 'Severity', accessor: r => r.severity.toUpperCase() },
  { header: 'Status', accessor: r => r.status.replace(/_/g, ' ').toUpperCase() },
  { header: 'Risk Score', accessor: r => r.riskScore },
  { header: 'Facility Zone', accessor: r => r.zone },
  { header: 'Location Details', accessor: r => r.location },
  { header: 'Submitted By', accessor: r => r.submittedBy },
  { header: 'Department', accessor: r => r.department },
  { header: 'Date Submitted', accessor: r => new Date(r.createdAt).toLocaleString() },
  { header: 'Description', accessor: r => r.description },
  { header: 'Immediate Actions', accessor: r => r.immediateActions?.join('; ') || 'None' },
  { header: 'Recommendations', accessor: r => r.recommendations?.join('; ') || 'None' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskPillStyle(score: number): CSSProperties {
  const bg = score >= 80 ? '#fef2f2' : score >= 60 ? '#fff7ed' : score >= 40 ? '#fffbeb' : '#f0fdf4';
  const color = score >= 80 ? '#dc2626' : score >= 60 ? '#ea580c' : score >= 40 ? '#d97706' : '#16a34a';
  const border = score >= 80 ? '#fca5a5' : score >= 60 ? '#fdba74' : score >= 40 ? '#fcd34d' : '#86efac';
  return { background: bg, color, border: `1px solid ${border}`, borderRadius: 999, padding: '3px 10px', fontSize: 13, fontWeight: 700, display: 'inline-block' };
}

function statusLabel(s: ReportStatus) {
  const map: Record<ReportStatus, string> = {
    pending: 'Pending', under_review: 'Under Review', action_assigned: 'Action Assigned',
    analysis_complete: 'Analysis Complete', resolved: 'Resolved',
  };
  return map[s] || s;
}

function statusBadgeStyle(status: ReportStatus): CSSProperties {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    pending: { bg: '#fef9c3', color: '#854d0e', border: '#fde047' }, 
    under_review: { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
    action_assigned: { bg: '#fff7ed', color: '#9a3412', border: '#fdba74' }, 
    analysis_complete: { bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
    resolved: { bg: '#dcfce7', color: '#14532d', border: '#86efac' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
  return { background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700, display: 'inline-block', whiteSpace: 'nowrap' as const };
}

function categoryLabel(c: string) {
  const map: Record<string, string> = {
    electrical: 'Electrical', fall: 'Fall Risk', chemical: 'Chemical',
    fire: 'Fire', machinery: 'Machinery', structural: 'Structural', ppe: 'PPE',
  };
  return map[c] || c;
}

function catColor(c: string): CSSProperties {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    electrical: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' }, 
    fall: { bg: 'var(--primary-light)', color: 'var(--primary)', border: 'var(--border)' },
    chemical: { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' }, 
    fire: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
    machinery: { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' }, 
    structural: { bg: '#f5f5f4', color: '#44403c', border: '#d6d3d1' },
    ppe: { bg: '#dcfce7', color: '#14532d', border: '#86efac' },
  };
  const s = map[c] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
  return { background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600, display: 'inline-block' };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const PAGE_SIZE = 8;

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[60, 200, 130, 90, 70, 110, 110, 80, 60].map((w, i) => (
        <td key={i} style={{ padding: '12px 14px' }}>
          <div className="skeleton" style={{ height: 14, width: w, borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_risk' | 'lowest_risk'>('newest');
  const [page, setPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = MOCK_REPORTS.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.zone.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSeverity = severityFilter === 'all' || r.severity === severityFilter;
    return matchSearch && matchStatus && matchSeverity;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'highest_risk') return b.riskScore - a.riskScore;
    return a.riskScore - b.riskScore;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = (scope: 'filtered' | 'all') => {
    const data = scope === 'filtered' ? filtered : MOCK_REPORTS;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `ForeSite_Reports_${scope === 'filtered' ? 'Filtered_' : 'All_'}${dateStr}`;
    exportToCSV(filename, REPORT_EXPORT_COLUMNS, data);
    setShowExportMenu(false);
    setToastMsg(`Downloaded ${data.length} reports as CSV (${filename}.csv)`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExportExcel = (scope: 'filtered' | 'all') => {
    const data = scope === 'filtered' ? filtered : MOCK_REPORTS;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `ForeSite_Reports_${scope === 'filtered' ? 'Filtered_' : 'All_'}${dateStr}`;
    exportToExcel(filename, 'Safety Reports', REPORT_EXPORT_COLUMNS, data);
    setShowExportMenu(false);
    setToastMsg(`Downloaded ${data.length} reports as Excel (${filename}.xls)`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const inputStyle: CSSProperties = {
    padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14,
    background: 'var(--surface)', color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s ease',
  };

  const selectStyle: CSSProperties = { ...inputStyle, cursor: 'pointer' };

  const thStyle: CSSProperties = {
    padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase' as const, letterSpacing: '0.05em', textAlign: 'left',
    background: 'transparent', whiteSpace: 'nowrap',
  };

  const tdStyle: CSSProperties = { padding: '14px 16px', fontSize: 14, color: 'var(--text)', verticalAlign: 'middle' };

  return (
    <div>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 12,
          padding: '12px 20px', boxShadow: '0 8px 24px rgba(79, 70, 229, 0.18)',
          fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>📥</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text)' }}>All Reports</h2>
          <span style={{
            background: 'var(--primary)', color: '#fff', borderRadius: 999,
            fontSize: 13, fontWeight: 700, padding: '2px 10px',
          }}>
            {MOCK_REPORTS.length}
          </span>
        </div>

        {/* Export Dropdown Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--text)',
              transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-subtle)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {showExportMenu && (
            <>
              <div
                onClick={() => setShowExportMenu(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 90 }}
              />
              <div
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 100,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '6px', minWidth: 230,
                  boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: 2,
                }}
              >
                <div style={{ padding: '6px 10px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Filtered Reports ({filtered.length})
                </div>
                <button
                  onClick={() => handleExportCSV('filtered')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
                    border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 13,
                    fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 16 }}>📊</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Download CSV</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Universal tabular (.csv)</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExportExcel('filtered')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
                    border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 13,
                    fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 16 }}>📗</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Download Excel</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Styled workbook (.xls)</div>
                  </div>
                </button>

                {filtered.length !== MOCK_REPORTS.length && (
                  <>
                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                    <div style={{ padding: '6px 10px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      All Reports ({MOCK_REPORTS.length})
                    </div>
                    <button
                      onClick={() => handleExportCSV('all')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
                        border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 13,
                        fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: 16 }}>📊</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>All Reports (CSV)</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Complete archive (.csv)</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExportExcel('all')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
                        border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 13,
                        fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: 16 }}>📗</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>All Reports (Excel)</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Complete archive (.xls)</div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
        padding: '16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input
            type="text"
            placeholder="Search by title, location, zone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, paddingLeft: 36, width: '100%', height: 38 }}
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{...selectStyle, height: 38}}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="action_assigned">Action Assigned</option>
          <option value="analysis_complete">Analysis Complete</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1); }} style={{...selectStyle, height: 38}}>
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{...selectStyle, height: 38}}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest_risk">Highest Risk</option>
          <option value="lowest_risk">Lowest Risk</option>
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'var(--surface-subtle)', borderBottom: '2px solid var(--border)' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Report Title</th>
                <th style={thStyle}>Location / Zone</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Risk</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Submitted By</th>
                <th style={thStyle}>Date</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [0,1,2,3,4].map(i => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'inline-block', marginBottom: 12, padding: 16, background: 'var(--surface-subtle)', borderRadius: '50%' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>No reports match your filters.</div>
                    <div style={{ marginTop: 6, fontSize: 13 }}>Try adjusting the search or filter options above.</div>
                  </td>
                </tr>
              ) : (
                paginated.map((r, idx) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-subtle)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  >
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 220 }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                        {r.title}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>{r.location}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.zone}</div>
                    </td>
                    <td style={tdStyle}><span style={catColor(r.category)}>{categoryLabel(r.category)}</span></td>
                    <td style={tdStyle}><span style={riskPillStyle(r.riskScore)}>{r.riskScore}</span></td>
                    <td style={tdStyle}><span style={statusBadgeStyle(r.status)}>{statusLabel(r.status)}</span></td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 12 }}>{r.submittedBy}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(r.createdAt)}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <Link href={`/officer/reports/${r._id}`}>
                        <button style={{
                          width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)',
                          background: '#fff', fontSize: 15, transition: 'all 0.15s ease',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                          title="View Report"
                        >
                          👁
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} reports
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 10,
                  background: page === 1 ? 'var(--surface-subtle)' : 'var(--surface)', color: page === 1 ? 'var(--text-muted)' : 'var(--text)',
                  fontSize: 13, transition: 'all 0.15s ease',
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 10,
                  background: p === page ? 'var(--primary)' : 'var(--surface)', color: p === page ? '#fff' : 'var(--text)',
                  fontSize: 13, fontWeight: p === page ? 600 : 400, transition: 'all 0.15s ease',
                }}>
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 10,
                  background: page === totalPages ? 'var(--surface-subtle)' : 'var(--surface)', color: page === totalPages ? 'var(--text-muted)' : 'var(--text)',
                  fontSize: 13, transition: 'all 0.15s ease',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
