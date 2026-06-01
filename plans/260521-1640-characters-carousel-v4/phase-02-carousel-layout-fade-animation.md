---
phase: 2
title: "Carousel Layout & Fade Animation"
status: completed
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: Carousel Layout & Fade Animation

## Overview

Make the carousel hold equal-size cards with the pose overflowing the top, and
swap the coverflow scaling for a soft opacity edge-fade with move-by-1.

## Requirements

- Functional: 3 equal cards fully visible (desktop); pose overflow never clipped;
  next/prev moves by 1; cards fade smoothly across viewport edges.
- Non-functional: same scale + height for every card; no CLS; transform/opacity only.

## Architecture

Embla's viewport must stay `overflow:hidden` (it hides off-screen slides) — real
vertical overflow is impossible. The viewport gets **top padding** equal to the
pose's above-card height; the card sits in the lower zone; the pose extends up
into the padding strip, inside the viewport → never clipped.

`use-carousel-coverflow.ts` → renamed `use-carousel-fade.ts`: drops the `scale`
write, keeps an opacity-only per-frame tween — the 3 in-view cards stay fully
opaque, cards fade across the edges as they enter/leave.

## Related Code Files

- Rename: `components/characters/use-carousel-coverflow.ts` → `use-carousel-fade.ts` (opacity-only).
- Modify: `components/characters/character-carousel-track.tsx` — viewport top padding, drop scale, retune.
- Modify: `components/characters/character-carousel.tsx` — section min-height for the taller viewport.
- Read for context: `components/characters/character-carousel-card.tsx` (Phase 1 output).

## Implementation Steps

1. Rename `use-carousel-coverflow.ts` → `use-carousel-fade.ts`:
   - Drop `MIN_SCALE` / `node.style.transform` writes — opacity only.
   - Tune so cards within the 3-visible band sit at opacity 1 and fade toward 0
     across the viewport edges (soft, no hard step). Update the exported hook name.
2. `character-carousel-track.tsx`:
   - Keep slide basis `86% / sm:52% / lg:33.2%` (3 visible) and `slidesToScroll`
     default = 1 (move-by-1).
   - Add **top padding** to the Embla viewport sized to the pose's above-card
     overflow; raise the viewport height so card + overflow both fit, no clip.
   - Replace `useCarouselCoverflow` with `useCarouselFade`.
   - Bump Embla `duration` slightly (cinematic glide).
   - Rename the scaled-node hook target class if needed (e.g. `.coverflow-scaler`
     → `.carousel-fader`) consistently across the hook + card/track.
3. `character-carousel.tsx`:
   - Retune the section min-height so it fits the taller carousel and still
     roughly matches the detail card (no jump on open/close).
4. Verify at rest: 3 equal cards, all same scale + height; poses pop out, none
   clipped; 4th/5th off-screen.
5. Typecheck + build; eyeball desktop / tablet / mobile.

## Success Criteria

- [ ] 3 equal-size cards fully visible (desktop); 2 tablet / 1 mobile.
- [ ] Every pup same apparent scale + height.
- [ ] Pose top-overflow visible, never clipped by the viewport.
- [ ] Next/prev moves by 1; slide + opacity fade is smooth, no snap.
- [ ] No CLS; typecheck + build pass.

## Risk Assessment

- Viewport top-padding maths — if the pose still clips, increase padding/height;
  verify with the tallest-overflow pup.
- Opacity tween must keep the 3 in-view cards fully opaque — only edge cards fade;
  test the threshold so mid-carousel cards never look dimmed.
