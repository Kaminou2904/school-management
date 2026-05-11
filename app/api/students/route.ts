import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "teacher"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branch");
    const classFilter = searchParams.get("class");
    const section = searchParams.get("section");

    const query: Record<string, unknown> = { role: "student" };

    // Teachers can only see students from their own branch
    if (session.user.role === "teacher") {
      query.branch = session.user.branch;
    } else if (branchId) {
      query.branch = branchId;
    }

    if (classFilter) query.class = classFilter;
    if (section) query.section = section;

    const students = await User.find(query)
      .select("-password")
      .populate("branch", "name")
      .sort({ name: 1 });

    return NextResponse.json(students);
  } catch {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
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
    const student = await User.create({ ...body, role: "student", password: hashed });
    const { password: _pw, ...result } = student.toObject();
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error && err.message.includes("duplicate")
      ? "Email already exists"
      : "Failed to create student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
