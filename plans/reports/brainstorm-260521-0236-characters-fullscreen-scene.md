# Brainstorm — Characters Page Full-Screen Cinematic Scene

**Date:** 2026-05-21 02:36 | **Status:** Agreed | **Scope:** `/characters` scene → full-screen + richer backdrop + hover-only names; Buddy pose swap; remove detail-page channel callout. Iteration #6 of the Characters page.

## Problem Statement

Push the `/characters` immersive scene (built in iteration #5) further: a **full-screen** cinematic stage with a much richer "premium animated universe" backdrop, **significantly larger** characters, and **hover-only** name reveal. Swap Buddy's pose. On detail pages, **remove** the "From the ScoutPaw Network" callout and rebalance.

## Context (verified — built this session)

- `/characters` currently renders `CharacterScene` (tall natural-height section) + `NewsletterCTA`.
- Scene = `character-scene.tsx` (stage `md:h-[clamp(420px,52vw,680px)]`, SCENE_LAYOUT widths 22–30%) + `character-scene-figure.tsx` (**always-visible** name labels) + `character-scene-backdrop.tsx` (gradient/sun/stars/sparkles/clouds/notes/meadow).
- Detail page `app/characters/[slug]/page.tsx` = `CharacterDetailHero` (theme + atmosphere + title channel badge) → story block → `CharacterChannelCallout` ("From the ScoutPaw Network") → back button.
- `CharacterChannelCallout` only imported by the detail page — safe to delete.
- Buddy `poses` in `content/characters.json` = `[corgi1, corgi2, corgi3]`; scene + detail hero both use `poses[0]`.

This iteration **reverses two iteration-#5 decisions**: natural-height → full-screen; always-visible labels → hover-only.

## Agreed Decisions

| Topic | Decision |
|---|---|
| Backdrop richness | **Enrich CSS/SVG layers** — god-rays, bokeh orbs, aurora wash, layered depth + foreground. Still server-only, zero client JS. |
| Buddy image | **`corgi2.png`** — reorder Buddy's `poses` so `corgi2` is `poses[0]` (updates scene + detail hero, single source of truth). |
| Names on touch | **Hidden on touch** — hover/focus reveal only; `aria-label` covers screen readers. |
| Channel badge | **Keep** the title-area YouTube badge; remove only the bottom callout. |

## Final Solution

### `/characters` — full-screen scene

**`character-scene.tsx` (modify)**
- Full-viewport stage — `min-h-[100svh]` (mobile-safe small-viewport unit).
- Compact integrated `<h1>` retained (SEO/a11y) — lighter so characters dominate.
- Desktop/tablet: art-directed full-viewport composition; `SCENE_LAYOUT` character widths bumped (~Max 40%, others 30–34%).
- Mobile: full-height immersive section; characters flow in a generous staggered scroll column (~78vw) — 5 large characters cannot all be "dominant" in one portrait viewport.
- Renders backdrop → figures → new foreground layer.

**`character-scene-figure.tsx` (modify)**
- Name label → **hover/focus reveal only**: `absolute`-positioned (no CLS), `opacity-0` default → fade + slight slide-in on `group-hover` / `group-focus-visible`. Plain hover ⇒ hidden on touch automatically.
- Premium hover: soft accent glow + slight scale + smooth name fade-in; pose unchanged.
- Characters rendered larger. Keep 3-layer nesting (float vs. hover-transform isolation). `aria-label` stays.

**`character-scene-backdrop.tsx` (modify — enrich, pure CSS/SVG)**
Adds on top of current layers: god-ray light beams, glowing bokeh orbs (blurred, depth-varied, gentle float), aurora wash (soft hue-drift blob), layered parallax-style depth (back → mid hill).

**`character-scene-foreground.tsx` (new)**
Decorative foreground layer (grass/foliage silhouette + close bokeh orbs) rendered in front of the characters, `pointer-events-none` so clicks still reach figures — true depth, pups nestled into the environment.

### Buddy — `content/characters.json` (modify)
Reorder Buddy's `poses` → `["characters-position/corgi2.png", "characters-position/corgi1.png", "characters-position/corgi3.png"]`.

### Detail pages — `app/characters/[slug]/page.tsx` (modify)
- Remove `<CharacterChannelCallout>` render + import; **delete** `components/characters/character-channel-callout.tsx`.
- Keep the `channel` lookup (still feeds the title-area badge).
- Rebalance: fold the "← Back to the pack" button into the bottom of the themed story section (adjusted padding) so the page closes on the themed tint, not a bare button strip.

## Cross-Cutting

- **Responsive:** desktop/tablet full-viewport composition; mobile full-height + staggered scroll column.
- **Perf:** `priority` on Max + Buddy only, lazy rest; keep blurred+animated decor count modest (blur+animation is GPU-costly); transform/opacity-only animations.
- **a11y:** single `<h1>`; hover-only names but `aria-label` + keyboard-focus reveal cover SR/keyboard; decorative layers `aria-hidden`; reduced-motion via global reset.
- **Consistency:** ScoutPaw tokens (Fredoka/Nunito, shadow-cozy, accentColor). No client JS.

## Risks

- "Full-screen, all 5 dominant" only holds on desktop/tablet — mobile is necessarily a scroll experience.
- Hover-only names — touch users see no visible names (explicit choice); mitigated by obvious clickable characters + `aria-label`.
- Removing the callout drops the main YouTube CTA — only the small badge remains (confirmed OK).
- Larger characters lean harder on pose-image resolution — existing poses already used large on the home spotlight, should hold.
- More blurred animated decor = GPU cost — keep counts modest, prefer compositor-friendly properties.

## Success Criteria

- `/characters`: full-screen scene, richer cinematic backdrop + foreground depth, 5 larger clickable characters, names reveal on hover/focus only (hidden on touch), Buddy uses corgi2, single `<h1>`.
- Detail pages: no "From the ScoutPaw Network" block; layout rebalanced; title badge intact.
- `tsc` + `next lint` + `next build` clean; no CLS; AA contrast; reduced-motion respected.

## Unresolved Questions

- Live prod URL still unknown — QA limited to local build.
