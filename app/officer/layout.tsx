'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ACTIVE_ALERTS } from '@/app/lib/officerMockData';
import { LanguageProvider, useLanguage } from '@/app/lib/LanguageContext';
import LanguageSwitchButton from '@/app/components/LanguageSwitchButton';

// Replaced emojis with clean, strict SVG icons
const NAV_ITEMS = [
  {
    label: 'Overview', href: '/officer', exact: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
  },
  {
    label: 'Reports', href: '/officer/reports', exact: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
  },
  {
    label: 'Heatmap', href: '/officer/heatmap', exact: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
  },
  {
    label: 'Analytics', href: '/officer/analytics', exact: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
  },
  {
    label: 'Alerts', href: '/officer/alerts', exact: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
  },
  {
    label: 'Tasks', href: '/officer/tasks', exact: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/officer':            'Executive Safety Dashboard',
  '/officer/reports':    'Incident & Hazard Reports',
  '/officer/heatmap':    'Refinery Facility Heatmap',
  '/officer/analytics':  'Risk Analytics & Trends',
  '/officer/alerts':     'Active Hazard Alerts',
  '/officer/tasks':      'Maintenance Work Orders',
};

function OfficerLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('foresite_theme') as 'light' | 'dark' | null;
    const initialTheme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('foresite_theme', nextTheme);
  };

  // Close mobile menu and ensure theme attribute is synced when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    document.documentElement.setAttribute('data-theme', theme);
  }, [pathname, theme]);

  const pageTitle = (() => {
    if (pathname.startsWith('/officer/reports/')) return 'Report Detail';
    const key = Object.keys(PAGE_TITLES)
      .sort((a, b) => b.length - a.length)
      .find(k => pathname === k || pathname.startsWith(k + '/'));
    return key ? PAGE_TITLES[key] : 'Safety Command';
  })();

  const unacknowledgedCount = ACTIVE_ALERTS.filter(a => !a.acknowledged).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg)' }}>
      {/* ─── Desktop & Mobile Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{
          width: 260,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 60,
          transform: mobileMenuOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s',
        }}
        className="sidebar-responsive"
      >
        {/* Logo */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.4px', lineHeight: 1.1 }}>
                ForeSite
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                Refinery Ops
              </div>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-only-btn"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              color: 'var(--text-muted)',
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 12, marginBottom: 8 }}>
            Command Center
          </div>
          {NAV_ITEMS.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
            const isAlerts = item.href === '/officer/alerts';

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? 'var(--primary)' : 'var(--text)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ color: isActive ? 'var(--primary)' : 'var(--text-light)', display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </div>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isAlerts && unacknowledgedCount > 0 && (
                  <span
                    style={{
                      background: 'var(--danger)',
                      color: '#fff',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                      padding: '2px 8px',
                      minWidth: 20,
                      textAlign: 'center',
                    }}
                  >
                    {unacknowledgedCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Officer info */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--surface-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              KS
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Kavita Sharma
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lead Safety Inspector</div>
            </div>
          </div>
          <button
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--surface)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 55,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ─── Main Content Canvas ─────────────────────────────────────────── */}
      <div
        className="main-content-canvas"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          flex: 1,
        }}
      >
        {/* Top Header Bar */}
        <header
          style={{
            height: 64,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Hamburger Button for Mobile/Tablet */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="hamburger-btn"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: 'var(--text)',
              }}
            >
              ☰
            </button>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {pageTitle}
              </h1>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="facility-subtitle">
                Site: Refinery Unit Alpha · Live Grid Active
              </div>
            </div>
          </div>

          {/* Right Action Controls: Language Switcher, Theme Switcher & Alerts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Universal Hindi / English Language Switcher */}
            <LanguageSwitchButton variant="header" />

            {/* Theme Toggle Button: Moon for dark mode, Sun for light mode */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="apple-btn"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: theme === 'light' ? 'var(--text-muted)' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            {/* Notification Bell */}
            <Link href="/officer/alerts">
              <button
                className="apple-btn"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontSize: 17,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                🔔
                {unacknowledgedCount > 0 && (
                  <span
                    className="animate-apple-pulse"
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      background: 'var(--danger)',
                      color: '#fff',
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '1px 5px',
                      minWidth: 16,
                      textAlign: 'center',
                    }}
                  >
                    {unacknowledgedCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </header>

        {/* Page Container: Full viewport width edge-to-edge with smooth responsive padding & Apple entrance */}
        <main key={pathname} style={{ padding: '24px 28px', flex: 1, width: '100%', boxSizing: 'border-box' }} className="page-main-pad apple-page-enter">
          {children}
        </main>
      </div>

      <style jsx global>{`
        /* Desktop defaults */
        .sidebar-responsive {
          transform: translateX(0);
        }
        .main-content-canvas {
          margin-left: 260px;
          width: calc(100% - 260px);
          max-width: calc(100% - 260px);
        }
        .mobile-only-btn {
          display: none !important;
        }

        /* Mobile & Small Screen Breakpoint */
        @media (max-width: 860px) {
          .sidebar-responsive {
            transform: translateX(-100%);
          }
          .main-content-canvas {
            margin-left: 0 !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
          .mobile-only-btn {
            display: block !important;
          }
          .facility-subtitle {
            display: none !important;
          }
          .theme-toggle-label {
            display: none !important;
          }
          .page-main-pad {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <OfficerLayoutContent>{children}</OfficerLayoutContent>
    </LanguageProvider>
  );
}

