import { NextRequest, NextResponse } from "next/server";
import { dbUsers } from "@/app/lib/db";
import { verifyToken } from "@/app/lib/security";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken<{ _id: string }>(token);

    if (!decoded || !decoded._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired session token" },
        { status: 401 }
      );
    }

    const user = await dbUsers.findById(decoded._id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        badgeId: user.badgeId,
      },
    });
  } catch (error: any) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
