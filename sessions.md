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
