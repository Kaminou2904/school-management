import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password;
    }

    const teacher = await User.findByIdAndUpdate(id, body, { new: true }).select("-password");
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    return NextResponse.json(teacher);
  } catch {
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const teacher = await User.findByIdAndDelete(id);
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    return NextResponse.json({ message: "Teacher deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
