import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Branch from "@/models/Branch";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const branch = await Branch.findByIdAndUpdate(id, body, { new: true });
    if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    return NextResponse.json(branch);
  } catch {
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
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
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    return NextResponse.json({ message: "Branch deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}
