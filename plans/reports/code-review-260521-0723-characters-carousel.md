# Code Review — Characters Carousel Page

Date: 2026-05-21
Reviewer: code-reviewer
Scope: `/characters` carousel redesign — 6 files (~700 LOC), all NEW except `app/characters/page.tsx`.
Verified: `pnpm typecheck` / `lint` / `build` green; deleted files (`character-scene{,-figure,-foreground}.tsx`) have **zero dangling imports** (only docs/plans reference them — acceptable).

## Overall Assessment

Solid, well-documented feature. Files are small, naming is clear, the coverflow tween correctly handles loop points, and the URL-sync design is thoughtful. The build passes, but there are real **runtime correctness bugs** that CI cannot catch — the most serious is a browser-history desync that produces a stuck/broken back button. The `layoutId` morph and the removed click-guard are also genuine risks worth fixing before ship.

---

## Critical

### C1. `popstate` for the close case desyncs from the actual history stack
`character-carousel.tsx:82-86` — `closePup()` does `pushState(pathname)` (a NEW entry). `openPup()` also does `pushState`. So the stack after open→close is: `[/characters]`, `[?pup=max]`, `[/characters]`. Pressing **Back** now goes from entry 3 to entry 2 (`?pup=max`) — i.e. Back *re-opens* the pup the user just closed. To actually leave the page the user must press Back twice, and the URL briefly flashes the detail view. Closing should `history.back()` when the current entry was pushed by `openPup` (or use `replaceState` on close), not blindly push a new entry. This is the headline UX bug — every open/close cycle inflates history by 2 entries.

### C2. `flipPup` mutates URL but the popstate-restored entry is lost
`character-carousel.tsx:73-80` — prev/next inside the detail card uses `replaceState`, which is correct *for the flip itself*, but combined with C1 the history stack becomes incoherent: open `max` (push), flip to `buddy` (replace), flip to `bella` (replace) → the single entry now reads `?pup=bella` while the entry below is `/characters`. Press Back → `popstate` fires, `onPop` reads no `pup` → closes. Fine. But press Back *again* and you may land on a stale `?pup=` from a *previous* visit because close (C1) pushed `/characters` on top. The flip/open/close trio needs one consistent strategy (recommend: `openPup`=push, `flipPup`=replace, `closePup`=`history.back()` guarded by a "did we push" ref).

### C3. `tweenNodes` can hold `null` entries cast as `HTMLElement`
`character-carousel-track.tsx:50-54` — `slide.querySelector(".coverflow-scaler") as HTMLElement` will be `null` if the selector ever misses (e.g. mid-reInit, or if the slide markup changes). The `as HTMLElement` cast lies to the type system; `tweenScale` does guard with `if (!node) return` at line 87, so it survives today — but `setTweenNodes` itself stores `null` into a `HTMLElement[]`. With `noUncheckedIndexedAccess` on, this is a latent crash if any future caller indexes `tweenNodes.current` without the guard. Filter nulls at capture time and type the ref `HTMLElement[]` honestly.

---

## High

### H1. `layoutId` morph fights `AnimatePresence mode="popLayout"` + Embla DOM transforms
`character-carousel.tsx:102` uses `mode="popLayout"`; the morphing element (`pup-art-${slug}`) lives inside the carousel branch, whose parent `<div key="carousel">` is being *removed* by `popLayout` at the same moment the detail branch mounts. `popLayout` yanks the exiting subtree out of flow (`position: absolute`) — so framer-motion measures the carousel card's artwork from a node that is simultaneously (a) being absolutely-positioned by popLayout and (b) carrying an inline `transform: scale(...)` written imperatively by `tweenScale` (`character-carousel-track.tsx:88`). The shared-element morph reads the *scaled* bounding box as the origin, so the artwork will visibly jump/scale-pop on open for any non-centered card, and on a centered card the popLayout `position:absolute` reparent can drop it to the wrong offset. Recommended: use `mode="wait"` for the carousel⇄detail swap (the two views never need to overlap), OR clear the inline `transform`/`opacity` on the active slide's scaler right before opening.

### H2. Coverflow inline styles are never reset → stale scale persists into the morph & on reInit
`character-carousel-track.tsx:88-89` writes `transform`/`opacity` directly to DOM nodes. When the carousel branch unmounts (open detail) and later remounts (close), Embla re-creates fresh nodes so that's fine — but during the *exit animation* the old nodes still carry the last-frame scale. Combined with H1 the exiting card is frozen mid-scale. Also: nothing ever resets these styles if `tweenScale` early-returns (line 72, `isScroll && !slidesInView`) — a slide scrolled out and back during a fast drag can keep a stale transform for a frame. Minor on its own, compounds with H1.

### H3. `startIndex` change does not re-position an already-mounted carousel
`character-carousel-track.tsx:39-45` — `startIndex` is passed to `useEmblaCarousel` options, but Embla only reads `startIndex` **on init**. After `popstate` (`character-carousel.tsx:50`) sets a new `startIndex` while the carousel is *already mounted* (back-button from detail to carousel keeps the same carousel instance if it was never unmounted — but here it was unmounted, so it remounts and re-inits — OK). However the React `key` on the carousel motion.div is the static string `"carousel"` (`character-carousel.tsx:124`), so React **reuses** the same `CharacterCarouselTrack` instance across openSlug `null→slug→null` only if it never unmounts. Because `AnimatePresence` removes it, it does remount — but verify: if you ever switch to `mode="wait"` (H1) the instance is still torn down, fine. The real latent bug: `selectedIndex` state initializes from `startIndex` (line 46) but if Embla's actual `startIndex` resolution differs (loop snap rounding) the dots can be one off for the first frame. Low-impact but flag.

### H4. Removing the `clickAllowed` guard makes drags fire `onSelect`
Stated in the brief: the Embla `clickAllowed()` guard was removed. `character-carousel-card.tsx:33` is a plain `<button onClick={onSelect}>`. Embla does **not** suppress the synthetic `click` that fires at the end of a pointer drag on a slide. Result: a user who drags the carousel and releases over a card will *open that pup's detail view* instead of just scrolling. This is a real, easily-reproduced misfire on touch and mouse-drag. Re-add a guard: track `pointerdown`→`pointerup` distance, or use Embla's `clickAllowed` via `emblaApi.clickAllowed()` checked in the card's click handler (pass it down), or listen to `pointerUp` and compare against a drag threshold.

### H5. Detail card `Escape` listener + carousel both can be live → double-handling on rapid toggle
`character-detail-card.tsx:52-58` adds a `keydown` listener for Escape. During the `AnimatePresence` exit animation (`duration` up to 0.5s, `character-carousel.tsx:91`) the detail card is **still mounted** while the carousel is animating in. Pressing Escape again during that window calls `onClose` again → `closePup` → another `pushState` (C1 compounds: history now +3). Guard `closePup` against re-entry when `openSlug` is already `null`, or disable the listener on exit.

---

## Medium

### M1. `useReducedMotion` change does not propagate to a mounted Embla instance
`character-carousel-track.tsx:44` sets `duration: reduce ? 0 : 26` only at init. `reduce` can change at runtime (OS setting toggled). The effect at lines 94-123 depends on `emblaApi` but not `reduce`, so a runtime reduced-motion toggle leaves Embla with stale scroll duration. Edge case, but the brief explicitly asks for reduced-motion correctness. Acceptable to document as a known limitation.

### M2. Decor animations ignore reduced-motion at the source
`character-detail-card.tsx:69-98` hard-codes `animation: cloud-drift/twinkle/paw-drift` inline. These are only neutralized by the global `@media (prefers-reduced-motion)` CSS reset (`globals.css:182`) which sets `animation-duration: 0.01ms`. That works, but `twinkle`'s rest frame (`globals.css:127`) is `opacity:0.55` while the live animation peaks at `0.95` — under reduced-motion the sparkle lands dimmer than designed. Cosmetic; the comment at globals.css:122-126 shows this was a deliberate choice, so fine — noting for completeness.

### M3. `priority={i === startIndex}` only prioritizes one image, but the detail card always sets `priority`
`character-carousel-track.tsx:147` and `character-detail-card.tsx:124` — on a deep-link load (`?pup=max`) the carousel is rendered behind the detail card (both branches' artwork share `layoutId`). Two `<Image priority>` for effectively the same asset is harmless (same URL, browser dedupes) but worth confirming the carousel branch even renders on deep-link — it does, because `AnimatePresence initial={false}` still mounts only the `openCharacter` branch. So on deep-link the carousel does NOT render and `i === startIndex` priority never applies on that path. Net: fine, no fix needed, but the `priority` logic is dead on the deep-link path.

### M4. `slugs.indexOf` / array-bang non-null assertions rely on invariants
`character-carousel.tsx:117,119` — `slugs[(openIndex - 1 + count) % count]!`. The `!` is safe *only* while `openIndex >= 0`. If `openCharacter` is non-null the index is valid, and the JSX branch is guarded by `openCharacter ?`, so this holds. But `openIndex` is computed at line 88 with `slugs.indexOf(openSlug)` — if `openSlug` is somehow a slug not in `slugs` (cannot happen given `openPup`/`flipPup`/`onPop` all validate) `openIndex` is `-1` and `openCharacter` is `null`, so the branch doesn't render. Invariant holds. No fix, but the chain of `!` is fragile to future edits — a single helper `siblingSlug(dir)` would be DRYer and safer.

### M5. `<button>` wrapping `<div>`s — flagged per brief
`character-carousel-card.tsx:33-73` — a `<button>` containing `<motion.div>`, `<Image>`, `<span>`, `<p>`. This is technically invalid HTML *only* if interactive/`<div role>` content is nested; here all children are non-interactive flow content, which **is** permitted inside `<button>` per spec (button's content model is "phrasing content" — `<p>` and `<div>` are flow, not phrasing). So this is technically non-conforming (a `<p>`/`<div>` inside `<button>` violates the phrasing-content rule). Browsers render it fine and AT announces the `aria-label`, so functionally OK, but a strict HTML validator will flag it. Low real-world risk; if you want strict conformance, swap the inner `<p>`/`<div>` for `<span>` with display utilities.

### M6. No focus management when the detail card is opened via deep-link
`character-detail-card.tsx:48-50` focuses the close button on mount — good. But on **close**, focus returns to the carousel via `autoFocus`/`returning` (`character-carousel.tsx:35`, `character-carousel-track.tsx:126-130`). That path only runs when `returning` is `true`, set by `closePup` and `onPop`. On a `popstate`-driven close it's set — good. One gap: `returning` is never reset to `false`, so it stays `true` for the rest of the session; every subsequent carousel remount auto-focuses a card (lines 127). After the first close, opening then closing again re-triggers focus — acceptable, but if the user closes via Back and then scrolls away, an unrelated re-render that remounts the track would steal focus. Reset `returning` after consuming it.

---

## Low

- **L1.** `character-carousel.tsx:12` and `character-detail-card.tsx:19` both define `const EASE = [0.22,1,0.36,1]`. DRY — extract to a shared `lib/motion` constant (the same easing also appears as a CSS cubic-bezier in `globals.css:149`).
- **L2.** `character-carousel-track.tsx:10` — `type EmblaApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>` is clever but `embla-carousel-react` exports `EmblaCarouselType` directly; import it instead for clarity.
- **L3.** `character-carousel-track.tsx:128` — `emblaApi.slideNodes()[emblaApi.selectedScrollSnap()]` indexes by *snap* index into the *slide-node* array. With `loop:true` and one slide per snap they coincide, but the two index spaces are not guaranteed equal; use `emblaApi.selectedScrollSnap()` against `slideRegistry` or just `slidesInView`.
- **L4.** `character-carousel.tsx:67` — `pushState(null, "", \`?pup=${slug}\`)` does not URL-encode `slug`. Slugs are lowercase ASCII from `PAGE_ORDER`, so safe today, but `encodeURIComponent` would be defensive and free.
- **L5.** `character-detail-card.tsx:147,152` — `!tagline.startsWith("TODO")` / `!bio.startsWith("TODO")` is a content-placeholder convention duplicated from `app/characters/[slug]/page.tsx:26,53`. Consider a `lib/content` helper `isPlaceholder(text)` so the sentinel string lives in one place.
- **L6.** `character-carousel-track.tsx:132-154` — `slides` `useMemo` depends on `onSelect`; `onSelect` is `openPup` from the parent, wrapped in `useCallback` with deps `[slugs, reduce, scrollIntoView]`. `slugs` is memoized stably, so `openPup` is stable — fine. But the `useMemo` is low-value: it memoizes JSX that's cheap to recreate and the dep `startIndex` changes on every open anyway. KISS — could drop the memo.
- **L7.** All six files are well under the 200-LOC target (max 179). Good.

---

## Positive Observations

- Loop-point math in `tweenScale` (`character-carousel-track.tsx:74-84`) is the canonical Embla coverflow pattern and correctly handles the wrap seam — easy to get wrong, done right.
- Embla event subscription/cleanup (`lines 104-122`) is symmetric and complete — every `.on` has a matching `.off`. Exemplary.
- Imperative DOM writes for the per-frame tween (no React re-render) is the correct performance choice and is documented.
- `getCharacterTheme` is total (`DEFAULT_THEME` fallback) — no crash on an unknown slug.
- Suspense boundary around `useSearchParams` with a backdrop fallback (`app/characters/page.tsx:55-66`) is the correct App Router pattern and keeps the page statically prerendered.
- Deleted-file cleanup is clean — verified no dangling imports anywhere in `app/` or `components/`.
- Deep-link validation (`slugs.includes(p)`) on every URL read prevents a malformed `?pup=` from breaking render.

---

## Recommended Actions (priority order)

1. **C1/C2/H5** — Rework history strategy: `openPup`=push, `flipPup`=replace, `closePup`=`history.back()` guarded by a `didPushRef`. Guard `closePup` against re-entry when `openSlug` is already null. This fixes the broken back button.
2. **H4** — Re-add a drag/click guard on the carousel cards (`emblaApi.clickAllowed()` or pointer-distance threshold).
3. **H1/H2** — Switch the carousel⇄detail `AnimatePresence` to `mode="wait"`, or clear the active scaler's inline `transform`/`opacity` before the morph. Test the `layoutId` morph on a non-centered card.
4. **C3** — Filter `null` from `tweenNodes` at capture; type the ref honestly.
5. **M1/M6** — Reset `returning` after consumption; document reduced-motion-toggle-after-mount as a known limitation.
6. **L1–L6** — DRY/KISS cleanups when convenient (shared `EASE`, `isPlaceholder`, drop low-value memo).

## Unresolved Questions

- Was the `layoutId` morph visually verified on a **non-centered** card (e.g. open the 5th pup while the 1st is centered)? The scaled-bbox origin (H1) predicts a visible pop there — needs a manual check.
- Intended back-button behavior: should Back from an open pup return to the carousel, or leave `/characters` entirely? C1's fix depends on the answer.
- Does product want drag-release-over-card to open the pup (current behavior, H4) or be suppressed? Standard carousels suppress it.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** The feature is well-structured and builds green, but carries a Critical browser-history desync (open/close inflates the stack by 2 and Back re-opens the just-closed pup) plus a High-severity removed drag-click guard that makes drags misfire as opens. The `layoutId` morph interacting with `popLayout` + Embla's imperative transforms is the most likely source of visual jank and needs a manual non-centered-card check before ship.
