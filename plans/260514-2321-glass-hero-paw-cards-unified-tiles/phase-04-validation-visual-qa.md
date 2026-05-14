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

Verify phases 1–3 land cleanly. Runs typecheck + lint, then a structured visual walkthrough of Home + Shop at four viewports plus a keyboard accessibility pass.

## Requirements

**Functional**
- `pnpm typecheck` exits 0.
- `pnpm lint` exits 0 (no new errors).
- Home + Shop render correctly at 375 / 768 / 1024 / 1440.
- All focus rings + CTAs work via keyboard.
- No console errors in browser devtools.

**Non-functional**
- No layout shifts (CLS) introduced by changes.

## Architecture

Two-step validation:
1. **Static checks** — typecheck + lint.
2. **Visual QA** — manual walkthrough.

## Related Code Files

Read-only validation of:
- `app/page.tsx`
- `app/shop/page.tsx`
- `components/home/full-bleed-hero.tsx`
- `components/home/menu-cards.tsx`
- `components/shop/explore-products.tsx`
- `public/assets/patterns/paw-tile.svg`

## Implementation Steps

1. Run `pnpm typecheck`. Halt + report if errors.
2. Run `pnpm lint`. Halt + report if new errors (pre-existing warnings OK).
3. Boot dev server (`pnpm dev`).
4. **Home `/` walkthrough** at 375 / 768 / 1024 / 1440:
   - Hero: card sits top-left at md+; mobile shows in-flow card below banner.
   - Hero: frosted glass effect visible (semi-transparent + blurred); Corgi face fully visible.
   - Hero: card tucked under navbar with breathing room (no edge collision).
   - Menu cards: subtle paw pattern visible behind each product image.
   - Menu cards: section-level scattered decor still present.
   - Cards hover: lift + shadow + image scale.
5. **Shop `/shop` walkthrough** at same viewports:
   - Hero: same top-left glass treatment.
   - Hero: products on banner visible (some may peek through glass — acceptable).
   - "Find Your Pup's Favourite": ONE unified card per tile.
   - Tile hover: whole card untilts + lifts + shadow grows + image scales.
6. Keyboard navigation: tab through Hero CTAs, menu cards, shop tiles. Focus rings visible.
7. Devtools console: no new errors/warnings.

## Success Criteria

- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm lint` exits 0 (no new errors)
- [ ] Home Hero top-left glass card; Corgi unobstructed
- [ ] Shop Hero top-left glass card; products acceptably visible
- [ ] Mobile Hero in-flow card unchanged
- [ ] All 3 menu cards render paw pattern
- [ ] Section decor still present and not visually fighting card pattern
- [ ] Shop tiles render as ONE unified card each
- [ ] Hover/focus states intact
- [ ] No new console errors

## Risk Assessment

- **Glass text contrast** — symptom: hero text reads poorly through `bg-white/45` over busy banner regions. Fix: bump `/45` → `/55` or `/60` in phase 1's hero overlay.
- **Card paw pattern visually fights section decor** — symptom: too many paws on screen. Fix: drop section decor opacity from `0.10` → `0.06` in `menu-cards.tsx:65`.
- **Unified Shop tile seam jarring** — symptom: sharp color edge between image area and text area reads as visual error. Fix: add `border-t border-ink/5` to text area in phase 3.
- **SVG pattern not loading (404)** — symptom: cards show only the bg color, no pattern. Fix: verify `public/assets/patterns/paw-tile.svg` exists at the served path. Curl/visit `/assets/patterns/paw-tile.svg` directly.
