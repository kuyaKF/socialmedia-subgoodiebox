# stef-project-socialmedia (boilerplate)

MERN boilerplate for a subscription + social media web app. Users register and land in an
unassigned pool; admins create groups and assign an `internal`-role (or `admin`) user as each
group's leader plus members from the pool.

## Stack

- **Server**: Node/Express + TypeScript, MongoDB via Mongoose, JWT auth (httpOnly cookie).
- **Client**: React + TypeScript, Vite, Tailwind CSS v4, React Router, Axios.

## Scope of this boilerplate

Included: a public marketing landing page (`/`), registration/login with email verification via
Resend, 3 roles, user profiles, self-service password changes, admin-managed groups (create,
rename, assign leader, assign/remove members — searchable, paginated), an admin-only staff
registration form (with a password generator, for onboarding `internal`/`admin` accounts directly),
real subscription payments via PayMongo Checkout (Starter/Plus/Premium, card, PHP), an admin "All
Users" browser (search by name/email, filter/sort by subscription plan / group / registration
date, paginated), a working newsletter signup, and an infinite-scroll social feed (`/feed`) with
admin announcements, admin blog posts, group-leader-only group posts (visible only to that group's
members), plus likes and comments on any feed item.

Roles:
- `user` — a subscriber. Sees the Subscription page; can never be a group leader.
- `internal` — an internal team member (staff, not a subscriber). No Subscription page. Eligible
  to be assigned as a group's leader.
- `admin` — full admin. No Subscription page. Also eligible to be a group's leader. Only admins
  can create groups and assign leaders/members.

Explicitly **not** included yet (deferred for a future pass):
- Image/media uploads on feed posts (text-only for now — no storage infra wired up)
- True auto-recurring billing — see "Payments" below for why, and what's here instead
- Drag-and-drop for group member assignment (uses a searchable type-ahead picker instead)
- A dedicated admin management page for editing/deleting announcements or blog posts (deleting
  happens inline from the feed card itself instead)
- Automated tests, CI, Docker

## Routes

- `/` — public marketing landing page (hero, intro, why-join, blog preview, pricing tiers, FAQ,
  newsletter).
- `/blog`, `/blog/:id` — public blog, viewable by guests. Linked from the nav (both logged-in and
  logged-out) and from the homepage's "From our blog" preview section. Paginated list + full post
  view; no auth required.
- `/login`, `/register` — public only (redirect to `/feed` if already authenticated).
- `/terms`, `/privacy` — public placeholder legal pages, linked from the landing footer.
- `/feed` — authenticated home: infinite-scroll feed of announcements, blog posts, and (if you
  belong to a group) that group's posts.
- `/profile/:id`, `/subscription`, `/admin/groups` — authenticated app, same as before.
- `/admin/dashboard` — admin-only stats: total users/groups, free vs. paid split, revenue per
  month, and new signups per month (last 12 months, via `recharts`).

## Feed content model

- **Announcements** — admin-only, visible to everyone in the feed.
- **Blog posts** — admin-only to create, visible to everyone in the feed, and also public at
  `/blog` (list) and `/blog/:id` (detail) — no login required. The public pages are read-only
  (no like/comment UI); engagement is a feed-only feature for signed-in users.
- **Group posts** — only the specific group's assigned `leader` can create one (checked
  server-side against `Group.leader`, not just the `internal`/`admin` role generally); only
  members of that group (and the leader) see it in their feed.
- **Likes/comments** — any authenticated user can like or comment on any feed item, regardless of
  type. Likes are a toggle (one per user per item); comments are flat (no threaded replies).
- Deleting a post is available inline on its card to the post's author or any admin.

## Payments (PayMongo)

Users upgrade from `/subscription` by choosing Starter/Plus/Premium. The server creates a
[PayMongo Checkout Session](https://docs.paymongo.com/docs/checkout-api) and redirects the user
to PayMongo's hosted payment page — this app never touches card numbers, so it carries no PCI
compliance burden. After payment, PayMongo redirects back to `/subscription`, but activation only
happens once our webhook independently verifies a `checkout_session.payment.paid` event — never
trust the redirect alone, since a user could hit the success URL without actually paying.

**Why not true recurring billing?** PayMongo's native Subscriptions API only supports card and
Maya (not GCash/GrabPay), and PayMongo's own docs note it needs to be enabled on your account
before you can test it. So this boilerplate uses one-time Checkout Sessions instead: paying sets
`subscription.currentPeriodEnd` 30 days out; when that passes without renewal, the next time the
user's session is checked (login or `/auth/me`) they're lazily downgraded back to `free`. No cron
job, no auto-charge — renewal is a manual action. Swap in the Subscriptions API later if you need
true auto-recurring and confirm it's enabled on your account first.

**Setup:**
1. Get your **test mode** keys from the PayMongo dashboard (Developers → API Keys) — `sk_test_...`
   for `PAYMONGO_SECRET_KEY`. Never use live keys (`sk_live_...`) outside of production, and never
   commit either to git (`server/.env` is gitignored).
2. Create a webhook in the PayMongo dashboard (Developers → Webhooks) pointing at
   `<your-server-url>/api/payments/webhook`, subscribed to at least `checkout_session.payment.paid`.
   PayMongo gives you a signing secret (`whsec_...`) at that point — set it as
   `PAYMONGO_WEBHOOK_SECRET`.
3. **Local testing**: PayMongo can't reach `http://localhost:4000` directly. Use a tunnel (e.g.
   `ngrok http 4000`) and point the webhook at the tunnel's HTTPS URL instead while developing.
4. Adjust the peso amounts in `server/src/config/plans.ts` (and the matching display prices in
   `client/src/pages/SubscriptionPage.tsx` — there's no public pricing endpoint yet, so these are
   kept in sync by hand) to your actual pricing before going live.
5. Before flipping to live keys: re-read PayMongo's go-live checklist, confirm the webhook signing
   secret is the *live* one (test and live webhooks have separate secrets), and test the full
   checkout → webhook → activation flow end-to-end in test mode first.

## Email verification (Resend)

Registration sends a verification email via [Resend](https://resend.com); the account is created
and logged in immediately (soft gate), with an amber banner nagging until the link is clicked. The
link points at `/verify-email?token=...`, which the client POSTs to `/api/auth/verify-email` —
the raw token is only ever emailed, never stored (the DB keeps a SHA-256 hash + a 24h expiry), so a
database leak alone can't be used to verify accounts.

**Setup:**
1. Get an API key from the [Resend dashboard](https://resend.com/api-keys) and set
   `RESEND_API_KEY`. Without it, the server logs a warning and skips sending (registration still
   works — you just won't get the email).
2. `EMAIL_FROM` defaults to Resend's shared test sender (`onboarding@resend.dev`), which works with
   no setup for local dev. Verify your own domain in Resend and switch `EMAIL_FROM` to it before
   going live — the shared sender is rate-limited and only good for testing.
3. Already verified but want to test again? Use "Resend verification email" from the banner, or
   just register a new test account.

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local install, Docker, or a hosted service like MongoDB Atlas)

## Setup

```bash
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` — at minimum set `MONGO_URI` to point at your MongoDB instance, and set a
real `JWT_SECRET`. `ADMIN_EMAIL` / `ADMIN_PASSWORD` are used by the seed script below.

## Bootstrap the first admin

```bash
npm run seed:admin
```

Upserts (or promotes) a user with the email/password/name from `server/.env` to the `admin`
role, so you have someone who can log in and manage groups from day one.

## Seed dummy data (optional)

```bash
npm run seed:dummy
```

Creates ~60 fake users (mixed `@gmail.com` and other email domains, random names, registration
dates spread across the last 180 days, random subscription plans) plus a few sample groups with
leaders and members already assigned — useful for trying out the Manage Groups search/filter/
pagination without registering accounts by hand. Safe to re-run; it skips any email collisions
rather than duplicating. All generated accounts share the password `changeme123`.

## Run

```bash
npm run dev
```

Starts the API on `http://localhost:4000` and the Vite dev server on `http://localhost:5173`.

## Auth design note

The JWT is stored in an httpOnly cookie rather than in `localStorage`, which keeps it out of
reach of XSS-injected JS at the cost of needing `credentials: true` on CORS and
`withCredentials: true` on the client's Axios instance (already wired up). There's no
refresh-token rotation — a single 7-day token — which is fine for a boilerplate but worth
revisiting before this goes anywhere near production traffic.

## End-to-end flow to try

1. Register a normal user at `/register` — feed shows role `user`, no composer (subscribers can't
   post), just the shared announcements/blog posts and a visible Subscription nav link.
2. Log in as the seeded admin, open **Manage Groups**. Note the admin's own feed has no
   Subscription card/link — admins aren't subscribers.
3. Promote a user to internal team (`Make internal team member`), create a group with them as
   leader, add another user as a member. A plain subscriber never shows up as a leader option.
4. As admin, post an announcement and publish a blog post from `/feed` — both appear in every
   member's feed.
5. Log in as the group's leader — a "Post to [Group]" composer appears; post something. Only
   members of that group see it in their feed; everyone else doesn't.
6. Like and comment on any feed item as any logged-in user; counts update live.
7. Visit any user's `/profile/:id` to see their basic public profile.
8. As the subscriber user, choose a plan on `/subscription`, complete a test-mode payment on
   PayMongo's hosted checkout page, and get redirected back — once the webhook confirms it, the
   new plan and renewal date show up. Navigating to `/subscription` as admin/internal redirects
   back to the feed.
