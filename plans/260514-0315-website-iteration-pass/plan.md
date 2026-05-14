---
title: Website Iteration Pass — Yellow Anchor + Section Polish
description: >-
  Anchor the brand around yellow #ffd70c. Navbar → hero text zone →
  FeatureBanner → newsletter all wear yellow; cyan stays as quiet canvas. Plus 6
  section refinements (Shop button, View All labels, Say hi to Max single-line,
  Character Showcase magazine layout, etc.).
status: completed
priority: P2
branch: ''
tags:
  - design-system
  - navbar
  - hero
  - homepage
  - polish
blockedBy: []
blocks: []
created: '2026-05-13T20:15:15.520Z'
createdBy: 'ck:plan'
source: skill
---

# Website Iteration Pass — Yellow Anchor + Section Polish

## Overview

Iteration on the just-shipped color system. User feedback after seeing the cyan-everywhere result: it feels cold. Solution — make yellow `#ffd70c` the branding spine (navbar, hero text zone, FeatureBanner middle, newsletter). Cyan becomes a quiet supporting canvas between yellow moments.

7 atomic phases, risk-sorted easy → hard.

**Source brainstorm:** `plans/reports/brainstorm-260514-0304-website-iteration-pass.md`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Navbar Yellow + Shop Button](./phase-01-navbar-yellow-shop-button.md) | Completed |
| 2 | [Newsletter Heading](./phase-02-newsletter-heading.md) | Completed |
| 3 | [FeatureBanner CTA](./phase-03-featurebanner-cta.md) | Completed |
| 4 | [Pack Leader Single Line](./phase-04-pack-leader-single-line.md) | Completed |
| 5 | [Menu Cards View All](./phase-05-menu-cards-view-all.md) | Completed |
| 6 | [Hero Yellow Zones](./phase-06-hero-yellow-zones.md) | Completed |
| 7 | [Character Showcase Redesign](./phase-07-character-showcase-redesign.md) | Completed |

## Execution Order

Sequential as numbered. P2–P5 are quick text/style edits, P6 touches the hero (3rd revision — converge this time), P7 is the biggest (new sub-component + layout).

## Validation After Each Phase

- `pnpm typecheck` clean
- `pnpm lint` clean
- Visual smoke at desktop / mobile after P1, P6, P7

## Out of Scope

- Logo asset re-tinting
- Footer changes
- New animations / motion design
- Additional character artwork
- Dark-mode

## Dependencies

Builds on completed plan `260514-0213-color-system-and-hero-rework` (palette + letterbox baseline). No blockers.
