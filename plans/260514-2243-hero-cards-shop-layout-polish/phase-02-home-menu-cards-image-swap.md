---
phase: 2
title: Home menu cards image swap
status: completed
priority: P2
effort: 30m
dependencies: []
---

# Phase 2: Home menu cards image swap

## Overview

Swap the three Home destination card images (Characters, Shop, Watch) to Set A assets from `assets/card/`. Adjust the Characters card background from cream `#fffbe6` to `var(--bg-soft-sky)` to prevent the yellow duck from blending into the panel. No markup changes — pure data edit.

## Requirements

**Functional**
- Characters card → `/assets/card/characters.png` (yellow duck) on `var(--bg-soft-sky)` bg.
- Shop card → `/assets/card/shop.png` (multicolor balls) on `var(--bg-peach)` bg (unchanged).
- Watch card → `/assets/card/watch.png` (paw bed + remote) on `var(--bg-warm-tan)` bg (unchanged).
- New images stay centered, not cropped, no distortion.

**Non-functional**
- No new files, no new design tokens.
- Hover/scale/shadow behavior unchanged.
- Image-card aspect (square) + `object-contain p-3` preserved.

## Architecture

`components/home/menu-cards.tsx` defines an `allCards: Card[]` array (lines 27-50). Each entry has `{ label, copy, image, href, bg, accentGlow, comingSoon? }`. The MenuCard component already handles transparent PNG layout via `object-contain p-3` on a fixed-square frame. Only data fields change.

## Related Code Files

- Modify: `components/home/menu-cards.tsx` (entries at lines 28-50)
- Assets used (no modification): `assets/card/characters.png`, `assets/card/shop.png`, `assets/card/watch.png`

## Implementation Steps

1. **Transparency pre-flight check** — open each PNG (`characters.png`, `shop.png`, `watch.png`) and confirm alpha channel. If any has a solid backdrop (e.g. black or white block), HALT and report back to user. Do NOT ship a card with a black square inside the colored bg.
2. If transparency is good, in `components/home/menu-cards.tsx`:
   - CHARACTERS entry: change `image: "/assets/card/characters.png"` (likely already this path — verify). Change `bg: "#fffbe6"` → `bg: "var(--bg-soft-sky)"`. Leave `accentGlow` unchanged (still `var(--brand-primary)`).
   - SHOP entry: `image: "/assets/card/shop.png"` — verify path. `bg` unchanged.
   - WATCH entry: `image: "/assets/card/watch.png"` — verify path. `bg` unchanged.
3. Run `pnpm typecheck`.
4. Boot dev server, navigate to `/`, scroll to "Step into the pack's world". Verify each card:
   - Image centered, not stretched.
   - No black/white square backdrop showing.
   - Card maintains square frame, `object-contain` keeps full subject visible.
   - Hover lift + shadow still works.
5. Mobile (`<md`) — confirm single-column stack renders cleanly.

## Success Criteria

- [ ] All three card images verified transparent before swap
- [ ] Characters card uses soft-sky bg + duck image, duck silhouette pops
- [ ] Shop card uses peach bg + balls image
- [ ] Watch card uses warm-tan bg + paw-bed image
- [ ] No image distortion, stretching, or off-center placement
- [ ] Hover/focus states intact
- [ ] Cards keep consistent square frame across the 3-column row
- [ ] Mobile single-column stack renders cleanly

## Risk Assessment

- **PNG has solid bg** — Set A images may not be alpha-clean. If detected, halt + ask user for re-export. Do NOT apply CSS hacks like `mix-blend-mode` as cover.
- **Duck blending despite bg swap** — if `var(--bg-soft-sky)` still feels weak, fallback to `var(--bg-peach)`. Decide visually.
- **Watch paw-bed (pink) on warm-tan bg clash** — if pink dominates and looks muddy, consider swapping `accentGlow` from `var(--bg-sky-deep)` to `var(--bg-blush)` for a softer halo. Visual judgment.
- **Image padding (`p-3`) cropping subject edges** — verify duck wing/paw and ball edges aren't clipped. If clipped, increase to `p-4`.
