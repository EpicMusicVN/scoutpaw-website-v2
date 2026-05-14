---
phase: 4
title: Typecheck + Lint
status: completed
priority: P1
effort: 5m
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Typecheck + Lint

## Overview

Final validation gate. `pnpm typecheck` + `pnpm lint`. User visual QA on dev server at 360/768/1024/1440.

## Requirements

- `tsc --noEmit` exits 0
- `next lint` exits 0
- No new ESLint `react/no-unescaped-entities` warnings on the new hero copy (apostrophes / em-dash)

## Architecture

No code changes — validation only.

## Related Code Files

- None modified

## Implementation Steps

1. `pnpm typecheck` — verify FullBleedHero prop types still accepted, MenuCard restructure compiles, Card type minus `rotate` field doesn't break any consumer.

2. `pnpm lint` — verify:
   - No `react/no-unescaped-entities` warnings on apostrophes in description copy. If flagged, fix by:
     - Replace `'` with `&apos;` in JSX text, OR
     - Wrap description in JSX expression: `description={"...we're..."}` (already passed via prop value — string literal in JS expression, not JSX text, so should not trigger the rule)
   - Em-dash `—` is valid Unicode in JS string literal, no escape needed
   - No unused-vars warnings on removed `rotate` field

3. Report results.

4. User-driven visual QA at 360 / 768 / 1024 / 1440 viewports (not blocking this phase).

## Success Criteria

- [x] `pnpm typecheck` exits 0.
- [x] `pnpm lint` exits 0.
- [x] Plan status: 4/4 phases done.

## Risk Assessment

- **Risk:** ESLint `react/no-unescaped-entities` triggers on apostrophes in JSX prop string values.
  - **Mitigation:** Apostrophes inside a string passed as a prop value (in JS, not JSX text) typically aren't flagged. If flagged, swap to `&apos;` or to a JSX expression. Quick fix.
- **Risk:** Removing `rotate` field from Card type breaks something elsewhere (unlikely — used only inside this file).
  - **Mitigation:** Grep `card.rotate` to verify no external consumer.
