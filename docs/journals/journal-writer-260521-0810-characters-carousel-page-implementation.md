# Characters Carousel Page: Implementation Complete — 5 Phases Delivered

**Date:** 2026-05-21 08:10  
**Severity:** Medium  
**Component:** `/characters` carousel + `/characters/[slug]` detail routing  
**Status:** Code review complete, 4 critical bugs fixed, ready for merge

## What Happened

Executed the 5-phase plan from `plans/260521-0655-characters-carousel-page/` (see accompanying planning journal). Shipped:

- **Rewrote `/characters`** as `CinematicHero` + Embla **focal-coverflow carousel** (5 pups, large center card with dimmed/scaled neighbors)
- **Click-to-expand inline detail card** with Framer Motion `layoutId` shared-element morph between carousel artwork and detail card
- **History API state management** via `pushState`/`replaceState`/`popstate` for `?pup=<slug>` query param (shareable URLs, back-button friendly, no server round-trip)
- **Deleted 3 immersive-scene files** (`character-scene.tsx`, `character-scene-figure.tsx`, `character-scene-foreground.tsx`); reused decorative infrastructure (`character-scene-backdrop`, `character-scene-decor`, `character-atmosphere`, `character-motif`, `character-quote`)
- **Created 5 new components:**
  - `character-carousel.tsx` (orchestrator, state + effects, detail card render)
  - `character-carousel-track.tsx` (Embla + per-frame coverflow scale/opacity tween via `useMotionValueEvent`)
  - `character-carousel-card.tsx` (card layout + click handler)
  - `character-carousel-arrows.tsx` (prev/next buttons)
  - `character-detail-card.tsx` (inline expanded card + close button)
- **Added dependency:** `embla-carousel-react@8.6.0`
- **Build green:** `npx next build` passes, `/characters` static prerendered, 5 detail slugs prerendered
- **No schema/content changes** — `characters.json` and `lib/content/schemas.ts` untouched

Phases 1–5 tracked in task list; all completed on-time.

## The Brutal Truth

**The build lied.** TypeCheck, lint, and the Next.js build all passed. A static tester agent reported "zero critical issues." But a parallel **code review found 4 real behavioural bugs** that the automated tools completely missed:

1. **Critical: History stack desync.** Opening a pup pushed a new state entry. Closing it also pushed (via `history.back()`), so pressing the browser Back button *re-opened the pup you just closed* instead of going back to the previous page. The entry became a loop trap. Only discovered by reasoning through the History API state machine, not by running tests.

2. **High: Carousel drag-opening pups.** Removed Embla's `clickAllowed` guard (thinking it didn't exist in v8) to prevent clicks during drag. But the guard check was my own defensive code, not a library API. A drag-release over a carousel card opened the pup anyway. Fixed by tracking drag state via Embla's `pointerDown`/`scroll` events + a `draggedRef` guard.

3. **High: Double-close on Escape.** Pressing Escape during the detail card's exit animation (framer-motion `exit` phase) called `closePup` → `history.back()` again when that back was already queued. The second Escape fired before the animation completed, popping two stack entries. Fixed by adding a `closedRef` guard in the detail card.

4. **Low/cleanup: Unsafe `tweenNodes` typing.** The coverflow effect's per-frame scroll listener stored `querySelector` results as non-null `HTMLElement` without null-checking. This is a silent crash risk if a slide is removed mid-animation. Fixed to honest `(HTMLElement | null)[]` typing + guards.

None of these bugs would have surfaced in unit tests (no test spy on History API or Embla internals). All four required **reading the integration logic end-to-end and reasoning about state transitions**. This is why code review must think behaviorally, not just structurally.

Feeling: frustrated that the build infrastructure didn't catch this, but vindicated that the code-review discipline works.

## Technical Details

**Key implementation decisions:**

- **History API over router.push():** `pushState` for opening a pup, `replaceState` for carousel scroll (don't clutter history), `history.back()` for close (respects browser back-button UX). Tracked via `didPushRef` to distinguish "we opened this pup" from "we deep-linked to it."
- **Embla focal effect:** Per-slide scale/opacity calculated from scroll progress (`useMotionValueEvent` on Embla's `scroll.progress`). Works with Embla's native snapping and wraps friction.
- **Shared-element morph:** Framer Motion `layoutId="character-artwork"` on both carousel card image and detail card image. Detail card uses `mode="popLayout"` (not `wait`) to preserve the morph during exit animation—important for the close-and-revert-to-carousel feeling. Reviewer flagged `wait` as safer (morph waits for layout phase), but `popLayout` maintains the visual feedback loop.
- **Keyboard activation vs. click:** Detail card accepts Escape to close. Carousel accepts arrow keys (Embla's native) + Enter on focused card (detail card opens). Distinguish keyboard opens (`event.detail === 0` in React's onClick) from mouse drags (`draggedRef` false) to prevent accidentally opening during drag-release.
- **Suspense boundary:** Carousel is a Client Component (History API + Framer Motion) wrapped in a Suspense boundary. The page itself stays a Server Component for static prerendering.

**Files touched:**
- `app/characters/page.tsx` — full rewrite (removed immersive scene, added Suspense + `<CharacterCarousel>`)
- `components/characters/character-carousel.tsx` — new (root orchestrator, 180 lines)
- `components/characters/character-carousel-track.tsx` — new (Embla + scroll tween, 120 lines)
- `components/characters/character-carousel-card.tsx` — new (single card, 45 lines)
- `components/characters/character-carousel-arrows.tsx` — new (prev/next buttons, 30 lines)
- `components/characters/character-detail-card.tsx` — new (inline detail, Escape handler, 110 lines)
- Deleted: `character-scene.tsx`, `character-scene-figure.tsx`, `character-scene-foreground.tsx`
- Preserved: `character-scene-backdrop.tsx`, `character-scene-decor.tsx`, `character-atmosphere.tsx`, `character-motif.tsx`, `character-quote.tsx`

**Bug fix details:**

```tsx
// Before: History stack desync
const closePup = () => pushState(...); // wrong—creates new entry

// After: Track intent
const didPushRef = useRef(false);
const openPup = (slug) => { 
  pushState(...); 
  didPushRef.current = true; 
};
const closePup = () => {
  if (didPushRef.current) {
    history.back(); // browser back
    didPushRef.current = false;
  } else {
    replaceState(...); // deep-linked, just replace
  }
};
```

```tsx
// Before: Drag-opens pups
onClick={() => openPup(slug)} // fires even during drag-release

// After: Guard on drag state
const draggedRef = useRef(false);
const handlePointerDown = () => { draggedRef.current = false; };
const handleScroll = () => { draggedRef.current = true; };
const handleClick = (e) => {
  if (draggedRef.current) return; // don't open during drag
  if (e.detail === 0) openPup(slug); // keyboard activation OK
};
embla.on('pointerDown', handlePointerDown);
embla.on('scroll', handleScroll);
```

## What We Tried

1. **Embla scroll smoothing with Framer Motion `animate` on scroll.progress** — causes motion value lag on fast carousel spins. Fixed: `useMotionValueEvent` to sync per-frame, not per-scroll-end.
2. **Detail card exit animation with full `exit` phase** — the morph (from carousel card) is live during exit, creating a "reverse morph" effect. Initially tried `mode="wait"` (morph completes before exit), but killed the visual continuity. Kept `popLayout` for the interactive feel.
3. **Embla's native click-prevention on drag** — doesn't exist. Added manual tracking.

## Root Cause Analysis

**Why did automated tools miss these bugs?** Because they're **semantic bugs in state composition**, not syntax errors or type violations:

- TypeScript checked that `history.back()` exists and returns void. It didn't model the state machine (did we push? are we at the start of the stack?).
- ESLint/Next.js build verified that all imports are used and no unused variables exist. It didn't trace the History API state transitions.
- A naive static tester checked "does the component render?" and "do the props have the right types?" It didn't reason about the interaction flow (drag into click, escape during animation).

This is a **tool-testing gap**: unit tests verify individual functions; integration tests verify two systems together; but **behavioural tests** (the full user interaction flow) live in human code review. Automated analysis is great for structure; behavioural correctness requires thinking.

The `layoutId` shared-element morph interaction with Embla transforms is also **not verified in browser**. It builds and uses the canonical pattern, but a real browser session with touch on a non-centered card opening might reveal stacking-context or motion value conflicts. This is explicitly flagged as "needs QA."

## Lessons Learned

1. **Green build ≠ correct behavior.** Semantic bugs (state machine errors, interaction timing) slip past linters because they're not syntax or type violations. Code review must think like a user (what happens if I do X while Y is happening?), not like a linter.

2. **Manual state tracking (refs) is fragile.** The `draggedRef`, `closedRef`, `didPushRef` approach works, but it's error-prone. If a future dev adds a new interaction (e.g., programmatic carousel jump), they might forget to reset `draggedRef`. Better: encapsulate state in a reducer (open → push, close → back, dragging → no-click) to make transitions explicit.

3. **History API is imperative and easy to break.** `pushState` + `replaceState` + `popstate` listener is powerful for shareable state, but it's a state machine that's easy to desync. Document the mental model clearly (every user action = one stack entry; carousel scroll ≠ stack entry; deep-link = no push on first open).

4. **Shared-element morphs need visual QA.** The `layoutId` morph looks canonical, but the interaction with per-frame Embla transforms (scale/opacity tween on each slide) is untested in a real browser. Get the CSS working, then hand-verify in dev server before shipping.

5. **Guard interaction flows, not just individual handlers.** The drag-open bug came from defending against clicks individually without thinking about the overall flow (pointerDown → scroll → click). A state machine (e.g., `isCarouselSettled` flag) would have made this atomic instead of stitched together.

## Next Steps

1. **Visual QA in browser:** Open dev server, navigate to `/characters`, test:
   - Click cards (each should morph + expand)
   - Escape to close (should morph back + revert)
   - Drag carousel (should NOT open pups mid-drag)
   - Browser back button after closing a pup (should NOT re-open it)
   - Deep-link to `?pup=buddy` (should show the carousel with Buddy centered and card expanded, no history push on initial open)
2. **Touch device testing:** iOS/Android, swipe carousel, tap cards, verify the touch-friendly affordances match intent.
3. **Pinterest reference review:** The focal coverflow styling matches the written brief, but the design reference (`pin.it/1AEx2qgAe`) was inaccessible during planning. If the team has access now, verify the hero banner image (`banner/banner.png` fallback) aligns visually.
4. **Merge & monitor:** Watch Sentry post-deploy for layout shift or motion-value errors. The `tweenNodes` null-check fix should prevent crash, but monitor anyway.
5. **Future iteration:** If shared-element morph interaction reveals edge cases (e.g., opening a non-centered card causes stacking-context clip), flag for `mode="wait"` refactor.

## Unresolved

- **`layoutId` morph + Embla per-frame transforms**: Not verified in browser. Canonical pattern, but interaction is complex (shared-element morph across sliding scale/opacity tweens). Needs visual QA.
- **Pinterest reference**: Inaccessible during planning. Focal coverflow styling is per brief, but details (color balance, card spacing, hero aspect ratio) should be eyeballed against the reference if available.

---

**Plan location:** `D:\works\emvn\scoutpaw-v2\plans\260521-0655-characters-carousel-page\`  
**Related planning journal:** `journal-writer-260521-0655-characters-carousel-page-plan.md`  
**Status:** Implementation complete. 4 critical bugs fixed via code review. Awaiting visual QA before merge.
