---
phase: 1
title: "Carousel Track Loop and Arrows"
status: completed
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Carousel Track Loop and Arrows

## Overview

Anchor Max: turn off the Embla infinite loop so the carousel always starts on /
returns to Max (index 0). Give the prev/next arrows disabled states at the
scroll bounds so loop-off does not feel dead.

## Requirements

- Functional: `loop:false`; Max (index 0) is always the leftmost anchor; arrows
  disable at the start (prev) and end (next).
- Non-functional: file < 200 lines; reduced-motion + drag-suppression + the
  `autoFocus` return-focus behaviour all preserved.

## Architecture

`character-carousel-track.tsx` uses `useEmblaCarousel`. Switching `loop` to
`false` makes index 0 a hard start. Without loop, `scrollPrev`/`scrollNext` are
no-ops at the bounds — so the arrows need a `canScrollPrev`/`canScrollNext`
state, updated on Embla's `select` + `reInit` events, to render a disabled look.
The `/watch` `ExploreVideos` component already implements this exact pattern
(`canScrollLeft`/`canScrollRight` + a `NavArrow` `visible` prop) — mirror it.

## Related Code Files

- Modify: `components/characters/character-carousel-track.tsx`
- Modify: `components/characters/character-carousel-arrows.tsx` (add an optional
  `disabled` prop to `ArrowButton`)
- Read for pattern: `components/watch/explore-videos.tsx` (the `canScroll*` +
  arrow-state pattern)

## Implementation Steps

1. **`character-carousel-track.tsx`** — Embla options: `loop: true` → `false`.
   Keep `align:"start"`, `containScroll:false`, `startIndex`,
   `duration: reduce ? 0 : 30`.
2. Add `canScrollPrev` / `canScrollNext` state:
   ```ts
   const [canPrev, setCanPrev] = useState(false);
   const [canNext, setCanNext] = useState(false);
   useEffect(() => {
     if (!emblaApi) return;
     const update = () => {
       setCanPrev(emblaApi.canScrollPrev());
       setCanNext(emblaApi.canScrollNext());
     };
     update();
     emblaApi.on("select", update).on("reInit", update);
     return () => { emblaApi.off("select", update).off("reInit", update); };
   }, [emblaApi]);
   ```
3. **`character-carousel-arrows.tsx`** — add an optional `disabled?: boolean`
   prop to `ArrowButton`; wire it to the native `disabled` attribute and a
   dimmed style (`opacity-40 pointer-events-none` or `disabled:` utilities).
   Keep the existing look when not disabled.
4. Pass `disabled={!canPrev}` / `disabled={!canNext}` to the two `ArrowButton`s.
5. Verify the CSS edge-mask, `handleCardSelect` (anchor-first scroll),
   drag-suppression refs, the `settle`-fallback timer, and the `autoFocus`
   return-focus effect all still work with loop off.
6. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Embla `loop:false`; Max (index 0) is the permanent left anchor
- [ ] Prev arrow disabled at the start; next arrow disabled at the end
- [ ] `ArrowButton` `disabled` prop added; non-disabled look unchanged
- [ ] Click-to-open, drag-suppression, return-focus still work
- [ ] `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Loop-off changes feel** → intended (Max anchored); arrow disabled-states
  prevent a dead "stuck" feel at the bounds.
- **`ArrowButton` shared with the detail view?** → as of v6 the detail view's
  flipper was removed; `ArrowButton` is carousel-only. Adding an optional prop
  is backwards-compatible regardless.
