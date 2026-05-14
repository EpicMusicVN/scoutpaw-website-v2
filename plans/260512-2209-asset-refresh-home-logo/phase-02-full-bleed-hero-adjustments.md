---
phase: 2
title: Full-Bleed Hero Adjustments
status: completed
priority: P1
effort: 30m
dependencies:
  - 1
---

# Phase 2: Full-Bleed Hero Adjustments

## Overview

Adjust `components/home/full-bleed-hero.tsx` for the new banner composition: keep dogs centered, push text into upper-left sky zone, tighten gradient mask so it ends before the leftmost dog, and narrow the text panel to prevent overlap.

## Requirements

- Functional: At 1440/1024/768/360 widths, all 5 dogs visible; brown box partially visible at right; text never overlaps any dog.
- Non-functional: No LCP regression (banner remains `priority` with `sizes="100vw"`). SSR/first-paint stable (no hydration flash).

## Architecture

**Current state:**
- `objectPosition: "50% 60%"` (image pushed down 10%)
- Text panel center-aligned (`items-center`)
- Max-w ladder: `max-w-md md:max-w-lg lg:max-w-xl`
- Gradient: `(0.92 0%, 0.55 30%, 0 55%)`
- Headline: `text-5xl md:text-6xl lg:text-7xl xl:text-[5rem]`

**Target state:**
- `objectPosition: "50% 50%"` (true center; new banner dogs are centered)
- Text panel upper-third (`items-start pt-[12svh]`)
- Max-w ladder: `max-w-md md:max-w-md lg:max-w-lg` (narrower on lg)
- Gradient: `(0.94 0%, 0.5 24%, 0 42%)` (ends before leftmost dog at ~28%)
- Headline: `text-5xl md:text-6xl lg:text-6xl xl:text-7xl` (de-escalated to fit narrower panel)

Mobile (<768px): honey card backdrop on top of banner stays. No gradient mask. Container `pt` ignored on mobile (single column).

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. Update `objectPosition` on `<Image>`:
   ```tsx
   style={{ objectPosition: "50% 50%" }}
   ```

2. Update gradient mask `<div>` background:
   ```tsx
   background:
     "linear-gradient(90deg, rgba(255,241,201,0.94) 0%, rgba(255,241,201,0.5) 24%, rgba(255,241,201,0) 42%)",
   ```

3. Update container alignment:
   ```tsx
   // BEFORE: items-center px-4 py-10 md:px-12 md:py-0 lg:px-20
   // AFTER:  items-start px-4 py-10 md:px-12 md:py-0 lg:px-20 md:pt-[12svh] lg:pt-[14svh]
   className="relative z-10 mx-auto flex min-h-[100svh] max-w-hero items-start px-4 py-10 md:px-12 md:py-0 md:pt-[12svh] lg:px-20 lg:pt-[14svh]"
   ```

4. Update text panel max-w ladder:
   ```tsx
   // BEFORE: max-w-md ... md:max-w-lg ... lg:max-w-xl
   // AFTER:  max-w-md ... md:max-w-md ... lg:max-w-lg
   className="max-w-md rounded-3xl bg-honey/90 p-6 shadow-cozy md:max-w-md md:bg-transparent md:p-0 md:shadow-none lg:max-w-lg"
   ```

5. Update headline scale:
   ```tsx
   className="mt-3 font-display text-5xl font-bold leading-[0.98] text-ink md:text-6xl lg:text-6xl xl:text-7xl"
   ```

6. Run `pnpm typecheck` to verify no TS errors.

## Success Criteria

- [x] At 1440×900: all 5 dogs visible (corgi left, golden + bone center, border collie right, samoyed + husky upside-down top); brown box partially visible at right; text panel in upper-left sky zone with clear gap to corgi.
- [x] At 1024×768: same layout, slightly tighter spacing.
- [x] At 768×1024: text panel does not visually touch any dog.
- [x] At 360×800: honey card on top of banner; banner object-cover fills viewport; dogs still readable.
- [x] Type check passes.
- [x] No console hydration warnings.

## Risk Assessment

- **Risk:** Tablet portrait (768px) — text panel bottom reaches corgi head.
  - **Mitigation:** Drop `md:pt-[12svh]` to `md:pt-[8svh]` if QA shows overlap.
- **Risk:** Headline scale change shrinks visual weight on desktop.
  - **Mitigation:** Acceptable trade — narrower panel can't accommodate `text-7xl/[5rem]` without forced wraps.
