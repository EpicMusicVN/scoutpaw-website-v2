---
phase: 3
title: Typecheck + Lint
status: completed
priority: P1
effort: 3m
dependencies:
  - 1
  - 2
---

# Phase 3: Typecheck + Lint

## Overview

Final validation gate. `pnpm typecheck` + `pnpm lint`. User performs visual QA on dev server at 360/768/1024/1440.

## Requirements

- `tsc --noEmit` exits 0
- `next lint` exits 0

## Architecture

No code changes — validation only.

## Related Code Files

- None modified

## Implementation Steps

1. `pnpm typecheck`
2. `pnpm lint`
3. Report results.
4. User-driven visual QA (not blocking).

## Success Criteria

- [x] `pnpm typecheck` exits 0.
- [x] `pnpm lint` exits 0.
- [x] Plan status: 3/3 phases done.

## Risk Assessment

- **Risk:** Arbitrary Tailwind value `md:-mt-[72px]` — works in Tailwind v3.4 JIT. Verify in lint output.
- **Risk:** `<Image fill sizes>` — Next/Image accepts arbitrary sizes strings, not strict.
