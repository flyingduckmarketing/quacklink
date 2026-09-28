import Link from "next/link";
import { Zap, Palette, BarChart3, Star, Check, ArrowRight } from "lucide-react";
import { PRICING } from "@/lib/plans";
import PhoneMockup from "@/components/PhoneMockup";

const FEATURES = [
  {
    icon: Zap,
    title: "Simple & fast setup",
    description: "Claim your QuackLink and go live in under a minute — no design skills, no code.",
  },
  {
    icon: Palette,
    title: "Customizable & branded",
    description: "Match your colors, fonts, and background so your page feels like yours, not a template.",
  },
  {
    icon: BarChart3,
    title: "Analytics & insights",
    description: "See exactly which links get clicked, so you know what's actually working.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Content Creator",
    quote: "QuackLink boosted my engagement. Everything my audience needs is finally in one place.",
  },
  {
    name: "Marcus T.",
    role: "Musician",
    quote: "Set up my page in five minutes and started seeing clicks the same day. Genuinely simple.",
  },
  {
    name: "Priya R.",
    role: "Small Business Owner",
    quote: "The analytics alone are worth the upgrade — I can finally see what my customers care about.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute left-1/2 top-[-10rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-600/20 blur-[100px]" />

        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-2xl">🦆</span> QuackLink
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-200 hover:text-white sm:px-4"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 sm:px-4"
            >
              Sign up free
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 sm:pb-28 sm:pt-16 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-white/20">
              🦆 Your digital pond, made simple
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              One link for <span className="text-brand-400">everything</span> you create.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-slate-300 lg:mx-0">
              Centralize every platform, product, and post into one beautiful page — built in
              minutes, free to start.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 sm:w-auto"
              >
                Create your QuackLink — it's free
                <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#demo"
                className="inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-base font-semibold text-slate-200 ring-1 ring-white/20 transition hover:bg-white/5 sm:w-auto"
              >
                See live demo
              </a>
            </div>
            <p className="mt-5 text-sm text-slate-400">No credit card required · Free forever plan</p>
          </div>

          <div id="demo" className="scroll-mt-24">
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* Why QuackLink */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Why QuackLink?</h2>
            <p className="mt-3 text-slate-600">
              Everything you need to turn your bio link into a page that actually converts.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-600">
                  <Icon size={26} />
                </div>
                <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Loved by creators, musicians, and small businesses
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-200 p-6">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Simple pricing</h2>
            <p className="mt-2 text-slate-600">Start for free. Upgrade whenever you're ready.</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">{PRICING.FREE.name}</h3>
              <p className="mt-2 text-4xl font-bold text-slate-900">
                ₹0<span className="text-base font-normal text-slate-500">/mo</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {PRICING.FREE.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={18} className="mt-0.5 shrink-0 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 block rounded-full border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Get started
              </Link>
            </div>

            <div className="relative rounded-2xl bg-slate-950 p-8 shadow-xl shadow-brand-900/20">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
              <h3 className="text-lg font-semibold text-brand-400">{PRICING.PREMIUM.name}</h3>
              <p className="mt-2 text-4xl font-bold text-white">
                ₹{PRICING.PREMIUM.priceINR}
                <span className="text-base font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-xs text-slate-400">or ${PRICING.PREMIUM.priceUSD}/mo via PayPal</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {PRICING.PREMIUM.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={18} className="mt-0.5 shrink-0 text-brand-400" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 block rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-950 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to make a splash?</h2>
          <p className="mt-3 text-slate-300">
            Join creators who centralized their online presence with a single QuackLink.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700"
          >
            Get started for free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} QuackLink
      </footer>
    </main>
  );
}
