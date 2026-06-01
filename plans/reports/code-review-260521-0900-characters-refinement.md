# Code Review — Characters Carousel Refinement

Date: 2026-05-21
Scope: 8 files (refinement of an already-shipped carousel). Build/typecheck/lint verified green by author.
Reviewer focus: center-first click logic, coverflow math, framer-motion stagger/morph, `selectedIndex` removal, hooks.

## Overall Assessment

Solid, well-commented refinement. The center-first interaction is thoughtfully guarded and the
event-listener cleanup in the main tween effect is correct. No Critical defects. Two High items
center on state that is never reset (`returning`, `openingRef`) — both currently work *only*
because the track component remounts, which is fragile coupling. Two files breach the 200-LOC rule.

---

## Critical

None.

---

## High

### H1. `returning` is set but never reset — `autoFocus` becomes permanently `true`
`character-carousel.tsx:38,54,87` + `character-carousel-track.tsx:137-141`

`setReturning(true)` fires in `closePup` (L87) and in the `popstate` handler (L54), but nothing
ever sets it back to `false`. After the first open→close cycle, `autoFocus` stays `true` forever.

The track's autoFocus effect (`character-carousel-track.tsx:137-141`) depends on `[emblaApi, autoFocus]`.
Because `autoFocus` is now permanently `true`, the effect fires on **every** `emblaApi` change —
i.e. every track remount and every embla re-init that produces a new api reference. That means a
deep-linked visitor who closes a pup, or any later track remount, will have focus yanked onto a
carousel card with `preventScroll:true` even when the user did not request it (e.g. they were
scrolled elsewhere on the page). It is a focus-stealing accessibility bug, not just dead state.

Expected: reset `returning` to `false` after the focus has been consumed (e.g. an effect in the
orchestrator, or have the track call back once focused). The flag should be a one-shot.

### H2. `openingRef` is never reset — relies entirely on track unmount
`character-carousel-track.tsx:56,147,154`

`openingRef.current` is set to `true` and never cleared. The double-open guard works *only*
because opening a pup unmounts `CharacterCarouselTrack` (AnimatePresence `popLayout` swap), and a
fresh mount gets a fresh `openingRef = false`. This is correct today but is invisible coupling:
the guard's correctness depends on an unmount happening in a sibling component. If a future change
keeps the track mounted (e.g. switches to `mode="sync"`, renders both, or animates without
unmount), the carousel becomes permanently un-clickable after the first selection with no obvious
cause. At minimum reset `openingRef.current = false` inside the `settle`/immediate paths is not
possible (track unmounts), so document the dependency loudly or move the guard to the orchestrator
where its lifecycle matches the state it protects.

### H3. Leaked `settle` listener if `settle` never fires
`character-carousel-track.tsx:155-160`

`onSettle` is the *only* place the `settle` listener is removed. The main cleanup effect
(L124-133) does **not** `off("settle", ...)` — `onSettle` is a closure created per click, unknown
to that effect. If `settle` never fires for the pending `scrollTo`, the listener leaks AND the
card never opens (a dead, un-openable card until the user clicks again — which is blocked by
`openingRef`, so the card is permanently dead until remount).

When can `settle` not fire?
- `scrollTo(index)` where `index === selectedScrollSnap()` — embla emits no scroll and may not
  emit `settle`. This path is guarded at L149 (already-centered → immediate open), so safe.
- The component unmounts before settle. Then the stale closure holds an `emblaApi` reference;
  `emblaApi.off` in `onSettle` would run against a destroyed instance if it ever fired. Embla
  tolerates `.off` after `destroy`, but `onSelect` would then call `setState` on an unmounted
  parent. Unmount-before-settle is unlikely here (only `onSettle`→`onSelect` triggers the
  unmount) but is not defended.

Recommend: register the `settle` listener with a guard that also clears on effect cleanup, or add
a timeout fallback that opens the card if `settle` has not fired within ~`duration`.

---

## Medium

### M1. Rapid clicks on two *different* side cards
`character-carousel-track.tsx:145-163`

Click side card A: `openingRef=true`, `settle` listener A registered, `scrollTo(A)`. A second
click on card B is correctly blocked by `openingRef` at L147 — good. But the click on B is fully
swallowed with no feedback; the carousel will scroll to A and open A even though the user's last
intent was B. Acceptable for a guard, but worth confirming this is the intended UX (first-click-wins
mid-flight). A `pointer-events-none` on the track during the opening transition would make the
swallowed click visible/intentional rather than silently ignored.

### M2. Click-during-drag-momentum can still open the wrong card
`character-carousel-track.tsx:104-109,182`

`draggedRef` is set `false` on `pointerDown` and `true` on `scroll`. A drag that releases with
momentum still-settling: `pointerUp` fires, the synthetic `click` fires (`event.detail !== 0`,
`draggedRef === true`) → correctly suppressed. Good. But a *tap* (no drag) immediately after a
momentum scroll from a previous drag: `pointerDown` resets `draggedRef=false`, so the tap is
honored — also good. The one gap: a programmatic `scrollPrev/scrollNext` (arrow click) emits
`scroll`, setting `draggedRef=true`, with no `pointerDown` to reset it. If the user then clicks a
card via keyboard, `event.detail === 0` so `viaPointer` is `false` → not suppressed (correct). But
a genuine *mouse* click on a card after an arrow press, before any pointerdown on the track, would
see `draggedRef===true` and be suppressed. Minor: the first mouse click after an arrow press is
eaten. Reset `draggedRef` on `settle` (when scroll truly ends) rather than only on `pointerDown`.

### M3. `slideFocus` triggers `tweenScale` without the `scroll` fast-path
`character-carousel-track.tsx:121,68-100`

`tweenScale` is registered for `slideFocus` with no `eventName`, so `isScroll` is `false` and it
recomputes transform/opacity for **every** slide in **every** snap, including off-screen ones. Fine
for 5 slides, but note the `isScroll` viewport cull (L80) is bypassed on focus. Negligible at this
scale; flag only because the comment at L21 implies scroll-frame efficiency is a design goal.

### M4. Two files exceed the 200-LOC project limit
`character-carousel-track.tsx` 217 LOC, `character-detail-card.tsx` 204 LOC.

`development-rules.md` sets a 200-line ceiling. Track could extract the coverflow tween helpers
(`setTweenNodes`/`setTweenFactor`/`tweenScale`, ~45 lines) into a `use-coverflow-tween.ts` hook —
that also isolates the embla-internals coupling. Detail card could extract the drifting decor
block (L88-117) into a small `CharacterDetailDecor` component.

### M5. `AnimatePresence mode="wait"` (flip) nested inside `mode="popLayout"` (open/close) — interaction with `layoutId` morph
`character-detail-card.tsx:152` + `character-carousel.tsx:115`

The detail card's story block uses `AnimatePresence mode="wait"` keyed on `slug` for the prev/next
flip. When flipping pups, `flipPup` changes `openSlug` but the outer `popLayout` `AnimatePresence`
keeps the same `key="detail"` element mounted — good, no outer transition. The `layoutId`
`pup-art-${slug}` changes on flip: the old artwork's `layoutId` disappears and a new one appears.
Because the artwork is **not** wrapped in an `AnimatePresence`, there is no shared element to morph
*between* on a flip — the new pose simply hard-swaps (`<Image>` `src` change) while the story block
crossfades via `mode="wait"`. Result: on flip the text crossfades smoothly but the pose pops.
Verify this is the intended look; the comment at L151 ("crossfades when flipping") only promises it
for the story, so likely intentional — noting for confirmation.

### M6. `mode="wait"` flip stalls under rapid prev/next
`character-detail-card.tsx:152-194`

`mode="wait"` fully completes the exit (`duration 0.35`) before the enter begins. Mashing
next/next/next queues each flip; `flipPup` updates `openSlug` immediately each time but the visual
story lags ~0.35s per step. Functionally safe (state is the source of truth) but the artwork pose
(outside AnimatePresence) updates instantly while the text lags — pose and text desync during a
fast flip burst. Consider `mode="popLayout"` or `mode="sync"` for the story block, or debounce the
flipper.

---

## Low

### L1. Coverflow math — no clipped 4th sliver, but margin is thin
`character-carousel-track.tsx:14-15,173`

`lg:basis-[33.2%]` × 3 = 99.6% of viewport, `align:"center"`, `containScroll:false`. The centered
card + two neighbors consume 99.6%, leaving 0.4% — the 4th card sits effectively flush at the edge,
its sliver ~0% wide. Correct for "3 whole cards, no sliver". But `px-2`/`md:px-3` gutters live
*inside* each basis box (padding, not margin), so the visual card is narrower than 33.2% and the
inter-card gap is `2×px`. At `lg` there is no `lg:px-*` override, so `md:px-3` (0.75rem each side)
persists. The neighbors land at `MIN_SCALE 0.86` via `TWEEN_FACTOR_BASE 0.14 × 5 snaps = 0.7`
factor → `tween = 1 - |diff|×0.7`; adjacent `diff ≈ 0.2` → `tween ≈ 0.86` → clamps exactly at
`MIN_SCALE`. The math is internally consistent. Risk: if a 6th character is ever added,
`TWEEN_FACTOR_BASE × 6 = 0.84` shifts the neighbor scale below `MIN_SCALE` (clamped, so visually
fine) but the *next* ring of cards also scales down more — re-tune if the roster grows.

### L2. `tweenScale` reads `MIN_OPACITY`/`MIN_SCALE` module constants — fine, but opacity floor 0.5 on a focal card
`character-carousel-track.tsx:96-97`

`opacity: clamp(tween + 0.25, 0.5, 1)`. The off-screen 4th/5th cards drop to 0.5 opacity. With
`loop:true` the 4th card *is* partially the visible neighbor's neighbor; 0.5 opacity on a card
that may peek 0.4% is invisible anyway. No issue, just confirming the `+0.25` offset keeps the
two visible neighbors well above the floor (`0.86 + 0.25 = 1.0`+, clamped to 1) — neighbors stay
fully opaque, only scale de-emphasizes them. Matches the L12-13 comment. Good.

### L3. `key={i}` on mapped decor
`character-carousel-ambient.tsx:40,57`; `character-motif.tsx:62`

Index keys on a static, never-reordered list — acceptable, but `kind`+position would be marginally
cleaner. Pre-existing pattern in `character-motif.tsx`; not introduced here. Skip unless touched.

### L4. `priority={i === startIndex}` — image priority follows a stale index
`character-carousel-card.tsx:62` via `character-carousel-track.tsx:179`

`startIndex` is the *initial* slide. After the user scrolls, `priority` no longer matches the
visually-centered card — but `priority` only affects the initial LCP fetch, so this is correct
(prioritize the first-painted card). Just noting it reads slightly oddly. Fine.

### L5. eslint-disabled mount effect is correctly scoped
`character-carousel.tsx:61-64`

`useEffect(() => { if (initialSlug) scrollIntoView(false); }, [])` with
`exhaustive-deps` disabled. `initialSlug` is derived from `searchParams` (stable on mount) and
`scrollIntoView` is `useCallback`-stable; the intent is genuinely run-once-on-mount. The disable
is justified and the comment explains it. Acceptable.

### L6. `Cloud`/`MusicNote`/`Sparkle` doc comment now stale
`character-scene-decor.tsx:3-8`

The header says "Used by the scene backdrop" — the backdrop (`character-scene-backdrop.tsx`) was
deleted this pass. These primitives are now consumed by `character-carousel-ambient.tsx` and
`character-detail-card.tsx`. Update the comment so future Grep readers are not sent to a deleted
file.

---

## Removed `selectedIndex` — verified

The coverflow tween (`tweenScale`) derives everything from `api.scrollProgress()`,
`api.scrollSnapList()`, `api.slidesInView()` and the engine — it never referenced `selectedIndex`.
Removing the dots removed the only consumer of selected-index React state. The tween still works:
it is driven by the `scroll`/`reInit`/`slideFocus` events, all still wired (L115-122). Confirmed
correct. `emblaApi.selectedScrollSnap()` is still read imperatively where needed (`handleCardSelect`
L149, autoFocus L139) — no stale-state risk because it is read at call time, not from React state.

---

## Reduced-motion — verified

- `duration: reduce ? 0 : 24` on embla (L46): a `scrollTo` still emits `settle` with duration 0,
  so the center-first path still resolves under reduced motion. Good.
- `layoutId` set to `undefined` when `reduce` (card L54, detail L132): disables the morph entirely
  rather than running it at 0s — correct, avoids a layout-animation flash.
- Story stagger: `initial={reduce ? false : "hidden"}` (detail L156) skips the staggered entrance.
  Good. Note the `variants` container `staggerChildren` still technically exists but `animate="show"`
  with `initial=false` means children mount already-shown — no animation. Correct.
- CSS keyframe drift (`paw-drift`/`twinkle`/`cloud-drift`) is neutralized by the global
  `prefers-reduced-motion` reset (globals.css L182-191). Confirmed.

One gap: the orchestrator's `motion.div` open/close transition (`character-carousel.tsx:117-141`)
uses `duration = reduce ? 0 : 0.55` — good — but the `exit` variant for the carousel still includes
`y: 8` (L140). At `duration 0` that is instant so harmless, just noting the `y` offset is dead
weight under reduced motion.

---

## Positive Observations

- Main embla event effect (L102-134) registers and tears down **every** listener symmetrically —
  no leak in the steady-state path. This is the easy thing to get wrong; it is correct here.
- `draggedRef` reset on `pointerDown` + keyboard exemption via `event.detail` (L52-53, L182) is a
  clean, correct drag-vs-click discrimination.
- `closedRef` double-close guard in the detail card (L58-65) is the right pattern and well
  commented.
- `didPushRef` history bookkeeping (L25-26, L70, L88-96) correctly distinguishes a pushed entry
  from a deep-link, so Back never strands a visitor — genuinely subtle and handled well.
- Slides `useMemo` (L165-189) keyed correctly on `[characters, startIndex, reduce, handleCardSelect]`.
- `getCharacterTheme` fallback keeps the function total — no crash on an unknown slug.

---

## Recommended Actions (priority order)

1. **H1** — make `returning` a one-shot: reset to `false` after the autoFocus is consumed.
2. **H3** — add an effect-cleanup `off("settle")` and/or a timeout fallback so a missed `settle`
   cannot leave a permanently dead card.
3. **H2** — move the `openingRef` guard to the orchestrator (lifecycle matches the state) or add a
   loud comment that its correctness depends on track unmount.
4. **M4** — extract the coverflow tween hook + detail decor to clear the 200-LOC ceiling.
5. **M2/M6** — reset `draggedRef` on `settle`; reconsider `mode="wait"` for the flip story block.
6. **L6** — fix the stale `character-scene-decor.tsx` doc comment.

---

## Unresolved Questions

1. M5/M6: Is the artwork pose meant to hard-swap (no morph, instant) on a prev/next *flip*, while
   the story crossfades? Current behavior; confirm it is intended.
2. M1: Is first-click-wins (silently swallow a second mid-flight card click) the intended UX, or
   should the latest click win?
3. H1: After a deep-linked visitor closes a pup, should focus jump to a carousel card at all?
   Currently it will (because `returning` is stuck `true`) — confirm desired.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** No Critical defects and the core embla listener teardown is correct, but two pieces of
state (`returning`, `openingRef`) are never reset and work only by accident of component remount —
H1 is an active focus-stealing a11y bug and H3 can leave a permanently dead card if `settle` is
missed. Two files also breach the 200-LOC project limit; recommend addressing H1/H3 before
considering this refinement landed.
