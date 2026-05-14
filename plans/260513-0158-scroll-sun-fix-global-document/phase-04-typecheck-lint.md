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

Final validation gate. `pnpm typecheck` + `pnpm lint`. User performs visual QA on dev server (scroll the home page end-to-end).

## Requirements

- `tsc --noEmit` exits 0
- `next lint` exits 0

## Architecture

No code changes — validation only.

## Related Code Files

- None modified

## Implementation Steps

1. `pnpm typecheck` — verify ScrollSun rewrite + page.tsx import resolve cleanly.
2. `pnpm lint` — watch for:
   - Arbitrary Tailwind value `z-[5]` — JIT-supported
   - Unused `useRef` import (removed) — should not exist
3. Report results.
4. User visual QA — scroll home page end-to-end; sun should travel down + drift across screen + fade near footer.

## Success Criteria

- [x] `pnpm typecheck` exits 0.
- [x] `pnpm lint` exits 0.
- [x] Plan status: 4/4 phases done.

## Risk Assessment

- **Risk:** ESLint may flag if any prop drilling was unintentional — none expected.
