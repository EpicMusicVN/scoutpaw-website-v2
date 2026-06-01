---
phase: 2
title: "Carousel Layout & 100vh Section"
status: completed
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: Carousel Layout & 100vh Section

## Overview

Widen the carousel to show 4 cards, make the section fill the viewport
(`100svh`), and retune the opacity fade for the new visible count.

## Requirements

- Functional: 4 cards visible desktop (≥3 fully), 2 tablet, 1 mobile; section
  `min-h-[100svh]`, content vertically centered; move-by-1; soft opacity fade.
- Non-functional: immersive on desktop; responsive on tablet/mobile; no CLS.

## Architecture

`character-carousel-track.tsx` — slide basis drops to ~25% (4 visible); Embla
viewport grows tall for the big poses. `character-carousel.tsx` — the section
becomes `min-h-[100svh]` with the content vertically centered. `use-carousel-fade.ts`
fade constants retuned so the ~4 in-view cards stay opaque and only the
off-screen pup fades.

## Related Code Files

- Modify: `components/characters/character-carousel-track.tsx` — slide basis, viewport height.
- Modify: `components/characters/character-carousel.tsx` — `min-h-[100svh]` section, vertical centering.
- Modify: `components/characters/use-carousel-fade.ts` — retune `FADE_START`/`FADE_FACTOR` for 4-visible.

## Implementation Steps

1. `character-carousel-track.tsx`:
   - Slide basis → `basis-[72%]` mobile, `sm:basis-[40%]`, `lg:basis-[25%]` (4 visible).
   - Embla viewport height → `h-[clamp(460px,68vh,820px)]` to give the ~2x poses room.
   - Keep `loop`, `align:center`, move-by-1, centre-first click, drag guard.
2. `character-carousel.tsx`:
   - Section → `min-h-[100svh]`; inner wrapper centers content vertically
     (`flex items-center`), keeps `max-w-hero` + horizontal padding.
   - Keep the ambient decor + `AnimatePresence` carousel⇄detail swap.
3. `use-carousel-fade.ts`:
   - Retune `FADE_START` / `FADE_FACTOR` so the 4 in-view cards read at opacity
     ~1 and the off-screen pup fades softly (no mid-carousel dimming).
4. Verify: 4 cards visible desktop, none of the front 3 clipped; section fills
   the viewport; responsive down-breakpoints clean.
5. Typecheck + build; eyeball desktop / tablet / mobile.

## Success Criteria

- [ ] 4 cards visible desktop (≥3 fully); 2 tablet / 1 mobile.
- [ ] Carousel section fills `100svh`; content vertically centered, immersive.
- [ ] Move-by-1 + soft opacity fade; 4 in-view cards stay opaque; no snap.
- [ ] No CLS; typecheck + build pass.

## Risk Assessment

- 100svh on mobile — the big pose + pad + arrows must fit ~650px; verify, scale
  the pose down on mobile if cramped.
- 5 pups + 4 visible = a near-static carousel — accepted; arrows still work.
- Tall viewport must not clip the popped-out pose — pose stays within the
  full-height button, inside the viewport.
