"use client";
import { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";

interface Stats {
  totalBranches: number;
  activeBranches: number;
  totalTeachers: number;
  totalStudents: number;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  branch: { name: string };
  createdAt: string;
  subjects?: string[];
  class?: string;
  section?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTeachers, setRecentTeachers] = useState<RecentUser[]>([]);
  const [recentStudents, setRecentStudents] = useState<RecentUser[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats);
    fetch("/api/teachers").then((r) => r.json()).then((d) => setRecentTeachers(d.slice(0, 5)));
    fetch("/api/students").then((r) => r.json()).then((d) => setRecentStudents(d.slice(0, 5)));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy mb-1">Overview</h2>
        <p className="text-gray-400 text-sm">Welcome back, here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Branches" value={stats?.totalBranches ?? "—"} icon="🏫" color="navy" />
        <StatsCard title="Active Branches" value={stats?.activeBranches ?? "—"} icon="✅" color="green" />
        <StatsCard title="Total Teachers" value={stats?.totalTeachers ?? "—"} icon="👨‍🏫" color="orange" />
        <StatsCard title="Total Students" value={stats?.totalStudents ?? "—"} icon="🎓" color="navy" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/admin/branches", label: "Manage Branches", icon: "🏫", desc: "Add or edit school branches" },
          { href: "/admin/teachers", label: "Manage Teachers", icon: "👨‍🏫", desc: "Add or edit teacher accounts" },
          { href: "/admin/students", label: "Manage Students", icon: "🎓", desc: "Add or edit student accounts" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:border-orange hover:shadow-sm transition-all group"
          >
            <div className="text-2xl mb-3">{item.icon}</div>
            <p className="font-semibold text-navy group-hover:text-orange transition-colors">{item.label}</p>
            <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Teachers */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy">Recent Teachers</h3>
            <Link href="/admin/teachers" className="text-orange text-sm hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTeachers.length === 0 ? (
              <p className="text-gray-400 text-sm px-5 py-4">No teachers yet.</p>
            ) : (
              recentTeachers.map((t) => (
                <div key={t._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.email}</p>
                  </div>
                  <span className="text-xs bg-navy/10 text-navy px-2 py-1 rounded-full">
                    {t.branch?.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy">Recent Students</h3>
            <Link href="/admin/students" className="text-orange text-sm hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentStudents.length === 0 ? (
              <p className="text-gray-400 text-sm px-5 py-4">No students yet.</p>
            ) : (
              recentStudents.map((s) => (
                <div key={s._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">Class {s.class}-{s.section}</p>
                  </div>
                  <span className="text-xs bg-orange/10 text-orange-dark px-2 py-1 rounded-full">
                    {s.branch?.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
