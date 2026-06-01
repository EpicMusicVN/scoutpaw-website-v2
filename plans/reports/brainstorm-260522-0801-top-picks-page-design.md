# Brainstorm — Top Picks Page Design

**Date:** 2026-05-22 · **Status:** Approved · **Scope:** single cohesive page (no decomposition)

## Problem Statement

Build the `/top-picks` page for ScoutPaw TV. Nav item already exists but disabled
(routes to `/coming-soon/top-picks`). Page must: showcase curated favourites, be
playful/premium/cozy, match site design system, ship responsive + accessible.

Brief sections: cinematic Hero Banner · category chips · "Deal Block" · Latest
Popular Offers cards · smooth motion.

## Codebase Findings

- Site is well-patterned: every page = `FullBleedHero` + `CloudDivider` rhythm +
  `ScrollReveal` sections + `NewsletterCTA`. `/watch` uses custom `WatchHero`.
- **Category chip pattern already exists** — `components/watch/explore-videos.tsx`
  `FilterChip` (`role="group"` + `aria-pressed`, client-state filter). Reusable.
- Card language proven in `ProductCard` — `rounded-[2rem]`, `shadow-cozy`, hover
  lift, honey price pill, badges, `track()` analytics on CTA.
- Content = JSON → Zod → adapter pattern (Sanity-swap-ready). New type = new JSON
  + schema + adapter method (same path recent `getChannels`/`getPlaylists` took).

## Honesty Flags Raised

1. **Deal Block modal/drawer = YAGNI risk.** No page uses overlays; hurts SEO +
   adds a click. → chose inline accordion expand.
2. **Hero decoratives tradeoff.** "Reuse FullBleedHero as-is" has no decorative
   slot → floating toys/stars/paws come only from the banner image. Accepted.
3. **Category taxonomy diverges** from `/shop` (plushes/apparel/prints/accessories).
   Top Picks gets its own 5-category enum — no shared filter logic.

## Decisions (user-approved)

| Topic | Decision |
|---|---|
| Hero | Reuse `FullBleedHero` as-is; `image="shop/promotion.jpg"` |
| Deal Block | Inline accordion expand (CSS `grid-rows 0fr→1fr`, no Framer) |
| Imagery | Reuse existing shop/character assets as placeholders |
| Data source | New curated `content/top-picks.json`, standalone (no character tie-in) |
| Seed data | ~10 picks, 2 per category, all 5 chips non-empty |

## Final Design

### Route & Nav
- New `app/top-picks/page.tsx` — server component, SSG.
- `site-config.json`: Top Picks nav `enabled: true`, href → `/top-picks` (navItems
  + footerExplore).
- `coming-soon.json`: remove dead `top-picks` entry (stale orphan SSG page).

### Page composition
`FullBleedHero` → `CloudDivider` → `ScrollReveal`(`TopPicksBoard`) → `CloudDivider`
→ `ScrollReveal`(`NewsletterCTA tag="top-picks-newsletter"`).

### Board (interactive core) — order: header → chips → Deal Block → offer grid
- **Chips** always visible: `All · Apparel · Pet Supplies · Pet Toys · Home Living
  · Others`. Small per-category playful icon.
- **Deal Block** = wide featured spotlight `<button>`, `aria-expanded`/`aria-controls`,
  highlight badge, image, title, rotating chevron + "View popular offers".
- **Offer grid** collapsed by default; expands on Deal Block click; cards filtered
  by active chip; per-category empty state.
- **Interaction rules:** Deal Block click toggles grid · chip click while collapsed
  auto-expands + filters · chip click while open filters in place. Accordion via
  CSS `grid-template-rows` transition (no JS measuring, reduced-motion honored).

### Offer Card
Mirrors `ProductCard` styling. Adds: discount/highlight badge (top-left,
`bg-accent-coral`) · popularity indicator (inline ★ rating / "Bestseller" pill) ·
"Shop Now ↗" shimmer CTA → external storefront new tab + `track()` event.

### Content layer
- `content/top-picks.json` — `{ deal:{badge,title,description,image},
  picks:[{id,title,category,image,badge?,rating?,popularity?,ctaLabel,ctaHref,
  order}] }`. ~10 picks (2/category).
- `lib/content/schemas.ts` — `TOP_PICK_CATEGORIES` + `TOP_PICK_CATEGORY_LABELS`,
  `TopPickSchema`, `DealBlockSchema`, `TopPicksContentSchema`.
- Adapter — `getTopPicks()` in `index.ts` + `adapter.ts` + `json-source.ts`
  (Zod-validated); stub in `sanity-source.ts`.

## Files

**Create (6):** `app/top-picks/page.tsx` · `components/top-picks/top-picks-board.tsx`
(client, state) · `components/top-picks/deal-block.tsx` ·
`components/top-picks/offer-card.tsx` · `components/ui/filter-chip.tsx` (extracted
shared) · `content/top-picks.json`

**Modify (8+3):** `lib/content/{schemas,index,adapter}.ts` ·
`lib/content/sources/{json,sanity}-source.ts` · `components/watch/explore-videos.tsx`
(swap local FilterChip → shared, DRY) · `content/site-config.json` ·
`content/coming-soon.json` · docs: `codebase-overview.md`, `project-changelog.md`,
`development-roadmap.md`

All component files < 200 lines.

## Risks

| Risk | Mitigation |
|---|---|
| FilterChip extraction touches working Watch page | Pure presentational ~20 lines, zero logic change; QA Watch after |
| Placeholder offer images repeat | Accepted; JSON `image` swaps to real photos, no code change |
| Chips + accordion dual-control feels fiddly | Auto-open-on-chip-click rule |

## Success Criteria

Builds + type-checks · responsive desktop/tablet/mobile · chips filter +
keyboard-operable (`aria-pressed`) · Deal Block accordion smooth + correct
`aria-expanded` · reduced-motion honored · external CTAs new tab + `noopener` ·
nav link live · Lighthouse a11y/perf parity with `/shop`.

## Next Steps

1. `/ck:plan` from this report → phased implementation plan.
2. Implement → test → code-review → docs sync.

## Unresolved Questions

- Banner image: `shop/promotion.jpg` recommended; final pick can swap at impl time.
- `aria-live="polite"` on offer grid for filter-count changes — nice-to-have,
  decide during implementation.
