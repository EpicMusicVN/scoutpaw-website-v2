---
phase: 4
title: Atmosphere and Theme Decisions
status: completed
priority: P1
effort: 45m
dependencies:
  - 1
  - 2
---

# Phase 4: Atmosphere and Theme Decisions

## Overview

Resolve the two deferred decisions from Phases 1+2: per-character themed hero/section (`character-detail-hero`, `character-section`), and atmospheric decoratives (paw-print pattern, cloud-divider, dust particles, character poses) that were designed for light surfaces.

## Requirements

- Functional: Two policy decisions locked + applied. Atmosphere decoratives readable on navy where they appear inside flipped sections.
- Non-functional: Per-pup color identity preserved where possible. YAGNI on atmosphere fixes — touch only what visibly breaks.

## Architecture

**Decision 1: Per-character themed heroes/sections.** `character-detail-hero.tsx` uses `theme.heroGradient` (pastel gradient unique per pup). `character-section.tsx` uses `theme.surfaceTint`. Two paths:
- **(A) Keep themes as exception** — Per-pup colored heroes remain. Document as "themed surfaces override site-wide dark-section rule." Yellow titles on pastel backgrounds need per-theme verification (some themes may be too light for solid yellow).
- **(B) Override themes with navy** — Site-wide consistency. Lose per-pup identity. Simpler rule.

Recommendation: **(A) Keep themes.** Per-pup identity is a deliberate brand element built across many plans. Compromise: keep theme bg, but make h1 a solid color that contrasts (e.g., `text-ink-blue` if theme is too light for yellow). Per-theme override applied via inline `style` or `theme.titleColor` field.

**Decision 2: Atmosphere decoratives audit.**
- `components/ui/paw-print-pattern.tsx` — likely uses dark-ink stamps on light bg. On navy, dark stamps invisible. Needs light variant.
- `components/ui/cloud-divider.tsx` — separator between sections. Currently designed to transition between light surfaces. Light cloud SVG between dark sections will look like a bright slash.
- Character poses (PNG cutouts in heroes/sections) — should be fine; silhouettes work on any bg.
- Newsletter/subscribe character pose decorations — verify.
- Dust particles + drift animations (in globals.css `dust-float`, `paw-drift`, `cloud-drift`) — visual elements, may need color/opacity adjustment.

## Related Code Files

- Modify: `components/characters/character-detail-hero.tsx` — apply Phase 4 conditional logic
- Modify: `components/characters/character-section.tsx` — apply Phase 4 conditional logic
- Read + decide: `components/ui/paw-print-pattern.tsx`, `components/ui/cloud-divider.tsx`
- Read + decide: `lib/content/character-themes.ts` (or similar — character theme definitions)
- Conditionally modify: atmosphere components only if observably broken

## Implementation Steps

### Decision 1 — Per-character themes (KEEP as exception)

1. Read `lib/content/character-themes.ts` (or the file defining character themes). Inventory each character's `heroGradient` + `surfaceTint`.
2. For each character, estimate contrast of `#ffd70c` (solid yellow) on the brightest stop of their theme gradient:
   - If contrast ≥3:1 → use `text-brand-primary` h1 (consistent with site rule)
   - If contrast <3:1 → fall back to `text-ink-blue` h1 for that character (per-theme override)
3. In `character-detail-hero.tsx`:
   - Section bg: KEEP `theme.heroGradient` (don't override with navy)
   - Kicker (breed) line 39: `text-ink-blue` — confirm OK on each theme. Likely stays.
   - H1 line 42: REMOVE Phase-1 TODO. Apply conditional: if theme.heroGradient is bright pastel → `text-ink-blue`; if theme.heroGradient is darker → `text-brand-primary`. Simplest: add `theme.titleColor` field per character, default to `ink-blue` if absent.
   - Body line 46: `text-ink-blue/70` — stays (themes are light, blue body reads)
4. In `character-section.tsx`:
   - Section bg: KEEP `theme.surfaceTint`
   - Kicker line ~140: same per-theme logic
   - H2 line 144: same per-theme logic — most likely `text-ink-blue` if surfaceTint is light pastel
5. Document the exception in code-standards.md (Phase 6).

### Decision 2 — Atmosphere decoratives audit

1. Read `components/ui/paw-print-pattern.tsx`. Inventory how it's used: which sections embed it, what color the stamps are.
2. If paw-prints appear inside flipped hero/banner sections:
   - Add a `tone="dark"` (or similar) prop that switches stamps from dark-ink to light-yellow `text-brand-primary/30`
   - Update consumers inside hero/banner to pass `tone="dark"`
3. Read `components/ui/cloud-divider.tsx`. Inventory placement.
4. If cloud-divider sits between flipped dark sections:
   - Either adjust gradient stops to fade from navy → navy (invisible) OR
   - Skip the divider between dark sections (consumer decision per placement)
5. Spot-check character poses + dust particles during Phase 5 render. Fix only observed regressions (YAGNI).

## Success Criteria

- [ ] `character-themes.ts` (or equivalent) has `titleColor` decision per character (yellow vs ink-blue)
- [ ] `character-detail-hero.tsx` h1 uses theme-aware color
- [ ] `character-section.tsx` h2 uses theme-aware color
- [ ] `paw-print-pattern.tsx` has a tone prop OR continues to work unchanged
- [ ] `cloud-divider.tsx` audited and either adjusted or noted as acceptable
- [ ] Atmosphere decoratives readable wherever they appear
- [ ] `pnpm tsc --noEmit` + `pnpm lint` clean

## Risk Assessment

- **Risk:** Per-character `titleColor` decisions are subjective and may need user input. **Mitigation:** Phase 4 produces a default (yellow if bright theme, blue if dark theme); Phase 5 render gives user a chance to override per-pup if visually wrong.
- **Risk:** Adding a `tone` prop to `paw-print-pattern.tsx` ripples to all consumers. **Mitigation:** default prop value preserves current behavior; only flipped sections opt into `tone="dark"`.
- **Risk:** `cloud-divider.tsx` placement crosses dark/light section boundaries — a divider between a dark section above and light section below needs asymmetric gradient. **Mitigation:** identify each placement; if 1-2 placements only, fix in-line. If >3, refactor to take section-bg-aware props.
- **Risk:** Atmosphere fixes balloon scope. **Mitigation:** strictly enforce YAGNI — fix only what's visually broken during render verification. Pre-emptive theme work is not in scope.
- **Risk:** User explicitly does NOT want themes preserved and wants site-wide navy. **Mitigation:** Phase 4 starts with confirming Decision 1 path via render screenshots. If user wants override, swap to path (B) before atmosphere work.
