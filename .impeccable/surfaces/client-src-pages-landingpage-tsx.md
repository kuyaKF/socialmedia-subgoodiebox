---
version: 1
slug: "client-src-pages-landingpage-tsx"
primary_target: "client/src/pages/LandingPage.tsx"
related_targets: []
---

## Scope & Mode

Public marketing homepage (`/`, `client/src/pages/LandingPage.tsx` and its `components/landing/*`
children). Mode: Persuade — a first-time, logged-out visitor decides whether Haven Circle is worth
exploring further.

## Audience, Job, Action, Proof, Constraints

- Audience: someone looking for general wellbeing and connection, not tied to a specific diagnosis
  or life event. Casual, low-pressure — browsing, not in crisis.
- Job: understand that Haven Circle means being placed into a small, real, led circle — not another
  open feed.
- Primary action: explore first (blog/FAQ/proof) rather than an immediate hard signup push.
- Proof/content on hand: no testimonials/case studies yet, but the mission copy, FAQ, and crisis-line
  disclaimer are real, specific, already-considered content — not placeholder (corrected from an
  earlier mistaken assumption). Preserve verbatim/functionally through any restyle.
- Constraint: free to restructure sections/copy presentation; safety-critical and pricing-derived
  copy substance is not free to change.
- Avoid: clinical/therapy-sterile visual language (explicit user constraint).

## Chosen Direction & Memorable Moment (current, superseding "Parish Noticeboard")

**Watercolor Stationery** — pinned directly by the user from a reference image (a floral brand
mark: overlapping pastel watercolor washes, a casual brush-script logotype over a small tracked
small-caps sans subtitle). Translate the reference's visual system only — palette family,
watercolor-wash texture, script+sans lettering pairing — never its literal brand name/wordmark.

Full palette color strategy: soft overlapping pastel washes (dusty indigo-blue ink, blush/rose,
sage, powder blue) over warm ivory paper — the multi-hue wash IS the point, unlike the prior
noticeboard's single dominant color.

Type: Caveat (hand-brush script) for the "Haven Circle" wordmark and select display accents only —
never body copy or safety-critical text (crisis line, legal, form labels). Nunito for all body copy,
small-caps tracked labels, and buttons — the legible workhorse face throughout.

Materials: soft blurred layered radial-gradient "watercolor wash" section backgrounds (no image
assets — CSS/`mix-blend-mode` only, no image generation available this session), rounded
"stationery card" surfaces with a thin botanical-line border, small hand-drawn sprig/leaf line-art
accents (new additions to `components/icons.tsx`, matching its existing 20x20 stroke style) standing
in for the reference's floral motifs.

Build path: code-led (no image generation available this session).

## History

1. First direction (superseded): Parish Noticeboard — a corkboard/pinned-index-card world, built in
   full then replaced same session per the user's request after seeing a watercolor reference image
   they wanted to use instead. Nothing was committed to git between the two, so the pre-Impeccable
   original remains recoverable via `git checkout -- <file>` if ever needed.
2. Current direction: Watercolor Stationery (this brief).

## Unresolved Decisions

- Exact copy wording may still evolve; safety-critical/pricing substance is fixed regardless of
  visual world.
