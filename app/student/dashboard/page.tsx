"use client";
import { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Stats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats);
  }, []);

  const user = session?.user;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Hello, {user?.name?.split(" ")[0]} 👋</h2>
        <p className="text-gray-400 text-sm mt-1">Welcome to your student portal</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.name?.[0] ?? "?"}
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Full Name", value: user?.name },
              { label: "Email", value: user?.email },
              { label: "Branch", value: user?.branchName },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800">{item.value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Days Recorded" value={stats?.totalDays ?? "—"} icon="📅" color="navy" />
        <StatsCard title="Days Present" value={stats?.presentDays ?? "—"} icon="✅" color="green" />
        <StatsCard title="Days Absent" value={stats?.absentDays ?? "—"} icon="❌" color="red" />
      </div>

      {/* Attendance percentage */}
      {stats && stats.totalDays > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-navy">Overall Attendance</h3>
            <span className={`text-lg font-bold ${
              stats.percentage >= 75 ? "text-green-600" : stats.percentage >= 50 ? "text-yellow-600" : "text-red-600"
            }`}>
              {stats.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                stats.percentage >= 75 ? "bg-green-500" : stats.percentage >= 50 ? "bg-yellow-400" : "bg-red-500"
              }`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {stats.percentage >= 75
              ? "Great attendance! Keep it up."
              : stats.percentage >= 50
              ? "Your attendance could be better."
              : "Warning: Low attendance. Please attend regularly."}
          </p>
        </div>
      )}

      <Link
        href="/student/attendance"
        className="flex items-center gap-4 bg-navy text-white rounded-xl p-5 hover:bg-navy-light transition-colors"
      >
        <span className="text-3xl">📅</span>
        <div>
          <p className="font-semibold">View Attendance History</p>
          <p className="text-white/60 text-sm">See your full attendance record</p>
        </div>
        <span className="ml-auto text-white/50">→</span>
      </Link>
    </div>
  );
}
