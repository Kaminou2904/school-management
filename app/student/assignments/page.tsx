"use client";
import { useEffect, useState } from "react";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  type: "homework" | "assignment";
  subject: string;
  class: string;
  section: string;
  deadline: string;
  assignedBy: { name: string };
}

interface StudentProfile {
  class: string;
  section: string;
}

function deadlineStatus(deadline: string) {
  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)}d`, cls: "bg-red-100 text-red-600", urgent: true };
  if (diffDays === 0) return { label: "Due today!", cls: "bg-orange/20 text-orange-dark", urgent: true };
  if (diffDays <= 2) return { label: `Due in ${diffDays}d`, cls: "bg-yellow-100 text-yellow-700", urgent: true };
  return { label: `${diffDays} days left`, cls: "bg-green-100 text-green-700", urgent: false };
}

const typeConfig = {
  homework: { label: "Homework", bg: "bg-orange/10 text-orange-dark", icon: "📝" },
  assignment: { label: "Assignment", bg: "bg-navy/10 text-navy", icon: "📋" },
};

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [filterType, setFilterType] = useState<"" | "homework" | "assignment">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data: StudentProfile) => {
        setProfile(data);
        if (data.class && data.section) {
          const params = new URLSearchParams({ class: data.class, section: data.section });
          return fetch(`/api/assignments?${params}`);
        }
      })
      .then((r) => r?.json())
      .then((data) => {
        if (data) setAssignments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const displayed = filterType
    ? assignments.filter((a) => a.type === filterType)
    : assignments;

  const upcoming = displayed.filter((a) => new Date(a.deadline) >= new Date());
  const overdue = displayed.filter((a) => new Date(a.deadline) < new Date());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">My Assignments</h2>
        <p className="text-gray-400 text-sm">
          {profile ? `Class ${profile.class}-${profile.section}` : "Loading..."} &bull; All tasks assigned to you
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: assignments.length, cls: "bg-navy text-white" },
          { label: "Upcoming", value: upcoming.length, cls: "bg-green-500 text-white" },
          { label: "Due Today", value: assignments.filter((a) => deadlineStatus(a.deadline).label === "Due today!").length, cls: "bg-orange text-white" },
          { label: "Overdue", value: overdue.length, cls: "bg-red-500 text-white" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${s.cls}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {(["", "homework", "assignment"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === t
                ? "bg-navy text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-navy/40"
            }`}
          >
            {t === "" ? "All" : t === "homework" ? "📝 Homework" : "📋 Assignments"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          Loading assignments...
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-gray-500 font-medium">No assignments found</p>
          <p className="text-gray-400 text-sm mt-1">Your teacher hasn&apos;t assigned anything yet.</p>
        </div>
      ) : (
        <>
          {/* Overdue section */}
          {overdue.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                Overdue ({overdue.length})
              </h3>
              {overdue.map((a) => <AssignmentCard key={a._id} assignment={a} />)}
            </div>
          )}

          {/* Upcoming section */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Upcoming ({upcoming.length})
              </h3>
              {upcoming.map((a) => <AssignmentCard key={a._id} assignment={a} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AssignmentCard({ assignment: a }: { assignment: Assignment }) {
  const status = deadlineStatus(a.deadline);
  const tc = typeConfig[a.type];

  return (
    <div className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-sm ${
      status.urgent ? "border-orange/30" : "border-gray-100"
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
          a.type === "homework" ? "bg-orange/10" : "bg-navy/10"
        }`}>
          {tc.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tc.bg}`}>
              {tc.label}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-medium">
              {a.subject}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-navy text-base">{a.title}</h3>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">{a.description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400">Assigned by</p>
              <p className="text-sm font-medium text-gray-700">{a.assignedBy?.name ?? "Teacher"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Deadline</p>
              <p className="text-sm font-semibold text-gray-700">
                {new Date(a.deadline).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${status.cls}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
