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

Final validation gate. `pnpm typecheck` + `pnpm lint`. User performs visual QA on dev server (scroll the hero to feel the motion).

## Requirements

- `tsc --noEmit` exits 0
- `next lint` exits 0

## Architecture

No code changes — validation only.

## Related Code Files

- None modified

## Implementation Steps

1. `pnpm typecheck` — verify ScrollSun imports + Framer Motion types resolve cleanly.
2. `pnpm lint` — watch for:
   - Arbitrary Tailwind values (`[filter:...]`, `right-[12%]`, `top-[14%]`) — JIT-supported
   - SVG attribute camelCase (`strokeWidth`, `strokeLinecap`) — JSX requires camelCase
   - `"use client"` placement
3. Report results.
4. User visual QA on dev server (scroll through hero to verify motion).

## Success Criteria

- [x] `pnpm typecheck` exits 0.
- [x] `pnpm lint` exits 0.
- [x] Plan status: 3/3 phases done.

## Risk Assessment

- **Risk:** Framer Motion type changes between v11/12 — codebase uses v12.38 (per pnpm-lock from earlier session). `useScroll`/`useTransform` signatures stable in v12. Verified.
