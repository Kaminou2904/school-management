"use client";
import { useEffect, useState } from "react";

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceRecord {
  _id: string;
  date: string;
  status: AttendanceStatus;
  class: string;
  section: string;
  markedBy: { name: string };
}

const statusStyle: Record<AttendanceStatus, string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-600",
  late: "bg-yellow-100 text-yellow-700",
};

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attendance")
      .then((r) => r.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      });
  }, []);

  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const pct = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">My Attendance</h2>
        <p className="text-gray-400 text-sm">Your full attendance history</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: records.length, cls: "bg-navy text-white" },
          { label: "Present", value: present, cls: "bg-green-500 text-white" },
          { label: "Absent", value: absent, cls: "bg-red-500 text-white" },
          { label: "Late", value: late, cls: "bg-yellow-500 text-white" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl p-4 text-center ${item.cls}`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-sm opacity-80">{item.label}</p>
          </div>
        ))}
      </div>

      {records.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Attendance Rate</span>
            <span className={`font-bold ${pct >= 75 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"}`}>
              {pct}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 font-semibold text-gray-500">Date</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Class</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Marked By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400">Loading...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {new Date(r.date).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {r.class}-{r.section}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyle[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{r.markedBy?.name ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
