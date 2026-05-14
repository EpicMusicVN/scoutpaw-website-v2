# Hero Center Anchor & Pack Section Decorations

**Date**: 2026-05-13 01:15
**Severity**: Medium
**Component**: Hero card, pack cards section, decorations
**Status**: DONE

## What Happened

Three refinements layered onto the prior hero/pack cards session:

1. **Hero card repositioned**: Moved from `top-1/2 -translate-y-1/2` (vertical center) to `md:top-24 lg:top-32` (upper-third anchor). Mobile: full-height stack with no fixed positioning.
2. **Pack cards image upsizing**: Bumped image height from small box to `h-40 md:h-44 lg:h-48` (160–192 px). Text cards matched via `flex-col flex-1` to force equal height across all cards.
3. **Decorations scatter**: Added 6 hand-placed SVG icons (paw, bone, ball) at `opacity-[0.10]` across the "Step Into the Pack" section. Varied rotation + absolute positioning for premium playful feel.

**Files modified**: `full-bleed-hero.tsx`, `menu-cards.tsx`  
**Validation**: `pnpm typecheck` + `pnpm lint` both clean.

## The Brutal Truth

The "vertically centered" feedback was a miscommunication, not a user mistake. In design parlance, "centered" often means visual balance (poster-style anchor in the upper third), not literal mathematical middle. I built to the math; the brief wanted the cinematic language. Cost: 20 minutes of debug-and-tweak instead of asking upfront. Lesson burned in.

The pack cards image-height problem felt like a rabbit hole at first—text card heights are dynamic, so "approximately half" seemed ambiguous. But the user's directional intent was clear: image visibly smaller than text. Picked `h-40/44/48` as clean, proportion-respecting ratios and moved on. That worked.

SVG decorations almost shipped as a tiled CSS pattern (`:repeating-gradient` with paw prints). Same token budget, vastly worse output. Hand-scattering 6 icons took an extra 10 minutes and feels legitimately premium. Worth it.

## Technical Details

**Hero card anchor**: `position: absolute; top-24 (md), top-32 (lg)`  
Mobile: `position: static; margin-bottom: gap-y-4` to sit in stack naturally.

**Pack cards equal height**:
- Outer grid: `auto-rows-fr` (equalizes wrapper height)
- Text card wrapper: `flex flex-col`
- Inner card: `flex-1` (stretches to fill wrapper)
- No min-height hacks needed; three layers cooperate cleanly.

**SVG decorations**:
- 6 `<SVG fill="currentColor">` icons in absolute wrapper
- Parent wrapper: `opacity-[0.10] text-warm-text` (single source of truth)
- Hand-placed via `top-[X%] left-[Y%] rotate-[Z]` with varied degrees
- Does NOT scale with viewport; stays pixel-fixed on wider screens (acceptable for decorative layer)

## What We Tried

1. **Literal vertical centering** (`top-1/2`): Floated hero text awkwardly low. Rejected.
2. **Dynamic image height calculation**: Considered measuring text card height at runtime, computing 50%. Overengineered. Picked clean ratio instead.
3. **Tiled paw-print CSS pattern**: Generated via `:repeating-linear-gradient`. Felt cheap; visual QA flagged it. Replaced with 6 hand-placed SVGs.

## Root Cause Analysis

1. **"Centered" is a loaded term in design**. Math ≠ visual balance. Future briefs should specify "upper-third" or "hero-poster" anchor if that's the intent.
2. **User directional language ("approximately half") is reliable**. Took me too long to trust it. Ratios matter more than pixel-perfect calculations for responsive images.
3. **Token budgets seduce you into low-effort solutions**: A tiled pattern costs fewer tokens than 6 hand-placed icons. But design wins matter; spent the tokens.

## Lessons Learned

1. **"Vertically centered" in design briefs usually means cinematic-poster upper-third, not literal 50%**: `top-1/2 -translate-y-1/2` puts content at true center, which reads as floating/undersized. `top-24 lg:top-32` is the canonical anchor. In future briefs, surface this distinction early. Ask: "Do you mean mathematical center or visual balance anchor?"

2. **Grid `auto-rows-fr` + flex-col wrapper + `flex-1` child = exact equal-height cards** across all columns, no min-height hacks: Outer grid equalizes wrappers; flex-col + flex-1 stretches the interior card. Three layers, one concept, clean output.

3. **Hand-placed SVG decorations > CSS tiled patterns for "premium playful"**: 6 scattered icons at varied rotation reads "designed"; tiled paw prints read "kids' party flyer." Same token cost, vastly different UX. Curate when you can.

4. **SVG fill colors via `currentColor` + parent opacity**: Don't bake opacity into individual SVGs. Let the parent wrapper own `opacity-[0.10] text-warm-text` as single source of truth. One change tunes all decorations.

5. **Directional ratios beat computed math for responsive images**: User said "image smaller than text." Instead of computing exact height, picked clean ratio (`h-40/44/48` = 160–192 px ≈ 50% of column width). Dynamic text height? Doesn't matter. Trust the directional language.

## Next Steps

- **Visual QA deferred**: 6 plans remain uncommitted; need design sign-off on decoration density, opacity level, and mobile clustering behavior.
- **Potential refinements**: 
  - 10% opacity may read too subtle on light backgrounds; test at 12–15%.
  - Mobile 32px gap below hero banner may feel over-separated; consider 24px.
  - Decoration `%` positions may cluster on narrow viewports; may need tablet-specific offsets.
- **No blockers**: Typecheck and lint both clean. Ready for review once visual QA complete.

**Owner**: self  
**Timeline**: Visual QA is next gate. Decoration tuning is post-merge polish if needed.
