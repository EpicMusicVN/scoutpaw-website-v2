# Sync Report: Scroll Sun Fix — Global Fixed + Document Scroll
**Date:** 2026-05-13 | **Status:** DONE

## Completion Summary
All 4 phases locked as completed. Success criteria checkboxes ticked across all phase files (phase-01 through phase-04). No scope drift.

## Deliverables Verified
1. **components/home/scroll-sun.tsx** — Rewritten: useRef dropped, useScroll() tracks document (no args), single motion.div with `fixed` position, Y 0→400, X [0,0.5,1]→[0,40,-20], opacity fade [0,0.85,1]→[1,1,0.3].
2. **components/home/full-bleed-hero.tsx** — ScrollSun import + JSX removed.
3. **app/page.tsx** — ScrollSun imported + rendered at top of fragment.
4. **Typecheck/Lint** — Both clean (pnpm typecheck + pnpm lint exit 0).

## Docs Impact: MINOR
- **Changelog updated:** 2026-05-13 entry added to `docs/project-changelog.md`. Summarizes architecture reversal: hero-bound → global fixed, document scroll tracking, opacity fade near footer, visible across all sections.
- **Roadmap:** No milestone update needed (fix within P2 iteration, no timeline impact).
- **Codebase overview:** No changes required.

## Sync Checklist
- [x] Phase-01 success criteria ticked (7/7).
- [x] Phase-02 success criteria ticked (2/2).
- [x] Phase-03 success criteria ticked (4/4).
- [x] Phase-04 success criteria ticked (3/3).
- [x] Changelog entry added with date + architecture notes.
- [x] Plan marked completed (4/4 phases = 100%).

## Notes
Prior 260513-0134 plan (hero-bound sun) noted as superseded. No breaking changes to other components or pages. Sun remains hidden on mobile (`hidden md:block`), respects prefers-reduced-motion (static fallback).

**Unresolved Questions:** None.
