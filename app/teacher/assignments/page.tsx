"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

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
  createdAt: string;
}

const CLASSES = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const SECTIONS = ["A","B","C","D"];
const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","English","History","Geography","Computer Science","Hindi","Economics","Physical Education","Art"];

const emptyForm = {
  title: "",
  description: "",
  type: "homework" as "homework" | "assignment",
  subject: "",
  class: "",
  section: "",
  deadline: "",
};

function deadlineStatus(deadline: string) {
  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)}d`, cls: "bg-red-100 text-red-600" };
  if (diffDays === 0) return { label: "Due today", cls: "bg-orange/20 text-orange-dark" };
  if (diffDays <= 2) return { label: `Due in ${diffDays}d`, cls: "bg-yellow-100 text-yellow-700" };
  return { label: `Due in ${diffDays}d`, cls: "bg-green-100 text-green-700" };
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (filterClass) params.set("class", filterClass);
    if (filterSection) params.set("section", filterSection);
    fetch(`/api/assignments?${params}`)
      .then((r) => r.json())
      .then(setAssignments);
  };

  useEffect(() => { load(); }, [filterClass, filterSection]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, deadline: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] });
    setShowModal(true);
  };

  const openEdit = (a: Assignment) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description,
      type: a.type,
      subject: a.subject,
      class: a.class,
      section: a.section,
      deadline: new Date(a.deadline).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editing ? `/api/assignments/${editing._id}` : "/api/assignments";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    load();
  };

  const displayed = filterType
    ? assignments.filter((a) => a.type === filterType)
    : assignments;

  const typeConfig = {
    homework: { label: "Homework", bg: "bg-orange/10 text-orange-dark", icon: "📝" },
    assignment: { label: "Assignment", bg: "bg-navy/10 text-navy", icon: "📋" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Assignments & Homework</h2>
          <p className="text-gray-400 text-sm">Assign tasks to students with deadlines</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-orange hover:bg-orange-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          + New Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">All Classes</option>
          {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="">All Sections</option>
          {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
        <div className="flex gap-2">
          {["", "homework", "assignment"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === t
                  ? "bg-navy text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-navy/40"
              }`}
            >
              {t === "" ? "All" : t === "homework" ? "📝 Homework" : "📋 Assignments"}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-gray-500 font-medium">No assignments yet</p>
          <p className="text-gray-400 text-sm mt-1">Create an assignment or homework to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map((a) => {
            const status = deadlineStatus(a.deadline);
            const tc = typeConfig[a.type];
            return (
              <div key={a._id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tc.bg}`}>
                      {tc.icon} {tc.label}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                      Class {a.class}-{a.section}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(a)}
                      className="text-xs text-navy hover:text-orange font-medium px-2 py-1 rounded-lg hover:bg-orange/10 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Title & subject */}
                <div>
                  <h3 className="font-semibold text-navy text-base leading-snug">{a.title}</h3>
                  <p className="text-xs text-orange font-medium mt-0.5">{a.subject}</p>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{a.description}</p>

                {/* Deadline */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400">Deadline</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(a.deadline).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          title={editing ? "Edit Assignment" : "New Assignment"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["homework", "assignment"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      form.type === t
                        ? "bg-navy text-white border-navy"
                        : "bg-white text-gray-500 border-gray-200 hover:border-navy/40"
                    }`}
                  >
                    {t === "homework" ? "📝 Homework" : "📋 Assignment"}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Chapter 5 Exercise"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Instructions</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={3}
                placeholder="Write what students need to do..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy resize-none"
              />
            </div>

            {/* Class & Section */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
                <select
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="">Select</option>
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                <select
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="">Select</option>
                  {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange hover:bg-orange-dark text-white font-semibold py-2.5 rounded-xl disabled:opacity-60 cursor-pointer transition-colors"
              >
                {loading ? "Saving..." : editing ? "Update" : "Assign"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
