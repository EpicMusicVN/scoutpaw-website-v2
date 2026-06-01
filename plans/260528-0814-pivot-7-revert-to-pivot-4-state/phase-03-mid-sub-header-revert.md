---
phase: 3
title: Mid Sub-Header Revert
status: completed
priority: P2
effort: 15m
dependencies: []
---

# Phase 3: Mid Sub-Header Revert

## Overview

Revert pivot #5 mid-tier swap. 5 file edits swapping mid h2/h3 sub-headers from `text-ink-blue` back to `text-brand-gold` (pivot #4 state).

## Requirements

- Functional: 5 single-line class substitutions.
- Non-functional: matches pivot-4-era mid-tier rule (`text-brand-gold` solid dark gold #b8862e).

## Architecture

Each file currently has `text-ink-blue` on the h2 (set by pivot #5). Pivot #4 had them as `text-brand-gold`. Direct revert.

## Related Code Files

| File | Line | Current | Target |
|---|---|---|---|
| `components/watch/our-channels.tsx` | 87 | `text-ink-blue` | `text-brand-gold` |
| `components/watch/video-rail.tsx` | 68 | `text-ink-blue` | `text-brand-gold` |
| `components/watch/subscribe-card.tsx` | 12 | `text-ink-blue` | `text-brand-gold` |
| `components/watch/watch-library.tsx` | 117 | `text-ink-blue` | `text-brand-gold` |
| `components/shop/shop-empty-state.tsx` | 16 | `text-ink-blue` | `text-brand-gold` |

## Implementation Steps

1. For each file, read the h2 line to confirm current state.
2. Swap `text-ink-blue` → `text-brand-gold` via Edit tool. Preserve all other classes.
3. Run `pnpm tsc --noEmit` + `pnpm lint`.

## Success Criteria

- [ ] All 5 mid h2 elements show `text-brand-gold`
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] Grep verification: `Grep "text-brand-gold" components/watch components/shop` shows ≥5 matches in mid sub-headers (plus pre-existing kicker usages)

## Risk Assessment

- **Risk:** `subscribe-card.tsx:12` h2 may have additional `text-navy/85` kicker on line 9 — only h2 changes, kicker unchanged. **Mitigation:** explicit line-targeted edits.
- **Risk:** mid h2 sits on `bg-paper` cyan body bg. `text-brand-gold` on cyan ~2.45:1 (per code-reviewer recalc) — technically fails AA-large. **Mitigation:** this is the pivot #4 state user explicitly wants restored. AA concern documented in code-standards.md from pivot #5 era. Not blocking — restoring user-approved state.
