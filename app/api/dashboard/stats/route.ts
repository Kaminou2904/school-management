import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Branch from "@/models/Branch";
import User from "@/models/User";
import Attendance from "@/models/Attendance";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (session.user.role === "admin") {
      const [totalBranches, activeBranches, totalTeachers, totalStudents] = await Promise.all([
        Branch.countDocuments(),
        Branch.countDocuments({ isActive: true }),
        User.countDocuments({ role: "teacher" }),
        User.countDocuments({ role: "student" }),
      ]);
      return NextResponse.json({ totalBranches, activeBranches, totalTeachers, totalStudents });
    }

    if (session.user.role === "teacher") {
      const branchId = session.user.branch;
      const [myStudents, presentToday, absentToday] = await Promise.all([
        User.countDocuments({ role: "student", branch: branchId }),
        Attendance.countDocuments({ branch: branchId, status: "present", date: { $gte: today, $lt: tomorrow } }),
        Attendance.countDocuments({ branch: branchId, status: "absent", date: { $gte: today, $lt: tomorrow } }),
      ]);
      return NextResponse.json({ myStudents, presentToday, absentToday });
    }

    if (session.user.role === "student") {
      const studentId = session.user.id;
      const [totalDays, presentDays, absentDays] = await Promise.all([
        Attendance.countDocuments({ student: studentId }),
        Attendance.countDocuments({ student: studentId, status: "present" }),
        Attendance.countDocuments({ student: studentId, status: "absent" }),
      ]);
      const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      return NextResponse.json({ totalDays, presentDays, absentDays, percentage });
    }

    return NextResponse.json({});
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
