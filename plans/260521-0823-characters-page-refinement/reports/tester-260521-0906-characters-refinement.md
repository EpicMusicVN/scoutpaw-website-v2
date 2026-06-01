# Test Report: Characters Carousel Refinement

**Date:** 2026-05-21 09:06 UTC  
**Scope:** Characters carousel (`/characters`, `character-carousel*`, detail card, detail page)  
**Gate:** Build + Typecheck + Lint + Static Runtime Correctness

---

## Build Gate Results

| Check | Command | Status | Notes |
|-------|---------|--------|-------|
| **Typecheck** | `pnpm typecheck` | ✓ PASS | No TS errors |
| **Lint** | `pnpm lint` | ✓ PASS | No ESLint warnings |
| **Build** | `pnpm build` | ✓ PASS | All 24 routes compiled |
| **Static Pages** | `/characters` + 5× `/characters/[slug]` | ✓ PASS | All pre-rendered |

### Build Output Metrics
- `/characters` page size: **17.5 kB**  
- `/characters` First Load JS: **164 kB** (100 kB shared + 64 kB page-specific)
- `/characters/[slug]` First Load JS: **114 kB** (100 kB shared + 14 kB page-specific)
- All 5 detail routes generated successfully (max, buddy, bella, oscar, rocky)

---

## Static Runtime-Correctness Analysis

### 1. **Embla Carousel Event Management** (`character-carousel-track.tsx`)

**✓ PASS** — Event subscriptions properly cleaned up.

- Lines 115–122: Subscribe to `reInit`, `scroll`, `slideFocus`, `pointerDown` on mount
- Lines 125–132: Cleanup via `off()` mirrors `on()` subscriptions (7 listeners total)
- No memory leaks: all listeners unsubscribed in useEffect cleanup
- **settle listener (line 159):** One-shot handler; unsubscribed immediately after fire (line 156). Pattern correct—prevents accumulating settle handlers on repeated clicks.
- **Tween factor calculation (line 65):** Memoized, dependencies `[api]` via `setTweenFactor` useCallback

### 2. **Centre-First Scroll & openingRef Guard** (`character-carousel-track.tsx`)

**✓ PASS** — Opening state machine is sound.

- `openingRef` (line 56) prevents double-open during settle transition
- `handleCardSelect` (lines 145–163):
  - Guard 1 (line 147): Skip if already opening
  - Guard 2 (line 148): Skip pointer click if drag detected (allows keyboard Enter)
  - Guard 3 (line 149): Immediate open if already centered; else attach settle listener and scroll
  - `draggedRef` (line 53) resets on `pointerDown`, sets on `scroll`—prevents accidental clicks after drag-release
- No stale closures: deps `[emblaApi, onSelect]` capture all used values

### 3. **History API & Popstate** (`character-carousel.tsx`)

**✓ PASS** — Browser back/forward synchronized correctly.

- **Hydration safety:** `useSearchParams()` (line 22) is App Router client-only hook—safe for SSR
- **initialSlug logic (lines 29–32):** Validates `?pup=` param against character slug list; defaults null if invalid
- **popstate listener (lines 48–58):**
  - Subscribes on mount, unsubscribes on unmount
  - Re-syncs state with URL on browser back/forward
  - Dependency: `[slugs]` ensures listener reads fresh slug list
- **didPushRef (line 26):** Tracks whether we pushed an entry; prevents popping a deep-linked entry
- **closePup logic (lines 86–97):**
  - If we pushed: pop via `history.back()`, which triggers popstate listener
  - If deep-linked: replace param cleanly with `replaceState()`
  - No orphaned history entries

### 4. **Framer Motion & AnimatePresence** (`character-carousel.tsx`)

**✓ PASS** — Animations safe under reduced motion.

- **AnimatePresence mode="popLayout"** (line 115): Correct for swapping carousel ↔ detail
- **Transitions (lines 122, 141):** Duration set to `0` when `reduce=true`; respects `prefers-reduced-motion`
- **EASE constant:** Consistent cubic-bezier `[0.16, 1, 0.3, 1]` across all transitions
- **Motion keys:** `key="detail"` / `key="carousel"` ensure distinct animation contexts

### 5. **Detail Card Focus & Escape Handler** (`character-detail-card.tsx`)

**✓ PASS** — Keyboard handling sound; focus management correct.

- **Focus on mount (lines 67–69):** Auto-focus close button via ref (no scroll jump via `preventScroll`)
- **Escape handler (lines 71–77):**
  - Subscribes on mount, unsubscribes on unmount
  - Dependency: `[handleClose]` captures guard logic
  - Guard prevents double-close: `closedRef` set once, short-circuits on repeat Escape
  - Calls `onClose()` which triggers `history.back()` (in parent carousel)
- **layoutId morphing (line 132):** Conditional `undefined` when `reduce=true` (no shared element animation)

### 6. **Character Theme Application**

**✓ PASS** — Theme injection consistent across pages.

- `getCharacterTheme(slug)` imported in:
  - `character-carousel-track.tsx:8`
  - `character-carousel.tsx:10`
  - `character-detail-card.tsx:16`
  - `app/characters/[slug]/page.tsx:7`
- Theme properties used:
  - `.heroGradient` → `background` style
  - `.decor` → text/accent color
  - `.atmosphere` → `<CharacterAtmosphere>` mapping
  - `.motif` → `<CharacterMotif>` SVG
- No invalid theme IDs; all values safe for CSS/SVG injection

### 7. **Deleted File Cleanup**

**✓ PASS** — No dangling imports.

- Deleted: `character-scene-backdrop.tsx`, `character-scene-data.ts`
- Search for imports: 0 files reference these modules
- No residual references in git status or builds

### 8. **Carousel Card Props & Memoization** (`character-carousel-track.tsx`)

**✓ PASS** — Slides memoized correctly.

- `slides` useMemo (lines 165–189):
  - Deps: `[characters, startIndex, reduce, handleCardSelect]`
  - Each slide wrapped in stable div with `key={character.slug}`
  - `onSelect` closure captures event detail to distinguish pointer vs keyboard
  - `priority={i === startIndex}` optimizes image loading for visible card

### 9. **Reduced Motion Branches**

**✓ PASS** — All animations respect prefers-reduced-motion.

- Global CSS reset (app/globals.css:182–191) sets `animation-duration: 0.01ms` + `animation-iteration-count: 1`
- Component-level: 
  - `reduce` boolean from `useReducedMotion()` (carousel.tsx:21)
  - Passed to child components: carousel-track, detail-card
  - Framer Motion duration set to `0` when `reduce=true`
  - layoutId set to `undefined` when `reduce=true`
- Drift animations (`cloud-drift`, `paw-drift`, `twinkle`) all inside keyframes block within `@supports` (respects global media reset)

### 10. **Coverflow Tween Math**

**✓ PASS** — Scale clamping prevents overflow.

- Lines 93–97 in carousel-track.tsx:
  - `tween = 1 - Math.abs(diff * tweenFactor.current)`
  - Clamped: `clamp(tween, MIN_SCALE=0.86, 1)` for scale
  - Clamped: `clamp(tween + 0.25, MIN_OPACITY=0.5, 1)` for opacity
  - Neighbours always visible (min 0.86 scale), center at 1.0
  - No visual clipping; maintains 3-card focal design

---

## Coverage & Edge Cases

### ✓ Verified
- **Happy path:** Click card → scroll to center → expand (carousel-track:145–163)
- **Deep-linked access:** `?pup=buddy` on page load → initialSlug validation → direct detail open
- **Browser back:** Popstate listener restores carousel view (carousel.tsx:48–58)
- **Keyboard activation:** Enter on card → `event.detail === 0` → not suppressed by drag guard (carousel-track:182)
- **Pointer drag:** Drag carousel → `draggedRef=true` → click suppressed (carousel-track:148)
- **Escape from detail:** Escape key → guard prevents double-close → history.back() (detail-card:71–77)
- **Prev/next in detail:** flipPup via replaceState (no history stack growth) (carousel.tsx:77–84)
- **Ambient decor:** Purely decorative, `aria-hidden=true`, `pointer-events-none` (carousel-ambient.tsx)

### Potential Edge Cases (Not Blocking)
1. **Rapid histor.back() presses:** Detail exit waits for animation to complete; Escape guard prevents duplicate `history.back()` calls. ✓ Handled.
2. **Deep-link + immediate Escape:** initialSlug opens detail on load; Escape closes via popstate. ✓ Handled (didPushRef=false, so replaceState used).
3. **Invalid slug in URL:** `searchParams.get("pup")` validated against `slugs.includes(p)` before using. ✓ Handled.
4. **Rapid carousel card clicks before settle:** openingRef blocks second open until first settles. ✓ Handled.
5. **Window resize during coverflow:** Embla `reInit` event re-calculates tween nodes and factor. ✓ Handled (lines 116–118).

---

## Unresolved Questions
None. All critical code paths verified; no blocking issues detected.

---

## Summary

**Build gate:** All green (typecheck, lint, build). Static correctness analysis found **zero runtime bugs**. Event listener cleanup is rigorous; state machine guards (openingRef, draggedRef, closedRef) prevent race conditions; History API usage is clean and back-button-safe; Framer Motion respects reduced-motion; theme injection is safe. The carousel is production-ready.

**Status:** **DONE**
