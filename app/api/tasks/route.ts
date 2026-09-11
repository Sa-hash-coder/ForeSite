import { NextRequest, NextResponse } from "next/server";
import { dbTasks } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const tasks = await dbTasks.list(status ? { status } : undefined);

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch tasks" },
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
      equipmentId = "EQ-GEN",
      equipmentName = "General Plant Equipment",
      location = "Plant Sector 4",
      zone = "Zone 4",
      severity = "high",
      assignedCrew = "Reliability Crew M-4",
      dispatchedBy = { name: "Officer Command", role: "Safety Supervisor", badgeId: "SAF-4019" },
      safetyPermitId = "PTW-" + Math.floor(1000 + Math.random() * 9000),
      lotoRequired = false,
      reportId,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Task title is required" },
        { status: 400 }
      );
    }

    const newTask = await dbTasks.create({
      title,
      description: description || "Field repair dispatched by safety officer.",
      equipmentId,
      equipmentName,
      location,
      zone,
      severity,
      status: "dispatched",
      assignedCrew,
      dispatchedBy,
      safetyPermitId,
      lotoRequired,
      reportId,
      orderNumber: "WO-" + Math.floor(9040 + Math.random() * 50),
    });

    return NextResponse.json(
      {
        success: true,
        data: newTask,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error dispatching task:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to dispatch task" },
      { status: 500 }
    );
  }
}
