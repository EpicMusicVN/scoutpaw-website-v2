---
phase: 4
title: Validation and Docs
status: completed
priority: P2
effort: 1.5h
dependencies:
  - 2
  - 3
---

# Phase 4: Validation and Docs

## Overview

Verify the full-screen scene + detail-page changes build clean, behave across
breakpoints, and meet a11y/perf bars. Update docs.

## Requirements

- Functional: full build passes; `/characters` + all 5 `/characters/[slug]`
  routes still generate.
- Non-functional: no CLS, AA contrast, reduced-motion respected, LCP-safe,
  smooth scroll on the enriched scene.
- Docs: `codebase-overview.md` + `project-changelog.md` reflect iteration #6.

## Related Code Files

- Modify: `docs/codebase-overview.md`
- Modify: `docs/project-changelog.md`

## Implementation Steps

1. `npx tsc --noEmit` — zero errors.
2. `npx next lint` — zero errors/warnings on changed files.
3. `npx next build` — succeeds; `/characters` + 5 detail routes generated.
4. Responsive QA (local) — `/characters` at 320 / 375 / 768 / 1024 / 1440 /
   1920px: scene fills the viewport, no horizontal overflow, characters large +
   balanced (desktop) / staggered column (mobile), no faces hidden by overlap.
5. Interaction QA — hover/focus reveals names smoothly (no CLS); names never
   appear on touch; foreground does not block character clicks; Buddy shows
   `corgi2`.
6. Detail-page QA — no "From the ScoutPaw Network" block; title badge present;
   back button rebalanced; page ends cleanly.
7. a11y — exactly one `<h1>` on `/characters`; keyboard nav + visible focus
   rings; decorative layers `aria-hidden`; AA contrast on heading + badge.
8. Perf — only Max + Buddy poses `priority`; rest lazy; no CLS; scene scroll
   stays smooth with the enriched backdrop (blur/animation budget OK).
9. Reduced-motion — all drift/float/twinkle stilled under
   `prefers-reduced-motion`.
10. Update `codebase-overview.md` (new `character-scene-foreground`, removed
    `character-channel-callout`) + add a `project-changelog.md` entry for
    iteration #6.
11. Mark plan phases complete via `ck plan check`.

## Success Criteria

- [x] `tsc`, `next lint`, `next build` all clean.
- [x] `/characters` + 5 detail routes generate; no console errors.
- [x] Full-screen scene holds at every tested breakpoint; no overflow / no CLS.
- [x] Hover/focus names work; hidden on touch; foreground click-through OK.
- [x] Detail pages: callout gone, badge intact, layout rebalanced.
- [x] One `<h1>`; keyboard nav + focus rings; AA contrast; reduced-motion safe.
- [x] Docs updated.

## Risk Assessment

- **Perf regression** — the enriched backdrop adds blurred/animated layers;
  watch for scroll jank, especially mobile — trim element count if needed.
- **Static params** — confirm the detail-page changes don't affect
  `generateStaticParams`; the build step catches regressions.
- **No live prod URL** — QA limited to local `next build` + dev server.
