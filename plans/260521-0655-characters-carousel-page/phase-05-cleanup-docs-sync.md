---
phase: 5
title: "Cleanup & Docs Sync"
status: pending
priority: P2
effort: "3h"
dependencies: [4]
---

# Phase 5: Cleanup & Docs Sync

## Overview

Retire the now-unused immersive-scene components and bring project docs in line
with the new carousel-based `/characters` page.

## Requirements

- Functional: no dead imports; build + lint clean; `/characters/[slug]` unaffected.
- Non-functional: docs accurate; changelog + roadmap updated.

## Architecture

After Phases 1–4, `app/characters/page.tsx` no longer imports `CharacterScene`.
Confirm via grep that `character-scene.tsx` and `character-scene-figure.tsx`
have no remaining importers, then delete. Keep `character-scene-backdrop.tsx`,
`character-scene-decor.tsx`, `character-scene-data.ts` — reused by the carousel.

## Related Code Files

- Delete: `components/characters/character-scene.tsx`.
- Delete: `components/characters/character-scene-figure.tsx`.
- Delete (only if confirmed unused): `components/characters/character-scene-foreground.tsx`.
- Modify: `docs/codebase-overview.md` — update Characters section + folder notes.
- Modify: `docs/project-changelog.md` — add carousel-page entry.
- Modify: `docs/development-roadmap.md` — update characters milestone status.
- Read for context: all `app/characters/**`, `components/characters/**`.

## Implementation Steps

1. Grep the repo for imports of `character-scene`, `CharacterScene`,
   `CharacterSceneFigure`, `CharacterSceneForeground` — confirm only the deleted
   files / each other reference them.
2. Delete `character-scene.tsx` + `character-scene-figure.tsx`. Delete
   `character-scene-foreground.tsx` if it has no consumer; otherwise keep.
3. Run typecheck + `pnpm build` — confirm no broken imports.
4. `docs/codebase-overview.md`: rewrite the Characters components/route lines to
   describe the carousel page, detail card, `?pup=` deep-linking; note retained
   `[slug]` pages and reused decor primitives.
5. `docs/project-changelog.md`: add dated entry — "Characters page redesigned as
   cinematic coverflow carousel with inline detail cards".
6. `docs/development-roadmap.md`: update the characters milestone/progress.
7. Final full smoke test of `/characters` and one `/characters/[slug]` page.
8. (Optional) delegate `code-reviewer` over the new components.

## Success Criteria

- [ ] `character-scene.tsx` + `character-scene-figure.tsx` deleted; no dead imports.
- [ ] `pnpm build` + lint pass clean.
- [ ] `/characters/[slug]` pages still build and render correctly.
- [ ] `codebase-overview.md`, `project-changelog.md`, `development-roadmap.md` updated.

## Risk Assessment

- A scene file may be referenced somewhere unexpected (e.g. a `[slug]` page or
  home) — grep first, never delete blind. If a kept file (backdrop/decor/data)
  turns out unused too, delete it as well to avoid dead code.
