import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student");
    const dateStr = searchParams.get("date");
    const classFilter = searchParams.get("class");
    const section = searchParams.get("section");

    const query: Record<string, unknown> = {};

    if (session.user.role === "student") {
      query.student = session.user.id;
    } else if (studentId) {
      query.student = studentId;
    }

    if (session.user.role === "teacher" || session.user.role === "admin") {
      query.branch = session.user.branch;
    }

    if (dateStr) {
      const date = new Date(dateStr);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: date, $lt: nextDay };
    }
    if (classFilter) query.class = classFilter;
    if (section) query.section = section;

    const records = await Attendance.find(query)
      .populate("student", "name rollNumber class section")
      .populate("markedBy", "name")
      .sort({ date: -1 });

    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
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
    // body: { records: [{ studentId, status }], date, class, section }
    const { records, date, class: cls, section } = body;

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const ops = records.map((r: { studentId: string; status: string }) => ({
      updateOne: {
        filter: { student: r.studentId, date: dateObj },
        update: {
          $set: {
            student: r.studentId,
            markedBy: session.user.id,
            branch: session.user.branch,
            date: dateObj,
            status: r.status,
            class: cls,
            section,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    return NextResponse.json({ message: "Attendance saved" });
  } catch {
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
