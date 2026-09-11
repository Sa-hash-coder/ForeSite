import { NextRequest, NextResponse } from "next/server";
import { dbReports } from "@/app/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const report = await dbReports.findById(id);

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: report._id,
        title: report.title,
        description: report.description,
        location: report.location,
        category: report.category,
        severity: report.severity,
        imageUrl: report.imageUrl,
        audioUrl: report.audioUrl,
        status: report.status,
        submittedBy: report.submittedBy,
        riskAssessment: {
          riskScore: report.risk_score,
          riskLevel: report.risk_level,
          sifProbability: report.sif_probability,
          precursors: report.precursors,
          hazards: report.hazards,
          explanation: report.explanation,
        },
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching report details:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status update is required" },
        { status: 400 }
      );
    }

    const updated = await dbReports.updateById(id, { status });
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating report status:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update report status" },
      { status: 500 }
    );
  }
}
