---
phase: 4
title: "Animation Rework"
status: completed
priority: P1
effort: "5h"
dependencies: [3]
---

# Phase 4: Animation Rework

## Overview

Make the carousel⇄detail transition cinematic: center the clicked card first,
let the carousel recede gracefully, morph the pose, and stagger the detail copy
in — no abrupt jumps.

## Requirements

- Functional: clicking a non-centered card centers it before expanding; open and
  close are smooth in both directions; prev/next flip stays smooth.
- Non-functional: transform/opacity only (GPU); reduced-motion → plain crossfade;
  no layout jumps.

## Architecture

**Center-first:** `character-carousel-track.tsx` — on card click, if the index
is not the selected snap, `emblaApi.scrollTo(index)` and defer `onSelect` until
the Embla `settle` event; if already centered, call `onSelect` immediately. The
other cards sliding aside during that scroll *is* the natural "others transition
away" motion. The morph then always originates from the full-size centered card.

**Open/close** in `character-carousel.tsx` — the carousel view exit becomes a
recede (`opacity → 0`, `scale 1 → 0.96`, slight `y`), not a flat fade. The detail
panel enters with `opacity` + `scale 0.97 → 1`. The selected pose morphs via the
existing `layoutId`. Unified easing `cubic-bezier(0.16, 1, 0.3, 1)`, ~0.55–0.6 s.

**Detail content** in `character-detail-card.tsx` — kicker → title → subtitle →
bio → quote stagger up (~50 ms steps); atmosphere/motif fade slightly behind.

## Related Code Files

- Modify: `components/characters/character-carousel-track.tsx` — center-first click + `settle` deferral.
- Modify: `components/characters/character-carousel.tsx` — recede exit, unified easing constant, transition tuning.
- Modify: `components/characters/character-carousel-card.tsx` — pass click index up if needed for center-first.
- Modify: `components/characters/character-detail-card.tsx` — staggered content entrance, panel scale-in.
- Read for context: `lib/theme/tokens.ts` (easing/duration tokens, if reusable).

## Implementation Steps

1. **Center-first** (`character-carousel-track.tsx`):
   - Card click handler receives the slide index. If `index !== emblaApi.selectedScrollSnap()`:
     `emblaApi.scrollTo(index)`, then on a one-shot `settle` listener call `onSelect(slug)`.
   - Else call `onSelect(slug)` immediately.
   - Keep the existing drag-vs-click guard (`event.detail` + `draggedRef`).
   - Use a short Embla scroll for this (snappy "focus" beat, ~280 ms feel).
2. **Recede exit / easing** (`character-carousel.tsx`):
   - Define a shared `EASE = [0.16, 1, 0.3, 1]`.
   - Carousel `motion.div` exit: `{ opacity: 0, scale: 0.96, y: 12 }`; enter reverse.
   - Detail `motion.div` enter: `{ opacity, scale: 0.97 → 1 }`.
   - Tune the `layoutId` morph transition (spring or ~0.55 s tween) for a smooth pose flight.
3. **Staggered detail content** (`character-detail-card.tsx`):
   - Wrap the copy stack so kicker/title/subtitle/bio/quote animate in with a
     small per-item delay; keep the existing flip `AnimatePresence` for prev/next.
   - Atmosphere/motif fade in slightly delayed.
4. **Reduced motion:** when `useReducedMotion()` is set — skip center-first scroll
   animation (instant), skip morph (plain crossfade), no stagger.
5. Verify no layout jump: section min-height consistent across modes.
6. Run `pnpm typecheck` + `pnpm build`; manually verify open from a centered card
   AND from a side card, close, prev/next, and reduced-motion.

## Success Criteria

- [ ] Clicking a side card centers it, then expands — no abrupt jump.
- [ ] Carousel recedes (scale+fade) on open, returns on close.
- [ ] Pose morph is smooth and consistent (always from the centered card).
- [ ] Detail copy staggers in; close reverses cleanly.
- [ ] Reduced-motion path = plain crossfade, no morph.
- [ ] All animation is transform/opacity; no CLS; typecheck + build pass.

## Risk Assessment

- `settle`-deferred open could feel laggy if the scroll is long — keep the
  center-first scroll short; if a card is already centered, skip straight to expand.
- One-shot `settle` listener must be removed after firing (avoid leaks / double-open).
- `layoutId` morph + `mode="popLayout"` still wants a real-browser check — center-first
  removes the scaled-origin inconsistency; verify visually.
