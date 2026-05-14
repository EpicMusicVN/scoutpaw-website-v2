---
phase: 2
title: Pack Cards Image Upsize + Equal-Size Text
status: completed
priority: P1
effort: 10m
dependencies: []
---

# Phase 2: Pack Cards Image Upsize + Equal-Size Text

## Overview

Three class updates in `MenuCard`: image card upsize (h-32→h-40, etc.), outer wrapper restructure to flex-col, text card adds flex-1 + recomputed -mt/pt for new image dimensions.

## Requirements

- Functional: 3 cards render with larger image + text cards visually identical in height/width/padding.
- Non-functional: Grid `auto-rows-fr` cooperates with flex-1 stretching.

## Architecture

**Current MenuCard:**
- Wrapper: `"group relative block h-full"`
- Image card: `h-32 w-32 md:h-36 md:w-36 lg:h-40 lg:w-40`
- Text card: `-mt-16 md:-mt-[72px] lg:-mt-20 ... pt-24 md:pt-28 lg:pt-32`

**Target MenuCard:**
- Wrapper: `"group relative flex h-full flex-col"`
- Image card: `h-40 w-40 md:h-44 md:w-44 lg:h-48 lg:w-48` (160/176/192 px)
- Text card: `flex flex-1 flex-col -mt-20 md:-mt-[88px] lg:-mt-24 ... pt-28 md:pt-32 lg:pt-36`

**Math (each breakpoint, gap = pt − image-half):**
- mobile: 160 image, -mt-20 (80), pt-28 (112) → text content starts 32px below image bottom ✓
- md: 176 image, -mt-[88px], pt-32 (128) → 40px gap ✓
- lg: 192 image, -mt-24 (96), pt-36 (144) → 48px gap ✓

**Equal heights:** outer wrapper `flex flex-col` + text card `flex flex-1 flex-col`. With `auto-rows-fr` on parent grid, all 3 outer wrappers match heights. Inside, image is fixed; text card `flex-1` fills remaining height, so all text cards render identical.

## Related Code Files

- Modify: `components/home/menu-cards.tsx`

## Implementation Steps

1. Inside `MenuCard`, locate three strings to update:

   a. Image card className:
   ```diff
   - "relative z-10 mx-auto h-32 w-32 overflow-hidden rounded-3xl shadow-cozy-md transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-cozy-lg md:h-36 md:w-36 lg:h-40 lg:w-40"
   + "relative z-10 mx-auto h-40 w-40 overflow-hidden rounded-3xl shadow-cozy-md transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-cozy-lg md:h-44 md:w-44 lg:h-48 lg:w-48"
   ```

   b. Text card className:
   ```diff
   - "relative -mt-16 rounded-3xl bg-surface px-6 pb-6 pt-24 shadow-cozy transition-shadow duration-300 group-hover:shadow-cozy-md md:-mt-[72px] md:px-7 md:pb-7 md:pt-28 lg:-mt-20 lg:pt-32"
   + "relative flex flex-1 flex-col -mt-20 rounded-3xl bg-surface px-6 pb-6 pt-28 shadow-cozy transition-shadow duration-300 group-hover:shadow-cozy-md md:-mt-[88px] md:px-7 md:pb-7 md:pt-32 lg:-mt-24 lg:pt-36"
   ```

   c. Outer wrapperClass variable:
   ```diff
   - const wrapperClass = "group relative block h-full";
   + const wrapperClass = "group relative flex h-full flex-col";
   ```

   Apply to BOTH the `<div role="link">` (coming-soon) and `<Link>` branches — both use `wrapperClass`.

2. Update `sizes` prop on image (slightly larger now, ~160-192 px):
   ```diff
   - sizes="(min-width:1024px) 160px, (min-width:640px) 144px, 128px"
   + sizes="(min-width:1024px) 192px, (min-width:640px) 176px, 160px"
   ```

## Success Criteria

- [x] Image cards visibly larger (h-40 mobile, h-48 lg).
- [x] All 3 text cards in row have identical width, height, padding.
- [x] Image overlap math correct — no image clipping or text-card content squished into image area.
- [x] Hover behavior unchanged (image translates + scales, text card shadow bumps).
- [x] No layout breaking at any breakpoint.

## Risk Assessment

- **Risk:** `flex-1` inside `flex-col` outer wrapper combined with `h-full` and grid `auto-rows-fr` — three layers of "fill remaining". Should work but verify in QA.
- **Risk:** Image at h-48 lg (192px) on a ~400px column = 48% of column. Stays smaller than text card.
- **Risk:** Existing icon `p-3` padding may feel tight in larger container — actually correct ratio scales: 12px in 160px = 7.5%; in 192px = 6.3%. Slightly more roomy at larger sizes. Should look fine.
- **Risk:** `sizes` prop change is a hint to browser only; not critical if mismatched.
