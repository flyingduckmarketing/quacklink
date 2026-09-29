"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  plan: string;
  role: string;
  suspended: boolean;
  createdAt: string;
  _count: { links: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(q = "") {
    setLoading(true);
    const res = await fetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateUser(id: string, data: Partial<Pick<AdminUser, "plan" | "role" | "suspended">>) {
    setError("");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Update failed");
      return;
    }
    load(query);
  }

  async function deleteUser(id: string, username: string) {
    if (!confirm(`Permanently delete @${username}? This cannot be undone.`)) return;
    setError("");
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Delete failed");
      return;
    }
    load(query);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-1 text-sm text-slate-500">Manage plans, admin access, and suspensions.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(query);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or email"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Search
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Links</th>
              <th className="py-2 pr-4">Plan</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Joined</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-4 text-slate-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">
                  <p className="font-medium">@{u.username}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="py-3 pr-4">{u._count.links}</td>
                <td className="py-3 pr-4">
                  <select
                    value={u.plan}
                    onChange={(e) => updateUser(u.id, { plan: e.target.value as any })}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  >
                    <option value="FREE">Free</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </td>
                <td className="py-3 pr-4">
                  <select
                    value={u.role}
                    onChange={(e) => updateUser(u.id, { role: e.target.value as any })}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => updateUser(u.id, { suspended: !u.suspended })}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.suspended
                        ? "bg-red-50 text-red-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {u.suspended ? "Suspended" : "Active"}
                  </button>
                </td>
                <td className="py-3 pr-4 text-xs text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => deleteUser(u.id, u.username)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
