# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Registrants land in an unassigned pool and are placed by an admin into a "circle" (small group) led
by an `internal`- or `admin`-role member. The primary member is looking for general wellbeing and
connection — not support tied to one specific diagnosis, life event, or identity. Real scale is
~60 non-staff users on a solo-maintained app; every product and design decision is sized to that,
not to an enterprise-scale audience.

## Product Purpose

Haven Circle is a peer-support social/community platform. Success is a member feeling genuinely
connected and supported inside their circle — not raw engagement/time-on-app metrics.

## Positioning

The differentiator is **small, led circles**, not an open free-for-all feed: every member belongs
to a real, admin-assigned small group with a dedicated human leader, checked server-side against
`Group.leader`. That structure — curated membership, a named person responsible for each circle —
is the pitch against a generic Facebook group or Discord server, where anyone can post to everyone
and no one is accountable for the room.

## Operating Context

- Subscription tiers (Starter/Plus/Premium) via PayMongo hosted Checkout; a one-time Goodie Box
  purchase is a separate product.
- A merged feed (announcements, blog posts, group posts) plus each circle's own dedicated group
  page.
- Roles: `user` (subscriber, never a leader), `internal` (staff, leader-eligible, no Subscription
  page), `admin` (same as internal plus group/staff management).

## Capabilities and Constraints

- Solo-maintained, ~60 non-staff users — features and any redesign should stay correct and simple
  at this scale, not be over-engineered for growth that isn't planned.
- No true auto-recurring billing (one-time Checkout sessions with a lazily-expiring period).
- Auth is a single 7-day JWT in an httpOnly cookie; no refresh rotation.
- The admin dashboard (`/admin/*`) is the only part of the app using shadcn/ui; member-facing pages
  (including the homepage) are hand-rolled and intentionally do not share the admin's design tokens.

## Brand Commitments

The "Haven Circle" name stays (not revisited further after all). One binding aesthetic reference is
now pinned for the homepage: a user-supplied reference image (a watercolor/floral brand mark, pastel
overlapping washes, a casual hand-brush-script logotype over a small tracked-caps sans subtitle) —
translate its *visual system* (palette family, watercolor-wash texture, script/sans lettering
pairing), never its literal content; the reference's own brand name and wordmark text are not
Haven Circle's and must not appear anywhere in the build. Within that world, "Haven Circle" itself
is set in a hand-script wordmark (an explicit, considered tradeoff — legibility protected by never
using script for body copy, the crisis-line disclaimer, or other safety-critical text, which stay in
the plain sans always). This superseded an earlier "Parish Noticeboard" corkboard direction, built
and then fully replaced in the same redesign effort — see `sessions.md` 2026-08-10 entries for both.

## Evidence on Hand

No real testimonials, case studies, or press exist yet. The current landing page copy (mission
framing, FAQ, the NCMH crisis-hotline disclaimer, plan/Goodie Box pricing) is real, specific,
already-considered content, not generic placeholder — corrected from an earlier, mistaken note here.
Treat it as safety-critical and pricing-accurate content to preserve verbatim/functionally through
any future visual redesign, restyling only its presentation.

## Product Principles

1. Circles over crowds — the value proposition is a small, led group, never a mass open feed; the
   design should make that structure legible, not disguise it as a generic social timeline.
2. Real people lead — the human leader is the trust anchor for each circle, not an algorithm or a
   moderation queue; leaders should feel present in the product, not administrative.
3. Warm, not clinical, not gamified — general-wellbeing framing, no diagnosis-specific or
   therapy-adjacent visual language, and no streaks/points/gamification mechanics.
4. Solo-maintainable scale — every choice should stay sane for one maintainer and ~60 users; avoid
   enterprise-grade complexity for its own sake.
