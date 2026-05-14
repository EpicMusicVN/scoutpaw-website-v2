---
phase: 1
title: CSS Variables
status: completed
priority: P1
effort: 30m
dependencies: []
---

# Phase 1: CSS Variables

## Overview

Swap the foundational CSS custom properties in `app/globals.css`. Because nearly every component pulls color via Tailwind tokens wired to these variables, this single edit propagates the new palette across the site automatically.

## Requirements

- Functional: replace primary, base, and navy variables with new hex values; drop honey variables; retint the shimmer overlay and nav-underline references.
- Non-functional: no regressions in typecheck/lint; no console errors; visual flip on home page reload.

## Architecture

CSS variables defined at `:root` (lines 13–83 of `app/globals.css`). Tailwind's `withOpacity()` helper in `tailwind.config.ts` reads these via `var(--token-rgb)`. Mutating the variables = global recolor with zero per-component edits.

## Related Code Files

- Modify: `app/globals.css` (`:root` palette block, `.cta-shimmer` overlay, `.nav-underline` background)

## Implementation Steps

1. In `app/globals.css` `:root` block, update:
   - `--brand-primary: #ffd70c`
   - `--brand-primary-rgb: 255 215 12`
   - `--bg-base: #c6e7e9`
   - `--bg-base-rgb: 198 231 233`
   - `--bg-navy: #397fc5`
   - `--bg-navy-rgb: 57 127 197`
2. Comment out (don't delete yet — P7 finalizes removal):
   - `--brand-honey`, `--brand-honey-rgb`
   - `--bg-honey`, `--bg-honey-rgb` (verify usage before commenting)
3. Update `.cta-shimmer` overlay rgba at line ~171: `rgba(255, 245, 214, 0.55)` → `rgba(255, 240, 180, 0.55)` (light-yellow tint).
4. Update `.nav-underline` at line ~152: `background: var(--brand-honey)` → `background: var(--brand-primary)`.
5. Run `pnpm typecheck` + `pnpm lint`.
6. Visual smoke: load `/`, verify cyan page bg, yellow CTAs, blue footer.

## Success Criteria

- [ ] All four variables updated
- [ ] Shimmer overlay retinted
- [ ] Nav underline references new yellow
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] Home page reload shows cyan bg + yellow buttons

## Risk Assessment

- **Risk:** removing `--brand-honey` before P7 breaks components still referencing it. **Mitigation:** comment out instead of delete; P7 removes after grep audit.
- **Risk:** `--bg-honey` may be in active use. **Mitigation:** Grep usage first; if zero references, comment; if referenced, leave for P7.
