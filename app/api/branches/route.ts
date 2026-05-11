import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Branch from "@/models/Branch";

export async function GET() {
  try {
    await connectDB();
    const branches = await Branch.find().sort({ createdAt: -1 });
    return NextResponse.json(branches);
  } catch {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
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
    const branch = await Branch.create(body);
    return NextResponse.json(branch, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
