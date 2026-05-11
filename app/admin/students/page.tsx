"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

interface Branch { _id: string; name: string; }
interface Student {
  _id: string;
  name: string;
  email: string;
  class: string;
  section: string;
  rollNumber: string;
  branch: Branch;
  isActive: boolean;
}

const emptyForm = {
  name: "", email: "", password: "", class: "", section: "", rollNumber: "", branch: "", isActive: true
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterBranch, setFilterBranch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (filterBranch) params.set("branch", filterBranch);
    if (filterClass) params.set("class", filterClass);
    fetch(`/api/students?${params}`).then((r) => r.json()).then(setStudents);
  };

  useEffect(() => {
    fetch("/api/branches").then((r) => r.json()).then(setBranches);
  }, []);

  useEffect(() => { load(); }, [filterBranch, filterClass]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, branch: branches[0]?._id ?? "" });
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      name: s.name, email: s.email, password: "",
      class: s.class, section: s.section, rollNumber: s.rollNumber,
      branch: s.branch?._id ?? "", isActive: s.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form };
    if (!payload.password) delete (payload as { password?: string }).password;
    const url = editing ? `/api/students/${editing._id}` : "/api/students";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Students</h2>
          <p className="text-gray-400 text-sm">Manage student accounts across all branches</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-orange hover:bg-orange-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          + Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">All Branches</option>
          {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
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
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 font-semibold text-gray-500">Name</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Email</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Class</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Roll No.</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Branch</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-navy">{s.name}</td>
                  <td className="px-5 py-3 text-gray-600">{s.email}</td>
                  <td className="px-5 py-3 text-gray-600">{s.class}-{s.section}</td>
                  <td className="px-5 py-3 text-gray-500">{s.rollNumber}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-orange/10 text-orange-dark px-2.5 py-1 rounded-full">
                      {s.branch?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => openEdit(s)} className="text-navy hover:text-orange text-xs font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Student" : "Add Student"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Student's name" },
              { label: "Email", key: "email", type: "email", placeholder: "student@school.com" },
              { label: editing ? "New Password (leave blank)" : "Password", key: "password", type: "password", placeholder: "password123" },
              { label: "Roll Number", key: "rollNumber", type: "text", placeholder: "e.g. MC001" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.key !== "password" || !editing}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
                <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy">
                  <option value="">Select</option>
                  {["1","2","3","4","5","6","7","8","9","10","11","12"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy">
                  <option value="">Select</option>
                  {["A","B","C","D"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Branch</label>
              <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy">
                <option value="">Select branch</option>
                {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="sa" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-navy" />
              <label htmlFor="sa" className="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-navy text-white font-semibold py-2.5 rounded-xl hover:bg-navy-light disabled:opacity-60 cursor-pointer">
                {loading ? "Saving..." : editing ? "Update" : "Add Student"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
