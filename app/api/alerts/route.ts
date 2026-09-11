import { NextRequest, NextResponse } from "next/server";
import { dbAlerts } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unacknowledgedOnly = searchParams.get("unacknowledgedOnly") === "true";

    const alerts = await dbAlerts.list(unacknowledgedOnly);

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error: any) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, officerName = "Officer Command" } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Alert ID is required" },
        { status: 400 }
      );
    }

    const acknowledged = await dbAlerts.acknowledge(id, officerName);
    if (!acknowledged) {
      return NextResponse.json(
        { success: false, message: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: acknowledged,
    });
  } catch (error: any) {
    console.error("Error acknowledging alert:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to acknowledge alert" },
      { status: 500 }
    );
  }
}
