---
phase: 4
title: Typecheck + Lint
status: completed
priority: P1
effort: 3m
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Typecheck + Lint

## Overview

Final validation gate. `pnpm typecheck` + `pnpm lint`. User performs visual QA on dev server.

## Requirements

- `tsc --noEmit` exits 0
- `next lint` exits 0

## Architecture

No code changes — validation only.

## Related Code Files

- None modified

## Implementation Steps

1. `pnpm typecheck` — verify new SVG components compile cleanly; no type errors on existing files.
2. `pnpm lint` — watch for:
   - Arbitrary Tailwind values (`-mt-[88px]`, `opacity-[0.10]`, `top-[8%]`, etc.) — JIT-supported in v3.4
   - SVG attributes (`stroke="currentColor"`, `viewBox`, `aria-hidden="true"`) — valid in JSX
   - No unused imports
3. Report results.
4. User visual QA at 360 / 768 / 1024 / 1440 viewports.

## Success Criteria

- [x] `pnpm typecheck` exits 0.
- [x] `pnpm lint` exits 0.
- [x] Plan status: 4/4 phases done.

## Risk Assessment

- **Risk:** Arbitrary Tailwind values not picked up by JIT compiler — should be fine in v3.4 but verify in lint output.
