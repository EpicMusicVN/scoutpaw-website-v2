---
phase: 4
title: Pack Leader Single Line
status: completed
priority: P3
effort: 10m
dependencies: []
---

# Phase 4: Pack Leader Single Line

## Overview

"Say hi to Max" currently uses `<span class="block">Max</span>` which forces a line break. User wants single line. Drop the `block` class, add `whitespace-nowrap` at md+, drop font sizes one notch so it fits.

## Requirements

- Functional:
  - At md+ breakpoint, "Say hi to Max" renders on one line
  - At base (mobile), wrapping is allowed if needed (320–375px screens)
- Non-functional: typography still feels premium; "Max" still has gold accent color.

## Related Code Files

- Modify: `components/home/featured-pup-spotlight.tsx`

## Implementation Steps

1. In `featured-pup-spotlight.tsx`, find the h2 at ~line 38:
   ```tsx
   <h2 className="mt-3 font-display text-5xl font-bold leading-[0.95] text-ink md:text-7xl lg:text-[5.5rem]">
     Say hi to <span className="block text-brand-gold">Max</span>
   </h2>
   ```
2. Replace with:
   ```tsx
   <h2 className="mt-3 font-display text-4xl font-bold leading-[0.95] text-ink md:whitespace-nowrap md:text-6xl lg:text-7xl">
     Say hi to <span className="text-brand-gold">Max</span>
   </h2>
   ```
   Changes:
   - Remove `block` from the Max span → keeps inline
   - Add `md:whitespace-nowrap` → forces single line on md+
   - Drop font sizes: 5xl → 4xl, 7xl → 6xl, [5.5rem] → 7xl
3. Run `pnpm typecheck` + `pnpm lint`.
4. Visual smoke at 375px, 768px, 1280px, 1920px — confirm single line at md+, gold "Max" preserved, no clipping.

## Success Criteria

- [ ] "Say hi to Max" renders on one line at ≥768px
- [ ] Gold accent on "Max" preserved
- [ ] No horizontal scroll at any breakpoint
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Font drop reduces visual impact. **Mitigation:** still text-7xl on lg+ (5xl was previous mobile size; visual hierarchy preserved).
- **Risk:** At md (768px exactly), nowrap may overflow if container is narrow. **Mitigation:** container is `max-w-md` per scout; at 4xl font (~36px), "Say hi to Max" is ~360px — fits.
