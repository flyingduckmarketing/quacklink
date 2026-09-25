import Link from "next/link";
import { PRICING } from "@/lib/plans";

export default function HomePage() {
  return (
    <main>
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold text-brand-600">🦆 QuackLink</span>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-slate-100">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Sign up free
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          One link for everything you create.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Build a beautiful, customizable link-in-bio page in minutes. Free to
          start, upgrade for unlimited links, custom themes, and analytics.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Claim your QuackLink
          </Link>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-4xl px-6 pb-24">
        <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
        <p className="mt-2 text-center text-slate-600">
          Start for free. Upgrade whenever you're ready.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-8">
            <h3 className="text-lg font-semibold">{PRICING.FREE.name}</h3>
            <p className="mt-2 text-3xl font-bold">
              ₹0<span className="text-base font-normal text-slate-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {PRICING.FREE.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-brand-600">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-medium hover:bg-slate-50"
            >
              Get started
            </Link>
          </div>

          <div className="rounded-2xl border-2 border-brand-600 p-8 shadow-lg">
            <h3 className="text-lg font-semibold text-brand-600">
              {PRICING.PREMIUM.name}
            </h3>
            <p className="mt-2 text-3xl font-bold">
              ₹{PRICING.PREMIUM.priceINR}
              <span className="text-base font-normal text-slate-500">/mo</span>
            </p>
            <p className="text-xs text-slate-500">
              or ${PRICING.PREMIUM.priceUSD}/mo via PayPal
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {PRICING.PREMIUM.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-brand-600">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} QuackLink
      </footer>
    </main>
  );
}
