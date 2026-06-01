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

Live verification of crossfade + changelog.

## Implementation Steps

1. **Typecheck + lint.**
2. **Live verification at `/characters`:**
   - Desktop (1280px+): scroll through 5 scenes; confirm crossfade zone visible (previous scene's feathered bottom + next scene's feathered top blend through each other; incoming opacity ramps from 0 → 1)
   - Tablet (768px): same on smaller viewport
   - Mobile (375px): scenes stack naturally; mask creates soft top/bottom edges (no hard color jump between scenes)
   - `prefers-reduced-motion` (DevTools): opacity composite flat at 1; mask still feathers
3. **iOS Safari sanity check** (mask-image rendering, no jump on address-bar resize).
4. **Update changelog:**
   ```markdown
   ## [2026-05-26] - Characters Scene Crossfade v3: Mask Feathering + True 0→1 Opacity

   ### Overview
   Plan L of styling iteration 4. Third pass at character scene transitions. Adds `mask-image: linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)` to each scene's motion.div, so top + bottom 12% of each scene fade to transparent. Widens incoming opacity to true `[0, 1]` crossfade (was `[0.5, 1]` in Plan H). Combined: adjacent scenes blend through feathered edges + opacity ramp — no more hard color cut.

   ### Changes
   - `components/characters/character-section.tsx`:
     - Added `maskImage` + `WebkitMaskImage` linear-gradient on motion.div
     - Incoming opacity range `[0.5, 1]` → `[0, 1]` for true crossfade
     - Docstring updated to reflect new transition mechanics

   ### Design Rationale
   - **Mask feathering**: top + bottom 12% fade to transparent so adjacent scenes show through each other at boundaries. Solid edge-to-edge color jump (the source of "still too separated") is eliminated.
   - **True 0→1 opacity**: incoming scene starts fully invisible, ramps to 1.0 during entry. Combined with mask, gives an actual blend window where the new scene appears AS the old fades + scales out.
   - **`prefers-reduced-motion`** preserved: opacity flat at 1; mask is decorative-only and still applies.

   ### Validation
   - typecheck + lint clean
   - 4-breakpoint visual check
   - iOS Safari mask-image render
   - prefers-reduced-motion opt-out
   ```

## Success Criteria

- [ ] Crossfade visible between scenes
- [ ] Mobile renders cleanly with feathered edges
- [ ] iOS Safari render confirmed
- [ ] Typecheck + lint clean
- [ ] Changelog entry added

## Risk Assessment

- **Risk:** Live review reveals 12% feather is too aggressive (too much transparency at edges, content readability drops). *Mitigation:* tighten to 8% or 6% — easy CSS tweak.

## Security Considerations

None.
