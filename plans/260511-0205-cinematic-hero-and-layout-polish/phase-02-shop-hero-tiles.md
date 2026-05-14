---
phase: 2
title: Shop Hero & Tiles
status: completed
priority: P2
effort: 2h
dependencies: []
---

# Phase 2: Shop Hero & Tiles

## Overview

Convert Shop's `StackedHero` from stacked (image-then-text-below) to overlay full-viewport hero matching Home. Enlarge `ExploreProducts` tiles so the section feels premium and full.

## Requirements

**Functional**
- Shop hero fills viewport (`min-h-[100svh]`)
- Painted-in "DOG PARENTS / essentials" type on `promotion.png` remains visible (not occluded by HTML overlay)
- Explore product tiles visibly larger; reduced surrounding negative space

**Non-functional**
- Mirror Home hero pattern (gradient mask + left-side text panel) for visual consistency
- Preserve sticker rotation aesthetic on tiles
- Responsive across 360 / 768 / 1280 / 1920+

## Architecture

- `StackedHero` becomes overlay: image is `fill` background of a 100svh container; text overlay sits in a left-anchored panel above a left→right honey gradient mask. The `aspect-[16/9]/21/9/24/9` cascade and the cream text strip below the image both go away.
- Component name kept (`StackedHero`) to avoid downstream rename churn — internal architecture changes, props unchanged.
- `ExploreProducts` widens its container (`max-w-3xl` → `max-w-5xl`) and tightens inner image padding so the product image fills more of each tile.

## Related Code Files

**Modify**
- `components/shop/stacked-hero.tsx`
- `components/shop/explore-products.tsx`

**Read for context**
- `components/home/full-bleed-hero.tsx` (overlay pattern reference)

## Implementation Steps

1. **`stacked-hero.tsx` — overlay restructure**
   - Replace `<section>` content. Pattern (mirror Home `FullBleedHero`):
     ```tsx
     <section className="relative isolate overflow-hidden bg-paper">
       <h1 className="sr-only">{kicker}</h1>
       <div className="relative min-h-[100svh] w-full">
         <Image src={image} alt={imageAlt} fill priority sizes="100vw"
                className="object-cover" style={{ objectPosition: 'center' }} />
         {/* Left-side honey gradient mask (desktop only, for legibility) */}
         <div aria-hidden="true" className="absolute inset-0 hidden md:block"
              style={{ background: 'linear-gradient(90deg, rgba(255,241,201,0.92) 0%, rgba(255,241,201,0.55) 30%, rgba(255,241,201,0) 55%)' }} />
         {/* Overlay text panel — anchored bottom-left so it doesn't fight the painted "DOG PARENTS" type */}
         <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-hero items-end px-4 py-12 md:items-center md:px-12 md:py-0 lg:px-20">
           <div className="max-w-md rounded-3xl bg-honey/90 p-6 shadow-cozy md:max-w-lg md:bg-transparent md:p-0 md:shadow-none lg:max-w-xl">
             <p className="font-display ...">{kicker}</p>
             <p className="mt-5 ...">{description}</p>
             {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
           </div>
         </div>
       </div>
     </section>
     ```
   - Drop the `aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9]` ladder
   - Drop the cream text strip below the image
   - Note: `StackedHero` has no `title` prop (description is the visible body) — keep prop signature unchanged
   - **Consider:** if HTML kicker still collides with painted artwork in QA, drop the visible kicker (keep sr-only h1 + actions only) — decide after browser check

2. **`explore-products.tsx` — enlarge tiles**
   - Change container max-width: `<ul className="mx-auto mt-14 grid max-w-3xl ...">` → `max-w-5xl`
   - Reduce inner image padding: in the `<div className="absolute inset-0 p-6 md:p-8">` (line 82), change to `p-4 md:p-6`
   - Bottom label panel may need slight resize: confirm visually — leave unchanged unless cramped

3. **Verify build** — `pnpm run build`

4. **Visual QA — critical**
   - Desktop: confirm HTML overlay text doesn't collide with painted "DOG PARENTS / essentials" type on promotion.png
   - Mobile: panel falls back to full-width honey card at bottom (matches Home pattern)
   - Tiles: image visibly larger; product feels less floaty in surrounding white space

## Todo List

- [ ] StackedHero: convert to overlay 100svh structure
- [ ] StackedHero: left honey gradient mask
- [ ] StackedHero: bottom-left text panel positioning
- [ ] StackedHero: drop aspect-ratio ladder + below-image strip
- [ ] ExploreProducts: `max-w-3xl` → `max-w-5xl`
- [ ] ExploreProducts: image padding `p-6/p-8` → `p-4/p-6`
- [ ] Build passes (`pnpm run build`)
- [ ] Manual QA — HTML text vs. painted text collision check
- [ ] Manual responsive QA on 360 / 768 / 1280 / 1920

## Success Criteria

- [ ] Shop hero fills viewport with `min-h-[100svh]`
- [ ] Painted-in artwork remains clearly visible
- [ ] HTML kicker + description + CTAs readable on all breakpoints
- [ ] Explore tiles visibly larger (image footprint, container width)
- [ ] Sticker rotations + hover behavior preserved
- [ ] No console / Tailwind warnings

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| HTML overlay text collides with painted "DOG PARENTS" type on promotion.png | Position panel at `items-end` bottom-left; if still bad, remove visible kicker, keep only actions + sr-only h1 |
| Mobile fallback (gradient hidden, honey card visible) overcrowds the small viewport | Mirror Home's 360px-tested layout; constrain card to `max-w-md` |
| Wider explore container breaks visual rhythm with surrounding 2xl/hero sections | `max-w-5xl` (~1024) is < `max-w-hero`; still narrower than parent — visually balanced |
| Larger tiles + 1:1 aspect = very tall section on mobile | Current tiles already aspect-square; widening container scales them but mobile is single-column already — acceptable |

## Security Considerations

None — visual changes only.

## Next Steps

Phase 3 (Watch Library Removal) — independent.
