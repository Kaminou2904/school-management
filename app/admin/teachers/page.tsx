"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

interface Branch { _id: string; name: string; }
interface Teacher {
  _id: string;
  name: string;
  email: string;
  subjects: string[];
  branch: Branch;
  isActive: boolean;
}

const emptyForm = { name: "", email: "", password: "", subjects: "", branch: "", isActive: true };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterBranch, setFilterBranch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => {
    const q = filterBranch ? `?branch=${filterBranch}` : "";
    fetch(`/api/teachers${q}`).then((r) => r.json()).then(setTeachers);
  };

  useEffect(() => {
    fetch("/api/branches").then((r) => r.json()).then(setBranches);
  }, []);

  useEffect(() => { load(); }, [filterBranch]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, branch: branches[0]?._id ?? "" });
    setShowModal(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({
      name: t.name,
      email: t.email,
      password: "",
      subjects: t.subjects.join(", "),
      branch: t.branch?._id ?? "",
      isActive: t.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (!payload.password) delete (payload as { password?: string }).password;

    const url = editing ? `/api/teachers/${editing._id}` : "/api/teachers";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Teachers</h2>
          <p className="text-gray-400 text-sm">Manage teacher accounts across all branches</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-orange hover:bg-orange-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          + Add Teacher
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">All Branches</option>
          {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 font-semibold text-gray-500">Name</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Email</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Subjects</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Branch</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                  No teachers found.
                </td>
              </tr>
            ) : (
              teachers.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-navy">{t.name}</td>
                  <td className="px-5 py-3 text-gray-600">{t.email}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{t.subjects?.join(", ") || "—"}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-navy/10 text-navy px-2.5 py-1 rounded-full">
                      {t.branch?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      t.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => openEdit(t)} className="text-navy hover:text-orange text-xs font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(t._id)} className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Teacher" : "Add Teacher"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Teacher's name" },
              { label: "Email", key: "email", type: "email", placeholder: "teacher@school.com" },
              { label: editing ? "New Password (leave blank to keep)" : "Password", key: "password", type: "password", placeholder: "password123" },
              { label: "Subjects (comma-separated)", key: "subjects", type: "text", placeholder: "Math, Physics" },
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Branch</label>
              <select
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="">Select branch</option>
                {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="ta" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-navy" />
              <label htmlFor="ta" className="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-navy text-white font-semibold py-2.5 rounded-xl hover:bg-navy-light disabled:opacity-60 cursor-pointer">
                {loading ? "Saving..." : editing ? "Update" : "Add Teacher"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
