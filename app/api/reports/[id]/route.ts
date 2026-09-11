import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import mongoose from "mongoose";

const aiReportSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    location: String,
    category: String,
    severity: String,
    risk_score: Number,
    risk_level: String,
    sif_probability: Number,
    precursors: [String],
    hazards: [String],
    explanation: String,
    extracted_image_context: String,
    extracted_audio_context: String,
    model_version: String,
    processing_time_ms: Number,
    is_fallback: Boolean,
    extraction_fallback: Boolean,
    status: String,
    submittedBy: mongoose.Schema.Types.ObjectId,
    report_id: String,
    raw_query: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const AiReport =
  mongoose.models.AiReport ||
  mongoose.model("AiReport", aiReportSchema, "ai-reports");

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    let report = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      report = await AiReport.findById(id).lean();
    }

    if (!report) {
      report = await AiReport.findOne({
        $or: [{ report_id: id }, { _id: id }],
      }).lean();
    }

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    const formatted = {
      _id: (report as any)._id.toString(),
      title: (report as any).title || "Safety Report",
      description:
        (report as any).description ||
        (report as any).raw_query?.description ||
        "No detailed text description provided.",
      location: (report as any).location || (report as any).raw_query?.location || "Main Plant",
      category: (report as any).category || (report as any).raw_query?.category || "unsafe_condition",
      severity: (report as any).severity || (report as any).raw_query?.severity || "medium",
      imageUrl: (report as any).imageUrl || (report as any).raw_query?.imageUrl || null,
      audioUrl: (report as any).audioUrl || (report as any).raw_query?.audioUrl || null,
      status: (report as any).status || "analysis_complete",
      submittedBy: {
        _id: "64a1b2c3d4e5f6a7b8c9d001",
        name: (report as any).raw_query?.userName || "Plant Worker",
        department: (report as any).raw_query?.department || "Operations",
      },
      riskAssessment: {
        riskScore: (report as any).risk_score ?? 0,
        riskLevel: (report as any).risk_level || "LOW",
        sifProbability: (report as any).sif_probability ?? 0,
        precursors: (report as any).precursors || [],
        hazards: (report as any).hazards || [],
        explanation: (report as any).explanation || "Automated hazard analysis completed.",
      },
      extractedImageContext: (report as any).extracted_image_context || null,
      extractedAudioContext: (report as any).extracted_audio_context || null,
      rawQuery: (report as any).raw_query || {},
      createdAt: (report as any).createdAt
        ? new Date((report as any).createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: (report as any).updatedAt
        ? new Date((report as any).updatedAt).toISOString()
        : new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Error fetching report details:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch report" },
      { status: 500 }
    );
  }
}
