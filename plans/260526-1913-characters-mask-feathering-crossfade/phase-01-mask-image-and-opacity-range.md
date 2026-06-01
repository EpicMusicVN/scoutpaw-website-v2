---
phase: 1
title: Mask Image and Opacity Range
status: completed
priority: P1
effort: 30m
dependencies: []
---

# Phase 1: Mask Image and Opacity Range

## Overview

Add `maskImage` + `WebkitMaskImage` (linear-gradient feathering top + bottom 12%) to the motion.div style. Widen incoming opacity range from `[0.5, 1]` to `[0, 1]`.

## Requirements

**Functional:**
- Each scene's motion.div has `mask-image: linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)`
- WebKit prefix included for Safari
- Incoming opacity range widened to `[0, 1]` (full crossfade)
- `useReducedMotion` guard preserves `[1, 1]` flat for both opacity ranges
- Outgoing opacity (Plan E) unchanged: `[1, 0.85]`
- Composite opacity formula unchanged: `incoming × outgoing`

**Non-functional:**
- Mask doesn't break sticky positioning (mask is a paint-time effect, not layout)
- Safari iOS rendering verified
- AA inside feathered zones: text near the top/bottom 12% edge may sit on partially-transparent bg → can show through to next/prev scene tint. Visual call.

## Architecture

CSS `mask-image` with linear-gradient. The mask defines which pixels of the element are visible:
- `transparent` mask = element invisible
- `black` mask = element fully visible
- Gradient between = element fades

Mask is independent of `opacity` — they multiply visually. So a scene at `opacity: 0.5` with `mask` at the feathered top will be 0.5 × mask-alpha = at most 50% visible at the edges.

For `0 → 1` incoming opacity: at entry start, scene is 0% visible everywhere. As it enters, opacity rises to 1.0 (sticky middle phase). The mask continues to feather the top+bottom edges throughout.

Effect: incoming scene fades up in opacity AND has feathered top edge → very soft entry against the previous (still-visible-at-bottom) scene's feathered bottom.

## Related Code Files

- **Modify:** `components/characters/character-section.tsx` — motion.div style block + incomingOpacity range

## Implementation Steps

1. **Open** `components/characters/character-section.tsx`.
2. **Widen incoming opacity range** in the existing `useTransform`:
   ```diff
   - const incomingOpacity = useTransform(enterProgress, [0, 1], reduce ? [1, 1] : [0.5, 1]);
   + const incomingOpacity = useTransform(enterProgress, [0, 1], reduce ? [1, 1] : [0, 1]);
   ```
3. **Add mask to motion.div style:**
   ```diff
     <motion.div
       style={{
         scale,
         opacity,
         backgroundColor: theme.surfaceTint,
   +     maskImage:
   +       "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
   +     WebkitMaskImage:
   +       "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
       }}
       className="relative flex min-h-[100dvh] items-center overflow-hidden md:sticky md:top-0 md:h-[100dvh] md:min-h-0"
     >
   ```
4. **Update component docstring** to mention the new mask-image + true crossfade:
   ```diff
   - * On desktop, framer-motion tweens the inner div's scale + opacity tied to
   - * two scroll progress ranges:
   - *   - Entry: opacity fades 0.5 → 1.0 as the scene enters viewport
   - *   - Exit: scale 1 → 0.96 + opacity 1 → 0.85 as the scene leaves
   - *   - Composite opacity = incoming × outgoing (multiplied) for a smooth
   - *     crossfade window with adjacent scenes
   + * On desktop, framer-motion tweens the inner div's scale + opacity tied to
   + * two scroll progress ranges:
   + *   - Entry: opacity fades 0 → 1.0 as the scene enters viewport (true fade-in)
   + *   - Exit: scale 1 → 0.96 + opacity 1 → 0.85 as the scene leaves
   + *   - Composite opacity = incoming × outgoing (multiplied)
   + * Combined with a `mask-image` linear-gradient (top + bottom 12% fade to
   + * transparent), adjacent scenes truly crossfade through each other's
   + * feathered edges — no hard color cut.
   ```
5. **Typecheck + lint** — must pass.
6. **Smoke test** at `/characters`:
   - Scroll through 5 scenes; confirm crossfade visible (previous scene's bottom feathered edge + next scene's top feathered edge overlap as the latter fades in)
   - Mobile: scenes scroll naturally; mask still feathers edges (visible as soft top/bottom)
   - `prefers-reduced-motion`: opacity flat at 1, mask still applied (decorative only)

## Success Criteria

- [ ] motion.div has `maskImage` + `WebkitMaskImage` (12% top + bottom fade)
- [ ] Incoming opacity `[0, 1]`
- [ ] Sticky behavior unaffected (visual + DevTools confirm)
- [ ] Crossfade visible at adjacent scene boundaries
- [ ] iOS Safari render check (no mask quirks)
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** Text near the top/bottom edge (kicker or last CTA) sits on the feathered (partially transparent) area, showing the previous/next scene's tint through it. *Mitigation:* content has `py-12 md:py-16` padding from edges, which is more than 12% of viewport — text should be in the fully-opaque middle 76%. Verify live.
- **Risk:** iOS Safari mask-image quirks. *Mitigation:* the WebKit prefix is included; mask-image: linear-gradient is supported in iOS 14+.
- **Risk:** First scene on initial page load — `enterProgress` may start partially through its entry window, causing brief opacity dip. *Mitigation:* framer-motion `useScroll` calculates initial progress from scroll position; if user lands at top, `enterProgress` reads as 1 (past the entry window for first scene which is already above the fold). Verify on /characters initial load.

## Security Considerations

None.
