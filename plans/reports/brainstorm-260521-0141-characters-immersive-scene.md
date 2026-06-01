# Brainstorm — Characters Page Immersive Scene

**Date:** 2026-05-21 01:41 | **Status:** Agreed | **Scope:** `/characters` layout rebuild + detail-page channel badge (4th Characters-page iteration)

## Problem Statement

Replace the `/characters` hero + carousel with a **custom immersive scene** — all 5 characters composited together across a decorative, cinematic, storybook-style background. Each character clickable → detail page, subtle CSS hover (glow/scale/float/shadow, same pose). Add a small integrated YouTube channel **badge** near the title on detail pages.

## Context

- This is iteration #4 of the Characters main layout tonight (alternating sections → carousel → carousel-polish → immersive scene). Carousel components are discarded. All work uncommitted.
- Detail pages were already themed in iteration #3 (`character-themes.ts`, motifs, per-character palette, bottom channel callout). This iteration's only new detail-page item is the title-area channel badge.

## Agreed Decisions

| Topic | Decision |
|---|---|
| Scene responsiveness | **Desktop scene + distinct mobile layout** — art-directed absolute composition on md+, staggered-flow arrangement on mobile. |
| Scene background | **Code-built** — gradients + SVG clouds/stars/music-notes/shapes. No new image assets. |
| Channel badge | **Badge near title AND keep** the existing bottom `CharacterChannelCallout`. |

## Final Solution

### `/characters` page — `app/characters/page.tsx` (rewrite)
Remove `FullBleedHero` + carousel. Render `<CharacterScene characters={ordered} />`; `NewsletterCTA` may stay below. Page `metadata` unchanged.

### New — `components/characters/character-scene.tsx` (server, CSS-only)
- Layered decorative backdrop: soft gradient + SVG clouds, stars, music notes, paw/shape accents — absolutely positioned, `aria-hidden`, gentle CSS float (reduced-motion safe via global reset).
- Stylized `<h1>` integrated into the scene (SEO/a11y — replaces the removed hero's h1).
- **One set of 5 character figures, responsive positioning** (avoids duplicating images): container is staggered flex-column on mobile, a relative fixed-height stage with `md:absolute` art-directed coordinates on md+. A `SCENE_LAYOUT` const (keyed by slug) holds the desktop coords/sizes.

### New — `components/characters/character-scene-figure.tsx` (server, CSS-only)
One character: `<Link href="/characters/{slug}">` + pose image + accent glow + name label (revealed on hover/focus). Subtle per-figure float animation (varied delay). `aria-label="Meet {Name}, the {Breed}"`.

### New — `components/characters/character-channel-badge.tsx`
Small integrated emblem — themed pill (channel/decor color + YouTube mark + channel name). External link (new tab). Placed in `CharacterDetailHero` below the subtitle.

### Modify — `components/characters/character-detail-hero.tsx`
Accept an optional `channel` prop; render `CharacterChannelBadge` below the subtitle when present.

### Modify — `app/characters/[slug]/page.tsx`
Pass the resolved `channel` to `CharacterDetailHero` (already fetched for the bottom callout).

### Deleted
`components/characters/character-carousel.tsx`, `components/characters/character-carousel-card.tsx`.

## Cross-Cutting

- **Responsive (the core challenge):** md+ art-directed absolute scene; mobile staggered vertical flow — same 5 figures, two positioning sets, no image duplication.
- **Perf/CLS:** fixed stage min-heights / aspect to prevent shift; `next/image` — priority on the 1–2 most prominent characters, lazy rest; lightweight inline SVG backdrop.
- **a11y:** one `<h1>`; figures keyboard-focusable links in logical DOM order; decorative layers `aria-hidden`; name labels + `aria-label`; AA contrast (text on light surfaces, accent for decor only).
- **Animations:** CSS only (float/glow/scale) — no client JS; reduced-motion via global reset.
- **Consistency:** reuses design tokens (Fredoka/Nunito, shadow-cozy, radii, accentColor).

## Risks

- Free-form 5-character scene is the hardest layout yet — desktop coords need hand-tuning; mobile staggered flow must not overflow horizontally.
- No-hero page must still ship a real `<h1>` — easy to miss.
- 5 above-the-fold character images — balance `priority` vs lazy to protect LCP without over-prioritizing.
- Iteration churn — 4th layout; docs now 3 iterations stale (reconcile before commit).

## Success Criteria

- `/characters`: immersive scene, 5 clickable characters → detail pages, CSS hover only, works desktop/tablet/mobile, has an `<h1>`.
- Detail pages: themed channel badge near title + bottom callout both present.
- `tsc` + `next lint` + `next build` clean; no CLS; AA contrast; reduced-motion respected.

## Unresolved Questions

- Live prod URL still unknown (`scoutpaw.vercel.app` 404) — QA limited to local build.
- Docs (`codebase-overview.md`, `project-changelog.md`) are stale across iterations 2–4 — should be reconciled before any commit.
