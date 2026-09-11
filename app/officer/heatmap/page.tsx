'use client';

import { useEffect, useState, useRef } from 'react';
import {
  REFINERY_FACILITY_UNITS,
  FacilityUnit,
  getUnitRiskColor,
} from '@/app/lib/refineryMapData';

// Helper to generate soft radial gradient heatmap spot
function getHeatmapRadialGradient(score: number): string {
  if (score >= 80) {
    return 'radial-gradient(circle, rgba(220, 38, 38, 0.75) 0%, rgba(220, 38, 38, 0.4) 40%, rgba(0, 0, 0, 0) 70%)';
  } else if (score >= 60) {
    return 'radial-gradient(circle, rgba(234, 88, 12, 0.65) 0%, rgba(234, 88, 12, 0.3) 45%, rgba(0, 0, 0, 0) 75%)';
  } else if (score >= 40) {
    return 'radial-gradient(circle, rgba(217, 119, 6, 0.5) 0%, rgba(217, 119, 6, 0.2) 50%, rgba(0, 0, 0, 0) 80%)';
  } else {
    return 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 60%, rgba(0, 0, 0, 0) 90%)';
  }
}

// Professional SVG Icons instead of emojis
function getSvgIcon(score: number) {
  if (score >= 80) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    );
  }
  if (score >= 40) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

export default function HeatmapPage() {
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<FacilityUnit | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<FacilityUnit | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [customMapUrl, setCustomMapUrl] = useState<string>('/refinery_map.jpg');
  const [customMarkers, setCustomMarkers] = useState<{id: number, x: number, y: number}[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomMapUrl(url);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.map-unit-interactive')) return;

    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCustomMarkers([...customMarkers, { id: Date.now(), x, y }]);
    }
  };

  const criticalHotspots = [...REFINERY_FACILITY_UNITS]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  if (loading) {
    return (
      <div style={{ width: '100%' }}>
        <div className="skeleton" style={{ height: 32, width: 340, marginBottom: 12, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 600, width: '100%', borderRadius: 4 }} />
      </div>
    );
  }

  return (
    <div className="heatmap-layout">
      {/* Global CSS for layout and styling */}
      <style jsx global>{`
        .heatmap-layout {
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          gap: 20px;
          min-height: calc(100vh - 100px);
          width: 100%;
        }
        .panel-card {
          background: var(--surface);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--border);
        }
        .panel-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 16px;
          letter-spacing: 0.05em;
        }
        .map-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 500px;
        }
        
        /* Mobile Operational Styles */
        @media (max-width: 1100px) {
          .heatmap-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }
          .sidebar-left { order: 2; }
          .sidebar-right { order: 3; }
          .map-wrapper { order: 1; min-height: 60vh; }
          
          /* Combine sidebars on mobile into a 2-col grid if possible */
          .mobile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
          }
        }
      `}</style>

      {/* ─── Left Sidebar ─────────────────────────────────────────── */}
      <div className="sidebar-left mobile-grid">
        <div className="panel-card" style={{ marginBottom: 20 }}>
          <h3 className="panel-title">Overall Risk Score</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 140, height: 70, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: 140, height: 140, 
                borderRadius: '50%', border: '15px solid var(--surface-subtle)', borderBottomColor: 'transparent', borderRightColor: 'transparent',
                transform: 'rotate(45deg)' 
              }}></div>
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: 140, height: 140, 
                borderRadius: '50%', border: '15px solid var(--danger)', borderBottomColor: 'transparent', borderRightColor: 'transparent',
                transform: 'rotate(100deg)',
                transition: 'transform 1s ease'
              }}></div>
            </div>
            <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--danger)', lineHeight: 1 }}>
              72<span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>High Risk</div>
          </div>
        </div>

        <div className="panel-card">
          <h3 className="panel-title">Risk Level Legend</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 12, height: 12, backgroundColor: '#dc2626', borderRadius: 2 }}></span> 
              <span style={{ fontSize: 14, color: 'var(--text)' }}>Extreme Risk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 12, height: 12, backgroundColor: '#ea580c', borderRadius: 2 }}></span> 
              <span style={{ fontSize: 14, color: 'var(--text)' }}>High Risk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 12, height: 12, backgroundColor: '#d97706', borderRadius: 2 }}></span> 
              <span style={{ fontSize: 14, color: 'var(--text)' }}>Moderate Risk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 12, height: 12, backgroundColor: '#16a34a', borderRadius: 2 }}></span> 
              <span style={{ fontSize: 14, color: 'var(--text)' }}>Low Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Center Map Canvas ─────────────────────────────────────────── */}
      <div className="map-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
           <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Click anywhere on the map to add a custom marker.
           </div>
           <div>
              <label style={{ 
                background: 'var(--primary)', color: '#fff', padding: '8px 16px', 
                borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-block'
              }}>
                Upload Custom Map
                <input type="file" accept="image/*" onChange={handleMapUpload} style={{ display: 'none' }} />
              </label>
           </div>
        </div>

        <div
          ref={mapContainerRef}
          onClick={handleMapClick}
          style={{
            position: 'relative',
            width: '100%',
            flex: 1,
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            background: '#090d16',
            cursor: 'crosshair',
          }}
        >
          <img
            src={customMapUrl}
            alt="Refinery Map"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              userSelect: 'none',
              filter: 'brightness(0.85) contrast(1.1)',
            }}
          />

          <div style={{
            position: 'absolute', inset: 0, 
            pointerEvents: 'none',
            opacity: 0.95,
          }}>
            {REFINERY_FACILITY_UNITS.map((unit) => {
              const centerX = unit.x + unit.w / 2;
              const centerY = unit.y + unit.h / 2;
              const plumeDiameter = Math.max(unit.w, unit.h) * 2.2;
              return (
                <div
                  key={`heat-${unit.id}`}
                  style={{
                    position: 'absolute',
                    left: `${centerX}%`,
                    top: `${centerY}%`,
                    width: `${plumeDiameter}%`,
                    paddingTop: `${plumeDiameter * 0.8}%`,
                    transform: 'translate(-50%, -50%)',
                    background: getHeatmapRadialGradient(unit.riskScore),
                    borderRadius: '50%',
                    filter: 'blur(8px)', 
                  }}
                />
              );
            })}
          </div>

          {customMarkers.map((marker) => (
             <div
               key={marker.id}
               style={{
                 position: 'absolute',
                 left: `${marker.x}%`,
                 top: `${marker.y}%`,
                 transform: 'translate(-50%, -50%)',
                 zIndex: 40,
                 cursor: 'pointer',
               }}
               onClick={(e) => {
                 e.stopPropagation();
                 setCustomMarkers(customMarkers.filter(m => m.id !== marker.id));
               }}
             >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--primary)" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
             </div>
          ))}

          {REFINERY_FACILITY_UNITS.map((unit) => {
            const isSelected = selectedUnit?.id === unit.id;
            const isHovered = hoveredUnit?.id === unit.id;
            const centerX = unit.x + unit.w / 2;
            const centerY = unit.y + unit.h / 2;
            
            const shortName = unit.name.split('(')[0].trim().toUpperCase();

            return (
              <div key={`ui-${unit.id}`} className="map-unit-interactive">
                <div
                  onClick={() => setSelectedUnit(isSelected ? null : unit)}
                  onMouseEnter={() => setHoveredUnit(unit)}
                  onMouseLeave={() => setHoveredUnit(null)}
                  style={{
                    position: 'absolute',
                    left: `${centerX}%`,
                    top: `${centerY}%`,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    zIndex: 30,
                  }}
                >
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: `1px solid ${getUnitRiskColor(unit.riskScore)}`,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {getSvgIcon(unit.riskScore)}
                    <span style={{ 
                      fontSize: 'clamp(10px, 1.2vw, 13px)', 
                      fontWeight: 700, 
                      color: '#ffffff',
                      lineHeight: 1
                    }}>
                      {shortName}
                    </span>
                  </div>
                </div>

                {(isHovered || isSelected) && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${centerX}%`,
                      top: `calc(${centerY}% - 30px)`,
                      transform: 'translate(-50%, -100%)',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: `1px solid ${getUnitRiskColor(unit.riskScore)}`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      zIndex: 60,
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      minWidth: 220,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{unit.name}</span>
                      <span style={{ color: getUnitRiskColor(unit.riskScore), fontWeight: 900, fontSize: 16 }}>{unit.riskScore}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{unit.dominantHazard}</div>
                    <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4 }}>{unit.incidents} active incidents logged</div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Floating Map Legend */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 20px',
            borderRadius: 14,
            backdropFilter: 'blur(4px)',
            zIndex: 20
          }}>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>RISK LEVEL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: '#ccc', fontWeight: 600 }}>LOW</span>
              <div style={{ 
                width: 200, height: 10, borderRadius: 999, 
                background: 'linear-gradient(to right, #16a34a, #d97706, #ea580c, #dc2626)' 
              }} />
              <span style={{ fontSize: 11, color: '#ccc', fontWeight: 600 }}>EXTREME</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Sidebar ─────────────────────────────────────────── */}
      <div className="sidebar-right mobile-grid">
        <div className="panel-card" style={{ marginBottom: 20 }}>
          <h3 className="panel-title">Risk Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 12, height: 12, backgroundColor: '#dc2626', borderRadius: 4 }}></span> <span style={{ fontSize: 14, color: 'var(--text)' }}>Extreme Risk</span></div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#dc2626' }}>4</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 12, height: 12, backgroundColor: '#ea580c', borderRadius: 4 }}></span> <span style={{ fontSize: 14, color: 'var(--text)' }}>High Risk</span></div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#ea580c' }}>5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 12, height: 12, backgroundColor: '#d97706', borderRadius: 4 }}></span> <span style={{ fontSize: 14, color: 'var(--text)' }}>Moderate Risk</span></div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#d97706' }}>6</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 12, height: 12, backgroundColor: '#16a34a', borderRadius: 4 }}></span> <span style={{ fontSize: 14, color: 'var(--text)' }}>Low Risk</span></div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>10</span>
            </div>
          </div>
        </div>

        <div className="panel-card" style={{ marginBottom: 20 }}>
          <h3 className="panel-title">Top Risk Drivers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {criticalHotspots.map((unit, idx) => (
              <div key={unit.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: '#dc2626', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>{unit.name.split('(')[0].trim()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <h3 className="panel-title">Recommended Actions</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: 10, lineHeight: 1.5 }}>
            <li>Isolate FCC slide valve and schedule emergency inspection.</li>
            <li>Deploy thermal monitoring drones to ADU fractionation column.</li>
            <li>Review LOTO procedures in active high-risk zones.</li>
            <li>Enhance fire-suppression checks in Crude Storage Farm.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
