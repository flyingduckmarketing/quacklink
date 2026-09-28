"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

export default function AppearancePage() {
  const { data: session } = useSession();
  const isPremium = (session?.user as any)?.plan === "PREMIUM";

  const [theme, setTheme] = useState<ThemeData>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/theme")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTheme({ ...DEFAULT_THEME, ...data });
      });
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/theme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    });
    setSaving(false);
  }

  const buttonRadius =
    theme.buttonStyle === "pill" ? "9999px" : theme.buttonStyle === "square" ? "4px" : "12px";

  return (
    <div>
      <h1 className="text-2xl font-bold">Appearance</h1>
      <p className="mt-1 text-sm text-slate-500">
        Customize how your public page looks.{" "}
        {!isPremium && (
          <>
            Free plan uses the default theme —{" "}
            <a href="/dashboard/billing" className="font-medium text-brand-600 underline">
              upgrade to Premium
            </a>{" "}
            to unlock colors, fonts, and backgrounds.
          </>
        )}
      </p>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div className={`space-y-4 ${!isPremium ? "pointer-events-none opacity-50" : ""}`}>
          <label className="block text-sm font-medium">
            Background color
            <input
              type="color"
              value={theme.backgroundColor}
              onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
              className="mt-1 h-10 w-full"
            />
          </label>
          <label className="block text-sm font-medium">
            Button color
            <input
              type="color"
              value={theme.buttonColor}
              onChange={(e) => setTheme({ ...theme, buttonColor: e.target.value })}
              className="mt-1 h-10 w-full"
            />
          </label>
          <label className="block text-sm font-medium">
            Button text color
            <input
              type="color"
              value={theme.buttonTextColor}
              onChange={(e) => setTheme({ ...theme, buttonTextColor: e.target.value })}
              className="mt-1 h-10 w-full"
            />
          </label>
          <label className="block text-sm font-medium">
            Text color
            <input
              type="color"
              value={theme.textColor}
              onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
              className="mt-1 h-10 w-full"
            />
          </label>
          <label className="block text-sm font-medium">
            Button style
            <select
              value={theme.buttonStyle}
              onChange={(e) => setTheme({ ...theme, buttonStyle: e.target.value as any })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="rounded">Rounded</option>
              <option value="pill">Pill</option>
              <option value="square">Square</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Background image URL
            <input
              type="url"
              placeholder="https://..."
              value={theme.backgroundImage ?? ""}
              onChange={(e) => setTheme({ ...theme, backgroundImage: e.target.value || null })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        <div
          className="rounded-2xl border border-slate-200 p-6"
          style={{
            backgroundColor: theme.backgroundColor,
            backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : undefined,
            backgroundSize: "cover",
          }}
        >
          <p className="text-center text-xs font-medium uppercase tracking-wide" style={{ color: theme.textColor }}>
            Preview
          </p>
          <div className="mt-4 space-y-3">
            {["My website", "Latest video", "Newsletter"].map((label) => (
              <div
                key={label}
                className="py-3 text-center text-sm font-medium shadow-sm"
                style={{
                  backgroundColor: theme.buttonColor,
                  color: theme.buttonTextColor,
                  borderRadius: buttonRadius,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
