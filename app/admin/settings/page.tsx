"use client";

import { useEffect, useState } from "react";

type Settings = {
  freePlanLinkLimit: number;
  premiumPriceINR: number;
  premiumPriceUSD: number;
  signupsEnabled: boolean;
  maintenanceMode: boolean;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setSettings(data));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not save settings");
      return;
    }
    setSaved(true);
  }

  if (!settings) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">Platform settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Changes apply immediately, platform-wide.
      </p>

      <div className="mt-6 space-y-5">
        <label className="block text-sm font-medium">
          Free plan link limit
          <input
            type="number"
            min={1}
            value={settings.freePlanLinkLimit}
            onChange={(e) => setSettings({ ...settings, freePlanLinkLimit: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Premium price (INR/mo)
            <input
              type="number"
              min={0}
              value={settings.premiumPriceINR}
              onChange={(e) => setSettings({ ...settings, premiumPriceINR: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Premium price (USD/mo)
            <input
              type="number"
              min={0}
              value={settings.premiumPriceUSD}
              onChange={(e) => setSettings({ ...settings, premiumPriceUSD: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          These control the displayed price only. The amount actually charged
          is set by the Plan ID configured in your Razorpay/PayPal dashboard —
          update both together.
        </p>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={settings.signupsEnabled}
            onChange={(e) => setSettings({ ...settings, signupsEnabled: e.target.checked })}
          />
          Signups enabled
        </label>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
          />
          Maintenance mode (blocks new signups, shows a banner on the landing page)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Saved.</p>}
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </div>
  );
}
