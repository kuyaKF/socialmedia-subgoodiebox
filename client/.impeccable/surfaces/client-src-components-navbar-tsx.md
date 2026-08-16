---
version: 1
slug: "client-src-components-navbar-tsx"
primary_target: "client/src/components/Navbar.tsx"
related_targets: []
---

## Scope & Mode

Shared chrome (`client/src/components/Navbar.tsx`), rendered by `SiteLayout` on every public/member
route — not homepage-only. Mode is mixed: Persuade on `/`, `/blog`, `/goodie-box` (logged-out
visitors); Operate on `/feed`, `/profile/:id`, `/group`, `/subscription` (logged-in members doing a
task). The nav itself is treated as Operate-leaning throughout: scanability and consistent
affordance win over expression, since it's the one constant across every mode the app has.

## Why this isn't just "apply the Watercolor Stationery world"

The homepage got a full watercolor redesign; Feed/Profile/Group/Subscription/login/register did
not (still the earlier shadcn slate/indigo treatment). A user- confirmed decision, not an assumed
one: full watercolor reskin here would look mismatched the moment a visitor clicks past `/`. Chose
a bridge treatment instead — see `DESIGN.md`'s "Shared chrome: Navbar" section for the concrete
choices (backdrop-blur for the now-sticky bar, ink-colored wordmark + small icon badge, active-route
indicator, rounded-full CTAs, soft avatar ring) and the reasoning per choice.

## Unresolved / future decision

If the app pages (Feed/Profile/Group/Subscription) ever get their own visual redesign, revisit
whether the nav should move further toward the Watercolor world at that point — this brief's
"bridge" framing is explicitly provisional on the app pages staying as they are.
