---
phase: 2
title: "Carousel Layout & Background"
status: completed
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: Carousel Layout & Background

## Overview

Retune the coverflow so 3 cards are fully visible (no clipping), and remove the
sky-gradient backdrop block so the carousel blends into the site background.

## Requirements

- Functional: desktop shows exactly 3 whole cards; tablet ~2; mobile 1 (+ sliver).
  No `CharacterSceneBackdrop`; carousel sits on the site cyan.
- Non-functional: clean responsive scaling; no CLS; faint ambient decor only (no block).

## Architecture

`character-carousel-track.tsx` Embla config stays `loop / align:center /
containScroll:false`. Coverflow tween still scales/dims neighbours, but tuned so
side cards stay whole. `character-carousel.tsx` section drops the backdrop;
optional faint floating decor (reused `character-scene-decor` primitives) gives
ambience without a contrasting block.

## Related Code Files

- Modify: `components/characters/character-carousel-track.tsx` — slide basis, `MIN_SCALE`, tween factor, viewport height.
- Modify: `components/characters/character-carousel.tsx` — remove `CharacterSceneBackdrop`; add faint ambient decor.
- Create (optional): `components/characters/character-carousel-ambient.tsx` — ~30 LOC faint drifting notes/sparkles.
- Read for context: `components/characters/character-scene-decor.tsx`, `app/globals.css` (keyframes).

## Implementation Steps

1. **3-up coverflow** in `character-carousel-track.tsx`:
   - Slide basis → `basis-[86%]` mobile, `sm:basis-[52%]`, `lg:basis-[33.2%]`
     (33.2% leaves a sub-pixel safety margin so no 4th-card sliver shows).
   - Raise `MIN_SCALE` 0.74 → ~0.86; retune `TWEEN_FACTOR_BASE` so only the
     immediate neighbours scale and they land ~0.86 (whole, gently de-emphasised).
   - Retune the viewport height clamp for the narrower 3-up cards.
2. **Remove the background block** in `character-carousel.tsx`:
   - Delete the `<CharacterSceneBackdrop />` render and its import.
   - Section background = site cyan (`bg-paper` / transparent over `body`).
3. **Ambient decor (faint, no block):** render ~4–6 `MusicNote`/`Sparkle`
   primitives at ~12% opacity, scattered, gently drifting (`paw-drift`/`twinkle`
   keyframes). Inline a small SCATTER array or extract `character-carousel-ambient.tsx`.
   `aria-hidden`, `pointer-events-none`, stilled under reduced-motion.
4. Verify at rest: desktop shows exactly center + 2 full neighbours, 4th/5th off-screen.
5. Run `pnpm typecheck` + `pnpm build`; eyeball the 3-up at desktop/tablet/mobile widths.

## Success Criteria

- [ ] Desktop: 3 cards fully visible, none clipped; center emphasised.
- [ ] Tablet ~2-up, mobile 1-up — clean composition, no harsh clipping.
- [ ] No `CharacterSceneBackdrop` / no contrasting background block.
- [ ] Carousel blends with the site background; faint decor only.
- [ ] No CLS; typecheck + build pass.

## Risk Assessment

- Sub-pixel rounding could leak a 1px sliver of a 4th card — `33.2%` basis margin
  mitigates; verify across widths.
- After removing the backdrop, `CharacterSceneBackdrop` may become unused —
  confirmed and deleted in Phase 5 (not here).
