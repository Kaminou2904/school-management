"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/branches", label: "Branches", icon: "🏫" },
  { href: "/admin/teachers", label: "Teachers", icon: "👨‍🏫" },
  { href: "/admin/students", label: "Students", icon: "🎓" },
  { href: "/admin/notices", label: "Notices", icon: "📢" },
];

const teacherNav: NavItem[] = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/teacher/students", label: "My Students", icon: "🎓" },
  { href: "/teacher/attendance", label: "Attendance", icon: "✅" },
];

const studentNav: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/student/attendance", label: "My Attendance", icon: "📅" },
];

const navMap: Record<string, NavItem[]> = {
  admin: adminNav,
  teacher: teacherNav,
  student: studentNav,
};

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = navMap[role] ?? [];

  return (
    <aside className="w-64 min-h-screen bg-navy flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange rounded-lg flex items-center justify-center text-white text-lg font-bold">
            S
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">School</p>
            <p className="text-white/50 text-xs">Management System</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-6 py-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-white/40">
          {role} portal
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-orange text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs text-center">© 2025 School MS</p>
      </div>
    </aside>
  );
}
