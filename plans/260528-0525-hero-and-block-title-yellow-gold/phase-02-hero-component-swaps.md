---
phase: 2
title: Hero Component Swaps
status: completed
priority: P1
effort: 30m
dependencies:
  - 1
---

# Phase 2: Hero Component Swaps

## Overview

Swap kicker + h1 colors across all 5 hero components: kicker `text-brand-gold` → `text-ink-blue`; h1 `text-navy` → `heading-gradient-gold-light` (utility from Phase 1).

## Requirements

- Functional: 10 line edits across 5 files. All other classes on each line preserved.
- Non-functional: zero behavioral change beyond color tokens. Layout, animation, accessibility attrs untouched.

## Architecture

Each hero component already isolates kicker (small uppercase eyebrow) and h1 (main title) into separate elements with explicit Tailwind classes. Edits are surgical class-name substitutions. No prop signature changes — pages keep passing the same `kicker`/`title` strings.

## Related Code Files

| File | Line | Element | Class swap |
|---|---|---|---|
| `components/home/full-bleed-hero.tsx` | 28 | kicker `<p>` | `text-brand-gold` → `text-ink-blue` |
| `components/home/full-bleed-hero.tsx` | 31 | `<h1>` | `text-navy` → `heading-gradient-gold-light` |
| `components/home/cinematic-hero.tsx` | 89 | kicker `<p>` | `text-brand-gold` → `text-ink-blue` |
| `components/home/cinematic-hero.tsx` | 92 | `<h1>` | `text-navy` → `heading-gradient-gold-light` |
| `components/watch/watch-hero.tsx` | 113 | kicker `<p>` (literal "ScoutPaw TV") | `text-brand-gold` → `text-ink-blue` |
| `components/watch/watch-hero.tsx` | 116 | `<h1>` | `text-navy` → `heading-gradient-gold-light` |
| `components/coming-soon/coming-soon-hero.tsx` | 24 | kicker `<p>` | `text-brand-gold` → `text-ink-blue` |
| `components/coming-soon/coming-soon-hero.tsx` | 27 | `<h1>` | `text-navy` → `heading-gradient-gold-light` |
| `components/characters/character-detail-hero.tsx` | 39 | breed kicker `<p>` | `text-ink-blue/65` → `text-ink-blue` |
| `components/characters/character-detail-hero.tsx` | 42 | `<h1>` | `text-navy` → `heading-gradient-gold-light` |

## Implementation Steps

1. For each row in the table above, open file, jump to line, perform the exact class substitution. Use the `Edit` tool with full-line `old_string` for safety (avoid partial-match collisions).
2. Preserve all other classes on the line (font-display, sizing, leading, responsive variants, ordering).
3. For `character-detail-hero.tsx:39`, drop the `/65` opacity modifier — pairing deep navy at full opacity with the new gold h1 is the agreed treatment (keeps kicker readable on per-character themed gradients).
4. After all 10 edits, run `pnpm tsc --noEmit` to confirm no type regressions (none expected — class string changes only).
5. Run `pnpm lint` to confirm no style/format violations.

## Success Criteria

- [ ] All 10 line edits applied
- [ ] No file has `text-brand-gold` on a hero kicker line anymore
- [ ] No file has `text-navy` on a hero h1 line anymore
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] Grep verification: `Grep "heading-gradient-gold-light" components/` returns ≥5 matches in hero files

## Risk Assessment

- **Risk:** Hero h1s on `character-detail-hero` sit on per-character themed gradients (pastel pinks/blues/greens). Gold gradient may clash on some themes. **Mitigation:** verify in Phase 5 via spot-check; if clash observed, add per-theme inline `style={{ color: theme.titleColor }}` override (defer until observed).
- **Risk:** `watch-hero.tsx:113` kicker is a hardcoded literal `"ScoutPaw TV"` not driven by a prop. Color rule still applies. **Mitigation:** none needed — out of scope to make configurable.
- **Risk:** Existing `text-shadow-soft` usages may need to combine with new gradient. **Mitigation:** none in hero files today carry text-shadow; only add if Phase 5 verification surfaces a legibility lift need.
