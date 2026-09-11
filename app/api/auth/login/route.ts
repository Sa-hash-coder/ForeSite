import { NextRequest, NextResponse } from "next/server";
import { dbUsers } from "@/app/lib/db";
import { verifyPassword, createToken } from "@/app/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await dbUsers.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password. Verify credentials." },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password. Verify credentials." },
        { status: 401 }
      );
    }

    const token = createToken({
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      badgeId: user.badgeId,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          badgeId: user.badgeId,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
