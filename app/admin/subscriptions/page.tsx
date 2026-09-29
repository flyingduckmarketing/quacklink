"use client";

import { useEffect, useState } from "react";

type AdminSubscription = {
  id: string;
  provider: string;
  providerSubId: string | null;
  status: string;
  currentPeriodEnd: string | null;
  createdAt: string;
  user: { username: string; email: string; plan: string };
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600",
  CANCELLED: "bg-slate-100 text-slate-600",
  PAST_DUE: "bg-amber-50 text-amber-600",
  EXPIRED: "bg-red-50 text-red-600",
};

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (provider) params.set("provider", provider);
    setLoading(true);
    fetch(`/api/admin/subscriptions?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSubs(data))
      .finally(() => setLoading(false));
  }, [status, provider]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <p className="mt-1 text-sm text-slate-500">All Razorpay and PayPal subscription records.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All providers</option>
          <option value="RAZORPAY">Razorpay</option>
          <option value="PAYPAL">PayPal</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="PAST_DUE">Past due</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Provider</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Renews / Ended</th>
              <th className="py-2 pr-4">Started</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="py-4 text-slate-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && subs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-slate-500">
                  No subscriptions found.
                </td>
              </tr>
            )}
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">
                  <p className="font-medium">@{s.user.username}</p>
                  <p className="text-xs text-slate-500">{s.user.email}</p>
                </td>
                <td className="py-3 pr-4">{s.provider === "RAZORPAY" ? "Razorpay" : "PayPal"}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[s.status] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-slate-500">
                  {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "—"}
                </td>
                <td className="py-3 pr-4 text-xs text-slate-500">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
