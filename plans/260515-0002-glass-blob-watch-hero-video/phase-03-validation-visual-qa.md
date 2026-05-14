---
phase: 3
title: Validation + visual QA
status: completed
priority: P2
effort: 30m
dependencies:
  - 1
  - 2
---

# Phase 3: Validation + visual QA

## Overview

Verify phases 1 and 2 land cleanly. Runs typecheck + lint, then a focused walkthrough confirming the glass blob reads correctly on Home + Shop and the Watch hero video autoplays/loops with acceptable performance.

## Requirements

**Functional**
- `pnpm typecheck` exits 0.
- `pnpm lint` exits 0 (no new errors).
- Home + Shop hero render the glass blob; no rectangle visible.
- Watch hero plays the local video on autoplay loop.
- Click on Watch hero navigates to YouTube channel.
- No console errors.

**Non-functional**
- Compressed video size confirmed ≤15 MB.
- No new layout shift (CLS) introduced.

## Architecture

Read-only validation of:
- `components/home/full-bleed-hero.tsx`
- `components/watch/watch-hero.tsx`
- `lib/content/schemas.ts`
- Featured-video JSON entry
- `public/assets/watch/intro.mp4` + `intro-poster.jpg`

## Implementation Steps

1. Verify compressed video size: `ls -lh public/assets/watch/intro.mp4`. Confirm ≤15 MB.
2. Verify poster exists: `ls public/assets/watch/intro-poster.jpg`.
3. Run `pnpm typecheck`. Halt on errors.
4. Run `pnpm lint`. Halt on new errors.
5. Boot dev server (`pnpm dev`).
6. **Home `/` walkthrough** at 375 / 768 / 1024 / 1440:
   - Mobile (375): in-flow card below banner unchanged.
   - md+ (768/1024/1440): hero card reads as soft glow centered around text. No visible rectangle. Text fully legible.
   - Banner imagery visible through glass at edges (intended).
7. **Shop `/shop` walkthrough** at same viewports:
   - Same glass blob treatment.
   - Text legible against the merch banner.
8. **Watch `/watch` walkthrough** at same viewports:
   - Video autoplays in the hero area.
   - Plays silently in a loop.
   - Click navigates to YouTube channel.
   - On Chrome Android (or Chrome DevTools mobile emulation): autoplay fires.
   - On Safari (if available): autoplay fires (muted + playsInline required).
   - Poster shows for any frame before video starts.
9. Devtools console: no new errors/warnings.
10. Devtools network panel: video preload should be minimal until in view (preload=metadata).

## Success Criteria

- [ ] Compressed video ≤15 MB
- [ ] Poster image present
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm lint` exits 0
- [ ] Home glass blob renders correctly at all viewports
- [ ] Shop glass blob renders correctly at all viewports
- [ ] Watch video autoplays + loops in modern browsers
- [ ] Watch click → YouTube navigation works
- [ ] Mobile responsiveness intact
- [ ] No new console errors

## Risk Assessment

- **Mask-image broken on user's target browser** — visual symptom: hard rectangle returns. Mitigation: this is the previous (iter-3) behavior — acceptable graceful degradation. If user wants stronger guarantee, can add a fallback `bg-white/55 rounded-3xl` baseline + override via `@supports (mask-image: radial-gradient(black, transparent))`.
- **Video doesn't autoplay** — verify all four attributes present: `autoPlay muted loop playsInline`. iOS Low Power Mode is an environmental override; acceptable.
- **Video file too large** — re-run compression with CRF 26 or scale 1280.
- **Featured-video JSON entry not loaded** — symptom: Watch hero falls back to YouTube thumbnail. Verify content adapter cache + schema validation passes.
