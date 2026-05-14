---
phase: 6
title: Hero Yellow Zones
status: completed
priority: P1
effort: 45m
dependencies:
  - 1
---

# Phase 6: Hero Yellow Zones

## Overview

Replace the hero's cyan-fade gradient (Iteration 2) with yellow `#ffd70c` gradient zones on BOTH edges. Left zone is wide (~40%) to host text on solid yellow for maximum legibility; right zone is narrower (~25%) to frame the image symmetrically. Anchors the hero visually to the now-yellow navbar above and mirrors the FeatureBanner yellow downstream.

**Note:** This is the hero's 3rd revision. Convergence target: text fully legible against solid yellow zone, characters fully visible in the center, both gutters feel intentional.

## Requirements

- Functional:
  - Left ~40% of banner has yellow gradient → fully opaque yellow at left edge, fading to transparent at the seam
  - Right ~25% mirror gradient (transparent → yellow at right edge)
  - Center 35% of image shows full character art unobscured
  - Text card on mobile retinted yellow `bg-[#ffd70c]/90`
- Non-functional: no layout shift; image still loads with `priority`; typecheck/lint clean.

## Architecture

`components/home/full-bleed-hero.tsx`. The current structure has a single left-edge cyan fade. Replace with two yellow gradient overlays. `objectPosition` nudges from `60% 50%` to `55% 50%` to recenter characters slightly. Mobile glass card retint preserves layering.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. Locate the banner wrapper and left-side fade overlay (currently `from-paper via-paper/60 to-transparent`).
2. Replace with two yellow gradient overlays:
   ```tsx
   {/* Left yellow zone — strong fade for text legibility (md+) */}
   <div
     aria-hidden
     className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-[#ffd70c] via-[#ffd70c]/85 to-transparent md:block"
   />

   {/* Right yellow fade — symmetric framing */}
   <div
     aria-hidden
     className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-[#ffd70c] via-[#ffd70c]/55 to-transparent md:block"
   />
   ```
3. Update `objectPosition`: `60% 50%` → `55% 50%` (small nudge to keep characters centered between the wider left zone and narrower right zone).
4. Mobile glass card (currently `bg-[rgb(198_231_233/0.85)]` = cyan): swap to `bg-[#ffd70c]/90` so mobile matches desktop yellow zone aesthetic.
5. Remove the cyan-tinted `[text-shadow:0_*_*_rgba(198,231,233,...)]` styles from `CardBody` — text now sits on solid yellow, no shadow needed. Keep text as `text-ink`.
6. Confirm `bg-paper` (cyan) on the outer `<section>` is still present for gutters >1600px screens — fine, image gutters fall back to cyan.
7. Run `pnpm typecheck` + `pnpm lint`.
8. Visual smoke at 375px, 768px, 1024px, 1440px, 1920px, >1600px: verify left text zone solid yellow, characters visible, right gutter framed symmetrically.

## Success Criteria

- [ ] Left ~40% of hero is solid yellow gradient (text fully legible)
- [ ] Right ~25% mirror fade (symmetric framing)
- [ ] Characters fully visible center
- [ ] Mobile card retinted yellow
- [ ] No text-shadow hacks needed for legibility
- [ ] typecheck + lint clean
- [ ] No layout shift on load

## Risk Assessment

- **Risk:** Yellow zones cover too much of the image. **Mitigation:** widths tunable (2/5 left, 1/4 right). User can request narrower zones.
- **Risk:** Solid yellow next to yellow navbar = visual flatness at top. **Mitigation:** navbar's bottom border or shadow + the gradient FALL-OFF on the right of the zone create separation. If still flat, add subtle `border-b border-ink/10` or `shadow-cozy` on navbar (P1 already plans this).
- **Risk:** `objectPosition: 55%` cuts off important left-side art content. **Mitigation:** banner.png character cluster appears center-distributed; 55% nudge is conservative.
- **Risk:** Mobile yellow card too saturated against page bg. **Mitigation:** if too loud, drop to `bg-[#ffd70c]/75` or keep current cyan tint. Decide via visual smoke.
