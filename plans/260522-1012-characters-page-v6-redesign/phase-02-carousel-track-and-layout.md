---
phase: 2
title: "Carousel Track and Layout"
status: completed
priority: P1
effort: "3h"
dependencies: []
---

# Phase 2: Carousel Track and Layout

## Overview

Re-lay the Embla carousel: left-anchored, 3 fully-visible cards + an
edge-dissolving peek, no hard boundary, fills 100vh. Replace the per-frame JS
opacity edge-fade with a static CSS mask (delete `use-carousel-fade.ts`).

## Requirements

- Functional: 3 cards fully visible on desktop, left-anchored; a 4th peeks and
  dissolves at the right edge; infinite loop; prev/next arrows still work; click
  a side card = scroll-to-anchor then open.
- Non-functional: no per-scroll-frame JS; section content fills ~100vh; file
  < 200 lines; reduced-motion honored.

## Architecture

Embla config changes from `align:"center"` to `align:"start"` (left anchor),
`loop:true` kept, `containScroll:false` kept. Slide basis tuned so 3 cards fill
the width with a sliver of the 4th showing. The viewport gets a CSS
`mask-image` linear-gradient on the right edge so the peek card fades out
instead of being hard-clipped — `overflow-hidden` stays for scroll mechanics but
its clip edge becomes invisible. The `useCarouselFade` hook + its file are
deleted: the static mask supersedes the per-card opacity tween.

## Related Code Files

- Modify: `components/characters/character-carousel-track.tsx`
- Delete: `components/characters/use-carousel-fade.ts`
- Read for context: `components/characters/character-carousel-card.tsx` (slide
  child — do not edit here; Phase 3 owns it)

## Implementation Steps

1. **`character-carousel-track.tsx`** — Embla options: `align: "center"` →
   `"start"`. Keep `loop:true`, `containScroll:false`, `startIndex`,
   `duration: reduce ? 0 : 30`.
2. Remove `useCarouselFade` — delete the import and the `useCarouselFade(emblaApi)`
   call. Remove the `.carousel-fader` wrapper `<div>` around
   `<CharacterCarouselCard>` in the `slides` map (or keep a plain wrapper if
   needed for height — but no `will-change-[opacity]`, no fader class).
3. Slide basis — 3 full + peek, left-anchored:
   - desktop `lg:basis-[31%]` (3 full cards ≈ 93%, ~7% peek of the 4th)
   - tablet `sm:basis-[46%]` (~2 + peek)
   - mobile `basis-[80%]` (1 + peek)
   - keep `min-w-0 flex-none`, keep horizontal padding (`px-2 md:px-3`).
4. Edge mask — add to the Embla viewport `<div>` (the `ref={emblaRef}` element)
   a right-edge dissolve:
   ```
   style={{
     WebkitMaskImage:
       "linear-gradient(to right, #000 0%, #000 88%, transparent 100%)",
     maskImage:
       "linear-gradient(to right, #000 0%, #000 88%, transparent 100%)",
   }}
   ```
   Left edge stays opaque (it is the anchor). Keep `overflow-hidden`.
5. Viewport / section height — change the wrapper from
   `min-h-[clamp(560px,80vh,900px)]` to `min-h-[calc(100svh-5rem)]` and keep
   `flex flex-col justify-center` so cards centre vertically in the viewport.
   Adjust `VIEWPORT_H` so the card (pose + white card) has enough height —
   e.g. `h-[clamp(520px,72vh,860px)]`; the card itself (Phase 3) sizes within.
6. Keep the prev/next `ArrowButton`s. Keep `handleCardSelect` (centre-first →
   now anchor-first; Embla `scrollTo` + `align:"start"` handles it unchanged),
   the drag-suppression refs, the `autoFocus` return-focus effect, the
   `settle`-fallback timer.
7. Run `pnpm typecheck` + `pnpm lint` — confirm no dangling `use-carousel-fade`
   import anywhere (grep).

## Success Criteria

- [ ] Desktop shows 3 full cards, left-anchored, with a dissolving right-edge peek
- [ ] No hard clip boundary visible; infinite loop works
- [ ] `use-carousel-fade.ts` deleted; no references remain; no `.carousel-fader`
- [ ] Prev/next arrows + click-to-open (anchor-first) still work
- [ ] Carousel content fills ~100vh
- [ ] `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Mask vs loop seam** → the right-edge gradient is viewport-fixed; Embla's
  loop recycles slides beneath it — the dissolve stays consistent. Low risk.
- **Basis tuning** → `31%` is a starting value; nudge so exactly 3 cards read as
  "full" with a clear-but-subtle peek. Verify in browser (Phase 5).
- **`.carousel-fader` leftovers** → grep the repo to ensure the class isn't
  referenced elsewhere before removing the wrapper.
