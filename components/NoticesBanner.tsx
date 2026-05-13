"use client";
import { useEffect, useState } from "react";

interface Notice {
  _id: string;
  title: string;
  message: string;
  targetRole: string;
  createdBy: { name: string };
  createdAt: string;
}

export default function NoticesBanner() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/notices")
      .then((r) => r.json())
      .then((data: Notice[]) => setNotices(data));

    // Restore locally dismissed IDs from sessionStorage
    const stored = sessionStorage.getItem("dismissed_notices");
    if (stored) setDismissed(new Set(JSON.parse(stored)));
  }, []);

  const dismissLocally = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(id);
      sessionStorage.setItem("dismissed_notices", JSON.stringify([...next]));
      return next;
    });
  };

  const visible = notices.filter((n) => !dismissed.has(n._id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visible.map((n) => (
        <div
          key={n._id}
          className="bg-orange/5 border border-orange/25 rounded-xl px-5 py-4 flex items-start gap-4"
        >
          <span className="text-2xl flex-shrink-0 mt-0.5">📢</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-navy text-sm">{n.title}</p>
            <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{n.message}</p>
            <p className="text-gray-400 text-xs mt-2">
              From Admin &bull;{" "}
              {new Date(n.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => dismissLocally(n._id)}
            title="Dismiss"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0 cursor-pointer"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
