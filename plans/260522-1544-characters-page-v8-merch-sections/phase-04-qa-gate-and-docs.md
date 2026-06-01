---
phase: 4
title: "QA Gate and Docs"
status: pending
priority: P2
effort: "1.5h"
dependencies: [3]
---

# Phase 4: QA Gate and Docs

## Overview

Final BLOCKING quality gate for the v8 Characters redesign — typecheck, lint,
browser QA across breakpoints — plus a documentation sync.

## Requirements

- Functional: all checks pass; the page behaves per the success criteria.
- Non-functional: docs reflect the v8 character-merch-section design.

## Architecture

No new code. `pnpm build` may be blocked by a concurrent dev server holding
`.next` (cache contention — environmental); typecheck + lint + a live render
check are the authoritative gates. Docs per `documentation-management.md`.

## Related Code Files

- Modify: `docs/codebase-overview.md`, `docs/project-changelog.md`,
  `docs/development-roadmap.md`

## Implementation Steps

1. **Checks (BLOCKING):**
   - `pnpm typecheck` — clean
   - `pnpm lint` — clean
   - `pnpm build` if `.next` is free; otherwise note as deferred and rely on
     the live render check.
2. **Browser QA** (`/characters`, against the dev server):
   - Page is a scroll-through of 5 character sections; Max first.
   - Each section: character visual + name + short description + 2 merch cards +
     "Shop Collection" CTA + "Read full story" link.
   - Sections alternate sides (zig-zag); each themed to its character; merch
     reads as part of the character's world (not a separate store strip).
   - Merch cards + CTA open the external storefront in a new tab.
   - "Read full story" links navigate to `/characters/[slug]`.
   - Section `id` anchors work (`/characters#max`).
   - Responsive desktop / tablet / mobile — 2-col → stacked, no overflow.
   - `prefers-reduced-motion` honored; AA contrast on the themed washes.
   - No console errors; the deleted carousel left nothing broken.
3. Tune any flagged values (section sizing, wash opacity, merch tile tint) —
   keep edits minimal.
4. **Docs sync:**
   - `docs/codebase-overview.md` — replace the Characters carousel section with
     the v8 model (per-character merch sections; `products`/`merchCtaHref` on
     the character schema; `CharacterSection` + `CharacterMerchCard`; the
     carousel/detail components removed).
   - `docs/project-changelog.md` — new dated entry (2026-05-22).
   - `docs/development-roadmap.md` — note the v8 redesign.

## Success Criteria

- [ ] `pnpm typecheck` + `pnpm lint` pass (build run or explicitly deferred)
- [ ] Browser QA checklist passes on desktop / tablet / mobile
- [ ] Merch + story-link navigation verified; section anchors work
- [ ] Reduced-motion + AA contrast verified
- [ ] `codebase-overview.md`, `project-changelog.md`, `development-roadmap.md`
      updated to v8

## Risk Assessment

- **QA finds tuning needs** → section sizing / wash opacity left for in-browser
  tuning by design; keep tuning edits small.
- **Build blocked by dev server** → environmental; document as deferred, not a
  code failure.
