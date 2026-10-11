# QuackLink — Project Documentation

A Linktree-style "link in bio" app: users claim a public page at
`domain.com/<username>`, add links and social icons, customize its theme,
and optionally upgrade to a Premium plan. Includes a super-admin panel for
managing users, subscriptions, and theme templates.

**Live app:** https://quacklink.vercel.app
**Repo:** https://github.com/flyingduckmarketing/quacklink (default branch: `main`)

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | One deployable app, server + client in one codebase |
| Styling | Tailwind CSS | Fast iteration, no separate design system needed |
| Database | Postgres (hosted on Supabase) | Free tier, works with Vercel's serverless/no-local-disk model |
| ORM | Prisma | Type-safe queries, schema-as-code |
| Auth | NextAuth (Credentials provider) + bcryptjs | Email/password, no third-party auth cost |
| Icons | lucide-react | Consistent icon set for social platforms and UI |
| Drag-and-drop | @dnd-kit | Accessible (keyboard + pointer) reordering |
| Email | nodemailer (SMTP) | Password reset delivery; provider-agnostic |
| Payments | Razorpay + PayPal (Subscriptions) | INR via Razorpay, USD via PayPal |
| Hosting | Vercel | Free tier, auto-deploys from `main` |

**Important architecture note:** the app does **not** use Supabase Auth or
the Supabase client library. It connects to the Postgres database directly
via Prisma, using a superuser-equivalent role (`postgres`), which bypasses
Row Level Security entirely. RLS is enabled on every table purely as
defense-in-depth against Supabase's auto-generated public REST API (which
would otherwise expose all tables to anyone with the project's anon key) —
it holds no real per-user policies, since the app's own API routes (backed
by NextAuth sessions) are what enforce authorization.

---

## 2. Local development

```bash
cp .env.example .env   # fill in DATABASE_URL, NEXTAUTH_SECRET, etc. — see §6
npm install
npm run db:push        # applies the Prisma schema to your Postgres database
npm run dev
```

Visit `http://localhost:3000`.

### Useful scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | `prisma generate` + production build (what Vercel runs) |
| `npm run db:push` | Push `prisma/schema.prisma` to the connected database |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run make-admin -- <email>` | Promote an existing user to `role: ADMIN` |
| `node scripts/reset-password.mjs <email> "<newPassword>"` | Manually reset a user's password (DB-level, for support/recovery) |

**Note on `.npmrc`:** the repo includes `legacy-peer-deps=true`. This is
required because `next-auth` declares an optional peer dependency on
`nodemailer@^7` (for a built-in Email provider this app doesn't use), which
otherwise conflicts with the `nodemailer@^10` installed for password-reset
emails (needed for security fixes present only in v10+). Without this file,
a clean `npm install` fails on Vercel with `ERESOLVE`.

---

## 3. Data model (`prisma/schema.prisma`)

All enum-like fields are plain `String` columns (not Postgres enums) — this
was a deliberate choice from when the database was SQLite (which has no
enum support) and was kept for consistency after migrating to Postgres.
Valid values are documented in schema comments.

### `User`
Core account record. `plan` and `role` gate feature access (see §4).
`resetTokenHash` / `resetTokenExpiresAt` back the forgot-password flow — a
SHA-256 hash of a random token is stored (never the raw token), with a
30-minute expiry.

| Field | Type | Notes |
|---|---|---|
| `username` | String, unique | The public URL slug (`/<username>`) |
| `email` | String, unique | Login identifier |
| `password` | String | bcrypt hash |
| `plan` | String | `"FREE"` \| `"PREMIUM"` |
| `role` | String | `"USER"` \| `"ADMIN"` |
| `suspended` | Boolean | Suspended users can't log in |
| `resetTokenHash` / `resetTokenExpiresAt` | String? / DateTime? | Forgot-password flow |

### `Link`
A single entry on a user's public page — either a full-width button or a
social icon, depending on `kind`.

| Field | Type | Notes |
|---|---|---|
| `kind` | String | `"LINK"` (default, full-width button) \| `"SOCIAL"` (icon row) |
| `platform` | String? | Set only when `kind = "SOCIAL"`: `instagram`, `twitter`, `youtube`, `tiktok`, `facebook`, `linkedin`, `github`, `email`, `website`, `other` |
| `order` | Int | Position within its own `kind` group (LINK and SOCIAL order independently) |
| `active` | Boolean | Toggles visibility on the public page without deleting |
| `clicks` | Int | Incremented by `POST /api/click/[id]` |

### `Theme`
One-to-one with `User`. Colors, button style, optional background image
(Premium only, enforced in `lib/plans.ts`, not at the schema level).

### `Subscription`
Audit trail of Razorpay/PayPal subscription events (see §7). Not the
source of truth for plan access — `User.plan` is — but used by the admin
panel and webhook handlers to track provider-side state.

### `Template`
Admin-managed theme presets. Users can apply one with a single click from
the Appearance page; `premiumOnly` restricts a preset to Premium users.

---

## 4. Plan gating (`lib/plans.ts`)

| | Free | Premium |
|---|---|---|
| Links | Up to 5 | Unlimited |
| Social icons | Unlimited (doesn't count toward link limit) | Unlimited |
| Theme colors / fonts / button style | Default only | Fully customizable |
| Background image | ❌ | ✅ |
| Click analytics (per-link count) | ❌ | ✅ |
| QuackLink branding on public page | Shown | Removed |

`limitsFor(plan)` and `canAddLink(plan, currentCount)` are the two
functions everything else calls — API routes re-check these server-side
(never trust client state) before allowing an action.

---

## 5. Feature map

### Public
- **`/`** — marketing landing page (hero, features, testimonials, pricing, CTA)
- **`/[username]`** — public profile: avatar, bio, social icon row, link
  buttons, QuackLink branding (if not Premium). Server-rendered per request
  (not statically cached) so link edits show up immediately.
- **`/login`**, **`/register`** — credentials auth
- **`/forgot-password`**, **`/reset-password?token=...`** — password recovery

### Authenticated (`/dashboard`, protected by `middleware.ts`)
- **Links** (`/dashboard`) — add/edit/delete/toggle links; separate social
  icon management; drag-and-drop reordering (own order space per `kind`);
  live mobile preview pane (`components/ProfilePreview.tsx`, shared with
  the Appearance page)
- **Appearance** (`/dashboard/appearance`) — color/button-style editor
  (Premium-gated), template picker (applies an admin-defined preset),
  same live preview
- **Billing** (`/dashboard/billing`) — Razorpay/PayPal checkout, cancel
  subscription

### Admin (`/admin`, requires `role: ADMIN`, protected by `middleware.ts` +
`lib/admin.ts`'s `requireAdminSession()` in every API route)
- **Users** (`/admin/users`) — search, change plan, promote/demote admin,
  suspend/unsuspend, delete (can't demote/suspend/delete yourself)
- **Subscriptions** (`/admin/subscriptions`) — read-only feed of all
  Razorpay/PayPal subscription records, filterable by provider/status
- **Templates** (`/admin/templates`) — create/edit/delete theme presets

---

## 6. Environment variables

See `.env.example` for the full list with inline comments. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. **Use the Transaction Pooler** (port 6543) on Vercel, **with `?pgbouncer=true&connection_limit=1`** appended — required for Prisma to work correctly against pgbouncer in transaction mode (its absence caused the original "Something went wrong" signup bug, §9). |
| `NEXTAUTH_URL` | Yes | Full deployed URL, e.g. `https://quacklink.vercel.app` |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `APP_URL` | Yes | Same as `NEXTAUTH_URL`; used for PayPal redirects and password-reset links |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` / `RAZORPAY_PREMIUM_PLAN_ID` | No | Upgrade buttons show "not configured yet" until set |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_MODE` / `PAYPAL_PREMIUM_PLAN_ID` / `PAYPAL_WEBHOOK_ID` | No | Same fallback behavior |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | No | Without these, password-reset links are logged server-side instead of emailed (visible in Vercel runtime logs only — not usable by real users) |

Schema migrations: run `npm run db:push` against whatever `DATABASE_URL`
you're targeting (local, or the production Supabase instance) any time
`prisma/schema.prisma` changes. There is no formal migrations directory —
this project uses Prisma's `db push` (schema-sync) workflow, not
`prisma migrate`.

---

## 7. Payments

Both providers use the same pattern: a `create-subscription` route starts
checkout, a `webhook` route is the source of truth for plan changes
(updates `User.plan` and upserts a `Subscription` row), and a `verify`
(Razorpay) / redirect (PayPal) step gives the client immediate feedback
without waiting for the webhook.

- **Razorpay** (`lib/razorpay.ts`, `app/api/billing/razorpay/*`) — INR
  pricing. Webhook verifies `x-razorpay-signature` via HMAC-SHA256.
- **PayPal** (`lib/paypal.ts`, `app/api/billing/paypal/*`) — USD pricing.
  Webhook verifies via PayPal's `verify-webhook-signature` API.
- **Cancellation** (`app/api/billing/cancel/route.ts`) — cancels on the
  provider side (best-effort) and always downgrades `User.plan` to
  `"FREE"` locally, even if the provider call fails.

Neither integration is live yet (no real keys configured) — see §6.

---

## 8. Known gaps / not yet built

Tracked against the fuller PRD discussed for this project; not all of it
is implemented. What's **done**: link CRUD + drag-and-drop, social icon
row, live preview, preset themes (templates), two-tier Free/Premium
gating, basic per-link click counts, the admin panel (users,
subscriptions, templates), forgot/reset password.

What's **not yet built**:
- Multi-profile accounts (Premium: up to 3 handles per account)
- Custom background image/video **uploads** (currently a background image
  is just a URL field — no Supabase Storage integration)
- Full analytics engine (views vs. clicks breakdown, CTR, date-range
  history, location/referrer tracking, aggregation views/RPCs) — currently
  only a raw `clicks` counter per link, no `analytics_events` table
  or profile-view tracking at all
- Advanced link blocks (media embeds, scheduling, gated content)
- Meta Pixel / Google Analytics ID injection
- Admin content moderation (reported links, 1-click ban) and platform-wide
  metrics dashboard
- Admin user impersonation
- Real SMTP credentials (password reset works end-to-end but isn't
  actually emailing anyone yet — see §6)
- Avatar/profile image upload (currently a URL field only)
- No automated test suite (manual smoke-testing only, per-change)

---

## 9. Operational history worth knowing

A few non-obvious things discovered while building/deploying this app,
left here so they don't get re-discovered the hard way:

- **Supabase's Transaction Pooler needs `?pgbouncer=true`.** Without it,
  Prisma's prepared-statement handling breaks against pgbouncer in
  transaction mode — this caused a generic "Something went wrong" on every
  database write (including signup) in production until fixed.
- **`prisma db push` must run against the Session Pooler (port 5432) or a
  direct connection, not the Transaction Pooler (6543).** Transaction-mode
  pgbouncer doesn't support the session-level features schema migrations
  need; it can hang indefinitely rather than error cleanly.
- **Supabase's "Direct connection" host is IPv6-only** on the free tier.
  If a network/machine lacks IPv6 connectivity, that connection hangs
  forever. The Session Pooler (same host as Transaction Pooler, port 5432)
  is the IPv4-compatible alternative for one-off commands like migrations.
- **Vercel's "Deployment Protection" (SSO / Vercel Authentication)** can be
  scoped to "all deployments except custom domains" — since
  `quacklink.vercel.app` is a `*.vercel.app` subdomain, not a true custom
  domain, this setting put a Vercel-account login wall in front of the
  entire public app. It's now disabled project-wide.
- **`next-auth` peer-depends on `nodemailer@^7`**, conflicting with the
  `nodemailer@^10` this app needs — see the `.npmrc` note in §2.
- **Vercel bakes environment variables into each deployment at build
  time.** Changing an env var requires a new deployment (redeploy) to take
  effect — it is not picked up live by an already-running deployment.
- **RLS is enabled with zero policies** on every table (see the
  architecture note in §1) — this is intentional and correct for this
  app's access pattern, not an oversight to "fix" by adding policies.

---

## 10. Repo layout

```
app/
  page.tsx                  Landing page
  [username]/page.tsx       Public profile (SSR)
  login/, register/         Auth pages
  forgot-password/, reset-password/   Password recovery
  dashboard/                 Authenticated area (links, appearance, billing)
  admin/                      Admin area (users, subscriptions, templates)
  api/                         All backend routes (mirrors the pages above)
components/                  Shared React components (ProfilePreview, SortableItem, etc.)
lib/                         Server-side helpers (auth, prisma, plans, email, payments)
prisma/schema.prisma         Data model (source of truth for DB schema)
scripts/                     One-off CLI scripts (make-admin, reset-password)
middleware.ts                Route protection for /dashboard and /admin
```
