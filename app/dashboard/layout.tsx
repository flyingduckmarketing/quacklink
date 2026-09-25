import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const username = (session.user as any).username;
  const plan = (session.user as any).plan;

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl">
      <aside className="w-56 shrink-0 border-r border-slate-100 px-4 py-8">
        <Link href="/" className="text-lg font-bold text-brand-600">
          🦆 QuackLink
        </Link>
        <nav className="mt-8 flex flex-col gap-1 text-sm">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-slate-100">
            Links
          </Link>
          <Link href="/dashboard/appearance" className="rounded-lg px-3 py-2 hover:bg-slate-100">
            Appearance
          </Link>
          <Link href="/dashboard/billing" className="rounded-lg px-3 py-2 hover:bg-slate-100">
            Billing {plan === "PREMIUM" ? "✨" : ""}
          </Link>
          <a
            href={`/${username}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-3 py-2 hover:bg-slate-100"
          >
            View my page ↗
          </a>
        </nav>
        <div className="mt-8">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
