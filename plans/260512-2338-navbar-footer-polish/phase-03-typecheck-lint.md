---
phase: 3
title: Typecheck + Lint
status: completed
priority: P1
effort: 5m
dependencies:
  - 1
  - 2
---

# Phase 3: Typecheck + Lint

## Overview

Final validation gate. Run `pnpm typecheck` and `pnpm lint`. User performs visual QA on dev server.

## Requirements

- `tsc --noEmit` exits 0
- `next lint` exits 0 (no new ESLint warnings or errors)

## Architecture

No code changes in this phase — validation only.

## Related Code Files

- Read: dev server output / browser console (if user spot-checks)

## Implementation Steps

1. `pnpm typecheck` — verify no TS errors from added prop on Link, inline SVG, dropped `Button` consumer (Button still imported for Shop CTA).

2. `pnpm lint` — verify no ESLint warnings (e.g., `react/no-unknown-property`, `jsx-a11y/alt-text`).

3. Report results.

4. User-driven visual QA on dev server (not blocking this phase):
   - Navbar at 360 / 768 / 1024 / 1440
   - Footer at 360 / 768 / 1440
   - Mobile menu open at 360 (regression check)

## Success Criteria

- [x] `pnpm typecheck` exits 0.
- [x] `pnpm lint` exits 0.
- [x] Plan status: 3/3 phases done.

## Risk Assessment

- **Risk:** ESLint rule for `next/image` may flag the new aspect width/height as suspect.
  - **Mitigation:** Verify with rule output; props are valid Next/Image declarations.
- **Risk:** Removing `Button` reference for Newsletter doesn't matter since Shop CTA still uses Button. No unused-import error.
