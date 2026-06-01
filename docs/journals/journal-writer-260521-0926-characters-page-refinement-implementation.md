# Characters Page Refinement: Implementation Complete — Visual Cohesion, Carousel Retuned, Bugs Found Again

**Date:** 2026-05-21 09:26  
**Severity:** Medium  
**Component:** `/characters` layout, carousel coverflow, detail card transitions  
**Status:** Code review complete, 3 real bugs fixed, typecheck/lint/build green, ready for merge

## What Happened

Executed Phase 1–5 of the refinement plan from `plans/260521-0823-characters-page-refinement/` (see companion planning journal). Shipped:

- **Hero swapped to Home's `FullBleedHero` + `CloudDivider` rhythm** — `/characters` now visually echoes `/` (home).
- **Carousel coverflow retuned:** Focal card centered, 3 adjacent cards fully visible (none clipped); slide basis rebalanced to 86% / 52% / 33.2%, `MIN_SCALE` 0.86, `TWEEN_FACTOR_BASE` 0.14.
- **Removed `CharacterSceneBackdrop` sky-gradient block** — carousel now blends into site background; replaced with faint ambient decor (`character-carousel-ambient.tsx`).
- **Uniform calm white carousel cards** — per-pup gradient now exclusive to detail card.
- **Navigation arrows only** — pagination dots removed; `character-carousel-arrows.tsx` exports single `ArrowButton` for left/right.
- **Cinematic transition rework:** Click a side card → scroll to center → expand on Embla's `settle` event; carousel recedes, `layoutId` morph executes, staggered detail copy via Framer `variants`, unified easing `[0.16,1,0.3,1]`.
- **Cleanup:** Deleted `character-scene-backdrop.tsx` + `character-scene-data.ts` (no longer needed).
- **Performance:** First Load JS dropped 179 kB → 164 kB; `/characters` static prerendered, `/characters/[slug]` untouched.

**Code review again caught 3 real bugs.** Typecheck, lint, build all green; a static tester agent reported "zero issues." The parallel code reviewer found actual shippable-blocking defects:

1. **High: `returning` state never reset.** Flag was set on close-animation-end but never reset when a pup opened again. The carousel's autofocus effect would steal focus on remount. Fixed: `setReturning(false)` when detail card opens, so the flag now means "the last transition was a close" (scoped to that transition, not permanent).

2. **High: `openingRef` / `settle`-listener safety.** A missed Embla `settle` event after clicking a side card would leave the card permanently unopenable (the `openingRef` guard never clears). Fixed: Fallback timeout ensures the open fires even if `settle` doesn't fire, plus unmount cleanup for the timer to prevent stale callbacks.

3. **Medium: File-size violation.** Carousel track exceeded 200-line project rule (220 lines). Fixed: Extracted coverflow tween into `use-carousel-coverflow.ts` hook (93 lines); carousel track now 155 lines, detail card 199 lines. All files now within bounds.

## The Brutal Truth

**The tester-vs-reviewer divergence is now a repeating pattern, and it's revealing a real tool-testing gap.**

This is the **second carousel implementation** (first carousel, then refinement), and the **second time in a row** the tester declared the code "production-ready" while the reviewer found genuine state-management bugs. The pattern is undeniable:

- **Tester** (static analysis, structure checks): "No unused imports, all types safe, build succeeds → zero issues."
- **Reviewer** (behavioral reasoning): "State set but never reset → focus-stealing bug on remount. Event listener guard never clears → card unopenable if settle doesn't fire."

A green build is **not evidence of correctness for stateful interaction code**. The reviewer thinks about behavior over time (state lifecycle, event ordering, edge cases); the tester checks structure (syntax, imports, TypeScript contracts). Same divergence happened in round one (history-stack desync, drag-open, double-close). Same bug shape in two consecutive rounds (state set-once, never reset, "works only because the component happens to unmount").

**Honest feeling:** This is incredibly frustrating and also clarifying. The tester step adds no value for this kind of UI work. The code review is the real gate. Either the tester needs to reason about behavior (harder), or it shouldn't be part of the pipeline for client-side interaction code. Three implementations deep, and the pattern is clear.

## Technical Details

**Key implementation changes:**

- **Carousel coverflow parameters:** Slide basis split: first card 86% (focal), second 52% (half-scale, visible), third 33.2% (quarter-scale, visible). `MIN_SCALE` 0.86 ensures neighbor cards stay >0.8× readable. `TWEEN_FACTOR_BASE` 0.14 (was 0.16) softens the intermediate card scale.
- **Hero + divider:** Copied `<FullBleedHero>` + `<CloudDivider>` from `home/page.tsx`. Added `character-carousel-ambient.tsx` with low-opacity decorative circles (motion-safe only, respects `prefers-reduced-motion`).
- **Center-first click logic:** Embla instance gets `clickAllowed: false` during active drag. On side-card click, carousel scrolls to that slide (Embla's native `scrollTo` + `settle` listener), then detail card expands. This separates concerns: scroll first, expand second.
- **`settling` state guards expansion:** Detail card only expands once Embla fires the `settle` event (carousel has stopped moving). A `useEffect` watches `settledIndex` → if it matches the `openingRef` slug, fire the expand (Framer `AnimatePresence`).
- **Timeout fallback:** If `settle` never fires (Embla bug or edge case), a 400ms timeout forces the open. Cleanup on unmount cancels the timer.

**Files touched:**
- `app/characters/page.tsx` — swapped hero to match home, added ambient decor
- `components/characters/character-carousel.tsx` — updated click handler (center-first logic), revised opening state logic
- `components/characters/character-carousel-track.tsx` — reduced to 155 LOC after hook extraction
- `components/characters/use-carousel-coverflow.ts` — new hook (93 LOC), coverflow tween calculation factored out
- `components/characters/character-detail-card.tsx` — reduced to 199 LOC, guard against stale callbacks
- `components/characters/character-carousel-ambient.tsx` — new, low-opacity decor circles
- `components/characters/character-carousel-arrows.tsx` — no changes (already minimal)
- Deleted: `character-scene-backdrop.tsx`, `character-scene-data.ts`

**Bug fix details:**

```tsx
// Before: returning never reset
const handleAnimationEnd = () => setReturning(true);
// Detail card opens, but returning is still true—focus effect fires again

// After: Reset on open
const openPup = (slug) => {
  setReturning(false); // close transition is over, reset flag
  setOpeningSlug(slug);
};
```

```tsx
// Before: settle listener guard never clears
const handleSettle = () => {
  if (openingRef.current) openDetail();
};
embla.on('settle', handleSettle);
// If settle doesn't fire, openingRef remains set. Next click won't work.

// After: Fallback + cleanup
const timeoutRef = useRef<NodeJS.Timeout | null>(null);
const handleSettle = () => {
  if (openingRef.current) {
    clearTimeout(timeoutRef.current!);
    openDetail();
  }
};
const handleClick = (slug) => {
  openingRef.current = slug;
  // Fallback: fire after 400ms even if settle doesn't fire
  timeoutRef.current = setTimeout(() => {
    if (openingRef.current) openDetail();
  }, 400);
  embla.scrollTo(index);
};
embla.on('settle', handleSettle);
useEffect(() => () => clearTimeout(timeoutRef.current!), []);
// Cleanup on unmount cancels pending timer
```

## What We Tried

1. **Per-slide scale tween in `useMotionValueEvent`** — works, but the carousel felt "sticky" when settling. Reduced `TWEEN_FACTOR_BASE` to smooth the deceleration curve; added intermediate visible card (33.2% basis) so the carousel doesn't jump empty space.

2. **Detail card expand via `layoutId` on `settle`** — the `layoutId` morph was executing before Embla finished settling, causing a visual hitch (card would morph then snap-scale). Fixed: Wait for `settle` event + `settledIndex` state update before expanding.

3. **Ambient decor with full-opacity backdrop** — looked too heavy, competed with carousel. Dialed back to low opacity (`opacity-15`) + motion-safe guards; now it's subtle atmospheric texture, not a visual anchor.

## Root Cause Analysis

**Why do the same state bugs repeat?** The underlying mistake is the same shape:

- **Round 1 (history-stack):** Open and close both pushed state (thought they were different operations; they weren't). Lesson: track intent, not just effect.
- **Round 2 (this implementation):** Set state on close, never reset on open. State's lifecycle wasn't explicit. Lesson: make state scope clear (is it "currently closing" or "was the last transition a close"?).

The pattern: **imperative state management in event callbacks** is fragile. A ref or state that's set in one handler and checked in another creates hidden dependencies. A future dev reads the close handler, doesn't see an open handler resetting the flag, and assumes it's not needed.

**Why does the tester miss this?** Because it checks **structure** (types, syntax, build success), not **state transitions over time**. A static linter doesn't trace the interaction flow or ask "when should this flag be false?" That requires behavioral reasoning, not pattern matching.

## Lessons Learned

1. **Green build ≠ correct behavior.** Same lesson from round one, but now it's undeniable. Typecheck, lint, build all passed both times. The bugs were **behavioral** (state lifecycle, event ordering), not structural. For client-side interaction code, code review is the real gate.

2. **Tester agent's value is limited for UI interaction.** The tester reports "zero critical issues" because it checks structure (imports, types, build success). It doesn't reason about state machines or event timing. For features without complex stateful interaction (data fetching, rendering, layout), it's useful. For this kind of carousel + detail card + transition choreography, it's cargo-cult validation.

3. **Make state scope explicit in names and comments.** `returning` could be `isReturningFromDetail` or `closedDuringLastRender`. `openingRef` could be `pendingOpenSlug`. Clearer names make it obvious when a flag should be reset.

4. **Fallback timeouts are insurance, not fixes.** The settle-listener timeout doesn't fix the bug (event ordering). It's a guard against unknown edge cases. But it masks the real problem: we're relying on Embla firing an event that's not guaranteed. Better: refactor to event-independent state (e.g., scroll position change → open detail, don't wait for settle).

5. **Hook extraction for 200-LOC rule is working.** Splitting `use-carousel-coverflow.ts` brought track from 220 → 155 LOC. Future dev can understand track logic in isolation, and the hook's input/output is clear. Worth doing earlier next time.

## Next Steps

1. **Visual QA in browser:** Open dev server, navigate to `/characters`. Test:
   - Click a side card (should scroll to center then expand).
   - Escape to close (should collapse, carousel recede, focus return).
   - Click another side card during the first card's open animation (should queue correctly, no state collision).
   - Carousel drag + release on a card (should NOT open pup mid-drag).
   - Ambient decor visibility (should be subtle, not compete with carousel).

2. **Touch testing:** iOS/Android, swipe carousel, tap cards. Verify the "center-first" scroll + expand feels natural on touch.

3. **`layoutId` morph verification:** The shared-element morph is the riskiest visual element (Framer Motion across Embla transforms). A real browser session should confirm the morph is clean and doesn't reveal stacking-context issues.

4. **Merge & monitor:** Watch Sentry for settle-listener timeouts or focus-stealing bugs. The timeout fallback should prevent console spam, but monitor event logs post-deploy.

---

**Plan location:** `D:\works\emvn\scoutpaw-v2\plans\260521-0823-characters-page-refinement\`  
**Related planning journal:** `journal-writer-260521-0823-characters-page-refinement-plan.md`  
**Related prior implementation:** `journal-writer-260521-0810-characters-carousel-page-implementation.md`  
**Status:** Implementation complete. 3 behavioral bugs fixed via code review. Stateful interaction code verified through reviewer reasoning, not static testing. Awaiting visual QA before merge.
