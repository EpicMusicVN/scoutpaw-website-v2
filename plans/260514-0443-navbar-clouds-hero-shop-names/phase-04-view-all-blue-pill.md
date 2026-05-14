---
phase: 4
title: View All Blue Pill
status: completed
priority: P3
effort: 5m
dependencies: []
---

# Phase 4: View All Blue Pill

## Overview

Switch View All button from outline-with-arrow to solid blue pill (no arrow). Uses brand-secondary navy `#397fc5` bg + white text.

## Related Code Files

- Modify: `components/home/menu-cards.tsx`

## Implementation Steps

1. Find the existing View All span:
   ```tsx
   <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/20 bg-transparent px-4 py-1.5 font-display text-sm font-semibold text-ink shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-ink/40 group-hover:shadow-md md:text-base">
     View All
     <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
       →
     </span>
   </span>
   ```
2. Replace with blue pill:
   ```tsx
   <span className="mt-auto inline-flex w-fit items-center rounded-full bg-navy px-5 py-2 font-display text-sm font-semibold text-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md md:text-base">
     View All
   </span>
   ```
3. Changes:
   - `border border-ink/20 bg-transparent text-ink` → `bg-navy text-white`
   - Padding bumped to `px-5 py-2`
   - Arrow span + gap removed
4. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] View All renders as solid blue pill (no border, no arrow)
- [ ] White text on navy blue
- [ ] Card hover still lifts the pill
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** `bg-navy` token may not be wired correctly post-palette swap. **Mitigation:** verified in prior cooks — `bg-navy` resolves to `--bg-navy` (#397fc5). White on navy = ~6:1 contrast (good).
