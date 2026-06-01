---
phase: 3
title: "Top Picks Components and Page"
status: completed
priority: P1
effort: "4h"
dependencies: [1, 2]
---

# Phase 3: Top Picks Components and Page

## Overview

Build the `/top-picks` route and its components: the server page (hero +
section rhythm), the client `TopPicksBoard` (chips + Deal Block + accordion
grid), the `DealBlock` spotlight trigger, and the `OfferCard`.

## Requirements

- Functional: page renders hero → chips → Deal Block → offer grid; chips filter
  the grid; Deal Block toggles grid open/closed; chip click while collapsed
  auto-expands the grid + applies the filter.
- Non-functional: every component file < 200 lines; accordion via CSS only
  (no Framer); a11y (`aria-pressed`, `aria-expanded`, `aria-controls`, focus
  rings); reduced-motion honored (global CSS reset covers transitions);
  responsive desktop/tablet/mobile; images lazy + correct `sizes`.

## Architecture

```
app/top-picks/page.tsx         server, SSG  — content.getTopPicks()
  └─ FullBleedHero                           (reused, image="shop/promotion.jpg")
  └─ CloudDivider
  └─ ScrollReveal
       └─ TopPicksBoard        "use client" — state owner
            ├─ FilterChip[]    (shared, components/ui/filter-chip.tsx)
            ├─ DealBlock       <button> accordion trigger
            └─ offer grid      CSS grid-rows accordion → OfferCard[]
  └─ CloudDivider
  └─ ScrollReveal └─ NewsletterCTA tag="top-picks-newsletter"
```

State in `TopPicksBoard`: `activeCategory: TopPickCategory | "all"` and
`dealOpen: boolean`. Filtered list = `picks.filter(p => active === "all" ||
p.category === active)` (adapter already sorted by `order`).

**Accordion technique:** wrapper `<div>` with
`className="grid transition-[grid-template-rows] duration-500 ease-gentle"` and
inline `style={{ gridTemplateRows: dealOpen ? "1fr" : "0fr" }}`; inner
`<div className="overflow-hidden">` holds the grid. No height measuring. The
global `prefers-reduced-motion` reset neutralizes the transition.

**Dual-control rule:** chip `onClick` sets `activeCategory` AND, if `!dealOpen`,
sets `dealOpen = true` — so filtering always has a visible effect.

## Related Code Files

- Create: `app/top-picks/page.tsx`
- Create: `components/top-picks/top-picks-board.tsx` (client, state owner)
- Create: `components/top-picks/deal-block.tsx`
- Create: `components/top-picks/offer-card.tsx`
- Read for patterns: `app/shop/page.tsx`, `components/home/full-bleed-hero.tsx`,
  `components/shop/product-card.tsx`, `components/watch/explore-videos.tsx`,
  `components/home/feature-banner.tsx`, `lib/utils/asset-url.ts`,
  `lib/analytics/track.ts`

## Implementation Steps

1. **`offer-card.tsx`** — props `{ pick: TopPick; index?: number }`. Mirror
   `ProductCard`: `rounded-[2rem]`, `border-ink/10`, `bg-surface`,
   `shadow-cozy`, hover `-translate-y-2` + `shadow-cozy-xl`; image area
   `aspect-square` with rotating tile-bg (reuse the `tileBackgrounds` array
   idea), `next/image` `object-contain` + hover `scale-110`, lazy (no
   `priority`), proper `sizes`. Overlays: `badge` → top-left pill on
   `bg-accent-coral` text-surface (only if present); `rating` → inline star row
   (small SVG stars + numeric, e.g. `★ 4.8`); `popularity` → small pill or
   muted line (only if present). Title `font-display` `line-clamp-2`. CTA =
   "Shop Now ↗" `cta-shimmer` sticker on `bg-brand-primary`, wraps the card in
   a `next/link` to `ctaHref` with `target="_blank" rel="noopener noreferrer"`,
   `aria-label` noting "opens in new tab", `onClick` fires
   `track("TopPickClick", { pick: pick.id })`.
2. **`deal-block.tsx`** — props `{ deal: DealBlock; open: boolean;
   onToggle: () => void; controlsId: string }`. Render a wide featured banner
   card as a `<button type="button">` spanning the card: `aria-expanded={open}`,
   `aria-controls={controlsId}`. Layout = image + text (reuse `FeatureBanner`
   proportions/vibe but as a toggle, not a link): highlight `badge` pill,
   `title` `font-display`, `description`, and a rotating chevron SVG +
   label that swaps "View popular offers" / "Hide offers" on `open`. Hover:
   subtle lift + chevron nudge. `rounded-[2rem]`, `shadow-cozy`.
3. **`top-picks-board.tsx`** — `"use client"`. Props `{ deal: DealBlock;
   picks: TopPick[] }`. Holds `activeCategory` + `dealOpen` state. Renders:
   - section header (kicker "Top Picks" + h2 + subtitle) — match
     `explore-videos.tsx` header styling.
   - chips row: `role="group"` `aria-label="Filter picks by category"`, an
     `All` chip + one per `TOP_PICK_CATEGORIES` using shared `FilterChip` with
     `TOP_PICK_CATEGORY_LABELS`. Optional: tiny per-category icon for playful
     feel (paw/toy/shirt/home — reuse `PawIcon` where it fits, else inline SVG).
   - `<DealBlock ... controlsId="top-picks-offers" onToggle={() =>
     setDealOpen(o => !o)} />`.
   - accordion wrapper (CSS grid-rows) containing
     `<div id="top-picks-offers">` → the offer grid
     (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`)
     mapping filtered picks to `OfferCard`. Defensive empty state if a filtered
     category yields zero picks (short friendly message).
   - chip `onClick` applies the dual-control rule (set category; open if closed).
   - keep the file < 200 lines — if tight, the empty state can be a tiny inline
     component in the same file.
4. **`app/top-picks/page.tsx`** — server component. `export const metadata`
   (title "Top Picks", description, openGraph image). `const { deal, picks } =
   await content.getTopPicks();`. Render `FullBleedHero` (kicker "Top Picks",
   brand-tone title + subtitle, `image={assetUrl("shop/promotion.jpg")}`) →
   `CloudDivider` → `ScrollReveal`(`TopPicksBoard`) → `CloudDivider` →
   `ScrollReveal`(`NewsletterCTA tag="top-picks-newsletter"`). Match
   `app/shop/page.tsx` structure exactly.
5. Run `pnpm typecheck` + `pnpm lint` + `pnpm build`.

## Success Criteria

- [ ] `/top-picks` renders: hero → chips → Deal Block → offer grid
- [ ] Chips filter the grid; `All` shows everything; `aria-pressed` correct
- [ ] Deal Block toggles the grid; `aria-expanded`/`aria-controls` correct
- [ ] Chip click while collapsed auto-expands the grid
- [ ] Accordion animates smoothly via CSS grid-rows; no layout-shift jank
- [ ] Offer cards show badge / rating / popularity when present; CTA opens
      external storefront in a new tab + fires `track()`
- [ ] All 4 component files < 200 lines
- [ ] Responsive desktop/tablet/mobile; `pnpm build` passes

## Risk Assessment

- **`grid-rows` accordion browser support** → supported in all modern
  evergreen browsers; acceptable for this marketing site. Inner
  `overflow-hidden` prevents content bleed while collapsing.
- **`top-picks-board.tsx` > 200 lines** → extract the empty state and/or the
  chips row into a small sibling file if it overruns.
- **Hero decoratives** → `FullBleedHero` has no overlay slot (accepted design
  tradeoff); decoration is whatever the banner image carries.
