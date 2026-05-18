---
type: tester
date: 2026-05-15
time: 15:45
slug: watch-hero-autoplay
phase: 3
---

# Phase 3 Verification — Automated Pass / Manual Pending

## Automated Checks (Pass)

| Check | Command | Result |
|---|---|---|
| TypeScript | `pnpm tsc --noEmit` | exit 0, no errors |
| ESLint | `pnpm lint` | exit 0, no warnings |
| Production build | `pnpm build` | exit 0, `/watch` route built (20.9 kB) |

## Manual Verification Required (User)

No browser test infrastructure exists in repo (no Playwright/Cypress/Vitest). Cross-browser autoplay-policy behavior is intrinsically user-gesture-dependent and cannot be reliably automated. User must verify these scenarios:

### 1. Cold Chrome (incognito or fresh profile)
- Open `http://localhost:3000/watch` in **new** incognito window
- **Expected:** video plays muted, "🔊 Tap for sound" pill visible bottom-right of video, pill pulses subtly
- Click pill → audio comes on, pill collapses to small mute icon
- Click pill again → audio mutes, pill returns to "Tap for sound" state

### 2. Warm Chrome (regular profile, after multiple `/watch` visits)
- After Chrome's MEI accrues, video may autoplay WITH sound on load
- Mute icon (not "Tap for sound" pill) should appear bottom-right
- Click → mutes
- Acceptable if still starts muted on first reload — MEI is heuristic

### 3. iOS Safari (real device or simulator)
- Open `/watch`
- **Expected:** muted autoplay + "Tap for sound" pill
- Tap pill → audio comes on

### 4. YouTube Link Integrity
- Click anywhere on video EXCEPT the pill
- **Expected:** new tab opens to YouTube watch URL (preserves prior behavior)

### 5. Image Fallback
- Set `featured.videoSrc` to `undefined` in content data temporarily
- **Expected:** image renders with play-button overlay, no `<HeroVideo>` mounted

### 6. Keyboard Accessibility
- Tab to pill → visible focus ring
- Press Enter or Space → toggles audio state

### 7. ARIA + Lighthouse
- DevTools inspect pill → `aria-label` reflects state ("Unmute video" / "Mute video"), `aria-pressed` matches
- Run Lighthouse a11y audit on `/watch` → expect no new violations vs baseline

## Code Review Outcome

Per `code-reviewer-260515-1545-hero-video.md`: **APPROVE_WITH_NITS**. All three nits applied (`autoPlay` removed, `cn` helper adopted; effect-cleanup intentionally skipped — benign in React 19 per reviewer).

## Status

**Status:** DONE_WITH_CONCERNS
**Summary:** Automated checks pass. Manual cross-browser smoke testing required from user — cannot be automated without browser test infrastructure.
**Concerns/Blockers:** None blocking. User must execute Phase 3 manual checklist on real browsers.

## Unresolved Questions

None.
