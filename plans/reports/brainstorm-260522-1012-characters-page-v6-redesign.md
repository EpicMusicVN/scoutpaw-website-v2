# Brainstorm — Characters Page Redesign (v6)

**Date:** 2026-05-22 · **Status:** Approved · **Scope:** single cohesive redesign (carousel + detail)

## Problem Statement

Redesign the Characters page carousel + detail view for a more immersive,
premium, cinematic experience. Carousel + detail each fill 100vh; carousel
left-anchored with 3 full cards + no visible boundary; carousel cards gain a
white content card with the pose overlapping out; detail view art-dominant,
distraction-free (no prev/next); smoother cinematic transitions.

## Current State (v5)

- `app/characters/page.tsx` — FullBleedHero → carousel section → NewsletterCTA.
- `CharacterCarousel` — orchestrator; `<section min-h-[100svh]>`, crossfade swap
  carousel↔detail, `?pup=<slug>` URL sync.
- `CharacterCarouselTrack` — Embla, center-aligned, 4 cards (`lg:basis-[25%]`),
  hard `overflow-hidden` clip + per-card JS opacity fade, prev/next arrows.
- `CharacterCarouselCard` — "soft glow only": no box, just pose + bloom + tiny
  name/breed label on the page background.
- `CharacterDetailCard` — themed gradient, 2-col (art + story), Back button,
  prev/next pup-flipper arrows.

## Honesty Flags Raised

1. White content card on every carousel slide = real direction change (today's
   cards are deliberately minimal); 4 text blocks × 3 visible = density risk.
2. Carousel card will duplicate detail content → needs clear split: card =
   compact teaser, detail = full immersive.
3. Shared-element morph was deliberately removed before ("Detail Card De-Morph")
   — "improve transitions" must not blindly reintroduce it.
4. Section already `min-h-[100svh]` — real fix is content filling the viewport.

## Decisions (user-approved)

| Topic | Decision |
|---|---|
| Card description | Reuse `bio`, `line-clamp-2`; no schema change |
| Transition | Layered cinematic (carousel recedes, detail rises); no morph |
| Detail layout | Art-dominant split, artwork on the right |
| Detail prev/next | Removed (distraction-free) |
| Carousel align | Left-anchored (`align:"start"`), 3 full cards + peel |

## Final Design

### Carousel section — 100vh
Inner track + detail fill `calc(100svh-5rem)` (sticky nav), content centered.
Both views same height → swap never jumps.

### Carousel layout
- Embla `align:"start"`, `loop:true`. Basis: `lg:basis-[31%]` (3 full + 4th
  peek), `sm:basis-[46%]`, mobile `basis-[80%]`.
- No hard boundary: CSS `mask-image` gradient on the viewport — peek card
  dissolves at the right edge; left stays crisp (anchor).
- Delete `use-carousel-fade.ts` — CSS mask replaces per-frame JS opacity (perf +
  KISS win).
- Carousel keeps prev/next arrows; click = anchor-first then open.

### Character cards — white content card + overlapping pose
Vertical composition: pose PNG dominant on top, extends above the white card's
top edge; themed bloom + drop shadow behind. White card at bottom (~1/3
overlap), `bg-surface` `rounded-[2rem]` `shadow-cozy`, stacked: `breed` kicker ·
`name` title · `tagline` subtitle · `bio` `line-clamp-2` · `quote`
(`CharacterQuote` compact). Whole card = one `<button>`
(`aria-label="Open {name}'s profile"`); text in phrasing-safe `<span>`s for
valid HTML. Hover: gentle lift + pose rise.

### Detail view — art-dominant split, 100vh
Fills `100svh`. Artwork ~55-60% **right**, story panel ~40-45% left. Artwork
bleeds large = the focus. Story: breed kicker · large name · tagline · full
`bio` (unclamped) · `CharacterQuote`. Themed gradient + atmosphere + motif +
decor kept. Removed: prev/next arrows + `onPrev`/`onNext` + orchestrator
`flipPup`. Kept: Back button, Escape-close, focus mgmt, `?pup=` deep-link.
Mobile/tablet: split stacks (art top, story below), scroll allowed.

### Transition — layered cinematic
`AnimatePresence mode="popLayout"`: carousel exit fade + scale-down (→0.94);
detail enter fade + scale-up (1.04→1) then existing staggered story reveal;
reverse on close. Ease `[0.16,1,0.3,1]`, ~0.6-0.7s. Camera push-in feel, no
morph. Reduced-motion → duration 0 (already wired).

### Responsive / Perf / A11y
- Desktop 3 cards + peek; tablet ~2 + peek; mobile ~1.1.
- Drop per-frame JS fade; transforms/opacity only; `priority` on first-3 poses +
  detail pose; CSS mask cheap.
- Carousel `role` semantics kept; cards = labelled buttons; detail focus mgmt +
  Escape kept; AA contrast on white card; reduced-motion honored.

## Files

**Modify:** `character-carousel.tsx` (transition, remove flip wiring, 100vh) ·
`character-carousel-track.tsx` (left-align, 3-card basis, edge mask, drop fade
hook, 100vh) · `character-carousel-card.tsx` (**near-total rebuild** — white
card) · `character-detail-card.tsx` (art-dominant split, remove arrows, 100vh,
larger artwork)
**Delete:** `use-carousel-fade.ts`
**Minor:** `character-quote.tsx` may gain a `compact` variant prop
**Unchanged:** ambient, atmosphere, motif, scene-decor, themes,
carousel-arrows (carousel-only now), schema, content

## Risks

| Risk | Mitigation |
|---|---|
| White card density at 3-up | `line-clamp-2` + tight typography |
| `character-carousel-card.tsx` ≈ full rewrite | Effort concentrated, isolated |
| CSS mask must replace JS edge-fade convincingly | Tunable gradient stops |
| Concurrent v5 character edits in working tree | v6 supersedes v5; build on current files |

## Success Criteria

Carousel fills 100vh · 3 cards fully visible, left-anchored, right edge
dissolves, infinite loop · each card white content card + pose overlapping out ·
detail 100vh art-dominant split (art right), no prev/next · layered cinematic
transition, no layout jump · responsive desktop/tablet/mobile · no per-frame JS
fade · AA contrast · reduced-motion honored.

## Next Steps

1. `/ck:plan` from this report → phased implementation plan.
2. Implement → test → code-review → docs sync.

## Unresolved Questions

- `CharacterQuote` compact variant — confirm exact API (`size` vs `variant`
  prop) at implementation time.
- Carousel arrow placement under the new left-anchored layout — keep
  bottom-right or move near the anchor; decide during implementation.
