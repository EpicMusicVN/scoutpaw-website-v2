---
phase: 1
title: Contrast & Spacing
status: completed
priority: P1
effort: 2h
dependencies: []
---

# Phase 1: Contrast & Spacing

## Overview

Broad, low-risk pass over text colors, filter chips, and the newsletter→footer gap. Lands fast wins before the riskier hero rewrites in Phase 2. No structural changes — only color/opacity token swaps and two CSS class removals.

## Requirements

**Functional:**
- Nav links readable at first glance on cream nav (no hover required to perceive interactivity)
- Description copy in MenuCards / ExploreProducts / PlaylistGrid reads dark + crisp on cream/honey backgrounds
- Inactive shop filter chips visibly distinct on cream — no white-on-cream blend
- Newsletter section connects directly to grass strip on home + shop (no cream gap)

**Non-functional:**
- WCAG AA contrast minimum on every text/background pair touched
- No new tokens added to `tailwind.config.ts` or `app/globals.css`
- All changes use existing tokens (`text-ink`, `text-warm-text`, `bg-honey`)

## Architecture

Single-file edits. No new components. No prop changes. The strategy is **opacity reduction** (replace `/80`, `/85` modifiers with full-opacity tokens) and **token swaps** (`bg-surface` white → `bg-honey/60` warm tint on inactive chips).

For the footer gap: two CSS class removals. `SectionCurve position="bottom"` element deleted from `newsletter-cta.tsx`; `mt-12` removed from `<footer>` in `footer.tsx`. Newsletter's honey gradient now meets `<GrassStrip>` directly; grass's painted top wave continues to serve as the cream-to-grass transition (visual separator preserved).

## Related Code Files

- Modify: `components/nav/nav-links.tsx`
- Modify: `components/nav/mobile-nav.tsx`
- Modify: `components/home/menu-cards.tsx`
- Modify: `components/shop/explore-products.tsx`
- Modify: `components/shop/product-grid.tsx`
- Modify: `components/watch/playlist-grid.tsx`
- Modify: `components/home/newsletter-cta.tsx`
- Modify: `components/nav/footer.tsx`
- Modify: `components/home/feature-banner.tsx` (recommended — same family, body uses `text-warm-text/90`)

## Implementation Steps

1. **Nav links — full-opacity ink**
   - File: `components/nav/nav-links.tsx:37`
   - Change inactive: `text-ink/80 hover:text-ink` → `text-ink hover:text-ink` (active branch already `text-ink`)
   - Disabled branch (`text-ink/45`) untouched — disabled affordance is intentional
   - Repeat in `components/nav/mobile-nav.tsx` (find equivalent class string for mobile menu items)

2. **Description copy — bump to full opacity**
   - `components/home/menu-cards.tsx`:
     - Header copy line 106: `text-ink/85` → `text-warm-text` (token resolves to same hex but full opacity, more readable)
     - Card copy line 166: `text-ink/85` → `text-warm-text`
   - `components/shop/explore-products.tsx`:
     - Header copy line 60: `text-ink/85` → `text-warm-text`
     - Tile copy line 91: `text-ink/80` → `text-warm-text`
   - `components/watch/playlist-grid.tsx`:
     - Header copy line 22: `text-ink/85` → `text-warm-text`
     - Card copy line 74: `text-ink/85` → `text-warm-text`
   - `components/home/feature-banner.tsx`:
     - Body line 56: `text-warm-text/90` → `text-warm-text`

3. **Filter chips — warm tint on inactive**
   - File: `components/shop/product-grid.tsx:98`
   - Inactive class string change:
     ```tsx
     // BEFORE
     "bg-surface text-ink/80 shadow-sm hover:-translate-y-0.5 hover:bg-honey hover:text-ink"
     // AFTER
     "bg-honey/60 text-ink border border-ink/15 shadow-sm hover:-translate-y-0.5 hover:bg-honey hover:border-ink/30"
     ```
   - Active branch (`bg-ink text-surface shadow-cozy`) untouched — already crisp
   - The `Suspense` skeleton in `app/shop/page.tsx:128-131` still uses `bg-surface` — leave as-is (it's a transient loading shimmer, not user-facing chip)

4. **Newsletter → footer gap closure**
   - File: `components/home/newsletter-cta.tsx:160`
   - Delete the line: `<SectionCurve position="bottom" color="var(--bg-base)" variant="cloud" height={70} />`
   - File: `components/nav/footer.tsx:63`
   - Change: `<footer className="mt-12">` → `<footer>` (remove `mt-12`)

5. **Type-check**
   - Run `pnpm exec tsc --noEmit` — should pass with zero diff in error count
   - If new errors appear, they're from token typos in step 2 — fix and re-run

6. **Visual smoke (manual or Playwright)**
   - `pnpm dev` → screenshot home, shop, watch at 1440, 768, 360
   - Save to `plans/260510-2254-ui-polish-pass/visuals/phase-01-{page}-{viewport}.png`
   - Compare against pre-change screenshots if available

## Success Criteria

- [ ] `nav-links.tsx` and `mobile-nav.tsx` use `text-ink` (not `text-ink/80`) on inactive non-disabled state
- [ ] All 6 description-copy locations listed above use `text-warm-text` (no `/80` or `/85` modifier)
- [ ] Inactive shop filter chips render warm-honey-tinted with subtle border on cream — no white pop
- [ ] Newsletter section visually connects to grass strip with no cream gap on home AND shop
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] No new console warnings during `pnpm dev`
- [ ] Manual viewport check: 1440 / 768 / 360 all read crisply

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `text-warm-text` token may not be wired in `tailwind.config.ts` for all opacity uses | Verify token exists at line 20-49 of `tailwind.config.ts` before bulk edit — it is wired (`warm-text` maps to `--text-on-warm-rgb`) |
| Mobile-nav uses different class names | Read `mobile-nav.tsx` first; if structure differs, adapt the same color rule (full ink on inactive) |
| Removing the bottom curve exposes a hard honey-grass edge that looks abrupt | Grass strip has a painted cream wave at top — verify it still reads as a soft handoff. If not, fall back to brainstorm option C (recolor curve grass-green) — single-line change |
| `SectionCurve` import becomes unused after step 4 | Remove unused import line in `newsletter-cta.tsx` to silence ESLint |

## Security Considerations

None. Pure presentational changes.

## Postmortem (Re-implemented 2026-05-11)

**Root cause of "white menu text" symptom:** The Tailwind theme defined `colors.base = withOpacity('--bg-base-rgb')`, which made `text-base` a *color* utility (cream) that conflicted with Tailwind's default `text-base` font-size utility. Because the color rule was generated *after* the font-size rule in source order, `md:text-base` on nav links applied `color: rgb(var(--bg-base-rgb))` — i.e., cream — overriding the earlier `text-ink` class. Result: nav text colored identically to the nav background.

The original Phase 1 implementation only bumped `text-ink/80` → `text-ink`, which had no effect since `md:text-base` was overriding it.

**Fix applied:**
1. Renamed `colors.base` → `colors.paper` in `tailwind.config.ts` (using the same `--bg-base-rgb` CSS variable underneath).
2. Search/replaced 14 component files: `bg-base` → `bg-paper`, `ring-offset-base` → `ring-offset-paper`. Files: `nav/top-nav.tsx`, `home/full-bleed-hero.tsx`, `home/cinematic-hero.tsx`, `shop/stacked-hero.tsx`, `app/watch/page.tsx`, `app/watch/loading.tsx`, `app/shop/loading.tsx`, `watch/watch-library.tsx`, `shop/product-card.tsx`, `shop/explore-products.tsx`, `watch/playlist-grid.tsx`, `watch/featured-video.tsx`, `watch/our-channels.tsx`, `ui/button.tsx`.
3. Did NOT change the CSS variable name `--bg-base` / `--bg-base-rgb` — inline `style={{ color: 'var(--bg-base)' }}` and `<SectionCurve color="var(--bg-base)" />` keep working unchanged.

**Verification:** Live computed-style inspection via Chrome DevTools confirmed `<a class="nav-underline">` color before fix = `rgb(251, 246, 233)` (cream); after fix = `rgb(43, 29, 16)` (dark brown — `--ink-rgb`).

**Lesson:** Avoid Tailwind theme color names that collide with default size/spacing utilities (`base`, `lg`, `xl`, `sm`, `xs`, `md`, etc.). Tailwind silently merges generated rules and source order decides the winner, so the failure is invisible in code review.
