---
phase: 2
title: View All Outline Button
status: completed
priority: P3
effort: 10m
dependencies: []
---

# Phase 2: View All Outline Button

## Overview

Style the Menu Cards "View All" link as an outline button pill (mirrors `Button variant="outline" size="sm"`). Keep as a `<span>` inside the parent `<Link>` since nested anchors are invalid HTML — visual-only "button" treatment.

## Requirements

- Functional: "View All" reads as a button (rounded-full, border, padding, ink text, arrow)
- Visual consistency with site-wide outline buttons
- Hover state lifts/strengthens border (triggered by parent card hover via `group-hover:`)

## Related Code Files

- Modify: `components/home/menu-cards.tsx`

## Implementation Steps

1. Locate the current span (line ~135):
   ```tsx
   {!card.comingSoon && (
     <span className="mt-auto inline-flex items-center gap-1.5 pt-3 font-display text-sm font-semibold text-ink md:text-base">
       View All
       <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
         →
       </span>
     </span>
   )}
   ```
2. Replace with outline-button styling:
   ```tsx
   {!card.comingSoon && (
     <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/20 bg-transparent px-4 py-1.5 font-display text-sm font-semibold text-ink shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-ink/40 group-hover:shadow-md md:text-base">
       View All
       <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
         →
       </span>
     </span>
   )}
   ```
3. Note `w-fit` so pill width hugs content rather than stretching to flex column width.
4. Run `pnpm typecheck` + `pnpm lint`.
5. Visual smoke: hover a Menu Card, confirm pill lifts + border darkens.

## Success Criteria

- [ ] "View All" renders as rounded-full pill with border + padding + ink text
- [ ] On card hover, pill subtly lifts + border darkens
- [ ] No nested anchor warnings (still a span inside parent Link)
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** `w-fit` may compress on narrow viewports. **Mitigation:** content is short ("View All →"); fits comfortably.
- **Risk:** Looks like a button but isn't — accessibility concern. **Mitigation:** parent `<Link>` is the actual interactive element; screen readers announce the link with its aria-label. Inner pill is decorative.
