import { NextRequest, NextResponse } from "next/server";
import { dbStats } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const data = await dbStats.getDashboardStats();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard statistics:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
