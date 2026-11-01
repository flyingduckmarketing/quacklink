"use client";

import { useState } from "react";

export default function ReportProfileButton({ username }: { username: string }) {
  const [sent, setSent] = useState(false);

  async function handleReport() {
    const reason = window.prompt("What's wrong with this profile? (optional)") ?? "";
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, reason: reason || undefined }),
    });
    if (res.ok) setSent(true);
  }

  if (sent) {
    return <p className="mt-4 text-xs text-slate-400">Thanks — we'll take a look.</p>;
  }

  return (
    <button
      onClick={handleReport}
      className="mt-4 text-xs text-slate-400 underline hover:text-slate-600"
    >
      Report this profile
    </button>
  );
}
