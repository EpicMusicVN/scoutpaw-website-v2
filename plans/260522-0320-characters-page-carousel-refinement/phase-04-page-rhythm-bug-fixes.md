---
phase: 4
title: Page Rhythm & Bug Fixes
status: completed
priority: P2
effort: 2h
dependencies:
  - 3
---

# Phase 4: Page Rhythm & Bug Fixes

## Overview

Collapse the cavernous vertical whitespace around the carousel into balanced rhythm, and
fix the two live console issues on `/characters` (a `<path d="undefined">` SVG error and
a Framer `opacity from "undefined"` warning).

## Requirements

- Functional: carousel section sits with balanced padding — not sandwiched in empty sky.
- Functional: zero console errors / warnings on `/characters`.
- Non-functional: single height authority (no competing min-heights); no layout shift.

## Architecture

**Vertical rhythm — collapse the double height source:**
- `character-carousel.tsx` — section is `min-h-[100svh]` flex-centered.
- `character-carousel-track.tsx` — flex wrapper is *also* `min-h-[clamp(560px,80vh,900px)]`
  and viewport is `h-[clamp(460px,68vh,820px)]`.
- `character-detail-card.tsx` — wrapper is *also* `min-h-[clamp(560px,80vh,900px)]`.
- Problem: a tall `100svh` section + short content = huge empty bands (verified in render).
- Fix: keep ONE height authority. Reduce the section to a content-driven height with
  generous-but-balanced padding (e.g. `min-h-[88svh]` or `py` rhythm), and let the track
  viewport (`VIEWPORT_H`) be the real carousel height. Keep the carousel↔detail
  min-heights matched so the swap doesn't re-center. Final values tuned in Phase 5.
- Keep both `CloudDivider`s (brand consistency with Home).

**Bug 1 — `<path> attribute d: Expected moveto ... "undefined"`:**
- An SVG path is rendered with an undefined `d`. Likely source: `character-scene-decor.tsx`
  (`MusicNote` / `Sparkle` / `Cloud`) or `character-atmosphere.tsx`. Trace which decor
  component builds a `d` from an undefined value; supply a valid path or guard the render.

**Bug 2 — Framer `You are trying to animate opacity from "undefined" to "1"`:**
- A `motion` element animates `opacity` with an undefined initial. Likely a decor/motion
  element with no `initial` opacity, or interaction with the JS-written `.carousel-fader`
  opacity. Give the offending element an explicit numeric `initial` opacity.

**Minor:** ensure no critical control (carousel arrows / titles) is permanently trapped
behind the fixed cookie-consent banner's bottom strip — adjust bottom padding if needed.

## Related Code Files

- Modify: `components/characters/character-carousel.tsx` (section height)
- Modify: `components/characters/character-carousel-track.tsx` (single height authority)
- Modify: `components/characters/character-detail-card.tsx` (matched min-height)
- Modify: decor source of Bug 1 — `character-scene-decor.tsx` or `character-atmosphere.tsx`
- Modify: motion source of Bug 2 (identify via console stack trace)
- Read: `app/characters/page.tsx` (section composition, CloudDividers)

## Implementation Steps

1. Reproduce both console messages in dev; capture stack traces to pinpoint exact files.
2. Fix Bug 1 — valid/guarded SVG `d`.
3. Fix Bug 2 — explicit numeric `initial` opacity on the offending `motion` element.
4. Collapse height sources to one authority; reduce dead whitespace; keep carousel↔detail
   min-heights matched.
5. `pnpm typecheck` + `pnpm lint` — green.
6. Render — console clean, vertical rhythm balanced, no re-center jump on detail open/close.

## Success Criteria

- [ ] Zero console errors AND warnings on `/characters` (carousel + detail open/close)
- [ ] No cavernous empty bands above/below the carousel — balanced rhythm
- [ ] Single height authority; carousel↔detail swap does not re-center the viewport
- [ ] CloudDividers retained
- [ ] `typecheck` + `lint` green

## Risk Assessment

- **Bug source ambiguity** — Mitigation: use the console stack trace + chrome-devtools
  `console.js` to pinpoint before editing; don't guess.
- **Reducing height breaks the "immersive" feel** — Mitigation: balanced ≠ cramped; tune
  in Phase 5 against the cinematic goal.
