# Design

<!-- impeccable:design-schema 1 -->

## Scope

This project runs **two intentionally separate visual systems** — this file documents the
member-facing one only:

- **Admin dashboard** (`/admin/*`) — shadcn/ui (Radix + Tailwind + CVA), tokens in
  `client/src/index.css`'s `@theme` block (slate neutral, indigo primary). Not covered here; see
  `components.json` and the `@theme` block itself as that system's source of truth.
- **Member-facing pages, including the homepage** (this file) — hand-rolled, deliberately outside
  the shadcn tokens above.

## World: Watercolor Stationery

Built 2026-08-10 for the public homepage (`/`, `client/src/pages/LandingPage.tsx` and
`client/src/components/landing/*`) — see the direction contract HTML comment at the top of
`client/index.html`'s `<body>` for the brief, and
`.impeccable/surfaces/client-src-pages-landingpage-tsx.md` for the surface brief and history.

**Pinned directly by the user** from a reference image (a floral brand mark: overlapping pastel
watercolor washes, a hand-brush-script logotype over a small tracked-caps subtitle) — not rolled by
Impeccable's concept-seed. Translated as a *visual system* only (palette family, wash texture,
script+sans lettering pairing); the reference's own brand name/wordmark text does not appear
anywhere in this build.

This **superseded an earlier "Parish Noticeboard" corkboard world**, built in full then fully
replaced in the same session after the user found this reference and preferred it. Nothing was
committed to git between the two builds, so the true pre-Impeccable original (before either
redesign) remains one `git checkout -- <file>` away if ever needed.

**Thesis**: the homepage is a hand-lettered watercolor stationery suite — soft overlapping washes
behind opaque paper "invitation" cards, warm rather than clinical, artful rather than
administrative or corporate-SaaS.

### Palette (Full palette color strategy)

Defined as literal Tailwind arbitrary-value hex classes in each component (not CSS custom
properties/tokens — kept separate from the admin `@theme` system by design):

| Role | Hex | Usage |
|---|---|---|
| Paper / card | `#FFFDF9` | `.stationery-card` — the surface ALL text lives on (see Contrast rule below) |
| Ivory wash base | `#FBF8F3` | `.bg-wash-*` base color before tint layers |
| Ink (headings, wordmark, primary buttons) | `#2C4870` (dusty indigo) | h1/h2, the "Haven Circle" script wordmark, primary CTA backgrounds |
| Body ink | `#4B5A73` (lighter slate-blue) | paragraph copy, labels, meta text — chosen for ≥4.5:1 on `.stationery-card` |
| Blush | `#E888A0` | wash tint, small accent chips/tags, decorative icons — never as a light-text button background (fails 4.5:1) |
| Sage | `#8FAE86` | wash tint, decorative icons, icon-circle tints |
| Powder blue | `#7FB3CC` | wash tint, decorative icons, icon-circle tints |
| Error/status red | `#B23A5C` | form error text only |

### Type

- **`.font-script`** — Caveat (Google Fonts). **Reserved exclusively for the "Haven Circle"
  wordmark** (Hero, Footer). Never section headings, never body copy, never the crisis-line
  disclaimer or any safety-critical/functional text — a deliberate, disclosed legibility tradeoff
  scoped as narrowly as possible.
- **`.font-body`** — Nunito (Google Fonts). Everything else: h1/h2 (bold/extrabold, not script),
  paragraphs, labels, buttons, form fields.

Loaded via a single Google Fonts `<link>` in `client/index.html`'s `<head>`.

### Materials & components

- **`.stationery-card`** (index.css): the reusable opaque card primitive — near-white
  `#FFFDF9`, a thin `rgba(44,72,112,0.14)` border, soft blurred offset shadow. This is where all
  readable content lives.
- **`.bg-wash-blush` / `.bg-wash-sage` / `.bg-wash-blue`** (index.css): layered, softly-edged
  `radial-gradient`s with `background-blend-mode: multiply` over the ivory base — stands in for
  real watercolor texture with no image assets. Static section backgrounds, alternating per
  section for rhythm.
- **Hero background photo**: `client/public/enrico-bet-IicyiaPYGGI-unsplash.jpg` (a poppy/wheat
  field, Unsplash, photographer Enrico Bet — kept the credit-bearing filename rather than renaming
  it), rendered via the shared `HeroBackground` component (`client/src/components/HeroBackground.tsx`
  — see "Extension: Login page" below for why it's shared). Swapping it is a one-line change (the
  `url(...)` inside that component); removing the file entirely degrades gracefully — no
  broken-image glyph, no code change required. **2026-08-10**: originally paired with an animated
  5-blob watercolor wash (`.hero-wash`/`.hero-blob` in index.css) and decorative `SprigIcon`/
  `FlowerIcon` accents; simplified to the plain photo only at the user's request (wash CSS and both
  icon components deleted as dead code), then given a still-static diagonal tint — a single
  `bg-linear-to-br` layer over the photo, ink `#2C4870` at ~45% opacity in one corner fading through
  transparent (photo reads clearly in the middle) to blush `#E888A0` at ~25% in the other — for a
  bit of styled depth without bringing the animation back.
- No gradient text, no eyebrow/kicker labels above headings (the script wordmark + small tracked
  subtitle beneath it in Hero/Footer is a logotype lockup, not a kicker), no hard zero-blur offset
  shadows, no colored side-only borders.
- **Typewriter headline** (Hero only, 2026-08-10): the h1 cycles through three comforting slogans
  ("You don't have to carry it alone." / "It's okay to not be okay right now." / "Healing isn't
  linear — and neither are you.") via `useTypewriter` (`client/src/hooks/useTypewriter.ts`) and
  `TypewriterHeadline` (`client/src/components/landing/TypewriterHeadline.tsx`). Sequence: types in
  → holds (`HOLD_MS`, currently 4.8s — long enough to actually read it) → fades out as a whole
  (`.typewriter-fade`, a CSS opacity transition, not a character-by-character delete) → swaps to the
  next phrase and types back in. Accessibility: the animated span is `aria-hidden`; a `sr-only` span
  carries the first slogan as one stable, complete heading for screen readers instead of
  character-by-character typing noise. Respects `prefers-reduced-motion: reduce` — the hook skips
  animating entirely (no cycling, no fade, no blinking caret) and just renders the first slogan
  statically. The `<h1>` has a fixed `min-h` (`min-h-18 sm:min-h-24`) sized for two lines at both
  breakpoints so the varying slogan lengths don't reflow the layout around it as they type.

### Contrast rule (load-bearing — do not violate when extending this world)

**Text never sits directly on a `.bg-wash-*` background.** Washes are spatially-varying layered
gradients — their contrast against any fixed text color cannot be verified with a single
calculation. Every piece of text, including the script wordmark, lives inside a `.stationery-card`
(or on a flat solid section like `#FFFDF9` or `#2C4870`), where contrast is a fixed, checkable
number. Verified by hand (no contrast tooling was available this session):
`#2C4870`/`#4B5A73` on `#FFFDF9` ≈ 9.2:1 / 6.9:1; `#FFFDF9` on `#2C4870` ≈ 9.2:1 — all comfortably
clear the 4.5:1 body-text floor. Blush/sage/powder-blue are light enough that light text on top of
them fails contrast (~2.5:1) — they only ever pair with the dark ink colors, never with light text.

### What's out of scope for this world

- Copy substance: crisis-hotline text (FAQ, Footer), plan pricing/features (from
  `config/plans.ts`), and Goodie Box pricing are preserved verbatim/functionally — only their
  presentation changed. This copy was confirmed to be real, specific, already-considered content
  (not placeholder, as an earlier draft of this document mistakenly assumed).
- The shared `Navbar` — see its own section below. It deliberately does not adopt this world.

### Extension: Blog (`/blog`, `/blog/:id`)

Brought into this world 2026-08-10 (`client/src/pages/BlogListPage.tsx` and `BlogPostPage.tsx`) —
the first extension of Watercolor Stationery beyond the homepage. Rationale: unlike Feed/Profile/
Group/Subscription (logged-in Operate pages, still plain shadcn-era slate — the same reasoning that
kept the Navbar in its neutral bridge treatment), the blog is public Persuade/Read content, closer
in spirit to the homepage than to the app shell.

- **List page**: flat `#FFFDF9` background (no wash — see Contrast rule), centered h1 + one-line
  descriptive subhead (not an eyebrow/kicker — it's below the heading, prose, not a label above it).
  First post on page 1 renders as a large horizontal featured `.stationery-card`; the rest render as
  a `sm:grid-cols-2` grid of smaller `.stationery-card`s. Posts without a `thumbnailUrl` fall back to
  a tinted icon tile (`BookIcon` on a sage/powder-blue tint circle-style background) instead of a
  flat grey box. Pagination restyled as pill buttons matching the CTA language elsewhere.
- **Post page**: title/byline/hero image sit directly on the flat `#FFFDF9` page background (flat
  solid backgrounds are contrast-safe per the Contrast rule — only `.bg-wash-*` requires the card
  wrapper); the body content itself (heading/paragraph/image blocks) is wrapped in one
  `.stationery-card` for a clear "reading surface." Like/comment counts restyled as pill controls; a
  liked post shows a filled heart in ink `#2C4870` on a soft blush chip (`bg-[#E888A0]/15`) rather
  than reusing the `#B23A5C` error-red token, which stays scoped to form errors only, per the
  palette table. Comment bubbles use a faint ink tint (`bg-[#2C4870]/5`) instead of flat grey; the
  comment input/post button match the rounded-full input/CTA language used on the homepage.
- Both pages keep all post content, comments, and admin edit-link behavior functionally unchanged —
  this was a presentation-only pass.

### Extension: Goodie Box page (`/goodie-box`)

Brought into this world 2026-08-10 (`client/src/pages/GoodieBoxPage.tsx`) for the same reason as the
blog: it's public Persuade content (anyone can view and buy without a subscription), not a logged-in
Operate page. Notable choices beyond the standard stationery-card/palette swap:

- The original hero had a small tracked-caps badge ("One-time purchase · No subscription required")
  sitting directly above the `<h1>` — the textbook eyebrow/kicker-above-heading pattern the craft
  floor bans. Moved that message into the intro paragraph and kept a shorter version as a trailing
  pill *below* the price line instead of leading the heading.
- `DeliveryStatusPill` and the hero icon's gradient glow moved off Tailwind's default amber/sky/
  emerald/indigo/fuchsia to the documented palette tints (blush/powder-blue/sage at ~20-35% opacity,
  ink `#2C4870` text/icon on top) — same "dark ink on light pastel tint" pattern used for icon
  badges everywhere else in this world, so status pills don't introduce an unrelated color language.
  Status is still legible from the label text, not color alone.
- The "Payment confirmed" order caption previously used Tailwind's `emerald-600`; replaced with a
  `CheckIcon` + body-ink text rather than inventing an undocumented green, since this palette has no
  dedicated success color.
- Purchase-form error text uses `#B23A5C` — its one documented, correct use case ("form error text
  only" per the palette table).
- Content/logic (orders list, checkout form fields, PayMongo redirect, polling for payment
  confirmation) is unchanged — presentation-only.

### Extension: Login page (`/login`)

Brought into this world 2026-08-10 (`client/src/pages/LoginPage.tsx`), at the user's explicit
request to reuse the homepage hero's background and panel treatment rather than a plain form on a
white page — the login form now sits in a `.stationery-card` panel over the same photo/wash
background as the homepage hero, vertically centered instead of top-anchored (the hero itself
doesn't need to center since it's full of content; this page's form is much shorter).

- **`HeroBackground`** (`client/src/components/HeroBackground.tsx`, new): the photo layer was
  previously inline in `Hero.tsx` only; extracted to a shared component so this page and the
  homepage hero can't drift out of sync (originally this also carried the 5-blob animated wash —
  see the photo-layer note under "Materials & components" above for when that was simplified away).
  `Hero.tsx` now renders `<HeroBackground />` too — a refactor with no visual change there.
- Login previously used shadcn `Input`/`Label`/`Button` (a holdover from an earlier, since-reversed
  "migrate member-facing UI to shadcn" pass — shadcn is scoped to `/admin` only per this file's
  Scope section). Switched to the same hand-rolled rounded-xl inputs / rounded-full pill button used
  on the Blog and Goodie Box forms, so all watercolor-world forms now share one input language
  instead of two.
- Only the login page was touched — `/register` still uses the older shadcn form treatment and is a
  visual mismatch one click away. Flagged to the user as a natural next step, not done unprompted.
- **Fullscreen section, panel anchored near the top**: the section originally used a fixed
  `min-h-144` (matching the homepage hero) and centered the panel within it. The user wanted the
  section itself to fill the full viewport below the navbar (no plain-white gap under it on tall
  screens) but the panel to stay near the top like the original fixed-height version, not drift to
  true vertical-center of a much taller box. Two changes made this work together:
  - `SiteLayout.tsx` became a flex column (`Navbar`/`EmailVerificationBanner` sized to content, a
    `flex-1` wrapper around `Outlet`) so a page can opt into filling all remaining vertical space by
    giving its own root element `flex-1` — other pages are unaffected since flex-column's default
    cross-axis stretch only affects width, not height, so their normal content-sized layout is
    unchanged.
  - The login `<section>` uses `flex-1` (fills that remaining space) with `items-start` instead of
    `items-center` (anchors the panel near the top edge, under `pt-16`/`pt-20` padding, rather than
    true center of the now much-taller box) — the wash/photo background still extends the full
    section height either way, so there's no visible whitespace regardless of where the panel sits.

## Shared chrome: Navbar (bridge treatment, not the Watercolor world)

`client/src/components/Navbar.tsx` renders on every public/member route (`SiteLayout`) — the new
watercolor homepage *and* the still-plain shadcn-styled app pages (Feed, Profile, Group,
Subscription, login/register). A full watercolor reskin here would look right on `/` and foreign
everywhere else, so this is a **deliberate middle ground**, decided with the user rather than
assumed: pulls a couple of watercolor accents in without committing the nav to either world, so it
reads fine on both.

- Kept the existing shadcn `Button`/`Sheet` primitives as-is — no reason to rip out working,
  accessible components for this pass.
- `bg-white/85 backdrop-blur-md` + `shadow-sm` (replacing a flat `bg-white` + hard `border-b`) —
  the classic legitimate use of backdrop-blur: this bar is `sticky`, so it now sits over scrolling
  content (the hero's wash/photo on `/`) and needs to stay legible without looking like a hard
  cutout.
- Wordmark recolored to the watercolor ink `#2C4870` (from `slate-900`) plus a small `UsersIcon` in
  a tinted circle badge (`bg-[#8FAE86]/20`) — a light touch of the "circle" concept and the
  Introduction section's own icon-badge pattern, not a full logotype treatment (no script font
  here — this bar needs to stay legible and quick to scan on the app pages, not read as branding).
- Link hover/active color swapped from generic slate to the ink accent; added a real active-route
  indicator (bold + ink color) that didn't exist before — a legibility fix as much as a visual one.
- CTA buttons and the current-user avatar gained `rounded-full`/a soft `ring-[#8FAE86]/30` — cheap,
  restrained echoes of the homepage's pill-button and card language.
- No script font, no wash/blob backgrounds, no full palette commitment — this bar is intentionally
  quieter than the homepage so it doesn't fight either surface it has to sit on.

**Mobile menu** (the `Sheet` at `lg` and below) got its own pass, separate from the desktop bar's
plain text links — a vertical drawer has room the horizontal bar doesn't:
- Personalized header replacing the generic "Menu" title: signed-in users see their avatar (with
  the same accent ring), name, and role, wrapped in a link to their profile; signed-out users see
  the wordmark + icon badge instead. Built with `SheetHeader`/`SheetTitle`, so it's still a real
  accessible dialog title, not decoration standing in for one.
- Icon-led rows (`HomeIcon`/`UsersIcon`/`BookIcon`/`GiftIcon`/`HeartIcon`/`GearIcon`, two new
  additions to `icons.tsx` in its existing 20×20 hand-drawn style) instead of a plain text list —
  this list is a distinct array from the desktop bar's, not a responsive reflow of the same one,
  since a horizontal bar and a vertical drawer want different information density.
- Active route gets a tinted background + bold ink text (not a colored left border — the craft
  floor bans that pattern on list items).
- Primary CTA (Join now / Log out) moved into `SheetFooter`, which pins it to the bottom of the
  drawer via `mt-auto` — thumb-reachable regardless of how long the link list runs.
- Added a `className` prop to `Avatar` (see the desktop bridge notes above) to make the ring
  possible on both the desktop link and the drawer header without a wrapper.
