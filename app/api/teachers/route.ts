import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branch");

    const query: Record<string, unknown> = { role: "teacher" };
    if (branchId) query.branch = branchId;

    const teachers = await User.find(query)
      .select("-password")
      .populate("branch", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(teachers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const hashed = await bcrypt.hash(body.password || "password123", 10);
    const teacher = await User.create({ ...body, role: "teacher", password: hashed });
    const { password: _pw, ...result } = teacher.toObject();
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error && err.message.includes("duplicate")
      ? "Email already exists"
      : "Failed to create teacher";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
