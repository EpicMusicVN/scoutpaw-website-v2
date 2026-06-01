---
title: 'Pivot #6 — Dark Navy Surface + Vivid Yellow Title Restoration'
description: >-
  Mockup-validated surface flip: hero + large banner sections become bg-ink-blue
  (#1a3a5c) with solid bright yellow titles (#ffd70c). Restores Plan J's
  original design pattern after 5 intervening pivots that text-only requests
  failed to lock. The first mockup-validated decision in the title-color saga.
status: completed
priority: P1
branch: main
tags:
  - frontend
  - ui
  - hero
  - typography
  - surface
  - pivot-6
blockedBy: []
blocks: []
restores: 260526-1913-hero-navy-surfaces-yellow-titles
reverted_by: 260528-0814-pivot-7-revert-to-pivot-4-state
mockup: ./mockups/comparison.html
created: '2026-05-28T00:06:44.923Z'
createdBy: 'ck:plan'
source: skill
---

> **REVERTED by [pivot #7](../260528-0814-pivot-7-revert-to-pivot-4-state/plan.md) (2026-05-28 08:14)** — dark-surface flip was reverted to pivot #4 light-surface state. User viewed live render and disagreed; mockup that validated this plan was too narrow (isolated samples, no full-page context). Plan content kept for audit trail.

# Pivot #6 — Dark Navy Surface + Vivid Yellow Title Restoration

## Overview

Surface-level redesign across **19 components**:
- All 5 hero components → `bg-ink-blue` surface; kicker + h1 → solid `text-brand-primary`; body → `text-white/85`
- All 14 large h2 banner sections → same treatment
- Mid sub-headers (5), card-level h3, `bg-paper` body bg — **UNCHANGED**

**This is the first mockup-validated decision** in the 6-pivot title-color saga. User selected Option A from `mockups/comparison.html` after viewing 5 rendered alternatives. Restores Plan J's design pattern (originally 260526-1913, completed then reverted via direct edits) but with explicit mockup audit trail.

**Brainstorm report:** [plans/reports/brainstorm-260528-0649-pivot-6-dark-surface-vivid-yellow.md](../reports/brainstorm-260528-0649-pivot-6-dark-surface-vivid-yellow.md)

**Canonical mockup:** [./mockups/comparison.html](./mockups/comparison.html) — open in browser; Option A is the source of truth.

**Pivot history (6 iterations in <72h):**
1. 2026-05-26 (Plan J) — navy hero + yellow titles (shipped → reverted)
2. 2026-05-26 (reversal) — light surfaces + navy titles + gold kickers
3. 2026-05-27 18:33 — kicker→blue + h1→gradient (planned, superseded)
4. 2026-05-28 05:25 — kicker blue + hero/banner gradient + mid solid gold
5. 2026-05-28 06:18 — mid gold → ink-blue revert + lock mechanism introduced
6. **2026-05-28 06:49 (this plan)** — mockup-validated restoration of pivot #1's design

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero Surface Flip](./phase-01-hero-surface-flip.md) | Completed |
| 2 | [Large Banner Surface Flip](./phase-02-large-banner-surface-flip.md) | Completed |
| 3 | [Button Variant Audit](./phase-03-button-variant-audit.md) | Completed |
| 4 | [Atmosphere and Theme Decisions](./phase-04-atmosphere-and-theme-decisions.md) | Completed |
| 5 | [Live Render Verification](./phase-05-live-render-verification.md) | Completed |
| 6 | [Docs Sync and Lock Mechanism Refinement](./phase-06-docs-sync-and-lock-mechanism-refinement.md) | Completed |

## Dependencies

- **Phase ordering:** 1 + 2 parallelizable (no file overlap). 3 sequential after 1 + 2 (audits button usage inside flipped surfaces). 4 in parallel with 3 (independent atmosphere file scope). 5 sequential after 1-4. 6 sequential after 5.
- **No blocking cross-plan dependencies.** Plan `260528-0525` (pivot #4) is `status: done`; pivot #5 mid-tier revert is shipped; Plan J (260526-1913) is `status: completed` (its utility additions remain in globals.css).
- **Design pattern restored from:** [`260526-1913-hero-navy-surfaces-yellow-titles`](../260526-1913-hero-navy-surfaces-yellow-titles/plan.md) — that plan's utilities (`.heading-gradient-gold`, `.text-shadow-bold`) become consumable again under this pivot.

## Affected Files

**Hero components (Phase 1 — 5 files):**
- `components/home/full-bleed-hero.tsx`
- `components/home/cinematic-hero.tsx`
- `components/watch/watch-hero.tsx`
- `components/coming-soon/coming-soon-hero.tsx`
- `components/characters/character-detail-hero.tsx` (special: per-character theme decision deferred to Phase 4)

**Large banner components (Phase 2 — 14 files):**
- `components/home/menu-cards.tsx`, `feature-banner.tsx`, `character-showcase.tsx`, `featured-pup-spotlight.tsx`, `newsletter-cta.tsx`, `video-grid.tsx`
- `components/watch/explore-videos.tsx`, `playlist-grid.tsx`, `featured-video.tsx`
- `components/shop/explore-products.tsx`, `about-shop.tsx`
- `components/top-picks/top-picks-board.tsx`, `deal-block.tsx`
- `components/characters/character-section.tsx`

**Button variants (Phase 3 — potentially 1 file):**
- `components/ui/button.tsx` — audit outline variant border; add `dark-surface` if needed

**Atmosphere decoratives (Phase 4 — audit, conditional edits):**
- `components/ui/paw-print-pattern.tsx`, `cloud-divider.tsx` — verify on navy
- `components/characters/character-detail-hero.tsx` — per-character theme retention decision

**Docs (Phase 6):**
- `docs/code-standards.md`
- `docs/project-changelog.md`

## Out of Scope

- Mid h2/h3 sub-headers (5 components) — stay `text-ink-blue` on cyan body bg per pivot #5
- Card-level h3 titles — stay `text-ink-blue`
- `bg-paper` body bg — stays cyan `#c6e7e9` (light intersections preserved)
- Body text outside hero/banner sections — stays `text-ink-blue`
- Mobile nav, footer, cookie consent — not inside hero/banner surfaces
- New color tokens — none needed; uses existing `--brand-primary` + `--ink-blue`
- Removing `.heading-gradient-gold-light` — marked reserved, kept for future
