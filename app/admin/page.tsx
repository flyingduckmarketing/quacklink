"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Metrics = {
  totalUsers: number;
  premiumUsers: number;
  suspendedUsers: number;
  newUsersLast7Days: number;
  totalLinks: number;
  totalClicks: number;
  activeSubscriptions: number;
  openReports: number;
};

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="rounded-2xl border border-slate-200 p-5 hover:bg-slate-50">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setMetrics(data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Overview</h1>
      <p className="mt-1 text-sm text-slate-500">Platform-wide stats at a glance.</p>

      {!metrics && <p className="mt-6 text-sm text-slate-500">Loading...</p>}

      {metrics && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={metrics.totalUsers} href="/admin/users" />
          <StatCard label="Premium users" value={metrics.premiumUsers} />
          <StatCard label="Suspended users" value={metrics.suspendedUsers} />
          <StatCard label="New users (7d)" value={metrics.newUsersLast7Days} />
          <StatCard label="Total links" value={metrics.totalLinks} />
          <StatCard label="Total clicks" value={metrics.totalClicks} />
          <StatCard label="Active subscriptions" value={metrics.activeSubscriptions} href="/admin/subscriptions" />
          <StatCard label="Open reports" value={metrics.openReports} href="/admin/reports" />
        </div>
      )}
    </div>
  );
}
