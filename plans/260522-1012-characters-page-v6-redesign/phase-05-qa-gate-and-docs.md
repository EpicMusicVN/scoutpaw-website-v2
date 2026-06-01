---
phase: 5
title: "QA Gate and Docs"
status: completed
priority: P2
effort: "1.5h"
dependencies: [4]
---

# Phase 5: QA Gate and Docs

## Overview

Final quality gate for the v6 Characters redesign — typecheck, lint, browser QA
across breakpoints — plus a documentation sync.

## Requirements

- Functional: all checks pass; the redesign behaves per the success criteria.
- Non-functional: docs reflect the v6 carousel/detail design.

## Architecture

No new code. `pnpm build` may be blocked by a concurrent dev server holding
`.next` (cache contention — environmental); typecheck + lint + a live
dev-server render check are the authoritative gates. Docs per
`documentation-management.md`.

## Related Code Files

- Modify: `docs/codebase-overview.md` (update the Characters carousel section to
  v6), `docs/project-changelog.md`, `docs/development-roadmap.md`

## Implementation Steps

1. **Checks (BLOCKING):**
   - `pnpm typecheck` — clean
   - `pnpm lint` — clean
   - `pnpm build` if `.next` is free; otherwise note it as deferred (concurrent
     dev server) and rely on the live render check.
2. **Browser QA** (`/characters`, against the dev server):
   - Carousel fills ~100vh; 3 cards fully visible, left-anchored; right edge
     dissolves (no hard boundary); infinite loop; prev/next arrows work.
   - Card: white content card + pose overlapping out the top; breed/name/
     tagline/clamped-bio/quote all render; click + keyboard open the detail.
   - Detail: ~100vh art-dominant split (artwork right); no prev/next; Back
     button + Escape close; `?pup=` deep-link + back-button.
   - Transition: layered cinematic push-in, no layout jump.
   - Responsive: desktop / tablet / mobile — no overflow, no clipping; detail
     split stacks on small screens.
   - `prefers-reduced-motion`: transitions/animation neutralized.
   - AA contrast on the white card text.
3. Tune any values flagged during QA (slide basis `31%`, mask gradient stops,
   card type scale) — keep changes minimal.
4. **Docs sync:**
   - `docs/codebase-overview.md` — update the Characters carousel description
     from v5 to v6 (left-anchored 3-card carousel, white content cards,
     art-dominant detail, layered transition; `use-carousel-fade.ts` removed).
   - `docs/project-changelog.md` — new dated entry (2026-05-22).
   - `docs/development-roadmap.md` — note the v6 redesign.

## Success Criteria

- [ ] `pnpm typecheck` + `pnpm lint` pass (build run or explicitly deferred)
- [ ] Browser QA checklist passes on desktop / tablet / mobile
- [ ] Reduced-motion verified; AA contrast verified
- [ ] `codebase-overview.md`, `project-changelog.md`, `development-roadmap.md`
      updated to v6

## Risk Assessment

- **QA finds tuning needs** → expected; basis %, mask stops, type scale are
  intentionally left for in-browser tuning. Keep tuning edits small.
- **Build blocked by dev server** → environmental; document as deferred, do not
  treat as a code failure.
