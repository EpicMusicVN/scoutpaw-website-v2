---
phase: 4
title: Validation and Docs
status: completed
priority: P2
effort: 2h
dependencies:
  - 2
  - 3
---

# Phase 4: Validation and Docs

## Overview

Verify the rebuilt Characters page + detail pages build clean, behave correctly
across breakpoints, and meet a11y/perf bars. Reconcile docs left stale across
the 5 Characters-page iterations.

## Requirements

- Functional: full build passes; all 5 detail routes still statically generate.
- Non-functional: no CLS, AA contrast, reduced-motion respected, LCP-safe.
- Docs: `codebase-overview.md` + `project-changelog.md` reflect the final state.

## Architecture

Validation only — no new components. `app/characters/[slug]/page.tsx` keeps
`generateStaticParams`, so confirm all 5 slugs still prerender.

## Related Code Files

- Modify: `docs/codebase-overview.md`
- Modify: `docs/project-changelog.md`
- Modify: `docs/development-roadmap.md` (if it tracks the Characters page)

## Implementation Steps

1. `npx tsc --noEmit` — zero errors.
2. `npx next lint` — zero errors/warnings on changed files.
3. `npx next build` — succeeds; confirm `/characters` + all 5 `/characters/[slug]`
   routes are generated.
4. Responsive QA (local) — `/characters` at 320 / 375 / 768 / 1024 / 1440px:
   no horizontal overflow, scene layout holds, labels legible, hover/focus work.
5. a11y check — exactly one `<h1>` on `/characters`; figures keyboard-focusable
   in logical order with visible focus ring; decorative layers `aria-hidden`;
   verify AA contrast on scene labels + channel badge.
6. Reduced-motion — with `prefers-reduced-motion: reduce`, drift/float/glow
   animations are stilled (global reset covers this — confirm).
7. Perf — confirm only 1–2 scene images use `priority`; rest lazy; no CLS.
8. Reconcile docs: update `codebase-overview.md` (new components, removed
   carousel) + add a `project-changelog.md` entry for the immersive redesign;
   update roadmap status if applicable.
9. Mark plan phases complete via `ck plan check`.

## Success Criteria

- [x] `tsc`, `next lint`, `next build` all clean.
- [x] `/characters` + 5 detail routes generate; no console errors.
- [x] No horizontal overflow / no CLS at any tested breakpoint.
- [x] One `<h1>`; keyboard nav + focus rings work; AA contrast holds.
- [x] Reduced-motion stills all animation.
- [x] `codebase-overview.md` + `project-changelog.md` updated.

## Risk Assessment

- **Static params** — removing the hero must not affect `[slug]` generation;
  the build step catches regressions.
- **Docs drift** — docs are 5 iterations stale; reconcile to the *final* state
  only, don't document discarded carousel iterations.
- **No live prod URL** — QA limited to local `next build` + dev server.
