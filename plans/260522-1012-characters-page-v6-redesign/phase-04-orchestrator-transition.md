---
phase: 4
title: "Orchestrator Transition"
status: completed
priority: P1
effort: "2h"
dependencies: [1, 2, 3]
---

# Phase 4: Orchestrator Transition

## Overview

Upgrade the carousel↔detail swap in `CharacterCarousel` to a layered cinematic
transition: the carousel recedes (fade + scale-down) while the detail rises
(fade + scale-up), reading as a camera push-in. No shared-element morph.

## Requirements

- Functional: opening a pup plays the layered transition; closing reverses it;
  no layout jump between views; `?pup=` URL + popstate still sync.
- Non-functional: transforms/opacity only (GPU-friendly); reduced-motion →
  instant; file < 200 lines.

## Architecture

`character-carousel.tsx` already swaps via `<AnimatePresence mode="popLayout">`
between a `key="detail"` and a `key="carousel"` `motion.div`. v6 retunes the
`initial`/`animate`/`exit` variants so the two views move in opposite depth
directions during the cross — the outgoing view scales **down** + fades, the
incoming view scales **up** from slightly larger + fades in. The detail's
internal `STORY_CONTAINER` stagger (Phase 1) then plays for the content reveal.
`mode="popLayout"` is kept so both views overlap during the cross.

## Related Code Files

- Modify: `components/characters/character-carousel.tsx`
- Read for context: `components/characters/character-detail-card.tsx` (its
  internal stagger), `lib/theme/tokens.ts` (easings, if reused)

## Implementation Steps

1. **`character-carousel.tsx`** — confirm Phase 1 already removed `flipPup` and
   the `onPrev`/`onNext` props from `<CharacterDetailCard>`. (If not done, do it
   here.)
2. Retune the transition variants on the two `motion.div`s inside
   `<AnimatePresence mode="popLayout" initial={false}>`:
   - **Detail** (`key="detail"`): `initial={{ opacity: 0, scale: 1.04 }}`,
     `animate={{ opacity: 1, scale: 1 }}`, `exit={{ opacity: 0, scale: 1.04 }}`
     — rises/pushes in from slightly larger.
   - **Carousel** (`key="carousel"`): `initial={{ opacity: 0, scale: 0.94 }}`,
     `animate={{ opacity: 1, scale: 1 }}`, `exit={{ opacity: 0, scale: 0.94 }}`
     — recedes/scales down.
   - `transition={{ duration, ease: EASE }}` with `EASE = [0.16,1,0.3,1]`;
     bump `duration` from `0.55` to `~0.65` for cinematic weight (keep
     `reduce ? 0 : 0.65`).
3. Ensure no layout jump: both `motion.div`s wrap content that fills the same
   `min-h-[calc(100svh-5rem)]` section (Phases 1 + 2 set this). The section
   already `flex items-center` centres content — verify the carousel and detail
   inner heights match so the swap does not shift.
4. Keep intact: `openPup`/`closePup`, `popstate` sync, `?pup=` push/replace,
   `scrollIntoView`, `returning`/`autoFocus`, `useReducedMotion` (drives
   `duration` + lets reduced-motion skip scale — guard scale with `reduce`).
5. Reduced motion — when `reduce`, set `duration: 0` and skip the scale offsets
   (use `scale: 1` throughout) so there is no motion, only an instant swap.
6. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Opening a pup: carousel recedes + detail rises (layered push-in)
- [ ] Closing: reverse — detail recedes, carousel rises back
- [ ] No layout jump / re-centre on the swap
- [ ] `?pup=` URL, popstate/back-button, return-focus all still work
- [ ] Reduced-motion → instant swap, no scale
- [ ] `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Layout jump on swap** → both views must resolve to the same section height;
  verified visually in Phase 5. If they differ, pin a shared `min-h` wrapper.
- **`popLayout` + scale** → `popLayout` removes the exiting node from flow;
  combined with scale this is the intended overlap-cross. Verify no flash of a
  scrollbar during the cross.
- **Shared file with Phase 1** → this phase depends on Phase 1; do not run them
  concurrently on `character-carousel.tsx`.
