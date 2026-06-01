---
phase: 2
title: Immersive Scene Page
status: completed
priority: P1
effort: 5h
dependencies:
  - 1
---

# Phase 2: Immersive Scene Page

## Overview

Rebuild `/characters` as a code-built immersive scene — gradient + SVG backdrop
with all 5 pups composited on top, each a clickable link with CSS-only hover and
an always-visible name label. Remove the hero banner + carousel.

## Requirements

- Functional: 5 pups, each links to `/characters/{slug}`; CSS hover only
  (glow + scale + float + shadow), pose unchanged; always-visible name labels;
  a real `<h1>` on the page.
- Non-functional: server components only, no client JS; no new image assets;
  no CLS; LCP-safe `priority`/lazy split; WCAG AA contrast; reduced-motion safe.
- Responsive: art-directed absolute layout on `md+`; staggered vertical flow on
  mobile — one set of figures, two positioning maps.

## Architecture

```
app/characters/page.tsx (rewrite)
  └─ <CharacterScene characters={ordered} />   ← new, server, CSS-only
       ├─ backdrop layers (gradient + inline SVG: clouds/stars/notes/shapes)
       │     absolutely positioned, aria-hidden, drift via CSS keyframes
       ├─ <h1> "Meet the ScoutPaw Pack"  (replaces removed hero h1)
       └─ stage  (relative; md: fixed-aspect, mobile: flex-col)
            └─ 5× <CharacterSceneFigure character={c} layout={SCENE_LAYOUT[slug]} />
  └─ <NewsletterCTA tag="characters-newsletter" />   ← kept
```

- **`SCENE_LAYOUT`** — a `Record<slug, { top; left; width; z; floatDelay }>` const
  (desktop coords, hand-tuned). Mobile ignores it (flow layout).
- **Depth layering** — backdrop SVG (z-0) → far pups (z-10/20) → near pups
  (z-30/40) → optional foreground sprinkle (z-50). Max sits center-front (Captain).
- **Stage sizing** — `md:` a `relative` box with a fixed aspect ratio (or
  `min-height` in `vh`) so absolute children never collapse → no CLS. Mobile: a
  `flex-col` of figures with vertical rhythm; staggered horizontal offset via
  `self-start`/`self-end`, never `100vw`+ width.
- **Animations** — reuse existing keyframes (`cloud-drift`, `paw-drift`,
  `dust-float`); add `figure-float` + `glow-pulse` to `app/globals.css` if a
  per-figure idle bob/glow is wanted. All disabled under the existing
  `prefers-reduced-motion` reset.
- **Images** — `next/image`, transparent poses from `characters-position/*`
  (via `assetUrl`). `priority` on Max (+ one neighbour); `loading="lazy"` rest.
  Each figure has an explicit aspect box so no layout shift.

## Related Code Files

- Create: `components/characters/character-scene.tsx`
- Create: `components/characters/character-scene-figure.tsx`
- Modify: `app/characters/page.tsx`
- Modify: `app/globals.css` (only if new keyframes needed)
- Delete: `components/characters/character-carousel.tsx`
- Delete: `components/characters/character-carousel-card.tsx`

## Implementation Steps

1. **`character-scene-figure.tsx`** (server, CSS-only): props `character`,
   `layout`, `priority?`. Render `<Link href={"/characters/" + slug}>` wrapping
   an aspect-boxed `next/image` pose + an accent glow div (tinted `accentColor`)
   + an always-visible name label (`font-display`, themed pill/text, AA contrast).
   `aria-label={"Meet " + name + ", the " + breed}`. Hover/focus-visible: scale
   + lift + stronger glow + shadow via Tailwind `transition` — pose unchanged.
2. **`character-scene.tsx`** (server, CSS-only): define `SCENE_LAYOUT` const;
   render backdrop layers (gradient bg + inline SVG decor, all `aria-hidden`,
   `pointer-events-none`), a real `<h1>`, and the stage. md+ = `relative`
   fixed-aspect stage placing figures with `SCENE_LAYOUT` (absolute, `top/left/
   width/zIndex`); mobile = `flex-col` with staggered alignment. Pass `priority`
   to the 1–2 dominant figures.
3. **`app/characters/page.tsx`**: remove `FullBleedHero` + `CharacterCarousel`
   (+ now-unused imports / `CloudDivider` as appropriate). Keep `PAGE_ORDER`,
   `content.getCharacters()`, `ordered`. Render `<CharacterScene characters={ordered} />`
   then `<NewsletterCTA tag="characters-newsletter" />`. `metadata` unchanged.
4. Add `figure-float` / `glow-pulse` keyframes to `app/globals.css` only if used.
5. Delete `character-carousel.tsx` + `character-carousel-card.tsx`. Grep for any
   other importers — there should be none.
6. `npx tsc --noEmit` + `npx next lint` — confirm clean.

## Success Criteria

- [x] `/characters` renders the immersive scene; no hero banner, no carousel.
- [x] 5 pups clickable → correct detail pages; CSS hover only, pose unchanged.
- [x] Always-visible name labels; page has exactly one `<h1>`.
- [x] Desktop art-directed layout + mobile staggered flow both hold; no
      horizontal overflow at 320px; no CLS.
- [x] Carousel files deleted, no dangling imports; `tsc` + `lint` clean.

## Risk Assessment

- **Hardest layout in the project** — `SCENE_LAYOUT` desktop coords need visual
  hand-tuning; budget iteration time, verify at 768 / 1024 / 1440px.
- **Mobile overflow** — keep figure widths in `%`/`vw` < 100; test at 320px.
- **LCP** — only `priority` 1–2 images; lazy the rest.
- **Missing `<h1>`** — removing the hero drops the page h1; the scene MUST ship
  one for SEO/a11y.
