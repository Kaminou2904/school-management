"use client";
import { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Stats {
  myStudents: number;
  presentToday: number;
  absentToday: number;
}

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats);
  }, []);

  const attendanceRate =
    stats && stats.myStudents > 0
      ? Math.round((stats.presentToday / stats.myStudents) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">
          Hello, {session?.user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {session?.user?.branchName} &bull; Here&apos;s your daily summary
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Students" value={stats?.myStudents ?? "—"} icon="🎓" color="navy" />
        <StatsCard title="Present Today" value={stats?.presentToday ?? "—"} icon="✅" color="green" />
        <StatsCard title="Absent Today" value={stats?.absentToday ?? "—"} icon="❌" color="red" />
      </div>

      {/* Attendance rate */}
      {stats && stats.myStudents > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-navy mb-3">Today&apos;s Attendance Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div
                className="bg-orange h-3 rounded-full transition-all"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            <span className="font-bold text-navy text-lg w-16 text-right">{attendanceRate}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {stats.presentToday} of {stats.myStudents} students present
          </p>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/teacher/attendance"
          className="bg-navy text-white rounded-xl p-6 hover:bg-navy-light transition-colors group"
        >
          <div className="text-3xl mb-3">✅</div>
          <p className="font-semibold text-lg">Mark Attendance</p>
          <p className="text-white/60 text-sm mt-1">Record today&apos;s attendance for your students</p>
        </Link>
        <Link
          href="/teacher/students"
          className="bg-white border border-gray-100 rounded-xl p-6 hover:border-orange hover:shadow-sm transition-all group"
        >
          <div className="text-3xl mb-3">🎓</div>
          <p className="font-semibold text-lg text-navy group-hover:text-orange transition-colors">View Students</p>
          <p className="text-gray-400 text-sm mt-1">See all students in your branch</p>
        </Link>
      </div>
    </div>
  );
}
