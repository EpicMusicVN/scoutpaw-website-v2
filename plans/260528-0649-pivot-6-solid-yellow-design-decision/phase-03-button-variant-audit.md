---
phase: 3
title: Button Variant Audit
status: completed
priority: P2
effort: 30m
dependencies:
  - 1
  - 2
---

# Phase 3: Button Variant Audit

## Overview

Audit `components/ui/button.tsx` variants against the new dark navy hero + banner surfaces. Resolve any variant that breaks visual contract on dark (most likely `variant="outline"` with dark border, `variant="dark"` with navy bg).

## Requirements

- Functional: All button instances inside hero + banner sections render with sufficient contrast and visual hierarchy on `bg-ink-blue`.
- Non-functional: Minimal surface area of change — extend existing variants rather than adding new ones if possible (KISS).

## Architecture

`button.tsx` currently exposes variants:
- `primary` — yellow `bg-brand-primary` + `text-ink-blue` (high contrast everywhere)
- `dark` — `bg-navy` + `text-white` (white on mid blue)
- `outline` — light bg + dark border + dark text (designed for light surfaces)
- (others if any — confirmed during audit)

On `bg-ink-blue` (`#1a3a5c`):
- `primary` (yellow) — vivid CTA, ~9:1, ✅ works
- `dark` (navy `#397fc5` bg) — mid-blue on dark-blue, low contrast surfaces but text-white reads. ⚠️ borderline; secondary CTA quality drops
- `outline` (light border + dark text) — light border on dark looks like outline ribbon; dark text is invisible. ❌ breaks

Solution options:
1. Add `dark-surface` variant: transparent bg + light border + light text. Designed for dark surfaces specifically.
2. Modify outline variant to be context-aware via CSS (`.bg-ink-blue button[variant=outline]` overrides) — adds DOM coupling, bad.
3. Replace per-instance `variant="outline"` inside heroes with the new `dark-surface` variant.

Recommended: option 1 + 3. New variant + per-instance swap. Minimal changes elsewhere.

## Related Code Files

- Modify: `components/ui/button.tsx` (add `dark-surface` variant)
- Modify (conditionally): per-instance variant swaps inside hero + banner files identified during audit
  - `components/watch/watch-hero.tsx` line 129 — `variant="outline"` "Watch on YouTube" → likely needs swap
  - Others surfaced during audit

## Implementation Steps

1. Open `components/ui/button.tsx`. Inventory all existing variants.
2. Grep for button instances inside the 19 hero + banner components (`Grep "Button" components/home components/watch components/shop components/top-picks components/characters`).
3. Classify each found button instance:
   - Inside hero + banner section AND variant breaks on dark → flag
   - Inside hero + banner section AND variant works on dark (`primary`, possibly `dark`) → no action
   - Outside hero + banner (cards, footer, nav) → no action (light surfaces unchanged)
4. Add new `dark-surface` variant to `button.tsx`:
   - Classes: `border border-white/40 bg-transparent text-white hover:bg-white/10 hover:border-white/60`
   - Size/spacing identical to existing `outline` variant
5. Swap flagged button instances from `variant="outline"` to `variant="dark-surface"`.
6. Optional: Re-evaluate `variant="dark"` instances inside heroes. If `bg-navy` on `bg-ink-blue` blends too much, swap to `dark-surface` or `primary`.
7. Run `pnpm tsc --noEmit` + `pnpm lint`.

## Success Criteria

- [ ] `button.tsx` has a `dark-surface` variant
- [ ] All `outline` buttons inside hero + banner sections are swapped to `dark-surface`
- [ ] Existing `outline` button instances OUTSIDE flipped sections (cards, footer, etc.) — UNCHANGED
- [ ] No regression on `primary` or `dark` variants
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes

## Risk Assessment

- **Risk:** Audit misses a button instance, leaving an unreadable outline button in production. **Mitigation:** Grep is exhaustive; verify count of swapped instances matches the audit list.
- **Risk:** `dark-surface` variant border looks too thin on dark bg. **Mitigation:** start with `border-white/40` (acceptable contrast); adjust during Phase 5 render verification if needed.
- **Risk:** Adding a new variant grows `button.tsx` Tailwind class composition; may push file over the 200-line cap from development-rules.md. **Mitigation:** check file size before/after; if needed, extract variant defs to a separate module.
- **Risk:** `variant="dark"` in hero CTAs (`watch-hero` "Join ScoutPaw World!") may blend on bg-ink-blue. **Mitigation:** spot-check Phase 5; consider swap to `primary` for primary CTA emphasis.
