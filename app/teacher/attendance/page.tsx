"use client";
import { useEffect, useState } from "react";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
}

type Status = "present" | "absent" | "late";

interface AttendanceRecord {
  studentId: string;
  status: Status;
}

export default function TeacherAttendancePage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [cls, setCls] = useState("");
  const [section, setSection] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, Status>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadStudents = () => {
    if (!cls || !section) return;
    const params = new URLSearchParams({ class: cls, section });
    fetch(`/api/students?${params}`)
      .then((r) => r.json())
      .then((data: Student[]) => {
        setStudents(data);
        // Load existing attendance for this date/class/section
        const ap = new URLSearchParams({ date, class: cls, section });
        fetch(`/api/attendance?${ap}`)
          .then((r) => r.json())
          .then((att: { student: { _id: string }; status: Status }[]) => {
            const map: Record<string, Status> = {};
            att.forEach((a) => { map[a.student._id] = a.status; });
            // default unrecorded to "present"
            data.forEach((s) => { if (!map[s._id]) map[s._id] = "present"; });
            setRecords(map);
          });
      });
  };

  useEffect(() => { loadStudents(); }, [cls, section, date]);

  const setStatus = (studentId: string, status: Status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!cls || !section || students.length === 0) return;
    setSaving(true);
    setSaved(false);
    const body: { records: AttendanceRecord[]; date: string; class: string; section: string } = {
      records: students.map((s) => ({ studentId: s._id, status: records[s._id] || "present" })),
      date,
      class: cls,
      section,
    };
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const statusConfig: Record<Status, { label: string; bg: string; text: string; active: string }> = {
    present: { label: "Present", bg: "bg-green-100", text: "text-green-700", active: "bg-green-500 text-white" },
    absent: { label: "Absent", bg: "bg-red-100", text: "text-red-600", active: "bg-red-500 text-white" },
    late: { label: "Late", bg: "bg-yellow-100", text: "text-yellow-700", active: "bg-yellow-500 text-white" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Mark Attendance</h2>
        <p className="text-gray-400 text-sm">Select class and date, then mark each student</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
            <select
              value={cls}
              onChange={(e) => setCls(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="">Select class</option>
              {["1","2","3","4","5","6","7","8","9","10","11","12"].map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="">Select section</option>
              {["A","B","C","D"].map((s) => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!cls || !section ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-gray-400">Select a class and section to load students</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No students found in Class {cls}-{section}</p>
        </div>
      ) : (
        <>
          {/* Quick mark all */}
          <div className="flex gap-3 items-center flex-wrap">
            <span className="text-sm font-medium text-gray-600">Mark all as:</span>
            {(["present", "absent", "late"] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  const all: Record<string, Status> = {};
                  students.forEach((st) => { all[st._id] = s; });
                  setRecords(all);
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${statusConfig[s].bg} ${statusConfig[s].text} hover:opacity-80`}
              >
                All {statusConfig[s].label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 font-semibold text-gray-500">#</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Student</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Roll No.</th>
                  <th className="px-5 py-3 font-semibold text-gray-500">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s, i) => {
                  const current = records[s._id] || "present";
                  return (
                    <tr key={s._id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-navy">{s.name}</td>
                      <td className="px-5 py-3 text-gray-500">{s.rollNumber}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {(["present", "absent", "late"] as Status[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => setStatus(s._id, st)}
                              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                                current === st
                                  ? statusConfig[st].active
                                  : `${statusConfig[st].bg} ${statusConfig[st].text} opacity-50 hover:opacity-100`
                              }`}
                            >
                              {statusConfig[st].label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {students.length} student{students.length !== 1 ? "s" : ""} &bull; Class {cls}-{section}
            </p>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-green-600 text-sm font-medium">✓ Attendance saved!</span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange hover:bg-orange-dark text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
