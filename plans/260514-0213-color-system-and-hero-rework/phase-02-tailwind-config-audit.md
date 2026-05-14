---
phase: 2
title: Tailwind Config Audit
status: completed
priority: P3
effort: 15m
dependencies:
  - 1
---

# Phase 2: Tailwind Config Audit

## Overview

Verify `tailwind.config.ts` color tokens still resolve correctly after the variable swap. Most should be automatic (variable-driven via `withOpacity`), but the `honey` token and any direct `brand-honey` references need to be assessed for removal.

## Requirements

- Functional: confirm `bg-paper`, `bg-navy`, `bg-brand-primary`, `text-ink` all resolve to new values without code changes.
- Non-functional: no broken Tailwind class generation; no runtime errors.

## Architecture

`tailwind.config.ts` lines 20–52 extend `theme.colors` using a `withOpacity(varName)` helper. Each color points to a `--*-rgb` variable. As long as the variable exists, the token works. Dropped variables = dropped tokens.

## Related Code Files

- Modify (potentially): `tailwind.config.ts` (remove `honey` and `brand.honey` token entries IF Phase 1 commented out the variables)

## Implementation Steps

1. Open `tailwind.config.ts`.
2. Locate the `theme.extend.colors` block (lines 20–52).
3. For each color token, verify the referenced CSS variable still exists in `globals.css`:
   - `paper` → `--bg-base-rgb` ✓
   - `ink` → `--ink-rgb` ✓
   - `brand.primary` → `--brand-primary-rgb` ✓
   - `brand.honey` → `--brand-honey-rgb` (DROPPED in P1)
   - `honey` (top-level) → check existence
4. Comment out `honey` and `brand.honey` entries to match P1.
5. Search `colors.brand` for any other token whose variable was dropped.
6. Run `pnpm typecheck` + `pnpm lint` + `pnpm build` (build catches missing Tailwind classes).

## Success Criteria

- [ ] No `tailwind.config.ts` entry references a non-existent CSS variable
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] `pnpm build` succeeds (no missing-class warnings)

## Risk Assessment

- **Risk:** Tailwind silently generates an undefined class (no error, just no style). **Mitigation:** Grep `bg-honey`, `text-brand-honey` across `app/`, `components/` — count of zero confirms safe removal.
