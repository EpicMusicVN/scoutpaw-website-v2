# Brainstorm — Characters Carousel v5 (Immersive 100vh + Dominant Characters)

- **Date:** 2026-05-21
- **Route:** `/characters`
- **Status:** Design approved — ready for `/ck:plan`
- **Branch:** main
- **Follows:** `260521-1640-characters-carousel-v4` (completed). 5th iteration of this carousel.

## Problem Statement

v4 reviewed against the rendered page; v5 makes the carousel immersive: 4 cards visible, characters ~2x larger and dominant, cards de-boxed (no shadows/borders/rectangle), section at 100vh, all blending into the page background.

## Requirements

- Carousel: ≥4 cards visible, ≥3 fully visible (no clipping); balanced/premium on large screens.
- Characters: consistent sizing; significantly larger — ~2x the card; dominate the layout; extend well outside card boundaries.
- Card: keep the pose-overflow-top overlap; reduce card visual heaviness; remove the rectangular-border feeling.
- Container/bg: remove card shadows + rectangular container effects; blend with site bg; no hard edges / outlines / isolated container styling.
- Height: carousel section occupies 100vh; immersive/cinematic on desktop; responsive on tablet/mobile.
- Animation: smooth, cinematic, soft fades, no snapping.
- Playful/premium/cinematic, performant, responsive, accessible.

## Decisions (locked via clarifying questions)

| Decision | Choice |
|---|---|
| Pose consistency | **Tunable per-pose constants** — uniform box + per-pup `{scale,offsetY}`, morph-safe; values tuned against the rendered page |
| Character overlap | **Tall, within column** — big + extends above the card, but no sideways neighbour overlap (no edge clipping) |
| Card treatment | **Soft pad, no box** — themed gradient with radial-masked edges; no border/shadow/hard rectangle |
| Detail card | **De-box it too** — drop border/shadow, edge-mask the gradient; consistent integrated feel |

## Recommended Solution

### Layout — 4 cards, 100vh
Slide basis `~25%` desktop (4 visible) / `~40%` tablet / `~72%` mobile; move-by-1. Carousel section → `min-h-[100svh]` (`svh` for mobile stability), content vertically centered. Embla viewport tall (`h-[clamp(460px,68vh,820px)]`) for the big poses. Note: 5 pups + 4 visible = a nearly-static carousel — accepted.

### Character sizing — ~2x the pad, in-column
Pose occupies the upper ~70% of the slide; pad the lower ~30%; pose ≈ 2x the pad. Stays within the slide column — extends above the pad, no sideways overlap, nothing clipped at carousel edges. `character-carousel-poses.ts` (re-created): per-pup `{scale,offsetY}` constants, **applied on an ancestor of the `layoutId` element** so framer measures the real on-screen rect → card→detail morph stays correct (fixes the v4 morph trap). Values start neutral; user tunes against the render.

### Card — soft pad, no box
Drop `shadow-cozy-lg`, border, hard `rounded` rectangle. Card = soft themed gradient pad with radial-masked edges → fades into the page, no rectangle/outline. Pup + text float on it. Text on the pad's denser lower-centre; ink on light gradient = AA.

### Detail card — de-boxed
Drop `border` + `shadow-cozy-xl`; edge-mask the `heroGradient` panel so it melts into the page. Keep `CharacterAtmosphere` + motif + content. Section `min-h-[100svh]`.

### Animation
Opacity edge-fade + move-by-1 + center-first → detail morph all kept; fade values retuned for 4-visible. No snapping.

## Files

- Modify: `character-carousel-card.tsx`, `character-carousel-track.tsx`, `character-carousel.tsx`, `character-detail-card.tsx`, `use-carousel-fade.ts`.
- Create: `character-carousel-poses.ts` (morph-safe per-pose tuning).
- No new dependency, no content/schema change.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Pose consistency at 2x across 5 PNGs | Per-pose tuning constants — needs the user's values from the rendered page |
| Soft-mask pad vs text legibility | Mask keeps lower-centre dense; tune mask params visually |
| 100svh on mobile — big poses in a short viewport | Smaller pose + 1-up mobile; `svh` unit; responsive verify |
| De-boxed detail card — content contrast on faded gradient | Keep atmosphere wash + ink text; verify AA |
| Morph from a tuned pose box | Tuning on an ancestor, not the `layoutId` element → morph-safe |
| 5 pups + 4 visible = near-static carousel | Accepted; arrows + move-by-1 still functional |

## Success Criteria

- 4 cards visible desktop, ≥3 fully; balanced on large screens.
- Characters ~2x the pad, consistent (post-tuning), dominant, in-column.
- Cards de-boxed — no shadow/border/rectangle; blend into the page.
- Section 100svh, immersive; responsive tablet/mobile.
- Detail card de-boxed; morph intact.
- build/lint/typecheck green; `/characters` static; `[slug]` untouched.

## Unresolved Questions

- Per-pose `{scale,offsetY}` values, the pad mask parameters, and the morph all need a browser tuning pass — the design makes them tunable but cannot finalize them blind.
