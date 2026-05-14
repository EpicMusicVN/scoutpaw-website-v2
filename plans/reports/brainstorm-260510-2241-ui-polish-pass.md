---
type: brainstorm
date: 2026-05-10
title: UI Polish Pass — Contrast, Heroes, Spacing, Card Cleanup
status: ready-for-plan
---

# UI Polish Pass — Brainstorm Summary

## Problem Statement

Site has accumulated readability/affordance issues across nav + multiple sections, two heroes still use placeholder media instead of the supplied banners, character cards expose breed not name, and the newsletter section leaves a dead cream band before the footer. Goal: one focused polish pass — no new features, no refactor — to land readable, on-brand pages.

## Scope (User-Specified)

| Area | Issue |
|------|-------|
| Navbar | Menu text reads faded/blends, only feels alive on hover |
| Home hero | Currently 2-zone w/ character cluster; need to use `assets/banner/banner.png` without blocking dogs |
| Home menu cards | Showing 7 destinations, only 3 have data (Characters / Shop / Watch); description text reads faded |
| Home Explore Characters | Cards show breed, name only on hover-pill — flip to name-always, drop pill |
| Home Join the Pack | Visible cream band between newsletter + footer |
| Shop hero | Currently uses character cluster; need `assets/shop/promotion.png` (image already has built-in title) |
| Shop Explore Products | 4 tiles → 2; description faded |
| Shop the Pack | Filter chips read white/blend |
| Shop Join the Pack | Same footer gap as home |
| Watch Playlists | Description faded |
| All pages | Audit text/background contrast, keep playful identity |

## Decisions Captured (User-Approved)

1. **Home hero** → full-bleed `banner.png`, text in upper-left sky zone, soft honey-gradient mask on left ~40%, dogs never covered.
2. **Shop hero** → stacked: full-width `promotion.png` on top (its built-in "DOG PARENTS" title carries the message), cream text-strip below with kicker + CTAs only (no competing h1).
3. **Nav contrast** → bump `text-ink/80` → `text-ink` (full opacity #2b1d10) on `nav-links.tsx` + `mobile-nav.tsx`, keep honey hover underline as the affordance signal.
4. **Footer gap** → remove `SectionCurve position="bottom"` from `newsletter-cta.tsx` AND `mt-12` from `<footer>` in `footer.tsx`. Honey gradient meets grass strip directly; grass's existing top wave is the visual separator.

## Evaluated Approaches (Per Section)

### Description-text faintness (menu cards / explore products / playlists)

The code currently uses `text-ink/85` = `rgba(43,29,16,.85)` on cream — mathematically dark, but visually it can read as faded next to the bold honey-on-cream `h2`s and the saturated card art. Three options weighed:

| Option | Change | Risk | Verdict |
|--------|--------|------|---------|
| Keep /85, add text-shadow | Subtle warm-gold shadow under description copy | Visually noisy on cream | ✗ |
| **Bump to `text-warm-text` (full opacity, #2b1d10)** | Single token swap, no new CSS | Lowest | **✓ recommended** |
| Switch to `text-warm-muted` (#5a4126) | New color, mid-tone brown | Slight regression in contrast (still WCAG AA) | ✗ — keeps the "muted" vibe |

**Note:** if the user is seeing actually-white text in a deployed build, this likely points to a stale cached build — code on disk is `text-ink/*`, not white. Address by hard-reloading + redeploying after changes; flag for verification, not as a separate work item.

### Filter chips (shop "Shop the Pack")

Current inactive chip: `bg-surface text-ink/80 shadow-sm`. `bg-surface` = `#ffffff` — pure white, which **does** float weakly on `bg-base` cream. This matches the user's "white / blends" complaint exactly.

| Option | Change | Verdict |
|--------|--------|---------|
| Active chip stays `bg-ink text-surface`; **inactive becomes `bg-honey/60 text-ink border border-ink/15`** | Warm tone instead of white, subtle border for definition | **✓ recommended** |
| Outline-only inactive chips | `bg-transparent border-ink/30 text-ink` | Too austere for sticker aesthetic |
| Tinted gold | `bg-brand-honey text-ink` | Confuses inactive with active (both warm) |

### Character card (home Explore Characters)

| Current | Target |
|---------|--------|
| Bottom label = `character.breed` (kebab, uppercase) | Bottom label = `character.name` |
| Hover slides up surface pill with `character.name` | Pill removed entirely |
| Hover scales image to 1.10 + lifts card 1.04 | Keep gentle scale, drop the dual scale (image scales, card stays) |
| Inner glow ring on hover | Keep (subtle) |

Result: cleaner, less competing motion. Name is always readable; hover is just a tactile zoom.

### Home menu cards reduction

Filter approach beats deletion — preserves card definitions for re-enable when data lands. Use existing `comingSoon` flag pattern.

```ts
// menu-cards.tsx
const LIVE_HREFS = new Set(["#meet-the-pack", "/shop", "/watch"]);
const visible = cards.filter((c) => LIVE_HREFS.has(c.href));
```

Layout reflows naturally: 3 cards → 1 large + 2 medium row, or 3 equal medium cards. **Recommend: 1 large (Meet the Pack) + 2 medium (Shop, Watch)** — matches existing rotation pattern, no grid math rewrite.

### Shop ExploreProducts reduction (4 → 2)

Default to **Plushes + Apparel** (highest retail volume, strongest character imagery available). Layout: 2 square aspect tiles centered, max-w narrowed so they don't sprawl. Keeps SHOP_CATEGORIES ordering for the dev-warning fallback.

### Hero Banner — home (full-bleed)

```
+--------------------------------------------------+
| ☀ KICKER (honey, tracking-wider)                |
|                                                  |
| Calm sounds for                                 |
| your pup's day.                                 |
|                                                  |
| [Watch Now] [Meet the Pack]                     |
|                                                  |
|                                                  |
|     (DOGS untouched — center/bottom)            |
+--------------------------------------------------+
  ← banner.png as <Image fill priority>
  ← gradient overlay: linear-gradient(90deg,
    rgba(255,241,201,0.92) 0%,
    rgba(255,241,201,0.55) 30%,
    transparent 55%)
```

- Min-height: `h-[520px] md:h-[600px] lg:h-[680px]` (preserves cinematic ratio)
- Text container: `absolute inset-y-0 left-0 flex flex-col justify-center w-full md:w-[55%] lg:w-[48%] px-6 md:px-12 lg:px-20`
- Mobile fallback: gradient covers full width since dogs already crop fine on phone aspect

### Hero Banner — shop (stacked)

```
+--------------------------------------------------+
|     promotion.png (full-width, h-[420px])       |
|     'essentials DOG PARENTS' built-in title     |
+--------------------------------------------------+
| ScoutPaw Shop                                   |
| Take a piece of the pack home.                  |
| [Browse All] [Explore Collections]              |
+--------------------------------------------------+
   ↑ cream text-strip, py-10 md:py-14, max-w-2xl
```

- Drop the embedded h1 (image carries it). Keep small kicker + supporting line + CTAs.
- Add `objectPosition="center"` so the products stay centered on responsive crops.

## Out of Scope

- New routes, new components, content overhaul
- Tailwind config token additions (use existing tokens only)
- Mobile-nav redesign beyond the color fix
- Image generation / new banner art
- AboutShop section (not flagged by user)
- FeatureBanner on home page (still uses `promotion.png` — leave as-is unless user flags it; promotion image fits FeatureBanner's "card-in-frame" treatment)

## Implementation Considerations

### Files Touched (Estimate)

| File | Change |
|------|--------|
| `components/nav/nav-links.tsx` | `text-ink/80` → `text-ink` (line 37) |
| `components/nav/mobile-nav.tsx` | Same nav text fix |
| `components/home/cinematic-hero.tsx` | **Replaced or branched** — needs full-bleed variant prop |
| `app/page.tsx` | Pass `image="/assets/banner/banner.png"` + `variant="full-bleed-left"` (or new component) |
| `app/shop/page.tsx` | Switch to stacked hero variant |
| `components/home/menu-cards.tsx` | Filter cards array; bump description `text-ink/85` → `text-warm-text` |
| `components/characters/character-card.tsx` | breed→name, drop hover pill |
| `components/home/newsletter-cta.tsx` | Remove bottom `<SectionCurve>` |
| `components/nav/footer.tsx` | Remove `mt-12` |
| `components/shop/explore-products.tsx` | 4→2 tiles, bump description color |
| `components/shop/product-grid.tsx` | Recolor inactive `FilterChip` (line 95-99) |
| `components/watch/playlist-grid.tsx` | Bump description color |

**Estimated diff: ~10 files, ~150 LOC modified, 0 new files unless we extract a `FullBleedHero` variant (TBD during planning).**

### Design Decision Pending Plan Phase

Whether to:
- **(A) Add a `variant` prop** to existing `CinematicHero` ("two-zone" | "full-bleed-left" | "stacked") — single component, more logic
- **(B) Create two new lightweight components** (`FullBleedHero`, `StackedHero`) — cleaner separation, more files

Recommend **(A)** during planning unless code grows past ~100 LOC of branching — then split.

### Risks

| Risk | Mitigation |
|------|------------|
| `banner.png` (6.5MB) is heavy for hero LCP | Already have `banner.webp` in `public/`; use webp first via `<Image>` priority |
| Removing newsletter bottom curve creates abrupt honey→grass edge | Grass's existing top wave + honey gradient give a soft handoff; verify visually |
| Filter chip recolor could hurt active-state contrast | Keep `bg-ink text-surface` for active — already crisp |
| Character card name length varies (e.g. "Buddy" vs "Wallace") | Use `text-sm md:text-base` + truncate / line-clamp-1 just in case |
| Stacked shop hero loses the "ScoutPaw Shop" h1 (SEO) | Keep h1 visible in text-strip below image; just don't compete with painted text |
| Full-bleed home hero on tall mobile may crop dogs unfavourably | Set `objectPosition="50% 60%"` to bias upward and reveal head/body; test 360px viewport |

## Success Criteria

- [ ] Nav links read crisply on cream nav bar at first glance (no hover required to perceive interactivity)
- [ ] Home hero shows banner.png full-bleed; title/CTAs readable; no character covered or clipped by overlay
- [ ] Shop hero shows promotion.png cleanly; only one painted/typed title visible at a time
- [ ] Menu intro on home shows exactly 3 cards (Characters / Shop / Watch), all enabled, description text reads dark/crisp
- [ ] Character cards show name (not breed) at all times; hover = gentle zoom only, no name pill flash
- [ ] Shop ExploreProducts shows exactly 2 square tiles, description dark/crisp
- [ ] Shop filter chips: inactive chips visibly distinct on cream — no white-on-cream blend
- [ ] Watch playlist description reads crisp
- [ ] Newsletter section connects directly to grass strip on home + shop — no cream gap
- [ ] No regressions: all existing CTAs, links, products still work; layout still responsive at 360 / 768 / 1280 / 1440
- [ ] Lighthouse a11y stays ≥95 on all three pages

## Next Steps

1. **/ck:plan** to break this into phases (suggest: Phase 1 contrast + chips + filter + footer-gap; Phase 2 hero rebuilds; Phase 3 character cards + menu cards + product reduction)
2. Implement per phase with type-check after each
3. Visual smoke test (Playwright screenshot or manual) at 360/768/1440
4. `code-reviewer` agent pass before commit

## Unresolved Questions

- Whether the user's "white text" perception was a stale deployed build — recommend visual confirmation post-deploy, but not a blocker.
- Default 2 product categories chose Plushes + Apparel; user can override before plan execution.
- Whether to tighten `FeatureBanner` body color (`text-warm-text/90`) — not flagged but in same family. Suggest including in Phase 1 contrast pass.
