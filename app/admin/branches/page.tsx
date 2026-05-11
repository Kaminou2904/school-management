"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

interface Branch {
  _id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

const empty = { name: "", address: "", phone: "", isActive: true };

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const load = () =>
    fetch("/api/branches").then((r) => r.json()).then(setBranches);

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({ name: b.name, address: b.address, phone: b.phone, isActive: b.isActive });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = editing ? `/api/branches/${editing._id}` : "/api/branches";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this branch?")) return;
    await fetch(`/api/branches/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Branches</h2>
          <p className="text-gray-400 text-sm">Manage all school branches</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-orange hover:bg-orange-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          + Add Branch
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 font-semibold text-gray-500">Branch Name</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Address</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Phone</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-5 py-3 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {branches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  No branches found. Add your first branch.
                </td>
              </tr>
            ) : (
              branches.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-navy">{b.name}</td>
                  <td className="px-5 py-3 text-gray-600">{b.address}</td>
                  <td className="px-5 py-3 text-gray-600">{b.phone}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      b.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-2">
                    <button
                      onClick={() => openEdit(b)}
                      className="text-navy hover:text-orange text-xs font-medium transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Branch" : "Add Branch"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Branch Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder="e.g. Main Campus"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder="Full address"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy"
                placeholder="Contact number"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-navy"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Branch</label>
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
                className="flex-1 bg-navy text-white font-semibold py-2.5 rounded-xl hover:bg-navy-light transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Saving..." : editing ? "Update" : "Add Branch"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
