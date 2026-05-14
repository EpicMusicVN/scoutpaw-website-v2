---
phase: 4
title: Validation + visual QA
status: completed
priority: P2
effort: 30m
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Validation + visual QA

## Overview

Verify all three implementation phases land cleanly across the target viewport spectrum. Runs typecheck/lint, then a structured visual walkthrough of Home + Shop at each viewport. Catches edge cases (Corgi clipping, card seam collisions, tile rhythm) that pure unit verification misses.

## Requirements

**Functional**
- `pnpm typecheck` exits 0.
- `pnpm lint` exits 0 (warnings acceptable, no new errors).
- Home + Shop render correctly at viewports: 375 (mobile), 768 (md), 1024 (lg), 1440 (xl), 1600+ (max).
- All focus rings + CTAs work via keyboard.

**Non-functional**
- No console errors in browser devtools.
- No layout shifts (CLS) introduced by changes.

## Architecture

Two-step validation:
1. **Static checks** — typecheck + lint catch syntax + type regressions.
2. **Visual QA** — manual walkthrough using Chrome DevTools responsive mode.

For browser automation pieces, use the `agent-browser` or `chrome-devtools` skill to capture screenshots at each viewport.

## Related Code Files

No file changes in this phase — read-only validation of:
- `app/page.tsx`
- `app/shop/page.tsx`
- `components/home/full-bleed-hero.tsx`
- `components/home/menu-cards.tsx`
- `components/shop/explore-products.tsx`

## Implementation Steps

1. Run `pnpm typecheck`. Halt + report if errors.
2. Run `pnpm lint`. Halt + report if new errors (pre-existing warnings OK).
3. Boot dev server (`pnpm dev`).
4. **Home `/` walkthrough** at 375 / 768 / 1024 / 1440 / 1600+:
   - Hero: title is `Discover a happier world of puppies` (no suffix).
   - Hero: Corgi face fully visible at md+; mobile shows in-flow card below banner.
   - Hero: text card sits bottom-left at md+, narrower than before.
   - Menu cards: 3 cards visible, Set A images render with no black/white backdrop.
   - Characters card bg = soft-sky; duck silhouette pops.
   - Cards hover: lift + shadow + scale.
5. **Shop `/shop` walkthrough** at same viewports:
   - Hero: same card position (bottom-left), products visible.
   - "Find Your Pup's Favourite": image card on top tilts, text card below stays level.
   - 2-col on sm+, 1-col on mobile.
   - Tile hover: image untilts + lifts; text card shadow grows.
   - "Shop →" arrow shifts right on hover.
6. Keyboard navigation: tab through Hero CTAs, menu cards, shop tiles. Focus rings visible.
7. Devtools console: no errors, no warnings new to this branch.
8. (Optional) Snapshot via `agent-browser` skill at 1440 for archive in `plans/260514-2243-hero-cards-shop-layout-polish/visuals/`.

## Success Criteria

- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm lint` exits 0 (no new errors)
- [ ] Home Hero title correct at all viewports
- [ ] Home Hero Corgi unobstructed at md+
- [ ] Shop Hero merch unobstructed at md+
- [ ] Mobile Hero in-flow card unchanged
- [ ] All 3 menu cards render with Set A images cleanly
- [ ] Shop tiles render editorial layout (image top / text below)
- [ ] All hover states + focus rings work
- [ ] No new console errors

## Risk Assessment

- **Hero card hits CloudDivider on lg** — symptom: card bottom edge touches/overlaps following section. Fix: bump `pb-16` → `pb-20` in phase 1.
- **Mobile (375) hero overflows** — symptom: mobile in-flow card pushes content too far below viewport. Should be unchanged from current; if regressed, audit `mx-4 -mt-8` block.
- **Shop tile heights inconsistent** — sibling stacked cards may produce uneven row heights if copy varies. Fix: add `auto-rows-fr` to `<ul>` or set fixed min-height on text card.
- **Lint complains about removed JSX** — if the old `absolute inset-x-3 bottom-3` overlay is referenced anywhere else (unlikely), search before merging.
