---
phase: 6
title: Newsletter Spacing Audit
status: completed
priority: P3
effort: 10m
dependencies: []
---

# Phase 6: Newsletter Spacing Audit

## Overview

Audit Newsletter section's top vs bottom spacing. Current section uses `py-16 md:py-20` (symmetric). User perceives top > bottom. Audit surrounding sections (VideoGrid above, Footer below) to identify if neighbor padding creates asymmetric visual space. Fix only if real.

## Requirements

- Functional: top space (from previous section bottom to Newsletter card top) ≈ bottom space (Newsletter card bottom to Footer top)
- Non-functional: typecheck + lint clean if changes made

## Architecture

Visual spacing = ABOVE-section-padding-bottom + Newsletter-padding-top vs Newsletter-padding-bottom + BELOW-section-padding-top. Imbalance comes from neighbor inconsistency.

## Related Code Files

- Read: `components/home/video-grid.tsx` (the section above Newsletter)
- Read: `components/nav/footer.tsx` (top padding)
- Modify (conditional): `components/home/newsletter-cta.tsx`

## Implementation Steps

1. Read VideoGrid bottom padding (the section ABOVE Newsletter):
   - Grep `py-`, `pb-`, `pt-` in `video-grid.tsx`.
   - Note total bottom padding at desktop.
2. Read Footer top padding (the section BELOW Newsletter):
   - `footer.tsx` wrapper has `py-14 md:py-16` → top padding is 14-16.
3. Compare totals:
   - Above-space = VideoGrid `pb-X` + Newsletter `pt-16/20`
   - Below-space = Newsletter `pb-16/20` + Footer `pt-14/16`
4. If asymmetric:
   - If above > below → reduce Newsletter `pt-` OR add Footer `pt-`
   - If below > above → reverse
5. If symmetric (within 8px tolerance) → no code change; document as "perceived imbalance, no real asymmetry."
6. Run `pnpm typecheck` + `pnpm lint` if changes made.

## Success Criteria

- [ ] Audit completed, findings documented
- [ ] If real asymmetry: fix applied, both spaces match within 8px
- [ ] If perceived only: no change, documented
- [ ] typecheck + lint clean (if changes)

## Risk Assessment

- **Risk:** Fixing neighbor padding affects OTHER pages that use the same components. **Mitigation:** prefer adjusting Newsletter's own `pt-` / `pb-` since it's a single-instance home-page-only section.
- **Risk:** "Visual perception" is subjective; user may still feel imbalance even after equalization. **Mitigation:** measure, not estimate. If equalized and user still complains, ask for screenshot.
