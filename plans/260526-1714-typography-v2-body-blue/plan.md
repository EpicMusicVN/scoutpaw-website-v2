---
title: 'Typography v2: Darker Blue Body and Surface Contract'
description: >-
  Replace brown ink body text with deep navy #1a3a5c across the codebase. Codify
  surface→text contract (yellow bg → blue text, blue bg → yellow text). Navbar
  adopts new body blue. Builds on Plan A's heading system.
status: completed
priority: P2
branch: main
tags:
  - frontend
  - ui
  - typography
  - design-system
  - globals
  - sweep
blockedBy:
  - 260526-1605-typography-system-and-vip-spacing
blocks: []
created: '2026-05-26T10:15:54.388Z'
createdBy: 'ck:plan'
source: skill
---

# Typography v2: Darker Blue Body and Surface Contract

## Overview

Iteration 2 on the typography system after Plan A. Plan A handled headings (navy h2, tri-gradient h1) but left body text on dark-brown `text-ink`. This plan completes the blue/yellow/white contract by moving body text to a new `--ink-blue` (#1a3a5c) token.

**Three phases:**
1. Add `--ink-blue` token + Tailwind wiring
2. Sweep body text usages (`text-ink`, `text-warm-text`, `text-warm-muted` → `text-ink-blue` / `text-ink-blue/70`)
3. Navbar (uses same blue) + verification + changelog

**Brainstorm report:** [plans/reports/brainstorm-260526-1714-styling-iteration-2.md](../reports/brainstorm-260526-1714-styling-iteration-2.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Tokens and Tailwind Wiring](./phase-01-tokens-and-tailwind-wiring.md) | Completed |
| 2 | [Body Text Sweep](./phase-02-body-text-sweep.md) | Completed |
| 3 | [Navbar and Verification](./phase-03-navbar-and-verification.md) | Completed |

## Dependencies

- **Blocked by:** `260526-1605-typography-system-and-vip-spacing` (Plan A — heading system established; this plan extends it)

## Affected Files (summary)

- `app/globals.css` — new `--ink-blue` token
- `tailwind.config.ts` — register `ink-blue` color via `withOpacity`
- ~36 component files — body text sweep (~130 line edits)
- `components/nav/nav-links.tsx`, `components/nav/mobile-nav.tsx` — navbar text color
- `docs/project-changelog.md` — entry

## Out of Scope

- Touching `bg-ink` (newsletter button stays dark)
- Touching `border-ink`, `ring-ink` (form input borders, focus rings stay anchored)
- Headings (already in Plan A)
- Cross-section refactors of yellow-surface components (rule documented but only applied where literal yellow bg exists)
