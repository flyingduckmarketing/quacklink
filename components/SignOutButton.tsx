"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
    >
      Log out
    </button>
  );
}
