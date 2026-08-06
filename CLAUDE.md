# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

**Haven Circle** — a MERN peer-support social app (subscription + community platform), rebranded
from a generic boilerplate on 2026-07-28. New registrants land in an unassigned pool; admins create
"circles" (groups) and assign an `internal`- or `admin`-role user as each circle's leader plus
members from the pool. Real, if illustrative, scope: **~60 non-staff users, solo-maintained** — this
number should inform every scale/complexity tradeoff (rate limits, pagination sizes, whether a
feature needs to be "enterprise-grade" or just correct). See `sessions.md` at the repo root for the
full backfilled development history and `README.md` for the complete feature/route/setup reference —
this file does not repeat what's already documented there.

## Commands

Run from the repo root unless noted.

```bash
npm run install:all      # install server + client deps
npm run dev               # both servers concurrently: API on :4000, Vite on :5173
npm run seed:admin        # upsert/promote the admin user from server/.env
npm run seed:dummy        # ~60 fake users + sample groups, safe to re-run
```

Per-package (`cd server` / `cd client` first, or use `npm run <script> --prefix <dir>`):

```bash
# server/
npm run dev                 # ts-node-dev, auto-restart
npm run build                # tsc
npx tsc --noEmit             # typecheck only, no build output — use this to verify changes
npx ts-node src/scripts/x.ts # one-off DB scripts (see "One-off scripts" below)

# client/
npm run dev                  # vite
npm run build                 # tsc -b && vite build
npm run lint                  # oxlint (not ESLint)
npx tsc --noEmit               # typecheck only — use this to verify changes
```

**There are no automated tests, CI, or Docker in this repo** (deliberately deferred, not an
oversight). Verification is `tsc --noEmit` on the side(s) you touched, plus manually exercising the
change — in a browser for client work, via `curl`/a one-off script for server work.

## Architecture

**Server** (`server/src/`): layered `routes/ → controllers/ → models/`, one file per resource in each
layer, no god-files. `middleware/` holds `requireAuth`/`requireRole` (JWT read from an httpOnly
cookie, never localStorage) and `rateLimit.ts` (`express-rate-limit`, applied to
login/register/password-change). `config/` holds pricing (`plans.ts`, `goodieBox.ts`) and env
loading. `utils/` holds cross-cutting helpers (slug validation, blog block sanitization/excerpting,
email sending). `scripts/` holds one-off Mongoose scripts run via `ts-node` — see below.

**Client** (`client/src/`): `pages/` (route-level components) compose `components/` (feature
components) which lean on `components/ui/` (shadcn/ui primitives — see "Admin UI" below) and a
handful of hand-rolled shared components that predate shadcn and are intentionally still hand-rolled:
`Avatar.tsx` (hashed-color-initials fallback), `SearchableSelect.tsx` (combobox), `icons.tsx`
(hand-drawn 20×20 SVG icon set). `api/` is one file per resource wrapping the shared `axios` instance
(`api/client.ts`, `withCredentials: true`) in typed request functions — there is no react-query/SWR;
data fetching is plain `axios` + `useEffect`, with `hooks/usePaginatedResource.ts` deduping the
debounced-search-plus-pagination pattern used by the admin browsers. `context/AuthContext.tsx` holds
session state; `routes/ProtectedRoute.tsx` gates by auth and optionally by `roles`.

**Auth & roles**: JWT in an httpOnly cookie (`credentials: true` CORS, `withCredentials: true`
Axios), single 7-day token, no refresh rotation, no server-side session/token invalidation (rotating
`JWT_SECRET` is the only way to force-logout everyone — see `sessions.md`'s 2026-08-05 entry for when
this was last done and why the gap is an accepted tradeoff at this scale). Three roles: `user`
(subscriber, never a leader), `internal` (staff, leader-eligible, no Subscription page), `admin`
(same as internal plus group/staff management). Leader eligibility and admin-only actions are
checked server-side against the actual `Group.leader`/role fields, never trusted from the client.

**Feed content model**: three content types (`Announcement`, `BlogPost`, `GroupPost`) merged and
paginated by one controller into a single feed. Group posts are the only type with a
visibility toggle (`private`/`public`) and are only creatable by that specific group's `leader` (or
an admin) — checked against `Group.leader`, not just role.

**Payments (PayMongo)**: hosted Checkout Sessions, never native card handling (zero PCI scope).
Activation happens **only** on independent webhook verification of `checkout_session.payment.paid`
— the client-side redirect back to `/subscription` is never trusted alone. Subscriptions and the
one-time Goodie Box purchase are separate products with **separate webhook endpoints and separate
signing secrets** (`PAYMONGO_WEBHOOK_SECRET` vs `PAYMONGO_GOODIE_BOX_WEBHOOK_SECRET`) — do not
conflate them. No true recurring billing (see README's "Payments" section for why); a subscription
is just a 30-day `currentPeriodEnd` that lazily downgrades to `free` on next session check if not
renewed.

**Admin UI** (`/admin/*`, `client/src/components/admin/` + `client/src/components/ui/`): the *only*
part of the app using shadcn/ui (Radix + Tailwind + `class-variance-authority`) — this app's first
and only UI-framework dependency, deliberately scoped to admin and not used on member-facing pages.
`AdminLayout.tsx` provides a sidebar shell (nested `/admin` routes via `<Outlet/>`, one
`ProtectedRoute roles={['admin']}` wrapping the whole layout rather than per-route). Design tokens
live in `client/src/index.css`'s `@theme` block (slate neutral, indigo primary/accent, chart colors)
— member-facing pages don't reference these tokens and are unaffected by them.
`components/admin/chartColors.ts` and `StatusBadge.tsx` (in `components/`, not `components/admin/`,
since `RoleBadge` also uses it outside admin) centralize status/plan color-coding so the dashboard
charts and the tables that manage the same data agree visually. When adding new admin UI, prefer
`npx shadcn@latest add <component>` over hand-rolling — check `components.json` for the configured
style (`radix-vega`, slate base) first.

**One-off scripts** (`server/src/scripts/`): the established pattern for direct-DB operations that
don't warrant a permanent endpoint — write a temporary script using `connectDb()` (from
`server/src/db/connect.ts`) + a Mongoose model, run once via `npx ts-node src/scripts/x.ts` from
`server/`, then delete it. `seedAdmin.ts` and `seedDummyData.ts` are the two permanent exceptions
(wired into root `npm run seed:*`).

## Workflow

This project has no ticket tracker or PRD process — development is entirely conversational: the
user describes a feature or bug in chat and it gets implemented directly. Plan Mode (research →
written plan → explicit approval → implementation) is reserved for larger or riskier changes
(a full security audit, a UI framework adoption, a routing restructure) — most single-feature asks
go straight to implementation. Match this: don't propose introducing tickets, PRDs, or heavier
process, and don't reach for Plan Mode on routine, contained changes.

**Verification convention**: after a change, run `tsc --noEmit` on whichever side(s) were touched,
then exercise the change directly — a browser walkthrough of the actual page/flow for client work
(the dev servers are typically already running; check before starting new ones), a `curl`/one-off
script for server-only work. This repo has no test suite to lean on instead.

**`sessions.md`** (repo root) is a running dev changelog, separate from git history — one entry per
completed piece of work (date, title, what changed and why, a short paragraph or a few bullets, not
a transcript). Append to it proactively after finishing a feature or fix, without waiting to be
asked. It was backfilled once (2026-08-05) all the way to the project's actual start
(2026-07-28, predating `git init`) by mining the raw Claude Code session transcript for real
timestamps and quotes — that's the precedent if a similar gap ever needs recovering again.

**Committing**: never commit or push without being asked, even after a change is verified working.
When asked to open a PR, check whether the target branch's existing PR was already merged before
pushing more commits to it — GitHub won't attach new commits on a merged PR to anything; a new PR is
needed in that case (this has happened before in this repo).
