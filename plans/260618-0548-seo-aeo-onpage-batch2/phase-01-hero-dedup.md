---
phase: 1
title: Hero Dedup
status: completed
priority: P1
effort: 3-4h
dependencies: []
---

# Phase 1: Hero Dedup

## Overview
Eliminate the duplicate `<h1>`, duplicate headings, and duplicate `Max, Rocky…` text block
on the homepage (and sibling hero pages) by rendering hero heading content **once** in the
DOM instead of twice across responsive breakpoints.

## Requirements
- Functional: exactly one `<h1>` and one copy of the description string in the raw HTML of
  the homepage (and each affected hero page) at every breakpoint.
- Non-functional: visual parity — mobile card + desktop glass blob must look identical to
  current after the refactor; no layout/CLS regression; no new client JS.

## Architecture
`FullBleedHero` (`components/home/full-bleed-hero.tsx`) currently defines a `CardBody`
(kicker + `<h1>` + description) and renders it in **two** sibling containers:
- mobile in-flow card: `<div className="... md:hidden">` (line ~67)
- desktop absolute blob: `<div className="... hidden md:flex">` (line ~75)

Both are in the DOM simultaneously; CSS only toggles visibility. CSS-blind crawlers count both.

**Fix pattern (single-render):** render `CardBody` **once** inside one wrapper whose
positioning + chrome switch at the `md` breakpoint:
- mobile: `relative` in-flow card styling (rounded glass card below the banner)
- desktop: `md:absolute md:inset-0` overlay positioning the blob top-left
- Keep the decorative blur/mask layers (`aria-hidden`, zero text) as-is — duplicating those
  is harmless since they contain no crawlable text.

If a clean single-wrapper proves visually lossy, fall back to: keep two layout wrappers but
move the text nodes (`kicker`/`h1`/`description`) into a single shared node positioned via
CSS — the hard requirement is **one** copy of each text string in the DOM, not one wrapper.

## Related Code Files
- Modify: `components/home/full-bleed-hero.tsx` (primary — homepage hero)
- Audit + modify if same pattern present:
  - `components/watch/watch-hero.tsx`
  - `components/characters/character-detail-hero.tsx`
  - `components/coming-soon/coming-soon-hero.tsx`
  - `components/home/feature-banner.tsx`
- Note: `components/home/cinematic-hero.tsx` has its own `<h1>` but is **not** imported by
  the homepage (`app/(frontend)/page.tsx` uses `FullBleedHero`). Confirm it is unused; if dead,
  flag for removal (do not expand scope to delete here unless trivial + confirmed unused).

## Implementation Steps
1. Refactor `FullBleedHero` so `CardBody` renders once. Use responsive Tailwind position/
   display utilities on a single wrapper to achieve mobile-card vs desktop-blob placement.
2. Verify in browser at <md and ≥md that the hero is visually identical to before.
3. `curl`/view-source the homepage and confirm exactly one `<h1>` and one `Max, Rocky…` string.
4. Grep each sibling hero for the dual-render pattern (`md:hidden` + `hidden md:flex` wrapping
   the same heading content). Apply the same single-render fix where the pattern emits
   duplicate headings/text.
5. Re-check each affected page's raw HTML for single-heading compliance.

## Success Criteria
- [ ] Homepage raw HTML contains exactly one `<h1>` and one `Discover a happier world of puppies`.
- [ ] Homepage raw HTML contains exactly one `Max, Rocky…` description string.
- [ ] No remaining duplicate heading text on the homepage.
- [ ] Sibling heroes audited; dual-render fixed where present (or noted as not-applicable).
- [ ] Visual parity confirmed at mobile + desktop breakpoints.

## Risk Assessment
- **Visual regression** on the hero (most-seen component) → mitigate with before/after render
  check at both breakpoints before moving on.
- **Sibling sweep scope creep** → if a sibling needs heavy layout rework, ship the homepage fix
  and split the sibling into a fast-follow rather than block this phase (see plan unresolved Q3).
