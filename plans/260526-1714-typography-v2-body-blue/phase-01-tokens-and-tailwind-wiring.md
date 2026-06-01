---
phase: 1
title: Tokens and Tailwind Wiring
status: completed
priority: P1
effort: 20m
dependencies: []
---

# Phase 1: Tokens and Tailwind Wiring

## Overview

Add `--ink-blue` CSS token in `app/globals.css` (hex + rgb triplet for opacity). Register `ink-blue` in Tailwind color tokens via `withOpacity`. No component changes yet.

## Requirements

**Functional:**
- `--ink-blue: #1a3a5c` and `--ink-blue-rgb: 26 58 92` added to `:root` block
- Tailwind `colors.ink-blue` resolves to `rgb(var(--ink-blue-rgb) / <alpha-value>)`
- `text-ink-blue`, `text-ink-blue/70`, `bg-ink-blue`, `border-ink-blue` utilities work

**Non-functional:**
- No regression to existing tokens
- AA contrast verified: ~9:1 on white, ~6:1 on cyan, ~6:1 on warm-tan, ~7.5:1 on yellow

## Architecture

Two-form token storage (matching existing pattern):
- `--ink-blue: #1a3a5c` — for inline `style={{ color: "var(--ink-blue)" }}` use
- `--ink-blue-rgb: 26 58 92` — for Tailwind opacity utilities via `rgb(var(--…-rgb) / <alpha-value>)`

## Related Code Files

- **Modify:** `app/globals.css` — add tokens to `:root`
- **Modify:** `tailwind.config.ts` — add `ink-blue` to `colors` object

## Implementation Steps

1. **Open** `app/globals.css`. Locate the `:root` block (lines ~13–73).
2. **Add** alongside the other text contrast tokens (`--text-on-warm`, `--text-on-warm-muted`):
   ```css
   /* Primary body text — deep navy, AA-safe on white/cyan/warm/yellow surfaces. */
   --ink-blue: #1a3a5c;
   --ink-blue-rgb: 26 58 92;
   ```
3. **Open** `tailwind.config.ts`. Locate `colors` object (lines ~20–50).
4. **Add** to the colors block alongside `ink`:
   ```ts
   ink: withOpacity("--ink-rgb"),
   "ink-blue": withOpacity("--ink-blue-rgb"),
   ```
5. **Save** both files.
6. **Typecheck:** `pnpm typecheck`. Must pass.
7. **Smoke test:** add a temporary `<p className="text-ink-blue">test</p>` in any page, view in browser, confirm deep navy renders. Remove after.

## Success Criteria

- [ ] `--ink-blue` and `--ink-blue-rgb` present in `:root`
- [ ] `ink-blue` registered in Tailwind colors
- [ ] `text-ink-blue/70` opacity variant works (uses `rgb(var(--…-rgb) / 0.7)`)
- [ ] Typecheck clean
- [ ] Smoke test renders correctly in browser

## Risk Assessment

- **Risk:** Tailwind 3.4 opacity utility breaks without the `-rgb` form. *Mitigation:* the `withOpacity` helper used elsewhere in the config handles this — same pattern.
- **Risk:** `--ink-blue` confusable with `--bg-navy` in code review. *Mitigation:* comments in `globals.css` distinguish purposes (body text vs surface/footer bg).

## Security Considerations

None.
