"use client";

import { useEffect, useState } from "react";

type Report = {
  id: string;
  type: "LINK" | "PROFILE";
  reason: string | null;
  status: string;
  createdAt: string;
  user: { id: string; username: string; email: string; suspended: boolean };
  link: { id: string; title: string; url: string } | null;
};

const TABS = ["OPEN", "RESOLVED", "DISMISSED", "ALL"] as const;

export default function AdminReportsPage() {
  const [status, setStatus] = useState<(typeof TABS)[number]>("OPEN");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/reports?status=${status}`);
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [status]);

  async function act(id: string, action: string) {
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-slate-500">Review and moderate reported profiles and links.</p>

      <div className="mt-6 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === tab ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && reports.length === 0 && (
          <p className="text-sm text-slate-500">No reports here.</p>
        )}
        {reports.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  {r.type === "LINK" ? "Link report" : "Profile report"} on @{r.user.username}
                  {r.user.suspended && <span className="ml-2 text-xs text-red-600">(suspended)</span>}
                </p>
                {r.link && (
                  <p className="text-xs text-slate-500">
                    {r.link.title} — {r.link.url}
                  </p>
                )}
                {r.reason && <p className="mt-1 text-sm text-slate-700">"{r.reason}"</p>}
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleString()} · {r.status}
                </p>
              </div>
              {r.status === "OPEN" && (
                <div className="flex flex-wrap gap-2">
                  {r.link && (
                    <button
                      onClick={() => act(r.id, "delete_link")}
                      className="rounded-full border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete link
                    </button>
                  )}
                  <button
                    onClick={() => act(r.id, "ban_profile")}
                    className="rounded-full border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Suspend profile
                  </button>
                  <button
                    onClick={() => act(r.id, "resolve")}
                    className="rounded-full border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-50"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => act(r.id, "dismiss")}
                    className="rounded-full border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-50"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
