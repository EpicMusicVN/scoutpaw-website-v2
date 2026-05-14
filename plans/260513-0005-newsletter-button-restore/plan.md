---
title: Newsletter Button Restore — Dark Variant + Envelope Icon
description: >-
  Restore the navbar Newsletter CTA as a Button matching Shop's structural spec
  (size=lg). Use variant=dark (navy + white + cta-shimmer) to preserve hierarchy
  vs Shop's primary gold. Adds an outline envelope SVG.
status: completed
priority: P2
branch: ''
tags:
  - nav
  - ui
  - button
  - polish
blockedBy: []
blocks: []
created: '2026-05-12T17:08:20.344Z'
createdBy: 'ck:plan'
source: skill
---

# Newsletter Button Restore — Dark Variant + Envelope Icon

## Overview

Reverse the prior session's text-link change. Newsletter CTA returns to a Button with identical structural spec to Shop (size=lg gives same height/padding/radius/font/hover via Button base + size class), but uses `variant="dark"` (navy + white + cta-shimmer) to keep Shop=primary, Newsletter=secondary hierarchy intact. Includes inline envelope SVG icon.

**Brainstorm:** [reports/brainstorm-260513-0005-newsletter-button-restore.md](../reports/brainstorm-260513-0005-newsletter-button-restore.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Navbar Edit](./phase-01-navbar-edit.md) | Completed |
| 2 | [Typecheck + Lint](./phase-02-typecheck-lint.md) | Completed |

## Key Decisions (Locked)

- Newsletter Button: `variant="dark"` `size="lg"` — navy bg + white text + cta-shimmer + shadow-cozy
- Icon: 18×18 outline envelope SVG, lucide-style, `stroke="currentColor"`
- Button text: "Newsletter" (one word, matches Shop's terseness)
- Responsive: keep `hidden md:inline-flex`; both Shop + Newsletter stay lg across md+
- No new Button variants, no new sizes, no changes to `button.tsx`

## Dependencies

None. Previous plans `260512-2209-asset-refresh-home-logo` and `260512-2338-navbar-footer-polish` are completed.

## Success Criteria (Plan-level)

- Newsletter renders as a Button (not a Link)
- Identical to Shop in: height (48px), padding, border-radius (full), font, focus-ring, active-scale, hover-shadow lift
- Navy fill + white text/icon (`variant="dark"`)
- Icon ↔ text spacing handled by Button base `gap-2` (no manual spacing)
- Mobile (<768px) unchanged — button hidden, hamburger handles nav
- `pnpm typecheck` + `pnpm lint` clean
- Visual QA at 768/1024/1440 confirms layout fits

## Out of Scope

- Shop button (unchanged)
- Footer, mobile menu, button.tsx component itself
- Newsletter section on home page (target unchanged)
