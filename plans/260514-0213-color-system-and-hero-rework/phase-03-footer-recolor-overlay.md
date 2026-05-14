---
phase: 3
title: Footer Recolor & Overlay
status: completed
priority: P2
effort: 1h
dependencies:
  - 1
  - 2
---

# Phase 3: Footer Recolor & Overlay

## Overview

After P1, the footer `bg-navy` token automatically resolves to the new `#397fc5` (mid blue). But the lighter blue drops white-text contrast to ~4.5:1 (borderline AA). This phase adds a darker gradient overlay to lift contrast above 7:1, re-targets `brand-honey` text/border references, and recolors the hardcoded SVG fills in the GrassStrip decoration.

## Requirements

- Functional:
  - White body text + headings achieve ≥7:1 contrast against effective footer bg
  - GrassStrip SVG fills harmonize with the new palette
  - No remaining `brand-honey` references in the footer
- Non-functional: typecheck/lint clean; no visible jank on hover states.

## Architecture

`components/nav/footer.tsx` renders the footer wrapper plus a child `GrassStrip` component with inline SVG fills. The overlay technique: add a child `div` inside the footer wrapper with `absolute inset-0 bg-gradient-to-b from-transparent to-black/18 pointer-events-none`. This darkens the lower half without changing the requested base color.

## Related Code Files

- Modify: `components/nav/footer.tsx`

## Implementation Steps

1. Inside the footer wrapper (currently `bg-navy ...`), prepend a child overlay div:
   ```tsx
   <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
   ```
   Ensure the wrapper is `relative` (or add it).
2. Swap `text-brand-honey` (section headings) → `text-[#fffbe6]` (warm cream) or `text-white`.
3. Swap `border-brand-honey` (social icon hovers) → `border-[#ffd70c]` (new yellow accent).
4. Update GrassStrip SVG hardcoded fills:
   - `#fff1c9` (honey-cream blob) → `#e8f6f7` (light cyan)
   - `#e8b547` (gold blob) → `#ffd70c` (new yellow)
   - `#ff7a85` (coral) → keep (decorative warm accent)
   - `#7bc47f` (grass green) → keep (organic, neutral)
   - `#5fa663` (grass stroke) → keep
5. Verify text content uses `text-white` or `text-white/90` (current).
6. Run `pnpm typecheck` + `pnpm lint`.
7. Visual smoke: load any page with footer, confirm legibility + grass-strip harmony.

## Success Criteria

- [ ] Footer overlay div added; effective bg darkens toward bottom
- [ ] All `brand-honey` references in `footer.tsx` re-targeted
- [ ] GrassStrip SVG fills updated per table above
- [ ] White text legible on darker-bottom footer
- [ ] No console errors
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** Overlay opacity too strong/weak. **Mitigation:** start at `to-black/20`; tune to `to-black/15` or `to-black/25` if needed.
- **Risk:** Coral `#ff7a85` clashes with new cyan + yellow palette. **Mitigation:** revisit only if visual smoke reveals conflict; brainstorm proposed peach `#ffb89a` as fallback.
