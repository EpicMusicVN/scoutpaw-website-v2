---
phase: 2
title: Full-Screen Scene Composition
status: completed
priority: P1
effort: 5h
dependencies:
  - 1
---

# Phase 2: Full-Screen Scene Composition

## Overview

Turn the `/characters` scene into a full-viewport cinematic stage: larger,
more dominant characters, hover/focus-only name reveal, and the enriched
backdrop + foreground wired in. Swap Buddy's pose to `corgi2`.

## Requirements

- Functional: scene fills the viewport (`min-h-[100svh]`); 5 larger characters,
  each a link to `/characters/{slug}`; names reveal on hover/focus only, hidden
  on touch; Buddy uses `corgi2`; page keeps exactly one `<h1>`.
- Non-functional: server components, no client JS; no CLS; LCP-safe priority
  split; AA contrast; reduced-motion safe.
- Responsive: desktop/tablet art-directed full-viewport composition; mobile
  full-height immersive + staggered scroll column.

## Architecture

```
app/characters/page.tsx  (unchanged — still renders CharacterScene + NewsletterCTA)
  └─ CharacterScene (modify)
       ├─ CharacterSceneBackdrop      (enriched in P1)
       ├─ <h1> (compact, integrated)
       ├─ stage — 5× CharacterSceneFigure   (larger; SCENE_LAYOUT widths up)
       └─ CharacterSceneForeground    (new in P1; rendered after figures, higher z)
```

- **Full-screen** — `CharacterScene` section becomes `min-h-[100svh]`. Account
  for the in-flow navbar so the heading is not cramped (use `min-h-[100svh]`
  with existing top padding, or `min-h-[calc(100svh-<nav>)]` if it overflows).
- **Larger characters** — bump `SCENE_LAYOUT` widths (~Max 40%, others 30–34%;
  was 22–30%). Re-tune `left`/`bottom` so larger figures still balance and stay
  within the stage (section keeps `overflow-hidden` as a safety net).
- **Stage height** — desktop stage fills the viewport region; figures remain
  `md:absolute` via the `--fig-*` CSS vars. Mobile = `flex-col` staggered
  column, figures larger (~78vw, raise `max-w`).
- **Hover/focus-only names** — in `CharacterSceneFigure`, the name plate
  becomes `absolute`-positioned (no layout shift), `opacity-0` + slight
  `translate-y` by default, → `opacity-100` + settle on `group-hover` /
  `group-focus-visible`. No `[@media(hover)]` needed: with no always-visible
  fallback, touch simply never triggers the reveal ⇒ hidden on touch. Keep the
  `aria-label` on the link so screen readers still announce the character.
- **Compact `<h1>`** — keep a real `<h1>` (SEO/a11y) but lighter/smaller so the
  enlarged characters dominate.
- **Buddy** — reorder `content/characters.json` Buddy `poses` so `corgi2` is
  index 0; scene + detail hero both read `poses[0]`.

## Related Code Files

- Modify: `components/characters/character-scene.tsx`
- Modify: `components/characters/character-scene-figure.tsx`
- Modify: `content/characters.json` (Buddy `poses` order)

## Implementation Steps

1. **`characters.json`** — Buddy `poses`:
   `["characters-position/corgi2.png", "characters-position/corgi1.png", "characters-position/corgi3.png"]`.
2. **`character-scene-figure.tsx`** — name plate → `absolute` bottom-anchored,
   `opacity-0 translate-y-1` default, `group-hover`/`group-focus-visible` →
   `opacity-100 translate-y-0`, smooth fade. Keep glow + scale hover, 3-layer
   nesting, `aria-label`. Allow larger sizing (mobile width up).
3. **`character-scene.tsx`** — section `min-h-[100svh]`; verify navbar spacing;
   bump + re-tune `SCENE_LAYOUT` widths/positions; enlarge mobile figure width;
   make the `<h1>` compact; render `<CharacterSceneForeground />` after the
   figures with a z-index above them.
4. Verify desktop composition at 1024 / 1280 / 1440 / 1920px and mobile column
   at 320 / 375 / 414px — no horizontal overflow, no overlap that hides faces.
5. `priority` stays on Max + Buddy; lazy the rest; widen `sizes` for the larger
   render.
6. `npx tsc --noEmit` + `npx next lint` — confirm clean.

## Success Criteria

- [x] `/characters` scene fills the viewport (`100svh`); heading not cramped.
- [x] Characters visibly larger / more dominant than iteration #5.
- [x] Names reveal on hover + keyboard focus; never shown on touch; no CLS from
      the reveal.
- [x] Buddy renders `corgi2` on the scene and his detail hero.
- [x] One `<h1>`; desktop composition + mobile staggered column both hold; no
      horizontal overflow at 320px.
- [x] `tsc` + `next lint` clean.

## Risk Assessment

- **Full-screen on mobile** — 5 large characters cannot all fit one portrait
  viewport; mobile is a staggered scroll column by design — set expectations.
- **Larger figures overflow** — re-tuned `SCENE_LAYOUT` must keep figure boxes
  (`left ± width/2`) within 0–100%; `overflow-hidden` is the safety net.
- **Navbar overlap** — a 100svh section can push the heading under a sticky
  nav; verify and pad.
- **Hover-only discoverability** — acceptable per decision; `aria-label` +
  focus reveal keep SR/keyboard users covered.
