import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Notice, { NoticeTarget } from "@/models/Notice";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const role = session.user.role;

    // Admin sees all notices; teachers/students see notices targeting them
    const query =
      role === "admin"
        ? {}
        : { isActive: true, targetRole: { $in: [role as NoticeTarget, "both" as NoticeTarget] } };

    const notices = await Notice.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(notices);
  } catch {
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
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
    const notice = await Notice.create({
      ...body,
      createdBy: session.user.id,
    });
    const populated = await notice.populate("createdBy", "name");
    return NextResponse.json(populated, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
