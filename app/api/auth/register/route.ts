import { NextRequest, NextResponse } from "next/server";
import { dbUsers } from "@/app/lib/db";
import { hashPassword, createToken } from "@/app/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = "worker", department } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Full Name is required (minimum 2 characters)" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid corporate site email address is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const validRoles = ["worker", "officer", "safety_officer", "maintenance", "admin"];
    const normalizedRole = role === "safety_officer" ? "officer" : role;
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json(
        { success: false, message: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Check existing email
    const existing = await dbUsers.findByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Generate badge ID based on role
    const badgePrefix = normalizedRole === "officer" ? "SAF" : normalizedRole === "maintenance" ? "MNT" : "WRK";
    const badgeId = `${badgePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await dbUsers.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashPassword(password),
      role: normalizedRole as any,
      department: department?.trim() || (normalizedRole === "officer" ? "HSE Inspection" : normalizedRole === "maintenance" ? "Plant Reliability" : "Operations Unit"),
      badgeId,
    });

    const token = createToken({
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      badgeId: newUser.badgeId,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            department: newUser.department,
            badgeId: newUser.badgeId,
          },
          token,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
