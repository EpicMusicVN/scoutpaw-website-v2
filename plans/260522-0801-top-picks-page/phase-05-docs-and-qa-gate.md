---
phase: 5
title: "Docs and QA Gate"
status: completed
priority: P2
effort: "1h"
dependencies: [3, 4]
---

# Phase 5: Docs and QA Gate

## Overview

Sync project documentation and run the BLOCKING quality gate: build, lint,
typecheck, and manual browser QA (including a Watch-page regression check from
the Phase 2 FilterChip extraction).

## Requirements

- Functional: docs reflect the new route/components/content; all checks pass.
- Non-functional: a11y + responsive parity with `/shop`.

## Architecture

Documentation per `documentation-management.md`: update overview, changelog,
roadmap. QA gate is the last line of defense before the page is considered done.

## Related Code Files

- Modify: `docs/codebase-overview.md`
- Modify: `docs/project-changelog.md`
- Modify: `docs/development-roadmap.md`

## Implementation Steps

1. **`docs/codebase-overview.md`** — add: `/top-picks` route under the app
   folder tree; `components/top-picks/` (TopPicksBoard, DealBlock, OfferCard);
   `components/ui/filter-chip.tsx` shared primitive; `content/top-picks.json`;
   `getTopPicks()` adapter method; the new `TOP_PICK_*` schema exports.
2. **`docs/project-changelog.md`** — new dated entry: "Top Picks page — curated
   favourites with category chips + accordion Deal Block + offer cards; new
   JSON content type; shared FilterChip extracted."
3. **`docs/development-roadmap.md`** — mark the Top Picks page item
   delivered / update progress + status.
4. **QA gate (BLOCKING)** — all must pass:
   - `pnpm lint` — clean
   - `pnpm typecheck` — clean
   - `pnpm build` — succeeds, `/top-picks` in route manifest
   - Browser QA on `/top-picks`:
     - responsive desktop / tablet / mobile — no overflow, no layout shift
     - chips filter correctly; `All` resets; keyboard-operable; focus rings
       visible; `aria-pressed` toggles
     - Deal Block opens/closes; `aria-expanded` flips; chevron rotates;
       accordion smooth
     - chip click while collapsed auto-expands the grid
     - offer-card CTA opens external storefront in a new tab
     - `prefers-reduced-motion` — transitions neutralized
   - **Regression:** `/watch` Explore Videos filter chips still toggle (shared
     FilterChip swap from Phase 2)
   - Optional: Lighthouse a11y/perf spot-check vs `/shop`

## Success Criteria

- [ ] `codebase-overview.md`, `project-changelog.md`, `development-roadmap.md`
      updated
- [ ] `pnpm lint` + `pnpm typecheck` + `pnpm build` all pass
- [ ] Browser QA checklist passes on desktop/tablet/mobile
- [ ] `/watch` filter chips confirmed working (no regression)

## Risk Assessment

- **QA finds a defect** → fix in the relevant phase's files, re-run the gate;
  do not mark the plan complete with a failing gate.
- **Doc drift** → docs updated in the same phase as the QA gate so they reflect
  the shipped state.
