"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type LinkItem = {
  id: string;
  title: string;
  url: string;
  emoji: string | null;
  active: boolean;
  clicks: number;
};

export default function LinksPage() {
  const { data: session } = useSession();
  const plan = (session?.user as any)?.plan ?? "FREE";

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [emoji, setEmoji] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadLinks() {
    const res = await fetch("/api/links");
    if (res.ok) setLinks(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadLinks();
  }, []);

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, emoji: emoji || undefined }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add link");
      return;
    }
    setTitle("");
    setUrl("");
    setEmoji("");
    loadLinks();
  }

  async function toggleActive(link: LinkItem) {
    await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !link.active }),
    });
    loadLinks();
  }

  async function removeLink(id: string) {
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    loadLinks();
  }

  const limitReached = plan === "FREE" && links.length >= 5;

  return (
    <div>
      <h1 className="text-2xl font-bold">Your links</h1>
      <p className="mt-1 text-sm text-slate-500">
        {plan === "FREE"
          ? `${links.length}/5 links used on the Free plan.`
          : "Unlimited links on Premium."}
      </p>

      <form onSubmit={addLink} className="mt-6 flex flex-wrap gap-2">
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="🔗"
          className="w-16 rounded-lg border border-slate-300 px-3 py-2 text-center"
          maxLength={4}
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Link title"
          required
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          required
          type="url"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={limitReached}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add link
        </button>
      </form>
      {limitReached && (
        <p className="mt-2 text-sm text-amber-600">
          You've reached the Free plan limit of 5 links.{" "}
          <a href="/dashboard/billing" className="font-medium underline">
            Upgrade to Premium
          </a>{" "}
          for unlimited links.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-8 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && links.length === 0 && (
          <p className="text-sm text-slate-500">No links yet. Add your first one above.</p>
        )}
        {links.map((link) => (
          <li
            key={link.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{link.emoji || "🔗"}</span>
              <div>
                <p className="font-medium">{link.title}</p>
                <p className="text-xs text-slate-500">{link.url}</p>
                {plan === "PREMIUM" && (
                  <p className="text-xs text-slate-400">{link.clicks} clicks</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(link)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
              >
                {link.active ? "Active" : "Hidden"}
              </button>
              <button
                onClick={() => removeLink(link.id)}
                className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
