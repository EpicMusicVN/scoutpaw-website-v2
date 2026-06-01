---
title: Heading Typography System and VIP Footer Spacing
description: >-
  Define a 3-color heading contract (blue/yellow/white) with gradient utilities
  and readability protections. Restricted to headings + accent text — body stays
  dark ink for AA readability. Includes trivial VIP card → footer spacing bump.
status: completed
priority: P2
branch: main
tags:
  - frontend
  - ui
  - typography
  - design-system
  - globals
blockedBy: []
blocks:
  - 260526-1605-characters-cinematic-cards
created: '2026-05-26T09:10:53.241Z'
createdBy: 'ck:plan'
source: skill
---

# Heading Typography System and VIP Footer Spacing

## Overview

Plan A of the website styling overhaul. Foundation for Plans B and C.

**Two deliverables:**
1. **Heading color contract** — restrict heading text to navy/yellow/white with gradient utilities and `text-shadow-soft` readability protection. Body text stays untouched (dark ink on light, white on navy) — preserves WCAG AA across all surfaces.
2. **VIP→footer spacing bump** — `pb-16 md:pb-20` → `pb-28 md:pb-36` on the newsletter card.

**Scope discipline:** apply heading style to landmark h1/h2 sites first (heroes + section titles on home/characters/watch/shop/top-picks). Defer h3/kickers/labels until live review confirms direction.

**Brainstorm report:** [plans/reports/brainstorm-260526-1605-website-styling-overhaul.md](../reports/brainstorm-260526-1605-website-styling-overhaul.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Tokens and Utilities](./phase-01-tokens-and-utilities.md) | Completed |
| 2 | [Apply Heading Styles](./phase-02-apply-heading-styles.md) | Completed |
| 3 | [VIP Spacing and Verification](./phase-03-vip-spacing-and-verification.md) | Completed |

## Dependencies

- **Blocks:** `260526-1605-characters-cinematic-cards` (Plan B uses the gradient utility on character name h2)

## Affected Files (summary)

- `app/globals.css` — new utility classes
- `tailwind.config.ts` — confirm `text-brand-primary` / `text-navy` tokens render correctly (already wired)
- ~15–25 component files — selective h1/h2 swaps on landmark surfaces
- `components/home/newsletter-cta.tsx` — bottom padding bump
- `docs/project-changelog.md` — entry

## Out of Scope

- Body-text color changes (would break readability — confirmed by user)
- Touching all 133 `font-display` sites (only landmark h1/h2 — others sweep in follow-up)
- Footer heading color overhaul (already uses `#fffbe6` — align to token only if cheap)
- Animated text effects (not requested; YAGNI)
