"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

interface Notice {
  _id: string;
  title: string;
  message: string;
  targetRole: "teacher" | "student" | "both";
  isActive: boolean;
  createdBy: { name: string };
  createdAt: string;
}

const targetLabel: Record<string, { label: string; color: string }> = {
  teacher: { label: "Teachers", color: "bg-navy/10 text-navy" },
  student: { label: "Students", color: "bg-orange/10 text-orange-dark" },
  both: { label: "Everyone", color: "bg-purple-100 text-purple-700" },
};

const emptyForm = { title: "", message: "", targetRole: "both" as Notice["targetRole"] };

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = () =>
    fetch("/api/notices").then((r) => r.json()).then(setNotices);

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setShowModal(false);
    setForm(emptyForm);
    load();
  };

  const handleToggle = async (id: string) => {
    await fetch(`/api/notices/${id}`, { method: "PATCH" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this notice?")) return;
    await fetch(`/api/notices/${id}`, { method: "DELETE" });
    load();
  };

  const active = notices.filter((n) => n.isActive);
  const dismissed = notices.filter((n) => !n.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Notices</h2>
          <p className="text-gray-400 text-sm">
            Broadcast announcements to teachers or students
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange hover:bg-orange-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          + New Notice
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-full font-medium">
          {active.length} Active
        </span>
        <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-sm rounded-full font-medium">
          {dismissed.length} Dismissed
        </span>
      </div>

      {/* Active notices */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Active
          </h3>
          {active.map((n) => (
            <NoticeCard
              key={n._id}
              notice={n}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Dismissed notices */}
      {dismissed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Dismissed
          </h3>
          {dismissed.map((n) => (
            <NoticeCard
              key={n._id}
              notice={n}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {notices.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">📢</p>
          <p className="text-gray-500 font-medium">No notices yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create a notice to broadcast it to teachers or students.
          </p>
        </div>
      )}

      {showModal && (
        <Modal title="Create Notice" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={100}
                placeholder="e.g. Holiday Notice"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                placeholder="Write your announcement here..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Send to
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["teacher", "student", "both"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, targetRole: role })}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      form.targetRole === role
                        ? "bg-navy text-white border-navy"
                        : "bg-white text-gray-500 border-gray-200 hover:border-navy/40"
                    }`}
                  >
                    {role === "teacher" ? "👨‍🏫 Teachers" : role === "student" ? "🎓 Students" : "👥 Everyone"}
                  </button>
                ))}
              </div>
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
                {loading ? "Posting..." : "Post Notice"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function NoticeCard({
  notice,
  onToggle,
  onDelete,
}: {
  notice: Notice;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const target = targetLabel[notice.targetRole];
  const date = new Date(notice.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all ${
        notice.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${target.color}`}
            >
              {target.label}
            </span>
            {notice.isActive ? (
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                Active
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-medium">
                Dismissed
              </span>
            )}
          </div>
          <h4 className="font-semibold text-navy text-base">{notice.title}</h4>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">{notice.message}</p>
          <p className="text-gray-400 text-xs mt-3">
            By {notice.createdBy?.name} &bull; {date}
          </p>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => onToggle(notice._id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              notice.isActive
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {notice.isActive ? "Dismiss" : "Restore"}
          </button>
          <button
            onClick={() => onDelete(notice._id)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
