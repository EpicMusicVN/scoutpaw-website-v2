---
phase: 2
title: Typecheck + Lint
status: completed
priority: P1
effort: 3m
dependencies:
  - 1
---

# Phase 2: Typecheck + Lint

## Overview

Validation gate. Run `pnpm typecheck` and `pnpm lint`. User performs visual QA on dev server at 768/1024/1440.

## Requirements

- `tsc --noEmit` exits 0
- `next lint` exits 0 (no warnings)

## Architecture

No code changes in this phase — validation only.

## Related Code Files

- None modified

## Implementation Steps

1. `pnpm typecheck` — verify Button prop types accept `variant="dark" size="lg"` + SVG children.
2. `pnpm lint` — verify SVG camelCase props, accessible-name on Button derived from "Newsletter" text + aria-hidden on SVG.
3. Report results.
4. User-driven visual QA at 768 / 1024 / 1440 viewports (not blocking).

## Success Criteria

- [x] `pnpm typecheck` exits 0.
- [x] `pnpm lint` exits 0.
- [x] Plan status: 2/2 phases done.

## Risk Assessment

- **Risk:** ESLint warns about SVG attribute conflicts (it shouldn't — proven by prior session).
  - **Mitigation:** Verify with rule output; props are valid.
