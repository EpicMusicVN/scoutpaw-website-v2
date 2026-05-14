---
title: Color System Overhaul + Hero Banner Rework
description: >-
  Site-wide palette swap (warm cream/honey/navy → cool cyan/yellow/blue) plus
  hero banner rework to letterbox composition so characters are no longer
  covered by the glass-card overlay.
status: completed
priority: P2
branch: ''
tags:
  - design-system
  - palette
  - hero
  - footer
  - homepage
blockedBy: []
blocks: []
created: '2026-05-13T19:15:55.624Z'
createdBy: 'ck:plan'
source: skill
---

# Color System Overhaul + Hero Banner Rework

## Overview

Apply a cohesive palette change across the entire site and resolve a long-standing hero-banner composition issue where the glass card overlays the characters. CSS-variable-driven design means most changes propagate automatically; remaining work is in hardcoded SVGs, the hero composition, and the newsletter gradient.

**Source brainstorm:** `plans/reports/brainstorm-260514-0158-color-system-and-hero-rework.md`

## Final Palette (Locked)

| Token | New Value | Role |
|---|---|---|
| `--bg-base` | `#c6e7e9` | Page background |
| `--bg-navy` | `#397fc5` + darker gradient overlay | Footer background |
| `--brand-primary` | `#ffd70c` | CTAs, focus rings, highlights |
| `--ink` | `#2b1d10` (unchanged) | Body text |
| `--brand-honey` | DROPPED | (re-targeted to white/cream/yellow) |

Banner aspect: **`aspect-[16/9]`** (verified: `banner.png` is 2754×1536 ≈ 1.793, 0.7% drift from 16:9).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [CSS Variables](./phase-01-css-variables.md) | Completed |
| 2 | [Tailwind Config Audit](./phase-02-tailwind-config-audit.md) | Completed |
| 3 | [Footer Recolor & Overlay](./phase-03-footer-recolor-overlay.md) | Completed |
| 4 | [Hero Letterbox Rework](./phase-04-hero-letterbox-rework.md) | Completed |
| 5 | [Newsletter Gradient](./phase-05-newsletter-gradient.md) | Completed |
| 6 | [Site-Config Palette Sync](./phase-06-site-config-palette-sync.md) | Completed |
| 7 | [Honey Cleanup](./phase-07-honey-cleanup.md) | Completed |

## Execution Order

P1 → P2 → P3 → P5 → P4 → P6 → P7

Rationale: variables first (everything propagates), then tailwind audit, then footer (visible high-impact), newsletter (low-risk), hero (most complex), config sync (trivial), honey cleanup last (grep-driven, catches stragglers).

## Validation After Each Phase

- `pnpm typecheck` → clean
- `pnpm lint` → clean
- Visual smoke check after P3, P4, P5

## Out of Scope

- Per-character `accentColor` overhaul in `characters.json`
- Reusable `<Container>` extraction
- Logo asset re-tinting
- Dark-mode variants
- Typography or animation changes

## Dependencies

None. All prior plans are completed.
