---
title: ScoutPaw Website Redesign — Bluey-Inspired Cinematic Direction
description: >-
  Component-level overhaul of Home/Shop/Watch. Cinematic scale + playful sticker
  layouts + atmospheric continuity. Keep cream/honey identity. Mock Watch data
  with future-proof shape. Tasteful framer-motion choreography.
status: completed
priority: P2
branch: ''
tags:
  - redesign
  - ux
  - nextjs
  - tailwind
  - framer-motion
blockedBy: []
blocks: []
created: '2026-05-08T03:56:28.065Z'
createdBy: 'ck:plan'
source: skill
---

# ScoutPaw Website Redesign — Bluey-Inspired Cinematic Direction

## Overview

Site reads small + flat against the brief. This redesign scales up sections, introduces playful staggered layouts (Bluey *spirit*, not clone), restructures Watch IA from episodic-show framing to YouTube-streaming framing, and adds atmospheric continuity (floating decoratives, section-edge curves) — all while keeping the warm cream/honey/gold identity intact and the existing tech stack untouched.

**Source brainstorm:** [../reports/brainstorm-260508-1054-website-redesign.md](../reports/brainstorm-260508-1054-website-redesign.md)

## Stack

Next.js 15 App Router · React 19 · TypeScript · Tailwind 3 · framer-motion 12 · existing `/api/newsletter` route · existing Shopify Storefront client. **No new dependencies.**

## Strategy

- Component-level overhaul (~70% UI surface) — keep tokens, content layer, motion lib, fonts
- Cream/honey base preserved; sky-blue used only as section accent (never dominant)
- Watch data: rich mock JSON with adapter pattern in `lib/content` → API swap is content-layer-only
- Motion: parallax + scroll reveals + hover variants, all `prefers-reduced-motion` aware

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Foundation](./phase-01-foundation.md) | Completed | ~1.5d |
| 2 | [Home Redesign](./phase-02-home-redesign.md) | Completed | ~2d |
| 3 | [Shop Redesign](./phase-03-shop-redesign.md) | Completed | ~1.5d |
| 4 | [Watch IA + Data](./phase-04-watch-ia-data.md) | Completed | ~2d |
| 5 | [Polish + QA](./phase-05-polish-qa.md) | Completed | ~1d |

Total est: ~8 dev-days.

## Dependencies

- P2 depends on P1 (atmosphere + tokens land first)
- P3 depends on P1 (shares hero zoning + atmosphere component)
- P4 depends on P1 (atmosphere) + can run parallel to P2/P3 once schema lands
- P5 depends on P1–P4 (final QA pass)

## Success Metrics

- Lighthouse mobile: Perf ≥ 85, A11y ≥ 95, Best Practices ≥ 95
- Axe DevTools: zero AA violations on body text
- LCP ≤ 2.5s on 4G mobile (hero image)
- Watch adapter test: swap mock JSON → API stub returns same shape, zero UI changes

## Risks

- Mobile parallax/atmospherics perf → guard with `<md` opt-out + GPU-only transforms
- Bluey-clone perception → keep cream dominant; sky-blue as accent only
- Asset gaps for Shop hero (product context shoot) → flag in P3, can ship w/ existing image
