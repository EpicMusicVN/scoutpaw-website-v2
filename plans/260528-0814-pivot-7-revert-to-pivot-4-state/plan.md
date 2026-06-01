---
title: 'Pivot #7 — Revert Pivots #5 + #6 to Pivot #4 State'
description: >-
  Revert the dark-surface flip (pivot #6) AND the mid-tier ink-blue swap (pivot
  #5) back to the pivot #4 final state shipped at 06:02 today. User viewed the
  live pivot #6 result and disagreed — the mockup that validated #6 was too
  narrow (isolated section samples, no full-page context). Codifies the
  lock-mechanism refinement: mockups must show full-page context.
status: completed
priority: P1
branch: main
tags:
  - frontend
  - ui
  - hero
  - typography
  - revert
  - pivot-7
blockedBy: []
blocks: []
reverts:
  - 260528-0525-hero-and-block-title-yellow-gold
  - 260528-0649-pivot-6-solid-yellow-design-decision
target_state: pivot
created: '2026-05-28T01:18:46.076Z'
createdBy: 'ck:plan'
source: skill
---

# Pivot #7 — Revert Pivots #5 + #6 to Pivot #4 State

## Overview

Mechanical reversal of ~30 files across heroes, banners, mid sub-headers, character components, atmosphere page consumers, and docs. Target state = pivot #4 final state shipped at 06:02 today.

**Brainstorm report:** [plans/reports/brainstorm-260528-0814-pivot-7-revert-to-pivot-4-state.md](../reports/brainstorm-260528-0814-pivot-7-revert-to-pivot-4-state.md)

**Why this revert is needed:** User viewed the live pivot #6 result and disagreed. The lock-mechanism rule (introduced pivot #5, refined pivot #6) said "view rendered pixels" — the user did. But the mockup was too narrow — it showed isolated hero + section samples, not full-page context with atmosphere, character poses, multi-section rhythm. Pivot #7 codifies a refined mockup pipeline rule: **mockups must show full-page context**.

**Reserved utilities kept (zero-cost):**
- `button.tsx` `dark-surface` variant (no consumers post-revert)
- `paw-print-pattern.tsx` `tone` prop (default "light")
- `cloud-divider.tsx` `surface` prop (default "light")
- `lib/content/character-themes.ts` `titleColor` field (unused if heroes use gradient)

## Pivot history (7)

| # | When | What | Status |
|---|---|---|---|
| 1 | 2026-05-26 (Plan J) | Navy hero + yellow titles | Completed |
| 2 | 2026-05-26 | Light surfaces + navy titles + gold kickers | Completed |
| 3 | 2026-05-27 18:33 | Kicker→blue + h1→gradient (planned, never shipped) | Completed |
| 4 | 2026-05-28 05:25 | Kicker blue + hero/banner gradient + mid solid gold | Completed |
| 5 | 2026-05-28 06:18 | Mid solid gold → ink-blue + lock introduced | Completed |
| 6 | 2026-05-28 06:49 | Dark navy surfaces + solid yellow (mockup-validated) | Completed |
| 7 | 2026-05-28 08:14 (this) | Revert #5 + #6 + refine lock mechanism | This plan |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hero Surface Revert](./phase-01-hero-surface-revert.md) | Completed |
| 2 | [Banner Surface Revert](./phase-02-banner-surface-revert.md) | Completed |
| 3 | [Mid Sub-Header Revert](./phase-03-mid-sub-header-revert.md) | Completed |
| 4 | [Character Atmosphere Button Revert](./phase-04-character-atmosphere-button-revert.md) | Completed |
| 5 | [Live Render Verification](./phase-05-live-render-verification.md) | Completed |
| 6 | [Docs Sync and Lock Mechanism Refinement](./phase-06-docs-sync-and-lock-mechanism-refinement.md) | Completed |

## Dependencies

- **Phase ordering:** 1 + 2 + 3 parallelizable (no file overlap between hero / banner / mid sub-headers). 4 sequential after 1-3 (`watch-hero` touched by both Phase 1 and Phase 4 button swap; safer to sequence). 5 sequential after 1-4. 6 sequential after 5.
- **Reverts plans:**
  - [`260528-0525-hero-and-block-title-yellow-gold`](../260528-0525-hero-and-block-title-yellow-gold/plan.md) — pivot #5 mid-tier work (5 files)
  - [`260528-0649-pivot-6-solid-yellow-design-decision`](../260528-0649-pivot-6-solid-yellow-design-decision/plan.md) — pivot #6 full surface flip + atmosphere
- **Working tree state:** Both prior plans uncommitted. No git revert possible — manual edits only.

## Affected Files

**Hero components (Phase 1 — 4 files):**
- `components/home/full-bleed-hero.tsx`
- `components/home/cinematic-hero.tsx`
- `components/watch/watch-hero.tsx`
- `components/coming-soon/coming-soon-hero.tsx`

**Banner components (Phase 2 — 14 files):**
- `components/home/menu-cards.tsx`, `feature-banner.tsx`, `character-showcase.tsx`, `featured-pup-spotlight.tsx`, `newsletter-cta.tsx`, `video-grid.tsx`
- `components/watch/explore-videos.tsx`, `playlist-grid.tsx`, `featured-video.tsx`
- `components/shop/explore-products.tsx`, `about-shop.tsx`
- `components/top-picks/top-picks-board.tsx`, `deal-block.tsx`
- `components/characters/character-section.tsx`

**Mid sub-headers (Phase 3 — 5 files):**
- `components/watch/our-channels.tsx:87`
- `components/watch/video-rail.tsx:68`
- `components/watch/subscribe-card.tsx:12`
- `components/watch/watch-library.tsx:117`
- `components/shop/shop-empty-state.tsx:16`

**Character + atmosphere + buttons (Phase 4 — multiple files):**
- `components/characters/character-detail-hero.tsx` — h1 back to gradient
- `components/characters/character-section.tsx` — h2 back to gradient (Phase 2 only restored kicker color)
- `components/home/video-grid.tsx:63` — link `text-white/85` → `text-ink-blue`
- `components/home/cinematic-hero.tsx:104` — button `dark-surface` → `outline`
- `components/home/featured-pup-spotlight.tsx:58` — button `dark-surface` → `outline`
- `components/watch/watch-hero.tsx:129` — button `dark-surface` → `outline`
- `components/watch/watch-hero.tsx:123` — button `primary` → `dark`
- `app/page.tsx`, `app/shop/page.tsx`, `app/top-picks/page.tsx` — drop `surface="dark"` from CloudDivider calls

**Docs (Phase 6):**
- `docs/code-standards.md` — restore pivot-4-era contracts; refine lock with full-page-context rule
- `docs/project-changelog.md` — append pivot #7 entry
- `plans/260528-0525-hero-and-block-title-yellow-gold/plan.md` — frontmatter status update
- `plans/260528-0649-pivot-6-solid-yellow-design-decision/plan.md` — frontmatter status update

## Out of Scope

- Removing reserved utilities (`dark-surface` variant, `tone` prop, `surface` prop, `titleColor` field) — kept for future reuse, zero cost
- Card-level h3 titles — `text-ink-blue` (unchanged across all pivots)
- `bg-paper` body bg — unchanged (cyan)
- Inner-card AA fixes from end of pivot #6 (feature-banner / featured-pup-spotlight / deal-block) — they already match pivot #4 state; don't double-revert
- Pre-existing working-tree changes (~37 files from before this session) — not part of any pivot, not reverted here
- The mockup file `plans/260528-0649-.../mockups/comparison.html` — stays as historical reference
