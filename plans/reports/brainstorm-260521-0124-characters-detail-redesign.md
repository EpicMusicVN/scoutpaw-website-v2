# Brainstorm — Carousel Polish + Themed Character Detail Pages

**Date:** 2026-05-21 01:24 | **Status:** Agreed | **Scope:** carousel tweak + detail-page redesign (3rd Characters-page iteration)

## Problem Statement

Two parts:
- **A. Carousel** — remove card chrome, enlarge characters, simplify hover (no pose-swap; glow/scale/shadow/lift only).
- **B. Detail pages** — redesign `/characters/[slug]` as uniquely themed, immersive, cinematic pages tied to each character's YouTube channel.

## Agreed Decisions

| Topic | Decision |
|---|---|
| Detail architecture | **Themed template** — one layout driven by a per-character theme config. Not 5 bespoke pages. |
| Decoration | **Moderate motif system** — one `CharacterMotif` component, 5 distinct lightweight SVG motif sets + per-character palette. |
| Channel link | **Dedicated channel callout** — themed "Watch {Name} on {Channel} →" block per page. |

## Part A — Carousel (small)

- `character-carousel-card.tsx`: remove gradient background + border (chromeless — character image floats on page bg). Single pose (`poses[0] ?? image`) — drop the hover pose-swap. Hover = scale + accent glow + drop-shadow + lift. Name reveal on hover/focus unchanged.
- `character-carousel.tsx`: enlarge card `<li>` width so characters dominate.
- `poses[1+]` no longer used by the carousel — detail hero may use a pose, so the schema field stays earned.

## Part B — Detail Pages (themed template)

### New — `lib/content/character-themes.ts`
Per-slug theme config (TS — presentational, not content): `{ gradient, palette, motif }` where `motif ∈ "notes" | "bursts" | "sparkles" | "geo" | "mountains"`.

| Character | Palette direction | Motif |
|---|---|---|
| Max | warm golden / cream, cozy bedtime glow | `notes` (musical notes + soft glow rays + crescent) |
| Buddy | energetic orange / bright | `bursts` (confetti, zigzags, speed lines) |
| Bella | pastel lavender / blush, dreamy | `sparkles` (sparkles, ballet swirls, petals) |
| Oscar | collie brown / teal, smart | `geo` (geometric shapes, dotted paths, science/music glyphs) |
| Rocky | bold husky blue, adventurous | `mountains` (mountain silhouettes, sound waves) |

### New — `components/characters/character-motif.tsx`
Renders the decorative SVG set for a given `motif` id, tinted by theme palette. Lightweight, `aria-hidden`, absolutely positioned backdrop.

### New — `components/characters/character-channel-callout.tsx`
Themed "Watch {Name} on {Channel} →" block. Channel resolved at runtime: `content.getChannels()` → find channel where `characterSlug === slug` (mapping: max→Puppy Lullaby TV, rocky→Happy Paws Cartoon, bella→Magic Paw, oscar→Doggo Dreams TV, buddy→ScoutPaw). Hides gracefully if no channel match.

### Rewrite — `app/characters/[slug]/page.tsx`
```
Themed immersive hero — per-character gradient + CharacterMotif backdrop
  big character image · "Say hi to {Name}" · subtitle · breed
Story block — description + CharacterQuote (themed)
Channel callout — CharacterChannelCallout
Back to the pack
```

### Deleted — `components/characters/character-hero.tsx`
Replaced by the new themed hero (only the detail page consumed it — confirmed by grep).

## Files

- New: `lib/content/character-themes.ts`, `components/characters/character-motif.tsx`, `components/characters/character-channel-callout.tsx`
- Rewrite: `app/characters/[slug]/page.tsx`
- Modify: `components/characters/character-carousel-card.tsx`, `components/characters/character-carousel.tsx`
- Delete: `components/characters/character-hero.tsx`
- Keep: `CharacterQuote` (themed via accent/theme color)

## Cross-Cutting

- **Consistency:** themed template reuses design tokens (Fredoka/Nunito, shadow-cozy, rounded radii); theme varies palette+motif only.
- **Responsive:** hero stacks on mobile; motif backdrop scales/clips, never causes horizontal scroll.
- **a11y/contrast:** gradients/motifs are backdrops only — body text stays `ink` on light surface (WCAG AA). Motifs `aria-hidden`.
- **Perf/CLS:** `next/image` fixed aspect boxes; motif SVGs inline + lightweight; animations CSS, reduced-motion via global reset.

## Risks

- 5 motif SVG sets — keep each minimal to avoid bundle/markup bloat.
- Theme palettes (esp. light pastels for Bella) must keep text AA — verify; never put body text on a saturated theme fill.
- `getChannels()` lookup — handle no-match defensively (callout hidden).
- `character-hero.tsx` deletion — re-grep consumers before deleting.

## Success Criteria

- Carousel: chromeless, larger characters, hover = glow/scale/shadow only, no pose-swap.
- Each detail page visibly distinct (palette + motif) yet one template; channel callout present + correct.
- `tsc` + `next lint` + `next build` clean; responsive; no CLS; AA contrast.

## Unresolved Questions

- Live prod URL still unknown (`scoutpaw.vercel.app` 404) — QA limited to local build.
