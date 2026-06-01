# Brainstorm — Characters Page Immersive Redesign

**Date:** 2026-05-21 01:50 | **Status:** Agreed | **Scope:** `/characters` layout rebuild (immersive scene) + detail-page signature atmosphere + YouTube channel badge. Iteration #5 of the Characters page; supersedes carousel work and the 0141 brainstorm.

## Problem Statement

Replace `/characters` hero banner + carousel with a **custom immersive scene** — all 5 ScoutPaw pups composited across a cinematic, playful, storybook backdrop. Each pup clickable → detail page, subtle CSS hover only (glow/scale/float/shadow), same pose. Detail pages must feel **highly unique per character**; add a small integrated YouTube channel badge near the title.

## Context (verified by scout)

- `app/characters/page.tsx` still renders `FullBleedHero` + `CharacterCarousel` — both to be removed.
- `content/characters.json` already holds every pup's `tagline` (subtitle), `bio` (description), `quote`, `accentColor`, `poses[]` — **copy matches the spec exactly; no migration needed.**
- `lib/content/character-themes.ts` already themes detail pages per pup (`heroGradient`, `surfaceTint`, `decor`, `motif`) matching the 5 visual-identity directions.
- Detail components exist + themed: `CharacterDetailHero`, `CharacterMotif`, `CharacterQuote`, `CharacterChannelCallout`. Title "Say hi to {name}" already wired.
- `channels.json` links each pup → channel (`name`, `url`, `bannerColor`, `characterSlug`).
- Global CSS already has `paw-drift`, `cloud-drift`, `dust-float`, `shimmer-slide` keyframes + a `prefers-reduced-motion` reset.
- Carousel components (`character-carousel.tsx`, `character-carousel-card.tsx`) are discarded. All work uncommitted.

## Agreed Decisions

| Topic | Decision |
|---|---|
| Scene render | **Code-built** — gradients + inline SVG clouds/stars/notes/shapes. No new image assets. Characters = transparent pose PNGs layered on top. |
| Detail-page uniqueness | **Medium** — keep shared template, add ONE signature atmospheric layer per pup. |
| Character name labels | **Always visible** — themed label near each pup (touch + a11y friendly). |
| Scene height | **Tall natural-height section** — generous fixed-aspect stage, flows naturally; `NewsletterCTA` stays below. |
| Channel badge | Badge near title **AND** keep existing bottom `CharacterChannelCallout`. |
| Scene responsiveness | md+ art-directed absolute composition; mobile staggered vertical flow — one set of 5 figures, two positioning maps, no image duplication. |

## Final Solution

### `/characters` page — `app/characters/page.tsx` (rewrite)
Remove `FullBleedHero` + `CharacterCarousel`. Render `<CharacterScene characters={ordered} />`; keep `NewsletterCTA` below. `metadata` unchanged. `PAGE_ORDER` preserved.

### New — `components/characters/character-scene.tsx` (server, CSS-only)
- Tall fixed-aspect/min-height stage. Code-built layered backdrop: gradient sky + inline SVG clouds, stars, music notes, soft shapes — absolutely positioned, `aria-hidden`, gentle drift via existing keyframes.
- Real stylized `<h1>` integrated into the scene (replaces removed hero h1 — SEO/a11y).
- 5 `CharacterSceneFigure`s; `SCENE_LAYOUT` const (per-slug x/y, size, z-index, float-delay) drives md+ absolute coords; mobile = staggered flex-column. Layered depth via z-index.

### New — `components/characters/character-scene-figure.tsx` (server, CSS-only)
One pup = `<Link href="/characters/{slug}">` + `next/image` pose + accent glow + always-visible themed name label. Hover/focus: CSS only — soft glow + slight scale + float lift + shadow, same pose. `aria-label="Meet {Name}, the {Breed}"`.

### Modify — `lib/content/character-themes.ts`
Add `atmosphere` field to `CharacterTheme`: `"nightlight" | "motion" | "ribbons" | "blueprint" | "ridge"`. Keep `DEFAULT_THEME` total.

### New — `components/characters/character-atmosphere.tsx` (server, CSS/SVG)
Signature per-pup layer, `aria-hidden`, behind the existing motif scatter:
- Max → warm night-light radial glow · Buddy → motion bursts/speed lines · Bella → floating ballet ribbons · Oscar → blueprint/learning grid · Rocky → mountain-ridge silhouette band.

### New — `components/characters/character-channel-badge.tsx`
Small integrated emblem — themed pill (channel `bannerColor` + YouTube mark + channel name). External link, new tab. Placed in `CharacterDetailHero` below the subtitle.

### Modify — `components/characters/character-detail-hero.tsx`
Accept optional `channel` prop → render `CharacterChannelBadge` below subtitle + `CharacterAtmosphere` layer.

### Modify — `app/characters/[slug]/page.tsx`
Pass the already-fetched `channel` to `CharacterDetailHero`.

### Deleted
`components/characters/character-carousel.tsx`, `character-carousel-card.tsx`.

## Cross-Cutting

- **Responsive (core challenge):** md+ art-directed absolute scene; mobile staggered vertical flow — must not overflow horizontally.
- **Perf/CLS:** fixed stage min-height prevents shift; `next/image` `priority` on 1–2 dominant pups (Max as Captain), lazy rest; lightweight inline SVG backdrop.
- **a11y:** single `<h1>`; figures = keyboard-focusable links in logical DOM order; decorative layers `aria-hidden`; always-visible labels + `aria-label`; AA contrast.
- **Animations:** CSS only — reuse existing keyframes; reduced-motion respected via global reset.
- **Consistency:** Fredoka/Nunito, `shadow-cozy`, radii, `accentColor` tokens. No client JS.

## Risks

- Free-form 5-character scene is the hardest layout yet — desktop coords need hand-tuning; mobile flow must not overflow.
- No-hero page must still ship a real `<h1>`.
- 5 above-the-fold images — balance `priority` vs lazy to protect LCP.
- Docs (`codebase-overview.md`, `project-changelog.md`) stale across iterations 1–5 — reconcile before commit.

## Success Criteria

- `/characters`: immersive code-built scene, 5 clickable pups → detail pages, always-visible labels, CSS hover only (same pose), works desktop/tablet/mobile, has an `<h1>`.
- Detail pages: signature atmosphere layer per pup + themed channel badge near title + bottom callout.
- `tsc` + `next lint` + `next build` clean; no CLS; AA contrast; reduced-motion respected.

## Unresolved Questions

- Live prod URL still unknown — QA limited to local build.
