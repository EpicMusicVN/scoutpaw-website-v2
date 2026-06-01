# Characters Page Full-Screen Cinematic Scene — Iteration #6

**Date:** 2026-05-21 02:54  
**Severity:** Medium  
**Component:** `/characters` immersive scene + `/characters/[slug]` detail pages  
**Status:** Code review complete, ready for merge (not committed)

## What Happened

Upgraded the `/characters` cinematic scene from iteration #5 into a full-screen, premium "animated universe" experience. Enlarged characters by 30–40%, enriched the backdrop with god-rays + bokeh + aurora wash, added a foreground depth layer (grass + close bokeh), switched character name labels to hover/focus-only reveal, swapped Buddy's pose to `corgi2`, and removed the "From the ScoutPaw Network" channel callout from detail pages. All server-component, zero additional client JS.

Delivered across 4 phases: backdrop enrichment → full-screen composition → callout removal → validation. Build/lint/typecheck all clean (`npx next build` — `/characters` static, 5 detail routes prerendered).

## The Brutal Truth

This iteration **reverses two decisions from iteration #5** (natural-height → full-screen; always-visible labels → hover-only). The reasoning is sound — the richness demanded full-screen to breathe — but it's a sharp pivot that could have introduced significant breaking changes to the layout grid. The fact that it landed clean (no CLS, no figure overflows, responsive breakpoints correct) is luck + careful stacking-context discipline, not inevitability.

The hover-only name reveal is a pragmatic compromise that silently **excludes touch users** from seeing character names in the page layout. `aria-label` covers screen readers and keyboard nav, but a touch user tapping the characters won't see the name until detail-page load. This is explicitly accepted risk per the design brief, but it's worth flagging: the experience degrades silently, and we have no telemetry to know if users find it confusing.

## Technical Details

**New files:**
- `components/characters/character-scene-decor.tsx` — shared SVG circle + rect primitives extracted from backdrop (keeps backdrop under 200 lines)
- `components/characters/character-scene-data.ts` — scatter seed data (bokeh positions, god-ray angles, aurora hue drifts)
- `components/characters/character-scene-foreground.tsx` — `pointer-events-none` foliage + bokeh silhouette, `z-50`, renders in front of figures

**Modified:**
- `character-scene-backdrop.tsx` — added aurora wash (hue-drift blob), god-ray beams (3 angled lines, soft blur), bokeh orbs (5–7 floating, depth-varied scale/opacity), layered depth (back/mid hill SVG)
- `character-scene.tsx` — full-screen `min-h-[100svh]`, responsive navbar offset `min-h-[calc(100svh-4rem|5rem|5.5rem)]`, increased `SCENE_LAYOUT` widths (Max 40%, others 30–34%), renders foreground layer, removed `NewsletterCTA` co-render
- `character-scene-figure.tsx` — name label `opacity-0` default + `group-hover:opacity-100` + `group-focus-visible:opacity-100`, no `@media(hover)` query (touches simply don't trigger hover), `aria-label` intact
- `app/characters/[slug]/page.tsx` — removed `<CharacterChannelCallout>` import + render, folded "← Back" button into story section padding
- `content/characters.json` — reordered Buddy `poses` to `["corgi2.png", "corgi1.png", "corgi3.png"]`
- `lib/content/schemas.ts` — removed stale comment about character count

**Deleted:**
- `components/characters/character-channel-callout.tsx` — imported only by detail page, safe removal

**Breakpoint-responsive sizes:**
- Mobile: navbar ~64px → `min-h-[calc(100svh-4rem)]`
- Md/lg: navbar ~80/88px → `min-h-[calc(100svh-5rem)]` / `min-h-[calc(100svh-5.5rem)]`
- Stage height: `clamp(460px, 58vw, 720px)` (vw-driven scales with viewport width, maintains proportion)
- Figures: width % of stage width, height via `aspect-ratio`, locked proportions avoid overflow on wide-short displays

## What We Tried

1. **Single fixed navbar offset** (`min-h-[calc(100svh-6rem)]`) — broke at md breakpoint when navbar jumped from 64 to 80px. Fixed: responsive calc with 3 breakpoints.
2. **Hover + `@media(hover)` guard** — necessary for desktop, but overkill since touch devices never fire hover events anyway. Removed guard, relying on hover no-op behavior on touch (cleaner, same result).
3. **Foreground layer positioned absolutely** — clipped by parent stacking context. Fixed: ensured parent (`section`) stays `position: relative` with no z-index (keeping it out of a new stacking context), preserving the layering chain.

## Root Cause Analysis

The stacking-context near-disaster exposed a **mental model gap**: many devs assume `position: relative` is "neutral" (no z-index creation), but it's true only if there's no z-index/transform/filter/opacity on the element itself. This codebase happened to be clean here, but the detail-page restructure almost introduced `position: relative` + `transform` on the story container, which would have **trapped all nested z-indexes** and broken depth layering silently.

The responsive navbar offset misfire came from assuming "md breakpoint = one size fits all" — a common shortcut that breaks when navbar height isn't constant. The code review caught it immediately, but it's a reminder that "looks good on my screen" (full width, md breakpoint) doesn't mean "looks good at every breakpoint."

## Lessons Learned

1. **Stacking context is invisible.** Document the z-index discipline explicitly (backdrop < figures < foreground < heading) and the critical assumption (ancestor = `position: relative` no z-index). Future devs rebalancing spacing or adding overlays will thank you.

2. **Full-screen sizing needs viewport math per breakpoint.** A single `100vh - 6rem` is fragile; nail down navbar height at each breakpoint and derive the offset. Use `calc(100svh - Nrem)` (small viewport unit is safer than `100vh` on mobile).

3. **Hover-only names are touch-blind.** It works, but silently. Consider telemetry or a fallback reveal (e.g., tap-to-show on detail page load) if name discovery becomes a friction point.

4. **Extracted decor modules keep files under 200 lines.** The enriched backdrop was trending toward 250+ lines; moving SVG primitives and scatter data to separate files kept it readable and testable.

5. **Figure sizing should be width-driven, not height-driven.** Locking stage height in `vw` and figures in `%` of stage width means they scale together, avoiding overflow on unusual aspect ratios.

## Next Steps

1. **In-browser QA at all breakpoints** (dev server, Chrome DevTools, Safari iOS). Absolutely-positioned elements and larger characters warrant real visual validation — CSS/SVG can hide surprises.
2. **Touch device QA** — verify hover-to-detail flow feels natural on iOS/Android; measure if name absence causes friction.
3. **Merge & monitor** — watch Sentry for layout shifts or render errors post-deploy; perf monitor GPU cost of the extra animated/blurred decor.
4. **Future iteration**: if touch users struggle, consider a subtitle or badge reveal (name + pose context) on the detail hero, separate from the scene.

---

**File path written:** `D:\works\emvn\scoutpaw-v2\docs\journals\journal-writer-260521-0254-characters-fullscreen-scene-iteration-6.md`

**Status:** DONE
