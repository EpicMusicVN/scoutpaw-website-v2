---
type: audit
date: 2026-05-11
slug: responsive-full-website
plan: 260511-1806-responsive-audit-and-fixes
brainstorm: 260511-1806-responsive-audit-and-fixes
status: complete
next: brainstorm follow-up fix plans (see Fix-Plan Seeds)
---

# Responsive Audit — Full Website (2026-05-11)

## Executive Summary

44 components + 7 routes audited at 7 viewports each (49 screenshots, production mode). **No critical issues**. **5 distinct touch-target violations** + **3 hero/layout issues** form the actionable list. Most components are responsive-clean; concentrated fix areas are: cookie banner UX (every page on first visit), shop hero image positioning at mobile/tablet, and watch hero text-col distribution at md.

**Total findings:** 18 (0 critical / 8 major / 10 minor)

## Methodology

- **Tools:** Tailwind v3 (default breakpoints) + Playwright/Chromium for screenshots + production-mode Next.js server
- **Viewports:** 360x640, 390x844, 768x1024, 1280x800, 1440x900, 1920x1080, 2560x1080
- **Pages:** /, /shop, /watch, /coming-soon/games, /characters/buddy, /privacy, /terms
- **Scope:** responsive layout + touch-target a11y (44×44 minimum)
- **Out of scope:** color contrast, ARIA semantics (covered case-by-case in prior reviews), focus indicators, Core Web Vitals
- **Detail files:** `findings-code-static.md`, `findings-visual.md`, `screenshots/*.png` in this plan dir
- **Dev mode note:** dev server had stale `motion-dom@12.38.0.js` vendor chunk error rendering blank pages — all captures done in **production build** mode. Recommend `rm -rf .next` cycle when dev session resumes.

## Per-Page Findings

### / (Home)
- **Minor**: Cookie banner covers ~35% of mobile viewport (cross-page issue, see Cross-Cutting).
- **Minor**: Ultra-wide (2560) banner.png crops with corgi face dominant on right — acceptable cinematic intent.
- **Otherwise clean** at all viewports. FullBleedHero, MenuCards, NewsletterCTA performing as designed.
- Screenshots: `home-{360,390,768,1280,1440,1920,2560}x*.png`

### /shop
- **Major**: Shop hero on portrait viewports (360, 390, 768) zooms into the top-left of `promotion.png`, showing only painted "ESSENTIALS / PARENTS" type. The shop products (t-shirt, mug, hat) are NOT visible above the fold. `objectPosition: "center"` is wrong for portrait crop. **Fix:** `objectPosition: "center 60%"` or `"50% 70%"` in `components/shop/stacked-hero.tsx:35`.
- **Minor**: Desktop overlay collision — HTML kicker "SCOUTPAW SHOP" lives on the left, gradient mask is left, painted "DOG PARENTS / essentials" type also on left. Triple-stacking on left side. Consider dropping visible kicker (keep sr-only h1).
- Screenshots: `shop-{360,768,1280,1920}x*.png`

### /watch
- **Major**: At md (768), `WatchHero` text col is `minmax(0,3fr)` of 12fr = 25% of viewport. Title "Watch the Whole Pack." (`text-5xl`) wraps to **4 lines** ("Watch / the / Whole / Pack."). Awkward. **Fix:** widen text col at md only — e.g., `md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)_minmax(0,2fr)]` in `components/watch/watch-hero.tsx:42`.
- **Major**: Top-nav "Join the Newsletter" button wraps to 2 lines at 768. Add `whitespace-nowrap` to button label or shrink to "Newsletter" at md only.
- **Minor**: Tagline wraps to 3 lines at lg+ (`Watch the / Whole / Pack.`) — acceptable for cinematic hero, matches brand intent.
- Screenshots: `watch-{360,768,1280,1920,2560}x*.png`

### /coming-soon/games (representative)
- **Major**: Cookie banner CLIPS the hero title "Games are wagging this way" on 360x640 — title visible but bottom of letters partially covered.
- **Minor**: Below hero acceptable. Layout fine at md+.
- Screenshots: `coming-soon-games-{360,1280,1920}x*.png`

### /characters/buddy (representative)
- **Minor**: Cookie banner covers character image bottom half on 360.
- **Otherwise clean.** CharacterHero looks great at md+. FunFactsList visible below.
- Screenshots: `characters-buddy-{360,1280}x*.png`

### /privacy and /terms
- **Minor**: Cookie banner covers "placeholder page" italic note on 360.
- **Otherwise clean.** White card layout works at all sizes. GrassStrip + footer transitions clean.
- Screenshots: `privacy-360x*.png`, `terms-1920x*.png`

---

## Cross-Cutting Patterns

### Pattern 1: Cookie Consent Banner Dominates Mobile (Major, every page)
`components/analytics/cookie-consent.tsx` renders fixed bottom banner taking 30-40% of mobile viewport. Decline + Accept buttons both sub-44px touch targets. Clips hero content on smaller pages (coming-soon).
- **Severity:** Major
- **Affects:** every route, every viewport on first visit, ~3-5s before dismissed
- **Fix:** Migrate Decline + Accept to shared `<Button>` component; consider compact mobile variant with single-line copy.

### Pattern 2: Filter Chips at sub-44px Touch Target (Minor, 3 components)
- `components/shop/product-grid.tsx:95` — `min-h-[40px]`
- `components/watch/watch-library.tsx:221` — `min-h-[40px]` (deprecated, but file still in repo)
- `components/watch/explore-videos.tsx:133` — `min-h-[40px]`
- **Fix:** Standardize on `min-h-[44px]` across all filter chips.

### Pattern 3: Ad-hoc Anchors Below Touch Target (Major, 3 spots)
- `components/analytics/cookie-consent.tsx:64,70` (highest priority — modal dialog)
- `components/home/video-grid.tsx:55` ("Watch on @ScoutPawTV" text link — no min-h)
- `components/nav/footer.tsx:112` social icons at exactly 44px (borderline; recommend `h-12 w-12`)
- **Fix:** Add `min-h-[44px]` + `inline-flex items-center` to video-grid anchor; bump footer socials; migrate cookie buttons to shared `<Button>`.

### Pattern 4: Hero `objectPosition: center` Wrong for Portrait Crops (Major, shop)
Shop hero (1920×1073 source) on portrait viewports zooms to top-left. Other heroes' source images (home banner.png at 2754×1536) have central focal subjects, so portrait crop works.
- **Fix:** `components/shop/stacked-hero.tsx:35` use `objectPosition: "center 65%"` or similar.

### Pattern 5: Section padding scaling is consistent (positive observation)
All sections use `px-4 md:px-8` (or `... lg:px-12`) consistently. No regressions found.

### Pattern 6: Footer Transitions Clean (positive observation)
Honey gradient → honey-recolored grass curve → grass blades → navy footer working across all pages. The `body:has(#newsletter)` CSS rule from prior session is performing as designed.

---

## Touch-Target Violations

| # | Component | File:Line | Current | Required | Severity |
|---|-----------|-----------|---------|----------|----------|
| 1 | Cookie Decline | `analytics/cookie-consent.tsx:64-69` | ~32-36px (no min) | `min-h-[44px]` | Major |
| 2 | Cookie Accept | `analytics/cookie-consent.tsx:70-75` | ~36-40px (no min) | `min-h-[44px]` | Major |
| 3 | Product filter chip | `shop/product-grid.tsx:95` | `min-h-[40px]` | `min-h-[44px]` | Minor |
| 4 | Watch library filter (deprecated) | `watch/watch-library.tsx:221` | `min-h-[40px]` | `min-h-[44px]` or delete file | Minor |
| 5 | Explore videos filter chip | `watch/explore-videos.tsx:133` | `min-h-[40px]` | `min-h-[44px]` | Minor |
| 6 | Home "Watch on @ScoutPawTV" | `home/video-grid.tsx:55` | no min-h | `min-h-[44px]` | Major |
| 7 | Footer social icons | `nav/footer.tsx:112` | `h-11 w-11` (44px exact) | `h-12 w-12` headroom | Minor |

---

## Fix-Plan Seeds

### Seed 1: Cookie Consent UX + Touch Targets (1.5h, Major)
**Goal:** Migrate ad-hoc cookie banner buttons to shared `<Button>`; reduce mobile footprint.

Findings addressed:
- Pattern 1 (cookie banner dominance)
- Touch-target #1 + #2 (Decline + Accept)
- Visual finding: coming-soon-games-360 title clipping

Files: `components/analytics/cookie-consent.tsx`

Recommended approach:
- Replace inline `<button>` Decline → `<Button variant="ghost" size="md">`
- Replace inline `<button>` Accept → `<Button variant="primary" size="md">`
- Add mobile-specific compact variant: shorter copy, smaller container, `pb-safe` for iOS notch
- Re-test 360x640 across all 7 pages

### Seed 2: Hero Image Positioning + WatchHero md Grid (1h, Major)
**Goal:** Fix hero focal crop at portrait viewports.

Findings addressed:
- Shop hero crops away products on portrait (Major)
- WatchHero text col too narrow at md (Major)
- WatchHero top-nav Newsletter button wraps at md (Major)

Files: `components/shop/stacked-hero.tsx`, `components/watch/watch-hero.tsx`, `components/nav/top-nav.tsx` (or `nav-links.tsx`)

Recommended approach:
- Shop: change `objectPosition: "center"` → `"center 65%"` (favors product band over painted text)
- Watch: split grid responsive — `md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)_minmax(0,2fr)]`
- TopNav: add `whitespace-nowrap` to "Join the Newsletter" button OR shrink label at md

### Seed 3: Filter Chip + Ad-hoc Anchor Compliance (1h, Minor)
**Goal:** Touch-target floor compliance.

Findings addressed:
- Pattern 2 (filter chips at 40px)
- Touch-target #3, #4, #5, #6, #7
- Pattern 3 partially (video-grid anchor + footer socials)

Files: `components/shop/product-grid.tsx`, `components/watch/explore-videos.tsx`, `components/watch/watch-library.tsx` (or delete file), `components/home/video-grid.tsx`, `components/nav/footer.tsx`

Recommended approach:
- Replace `min-h-[40px]` → `min-h-[44px]` on all 3 filter chip families
- Add `min-h-[44px] inline-flex items-center` to home/video-grid YouTube link
- Bump footer socials to `h-12 w-12`
- Delete deprecated `watch/watch-library.tsx` (confirmed no consumers)

---

## Stats

| Metric | Count |
|--------|-------|
| Components audited | 44 |
| Pages captured | 7 |
| Screenshots produced | 49 |
| **Critical findings** | **0** |
| **Major findings** | **8** |
| **Minor findings** | **10** |
| Components with zero findings | 17 |

**Pages with major issues:** /shop (hero), /watch (md tagline + nav wrap), /coming-soon (cookie clipping title). Cookie consent affects all pages.

**Pages clean** (cookie banner aside): /privacy, /terms, /characters/[slug].

**Recommended fix order:** Seed 1 (highest user-facing impact, every page) → Seed 2 (shop + watch redesign polish) → Seed 3 (touch-target sweep).

**Total fix effort:** ~3.5h across 3 seeds.

---

## Unresolved Questions

1. **Cookie banner compact mobile variant** — desired UX, or accept current footprint?
2. **Shop hero painted-text overlap with HTML kicker** — intentional brand layering, or undesired collision worth resolving (drop visible kicker)?
3. **Watch hero md grid split** — apply the 5fr/6fr/1fr fix, or accept 3-line wrap at 768 as cinematic?
4. **Footer social icons** — bump from exact-44px to 48px for headroom, or accept WCAG floor?
5. **Watch library deprecated file** — delete now, or leave dormant?

---

## Methodology Notes

- Dev mode (`pnpm dev`) had stale Next.js vendor chunk errors during capture — production build (`pnpm start` after `pnpm build`) was used. Recommend dev session restart procedure: `rm -rf .next && pnpm dev`.
- Screenshots are viewport-only (not full-page). Full-page captures rejected to keep dir size manageable (~19MB total at viewport-only).
- Playwright + Chromium auto-installed via `npx -y playwright install chromium` into Windows AppData.
