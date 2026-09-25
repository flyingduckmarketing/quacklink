# QuackLink

A cost-effective LinkTree replica built with Next.js (App Router), Prisma +
SQLite, NextAuth, and Free/Premium plans billed through **Razorpay** (INR)
and **PayPal** (USD).

## Stack

- **Next.js 14 + TypeScript + Tailwind CSS** — one deployable app, free tier
  friendly on Vercel/Render/Railway.
- **Prisma + SQLite** for local/low-cost hosting. Swap `provider` in
  `prisma/schema.prisma` to `postgresql` and point `DATABASE_URL` at a free
  Postgres instance (Neon, Supabase) for production.
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
cp .env.example .env
npm install
npm run db:push   # creates the SQLite database from the Prisma schema
npm run dev
```

Visit `http://localhost:3000`.

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

## Project structure

- `app/[username]` — public link-in-bio page.
- `app/dashboard` — authenticated area: links, appearance, billing.
- `app/api/links`, `app/api/theme` — CRUD gated by `lib/plans.ts`.
- `app/api/billing/*` — Razorpay and PayPal checkout + webhooks.
- `prisma/schema.prisma` — User, Link, Theme, Subscription models.
