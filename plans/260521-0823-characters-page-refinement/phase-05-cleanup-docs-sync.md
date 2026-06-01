---
phase: 5
title: "Cleanup & Docs Sync"
status: completed
priority: P2
effort: "1.5h"
dependencies: [4]
---

# Phase 5: Cleanup & Docs Sync

## Overview

Delete the scene-backdrop files left unused after the background removal, and
sync project docs to the refined Characters page.

## Requirements

- Functional: no dead imports; build + lint clean; `/characters/[slug]` unaffected.
- Non-functional: docs accurate.

## Architecture

After Phase 2, nothing renders `CharacterSceneBackdrop`. Confirm via grep, then
delete `character-scene-backdrop.tsx` and `character-scene-data.ts` (the latter
is used only by the backdrop). Keep `character-scene-decor.tsx` — still used by
`character-detail-card.tsx` and the Phase 2 ambient decor.

## Related Code Files

- Delete: `components/characters/character-scene-backdrop.tsx`, `components/characters/character-scene-data.ts`.
- Modify: `docs/codebase-overview.md`, `docs/project-changelog.md` — reflect the refinement.
- Read for context: all `components/characters/**`, `app/characters/**`.

## Implementation Steps

1. Grep for `CharacterSceneBackdrop`, `character-scene-backdrop`, `character-scene-data`
   — confirm zero remaining importers.
2. Delete `character-scene-backdrop.tsx` + `character-scene-data.ts`.
3. Confirm `character-scene-decor.tsx` still has importers (detail card + ambient); keep it.
4. Run `pnpm typecheck` + `pnpm lint` + `pnpm build` — no broken imports.
5. `docs/codebase-overview.md`: update the Characters component/route notes —
   FullBleedHero on `/characters`, 3-up coverflow, calm cards, arrows-only,
   site-blended background, removed backdrop files.
6. `docs/project-changelog.md`: add a dated entry (2026-05-21) for the refinement.
7. Final smoke test: `/characters` (hero, 3-up carousel, open/close) and one
   `/characters/[slug]` page.

## Success Criteria

- [ ] `character-scene-backdrop.tsx` + `character-scene-data.ts` deleted; no dead imports.
- [ ] `pnpm build` + lint + typecheck pass clean.
- [ ] `/characters/[slug]` pages still build and render.
- [ ] `codebase-overview.md` + `project-changelog.md` updated.

## Risk Assessment

- Grep before deleting — never delete blind. If `character-scene-decor.tsx` turns
  out unused too (e.g. ambient decor was inlined differently), delete it as well
  to avoid dead code.
