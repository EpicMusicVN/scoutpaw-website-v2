---
title: Hero and Block Title Yellow/Gold Sweep
description: >-
  Bundle yesterday's pending hero color swap (kicker→ink-blue, h1→gold gradient)
  with a new site-wide block-title sweep: large h2 banners get the same gold
  gradient as hero h1; mid h2/h3 sub-headers go solid dark-gold; card-level h3s
  stay ink-blue to honor WCAG AA. One additive CSS utility, zero new tokens.
status: completed
priority: P1
branch: main
tags:
  - frontend
  - ui
  - hero
  - typography
  - gradient
  - block-titles
blockedBy: []
blocks: []
supersedes: 260527-1833-hero-kicker-blue-title-gold
reverted_by: 260528-0814-pivot-7-revert-to-pivot-4-state
created: '2026-05-27T22:33:11.664Z'
createdBy: 'ck:plan'
source: skill
---

> **REVERTED by [pivot #7](../260528-0814-pivot-7-revert-to-pivot-4-state/plan.md) (2026-05-28 08:14)** — mid-tier ink-blue swap was reverted back to `text-brand-gold`. Plan content kept for audit trail.

# Hero and Block Title Yellow/Gold Sweep

## Overview

Two scopes bundled into one execution:

1. **Hero swap** (pending from yesterday's superseded plan) — Kicker → `text-ink-blue`; H1 → new `.heading-gradient-gold-light`. 5 components.
2. **Block title sweep** (new today) — Large h2 banners (≥text-4xl) → same gradient. Mid h2/h3 sub-headers (text-2xl/3xl) → solid `text-brand-gold`. Card-level h3s untouched.

This is iteration 4 on the same tokens in <72h. Brainstorm caught a legibility cliff in approach A (reuse `.heading-gradient-gold` which fades to invisible white on cyan bg). New utility is symmetric (`#b8862e → #ffd70c → #b8862e`) so no stop disappears on light surfaces.

**Brainstorm report:** [plans/reports/brainstorm-260528-0525-hero-and-block-title-yellow-gold.md](../reports/brainstorm-260528-0525-hero-and-block-title-yellow-gold.md)

**Supersedes:** [`260527-1833-hero-kicker-blue-title-gold`](../260527-1833-hero-kicker-blue-title-gold/plan.md) (hero scope absorbed here)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Gold Light Utility](./phase-01-gold-light-utility.md) | Completed |
| 2 | [Hero Component Swaps](./phase-02-hero-component-swaps.md) | Completed |
| 3 | [Large H2 Banner Sweep](./phase-03-large-h2-banner-sweep.md) | Completed |
| 4 | [Mid H2/H3 Sub-Header Sweep](./phase-04-mid-h2-h3-sub-header-sweep.md) | Completed |
| 5 | [Live Render Verification](./phase-05-live-render-verification.md) | Completed |
| 6 | [Docs Update and Supersede](./phase-06-docs-update-and-supersede.md) | Completed |

## Dependencies

- **Phase ordering** — 1 must precede 2/3 (utility must exist before consumers reference it). 2/3/4 can be done in any order or parallelized (no file overlap). 5 follows 2/3/4. 6 follows 5.
- **Reuses tokens** — `--ink-blue`, `--brand-primary`, `--accent-gold-dark` (no new tokens needed).
- **Supersedes plan** — `260527-1833-hero-kicker-blue-title-gold` (hero scope was unimplemented; absorbed here).

## Affected Files

**CSS / utility (Phase 1):**
- `app/globals.css`

**Hero components (Phase 2 — 5 files, 10 line edits):**
- `components/home/full-bleed-hero.tsx`
- `components/home/cinematic-hero.tsx`
- `components/watch/watch-hero.tsx`
- `components/coming-soon/coming-soon-hero.tsx`
- `components/characters/character-detail-hero.tsx`

**Large h2 banner components (Phase 3 — 14 files):**
- `components/home/menu-cards.tsx`
- `components/home/feature-banner.tsx`
- `components/home/character-showcase.tsx`
- `components/home/featured-pup-spotlight.tsx`
- `components/home/newsletter-cta.tsx`
- `components/home/video-grid.tsx`
- `components/watch/explore-videos.tsx`
- `components/watch/playlist-grid.tsx`
- `components/watch/featured-video.tsx`
- `components/shop/explore-products.tsx`
- `components/shop/about-shop.tsx`
- `components/top-picks/top-picks-board.tsx`
- `components/top-picks/deal-block.tsx`
- `components/characters/character-section.tsx`

**Mid h2/h3 sub-header components (Phase 4 — 6 files):**
- `components/watch/our-channels.tsx`
- `components/watch/video-rail.tsx`
- `components/watch/subscribe-card.tsx`
- `components/watch/watch-library.tsx`
- `components/shop/shop-empty-state.tsx`
- `components/shop/about-shop.tsx` (h3 only, second edit)

**Docs (Phase 6):**
- `docs/code-standards.md`
- `docs/project-changelog.md`
- `plans/260527-1833-hero-kicker-blue-title-gold/plan.md` (already marked superseded)

## Out of Scope

- Card-level h3 titles (product/video/character names + menu icon labels) — stay `text-ink-blue` per WCAG AA strict decision
- Body text, buttons, navigation, footer typography
- Surface bg changes
- Refactoring hardcoded `"ScoutPaw TV"` literal in `watch-hero.tsx:114` to a prop
- Brand color token changes (`--brand-primary` `#ffd70c` stays)
