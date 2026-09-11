import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import mongoose from "mongoose";

// Reuse or define Mongoose model in Next.js environment
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

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      AiReport.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AiReport.countDocuments({}),
    ]);

    // Format according to api contract envelope
    return NextResponse.json({
      success: true,
      data: reports.map((r: any) => ({
        _id: r._id.toString(),
        title: r.title || "Observation Report",
        location: r.location || "Industrial Site",
        category: r.category || "unsafe_condition",
        severity: r.severity || "medium",
        status: r.status || "analysis_complete",
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        riskAssessment: {
          riskScore: r.risk_score ?? 0,
          riskLevel: r.risk_level || "LOW",
          sifProbability: r.sif_probability ?? 0,
        },
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
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
    await connectToDatabase();
    const body = await req.json();

    const report = await AiReport.create({
      title: body.title || "User Safety Report",
      description: body.description || "",
      location: body.location || "",
      category: body.category || "unsafe_condition",
      severity: body.severity || "high",
      status: "pending_analysis",
      raw_query: body,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: report._id.toString(),
          title: report.title,
          status: report.status,
          createdAt: report.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save report" },
      { status: 500 }
    );
  }
}
