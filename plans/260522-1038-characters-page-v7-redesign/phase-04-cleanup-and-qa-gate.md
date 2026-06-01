---
phase: 4
title: "Cleanup and QA Gate"
status: completed
priority: P2
effort: "1.5h"
dependencies: [1, 2, 3]
---

# Phase 4: Cleanup and QA Gate

## Overview

Remove the now-dead `compact` prop from `CharacterQuote`, then run the BLOCKING
quality gate (typecheck, lint, browser QA) and sync documentation.

## Requirements

- Functional: `CharacterQuote` has no `compact` prop; the detail view's quote
  still renders correctly; all checks pass.
- Non-functional: docs reflect the v7 design.

## Architecture

The v6 carousel card used `CharacterQuote compact`. The v7 card (Phase 2) shows
only name + tagline — no quote — so the `compact` variant has zero consumers.
The detail card (Phase 3) uses the full `CharacterQuote`. Removing `compact`
reverts `character-quote.tsx` to a single rendering. `pnpm build` is unreliable
(concurrent dev server holds `.next`) — typecheck + lint + a live render check
are the gate.

## Related Code Files

- Modify: `components/characters/character-quote.tsx` (remove `compact`)
- Modify: `docs/codebase-overview.md`, `docs/project-changelog.md`,
  `docs/development-roadmap.md`

## Implementation Steps

1. **`character-quote.tsx`** — remove the `compact?: boolean` prop and the
   conditional class branches; restore the single (full) rendering. Grep the
   repo first to confirm no remaining `compact` usage (Phase 2 should have
   dropped the card's quote entirely).
2. **Checks (BLOCKING):**
   - `pnpm typecheck` — clean
   - `pnpm lint` — clean
   - `pnpm build` only if `.next` is free; otherwise record as deferred and
     rely on the live render check.
3. **Browser QA** (`/characters`, against the dev server):
   - Carousel: Max anchored first; `loop:false` (prev arrow disabled at start,
     next disabled at end); 3 cards; edge dissolve; click-to-open.
   - Card: character pose dominates + stands on a small solid signature-color
     nameplate; name + tagline only; text is readable (AA) on all 5 characters
     — explicitly check Oscar (dark brown) and the light ones (Max/Bella).
   - Detail: floating card — rounded, soft shadow, layered depth, cinematic
     spacing; themed wash + drifting decor behind; artwork breaks the frame;
     Back + Escape + `?pup=` work.
   - Transition: layered cinematic carousel↔detail; no layout jump.
   - Responsive desktop / tablet / mobile; reduced-motion honored.
4. Tune flagged values (nameplate height ratio, pose overlap, luminance
   threshold, card max-width) — keep edits minimal.
5. **Docs sync:**
   - `docs/codebase-overview.md` — update the Characters carousel section to v7
     (Max-anchored loop-off carousel, dominant-character cards on solid-color
     nameplates, floating detail card).
   - `docs/project-changelog.md` — new dated entry (2026-05-22).
   - `docs/development-roadmap.md` — note the v7 redesign.

## Success Criteria

- [ ] `compact` prop removed from `CharacterQuote`; no references remain;
      detail quote still renders
- [ ] `pnpm typecheck` + `pnpm lint` pass (build run or explicitly deferred)
- [ ] Browser QA checklist passes on desktop / tablet / mobile
- [ ] Auto-contrast text verified AA on all 5 characters
- [ ] `codebase-overview.md`, `project-changelog.md`, `development-roadmap.md`
      updated to v7

## Risk Assessment

- **Dangling `compact` reference** → grep before removing; Phase 2 must have
  dropped the card's quote first (hence this phase depends on Phase 2).
- **QA tuning** → nameplate ratio / overlap / luminance threshold are left for
  in-browser tuning by design; keep tuning edits small.
- **Build deferred** → environmental (dev server); document, do not treat as a
  code failure.
