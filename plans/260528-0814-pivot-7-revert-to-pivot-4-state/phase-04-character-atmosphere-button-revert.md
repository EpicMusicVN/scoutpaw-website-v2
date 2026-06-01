---
phase: 4
title: Character Atmosphere Button Revert
status: completed
priority: P1
effort: 30m
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Character + Atmosphere + Button Revert

## Overview

Revert remaining pivot #6 changes: character-detail-hero h1 back to gradient, character-section h2 back to gradient, video-grid YouTube link back to ink-blue, 4 button per-instance swaps reverted, 3 page-level CloudDivider consumers drop surface="dark". KEEP all reserved utilities (`dark-surface` button variant, `tone` prop, `surface` prop, `titleColor` field) — zero-cost, may be reused later.

## Requirements

- Functional: ~10 line edits across character + atmosphere + button consumer files.
- Non-functional: reserved utilities preserved (`dark-surface`, `tone`, `surface`, `titleColor`); only their CONSUMERS revert.

## Architecture

Reserved utilities stay in the codebase as unused infrastructure. Consumers that opted into them revert to default props or pre-pivot-6 variants. The utilities themselves are zero-cost (Tailwind purges unused CSS; props default to backward-compatible values).

## Related Code Files

**Character files:**
- `components/characters/character-detail-hero.tsx` — h1 back to `heading-gradient-gold-light` (drop conditional `theme.titleColor` consumption — pivot #4 had the gradient)
- `components/characters/character-section.tsx` — h2 back to `heading-gradient-gold-light` (Phase 2 of THIS plan handled kicker; this phase handles h2 specifically since Phase 2 deferred it pending theme-aware decision)

**Video-grid link revert:**
- `components/home/video-grid.tsx` line 63 — `text-white/85 hover:text-brand-primary` → `text-ink-blue hover:text-brand-gold` (pivot #4 state)

**Button per-instance reverts (4 swaps):**
- `components/home/cinematic-hero.tsx` line 104 — `variant="dark-surface"` → `variant="outline"`
- `components/home/featured-pup-spotlight.tsx` line 58 — `variant="dark-surface"` → `variant="outline"`
- `components/watch/watch-hero.tsx` line 129 — `variant="dark-surface"` → `variant="outline"`
- `components/watch/watch-hero.tsx` line 123 — `variant="primary"` → `variant="dark"` (revert CTA promotion)

**Page-level CloudDivider reverts (3 files):**
- `app/page.tsx` — drop `surface="dark"` from all `<CloudDivider>` calls
- `app/shop/page.tsx` — same
- `app/top-picks/page.tsx` — same

**RESERVED — DO NOT REMOVE:**
- `components/ui/button.tsx` — `dark-surface` variant stays (no consumers post-revert)
- `components/ui/paw-print-pattern.tsx` — `tone` prop stays (defaults to "light")
- `components/ui/cloud-divider.tsx` — `surface` prop stays (defaults to "light")
- `lib/content/character-themes.ts` — `titleColor` field stays (just unused if heroes use gradient)
- `components/home/character-showcase.tsx` — if it passes `tone="dark"` to PawPrintPattern, that pass is also unused (PawPrintPattern still renders with whatever tone; section bg is light now). Decision: leave the `tone="dark"` call or drop it for cleanliness. **Drop it** for cleanliness — pawprints will render correctly on cyan section bg with default light tone.

## Implementation Steps

1. **character-detail-hero.tsx**:
   - Locate h1 (around line 42). Currently uses conditional logic like `theme.titleColor === "yellow" ? "text-brand-primary" : "text-ink-blue"` (or similar).
   - Replace with literal `heading-gradient-gold-light` className.
   - Drop any imports / lookups of `theme.titleColor` in this file.

2. **character-section.tsx**:
   - Locate h2 (around line 144). Currently uses theme-aware conditional.
   - Replace with literal `heading-gradient-gold-light` className.

3. **video-grid.tsx line 63**:
   - Swap link className `text-white/85 hover:text-brand-primary` → `text-ink-blue hover:text-brand-gold`

4. **cinematic-hero.tsx line 104**:
   - Button `variant="dark-surface"` → `variant="outline"`

5. **featured-pup-spotlight.tsx line 58**:
   - Button `variant="dark-surface"` → `variant="outline"`

6. **watch-hero.tsx line 129**:
   - Button `variant="dark-surface"` → `variant="outline"`

7. **watch-hero.tsx line 123**:
   - Button `variant="primary"` → `variant="dark"` (CTA emphasis revert)

8. **app/page.tsx, app/shop/page.tsx, app/top-picks/page.tsx**:
   - Find all `<CloudDivider surface="dark" />`
   - Drop the `surface` attribute (defaults to "light")

9. **character-showcase.tsx** (if applicable):
   - If it has `<PawPrintPattern tone="dark" />`, drop the `tone` attribute.

10. **DO NOT TOUCH** reserved utility files. `dark-surface` variant in button.tsx, `tone` prop in paw-print-pattern.tsx, `surface` prop in cloud-divider.tsx, `titleColor` field in character-themes.ts — all stay.

11. Run `pnpm tsc --noEmit` + `pnpm lint`.

## Success Criteria

- [ ] `character-detail-hero` h1 uses `heading-gradient-gold-light` (no `theme.titleColor` consumption)
- [ ] `character-section` h2 uses `heading-gradient-gold-light`
- [ ] `video-grid:63` link is `text-ink-blue hover:text-brand-gold`
- [ ] 4 button per-instance swaps reverted
- [ ] 3 page-level `CloudDivider` calls drop `surface="dark"`
- [ ] `character-showcase` drops `tone="dark"` on PawPrintPattern (if present)
- [ ] Reserved utilities INTACT (button `dark-surface` variant, `tone` prop, `surface` prop, `titleColor` field)
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] Grep verification: `Grep "variant=\"dark-surface\"" components/` returns ZERO consumer matches
- [ ] Grep verification: `Grep "surface=\"dark\"" app/` returns ZERO matches

## Risk Assessment

- **Risk:** `character-detail-hero` conditional logic on `theme.titleColor` may have multiple references (h1 + tagline) — easy to miss one. **Mitigation:** Read entire file before edit; grep for `titleColor` to enumerate references.
- **Risk:** `theme.titleColor` field is being orphaned (still defined in `character-themes.ts` but unused). **Mitigation:** acceptable — kept as reserved per plan.
- **Risk:** `character-showcase.tsx` might not have a `<PawPrintPattern tone="dark" />` call (uncertain from prior agent report). **Mitigation:** grep first; only revert if present.
- **Risk:** `app/page.tsx` had 6 CloudDivider calls all set to `surface="dark"` per pivot #6 docs-manager report. Need to revert all 6. **Mitigation:** grep + revert all.
- **Risk:** Reserved utilities may confuse future devs ("why is this prop here if nothing uses it?"). **Mitigation:** Phase 6 docs sync adds inline comments / code-standards entry.
