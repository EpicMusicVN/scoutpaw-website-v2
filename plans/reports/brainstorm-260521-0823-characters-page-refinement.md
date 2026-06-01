# Brainstorm — Characters Page Refinement

- **Date:** 2026-05-21
- **Route:** `/characters`
- **Status:** Design approved — ready for `/ck:plan`
- **Branch:** main
- **Follows:** `plans/260521-0655-characters-carousel-page/` (completed) — this refines that build.

## Problem Statement

The shipped Characters carousel needs a polish pass: hero doesn't match the Home page, the coverflow clips neighbour cards, a sky-gradient block separates the carousel from the site theme, pagination dots clutter the nav, and the click→detail transition feels abrupt.

## Requirements

- Hero matches Home page hero (style, spacing, atmosphere) — site cohesion.
- Carousel shows ≥3 cards fully visible, no clipping; clean responsive scaling.
- Carousel background blends with site theme; remove contrasting background blocks.
- Nav: left/right arrows only — remove pagination dots; arrows on-brand.
- Smoother, cinematic click→detail transition — easing, fade, scale, motion flow; selected becomes focus, others recede naturally; no abrupt jumps.
- Lightweight/performant; responsive; accessible; premium + playful.

## Decisions (locked via clarifying questions)

| Decision | Choice |
|---|---|
| Carousel layout | **Focal coverflow, 3 whole** — center emphasized, sides ~88% but fully visible |
| Card treatment | **Uniform calm cards** — shared soft surface; per-pup gradient reserved for detail card |
| Arrow style | **Soft white** (kept) — round `surface` buttons, cozy shadow, ink chevron |

## Recommended Solution

### 1. Hero — reuse Home `FullBleedHero`
Swap `CinematicHero` → `FullBleedHero` (letterbox `banner/banner.png` + glass text card + cyan edge-fades). Add `CloudDivider`s to match Home rhythm: hero → divider → carousel → divider → newsletter. Copy: kicker `CHARACTERS`, title "Meet the ScoutPaw pack", existing description. Drops the standalone button (Home hero has none). `app/characters/page.tsx` loses `CinematicHero`/`Button` imports.

### 2. Carousel — focal coverflow, 3 fully visible
`character-carousel-track.tsx`: slide basis `~33.3%` desktop (3 whole) / `~52%` tablet / `~86%` mobile. `MIN_SCALE` 0.74 → ~0.86 + retuned tween (sides ~88%, whole, de-emphasized; center 1.0). Viewport height retuned. At rest: exactly 3 visible, 4th/5th fully off-screen. Basis `33.2%` safety margin against sub-pixel slivers.

### 3. Background — blends with site
Remove `<CharacterSceneBackdrop />` from the carousel section + Suspense fallback. Section sits on site cyan (`bg-paper` = `--bg-base`) — no contrasting block. Keep faint drifting music-notes/sparkles (~12% opacity, reused `character-scene-decor` primitives) for playful ambience — not a block.
Cleanup: `character-scene-backdrop.tsx` + `character-scene-data.ts` become unused → delete. `character-scene-decor.tsx` retained.

### 4. Cards — uniform calm
`character-carousel-card.tsx`: drop per-pup `heroGradient`; card = uniform white `surface` + `shadow-cozy-lg` + `border-ink/10`. Per-pup identity via soft accent-color glow behind pose + faint motif + ink text (better AA than text-on-gradient). Bold gradient saved for the detail card → the open is a colour payoff.

### 5. Navigation — arrows only
`character-carousel-arrows.tsx`: delete dots / `CarouselControls`; export only `ArrowButton`. Track renders two `ArrowButton`s bottom-right. Remove `selectedIndex` state + `select` subscription → simpler track.

### 6. Interaction animation — cinematic rework
- **Center-first:** clicking a non-centered card → Embla `scrollTo` centers it (other cards sliding aside = the natural "transition away"); on `settle` → expand. Center card expands immediately. Morph always originates from the full-size centered card → consistent, jump-free (resolves prior morph-QA risk).
- **Expand:** carousel recedes (opacity→0, scale 1→0.96, slight y); selected pose morphs (`layoutId`) into detail; detail panel scales-in 0.97→1 + fades.
- **Detail content:** kicker→title→subtitle→bio→quote stagger up (~50 ms); atmosphere/motif fade slightly behind.
- **Close:** reverse — content staggers out, pose morphs back to centered card, carousel scales/fades back in.
- **Easing:** unified `cubic-bezier(0.16, 1, 0.3, 1)`, ~0.55–0.6 s; tuned morph transition. All transform/opacity (GPU). Reduced-motion → plain crossfade, no morph.

## Files

- **Modify:** `app/characters/page.tsx`, `character-carousel.tsx`, `character-carousel-track.tsx`, `character-carousel-card.tsx`, `character-carousel-arrows.tsx`, `character-detail-card.tsx`
- **Create (optional):** `character-carousel-ambient.tsx` (~30 LOC faint decor) — or inline
- **Delete:** `character-scene-backdrop.tsx`, `character-scene-data.ts`
- **Docs:** sync `codebase-overview.md`, `project-changelog.md` after.

No new dependency, no content/schema change.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Sub-pixel sliver of a 4th card | Slide basis `33.2%` safety margin |
| Center-first adds a beat before expand | Short scroll duration (~280 ms) — reads as intentional "focus then open" |
| Same banner on Home + Characters | Intentional (cohesion); swappable via `FullBleedHero` `image` prop |
| `layoutId` morph real-browser polish | Center-first makes it consistent; verify visually during build |
| Reused `character-scene-decor` after backdrop deletion | Confirm decor primitives still imported by detail card + ambient before deleting backdrop/data |

## Success Criteria

- `/characters` hero visually matches Home; page rhythm (CloudDividers) consistent.
- 3 cards fully visible desktop, no clipping; clean 2-up/1-up down-breakpoints.
- Carousel sits on site bg — no contrasting block; nav = arrows only.
- Open/close transition smooth, staggered, cinematic; no layout jumps; reduced-motion safe.
- build/lint/typecheck green; `/characters` static; `/characters/[slug]` untouched; AA contrast holds.

## Next Steps

1. `/ck:plan` → phased plan (hero+page → carousel layout/bg → cards+nav → animation → cleanup+docs).
2. Implementation, then verify the morph in a real browser.

## Unresolved Questions

- None. (Faint ambient decor included per approval; user may opt fully bare later.)
