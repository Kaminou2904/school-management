"use client";
import { useEffect, useState } from "react";

interface Student {
  _id: string;
  name: string;
  email: string;
  class: string;
  section: string;
  rollNumber: string;
  isActive: boolean;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (filterClass) params.set("class", filterClass);
    if (filterSection) params.set("section", filterSection);
    fetch(`/api/students?${params}`).then((r) => r.json()).then(setStudents);
  };

  useEffect(() => { load(); }, [filterClass, filterSection]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">My Students</h2>
        <p className="text-gray-400 text-sm">Students enrolled in your branch</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">All Classes</option>
          {["1","2","3","4","5","6","7","8","9","10","11","12"].map((c) => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">All Sections</option>
          {["A","B","C","D"].map((s) => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
        <span className="px-3 py-2.5 bg-navy/10 text-navy text-sm rounded-xl font-medium">
          {students.length} student{students.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 font-semibold text-gray-500">#</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Name</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Email</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Class</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Roll No.</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((s, i) => (
                <tr key={s._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-navy">{s.name}</td>
                  <td className="px-5 py-3 text-gray-500">{s.email}</td>
                  <td className="px-5 py-3">
                    <span className="bg-orange/10 text-orange-dark text-xs px-2.5 py-1 rounded-full font-medium">
                      {s.class}-{s.section}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{s.rollNumber}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
