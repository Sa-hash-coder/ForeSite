import { NextRequest, NextResponse } from "next/server";
import { dbReports, dbAlerts } from "@/app/lib/db";
import { verifyToken } from "@/app/lib/security";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const riskLevel = searchParams.get("riskLevel") || undefined;
    const category = searchParams.get("category") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const result = await dbReports.list({ status, riskLevel, category, limit, page });

    return NextResponse.json({
      success: true,
      data: result.reports.map((r) => ({
        _id: r._id,
        title: r.title,
        location: r.location,
        category: r.category,
        severity: r.severity,
        status: r.status,
        createdAt: r.createdAt,
        riskAssessment: {
          riskScore: r.risk_score,
          riskLevel: r.risk_level,
          sifProbability: r.sif_probability,
          precursors: r.precursors,
          hazards: r.hazards,
          explanation: r.explanation,
        },
        submittedBy: r.submittedBy,
      })),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      location,
      category = "unsafe_condition",
      severity = "high",
      imageUrl,
      audioUrl,
    } = body;

    // Optional user authentication extraction
    let user = {
      _id: "usr_guest",
      name: "Site Worker",
      role: "worker",
      department: "Plant Operations",
    };

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const decoded = verifyToken(authHeader.substring(7));
      if (decoded && decoded._id) {
        user = {
          _id: decoded._id,
          name: decoded.name || "Site Worker",
          role: decoded.role || "worker",
          department: decoded.department || "Operations",
        };
      }
    }

    // Determine initial AI risk score heuristic
    const isCritical =
      severity === "critical" ||
      (description && /fall|fire|explosion|collapse|gas|electrocution|leak/i.test(description));
    const isHigh = severity === "high" || (description && /crack|vibration|spill|high pressure/i.test(description));

    const riskLevel = isCritical ? "CRITICAL" : isHigh ? "HIGH" : severity === "low" ? "LOW" : "MEDIUM";
    const riskScore = isCritical ? Math.floor(82 + Math.random() * 15) : isHigh ? Math.floor(65 + Math.random() * 14) : Math.floor(35 + Math.random() * 25);
    const sifProbability = isCritical ? 0.85 : isHigh ? 0.62 : 0.25;

    const reportTitle = title || (description ? description.slice(0, 60) : `Hazard Report - ${location || "Sector 4"}`);

    const newReport = await dbReports.create({
      title: reportTitle,
      description: description || "Hazard observation submitted from field.",
      location: location || "Industrial Facility",
      category,
      severity: severity as any,
      risk_score: riskScore,
      risk_level: riskLevel,
      sif_probability: sifProbability,
      precursors: isCritical
        ? ["Working at Height / Unsecured Perimeter", "Direct Line of Fire Exposure"]
        : isHigh
        ? ["Mechanical Component Degradation", "Fluid Pressure Anomaly"]
        : ["Operational Fatigue"],
      hazards: isCritical
        ? ["Catastrophic Structural Failure", "Fatal Fall Impact"]
        : isHigh
        ? ["Unplanned Machine Trip", "Hot Fluid Contact"]
        : ["Minor First Aid Event"],
      explanation: `Automated SIF classification calculated risk score ${riskScore}/100 (${riskLevel}) for ${location}. Priority response mandated under OSHA 1910.`,
      imageUrl,
      audioUrl,
      status: isCritical ? "under_review" : "analysis_complete",
      submittedBy: user,
    });

    // Auto-generate high-risk alert for Safety Officer dashboard if Critical or High
    if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
      await dbAlerts.create({
        reportId: newReport._id,
        reportTitle: newReport.title,
        riskLevel: riskLevel as "CRITICAL" | "HIGH",
        riskScore: newReport.risk_score,
        sifProbability: newReport.sif_probability,
        message: `${riskLevel} SIF HAZARD: ${newReport.title} at ${newReport.location}`,
        isAcknowledged: false,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: newReport,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to submit report:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit report" },
      { status: 500 }
    );
  }
}
