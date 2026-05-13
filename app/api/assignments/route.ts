import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assignment from "@/models/Assignment";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const classFilter = searchParams.get("class");
    const section = searchParams.get("section");

    const query: Record<string, unknown> = { branch: session.user.branch };

    if (session.user.role === "teacher") {
      query.assignedBy = session.user.id;
    }

    if (session.user.role === "student") {
      // Student only sees assignments for their class/section
      // These are stored on the user object but passed as query params from the client
      if (classFilter) query.class = classFilter;
      if (section) query.section = section;
    } else {
      if (classFilter) query.class = classFilter;
      if (section) query.section = section;
    }

    const assignments = await Assignment.find(query)
      .populate("assignedBy", "name")
      .sort({ deadline: 1 });

    return NextResponse.json(assignments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const assignment = await Assignment.create({
      ...body,
      assignedBy: session.user.id,
      branch: session.user.branch,
    });
    const populated = await assignment.populate("assignedBy", "name");
    return NextResponse.json(populated, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}
