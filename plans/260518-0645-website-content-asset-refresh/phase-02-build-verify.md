---
phase: 2
title: Build Verify
status: completed
priority: P2
effort: 15m
dependencies:
  - 1
---

# Phase 2: Build Verify

## Overview

Gate Phase 1 with local typecheck + lint + production build before deploying. Cheap, catches the typical fallout from dropping struct fields and changing JSON keys.

## Requirements

- TypeScript compiles with zero errors.
- ESLint passes (existing rule set; no new warnings introduced).
- `pnpm build` produces a green production build.

## Implementation Steps

1. **Typecheck**: `pnpm tsc --noEmit`
   - Watch for errors in `menu-cards.tsx` if any callsite still expects `bg`/`accentGlow` on `Card`.
2. **Lint**: `pnpm lint`
3. **Grep for stragglers**:
   - `grep -rn "promotion.png" app components` — should return nothing (or only commented refs).
   - `grep -rn "accentGlow\|card\.bg" components/home/menu-cards.tsx` — should return nothing.
4. **Build**: `pnpm build`
   - Confirm next/image picks up new asset paths; no 404s in build log.

## Success Criteria

- [x] `pnpm tsc --noEmit` exits 0
- [x] `pnpm lint` exits 0
- [x] No leftover `promotion.png` references in `app/` or `components/`
- [x] `pnpm build` succeeds, no build-time image errors
- [x] Mental sanity check: rendered output of MenuCards, FeaturedPupSpotlight, ExploreProducts visually matches plan intent (run `pnpm dev` + browser check; documented in Phase 4 too)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Stale next.js build cache hides typescript regression | If suspicious, `rm -rf .next` then rebuild. |
| Lint complains about unused imports after deletes | Remove imports surfaced by lint pass — should only affect `assetUrl` if paw-tile pattern removal frees it (unlikely; menu-cards still uses assetUrl for card images). |
