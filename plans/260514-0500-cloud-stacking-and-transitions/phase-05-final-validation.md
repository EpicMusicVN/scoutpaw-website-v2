---
phase: 5
title: Final Validation
status: completed
priority: P3
effort: 5m
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Final Validation

## Overview

Full project validation: typecheck, lint, build. Grep audit for any stragglers.

## Requirements

- `pnpm typecheck` clean
- `pnpm lint` clean
- `pnpm build` succeeds
- No remaining `CloudDivider` references with old `position` prop

## Implementation Steps

1. Run `pnpm typecheck`.
2. Run `pnpm lint`.
3. Run `pnpm build`.
4. Grep for any remaining old API usage:
   ```
   position="top"|position="bottom"
   ```
   (Filter to `CloudDivider` calls only.)
5. If `app/page.tsx` is the only file with new `<CloudDivider />` calls, verify no other home/shop/watch page reuses it incorrectly.

## Success Criteria

- [ ] All checks clean
- [ ] No orphan `position` prop on CloudDivider
- [ ] No old-API CloudDivider references in code

## Risk Assessment

- None. Verification-only phase.
