---
phase: 4
title: "Responsive & Accessibility"
status: pending
priority: P1
effort: "1d"
dependencies: [3]
---

# Phase 4: Responsive & Accessibility

## Overview

Polish the carousel + detail card across desktop/tablet/mobile, optimize image
loading, and verify accessibility — the brief's non-functional requirements.

## Requirements

- Functional: carousel + detail usable + good-looking at all 3 breakpoints.
- Non-functional: no CLS; optimized images; AA contrast; keyboard-operable;
  `prefers-reduced-motion` graceful; Lighthouse perf not regressed.

## Architecture

Responsive peek for the coverflow:
- Desktop (≥1024px): center card + 2 peeking neighbours.
- Tablet (640–1023px): center + partial neighbour peek.
- Mobile (<640px): center + slim peek; larger touch targets for arrows.

Detail card: desktop = split (artwork | text); mobile = stacked (artwork, text).

## Related Code Files

- Modify: `components/characters/character-carousel-track.tsx` — breakpoint-aware slide width/peek.
- Modify: `components/characters/character-carousel-card.tsx` — responsive sizing, `next/image` `sizes`.
- Modify: `components/characters/character-detail-card.tsx` — split ↔ stacked layout.
- Modify: `components/characters/character-carousel-arrows.tsx` — touch target sizing.
- Read for context: `app/globals.css`, `tailwind.config.ts`.

## Implementation Steps

1. **Responsive carousel:** breakpoint-tuned slide basis / peek amount; verify
   coverflow scale still reads well on small screens (consider reduced scale delta on mobile).
2. **Responsive detail card:** split grid on desktop → single column on mobile;
   artwork sizes down; quote + text remain readable.
3. **Image optimization:**
   - `next/image` with per-breakpoint `sizes` on every pose.
   - `priority` only on the initially centered pup (and the `?pup=` deep-linked pup); rest lazy.
   - Audit pose PNG file sizes; tune `quality`; add `placeholder="blur"` if feasible.
   - Preload the centered pup's artwork so expand is instant.
4. **No CLS:** carousel viewport + detail card have explicit/min heights;
   `AnimatePresence mode="popLayout"`; verify with DevTools Performance.
5. **Accessibility pass:**
   - Cards = `<button>` with descriptive `aria-label`; carousel container
     `aria-roledescription="carousel"`, slides `aria-roledescription="slide"`.
   - Tab order sane; Enter/Space opens; arrows reachable + labelled.
   - Detail open → focus to heading; close → focus restored; `Escape` works.
   - AA contrast for title/subtitle/body on every themed gradient (all 5 pups).
   - `prefers-reduced-motion`: static coverflow, morph→crossfade, decor off.
6. Cross-browser/device smoke test (Chrome, Safari/iOS, Firefox); Lighthouse run.

## Success Criteria

- [ ] Carousel + detail look polished at desktop / tablet / mobile.
- [ ] Touch swipe smooth on mobile; arrow touch targets ≥44px.
- [ ] No CLS; images lazy-loaded except focal/deep-linked pup.
- [ ] AA contrast verified for all 5 themed gradients.
- [ ] Full keyboard operability; focus management correct.
- [ ] Reduced-motion path verified.
- [ ] Lighthouse performance not regressed vs current page.

## Risk Assessment

- Heavy pose PNGs could hurt LCP — if `quality`/`sizes` insufficient, flag for
  asset re-export (out of scope to re-author art here).
- Coverflow on very narrow screens may feel cramped — fall back to near-full-width
  single card with slim peek if needed.
