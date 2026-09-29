"use client";

import { useEffect, useState } from "react";

type Template = {
  id: string;
  name: string;
  backgroundColor: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  buttonStyle: "rounded" | "square" | "pill";
  premiumOnly: boolean;
  active: boolean;
};

const BLANK: Omit<Template, "id"> = {
  name: "",
  backgroundColor: "#f4f7f0",
  buttonColor: "#123524",
  buttonTextColor: "#ffffff",
  textColor: "#0d2a1c",
  buttonStyle: "rounded",
  premiumOnly: false,
  active: true,
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/templates");
    if (res.ok) setTemplates(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not create template");
      return;
    }
    setForm(BLANK);
    load();
  }

  async function updateTemplate(id: string, data: Partial<Template>) {
    await fetch(`/api/admin/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load();
  }

  async function deleteTemplate(id: string, name: string) {
    if (!confirm(`Delete template "${name}"?`)) return;
    await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Templates</h1>
      <p className="mt-1 text-sm text-slate-500">
        Theme presets users can apply from their Appearance page.
      </p>

      <form onSubmit={createTemplate} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 p-6 sm:grid-cols-2">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Template name"
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <label className="text-xs font-medium text-slate-600">
          Background
          <input
            type="color"
            value={form.backgroundColor}
            onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
            className="mt-1 h-9 w-full"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Button color
          <input
            type="color"
            value={form.buttonColor}
            onChange={(e) => setForm({ ...form, buttonColor: e.target.value })}
            className="mt-1 h-9 w-full"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Button text color
          <input
            type="color"
            value={form.buttonTextColor}
            onChange={(e) => setForm({ ...form, buttonTextColor: e.target.value })}
            className="mt-1 h-9 w-full"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Text color
          <input
            type="color"
            value={form.textColor}
            onChange={(e) => setForm({ ...form, textColor: e.target.value })}
            className="mt-1 h-9 w-full"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Button style
          <select
            value={form.buttonStyle}
            onChange={(e) => setForm({ ...form, buttonStyle: e.target.value as any })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="rounded">Rounded</option>
            <option value="pill">Pill</option>
            <option value="square">Square</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={form.premiumOnly}
            onChange={(e) => setForm({ ...form, premiumOnly: e.target.checked })}
          />
          Premium only
        </label>
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 sm:col-span-2"
        >
          {saving ? "Creating..." : "Create template"}
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && templates.length === 0 && (
          <p className="text-sm text-slate-500">No templates yet.</p>
        )}
        {templates.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg"
                style={{ backgroundColor: t.backgroundColor, border: "1px solid #e2e8f0" }}
              >
                <div
                  className="m-1.5 h-3 rounded"
                  style={{ backgroundColor: t.buttonColor }}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-slate-500">
                  {t.premiumOnly ? "Premium only" : "Available to everyone"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateTemplate(t.id, { active: !t.active })}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  t.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                }`}
              >
                {t.active ? "Active" : "Hidden"}
              </button>
              <button
                onClick={() => deleteTemplate(t.id, t.name)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
