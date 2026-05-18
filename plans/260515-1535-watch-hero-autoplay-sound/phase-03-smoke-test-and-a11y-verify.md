---
phase: 3
title: Smoke test and a11y verify
status: completed
priority: P2
effort: 30m
dependencies:
  - 2
---

# Phase 3: Smoke test and a11y verify

## Overview

Manually verify autoplay-with-sound behavior across browsers, validate the unmute toggle UX, and confirm accessibility (WCAG 1.4.2, keyboard, ARIA states).

## Requirements

### Functional
- Cold Chrome incognito: video autoplays muted, "Tap for sound" pill visible, 1 tap → sound on
- Warm Chrome (post-MEI buildup): may autoplay with sound; mute pill present
- iOS Safari (real device or simulator): muted autoplay + pill, 1 tap → sound
- Clicking the video body (not pill) opens YouTube in new tab (unchanged)
- Image fallback (set a video with `videoSrc=undefined` in content) still renders unchanged

### Non-functional
- Pill is keyboard-focusable (Tab reaches it)
- Pill toggles via Space/Enter
- Focus ring is visible
- `aria-pressed` value matches current audio state
- No new Lighthouse a11y violations

## Architecture

This phase is verification only — no code changes. If issues found, log them and return to Phase 1 or Phase 2.

## Related Code Files

- **Read:** `components/watch/hero-video.tsx`
- **Read:** `components/watch/watch-hero.tsx`
- **No edits unless bug found**

## Implementation Steps

1. **Cold Chrome test (incognito or fresh profile)**
   - Open new incognito window
   - Navigate to `http://localhost:3000/watch`
   - Expected: video plays, NO audio, "🔊 Tap for sound" pill visible bottom-right
   - Click pill → audio comes on, pill changes to small mute icon
   - Click pill again → audio mutes, pill changes back

2. **Warm Chrome test (regular profile, after step 1 + a refresh)**
   - Refresh `/watch` a few times in regular profile
   - Expected (after Chrome MEI threshold): video may autoplay WITH sound; mute pill shows mute icon, not "Tap for sound"
   - Click pill → audio mutes
   - Acceptable if still muted on first reload — MEI is heuristic

3. **iOS Safari test**
   - Use real device or BrowserStack/simulator
   - Expected: muted autoplay + "Tap for sound" pill
   - Tap pill → audio comes on

4. **YouTube link integrity**
   - Click anywhere on video EXCEPT the pill
   - Expected: new tab opens to YouTube watch URL

5. **Image fallback**
   - Temporarily set featured video's `videoSrc` to undefined in content
   - Expected: image renders with play-button overlay, no `<HeroVideo>` mounted

6. **Keyboard accessibility**
   - Tab through page until pill focused
   - Verify focus ring visible
   - Press Enter → toggles state
   - Press Space → toggles state

7. **ARIA + screen reader spot check**
   - Inspect pill element in DevTools
   - Verify `aria-label` reflects current state ("Unmute video" / "Mute video")
   - Verify `aria-pressed="true"` when sound on, `"false"` when muted

8. **Lighthouse a11y audit**
   - Run Lighthouse on `/watch`
   - Compare to pre-change baseline if available; expect no new violations

## Todo List

- [ ] Cold Chrome incognito smoke test
- [ ] Warm Chrome smoke test
- [ ] iOS Safari smoke test (real device or simulator)
- [ ] YouTube link still navigates correctly
- [ ] Image fallback unchanged
- [ ] Keyboard navigation to pill works
- [ ] `aria-pressed` and `aria-label` correct
- [ ] Lighthouse a11y check passes

## Success Criteria

- [ ] All 8 todo items above checked off
- [ ] No console errors during any test
- [ ] No console warnings (hydration, React) introduced
- [ ] User can always reach a control to mute/unmute (WCAG 1.4.2)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Chrome MEI never grants sound-on-load for this domain | Acceptable — pill is the documented UX fallback |
| Pulse animation distracts users | Use subtle animation, respects `prefers-reduced-motion` |
| Pill click bubbles through and opens YouTube | Test explicitly — `preventDefault` + `stopPropagation` should prevent it |
| First-tap unmute doesn't engage audio on iOS | Some iOS versions need a second user interaction. If reproduced, document as known limitation; do not block ship. |
