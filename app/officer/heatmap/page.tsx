"use client";

import { useEffect, useState, useRef } from "react";
import {
  REFINERY_FACILITY_UNITS,
  FacilityUnit,
  getUnitRiskColor,
} from "@/app/lib/refineryMapData";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Eye,
  EyeOff,
  Filter,
  Activity,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Search,
  X,
  MapPin,
  Upload,
  ChevronRight,
  Wrench,
  ShieldAlert,
  Sliders
} from "lucide-react";

// Soft radial gradient for thermal plumes
function getHeatmapRadialGradient(score: number): string {
  if (score >= 80) {
    return "radial-gradient(circle, rgba(220, 38, 38, 0.72) 0%, rgba(220, 38, 38, 0.35) 45%, rgba(0, 0, 0, 0) 75%)";
  } else if (score >= 60) {
    return "radial-gradient(circle, rgba(234, 88, 12, 0.6) 0%, rgba(234, 88, 12, 0.28) 45%, rgba(0, 0, 0, 0) 75%)";
  } else if (score >= 40) {
    return "radial-gradient(circle, rgba(217, 119, 6, 0.45) 0%, rgba(217, 119, 6, 0.18) 50%, rgba(0, 0, 0, 0) 80%)";
  } else {
    return "radial-gradient(circle, rgba(22, 163, 74, 0.35) 0%, rgba(22, 163, 74, 0.1) 55%, rgba(0, 0, 0, 0) 85%)";
  }
}

// Simulated live telemetry generator based on unit risk
function getUnitTelemetry(unit: FacilityUnit) {
  const isHigh = unit.riskScore >= 80;
  const isMed = unit.riskScore >= 60;
  return {
    temp: isHigh ? 385 + (unit.riskScore % 30) : isMed ? 240 + (unit.riskScore % 20) : 110 + (unit.riskScore % 15),
    pressure: isHigh ? (16.4 + (unit.riskScore % 8) * 0.3).toFixed(1) : (7.2 + (unit.riskScore % 5) * 0.2).toFixed(1),
    vibration: isHigh ? (4.8 + (unit.riskScore % 4) * 0.2).toFixed(1) : (1.6 + (unit.riskScore % 3) * 0.1).toFixed(1),
    gasPpm: isHigh ? 42 + (unit.riskScore % 18) : isMed ? 14 + (unit.riskScore % 8) : 2,
  };
}

export default function HeatmapPage() {
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<FacilityUnit | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<FacilityUnit | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Toggles
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showPins, setShowPins] = useState<boolean>(true);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [pinDropMode, setPinDropMode] = useState<boolean>(false);
  const [sidePanelOpen, setSidePanelOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [customMapUrl, setCustomMapUrl] = useState<string>("/refinery_map.jpg");
  const [customMarkers, setCustomMarkers] = useState<{ id: number; x: number; y: number; note: string }[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  // Filter units based on selection
  const filteredUnits = REFINERY_FACILITY_UNITS.filter((u) => {
    if (activeFilter === "extreme") return u.riskScore >= 80;
    if (activeFilter === "high") return u.riskScore >= 60 && u.riskScore < 80;
    if (activeFilter === "moderate") return u.riskScore >= 40 && u.riskScore < 60;
    if (activeFilter === "low") return u.riskScore < 40;
    return true;
  }).filter((u) => {
    if (!searchQuery) return true;
    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.min(Math.max(prev + delta, 0.9), 2.2);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pinDropMode) return;
    if ((e.target as HTMLElement).closest(".map-unit-interactive")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomMapUrl(url);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinDropMode) return;
    if ((e.target as HTMLElement).closest(".map-unit-interactive")) return;

    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCustomMarkers([...customMarkers, { id: Date.now(), x, y, note: "Operator Observation Pin" }]);
    }
  };

  const focusUnit = (unit: FacilityUnit) => {
    setSelectedUnit(unit);
    setSidePanelOpen(true);
  };

  const criticalHotspots = [...REFINERY_FACILITY_UNITS]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ height: 32, width: 280, backgroundColor: "#E2E8F0", borderRadius: 6, marginBottom: 16 }} />
        <div style={{ height: 600, width: "100%", backgroundColor: "#E2E8F0", borderRadius: 12 }} />
      </div>
    );
  }

  const selectedTelemetry = selectedUnit ? getUnitTelemetry(selectedUnit) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>

      {/* ─── 1. TOP HEADER & FILTER BAR ───────────────────────────────── */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 14, border: "1px solid #D9DEE7", padding: "18px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        
        {/* Title + Status */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.4px" }}>
              Refinery Facility Heatmap
            </h1>
            <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#FEF2F2", color: "#DC2626", padding: "3px 8px", borderRadius: 6, border: "1px solid #FECACA" }}>
              LIVE SENSOR GRID
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0 0" }}>
            Site: Refinery Unit Alpha · Real-time spatial SIF precursor density &amp; asset telemetry
          </p>
        </div>

        {/* Search / Jump to Unit */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 10, top: 9, width: 15, height: 15, color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Jump to unit (e.g. FCC, ADU)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "8px 12px 8px 32px", fontSize: 13, borderRadius: 8, border: "1px solid #D9DEE7", outline: "none", width: 220, backgroundColor: "#F8FAFC" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 8, top: 8, background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", backgroundColor: "#FFFFFF", border: "1px solid #D9DEE7", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#0F172A", cursor: "pointer" }}>
            <Upload style={{ width: 14, height: 14 }} />
            <span>Upload Map</span>
            <input type="file" accept="image/*" onChange={handleMapUpload} style={{ display: "none" }} />
          </label>

          <button
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
            style={{ padding: "8px 14px", backgroundColor: sidePanelOpen ? "#0A192F" : "#FFFFFF", color: sidePanelOpen ? "#FFFFFF" : "#0F172A", border: "1px solid #D9DEE7", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Sliders style={{ width: 14, height: 14 }} />
            <span>{sidePanelOpen ? "Hide Inspector" : "Show Inspector"}</span>
          </button>
        </div>

      </div>

      {/* ─── 2. SEVERITY FILTERS & MAP CONTROLS STRIP ─────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        
        {/* Risk Severity Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Units", count: 25, color: "#0F172A" },
            { id: "extreme", label: "Extreme Risk", count: 4, color: "#DC2626" },
            { id: "high", label: "High Risk", count: 5, color: "#EA580C" },
            { id: "moderate", label: "Moderate Risk", count: 6, color: "#D9DEE7" },
            { id: "low", label: "Low Risk", count: 10, color: "#16A34A" },
          ].map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? "#0A192F" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#475569",
                  border: `1.5px solid ${isActive ? "#0A192F" : "#D9DEE7"}`,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <span>{f.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 10, backgroundColor: isActive ? "#1E293B" : "#F1F5F9", color: isActive ? "#FFFFFF" : "#64748B" }}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Canvas Controls: Zoom, Overlay, Drop Pin */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          
          {/* Zoom Buttons */}
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 8, border: "1px solid #D9DEE7", overflow: "hidden" }}>
            <button onClick={() => handleZoom(-0.25)} title="Zoom Out" style={{ padding: "7px 10px", background: "none", border: "none", cursor: "pointer", borderRight: "1px solid #E2E8F0" }}>
              <ZoomOut style={{ width: 16, height: 16, color: "#475569" }} />
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "0 10px", color: "#0F172A", minWidth: 42, textAlign: "center" }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button onClick={() => handleZoom(0.25)} title="Zoom In" style={{ padding: "7px 10px", background: "none", border: "none", cursor: "pointer", borderLeft: "1px solid #E2E8F0" }}>
              <ZoomIn style={{ width: 16, height: 16, color: "#475569" }} />
            </button>
            <button onClick={handleReset} title="Reset View" style={{ padding: "7px 10px", background: "none", border: "none", cursor: "pointer", borderLeft: "1px solid #E2E8F0" }}>
              <RotateCcw style={{ width: 15, height: 15, color: "#475569" }} />
            </button>
          </div>

          {/* Toggle Heatmap Plumes */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            style={{ padding: "7px 12px", backgroundColor: showHeatmap ? "#F1F5F9" : "#FFFFFF", border: "1px solid #D9DEE7", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#0F172A", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Layers style={{ width: 14, height: 14, color: showHeatmap ? "#1D4ED8" : "#94A3B8" }} />
            <span>Thermal Plumes</span>
          </button>

          {/* Pin Drop Mode */}
          <button
            onClick={() => setPinDropMode(!pinDropMode)}
            style={{ padding: "7px 12px", backgroundColor: pinDropMode ? "#EF4444" : "#FFFFFF", color: pinDropMode ? "#FFFFFF" : "#0F172A", border: `1px solid ${pinDropMode ? "#EF4444" : "#D9DEE7"}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <MapPin style={{ width: 14, height: 14 }} />
            <span>{pinDropMode ? "Click Map to Pin" : "Drop Pin"}</span>
          </button>

        </div>

      </div>

      {/* ─── 3. MAIN WORKSPACE: SPACIOUS MAP + INSPECTOR DRAWER ──────── */}
      <div style={{ display: "grid", gridTemplateColumns: sidePanelOpen ? "1fr 340px" : "1fr", gap: 20, alignItems: "start", transition: "grid-template-columns 0.2s ease" }}>
        
        {/* Map Canvas Frame */}
        <div
          style={{
            backgroundColor: "#0B1426",
            borderRadius: 16,
            border: "1px solid #D9DEE7",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            position: "relative",
            overflow: "hidden",
            minHeight: 640,
            cursor: pinDropMode ? "crosshair" : isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          
          {/* Inner Zoomable Canvas */}
          <div
            ref={mapContainerRef}
            onClick={handleCanvasClick}
            style={{
              position: "relative",
              width: "100%",
              height: 640,
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
          >
            
            {/* Background Facility Blueprint Image */}
            <img
              src={customMapUrl}
              alt="Refinery Blueprint"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "fill",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
                filter: "brightness(0.9) contrast(1.08)",
              }}
            />

            {/* Thermal Heatmap Plumes Overlay */}
            {showHeatmap && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.9 }}>
                {filteredUnits.map((unit) => {
                  const centerX = unit.x + unit.w / 2;
                  const centerY = unit.y + unit.h / 2;
                  const plumeDiameter = Math.max(unit.w, unit.h) * 2.1;
                  return (
                    <div
                      key={`heat-${unit.id}`}
                      style={{
                        position: "absolute",
                        left: `${centerX}%`,
                        top: `${centerY}%`,
                        width: `${plumeDiameter}%`,
                        paddingTop: `${plumeDiameter * 0.75}%`,
                        transform: "translate(-50%, -50%)",
                        background: getHeatmapRadialGradient(unit.riskScore),
                        borderRadius: "50%",
                        filter: "blur(7px)",
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Operator Custom Incident Markers */}
            {customMarkers.map((marker) => (
              <div
                key={marker.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomMarkers(customMarkers.filter((m) => m.id !== marker.id));
                }}
                style={{
                  position: "absolute",
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  transform: "translate(-50%, -100%)",
                  zIndex: 40,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ backgroundColor: "#0A192F", color: "white", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                  {marker.note}
                </div>
                <MapPin style={{ width: 26, height: 26, color: "#EF4444", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
              </div>
            ))}

            {/* Clean Non-Overlapping Unit Indicator Pins */}
            {filteredUnits.map((unit) => {
              const isSelected = selectedUnit?.id === unit.id;
              const isHovered = hoveredUnit?.id === unit.id;
              const centerX = unit.x + unit.w / 2;
              const centerY = unit.y + unit.h / 2;
              const color = getUnitRiskColor(unit.riskScore);
              const isCritical = unit.riskScore >= 80;

              return (
                <div key={`ui-${unit.id}`} className="map-unit-interactive">
                  
                  {/* Pin Element */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      focusUnit(unit);
                    }}
                    onMouseEnter={() => setHoveredUnit(unit)}
                    onMouseLeave={() => setHoveredUnit(null)}
                    style={{
                      position: "absolute",
                      left: `${centerX}%`,
                      top: `${centerY}%`,
                      transform: `translate(-50%, -50%) scale(${isSelected ? 1.25 : isHovered ? 1.15 : 1})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: isSelected ? 35 : isHovered ? 34 : 30,
                      transition: "transform 0.15s ease",
                    }}
                  >
                    
                    {/* Glowing Pulse Ring for Critical Units */}
                    {isCritical && (
                      <div
                        style={{
                          position: "absolute",
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          border: `2px solid ${color}`,
                          animation: "applePulse 2s ease-in-out infinite",
                        }}
                      />
                    )}

                    {/* Unit Pill Badge */}
                    <div
                      style={{
                        backgroundColor: isSelected ? "#FFFFFF" : "rgba(10, 25, 47, 0.92)",
                        border: `2px solid ${color}`,
                        padding: "3px 8px",
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        boxShadow: "0 3px 10px rgba(0,0,0,0.45)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? "#0F172A" : "#FFFFFF", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                        {unit.code}
                      </span>
                    </div>

                  </div>

                  {/* Floating Hover Card */}
                  {isHovered && !isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${centerX}%`,
                        top: `calc(${centerY}% - 22px)`,
                        transform: "translate(-50%, -100%)",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${color}`,
                        boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
                        zIndex: 60,
                        pointerEvents: "none",
                        minWidth: 200,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{unit.name}</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color }}>{unit.riskScore}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>{unit.dominantHazard}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>
                        {unit.incidents} active incidents · Click to inspect
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

          </div>

          {/* Floating Canvas Footer Scale */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 16,
              display: "flex",
              alignItems: "center",
              gap: 14,
              backgroundColor: "rgba(11, 20, 38, 0.88)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "8px 16px",
              borderRadius: 10,
              backdropFilter: "blur(6px)",
              color: "white",
              fontSize: 11,
              fontWeight: 600,
              zIndex: 25,
            }}
          >
            <span>RISK LEVEL:</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#16A34A" }}>LOW</span>
              <div style={{ width: 120, height: 6, borderRadius: 999, background: "linear-gradient(to right, #16A34A, #D97706, #EA580C, #DC2626)" }} />
              <span style={{ color: "#DC2626" }}>EXTREME (90+)</span>
            </div>
          </div>

        </div>

        {/* ─── 4. SIDE INSPECTOR / ANALYTICS DRAWER ─────────────────────── */}
        {sidePanelOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* When a Unit is Selected: Live Telemetry & Actions */}
            {selectedUnit ? (
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: 14, border: "1px solid #D9DEE7", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#1D4ED8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      FACILITY ASSET TELEMETRY
                    </span>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", margin: "4px 0 0 0" }}>
                      {selectedUnit.name}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedUnit(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#64748B" }}>
                    <X style={{ width: 18, height: 18 }} />
                  </button>
                </div>

                {/* Score badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", padding: "12px 14px", borderRadius: 10, border: "1px solid #E2E8F0", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Calculated Risk Score</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: getUnitRiskColor(selectedUnit.riskScore), lineHeight: 1.1, marginTop: 2 }}>
                      {selectedUnit.riskScore} <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>/ 100</span>
                    </div>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 800, backgroundColor: selectedUnit.riskScore >= 80 ? "#FEF2F2" : "#FFF7ED", color: getUnitRiskColor(selectedUnit.riskScore) }}>
                    {selectedUnit.status.toUpperCase()}
                  </span>
                </div>

                {/* Simulated Live Sensors */}
                {selectedTelemetry && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                      LIVE ASSET TELEMETRY
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px" }}>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>TEMPERATURE</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{selectedTelemetry.temp}°C</div>
                      </div>
                      <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px" }}>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>PRESSURE</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{selectedTelemetry.pressure} bar</div>
                      </div>
                      <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px" }}>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>VIBRATION</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{selectedTelemetry.vibration} mm/s</div>
                      </div>
                      <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px" }}>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>GAS (LEL)</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: selectedTelemetry.gasPpm > 25 ? "#DC2626" : "#0F172A", marginTop: 2 }}>{selectedTelemetry.gasPpm} ppm</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dominant Hazard */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    IDENTIFIED DOMINANT HAZARD
                  </div>
                  <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.5, margin: 0 }}>
                    {selectedUnit.details}
                  </p>
                </div>

                {/* Action CTA buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <a
                    href="/officer/tasks"
                    style={{ padding: "10px 14px", backgroundColor: "#0A192F", color: "#FFFFFF", borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <Wrench style={{ width: 15, height: 15 }} />
                    Dispatch Maintenance Work Order
                  </a>
                  <a
                    href="/officer/alerts"
                    style={{ padding: "9px 14px", backgroundColor: "#FFFFFF", color: "#0F172A", border: "1.5px solid #D9DEE7", borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none" }}
                  >
                    View All Active Incidents ({selectedUnit.incidents})
                  </a>
                </div>

              </div>
            ) : (
              /* Default State: Overall Risk Overview & Critical Drivers */
              <>
                {/* Overall Score */}
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 14, border: "1px solid #D9DEE7", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    FACILITY OVERALL RISK
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: "#DC2626", lineHeight: 1 }}>
                        72<span style={{ fontSize: 16, color: "#64748B", fontWeight: 600 }}>/100</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginTop: 4 }}>High Risk Facility Alert</div>
                    </div>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#FEF2F2", border: "2px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AlertTriangle style={{ width: 24, height: 24, color: "#DC2626" }} />
                    </div>
                  </div>
                </div>

                {/* Top Critical Risk Drivers (Clickable) */}
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 14, border: "1px solid #D9DEE7", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    TOP RISK DRIVERS (CLICK TO FOCUS)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {criticalHotspots.map((unit, idx) => (
                      <div
                        key={unit.id}
                        onClick={() => focusUnit(unit)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: 8,
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <span style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: "#DC2626", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {unit.code} · {unit.name.split("(")[0].trim()}
                          </span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 900, color: "#DC2626", marginLeft: 8 }}>
                          {unit.riskScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Mitigations */}
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: 14, border: "1px solid #D9DEE7", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    RECOMMENDED ACTIONS
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#475569", display: "flex", flexDirection: "column", gap: 8, lineHeight: 1.5 }}>
                    <li>Isolate FCC slide valve and schedule emergency inspection.</li>
                    <li>Deploy thermal monitoring drones to ADU fractionation column.</li>
                    <li>Review LOTO procedures in active high-risk zones.</li>
                  </ul>
                </div>
              </>
            )}

          </div>
        )}

      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes applePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.6);
            opacity: 0.2;
          }
        }
      `}</style>

    </div>
  );
}
