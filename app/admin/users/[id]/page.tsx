"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type UserInfo = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  plan: string;
  role: string;
  suspended: boolean;
};

type LinkItem = {
  id: string;
  title: string;
  url: string;
  kind: "LINK" | "SOCIAL";
  active: boolean;
};

type ThemeData = {
  backgroundColor: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  buttonStyle: "rounded" | "square" | "pill";
  backgroundImage: string | null;
};

const DEFAULT_THEME: ThemeData = {
  backgroundColor: "#f4f7f0",
  buttonColor: "#123524",
  buttonTextColor: "#ffffff",
  textColor: "#0d2a1c",
  buttonStyle: "rounded",
  backgroundImage: null,
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserInfo | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [theme, setTheme] = useState<ThemeData>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [userRes, linksRes, themeRes] = await Promise.all([
      fetch(`/api/admin/users/${userId}`),
      fetch(`/api/admin/users/${userId}/links`),
      fetch(`/api/admin/users/${userId}/theme`),
    ]);
    if (userRes.ok) setUser(await userRes.json());
    if (linksRes.ok) setLinks(await linksRes.json());
    if (themeRes.ok) {
      const data = await themeRes.json();
      if (data) setTheme({ ...DEFAULT_THEME, ...data });
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [userId]);

  async function toggleLinkActive(link: LinkItem) {
    await fetch(`/api/admin/users/${userId}/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !link.active }),
    });
    load();
  }

  async function deleteLink(id: string) {
    if (!confirm("Delete this link?")) return;
    await fetch(`/api/admin/users/${userId}/links/${id}`, { method: "DELETE" });
    load();
  }

  async function saveTheme() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/users/${userId}/theme`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save theme");
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;
  if (!user) return <p className="text-sm text-red-600">User not found.</p>;

  return (
    <div>
      <Link href="/admin/users" className="text-sm text-brand-600 hover:underline">
        ← Back to users
      </Link>
      <h1 className="mt-2 text-2xl font-bold">@{user.username}</h1>
      <p className="text-sm text-slate-500">
        {user.email} · {user.plan} · {user.role}
        {user.suspended && <span className="ml-2 text-red-600">Suspended</span>}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Links</h2>
          <p className="text-xs text-slate-500">Hide or delete this user's links directly.</p>
          <ul className="mt-3 space-y-2">
            {links.length === 0 && <p className="text-sm text-slate-500">No links.</p>}
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {link.title}
                    {link.kind === "SOCIAL" && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase text-slate-500">
                        Social
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{link.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLinkActive(link)}
                    className="rounded-full border border-slate-300 px-2.5 py-1 text-xs hover:bg-slate-50"
                  >
                    {link.active ? "Active" : "Hidden"}
                  </button>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="rounded-full border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900">Theme</h2>
          <p className="text-xs text-slate-500">
            Overrides apply regardless of this user's plan — useful for fixing a broken page.
          </p>
          <div className="mt-3 space-y-3">
            <label className="block text-sm font-medium">
              Background color
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                className="mt-1 h-9 w-full"
              />
            </label>
            <label className="block text-sm font-medium">
              Button color
              <input
                type="color"
                value={theme.buttonColor}
                onChange={(e) => setTheme({ ...theme, buttonColor: e.target.value })}
                className="mt-1 h-9 w-full"
              />
            </label>
            <label className="block text-sm font-medium">
              Text color
              <input
                type="color"
                value={theme.textColor}
                onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                className="mt-1 h-9 w-full"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              onClick={saveTheme}
              disabled={saving}
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save theme"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
