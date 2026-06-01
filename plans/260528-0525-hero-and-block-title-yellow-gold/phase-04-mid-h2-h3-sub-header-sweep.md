---
phase: 4
title: Mid H2/H3 Sub-Header Sweep
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
---

# Phase 4: Mid H2/H3 Sub-Header Sweep

## Overview

Swap 6 mid-size sub-header elements (text-2xl/3xl base) from `text-navy` to solid `text-brand-gold` (`#b8862e`). Smaller than the large-banner tier where the gradient detail is preserved; gradient at small sizes washes into noise — solid dark gold reads cleaner.

## Requirements

- Functional: 6 line edits across 6 files.
- Non-functional: AA-safe at large heading thresholds (≥18pt = `text-2xl`+). Dark gold `#b8862e` on cyan paper `#c6e7e9` = ~3.4:1 = passes WCAG AA large-text minimum (3:1).

## Architecture

Apply Tailwind's existing `text-brand-gold` utility (already wired in `tailwind.config.ts`, used previously for hero kickers — pre-existing token, zero new dependencies).

## Related Code Files

| File | Line | Element | Sizes | Context |
|---|---|---|---|---|
| `components/watch/our-channels.tsx` | 87 | h2 | 3xl→5xl | Sub-section under hero |
| `components/watch/video-rail.tsx` | 68 | h2 | 3xl→5xl | Rail title |
| `components/watch/subscribe-card.tsx` | 12 | h2 | 3xl→4xl | Subscribe card heading |
| `components/watch/watch-library.tsx` | 117 | h2 | 2xl→3xl | Library sub-header |
| `components/shop/shop-empty-state.tsx` | 16 | h2 | 3xl (no scale-up) | Empty state |
| `components/shop/about-shop.tsx` | 82 | h3 | 2xl→3xl | Sub-card title inside `AboutShop` (separate from h2 at line 64, handled in Phase 3) |

## Implementation Steps

1. For each row, open file, jump to line, swap `text-navy` → `text-brand-gold`. Preserve all other classes.
2. Special case `about-shop.tsx`: file has TWO edits across two phases — line 64 is a large h2 (Phase 3, gets gradient); line 82 is the mid h3 (this phase, gets solid gold). Confirm both edits land correctly.
3. After all 6 edits, run `pnpm tsc --noEmit` and `pnpm lint`.

## Success Criteria

- [ ] All 6 line edits applied
- [ ] `about-shop.tsx` has both Phase 3 + Phase 4 edits applied
- [ ] Grep: `Grep "text-brand-gold" components/watch components/shop` shows ≥5 mid-tier matches (plus any pre-existing hero kicker usages now removed)
- [ ] `pnpm tsc --noEmit` + `pnpm lint` pass

## Risk Assessment

- **Risk:** `watch-library.tsx:117` h2 starts at `text-2xl` (~18-19pt at base font). Dark gold ~3.4:1 borderline AA. **Mitigation:** still passes large-text AA threshold (3:1 for ≥18pt or 14pt bold). Document as edge tolerance in Phase 6 code-standards update.
- **Risk:** `shop-empty-state.tsx:16` is a one-shot emergency state, may render against unusual bg. **Mitigation:** verify in Phase 5; component currently renders on standard cyan paper — no special bg.
- **Risk:** Sub-card h3 in `about-shop.tsx:82` sits inside a feature card with white or tinted bg. Dark gold on white = ~3.5:1, passes large-text AA. **Mitigation:** confirm during Phase 5 render check.
