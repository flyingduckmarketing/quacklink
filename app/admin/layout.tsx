import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  if (!session) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      <aside className="w-56 shrink-0 border-r border-slate-100 px-4 py-8">
        <Link href="/" className="text-lg font-bold text-brand-600">
          🦆 QuackLink
        </Link>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
        <nav className="mt-6 flex flex-col gap-1 text-sm">
          <Link href="/admin/users" className="rounded-lg px-3 py-2 hover:bg-slate-100">
            Users
          </Link>
          <Link href="/admin/subscriptions" className="rounded-lg px-3 py-2 hover:bg-slate-100">
            Subscriptions
          </Link>
          <Link href="/admin/templates" className="rounded-lg px-3 py-2 hover:bg-slate-100">
            Templates
          </Link>
          <Link href="/dashboard" className="mt-4 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100">
            ← Back to app
          </Link>
        </nav>
      </aside>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
