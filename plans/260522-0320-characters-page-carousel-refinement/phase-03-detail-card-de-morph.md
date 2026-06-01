---
phase: 3
title: Detail Card De-Morph
status: completed
priority: P1
effort: 2h
dependencies:
  - 2
---

# Phase 3: Detail Card De-Morph

## Overview

Remove the framer-motion `layoutId` shared-element morph between carousel card and detail
card — the #1 recurring bug across the journal saga (morph trap, asymmetry, all
unverified). Replace with the already-present `AnimatePresence` crossfade. Fix detail-card
art sizing now that assets are normalized.

## Requirements

- Functional: clicking a card → detail card via clean crossfade + gentle scale; no
  shared-element morph, no jump, no shimmy.
- Functional: detail-card character art renders large (normalized asset), centered in its
  column.
- Non-functional: simpler component tree (KISS) — one whole bug class removed.

## Architecture

**Remove `layoutId` everywhere:**
- `character-carousel-card.tsx` — the pose `motion.div` has `layoutId={`pup-art-${slug}`}`.
  Remove `layoutId`; the `motion.div` can become a plain `div` (no per-element animation
  needed — the parent `AnimatePresence` in `character-carousel.tsx` handles the swap).
- `character-detail-card.tsx` — same pose `motion.div layoutId`. Remove.
- `character-carousel.tsx` — keep the existing `AnimatePresence mode="popLayout"` swap
  (carousel ↔ detail, `opacity` + `scale 0.97→1`). This IS the crossfade — no change.

**Detail-card art sizing (`character-detail-card.tsx`):**
- Art box currently `aspect-[4/5] max-w-[280px] md:max-w-[400px]` with a `getPoseTuning`
  transform wrapper. Normalized poses are `3:4` — set box to `aspect-[3/4]`.
- Remove the `getPoseTuning` import + transform wrapper (file deleted below).
- Character `<Image>` `object-contain object-bottom`; with the normalized asset it now
  fills the box as a hero — verify it is no longer small/floating low-right.

**Delete the dead tuning file:**
- Delete `components/characters/character-carousel-poses.ts` — its only purpose was
  morph-safe pose tuning; both are gone. Remove all imports
  (`character-carousel-card.tsx`, `character-detail-card.tsx`).
- If Phase 5 QA finds 1-2 genuine sit/stand outliers, reinstate a minimal nudge inline —
  do NOT rebuild the general tuning system.

## Related Code Files

- Modify: `components/characters/character-detail-card.tsx` (remove layoutId + tuning, aspect)
- Modify: `components/characters/character-carousel-card.tsx` (remove layoutId + tuning)
- Delete: `components/characters/character-carousel-poses.ts`
- Read: `components/characters/character-carousel.tsx` (confirm AnimatePresence crossfade)

## Implementation Steps

1. Remove `layoutId` from the pose `motion.div` in `character-carousel-card.tsx`;
   simplify to plain `div` if no other motion props remain. Drop `getPoseTuning` import.
2. Remove `layoutId` + `getPoseTuning` + transform wrapper from `character-detail-card.tsx`;
   set art box to `aspect-[3/4]`.
3. Delete `character-carousel-poses.ts`; confirm no remaining imports (grep).
4. Confirm `character-carousel.tsx` crossfade still drives the swap; no edits expected.
5. `pnpm typecheck` + `pnpm lint` — green.
6. Render — click a card, click "Back to the pack", flip prev/next. Transition smooth,
   no jump; detail art is a proper hero.

## Success Criteria

- [ ] No `layoutId` anywhere in `components/characters/`
- [ ] `character-carousel-poses.ts` deleted; zero dangling imports
- [ ] Carousel → detail and back = smooth crossfade, no jump/shimmy
- [ ] Detail-card character renders large and centered in its column
- [ ] `typecheck` + `lint` green

## Risk Assessment

- **Crossfade feels flat vs a morph** — acceptable per approved decision (KISS over a
  5×-failed morph). The `scale 0.97→1` keeps it cinematic.
- **Dangling imports after delete** — Mitigation: grep `character-carousel-poses` and
  `getPoseTuning` repo-wide before typecheck.
