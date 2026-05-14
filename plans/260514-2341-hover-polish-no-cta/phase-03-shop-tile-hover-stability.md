---
phase: 3
title: Shop tile hover stability
status: completed
priority: P2
effort: 10m
dependencies: []
---

# Phase 3: Shop tile hover stability

## Overview

Fix the "text block becomes larger on hover" issue reported by the user on `/shop` → "Find Your Pup's Favourite" tiles. Root cause is `group-hover:rotate-0` un-tilting the card on hover — the rotation transition changes the card's visual bounding box, which reads as text shifting/scaling. Fix: keep tilt at rest, drop the un-tilt; only translate + shadow animate on hover. Also bump duration to 500ms to match site-wide hover tempo.

## Requirements

**Functional**
- Card stays tilted at rest (preserves sticker identity).
- On hover: card lifts (`-translate-y-2`) and shadow grows (`shadow-cozy-xl`).
- Card does NOT un-tilt on hover → no apparent text/layout shift.
- Layout dimensions stable; surrounding content does not visibly shift.

**Non-functional**
- No new tokens, no structural change.
- Tempo aligned with menu cards (`duration-500 ease-gentle`).

## Architecture

`components/shop/explore-products.tsx` — the unified card div inside each tile's `<Link>` (post-iter-2 structure). Single one-line className edit + duration bump.

**Changes:**

```diff
- className={`relative overflow-hidden rounded-[2rem] bg-surface shadow-cozy transition-all duration-300 ease-gentle ${tile.rotate} group-hover:rotate-0 group-hover:-translate-y-2 group-hover:shadow-cozy-xl`}
+ className={`relative overflow-hidden rounded-[2rem] bg-surface shadow-cozy transition-all duration-500 ease-gentle ${tile.rotate} group-hover:-translate-y-2 group-hover:shadow-cozy-xl`}
```

Two atomic changes:
1. `duration-300` → `duration-500` (matches menu card tempo).
2. Drop `group-hover:rotate-0` (preserve tilt on hover).

**Inner image (optional consistency tweak):**

```diff
- className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-105"
+ className="object-contain object-center transition-transform duration-500 ease-gentle group-hover:scale-105"
```

Already 500ms; just swap easing curve for full site-wide consistency.

## Related Code Files

- Modify: `components/shop/explore-products.tsx`

## Implementation Steps

1. Edit the unified card div's className per the diff above.
2. Edit the inner image's className per the diff above.
3. Run `pnpm typecheck`. Halt on errors.
4. Run `pnpm lint`. Halt on new errors.
5. Boot dev server, navigate to `/shop`, scroll to "Find Your Pup's Favourite":
   - Tile sits tilted at rest.
   - Hover: card stays tilted, lifts 2px up, shadow grows from `shadow-cozy` to `shadow-cozy-xl`.
   - No rotation animation visible on hover.
   - Text block does NOT visibly resize / shift.
   - Inner image scales 105% smoothly with ease-gentle curve.
   - Surrounding content stays stable.

## Success Criteria

- [ ] Unified card className no longer contains `group-hover:rotate-0`
- [ ] Unified card uses `duration-500` (matches site-wide tempo)
- [ ] Inner image uses `ease-gentle` (was `ease-out`)
- [ ] Card stays tilted on hover
- [ ] No apparent text/layout shift on hover
- [ ] Hover lift + shadow grow + image scale all work smoothly
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean

## Risk Assessment

- **Always-tilted card may feel less "alive"** — losing the un-tilt animation reduces interaction richness. But user explicitly prioritized stability over richness. Document as intended.
- **2px lift on a tilted card may visually appear asymmetric** — because the tilt offsets the bounding box, the lift visually emphasizes one corner. Acceptable; if user objects, can drop to `-translate-y-1` for subtler effect.
- **Sibling tiles in same grid row** — one tilts `-rotate-2`, the other `rotate-2`. Both stay tilted on hover. Symmetric across the pair. Fine.
- **Easing change on inner image** — `ease-out` and `ease-gentle` are very close curves; difference is barely perceptible. Low risk.
