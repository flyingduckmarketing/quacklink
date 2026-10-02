"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/SortableItem";
import ProfilePreview, { type PreviewLink, type PreviewTheme } from "@/components/ProfilePreview";
import { PLATFORM_META, PLATFORM_OPTIONS, type Platform } from "@/lib/socialPlatforms";
import { limitsFor } from "@/lib/plans";

type LinkItem = {
  id: string;
  title: string;
  url: string;
  emoji: string | null;
  kind: "LINK" | "SOCIAL";
  platform: Platform | null;
  active: boolean;
  clicks: number;
};

const DEFAULT_THEME: PreviewTheme = {
  backgroundColor: "#f4f7f0",
  buttonColor: "#123524",
  buttonTextColor: "#ffffff",
  textColor: "#0d2a1c",
  buttonStyle: "rounded",
  backgroundImage: null,
};

export default function LinksPage() {
  const { data: session } = useSession();
  const plan = (session?.user as any)?.plan ?? "FREE";
  const username = (session?.user as any)?.username ?? "";

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [theme, setTheme] = useState<PreviewTheme>(DEFAULT_THEME);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [emoji, setEmoji] = useState("");
  const [socialPlatform, setSocialPlatform] = useState<Platform>("instagram");
  const [socialUrl, setSocialUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function load() {
    const [linksRes, themeRes] = await Promise.all([fetch("/api/links"), fetch("/api/theme")]);
    if (linksRes.ok) setLinks(await linksRes.json());
    if (themeRes.ok) {
      const data = await themeRes.json();
      if (data) setTheme({ ...DEFAULT_THEME, ...data });
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const mainLinks = links.filter((l) => l.kind === "LINK");
  const socialLinks = links.filter((l) => l.kind === "SOCIAL");

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, emoji: emoji || undefined, kind: "LINK" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add link");
      return;
    }
    setTitle("");
    setUrl("");
    setEmoji("");
    load();
  }

  async function addSocial(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: PLATFORM_META[socialPlatform].label,
        url: socialUrl,
        kind: "SOCIAL",
        platform: socialPlatform,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add social icon");
      return;
    }
    setSocialUrl("");
    load();
  }

  async function toggleActive(link: LinkItem) {
    await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !link.active }),
    });
    load();
  }

  async function removeLink(id: string) {
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(link: LinkItem) {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  }

  async function saveEdit(id: string) {
    await fetch(`/api/links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, url: editUrl }),
    });
    setEditingId(null);
    load();
  }

  async function persistOrder(ids: string[]) {
    await fetch("/api/links/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  }

  function handleMainDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = mainLinks.findIndex((l) => l.id === active.id);
    const newIndex = mainLinks.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(mainLinks, oldIndex, newIndex);
    setLinks([...reordered, ...socialLinks]);
    persistOrder(reordered.map((l) => l.id));
  }

  function handleSocialDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = socialLinks.findIndex((l) => l.id === active.id);
    const newIndex = socialLinks.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(socialLinks, oldIndex, newIndex);
    setLinks([...mainLinks, ...reordered]);
    persistOrder(reordered.map((l) => l.id));
  }

  const limitReached = plan === "FREE" && mainLinks.length >= 5;
  const previewLinks: PreviewLink[] = links;
  const showBranding = !limitsFor(plan).removeBranding;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
      <div>
        <h1 className="text-2xl font-bold">Your links</h1>
        <p className="mt-1 text-sm text-slate-500">
          {plan === "FREE"
            ? `${mainLinks.length}/5 links used on the Free plan.`
            : "Unlimited links on Premium."}
        </p>

        {/* Social icon row */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-900">Social icons</h2>
          <p className="text-xs text-slate-500">Shown as a row of icons above your main links.</p>

          <form onSubmit={addSocial} className="mt-3 flex flex-wrap gap-2">
            <select
              value={socialPlatform}
              onChange={(e) => setSocialPlatform(e.target.value as Platform)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              value={socialUrl}
              onChange={(e) => setSocialUrl(e.target.value)}
              placeholder="https://..."
              required
              type="url"
              className="flex-1 min-w-[160px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Add icon
            </button>
          </form>

          {socialLinks.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSocialDragEnd}
            >
              <SortableContext items={socialLinks.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.map((link) => {
                    const meta = link.platform ? PLATFORM_META[link.platform] : PLATFORM_META.other;
                    const Icon = meta.Icon;
                    return (
                      <SortableItem
                        key={link.id}
                        id={link.id}
                        className="flex items-center gap-1 rounded-full border border-slate-200 py-1.5 pl-2 pr-3"
                      >
                        <span className="flex items-center gap-1.5 text-xs">
                          <Icon size={14} />
                          {meta.label}
                        </span>
                        <button
                          onClick={() => removeLink(link.id)}
                          className="ml-1 text-slate-400 hover:text-red-600"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </SortableItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Main links */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-900">Links</h2>
          <form onSubmit={addLink} className="mt-3 flex flex-wrap gap-2">
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
              className="flex-1 min-w-[140px] rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
              type="url"
              className="flex-1 min-w-[140px] rounded-lg border border-slate-300 px-3 py-2"
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

          <div className="mt-4">
            {loading && <p className="text-sm text-slate-500">Loading...</p>}
            {!loading && mainLinks.length === 0 && (
              <p className="text-sm text-slate-500">No links yet. Add your first one above.</p>
            )}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMainDragEnd}>
              <SortableContext items={mainLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-3">
                  {mainLinks.map((link) => (
                    <SortableItem
                      key={link.id}
                      id={link.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"
                    >
                      {editingId === link.id ? (
                        <div className="flex flex-1 flex-wrap items-center gap-2">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 min-w-[120px] rounded-lg border border-slate-300 px-2 py-1 text-sm"
                          />
                          <input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            type="url"
                            className="flex-1 min-w-[120px] rounded-lg border border-slate-300 px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => saveEdit(link.id)}
                            className="rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-full border border-slate-300 px-3 py-1 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-1 items-center gap-3">
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
                              onClick={() => startEdit(link)}
                              className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
                            >
                              Edit
                            </button>
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
                        </>
                      )}
                    </SortableItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-8">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
            Live preview
          </p>
          <ProfilePreview username={username} theme={theme} links={previewLinks} showBranding={showBranding} />
        </div>
      </div>
    </div>
  );
}
