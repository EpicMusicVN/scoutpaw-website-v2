---
title: "Hero Kicker Blue and Title Gold"
description: >-
  Site-wide hero color swap on light cyan surface: kicker (e.g. "SCOUTPAW TV")
  becomes deep ink-blue; H1 title becomes a new symmetric gold gradient utility
  (.heading-gradient-gold-light) that stays legible on light backgrounds. Third
  pivot on these tokens in <48h — design locked, audit trail enforced.
status: superseded
priority: P1
branch: "main"
tags:
  - frontend
  - ui
  - hero
  - typography
  - gradient
blockedBy: []
blocks: []
supersededBy: 260528-0525-hero-and-block-title-yellow-gold
created: "2026-05-27T11:42:40.271Z"
createdBy: "ck:plan"
source: skill
---

> **SUPERSEDED 2026-05-28** by [`260528-0525-hero-and-block-title-yellow-gold`](../260528-0525-hero-and-block-title-yellow-gold/plan.md). That plan bundles the hero swap designed here (unimplemented) with a new block-title yellow/gold sweep. Do not implement this plan — it is kept as a historical audit-trail record only.


# Hero Kicker Blue and Title Gold

## Overview

Color swap across all 5 hero components. Kicker `text-brand-gold` → `text-ink-blue`. Title `text-navy` → new `.heading-gradient-gold-light` utility (symmetric dark-gold→yellow→dark-gold, no white stops, no invisibility on light cyan bg).

**Why a new utility instead of reusing `.heading-gradient-gold`:** existing utility (built in Plan J 260526-1913) fades to pure white, designed for navy surfaces. Plan J was reversed back to light surfaces; that gradient is unusable on `--bg-base` cyan.

**Recent context (audit trail):**
- Plan J (260526-1913) — navy hero surfaces + yellow gold titles (completed, then reverted via direct edits)
- Current state — light surfaces, navy titles, gold kickers
- This plan — light surfaces, ink-blue kickers, gold gradient titles

**Brainstorm report:** [plans/reports/brainstorm-260527-1833-hero-kicker-blue-title-gold.md](../reports/brainstorm-260527-1833-hero-kicker-blue-title-gold.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Gold Light Utility](./phase-01-gold-light-utility.md) | Pending |
| 2 | [Hero Component Swaps](./phase-02-hero-component-swaps.md) | Pending |
| 3 | [Live Render Verification](./phase-03-live-render-verification.md) | Pending |
| 4 | [Changelog Update](./phase-04-changelog-update.md) | Pending |

## Dependencies

- **Reuses tokens from:** `--ink-blue` (Plan 260526-1714-typography-v2-body-blue), `--brand-primary` & `--accent-gold-dark` (foundational palette)
- **Iterates on:** `260526-1913-hero-navy-surfaces-yellow-titles` (introduced the gold-gradient pattern; this plan adds the light-surface variant)
- **No blocking plans**

## Affected Files

- `app/globals.css` — new `.heading-gradient-gold-light` utility + mobile fallback
- `components/home/full-bleed-hero.tsx` — kicker + title swap
- `components/watch/watch-hero.tsx` — kicker + title swap
- `components/coming-soon/coming-soon-hero.tsx` — kicker + title swap
- `components/characters/character-detail-hero.tsx` — breed kicker opacity bump + title swap
- `components/home/cinematic-hero.tsx` — audit only, apply swap if same pattern
- `docs/project-changelog.md` — entry post-impl

## Out of Scope

- Hero bg / layout changes (light cyan surface stays)
- Page-level kicker text content
- Mobile nav, footer, non-hero typography
- Reverting Plan J's existing `.heading-gradient-gold` utility (kept for future navy-surface reuse)
