# QuackLink

A cost-effective LinkTree replica built with Next.js (App Router), Prisma +
Postgres, NextAuth, and Free/Premium plans billed through **Razorpay** (INR)
and **PayPal** (USD).

## Stack

- **Next.js 14 + TypeScript + Tailwind CSS** — one deployable app, free tier
  friendly on Vercel/Render/Railway.
- **Prisma + Postgres** — point `DATABASE_URL` at any Postgres instance. A
  free tier from Neon or Supabase works well and is what these instructions
  assume; anything Postgres-compatible works.
- **NextAuth (credentials provider)** — email/password auth, no third-party
  auth costs.
- **Razorpay Subscriptions** and **PayPal Subscriptions** for recurring
  Premium billing.

## Plans

| | Free | Premium |
|---|---|---|
| Links | Up to 5 | Unlimited |
| Theme colors / fonts | Default only | Fully customizable |
| Background image | ❌ | ✅ |
| Click analytics | ❌ | ✅ |
| QuackLink branding | Shown | Removed |

Limits live in `lib/plans.ts`.

## Getting started

```bash
cp .env.example .env   # then fill in DATABASE_URL, NEXTAUTH_SECRET, etc.
npm install
npm run db:push        # applies the Prisma schema to your Postgres database
npm run dev
```

Visit `http://localhost:3000`.

## Deploying to Vercel (free tier)

1. **Get a free Postgres database.**
   - [Neon](https://neon.tech) or [Supabase](https://supabase.com) both have
     free tiers. Create a project, then copy its connection string (use the
     "pooled"/"transaction mode" connection string if offered — Vercel's
     serverless functions open many short-lived connections).
2. **Import the repo into Vercel.**
   - Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and
     import `flyingduckmarketing/quacklink`. Vercel auto-detects Next.js —
     leave the build settings as default (`npm run build`).
3. **Set environment variables** in the Vercel project's
   **Settings → Environment Variables**, using the same keys as
   `.env.example`:
   - `DATABASE_URL` — the connection string from step 1.
   - `NEXTAUTH_URL` — your Vercel deployment URL, e.g.
     `https://quacklink.vercel.app` (update this if you later add a custom
     domain).
   - `NEXTAUTH_SECRET` — generate one with `openssl rand -base64 32`.
   - `APP_URL` — same as `NEXTAUTH_URL`, used for PayPal redirect links.
   - Razorpay and PayPal keys — see **Setting up payments** below. You can
     deploy without these first; the Upgrade buttons just show a "not
     configured yet" message until you add them.
4. **Apply the database schema once**, from your machine, pointed at the
   same `DATABASE_URL` you set in Vercel:
   ```bash
   DATABASE_URL="<your production connection string>" npx prisma db push
   ```
5. **Deploy.** Vercel builds and deploys automatically on every push to
   `main`. Trigger the first deploy from the dashboard (or push a commit).
6. Once live, register an account on your deployed URL and confirm the
   `/dashboard` and public `/<username>` pages both work before wiring real
   payment keys.

## Setting up payments

### Razorpay

1. Create a Plan under **Dashboard → Subscriptions → Plans** for your
   Premium price, and copy its `plan_id` into `RAZORPAY_PREMIUM_PLAN_ID`.
2. Copy your API keys into `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
3. Add a webhook pointing at `POST /api/billing/razorpay/webhook`,
   subscribed to `subscription.activated`, `subscription.charged`,
   `subscription.cancelled`, `subscription.halted`. Copy the webhook secret
   into `RAZORPAY_WEBHOOK_SECRET`.

### PayPal

1. Create an app at developer.paypal.com and copy `PAYPAL_CLIENT_ID` /
   `PAYPAL_CLIENT_SECRET`.
2. Create a Billing Plan (REST API or dashboard) and set
   `PAYPAL_PREMIUM_PLAN_ID`.
3. Add a webhook pointing at `POST /api/billing/paypal/webhook`, subscribed
   to `BILLING.SUBSCRIPTION.ACTIVATED/CANCELLED/SUSPENDED/EXPIRED`. Copy the
   Webhook ID into `PAYPAL_WEBHOOK_ID`.

Until these env vars are set, the "Upgrade" buttons return a friendly
"not configured yet" error instead of failing hard.

## Password reset emails

"Forgot password?" on the login page sends a time-limited reset link via
SMTP. Set these to enable real delivery:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

A Gmail account works well for low volume: enable 2FA, then create an
[App Password](https://myaccount.google.com/apppasswords) and use it as
`SMTP_PASS` with `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`.

Until SMTP is configured, the reset link is logged to the server console
instead of emailed — useful for local testing, but set real credentials
before relying on this in production.

## Admin panel

There's a super-admin area at `/admin` for managing users, subscriptions, and
theme templates. It's gated by a `role` field on `User` (`"USER"` or
`"ADMIN"`) — nobody can reach it until you promote an account.

**Promote your first admin** (run once, after `db:push`):

```bash
DATABASE_URL="<your connection string>" npm run make-admin -- you@example.com
```

That user can now open `/admin` and:

- **Users** — search, change plan (Free/Premium), promote/demote admins,
  suspend/unsuspend accounts (suspended users can't log in), delete accounts.
- **Subscriptions** — read-only list of every Razorpay/PayPal subscription
  record, filterable by provider and status.
- **Templates** — create reusable theme presets (colors + button style).
  Mark a template "Premium only" to restrict it; everyone else sees it on
  their Appearance page and can apply it with one click.

Admins manage other admins from the same Users table — there's no separate
"super admin" tier; any `ADMIN` can promote or demote another user (except
their own account, to avoid locking yourself out).

## Project structure

- `app/[username]` — public link-in-bio page.
- `app/dashboard` — authenticated area: links, appearance, billing.
- `app/admin` — admin-only area: users, subscriptions, templates.
- `app/api/links`, `app/api/theme` — CRUD gated by `lib/plans.ts`.
- `app/api/billing/*` — Razorpay and PayPal checkout + webhooks.
- `app/api/admin/*` — admin-only CRUD, gated by `lib/admin.ts`.
- `prisma/schema.prisma` — User, Link, Theme, Subscription, Template models.
