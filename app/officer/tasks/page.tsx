'use client';

import { useEffect, useState, CSSProperties } from 'react';
import Link from 'next/link';
import { MAINTENANCE_TASKS, MAINTENANCE_WORKERS, MaintenanceTask, TaskStatus } from '@/app/lib/officerMockData';
import { exportToCSV, exportToExcel, ExportColumn } from '@/app/lib/exportUtils';

const TASK_EXPORT_COLUMNS: ExportColumn<MaintenanceTask>[] = [
  { header: 'Task ID', accessor: t => t._id },
  { header: 'Task Title', accessor: t => t.title },
  { header: 'Report Reference', accessor: t => t.reportId },
  { header: 'Category', accessor: t => t.category },
  { header: 'Priority', accessor: t => t.priority.toUpperCase() },
  { header: 'Status', accessor: t => t.status.replace(/_/g, ' ').toUpperCase() },
  { header: 'Assigned Worker', accessor: t => t.assignedTo?.name || 'Unassigned' },
  { header: 'Worker Role', accessor: t => t.assignedTo?.role || '' },
  { header: 'Worker Department', accessor: t => t.assignedTo?.dept || '' },
  { header: 'Due Date', accessor: t => t.dueDate },
  { header: 'Overdue', accessor: t => (new Date(t.dueDate) < new Date() && t.status !== 'done' ? 'YES' : 'NO') },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function taskStatusBadge(s: TaskStatus): CSSProperties {
  if (s === 'done') return { background: 'var(--success-light)', color: 'var(--success)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700, display: 'inline-block' };
  if (s === 'in_progress') return { background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700, display: 'inline-block' };
  return { background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700, display: 'inline-block' };
}

function taskStatusLabel(s: TaskStatus) {
  if (s === 'done') return '✅ Done';
  if (s === 'in_progress') return '🔄 In Progress';
  return '🕐 Pending';
}

function priorityBadge(p: string): CSSProperties {
  if (p === 'critical') return { background: '#fef2f2', color: '#dc2626', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, display: 'inline-block' };
  if (p === 'high') return { background: '#fff7ed', color: '#ea580c', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, display: 'inline-block' };
  return { background: '#fffbeb', color: '#d97706', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, display: 'inline-block' };
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'pending' | 'in_progress' | 'done';

export default function TasksPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [tasks, setTasks] = useState<MaintenanceTask[]>([...MAINTENANCE_TASKS]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportCSV = (scope: 'filtered' | 'all') => {
    const data = scope === 'filtered' ? filtered : tasks;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `ForeSite_Tasks_${scope === 'filtered' && filter !== 'all' ? filter + '_' : ''}${dateStr}`;
    exportToCSV(filename, TASK_EXPORT_COLUMNS, data);
    setShowExportMenu(false);
    setToast(`Downloaded ${data.length} tasks as CSV (${filename}.csv)`);
    setTimeout(() => setToast(''), 3500);
  };

  const handleExportExcel = (scope: 'filtered' | 'all') => {
    const data = scope === 'filtered' ? filtered : tasks;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `ForeSite_Tasks_${scope === 'filtered' && filter !== 'all' ? filter + '_' : ''}${dateStr}`;
    exportToExcel(filename, 'Maintenance Tasks', TASK_EXPORT_COLUMNS, data);
    setShowExportMenu(false);
    setToast(`Downloaded ${data.length} tasks as Excel (${filename}.xls)`);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = tasks.filter(t => filter === 'all' || t.status === filter);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const assign = (taskId: string, worker: string) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, assignedTo: worker, status: 'in_progress' } : t));
    setOpenDropdown(null);
    setToast(`Task assigned to ${worker}`);
    setTimeout(() => setToast(''), 2400);
  };

  const card: CSSProperties = {
    background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '16px 18px', marginBottom: 12,
  };

  const FILTERS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: '🕐 Pending Assignment' },
    { key: 'in_progress', label: '🔄 In Progress' },
    { key: 'done', label: '✅ Completed' },
  ];

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 80, borderRadius: 16, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 40, borderRadius: 12, marginBottom: 16 }} />
        {[0,1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 16, marginBottom: 12 }} />)}
      </div>
    );
  }

  return (
    <div>
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

      {/* Header */}
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px 0' }}>Maintenance Tasks</h2>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Tasks', value: stats.total, color: 'var(--primary)' },
          { label: 'Pending', value: stats.pending, color: 'var(--warning)' },
          { label: 'In Progress', value: stats.in_progress, color: 'var(--primary)' },
          { label: 'Done', value: stats.done, color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '16px 18px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls row: Filter tabs & Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 0, background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', width: 'fit-content',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          {FILTERS.map((f, i) => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '9px 16px', border: 'none', fontSize: 12, fontWeight: 600,
              background: filter === f.key ? 'var(--primary)' : 'var(--surface)',
              color: filter === f.key ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
              borderRight: i < FILTERS.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Export Button & Dropdown */}
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
            <span>Export Tasks</span>
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
                  {filter === 'all' ? 'All Tasks' : `${filter.toUpperCase()} Tasks`} ({filtered.length})
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
              </div>
            </>
          )}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          padding: '48px', textAlign: 'center', color: 'var(--text-muted)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No tasks in this category</div>
        </div>
      ) : (
        filtered.map(task => (
          <div key={task._id} style={card}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Status + priority */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, minWidth: 110 }}>
                <span style={taskStatusBadge(task.status)}>{taskStatusLabel(task.status)}</span>
                <span style={priorityBadge(task.priority)}>{task.priority.toUpperCase()}</span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{task.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Report:{' '}
                  <Link href={`/officer/reports/${task.reportId}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                    {task.reportTitle}
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {/* Assignee */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assigned to:</span>
                    {task.assignedTo ? (
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{task.assignedTo}</span>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange)' }}>Unassigned</span>
                    )}
                  </div>
                  {/* Due date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due:</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: isOverdue(task.dueDate) && task.status !== 'done' ? '#dc2626' : 'var(--text)',
                    }}>
                      {task.dueDate}
                      {isOverdue(task.dueDate) && task.status !== 'done' && (
                        <span style={{ marginLeft: 4, fontSize: 10, background: '#fef2f2', color: '#dc2626', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>
                          OVERDUE
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assign button + dropdown */}
              {task.status !== 'done' && (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === task._id ? null : task._id)}
                    style={{
                      padding: '8px 16px', border: '1px solid var(--primary)', borderRadius: 10,
                      background: 'var(--surface)', color: 'var(--primary)', fontSize: 12, fontWeight: 600,
                      transition: 'all 0.15s ease', whiteSpace: 'nowrap' as const,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  >
                    🔧 Assign
                  </button>
                  {openDropdown === task._id && (
                    <div style={{
                      position: 'absolute', right: 0, top: 40, zIndex: 100,
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 200, overflow: 'hidden',
                    }}>
                      <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                        Select Assignee
                      </div>
                      {MAINTENANCE_WORKERS.map(w => (
                        <button key={w} onClick={() => assign(task._id, w)} style={{
                          display: 'block', width: '100%', padding: '9px 14px',
                          border: 'none', background: 'var(--surface)', textAlign: 'left',
                          fontSize: 13, color: 'var(--text)', transition: 'background 0.12s ease',
                          cursor: 'pointer',
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
