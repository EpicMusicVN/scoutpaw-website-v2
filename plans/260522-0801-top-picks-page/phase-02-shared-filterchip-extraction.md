---
phase: 2
title: "Shared FilterChip Extraction"
status: completed
priority: P2
effort: "0.5h"
dependencies: []
---

# Phase 2: Shared FilterChip Extraction

## Overview

Extract the `FilterChip` presentational component (currently a local function
in `explore-videos.tsx`) into a shared `components/ui/filter-chip.tsx` so the
Watch page and the new Top Picks board use one chip — DRY. Independent of
Phase 1; can run in parallel.

## Requirements

- Functional: Watch page category filtering behaves identically after the swap.
- Non-functional: zero behavioural/visual change; pure relocation.

## Architecture

`FilterChip` is a ~20-line stateless presentational component (`active`,
`onClick`, `children` props). Moving it to `components/ui/` makes it a shared
primitive alongside `button.tsx`, `card.tsx`, etc. The toggle-group semantics
(`aria-pressed`) live on the chip; the owning section supplies `role="group"`.

## Related Code Files

- Create: `components/ui/filter-chip.tsx`
- Modify: `components/watch/explore-videos.tsx` (remove local `FilterChip`,
  import shared one)

## Implementation Steps

1. Create `components/ui/filter-chip.tsx` — copy the `FilterChip` function from
   `explore-videos.tsx` **verbatim** (same classNames, same `aria-pressed`,
   same focus-ring). Export as a named export. Keep `"use client"` only if
   needed — it has no hooks, so it can stay server-safe; the `onClick` is
   supplied by the client parent. Omit `"use client"`.
2. In `components/watch/explore-videos.tsx`:
   - Delete the local `function FilterChip(...)` definition.
   - Add `import { FilterChip } from "@/components/ui/filter-chip";`.
   - Leave all call sites unchanged.
3. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] `components/ui/filter-chip.tsx` exists, exports `FilterChip`
- [ ] `explore-videos.tsx` imports the shared chip, no local definition remains
- [ ] No className/markup diff vs the original chip
- [ ] `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Watch page regression** → pure copy-move of a stateless component; verify
  Watch filter chips still toggle in the Phase 5 QA gate.
