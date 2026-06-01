---
phase: 2
title: Verification and Docs
status: completed
priority: P2
effort: 15m
dependencies:
  - 1
---

# Phase 2: Verification and Docs

## Overview

Verify Plan H end-to-end on `/characters`; append changelog.

## Implementation Steps

1. **Typecheck + lint** the full project.
2. **Live verification** on `/characters`:
   - Mobile (375px): scenes stack naturally, no sticky, fade-in transforms still apply during natural scroll (effect minimal)
   - Tablet/desktop: scroll through all 5 scenes, confirm crossfade window visible at each transition
   - Confirm Plan E exit fade still works
   - Confirm newsletter has clear ~96–128px breathing room above it
   - `prefers-reduced-motion` (Chrome DevTools): transforms flat
3. **Append changelog**:
   ```markdown
   ## [2026-05-26] - Characters Soft Scene Transitions + VIP Buffer

   ### Overview
   Plan H of styling iteration 3. Added incoming-scene fade-in (`0.5 → 1.0` opacity during entry) paired with Plan E's existing outgoing fade (`1.0 → 0.85` during exit), creating a visible crossfade window between adjacent character scenes. Added a `pt-24 md:pt-32` buffer above the newsletter on `/characters` so it doesn't sit directly on the last scene's scroll-end.

   ### Changes
   - `components/characters/character-section.tsx`: added second `useScroll` with `["start end", "start start"]` offset; `incomingOpacity` `useTransform`; composite `opacity` via array-form `useTransform` multiplying incoming × outgoing. Plan E's outgoing fade renamed to `outgoingOpacity`. `useReducedMotion` guard preserved.
   - `app/characters/page.tsx`: wrapped newsletter ScrollReveal in `<div className="pt-24 md:pt-32">` for VIP buffer.

   ### Validation
   - typecheck + lint clean
   - Visual crossfade verified at desktop scroll-through
   - Newsletter buffer visible
   - `prefers-reduced-motion` opt-out verified
   ```

## Success Criteria

- [ ] Crossfade visible between adjacent scenes
- [ ] Newsletter buffer present
- [ ] Typecheck + lint clean
- [ ] Changelog entry added

## Risk Assessment

- **Risk:** Live review finds crossfade too subtle or too dramatic. *Mitigation:* tune incoming start opacity (currently 0.5) — go to 0.3 for more drama, 0.7 for subtler.

## Security Considerations

None.
