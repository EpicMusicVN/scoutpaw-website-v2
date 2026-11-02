---
phase: 4
title: Visible Breadcrumbs
status: completed
priority: P3
effort: 2h
dependencies:
  - 1
---

# Phase 4: Visible Breadcrumbs

## Overview
Add a visible, accessible breadcrumb nav to **detail pages only** (`characters/[slug]`,
`coming-soon/[slug]`), sharing its trail array with `breadcrumbSchema` so the visible UI and the
structured data can never drift.

## Requirements
- Functional: detail pages render `<nav aria-label="Breadcrumb">` with an ordered trail of links.
- Functional: the SAME trail array feeds both the visible component and `breadcrumbSchema` (DRY).
- Non-functional: keyboard + screen-reader accessible; current page not a link (`aria-current="page"`).
- Scope: detail pages only — section pages (shop/watch/etc.) keep schema-only breadcrumbs.

## Architecture
- Refactor trail construction: a `BreadcrumbItem = { name: string; href: string }` array built once
  per detail page. `breadcrumbSchema` already takes `{ name, url }` (absolute) — adapt by mapping
  `href`→absolute `url` at the schema call, while the visible component uses relative `href`.
- `components/ui/breadcrumbs.tsx` (new, server component): `<nav aria-label="Breadcrumb"><ol>` of
  `next/link` items; last item rendered as `<span aria-current="page">`. Styled to match cozy theme
  (small, muted, `font-display` kicker style). Separator via CSS, `aria-hidden`.
- `characters/[slug]/page.tsx`: trail = Home › Characters › {name}; render `<Breadcrumbs>` above hero;
  pass same trail to `breadcrumbSchema`.
- `coming-soon/[slug]/page.tsx`: trail = Home › {navLabel}; same pattern.

## Related Code Files
- Create: `components/ui/breadcrumbs.tsx`
- Modify: `app/(frontend)/characters/[slug]/page.tsx`
- Modify: `app/(frontend)/coming-soon/[slug]/page.tsx`

## Implementation Steps
1. Build `breadcrumbs.tsx` (ol/li, next/link, `aria-current`, themed separators).
2. In each detail page, define the trail array once; render `<Breadcrumbs items={trail} />`.
3. Feed the same trail (mapped to absolute urls) to the existing `breadcrumbSchema` call.
4. `tsc`/lint; curl a character + coming-soon page; verify visible nav + matching BreadcrumbList.

## Success Criteria
- [ ] Detail pages show a visible breadcrumb nav matching the schema trail.
- [ ] `<nav aria-label="Breadcrumb">` landmark + `aria-current="page"` on last item.
- [ ] No visible breadcrumbs added to section pages.
- [ ] `tsc`/lint clean.

## Risk Assessment
- **Visible/schema drift** → single trail array per page is the source for both (mitigated by design).
- **Visual clutter** → keep compact + muted; review render before commit.
