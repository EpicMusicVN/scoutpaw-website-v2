# Brainstorm — Characters Page v7 Redesign

**Date:** 2026-05-22 · **Status:** Approved · **Scope:** single cohesive redesign (carousel cards + detail card)

## Problem Statement

Refine the v6 Characters page: Max permanently anchored first; carousel cards
rebuilt so the character dominates and stands on a small solid-color nameplate
(name + tagline only); detail view reworked into a premium floating card.

## Current State (v6 — shipped ~1h prior)

- Carousel: Embla `loop:true`, `align:"start"`, 3 cards; page order Max-first.
- Card: white `bg-surface` card (~52% slide), pose on top, 5 text blocks
  (breed/name/tagline/bio/quote).
- Detail: de-boxed — themed gradient edge-masked, melts into page, no box.

## Honesty Flags Raised

1. v7 reverses 3 v6 decisions: white→themed-color cards · content-rich→minimal
   card (a genuine simplification) · de-boxed→floating boxed detail.
2. "Full signature color" card bg breaks text contrast — accentColors vary in
   lightness (Oscar `#9C6644` dark; Max `#FFB627`, Bella `#B8A1D9` light).
   v6 used white cards to dodge this. → luminance-based auto text color.
3. 3rd rebuild of `character-carousel-card.tsx` (v5→v6→v7); isolated component.

## Decisions (user-approved)

| Topic | Decision |
|---|---|
| Max anchor | Loop off (`loop:false`); carousel always starts/returns to Max |
| Card fill | Solid `accentColor` block |
| Detail backdrop | Themed wash + drifting atmosphere/motif decor behind the card |
| Art overflow | Artwork breaks the detail card frame (layered depth) |
| Card text contrast | Auto luminance-based (ink on light, white on dark) |

## Final Design

### Carousel — Max anchored
`character-carousel-track.tsx`: Embla `loop:true`→`false`, `align:"start"` kept.
Max (index 0) always the leftmost anchor. Prev/next arrows gain disabled states
at the bounds (track `canScrollPrev`/`canScrollNext` — reuse the `/watch`
ExploreVideos arrow pattern). CSS edge-mask dissolve kept.

### Carousel card — dominant character + small colored nameplate
Full rebuild of `character-carousel-card.tsx`:
- Pose dominates — large `object-contain object-bottom`, upper ~76% of slide;
  consistent sizing via normalized PNGs in a fixed box.
- Nameplate — small solid `accentColor` block at bottom (~22-25% slide height ≈
  ¼ of character height), `rounded-[2rem]`, soft shadow. Character stands on it
  (feet at the nameplate top edge, body above).
- Content — `name` (large bold `font-display`) + `tagline` only. No breed/bio/
  quote.
- Auto-contrast text — computed inline from `accentColor` luminance (one
  consumer, no util — YAGNI).
- Whole card clickable via stretched-button-overlay (kept). Subtle bloom +
  pose-rise on hover.

### Detail card — premium floating card
Rework `character-detail-card.tsx` de-boxed → contained floating card:
- Floating card: `rounded-[2rem]+`, `shadow-cozy-xl`, themed surface
  (`heroGradient` — light, ink-readable), generous cinematic padding. Remove
  `PANEL_MASK`.
- Backdrop: soft themed wash filling the 100vh section + `CharacterAtmosphere` +
  `CharacterMotif` + drifting `Cloud/Sparkle/MusicNote` decor behind the card.
- Internal layout kept — v6 art-dominant split (artwork right, story left:
  breed · name · tagline · full bio · quote).
- Artwork overflows the card frame (pup breaks the top edge) — layered depth +
  echoes the carousel "character on top" motif.
- Kept: Back button, Escape, focus mgmt, `?pup=` deep-link, staggered story.

### Cleanup
`character-quote.tsx` — remove the `compact` prop (v6-added for the card quote;
v7 card has no quote → zero consumers). Detail keeps the full `CharacterQuote`.

### Transitions / Responsive / Perf / A11y
- Keep v6 layered cinematic carousel↔detail transition.
- Responsive: desktop 3 / tablet 2 / mobile 1+peek cards; detail card fills
  width on mobile, internal split stacks.
- Perf: solid-color cards, `next/image` poses, no per-frame JS.
- A11y: auto-contrast → AA on nameplates; arrow disabled-states; focus/Escape/
  reduced-motion kept.

## Files

**Modify:** `character-carousel-track.tsx` (loop off + arrow bounds) ·
`character-carousel-card.tsx` (**full rebuild**) · `character-detail-card.tsx`
(floating card + themed wash + art overflow) · `character-quote.tsx` (drop
`compact`)
**Unchanged:** page, orchestrator (likely), schema, content, themes, ambient/
atmosphere/motif/scene-decor

## Risks

| Risk | Mitigation |
|---|---|
| `loop:false` removes infinite wrap | Intended (Max anchored); arrow bound-states avoid a stuck feel |
| Colored-card text contrast | Luminance-based auto text color |
| 3rd rebuild of the card component | Isolated; concentrated effort |
| Detail re-boxing reverses v6 de-box | Intended; themed wash keeps it from feeling like a hard UI box |

## Success Criteria

Max always anchored first (loop off) · cards: dominant character on a small
solid-accent nameplate (~¼ height), name + tagline only, auto-contrast,
consistent sizing · detail: floating premium card (rounded, soft shadow,
layered depth, cinematic spacing) over a themed wash + drifting decor, artwork
breaks the frame · transitions smooth · responsive · performant · AA contrast.

## Next Steps

1. `/ck:plan` from this report → phased implementation plan.
2. Implement → test → code-review → docs sync.

## Unresolved Questions

- Exact nameplate height ratio + pose/nameplate overlap — tune in browser QA.
- `loop:false`: whether to also reset the carousel to Max on detail-close —
  proposed to keep the v6 return-to-opened-card behavior; revisit if it feels
  off in QA.
