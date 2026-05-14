---
phase: 2
title: MenuCard hover unification
status: completed
priority: P2
effort: 20m
dependencies: []
---

# Phase 2: MenuCard hover unification

## Overview

Synchronize all hover transitions inside `MenuCard` to a single tempo (`duration-500 ease-gentle`) and add a subtle whole-composition lift on the outer Link wrapper so the card breathes upward as ONE unit on hover. Differential motion magnitudes are preserved (image lifts more than text) so the "floating two-card" identity stays intact.

## Requirements

**Functional**
- Hovering ANY part of a menu card lifts the whole composition together.
- All transitions use `duration-500` + `ease-gentle`.
- Image card still lifts more than text card (floating accent preserved).
- Pill arrow still slides up subtly + shadow grows.

**Non-functional**
- No structural change — two-card design preserved.
- `ease-gentle` token verified present in `tailwind.config.ts` (already used by Shop tile post-iter-2).
- Disabled (`comingSoon`) cards retain wrapperClass — minor hover lift on disabled cards acceptable per brainstorm.

## Architecture

`components/home/menu-cards.tsx` — `MenuCard` component + its `wrapperClass`. Three hover-affected elements + the outer wrapper.

**Changes:**

| Element | Current | New |
|---------|---------|-----|
| Outer wrapper (`wrapperClass` line 144) | `"group relative flex h-full flex-col"` | `"group relative flex h-full flex-col transition-transform duration-500 ease-gentle hover:-translate-y-1"` |
| Image card (line ~112) | `transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-cozy-lg` | `transition-all duration-500 ease-gentle group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-cozy-lg` |
| Text card (line ~143) | `transition-shadow duration-300 group-hover:shadow-cozy-md` | `transition-all duration-500 ease-gentle group-hover:shadow-cozy-md` |
| Pill (line ~147) | `transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md` | `transition-all duration-500 ease-gentle group-hover:-translate-y-0.5 group-hover:shadow-md` |

**Net hover behavior:**
- Outer Link `hover:-translate-y-1` (1px up).
- Image card `group-hover:-translate-y-2` (additional 2px up → 3px total).
- Image card `group-hover:scale-105`.
- Text card shadow `shadow-cozy` → `shadow-cozy-md`.
- Pill `-translate-y-0.5` + shadow grow.
- All on the same 500ms `ease-gentle` curve.

## Related Code Files

- Modify: `components/home/menu-cards.tsx` (`MenuCard` function, around lines 100-160)

## Implementation Steps

1. Update `wrapperClass` at line 144.
2. Update the image card's className at line ~112.
3. Update the text card's className at line ~143.
4. Update the pill's className at line ~147.
5. Run `pnpm typecheck`. Halt on errors.
6. Run `pnpm lint`. Halt on new errors.
7. Boot dev server, navigate to `/`, hover each of the 3 menu cards:
   - Whole card lifts together smoothly.
   - Image visibly rises more than the text card.
   - Pill shifts up + shadow grows in sync.
   - No element feels "out of step" — motion reads cohesive.
   - Hovering the text card or pill triggers the WHOLE composition's hover state (via group-hover).

## Success Criteria

- [ ] `wrapperClass` includes `transition-transform duration-500 ease-gentle hover:-translate-y-1`
- [ ] Image card uses `duration-500 ease-gentle group-hover:-translate-y-2`
- [ ] Text card uses `transition-all duration-500 ease-gentle`
- [ ] Pill uses `duration-500 ease-gentle`
- [ ] Hovering anywhere on the card triggers cohesive motion
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean

## Risk Assessment

- **3px total lift may feel "leaping"** — combined wrapper-1 + image-2 = 3px. If feels excessive, reduce image to `-translate-y-1` (combined 2px).
- **`hover:-translate-y-1` only fires when cursor is over the Link's bounding box** — flex column wraps both cards, hit area covers everything visually. Fine.
- **`ease-gentle` token missing from Tailwind config** — verify before merge. Already used by Shop tiles post-iter-2; should exist.
- **`role="link"` disabled card wrapper also gets hover lift** — per brainstorm, acceptable. If user objects later, branch wrapperClass.
- **Pill at 500ms feels sluggish on its own** — perceived speed is the COMPOSITION speed; pill in sync should feel natural.
