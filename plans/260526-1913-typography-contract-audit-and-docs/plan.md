---
title: Typography Contract Documentation and Audit
description: >-
  Document the Surface → Text Color Contract in code-standards.md. Audit the
  codebase for violations (yellow text on light bg, blue text on navy, etc.) and
  fix any found. Lightweight enforcement — no new abstraction.
status: completed
priority: P2
branch: main
tags:
  - docs
  - typography
  - audit
  - design-system
blockedBy:
  - 260526-1714-typography-v2-body-blue
  - 260526-1913-hero-navy-surfaces-yellow-titles
blocks: []
created: '2026-05-26T12:14:26.356Z'
createdBy: 'ck:plan'
source: skill
---

# Typography Contract Documentation and Audit

## Overview

Plan K of styling iteration 4. The Surface → Text Color Contract (yellow bg → blue text, blue bg → yellow text, light bg → ink-blue body, etc.) has been applied inconsistently across iterations. This plan:

1. **Documents** the contract clearly in `docs/code-standards.md` so future PRs can be reviewed against it.
2. **Audits** the codebase for any current violations and fixes them.

Lightweight enforcement — no new utility classes or wrapper components. Just a written contract + a one-time sweep.

**Brainstorm report:** [plans/reports/brainstorm-260526-1913-styling-iteration-4.md](../reports/brainstorm-260526-1913-styling-iteration-4.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Contract Doc and Codebase Audit](./phase-01-contract-doc-and-codebase-audit.md) | Completed |
| 2 | [Verification and Changelog](./phase-02-verification-and-changelog.md) | Completed |

## Dependencies

- **Blocked by:** `260526-1714-typography-v2-body-blue` (Plan D — base contract for body text)
- **Blocked by:** `260526-1913-hero-navy-surfaces-yellow-titles` (Plan J — hero contract additions; audit happens after J's hero surfaces are in place)

## Affected Files (summary)

- `docs/code-standards.md` — new "Surface → Text Color Contract" section
- ~10–20 component files (only those found to violate during audit)
- `docs/project-changelog.md` — entry

## Out of Scope

- Refactoring to wrapper components (would be a bigger effort — Plan K stays lightweight)
- Adding Tailwind plugin utilities (`.on-yellow`/`.on-blue`) — deferred
- Visual design changes (Plan J handles those for heroes; this is enforcement only)
