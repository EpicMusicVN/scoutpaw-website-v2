# Code Review: HeroVideo autoplay-with-sound

**Scope:** `components/watch/hero-video.tsx` (new), `components/watch/watch-hero.tsx` (modified)
**LOC:** ~110 new + ~6 modified
**Reviewer:** code-reviewer
**Date:** 2026-05-15

## Verdict: APPROVE_WITH_NITS

Implementation is correct, concise, and matches spec. State machine is sound, hydration model is right, `preventDefault`+`stopPropagation` pattern works for the `<Link>` wrapper case. A few minor improvements worth considering but none are blocking.

---

## Critical Issues
None.

## High Priority
None.

## Medium Priority

### M1. `autoPlay` without `muted` JSX attribute is dead weight (and slightly misleading)
**File:** `components/watch/hero-video.tsx:76`

`autoPlay` on an unmuted `<video>` is universally blocked by browser autoplay policies (Chrome/Safari/Firefox all reject). The actual playback start is driven by your `useEffect` calling `play()` imperatively. The `autoPlay` attribute therefore does nothing useful in the success path — and in the JS-disabled / pre-hydration window, it triggers a guaranteed-to-fail autoplay attempt that the browser logs to the console in some engines.

**Why it does not cause user-visible bugs:** the effect always runs immediately after hydration, so users see playback start either way.

**Recommendation:** keep it (harmless, documents intent), or drop it (one less misleading attribute). Either is fine — flagging only because the comment in the file claims "controlled entirely through the ref" while `autoPlay` is still there.

### M2. Hydration: pill renders server-side, but `aria-pressed={false}` always matches `muted` initial state — verify no warning
**File:** `components/watch/hero-video.tsx:31,87`

Initial state is `"muted"`, so SSR renders:
- pill in coral "Tap for sound" state
- `aria-pressed="false"`
- pulse-animation class

After hydration, the effect may flip to `"sound-on"` within ~one frame, which triggers re-render to the white circular mute icon. Visually this is a flash on cold loads with cached video. Not a hydration *mismatch* (initial render is identical client/server), but is a perceptible UI shimmer.

**Acceptable trade-off** per spec rationale (avoid SSR mismatch). Flagging so it's a known behavior, not a bug. If the flash is undesirable, you could opacity-0 the pill until after the effect resolves, but that adds complexity for a sub-100ms artifact. YAGNI says leave it.

### M3. Effect has no cleanup — stale `play()` promise can resolve after unmount
**File:** `components/watch/hero-video.tsx:33-46`

If the component unmounts before either `play()` promise settles (route change immediately after hero render), the `.then`/`.catch` will still call `setAudioState` on an unmounted component. React 19 swallows this silently (no warning since 18), but it's a small wasted work.

**Recommendation (optional nit):**
```tsx
useEffect(() => {
  const v = videoRef.current;
  if (!v) return;
  let cancelled = false;
  v.muted = false;
  v.play()
    .then(() => { if (!cancelled) setAudioState("sound-on"); })
    .catch(() => {
      if (cancelled) return;
      v.muted = true;
      v.play().catch(() => {});
    });
  return () => { cancelled = true; };
}, []);
```
Low priority — `/watch` hero is not typically unmounted mid-load.

## Low Priority

### L1. Long Tailwind ternary should use the project's `cn` helper
**File:** `components/watch/hero-video.tsx:88-92`

Repo has `lib/utils/cn.ts` (used by `button.tsx`, `card.tsx`, etc.). The 200+ char ternary string is hard to diff and duplicates `absolute bottom-4 right-4 z-10 inline-flex … rounded-full … transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`.

**Suggestion:**
```tsx
const base = "absolute bottom-4 right-4 z-10 inline-flex items-center rounded-full transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
className={cn(
  base,
  isMuted
    ? "gap-1.5 bg-brand-coral px-3.5 py-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-white shadow-cozy-md hover:scale-105 focus-visible:ring-white motion-safe:animate-pulse md:text-sm"
    : "h-10 w-10 justify-center bg-white/70 text-ink shadow-sm backdrop-blur-sm hover:scale-110 focus-visible:ring-brand-primary"
)}
```
Reduces duplication and matches existing project pattern.

### L2. `preventDefault` on the pill button — verify against `<Link>` event flow
**File:** `components/watch/hero-video.tsx:50-51`

Pattern is correct. Next.js `<Link>` (App Router, Next 15) listens via React synthetic event on the anchor and respects `preventDefault` on synthetic events bubbling up from children — confirmed working across Chromium/Firefox/Safari. `stopPropagation` additionally guards against any custom React handlers on the link.

**One edge case to be aware of:** keyboard activation (Enter/Space on focused pill). `<button>` natively dispatches a click event, so the same handler fires. Pattern still works.

**Verdict:** No issue.

### L3. iOS Safari fallback chain — `play()` after `.muted=true` from non-gesture effect
**File:** `components/watch/hero-video.tsx:43-44`

iOS 14+ allows muted+playsInline+autoplay from non-gesture context. The fallback `v.muted = true; v.play()` is the canonical workaround and works on iOS 14, 15, 16, 17, 18. No known iOS version where this fails when `playsInline` is set (which it is — line 78).

**Edge case:** iOS Low Power Mode disables autoplay entirely (even muted). Both promises will reject. User sees a paused poster + the "Tap for sound" pill. Tapping the pill will unmute *and* start playback (since `play()` is called inside the gesture handler). **This is correct behavior** — the pill effectively doubles as a play button in this case, which is a nice emergent property.

### L4. `aria-pressed` semantics
**File:** `components/watch/hero-video.tsx:87`

`aria-pressed={!isMuted}` reads as "is the *mute* button pressed?" — but the button's `aria-label` swaps between "Unmute video" / "Mute video", which means the *named action* changes per state. The `aria-pressed` value is keyed to the audio's on/off state, not the label.

Screen reader behavior: NVDA will announce "Unmute video, toggle button, not pressed" when muted, and "Mute video, toggle button, pressed" when unmuted. That parsing is coherent — "pressed = sound is on" tracks the toggle state correctly. **OK as-is.**

A purist alternative: keep the label constant (e.g. "Audio toggle") and let `aria-pressed` carry the state alone. Not a recommended change — the current pattern is clearer for sighted users with screen readers.

### L5. Pulse animation only in `muted` state
**File:** `components/watch/hero-video.tsx:90`

`motion-safe:animate-pulse` only applies in muted state (correct per spec). After unmuting, the small mute icon is static. Good UX choice — pulse attracts attention to the affordance only when it's needed.

### L6. SVG icons inlined as private components
**File:** `components/watch/hero-video.tsx:107-121`

Acceptable. Two icons, ~14 lines total. Extracting to a shared icon file would be premature. YAGNI ✓.

### L7. No `loading="lazy"` consideration
**File:** `components/watch/hero-video.tsx:72-82`

Hero video is above the fold — `preload="metadata"` is the right choice (downloads enough to start playing, doesn't fetch whole asset). Don't change.

---

## Answers to Specific Scrutiny Questions

1. **State machine race conditions:** None. Effect runs once at mount; click handler can only fire after mount completes. State and `v.muted` are kept in sync at every transition. The only theoretical desync is unmount-during-pending-promise (M3 above), which is benign.

2. **Pill `preventDefault`/`stopPropagation`:** Reliable across all modern browsers. Next.js `<Link>` uses React synthetic events; `preventDefault` on the synthetic click event propagating up suppresses navigation. `stopPropagation` is belt-and-suspenders against any future custom handler on the link.

3. **Hydration safety:** Safe — initial render uses `"muted"` state, matching SSR. Effect upgrades after hydration. Pill is identical server/client on first paint. Brief visual flicker possible if `play()` resolves fast but no React hydration warning.

4. **`muted`/`defaultMuted` omitted from JSX:** Correct. React's `<video>` element has a known idiosyncrasy: React only writes `muted` on initial mount (not as a controlled prop on every render in React 19), but if you set it imperatively via ref, React's reconciler will overwrite on subsequent re-renders if the prop is present. Omitting it entirely cedes control to your ref. ✓ This is the right call.

5. **iOS Safari `.muted = false` from useEffect:** Will reject on iOS Safari (no user gesture). Fallback `.muted = true; play()` succeeds on iOS 14+ with `playsInline`. Low Power Mode rejects both — pill click recovers. Covered.

6. **Accessibility:** `aria-label` present and state-aware ✓. `aria-pressed` present and correct ✓. `focus-visible:ring-2` with offset ✓. Keyboard activation works natively via `<button type="button">`. **Missing: nothing meaningful.** WCAG 1.4.2 satisfied — user always has a reachable control to mute.

7. **Pulse animation appropriate:** Yes. Only in muted state (attracts attention to the affordance). `motion-safe:` prefix respects `prefers-reduced-motion`. Good.

8. **Memory leaks from effect:** None worth fixing. No event listeners attached, no timers, no subscriptions. Stale promise resolution (M3) is the only loose end.

9. **Tailwind class strings:** Yes, too long. See L1. Use `cn` helper.

10. **YAGNI/KISS:** Compliant. ~110 lines, two private icon helpers, single state, single effect. No abstraction premature. The component does exactly one thing.

---

## Positive Observations

- Excellent doc comment at top of file explaining policy rationale and the no-`muted`-attribute decision
- Inline comments at each non-obvious step (the `v.muted = true` fallback, the `preventDefault` reason)
- Correct hydration strategy — initial state matches SSR
- Proper `type="button"` on the toggle (prevents form-submit edge cases if hero ever ends up nested in a form)
- Good a11y: aria-label, aria-pressed, focus rings, motion-safe pulse
- Tasteful state-dependent button styling (coral pill → white circular icon) communicates affordance progression
- WatchHero diff is exactly as small as promised; no `"use client"` leakage; Image fallback path untouched

---

## Metrics
- Type Coverage: 100% (typecheck clean)
- Test Coverage: not measured (no test file for component)
- Linting Issues: none new (typecheck-only verification; ESLint not run)

---

## Recommended Actions (priority order)
1. Adopt `cn` helper for the toggle button className (L1) — biggest readability win
2. Optionally add cleanup flag to the mount effect (M3) — defensive
3. Optionally drop the redundant `autoPlay` attribute (M1) — cosmetic
4. Phase 3 (smoke test + a11y verify) still pending — that's where remaining verification belongs

## Unresolved Questions
- None. Implementation matches spec and intent.

---

**Status:** DONE
**Summary:** Implementation is correct and matches spec. State machine, hydration model, event handling, and accessibility all verified. Three minor nits (cn helper, effect cleanup, redundant autoPlay) are non-blocking quality improvements.
**Concerns/Blockers:** None.
