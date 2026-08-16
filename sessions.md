# Sessions

A running log of feature/fix work on Haven Circle, one entry per completed session.
Not a full transcript — just what shipped and why, for future reference (yours or a
future collaborator's).

Format per entry:

```
## YYYY-MM-DD — Short title

What changed, and why (1 short paragraph or a few bullets).
```

Entries before 2026-08-05 are backfilled. 2026-07-30 onward comes from git commit
history. 2026-07-28 through the morning of 2026-07-30 (before `git init` — the
project ran for two and a half days as pure Claude Code iteration before version
control started) is reconstructed from the raw session transcript: real timestamps,
real user quotes, real bugs found during verification — not guessed. Times below are
UTC; the developer's local zone is UTC+8.

## 2026-07-28 — Project kickoff: MERN boilerplate scaffold (00:46–01:43 UTC)

Kicked off from a one-line ask: a subscription + social-media MERN app where new
registrants land in an unassigned pool, admins create groups and assign leaders, and
internal staff/admins are also platform users. Server (Express/TS/Mongoose: auth,
users, groups, subscriptions) and client (Vite/React/TS/Tailwind v4) were scaffolded
end-to-end. Local MongoDB via Docker was abandoned mid-setup in favor of the
developer's existing MongoDB Atlas cluster, which needed a DNS workaround
(`dns.setServers(['8.8.8.8','1.1.1.1'])`) for SRV lookups to resolve. The developer
then caught that the Atlas connection string pointed at an old practice database
with unrelated leftover documents ("do you think it would be better to use a clean
db") — fixed by pointing at a fresh `social-boilerplate` database. Verified live
end-to-end: register → admin promotes a user → group assignment → dashboard
reflects it.

## 2026-07-28 — Role model clarified: user / internal / admin (01:49–02:02 UTC)

Permission model clarified explicitly: "the admin and the internal teams are also
users correct so they do not need a subscription view when they login... only the
admin and internal members can be team leaders. regular users ... cannot become team
leaders. and the admin is the only one who can assign teamleaders." Drove a rename
of the `team_leader` role to `internal` across server and client — "team leader"
became purely a UI label for whoever is set as a `Group.leader`, eligible from
either `internal` or `admin` — plus gating the Subscription UI to the `user` role
only.

## 2026-07-28 — Admin users table: search, filter, pagination (02:06–02:21 UTC)

Built a paginated/searchable admin users view (name, email substring, subscription
plan, group, registration date), replacing the flat unassigned-pool list, plus a
dummy-data seed script to make pagination meaningful to test against. A real bug
surfaced during verification: the paginated query wasn't populating `group`, showing
"—" for filtered rows — fixed and reverified.

## 2026-07-28 — Groups: pagination, searchable combobox, card redesign (02:27–02:46 UTC)

Added group-list pagination/search "but let's keep the aesthetic," plus a reusable
`SearchableSelect` combobox for leader/member assignment (chosen over separate
dropdown/textbox controls since a plain `<select>` doesn't scale past ~60
candidates), member emails next to names on group cards ("it's totally possible to
have very similar names but different emails"), inline group-rename, and general
visual polish. Verification uncovered and fixed a real data-integrity bug:
reassigning a group's leader wasn't clearing the *previous* leader's own `group`
reference, leaving them stuck in a stale state.

## 2026-07-28 — Public landing page (04:32–04:59 UTC)

Paused dashboard work for a proper marketing landing page: "I need the home page to
be a landing page looking homepage" — hero with CTA, product intro, three
subscription tiers (middle tier as best value), FAQ, newsletter signup, footer with
Terms/Privacy/social links. Moved the authenticated dashboard off `/` to
`/dashboard` to free up the landing page at the root, added logged-out login/join
CTAs to the Navbar. Verified live including duplicate-newsletter-signup handling.

## 2026-07-28 — Facebook-style feed replaces the dashboard (05:46–06:08 UTC)

Turned the logged-in landing experience into an infinite-scroll feed at `/feed`,
mixing admin announcements, group posts (leader-only, group-scoped visibility), and
blog posts, with likes/comments — replacing `/dashboard` everywhere. Verification
found and fixed a real race condition: the mount effect and the
`IntersectionObserver` both fired an initial load near-simultaneously, corrupting
the feed array with duplicate React keys.

## 2026-07-28 — Public blog + nav polish (06:33–06:56 UTC)

"the website itself should have its own blog, viewable even by guests from the
homepage via a link." Until this point only admin create/delete existed for blog
posts with no public read path — added public `/blog` list and `/blog/:id` detail
pages plus a "From our blog" landing preview section. Follow-ups same session: move
the blog preview below the FAQ, add a max-width content wrapper to the Navbar ("it
looks too empty when the contents expands from end to end"), anchor-linked quick-nav
on the landing page.

## 2026-07-28 — PayMongo payment integration, part 1: design + test checkout (08:36–11:18 UTC, across three sub-sessions split by usage-limit pauses)

Scoped the payments integration: test-mode keys only, card payment first, one-time
charge-per-period with manual renewal (not true recurring billing), PayMongo's
hosted Checkout Sessions over a native card form or the Subscriptions API — to keep
PCI scope at zero. Built the Payment model, plan pricing config, the PayMongo API
client (including HMAC webhook signature verification), checkout/webhook
controllers, and the raw-body Express wiring required for that verification.
Verified twice: first via a locally simulated signed webhook before real keys
existed, then for real once real test keys were found (they're nested under
Settings → Developers, not a top-level tab). Two Claude-side usage-limit pauses
happened mid-session — not the developer stepping away.

## 2026-07-28 — ngrok tunnel + webhook wiring, real end-to-end payment (10:51–12:32 UTC)

Needed ngrok to receive PayMongo's webhook locally ("before we continue, can you
explain to me why do we need ngrok"). Chocolatey install failed (no admin rights);
winget worked instead. First ngrok credential supplied was actually a Credential ID
rather than the authtoken, self-caught mid-flight ("wait stop i think its wrong")
and corrected moments later. Webhook signing secret wired in; a real test-mode
payment was confirmed landing in the PayMongo dashboard.

## 2026-07-28 — Rebrand to "Haven Circle": mental-health mission copywriting (12:32–12:36 UTC)

"Let's copywrite this website to be presented as an empathetic and mental health
awareness organization that wants to send help to people who are in need." This is
the origin of the "Haven Circle" name — a warm, mission-driven peer-support
organization that ships care packages — renamed everywhere (Navbar, footer, page
title) from the generic "Social Boilerplate," plus a brief crisis-resources note
added alongside the copy rewrite. The single pivot point where this stopped being a
generic subscription/social boilerplate and became Haven Circle as it exists today.

## 2026-07-28 — Session pause; real payment confirmed (22:44 UTC)

Returned after roughly 10 hours away to confirm the real PayMongo test payment had
gone through, then paused development again while keeping the local server running.

## 2026-07-29 — Admin table sorting, dummy-data cleanup, staff registration, email verification (00:07–01:37 UTC)

Added clickable column sorting to the admin users table. Cleaned up 26 stale dummy
records left over from manual payment testing ("there's a pro plan and premium plan
users because I was testing the payment if it works... alright we should clean those
up"). Replaced the "Make internal team member" table action with a dedicated staff
registration flow (password generator, editable password field, plus self-service
password change later in Profile settings). Added email verification on
registration — after weighing Resend vs. SendGrid, chose Resend and wired in a real
API key. First verification link showed a false "Verification failed" page despite
the account actually being verified — traced to the verify call double-firing and
fixed.

## 2026-07-29 — Admin stats dashboard with revenue/plan charts (01:33–01:37, continued 02:32–02:37 UTC)

Built an admin stats view — total users/groups, free-vs-paid split, monthly revenue,
plan distribution — at `/admin/dashboard`. Revenue numbers didn't hold up against
known dummy-data counts ("we have 15 premium users, 8 plus, and 6 starters... can we
polish the dummy data sets so that it looks accurate") — corrected total dummy
revenue from ₱3,497 to ₱95,935 across a realistic multi-month spread, and added a
new-subscriptions-vs-renewals chart.

## 2026-07-29 — Private group feeds + public/paid engagement gating (02:52–03:27 UTC)

Built a private per-group feed ("My Circle") where any member (not just the leader)
can post/comment/like, then refined it further: leader posts can be public (visible
in the general feed) or private (group-only), and only paid subscribers can
like/comment on public content — free users can read only, explicitly framed as a
subscription funnel ("it's sort of a gateway to jumping towards being a paid
subscriber"). Verified the full boundary: private posts never leak across groups,
free outsiders see upgrade prompts instead of engagement controls, paid outsiders
can fully engage with public posts.

## 2026-07-29 — Blog comments/likes opened to free users (06:13–06:29 UTC)

Exempted blog posts from the paid-only engagement gate so free users could
comment/like them too, and factored out a shared `useEngagement` hook to remove
duplication between the feed card and blog post views. Verification found two real
bugs: an empty guest `userId` crashed `attachEngagement` (invalid ObjectId cast) for
logged-out visitors, and like/comment counts froze at 0 because they weren't
resynced once the async post data loaded — both fixed.

*(~31-hour gap in the transcript here, 07-29 06:29 UTC → 07-30 13:50 UTC, with no
stated reason — genuine time away from the project, not reconstructed further.)*

## 2026-07-30 — Blog creator planning: block editor + image uploads (13:50–14:10 UTC)

"Alright let's work on the blog creation interface. How do we get something like a
drag and drop functionality of adding headings and images. I want it to be feel
somehow like a modern blog creator." Planned replacing the single `body` string with
a `blocks` array (heading/paragraph/image), a `@dnd-kit` drag-and-drop editor, a
Cloudinary+multer upload endpoint, and server-side excerpt derivation — but the plan
was interrupted before implementation (see next entry). Shipped a few hours later as
the very next commit after `git init` — see [Add drag-and-drop block editor for blog
posts](#2026-07-30--add-drag-and-drop-block-editor-for-blog-posts) below.

## 2026-07-30 — Decision to commit progress to GitHub (14:10 UTC)

Interrupted the blog-editor planning: "before we continue the plan. let's try to
save my progress. can we add this to my github?" The point where the project moved
from pure local Claude Code iteration to version control — `git init` and the single
"Initial commit" (2026-07-30 22:13:41 local) that the project's real git history
begins from. Everything from here on is covered by actual commits, below.

## 2026-07-30 — Initial commit: the whole v0 (squashed)

Everything built 2026-07-28 through the morning of 2026-07-30 (all entries above)
landed as one `git init` + "Initial commit": email/password auth with Resend
verification, 3 roles, admin-managed groups, PayMongo subscription payments, an
admin dashboard, a public landing page, an infinite-scroll social feed, and a public
blog.

## 2026-07-30 — Add drag-and-drop block editor for blog posts

Replaced single-textarea blog posts with a reorderable block editor (heading /
paragraph / image blocks, drag-to-reorder via `@dnd-kit`), with server-side
validation/sanitization of the block list.

## 2026-07-30 — Add blog post thumbnails and card-style previews

Cover thumbnail upload for blog posts, plus a card-based preview layout instead of
plain text links.

## 2026-07-30 — Add blog post edit functionality

Admins can now edit an existing blog post, not just create new ones.

## 2026-07-30 — Let admins view and post to any group's feed

Added an admin-only view of any group's dedicated feed
(`/admin/groups/:groupId/feed`), so admins can moderate or post to a circle without
needing to be its assigned leader.

## 2026-07-30 — Link group names to admin feed view in the general feed

Group name in general-feed post cards now links to that group's admin feed view.

## 2026-07-30 — Link blog post cards in the general feed to their full post page

Blog post cards in the feed link through to the full `/blog/:id` page instead of
being static.

## 2026-08-03 — Add dev proxy so the app can be shared through a single tunnel

`client/vite.config.ts` now proxies `/api` to `localhost:4000` and enables
`host: true` + `allowedHosts: true`, so tunneling just the client port (e.g. `ngrok
http 5173`) exposes both the UI and the API through one URL — needed to give
PayMongo webhooks a reachable HTTPS endpoint while developing locally, without a
second tunnel or CORS setup.

## 2026-08-03 — Add profile pictures and editable profile URLs

Avatar upload via Cloudinary (falls back to color-coded initials if unset), plus a
self-service custom profile slug (vanity URL at `/profile/:slug`).

## 2026-08-03 — Add Goodie Box one-time purchase and admin delivery pipeline

A standalone, one-time-purchase physical care package (`/goodie-box`), separate
from the recurring subscription plans and available to any `user` account
regardless of plan. Own PayMongo Checkout Session + dedicated webhook/secret
(distinct from the subscription webhook). Admin-only delivery pipeline
(`/admin/goodie-box-orders`) advances each paid order through
`pending_delivery` → `in_progress` → `complete`.

## 2026-08-04 — README refresh planning

A short side session to plan and draft a README update reflecting the actual
feature set (Goodie Box, blog editor, group feed visibility, avatar/profile URL
editing), which had drifted out of sync with the app. Landed a day later as part of
[Responsive nav + Goodie Box delivery pipeline layout
polish](#2026-08-05--responsive-nav--goodie-box-delivery-pipeline-layout-polish)
below.

## 2026-08-05 — Responsive nav + Goodie Box delivery pipeline layout polish

Collapsed the navbar into a hamburger menu on mobile (was overflowing on narrow
viewports). Restructured the admin Goodie Box delivery pipeline into a 2-column
pending/in-progress row plus a full-width completed row. Brought README back in
sync with the actual feature set, which had drifted.

## 2026-08-05 — Harden user data security and dedupe drift-prone client code

Ran a security/PII review scoped to the app's real size (~60 non-staff users) and
fixed the load-bearing issues: rotated the still-default `JWT_SECRET`/
`ADMIN_PASSWORD`, added rate limiting on login/register/password-change, stopped
exposing member email addresses to anyone but the profile owner and admins
(`GET /users/:id`, `ProfilePage`, `GET /groups/mine`), guarded a dev-only
verification-token console log behind `NODE_ENV`, stopped leaking
`GoodieBoxOrder.checkoutSessionId` to customers, and closed a NoSQL-filter-injection
gap in `listUsers`. Also deduped the 3x-copied `extractErrorMessage` helper and
consolidated pricing display strings that had drifted into two independent
hand-copied arrays. Full rationale, including what was deliberately deferred (session
invalidation, magic-byte upload validation, a schema-validation library) and why, is
in project memory rather than this log.

## 2026-08-05 — Backfill sessions.md to project start

Added this changelog convention and backfilled it in two passes: git history for
everything from 2026-07-30 onward, then the raw Claude Code session transcript
(mined off disk rather than read directly — 37MB) for the two and a half days
before `git init` that git has no record of at all. Recovered real timestamps and
quotes, including the exact request that led to renaming this project "Haven
Circle." One genuine ~31-hour gap (07-29 to 07-30) had no stated reason and was
left as an honest unknown rather than guessed at.

## 2026-08-05 — Modernize admin dashboard with shadcn/ui

The admin surface (`/admin/*`) had zero design tokens, zero shared UI primitives
(Pagination/Modal/Table markup copy-pasted 2-3x each), and zero admin-specific
navigation — just three extra links bolted onto the main site navbar, with the
blog editor unreachable from any nav at all. Brought in shadcn/ui (Radix +
Tailwind) scoped to the admin surface only — this app's first UI-framework
dependency, deliberately not used on member-facing pages. Added a `@theme` token
layer (slate neutral, indigo primary accent), a real `AdminLayout` with a
collapsible sidebar / mobile slide-over replacing the navbar links, a
`usePaginatedResource` hook + `Pagination` component deduping the copy-pasted
list logic, `Dialog`-based modals with real focus-trap/Escape/backdrop-close
(the credential-reveal screen in the staff-registration modal is deliberately
immune to accidental dismissal), and `Tabs`/`Card`/`ChartContainer`-based
dashboard charts pulling colors from one shared `chartColors.ts` instead of
scattered hex. Shipped as [PR #2](https://github.com/kuyaKF/socialmedia-subgoodiebox/pull/2).

## 2026-08-05 — Add CLAUDE.md

Added a `CLAUDE.md` at the repo root — commands, architecture (auth/roles, the
merged feed content model, PayMongo's webhook-only activation pattern, the admin
UI's shadcn/ui scoping), and the project's actual workflow (chat-driven, no
tickets, Plan Mode for large/risky work only, `tsc` + browser verification,
this changelog, commit-only-when-asked). Trimmed the overlapping private-memory
workflow notes down to just what CLAUDE.md doesn't cover, to avoid the two
drifting apart.

## 2026-08-05 — Bring shadcn/ui to the member-facing "app" pages

Research (two parallel passes over the member-facing surface) found a clear
split: the landing page has genuine deliberate brand craft (a gradient hero,
an amber "Best value" pricing badge, a dark-band visual rhythm) that a
mechanical shadcn swap risked flattening, while the "app" pages — Feed,
Profile, Group, auth, Navbar — were almost entirely generic, duplicated
Tailwind markup with real, quantified drift (the same card recipe
copy-pasted 3 places, 5+ inconsistent button variants, 3+ input variants, a
hand-rolled mobile nav where a `Sheet` primitive already sat unused). Scoped
this pass to the app pages only; landing/blog/subscription/Goodie Box stay
deferred. Also decided to keep the hand-rolled `icons.tsx` (no icon-system
unification churn) and keep `ProfilePage`'s inline expand/collapse editing
instead of converting it to a `Dialog` — a real UX change, not just a re-skin.

Migrated `Navbar` (mobile menu → `Sheet`), `FeedCard`/`Composer` (the
triplicated card recipe → `Card`), `GroupPage`'s roster card, `ProfilePage`'s
forms (`Input`/`Label`/`Textarea`, plus fixing a stray literal `✎` glyph to
use the app's own `PencilIcon`), and `LoginPage`/`RegisterPage`.

Verification surfaced a real, unrelated regression: `getUser`'s response was
missing the `id` field entirely (introduced when the 2026-08-05 security pass
switched it to `user.toObject()`, which drops Mongoose's virtual `id` getter
unless explicitly re-added) — silently breaking every `isSelf`-dependent UI
(edit-profile, change-password visibility) for every user, not just this
session's test account. The same `.toObject()`-drops-`id` pattern existed in
`updateMe`, `updateUserRole`, and `createStaffUser` too; fixed all four.

## 2026-08-05 — Landing page: Goodie Box section + scroll-reveal animations

The landing page never mentioned the Goodie Box at all — a real content gap,
not just stale copy, since it's a real purchasable product. Added a new
`GoodieBoxTeaser` section (between `SubscriptionTiers` and `FAQ`) pitching the
one-time ₱799 purchase as a no-commitment alternative to subscribing, added a
matching Navbar anchor link, and added a FAQ entry clarifying that a
subscription isn't required to get a care package.

Added scroll-reveal animations without a new dependency: a hand-rolled
`useScrollReveal` hook (IntersectionObserver, mirroring the same pattern
already used for Feed/Group infinite-scroll) paired with a polymorphic
`Reveal` wrapper component, using animation utility classes from
`tw-animate-css` (already loaded globally as a shadcn dependency) rather than
pulling in a new animation library. Respects `prefers-reduced-motion`. Applied
to every below-the-fold landing section, with staggered per-item reveal on
the three grid/list sections (Introduction's cards, WhyJoin's reasons,
SubscriptionTiers' tiers).

Verification note: couldn't get a live visual confirmation of the reveal
animation firing in-session — the Browser preview pane wasn't in a composited/
displayed state, and IntersectionObserver callbacks don't fire without actual
compositing (confirmed via a raw vanilla-JS IntersectionObserver test on the
same page, which also didn't fire under the same condition — a tooling
limitation, not evidence of a bug). Structural verification (correct initial
`opacity-0` state, correct DOM nesting, `tsc --noEmit` clean, no console
errors) all passed; the underlying pattern is identical to the already-proven
Feed/Group scroll pattern.

## 2026-08-05 — Remove scroll-reveal animation; fix subscription/Goodie Box copy conflation; redesign Goodie Box page

User feedback on the scroll-reveal animation from the previous entry: "it
looks bad." Removed it outright — deleted `useScrollReveal.ts` and
`Reveal.tsx`, unwound every landing section back to plain unwrapped markup.
No new dependency was added in the first place, so removal was a clean
revert with no residue.

Separately, user flagged that landing/subscription copy conflated the two
paid products: "the subscription is separate from the goodie box, you only
need the subscription if you want to be part of the private community
circle." Investigation confirmed this was a real inaccuracy, not just wording
— grepping the server found zero backend support for a recurring
subscriber care package (no shipping/fulfillment model tied to
`subscription.plan`; only the Goodie Box has real order/delivery tracking via
`GoodieBoxOrder`). The "monthly/quarterly care package" claims baked into
`SubscriptionTiers` (landing), `SubscriptionPage` (the real `/subscription`
page shown to paying users), `Hero`, `Introduction`, `WhyJoin`, and `FAQ`
were all unfulfilled promises. Rewrote all of them to center subscription
value on the one thing that's actually real and backend-enforced — circle
placement and a peer support lead — and reframed `GoodieBoxTeaser`/FAQ to be
explicit the Goodie Box is a standalone purchase with no circle access and no
subscription requirement. Also caught and fixed the same conflation in
`SubscriptionPage.tsx`'s `PLAN_FEATURES` (shown to real paying subscribers,
not just landing visitors) for consistency — this had been missed by the
earlier landing-only copy pass.

Then redesigned `GoodieBoxPage.tsx` (previously a single narrow centered
column) into a proper one-time-purchase product page, informed by a search on
2026-current single-product landing page conventions: benefit-led headline
above the fold, price + one-time framing immediately visible, an icon-based
product visual (no product photography exists for this app, so a large
gift-icon tile with a soft gradient glow stands in), a "What's inside" 3-card
grid, a "How it works" numbered list (delivery details → PayMongo checkout →
pack & ship), and a sticky right-column buy box (`lg:sticky lg:top-24`) that
holds the price, the existing delivery-details form, and the
success/cancelled checkout banners — unchanged functionally, just relocated.
Deliberately did not fabricate reviews/testimonials/return-policy claims,
since this is a real product used by real (if few) users. Verified end-to-end
in-browser: registered a throwaway test account, walked through the
logged-out/staff/regular-user buy-box states, confirmed the sticky column and
mobile stacking both render correctly, then deleted the test account via the
established one-off-script-then-delete pattern.

## 2026-08-06 — Add GCash and QRPH as payment methods

User asked to add GCash (and separately, QRPH came up as an option) alongside
the existing card-only PayMongo checkout. Both are one-time hosted-checkout
payment method types PayMongo supports natively — no data model or webhook
changes needed, since Checkout Sessions abstract the underlying method and
still fire the same `checkout_session.payment.paid` event regardless of which
one the payer picks. Added `'gcash'` and `'qrph'` to the `paymentMethodTypes`
array passed into `createCheckoutSession` in both
`payments.controller.ts::createCheckout` (subscription purchase) and
`goodieBox.controller.ts` (Goodie Box purchase), for consistency across both
one-time-purchase products.

Verified live rather than assumed: registered a throwaway account, triggered
a real checkout session against PayMongo's test-mode API, and confirmed via
the actual hosted checkout page that QR Ph, Card, and GCash (under "E-Wallets")
all render as selectable options with no errors — meaning both are already
activated on this PayMongo account, not just accepted API values. Cleaned up
the test account and its `Payment` record via the established
one-off-script-then-delete pattern.

## 2026-08-06 — Recurring billing, Phase A: server-side foundation (planned via Plan Mode)

User asked for real recurring billing (auto-renew), on top of the existing
one-time-checkout-only model. Researched PayMongo's actual Subscriptions API
(Plans/Subscriptions/Customers/vaulted Payment Methods — genuinely exists,
confirmed via their docs) before planning anything. Two hard constraints
shaped the design: only card and Maya support automatic recurring charges
(GCash needs a special PayMongo support arrangement, QRPH is inherently
one-time by design), and PayMongo must enable Subscriptions on the account
before it can even be tested. Decided with the user: this is an **additive**
opt-in "auto-renew" path for card/Maya, layered on the existing Checkout
Session flow — GCash/QRPH/manual-card users are completely unaffected — staged
as three independently-approvable phases. Full design in
`C:\Users\kuyaKF\.claude\plans\i-have-added-a-floating-dewdrop.md`.

Phase A (server foundation, no user-facing change) implemented:
- New `RecurringSubscription` model — one doc per user's PayMongo Subscription
  lifecycle (customer/subscription/payment-method ids, status, period end).
- `Payment` model loosened (`checkoutSessionId` now optional+sparse) and
  extended with `paymongoInvoiceId` + a `source: 'checkout' | 'subscription_invoice'`
  field, so recurring invoice charges land in the same collection the
  existing admin revenue/renewal stats already read from — zero changes
  needed to `adminStats.controller.ts`.
- `User.subscription` gained `paymongoCustomerId`/`paymongoSubscriptionId`,
  and `SubscriptionStatus` widened to add `'past_due'`.
- `ensureSubscriptionCurrent` (the lazy 30-day-expiry check) now exits early
  for users with a `paymongoSubscriptionId` set — their state is kept honest
  by the new webhook (Phase B), not by lazy polling, so a webhook-delivery
  lag can't incorrectly free-tier a still-paying customer.
- `server/src/utils/paymongo.ts` gained `createPlan`/`createCustomer`/
  `createSubscription`/`cancelSubscription`/`listCustomerPaymentMethods`/
  `deleteCustomerPaymentMethod`, via a small shared `paymongoRequest` helper
  (justified by six near-identical new call sites; the original
  `createCheckoutSession` was left untouched to avoid risk on tested code).
  Explicitly does not accept/forward raw card fields server-side — that stays
  client-side (Phase C), preserving the zero-PCI-scope principle.
- New one-off script `server/src/scripts/createPaymongoPlans.ts` (not yet
  run — blocked on PayMongo support confirming Subscriptions is enabled on
  the account first) to create the three real PayMongo Plan resources and
  print their ids for `.env`.
- Four new optional env vars (`PAYMONGO_SUBSCRIPTION_WEBHOOK_SECRET`,
  `PAYMONGO_PLAN_ID_STARTER/PLUS/PREMIUM`), documented in `.env.example`.

Verified: `tsc --noEmit` clean; live regression check in-browser (register →
`/subscription` → "Choose Starter" → real `201` checkout session created
against PayMongo, redirected to their hosted checkout page) confirms the
existing one-time GCash/QRPH/card flow is completely unaffected by the
`Payment`/`User`/`ensureSubscriptionCurrent` changes. Test account and its
`Payment` record cleaned up via the established script-then-delete pattern.
Phase B (webhook + setup/cancel endpoints) and Phase C (client UI) are next,
gated on PayMongo confirming Subscriptions enablement on the account.

## 2026-08-06 — Sticky LinkedIn-style profile sidebar on the Feed page

User sketched a red box over the empty left margin of their own Feed page
screenshot and asked for a sticky panel there with their avatar + name,
LinkedIn-inspired, plus research on what else to add so it wouldn't look
empty. Researched LinkedIn's actual left-rail sidebar content and general
community-platform sidebar patterns (points/streaks/badges/leaderboards) —
then deliberately excluded the gamification half of that research: this
app's whole positioning ("a safe space, always open," "no contracts, no
pressure") makes competitive/engagement-metric widgets tonally wrong here,
not merely unnecessary.

Final content, all built from data the app already honestly has (no fake
metrics): avatar/name/role + "member since" date + edit-profile link; a
"your circle" section (name, accurate live member count, link to `/group`,
with `GroupPage.tsx`'s own "No circle yet" tone reused for users not yet
placed); and — member-role users only — a plan-status line with a real
upgrade nudge for free users (mirroring `FeedCard.tsx`'s existing "Upgrade to
a paid plan to like posts" copy) since free users genuinely can't like/comment
per `engagement.controller.ts`'s gating. New `client/src/components/feed/
ProfileSidebar.tsx`, `FeedPage.tsx` restructured into a `lg:grid-cols-
[280px_1fr]` layout with `lg:sticky lg:top-24` on the sidebar column
(matching `GoodieBoxPage.tsx`'s only other sticky-sidebar precedent in the
codebase), plain block-stacking below `lg` — no extra mobile-specific logic
needed. Removed the now-redundant "Welcome, {name}" heading since the
sidebar owns that identity function everywhere, including on mobile where it
stacks above the feed.

The circle member count needed zero backend work: `auth.controller.ts`'s
`login`/`me` handlers already `.populate('group', 'name leader members')`,
so the raw member-id array was already in every `/api/auth/me` response —
just missing from the client's `GroupRef` type. Widened that type instead of
adding a new endpoint.

Caught and fixed a real, unrelated bug while verifying: `publicUser()` in
`auth.controller.ts` never actually included `createdAt` in its response
shape, despite the client's `User` type declaring it as present — every
"member since" style feature would have silently rendered "Invalid Date"
network-wide, not just in the new sidebar. Fixed by adding `createdAt:
user.get('createdAt')` to the serializer.

Verified: `tsc --noEmit` clean on both sides. Live-tested as an admin (no
circle, no plan section — correctly absent) and as a seeded dummy user in a
7-member circle (member count matched the admin panel exactly; their
seed-generated paid plan had already lapsed, so `ensureSubscriptionCurrent`
correctly downgraded them to free on login and the sidebar's upgrade nudge
rendered right along with it — a nice confirmation both pieces interact
correctly). Confirmed via computed-style checks that `position: sticky`
only engages at the `lg` breakpoint and the container correctly falls back
to plain block stacking on mobile.

## 2026-08-06 — Social feature gap research, then comment deletion + post editing

User asked for research on which "basic social media features" the app is missing. Combined an
external check of standard social-app feature checklists with a direct, grep/read-confirmed
inventory of this codebase. Confirmed absent: password reset, member-facing search, notifications,
follow/friend system, block/report, media in feed posts, reactions beyond a single like,
mentions/hashtags, sharing/reposting, read receipts/presence, and — the two picked to build —
comment deletion (nobody but an admin could ever delete a comment, not even its own author) and
post editing (announcements/group posts had create+delete only; blog posts were the one exception
with a working `PATCH`). Recommendation explicitly filtered generic "social media" feature lists
through this app's actual positioning — flagged follow systems, multi-reaction, hashtags, and
stories as probably wrong fits given the deliberately curated, "no pressure" circle model, rather
than treating every item on a generic checklist as something to build.

Implemented the two features the user chose, both mirroring existing patterns exactly rather than
introducing new ones: `deleteComment` (`engagement.controller.ts`) and `updateGroupPost`
(`groupPosts.controller.ts`) reuse the same author-or-admin permission check `deleteGroupPost`
already had; `updateAnnouncement` needed no extra check since the whole announcements router is
already admin-gated. Client-side: `FeedCard.tsx` gained a `currentUserId` prop (per-comment delete
visibility) and an inline edit mode (`PencilIcon` toggle → `Textarea`, Save/Cancel) reusing the same
`Textarea` component `Composer.tsx` already uses — deliberately scoped to body-text edits only, and
explicitly excluding blog posts (which keep their existing dedicated editor) and group-post
visibility (editing never changes the public/private toggle, avoiding re-litigating the
leader/admin-only public-toggle logic that already exists on creation).

Verified via direct DOM/network inspection in-browser (screenshot compositing was unavailable
again this session, same known limitation as before) rather than screenshots: confirmed the
delete-comment button appears only for the comment's own author or an admin (tested as both a
seeded member and as admin, including admin deleting a pre-existing comment authored by someone
else — "Mar Joseph Mojedo"); confirmed group-post edits persist across a full page reload; and
confirmed — after first catching a flawed DOM-traversal test that produced a false positive — that
a non-author, non-admin member correctly sees no edit/delete controls on someone else's post, once
the check was properly scoped to the actual feed-card boundary. `tsc --noEmit` clean on both sides
throughout. Test announcement/group-post artifacts cleaned up after verification.

## 2026-08-10 — Homepage redesign: "Parish Noticeboard" (Impeccable)

First use of the `impeccable` skill/plugin in this repo. User asked to update the homepage
aesthetic with no starting inspiration in hand, so this ran the full cold-start flow: `init`
(wrote `PRODUCT.md` — users, positioning ["small, led circles" vs. an open feed], and an explicit
note that the entire brand, including the "Haven Circle" name, is open to revisiting), a Persuade-
mode surface interview (primary action: "explore first"; free to restructure sections/copy; avoid
clinical/therapy-sterile), then the direction-picking roll (`concept-seed.mjs`, no image generation
available this session, so text-only cards presented via `AskUserQuestion` instead of the normal
browser decision page). The roll assigned "Community Plot Map" (a garden/seed-swap world); the user
instead chose the offered "MY PICK" alternate, **Parish Noticeboard** — a trusted community-hall
corkboard (pinned index cards, torn tabs, layered paper) — a legitimate, explicitly-supported
outcome of that flow, not a fallback.

Rebuilt `LandingPage.tsx` and all of `components/landing/*` (Hero, Introduction, WhyJoin,
SubscriptionTiers, GoodieBoxTeaser, FAQ, BlogPreview, Newsletter, LandingFooter) in the new world:
Permanent Marker (headings) / Special Elite (labels) / Work Sans (body) via a Google Fonts link in
`index.html`, a `.pin-card`/`.bg-corkboard`/`.bg-paper` primitive set added to `index.css` (CSS-only
cork texture via layered `radial-gradient`s — no image generation available), and a Committed color
strategy (deep pine `#2b4a3e` dominant, torn-tab red `#b23a2e` as the sole CTA/pin accent). Kept
deliberately separate from the admin dashboard's shadcn `@theme` tokens, matching this repo's
existing member-facing/admin split.

One real mid-build discovery: the *existing* landing copy turned out to already be far more
specific than "general wellbeing" — explicit "mental health awareness" framing plus a real NCMH
crisis-hotline disclaimer in the FAQ and footer. That safety-critical and pricing-config-driven
copy (crisis line, `PLAN_LABELS`/`PLAN_PRICE_LABELS` from `config/plans.ts`, Goodie Box pricing) was
preserved verbatim/functionally throughout — only presentation changed, never the substance.

Self-caught two craft-floor violations before calling it done: several CTA buttons used a hard
zero-blur offset shadow (`0_3px_0`), which the skill's floor explicitly bans outside an actual
neobrutalist world — swapped for soft blurred offset shadows. And two sections had light cream body
text sitting directly on the corkboard background at reduced opacity, computing to ~3.3:1 contrast
(below the 4.5:1 body-text floor) — fixed by darkening `.bg-corkboard`'s base tones (`#9c7248` family
→ `#7a5636` family) and standardizing muted label text on `#6b5f4a`, both re-verified by hand-computing
WCAG relative luminance since no contrast tooling was available. Wrote `DESIGN.md` documenting the
new world (palette, type roles, the contrast rationale, and what's explicitly out of scope — the
shared `Navbar` stays untouched, since it's used across every public route, not just `/`).

Verification note: neither a browser/screenshot tool nor a working local HTML/CSS parser was
available this session (`detect.mjs` ran in degraded regex-only mode and returned no findings —
explicitly not a clean bill of health), so the finish review that Impeccable normally runs via
screenshots was skipped and disclosed rather than faked; verification was `tsc --noEmit` (clean)
plus a manual craft-floor read-through and hand-computed contrast math instead. Dev server left
running on `:5173` for the user to check visually themselves.

## 2026-08-10 — Homepage redesign pivot: "Watercolor Stationery" replaces "Parish Noticeboard"

Same session as the corkboard build above. User shared a reference image (an unrelated brand's
watercolor-floral logo — overlapping pastel washes, a hand-brush-script wordmark over a small
tracked-caps subtitle) and asked to pivot the homepage toward that stationery/watercolor register
instead. Confirmed two things before rebuilding: full replace rather than a blend (with the explicit
ask to keep a rollback path to the pre-Impeccable original — already guaranteed for free, since
nothing had been committed between the two redesigns, so `git checkout -- <file>` still reaches the
true original), and that "Haven Circle" itself should get the hand-script wordmark treatment, an
explicit legibility tradeoff the user chose knowingly.

Per Impeccable's own rule that a user-pinned reference beats the roll, this skipped the
concept-seed/direction-picking flow entirely and went straight to build. Translated the reference's
*system* only — palette family (dusty indigo ink, blush, sage, powder blue over warm ivory),
watercolor-wash texture, and script+sans lettering pairing — never its literal brand name or
wordmark text, which doesn't belong to Haven Circle.

Rebuilt the same 9 landing components again: Caveat (script) swapped in for the wordmark only —
deliberately never used for section headings, body copy, or the crisis-line disclaimer, keeping the
one legibility tradeoff as narrow as possible — paired with Nunito for everything functional. New
`.bg-wash-*` utilities (index.css) use layered `radial-gradient`s with `multiply` blend for a
CSS-only watercolor texture (still no image generation available). Learned from the corkboard
build's contrast near-miss and designed around it this time: adopted a hard rule that text never
sits directly on a wash background (spatially-varying gradients can't be contrast-checked with one
number) — everything reads inside an opaque `.stationery-card`, with hand-verified contrast ratios
recorded in `DESIGN.md`. Added two new botanical line-art icons (`SprigIcon`, `FlowerIcon`) to
`components/icons.tsx`, matching its existing 20×20 hand-drawn style, for restrained floral accents.
`PRODUCT.md`'s Brand Commitments section was updated to record the pinned reference and the wordmark
decision; its Evidence on Hand section was also corrected — an earlier note wrongly called the
landing copy "generic boilerplate placeholder," when it's actually real, specific, already-considered
content (explicit mental-health framing, a real NCMH crisis-hotline disclaimer) that both redesigns
preserved verbatim throughout.

Verified the same way as the corkboard build: `tsc --noEmit` clean, no browser/screenshot tool
available this session so no automated finish review, manual craft-floor read-through plus
hand-computed WCAG contrast math instead (recorded in `DESIGN.md` for future reference). Dev server
left running on `:5173`.

## 2026-08-10 — Hero background: animated watercolor wash + optional photo layer

Follow-up to the Watercolor Stationery redesign above, same session. User asked for the hero's
watercolor wash to be animated and semi-transparent so a background photo could sit behind it later.
Replaced the flat `.bg-wash-hero` gradient with `.hero-wash`/`.hero-blob` (index.css): 5 individually
drifting blurred blob `<div>`s (`filter: blur`, `mix-blend-mode: multiply`, staggered keyframe
durations/directions for organic movement), respecting `prefers-reduced-motion`. Added an optional
photo layer beneath the wash in `Hero.tsx` referencing `client/public/hero-bg.jpg` — absent by
default (no file exists yet, and none was fabricated, since no image generation was available this
session either); the layer simply stays empty until the user drops a file at that path, no code
change needed. Scoped the animation to the hero only, leaving the other three wash sections static
for rhythm contrast. `tsc --noEmit` clean; dev server left running on `:5173` for the user to check
and to drop in their photo whenever they have one.

## 2026-08-10 — Navbar redesign: bridge treatment, plus a broken dev-server diagnosis

User reported login and the blog list broken. Root cause: an earlier `npm run dev` had been run
from `client/` instead of the repo root (leftover `cd` from a prior command), so it only started
Vite, never the API server — every `/api/*` call was hitting `ECONNREFUSED` through the proxy.
Stopped the stray process, restarted `npm run dev` properly from root (client landed on `:5174`
since `:5173` briefly stayed held by the killed process).

Then: "the navigation... seems kind of bland." `Navbar.tsx` is shared chrome — `SiteLayout` renders
it on every public/member route, not just the homepage, so it's the one component sitting on both
the new watercolor world and the still-unstyled app pages (Feed/Profile/Group/Subscription).
Flagged this before touching anything rather than assuming: offered full watercolor, a full
app-wide watercolor extension, or a restrained bridge; user chose the bridge, "quietly elevated,
world-agnostic." Ran this as a refinement (extend-existing-surface), not a new-work direction round
— no concept-seed roll, since the ask was explicitly to stay restrained rather than commit to a
world.

Kept the existing shadcn `Button`/`Sheet` primitives, and added: `bg-white/85 backdrop-blur-md` +
`shadow-sm` (replacing flat white + hard border — the sticky bar now sits over scrolling content,
so a frosted-glass treatment is a motivated choice here, not decoration for its own sake); wordmark
recolored to the watercolor ink `#2C4870` plus a small `UsersIcon` badge tinted with the sage
accent (echoing Introduction.tsx's own icon-badge pattern); a real active-route indicator that
didn't exist before (bold + ink color); `rounded-full` CTA buttons and a soft accent ring on the
avatar. Deliberately kept out: script font, wash/blob backgrounds, full palette commitment — the
nav stays quieter than the homepage on purpose so it doesn't fight either surface it sits on.
Added a `className` prop to the shared `Avatar` component (previously accepted none) to make the
ring possible without a wrapper div; backward-compatible, every other call site unaffected.

Wrote a surface brief for the Navbar (new — it had none before) recording the bridge decision and
flagging it as provisional: worth revisiting if Feed/Profile/Group/Subscription ever get their own
redesign. Updated `DESIGN.md`'s Watercolor Stationery entry to replace the stale "Navbar left
untouched" line with a proper "Shared chrome: Navbar" section. `tsc --noEmit` clean; the mechanical
detector ran in the same degraded regex-only mode as prior sessions (missing parser deps), so its
empty result isn't treated as a clean bill of health.

## 2026-08-10 — Hero wash: bigger/visible blobs, real background photo wired in

Two more follow-ups to the hero wash, same session. First, the blobs were barely visible — sized in
fixed rem units and positioned with large negative corner offsets, so most of each blob's area sat
outside the clipped section. Caught a real bug while fixing it: applying both the corner-centering
transform and the drift-animation transform to the same element doesn't compose — a CSS animation
targeting `transform` fully overrides any other transform on that element, so the centering would
have silently broken the instant the animation started. Fixed by splitting each blob into a static
positioning wrapper (top/left %, size in `vmin` so it scales with viewport, centered via
`-translate-1/2`) around the animated inner blob, and switched `mix-blend-mode` from `multiply` to
`soft-light` so the wash would not crush toward black over a darker photo.

Second, the user tried a moody storm-cloud sunset photo first, then dropped in a better-fitting
Unsplash poppy/wheat field photo (`client/public/enrico-bet-IicyiaPYGGI-unsplash.jpg`) instead.
Couldn't save either photo directly — a pasted/attached chat image is only visible to read, not
accessible as raw file bytes to write to disk — so the user placed the file themselves; once it
existed, wiring it in was a one-line `background-image` URL change in `Hero.tsx` (kept the
credit-bearing Unsplash filename rather than renaming it). `tsc --noEmit` clean; confirmed both the
page and the new asset serve correctly via curl.

## 2026-08-10 — Sticky navbar

Small follow-up, same session: made the shared `Navbar` (used across every public/member route, not
just the homepage) `position: sticky` so it stays pinned at the top while the page scrolls. Added an
explicit `bg-white` (a sticky element with no background lets scrolling content show through behind
it) and `z-50` (it now needs to win the paint order against the hero's own absolutely-positioned wash
layers, which it previously never had to). `tsc --noEmit` clean.

## 2026-08-10 — Mobile nav: personalized drawer instead of a plain link list

Follow-up to the navbar bridge redesign: "improve the mobile navigation as well." The mobile
`Sheet` drawer had been reusing the exact same plain-text `links` markup as the desktop bar, just
reflowed vertically — fine functionally, but a vertical drawer has room a horizontal bar doesn't,
so gave it its own treatment instead of just inheriting the desktop one.

Replaced the generic "Menu" title with a personalized header: signed-in users see their avatar
(same accent ring as the desktop version), name, and role, the whole block wrapped in a link to
their profile; signed-out users see the wordmark + icon badge. Built a separate icon-led item list
for the drawer only (`HomeIcon`/`UsersIcon`/`BookIcon`/`GiftIcon`/`HeartIcon`/`GearIcon` — the last
two new additions to `icons.tsx`, matching its existing 20×20 hand-drawn stroke style), with the
active route getting a tinted background + bold ink text rather than a colored border (the craft
floor bans colored side-borders on list items). Moved the primary CTA (Join now / Log out) into
`SheetFooter`, which pins it to the bottom of the drawer via `mt-auto` regardless of list length —
thumb-reachable instead of wherever it happened to fall at the end of a flat list.

`tsc --noEmit` clean; mechanical detector ran in the same degraded mode as before (not a clean
bill of health, just no new mechanical findings). Updated `DESIGN.md`'s Navbar section with the
concrete mobile-menu choices and reasoning.

## 2026-08-10 — Homepage Goodie Box panel: two-column to single-column

`GoodieBoxTeaser.tsx` (the "Try a Goodie Box first" `#goodie-box` section) used an icon-beside-text
`sm:grid-cols-[auto_1fr]` layout. Switched to a single stacked column at all breakpoints: icon badge
centered on top, then centered headline/copy, then the feature checklist and CTA both centered
beneath. Trimmed the card's max width from `max-w-3xl` to `max-w-xl` since a narrower single column
reads better than a wide one. `tsc --noEmit` clean.

## 2026-08-10 — FAQ accordion: smooth open/close animation

The FAQ accordion answers previously appeared/disappeared instantly (`{isOpen && <p>...}`). Added a
`.faq-panel` utility in `index.css` using the `grid-template-rows: 0fr → 1fr` technique to animate
height without knowing the answer's length up front (the standard way to do this without JS
measurement) — respects `prefers-reduced-motion: reduce`, consistent with the hero blobs. Also
synced the chevron's rotation to the same 300ms duration, added a hover tint on each question button
(`hover:bg-[#2C4870]/5`, matching the mobile nav's active-row tint), and a slightly deeper shadow on
the open card. `tsc --noEmit` clean.

## 2026-08-10 — Blog pages brought into the Watercolor Stationery world

`BlogListPage.tsx` and `BlogPostPage.tsx` were still the original plain shadcn-slate styling —
the same treatment as the logged-in app pages (Feed/Profile/Group/Subscription). Decided with the
user to extend the Watercolor Stationery world here specifically, not to the app pages: the blog is
public Persuade/Read content, closer in spirit to the homepage than to the logged-in app shell (the
same distinction that kept the Navbar in a neutral bridge treatment rather than going full
watercolor).

List page: centered heading + one-line descriptive subhead (prose below the heading, not an
eyebrow/kicker label above it — the craft floor bans that pattern), the first post on page 1 as a
large horizontal featured `.stationery-card`, the rest in a `sm:grid-cols-2` card grid, pill-styled
pagination, and a tinted-icon-tile fallback for posts without a thumbnail instead of a flat grey box.

Post page: title/byline/hero image sit on the flat `#FFFDF9` page background (flat solid
backgrounds are contrast-safe on their own, unlike the gradient washes — only washes need the card
wrapper per the Contrast rule), the actual post content (heading/paragraph/image blocks) lives in
one `.stationery-card` reading surface, like/comment controls became pill buttons, and a liked post
shows a filled ink-colored heart on a soft blush chip rather than reusing the `#B23A5C` error-red
token (kept scoped to form errors only, per the palette table). Comment bubbles and the comment
input/post button were restyled to match the homepage's ink-tint and rounded-full language.

Both pages are presentation-only changes — all post content, comments, likes, pagination, and the
admin edit-post link behave exactly as before. `tsc --noEmit` clean; verified `/blog` and `/`
both serve 200 from the dev server. Updated `DESIGN.md` with a new "Extension: Blog" subsection
documenting the decision and the concrete choices.

## 2026-08-10 — Goodie Box page brought into the Watercolor Stationery world

Same reasoning as the blog: `/goodie-box` is public Persuade content (buyable without a
subscription), not a logged-in Operate page, so it got the same treatment. While restyling,
spotted that the hero's small tracked-caps badge ("One-time purchase · No subscription required")
sat directly above the `<h1>` — exactly the eyebrow/kicker-above-heading pattern the craft floor
bans. Folded that message into the intro paragraph and kept a shorter version as a trailing pill
below the price line instead of leading the heading with it.

Also swapped `DeliveryStatusPill` and the hero icon's decorative glow off Tailwind's default amber/
sky/emerald/indigo/fuchsia onto the documented palette tints (blush/powder-blue/sage at low opacity
with ink text/icon on top — the same pattern used for icon badges everywhere else in this world),
and replaced the `emerald-600` "Payment confirmed" caption with a check icon + body-ink text since
this palette has no dedicated success color. Form error text keeps `#B23A5C` — its one documented,
correct use case. Orders list, checkout form, PayMongo redirect, and payment-confirmation polling
are all unchanged — presentation-only. `tsc --noEmit` clean; `/goodie-box` verified serving 200.
Updated `DESIGN.md` with a new "Extension: Goodie Box page" subsection.

## 2026-08-10 — Login page reuses the homepage hero background

User asked for the login form to sit in a white panel over the homepage hero's background, the way
the wordmark card does on `/`. Rebuilt `LoginPage.tsx` on the same photo-layer-plus-animated-wash
background as `Hero.tsx`, with the form in a `.stationery-card` panel — centered vertically this
time (unlike the hero, whose content fills the section, this page's short form needs explicit
centering to avoid a big empty gap).

While doing this, noticed the blob wash markup would otherwise be hand-copied into a second file,
which is exactly the kind of drift-prone duplication this project avoids — extracted it into a new
shared `HeroBackground.tsx` component (photo layer + all 5 blobs) and pointed both `Hero.tsx` and
`LoginPage.tsx` at it; no visual change to the homepage, just removed the duplication before it
existed.

Also swapped the page off shadcn `Input`/`Label`/`Button` (a holdover from an earlier "migrate
member-facing UI to shadcn" pass that got reversed everywhere else once the watercolor world shipped
— shadcn is meant to be `/admin`-only per `DESIGN.md`'s Scope section) onto the same hand-rolled
rounded-xl inputs and pill button already used on the Blog and Goodie Box forms, so every
watercolor-world form now shares one input language.

Deliberately left `/register` untouched — it still uses the old shadcn form and now visually
mismatches the page one click away from it, but the user only asked about login; flagged rather than
changed unprompted. `tsc --noEmit` clean; `/login` verified serving 200. Updated `DESIGN.md` with a
new "Extension: Login page" subsection.

## 2026-08-10 — Login section: fullscreen height, panel anchored near the top

Two follow-up requests on the login page from the same day. First: the section's fixed `min-h-144`
left plain whitespace below it on tall viewports — wanted the section (background included) to fill
the full remaining screen height instead. Made `SiteLayout.tsx` a flex column with a `flex-1`
wrapper around `Outlet`, so a page can opt into filling all remaining vertical space by giving its
own root element `flex-1`; confirmed this doesn't affect other pages since a flex-column's default
stretch only touches width, not height.

Second, immediate follow-up: making the section fill the screen also vertically centered the panel
in the middle of a much taller box, pushing it further down than it used to sit. Switched the
section from `items-center` to `items-start` (with `pt-16`/`sm:pt-20` for breathing room) so the
panel anchors near the top like the original fixed-height version, while the wash/photo background
still fills the entire section height either way — no visible whitespace regardless of where the
panel sits vertically. `tsc --noEmit` clean; `/login` and a handful of other routes verified serving
200 after the `SiteLayout` change. Updated `DESIGN.md`'s Login extension notes with the final
layout approach.

## 2026-08-10 — Hero background simplified to just the photo

User asked to strip the hero (and the login page, which shares the same background — confirmed both
in scope) down to just the background photo: remove the decorative `SprigIcon`/`FlowerIcon` accents
and the animated semi-transparent watercolor wash entirely, not just visually hide them. Simplified
`HeroBackground.tsx` to render only the photo-layer `<div>` (dropped the 5-blob `.hero-wash` markup),
removed the icon JSX from `Hero.tsx` and `LoginPage.tsx`, and — since both became fully unused
anywhere in the app — deleted `SprigIcon`/`FlowerIcon` from `icons.tsx` and the `.hero-wash`/
`.hero-blob`/`@keyframes hero-blob-drift` rules from `index.css` rather than leaving dead code
behind. `tsc --noEmit` clean; `/` and `/login` verified serving 200. Updated `DESIGN.md`'s
Materials & Login-extension notes to reflect the simplified, photo-only background.

## 2026-08-10 — Hero background: diagonal tint added back for style

Immediate follow-up: the plain photo felt flat, so added a single static diagonal gradient layer
over it in `HeroBackground.tsx` (`bg-linear-to-br from-[#2C4870]/45 via-transparent
to-[#E888A0]/25`) — ink in one corner, blush in the other, transparent through the middle so the
photo still reads clearly. Deliberately not the animated blob wash from before (that was removed by
explicit request last entry) — this is one static layer, no motion, no separate blob elements.
Applies to both the homepage hero and the login page since they share the component. `tsc --noEmit`
clean; `/` and `/login` verified serving 200. Updated `DESIGN.md`'s photo-layer note with the tint
details.

## 2026-08-10 — Hero headline: typewriter animation cycling three slogans

User asked for the hero headline ("You don't have to carry it alone.") to type in, clear, and type
a new slogan, and for two new empathetic/comforting slogans to add to the rotation. Wrote two more
in the same short, second-person, non-clinical voice: "It's okay to not be okay right now." and
"Healing isn't linear — and neither are you." — all three now cycle continuously (type → hold →
delete → next).

Built as `useTypewriter` (`client/src/hooks/useTypewriter.ts`, a generic type/hold/delete/repeat
hook over an array of phrases) plus `TypewriterHeadline` (`client/src/components/landing/
TypewriterHeadline.tsx`, the rendering half — Hero.tsx still owns the actual `<h1>` element).
Accessibility-wise, the animated text is `aria-hidden` with a `sr-only` span carrying the first
slogan as one stable heading, so screen readers get real content instead of mid-type fragments or a
constantly-changing announcement. `prefers-reduced-motion: reduce` skips the animation entirely
(hook just sets the first slogan statically, no cycling, no blinking caret) — same convention as
every other motion added in this world. Gave the `<h1>` a fixed `min-h-18 sm:min-h-24` (sized for
two lines) so the layout doesn't jump as slogans of different lengths type in and out. `tsc
--noEmit` clean; `/` verified serving 200. Updated `DESIGN.md`'s Materials & components section
with the new slogans and the accessibility/reduced-motion approach.

Immediate follow-up: hold time bumped 2200ms → 3600ms (more time to actually read each slogan) and
deleting speed 30ms/char → 15ms/char (clears noticeably faster than it types) in
`useTypewriter.ts`'s constants. `tsc --noEmit` clean.

Second follow-up: replaced the character-by-character delete with a whole-phrase fade-out, and
pushed the hold time up again (3600ms → 4800ms). Reworked `useTypewriter`'s phase machine to
`typing → holding → fading → paused → typing`: `fading` flips a `visible` boolean that
`TypewriterHeadline` maps to an inline `opacity` style on a `.typewriter-fade` span (CSS
`transition: opacity 500ms`, exported as `TYPEWRITER_FADE_MS` so the hook's timeout matches the
CSS duration exactly, then the phrase swaps and types back in at full opacity). The typing entrance
is unchanged — only the exit changed from delete to fade, matching what was asked. `tsc --noEmit`
clean; `/` verified serving 200. Updated `DESIGN.md`'s typewriter-headline notes to describe the
fade-based sequence.

Third follow-up: the fade was firing both directions — since the transition class was applied
unconditionally, the opacity snap back to 1 for the next phrase was also animating over 500ms,
looking like an unwanted fade-in during typing. Fixed by only applying the `.typewriter-fade`
transition class while `phase` is `'fading'` or `'paused'` (`isFading`, now returned from the hook)
— removing the class in the same render that flips `visible` back to `true` means the browser sees
no `transition` property on that particular style change, so it snaps instantly with no animation,
while the fade-out (class present, opacity 1→0 in the same render) still animates normally per the
CSS transitions spec (transition behavior is determined by the after-change style). `tsc --noEmit`
clean; `/` verified serving 200.

## 2026-08-14 — Admin dashboard: daily Goodie Box revenue chart

User asked for a daily-granularity chart alongside the existing Goodie Box revenue graphs,
matching the "revenue per day (current month)" chart already on the Signups tab. Found the server
was already computing this exact breakdown internally (`goodieBoxRevenueByDayRows` in
`adminStats.controller.ts`) but only used it to derive the `currentMonthGoodieBoxRevenue` total —
the day-by-day array itself was never included in the API response. Built the missing
`goodieBoxRevenueByDay` array the same way the existing `revenueByDay` one is built, added it to
the response and to the client `AdminStats` type, and added a matching `ChartCard` ("Goodie Box
revenue per day · {month}") to the Goodie Box tab in `AdminDashboardPage.tsx`, reusing the exact
same `BarChart` config as the equivalent subscription-revenue daily chart. `tsc --noEmit` clean on
both sides; verified in-browser as admin — the new chart renders real data (a ₱2,397 spike on the
one day with an order, matching the raw API response) and sits cleanly in the existing 2-column
grid alongside the other Goodie Box charts.

Also noted in passing: this session picked up the `impeccable` Claude Code plugin (installed
separately via VS Code CLI, confirmed via its `installed_plugins.json`/`settings.json` registration
and its `PostToolUse` design-hook firing on this session's edits) — unrelated to this chart, just
recording that it's now active for future design work in this repo.

Immediate follow-up: on desktop, the new daily chart sat alone in the 2-column grid's second row
with the "Orders by delivery status" card forced onto its own full-width row below (it had
`lg:col-span-2`), leaving a blank cell beside the daily chart. Removed the span so it auto-fills
that empty slot next to the daily chart instead, and switched its internal chart+legend layout from
side-by-side (`sm:flex-row`, sized for a full-width card) to stacked (`flex-col`), since `sm:` is a
viewport breakpoint, not a container query — it would've stayed side-by-side and cramped in the now
half-width card otherwise. Verified at a real desktop viewport width (1280px) in-browser: the donut
card now sits directly beside the daily revenue chart with no leftover whitespace.