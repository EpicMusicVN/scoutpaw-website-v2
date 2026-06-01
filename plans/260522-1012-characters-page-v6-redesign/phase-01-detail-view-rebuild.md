---
phase: 1
title: "Detail View Rebuild"
status: completed
priority: P1
effort: "3h"
dependencies: []
---

# Phase 1: Detail View Rebuild

## Overview

Rebuild `CharacterDetailCard` as a full-screen (100vh) art-dominant split — large
artwork on the right, story panel on the left — and remove the prev/next
pup-flipper. Drop the now-unused flip wiring from the orchestrator.

## Requirements

- Functional: detail view fills the viewport; large artwork is the focal point;
  story shows breed kicker + name + tagline + full `bio` + quote; Back button +
  Escape-close + `?pup=` deep-link still work.
- Non-functional: file < 200 lines; responsive (split stacks on mobile/tablet);
  reduced-motion honored; AA contrast; artwork `priority`-loaded.

## Architecture

`CharacterDetailCard` keeps its themed-gradient backdrop (edge-masked) +
`CharacterAtmosphere` + `CharacterMotif` + drifting decor. Layout changes from a
balanced 2-column to an **art-dominant split**: artwork column ~55-60% on the
right (`md:order-2`), story panel ~40-45% left. The pup-flipper (`ArrowButton`
×2) is deleted; `onPrev`/`onNext` props are removed; the orchestrator stops
passing them and its `flipPup` callback is deleted (no remaining caller).

## Related Code Files

- Modify: `components/characters/character-detail-card.tsx`
- Modify: `components/characters/character-carousel.tsx` (remove `flipPup`,
  remove `onPrev`/`onNext` from the `<CharacterDetailCard>` call)
- Read for context: `components/characters/character-atmosphere.tsx`,
  `character-motif.tsx`, `character-quote.tsx`, `character-scene-decor.tsx`

## Implementation Steps

1. **`character-detail-card.tsx`** — remove `onPrev`, `onNext` from the props
   type and destructure. Delete the bottom-right pup-flipper `<div>` with the
   two `<ArrowButton>`s. Remove the now-unused `ArrowButton` import.
2. Change the outer container from `min-h-[clamp(560px,80vh,900px)]` to fill the
   viewport: `min-h-[calc(100svh-5rem)]` (5rem ≈ sticky nav), keep
   `flex flex-col justify-center overflow-hidden`.
3. Rework the content grid into an **art-dominant split**:
   - Desktop (`md+`): `md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]` — story
     panel ~42%, artwork ~58%. Artwork keeps `md:order-2` (right side).
   - Artwork box: enlarge from `max-w-[420px]` to a dramatic
     `max-w-[clamp(320px,42vw,640px)]`; keep `aspect-[3/4]`, the accent bloom,
     `object-contain object-bottom`, `priority`, drop shadow.
   - Story panel: breed kicker · `name` (large — `text-4xl md:text-6xl`) ·
     `tagline` (skip if `TODO`) · full **`bio`** unclamped (skip if `TODO`) ·
     `<CharacterQuote quote={quote} accentColor={theme.decor} />`. Keep the
     existing `STORY_CONTAINER`/`STORY_ITEM` Framer stagger.
4. Mobile/tablet (`<md`): single column — artwork on top, story below; allow the
   section to grow taller than the viewport and scroll if content overflows
   (no clipping of text).
5. Keep: themed gradient + `PANEL_MASK`, atmosphere/motif/decor, the
   "Back to the pack" button (top-left), `closeRef` focus-on-mount,
   Escape-to-close, the double-close guard.
6. **`character-carousel.tsx`** — delete the `flipPup` `useCallback`; in the
   `<CharacterDetailCard>` JSX remove the `onPrev`/`onNext` props. Leave
   `openPup`/`closePup`/popstate/`?pup=` logic intact.
7. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Detail view fills ~100vh; large artwork (right) is the clear focal point
- [ ] No prev/next arrows; `onPrev`/`onNext`/`flipPup` fully removed, no dead refs
- [ ] Back button + Escape close work; `?pup=` deep-link intact
- [ ] Story shows breed + name + tagline + full bio + quote, staggered in
- [ ] Responsive: split stacks on mobile/tablet, no text clipping
- [ ] `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Tall content on short viewports** → mobile allows scroll; don't hard-pin
  100vh on `<md`. Use `min-h`, not `h`.
- **Orchestrator file also touched in Phase 4** → Phase 4 depends on this phase
  to avoid a conflicting edit on `character-carousel.tsx`.
