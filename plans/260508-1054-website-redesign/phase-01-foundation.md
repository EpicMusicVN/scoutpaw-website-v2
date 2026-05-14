---
phase: 1
title: Foundation
status: completed
priority: P1
effort: 1.5d
dependencies: []
---

# Phase 1: Foundation

## Overview

Lay the design-system groundwork the whole redesign sits on: yellow paw favicon, contrast-fixed text tokens, redesigned navbar (cream-toned, larger CTAs, newsletter button), reusable AtmosphereLayer component (floating SVG decoratives + section-edge curves), and scaled-up container width tokens.

## Requirements

**Functional:**
- Favicon renders in browser tab (yellow paw)
- Navbar uses cream/honey background tone matching site, scroll shadow, newsletter CTA scrolls to footer
- Mobile nav button has 44px tap target
- AtmosphereLayer drops into any page, decoratives render behind content, `aria-hidden`
- Container widths: hero/banner sections accept `max-w-[1400px]`, content stays `max-w-7xl`

**Non-functional:**
- Lighthouse: no perf regression on home (baseline before changes)
- Axe contrast clean on tinted bgs
- All decoratives respect `prefers-reduced-motion`
- Zero new npm dependencies

## Architecture

**New components:**
- `components/ui/atmosphere-layer.tsx` — props `{ variant: "honey"|"peach"|"sky"|"sage", density: "low"|"med"|"high" }`. Renders absolutely-positioned SVG decoratives (paws, dust, soft clouds). Uses `framer-motion` `animate` for slow drift, opt-out via reduced-motion.
- `components/ui/section-curve.tsx` — top/bottom SVG wedges to break section rectangles. Props `{ position: "top"|"bottom", color: string, variant: "wave"|"hill"|"cloud" }`.

**Token additions** (`globals.css`):
- `--text-on-warm`, `--text-on-warm-muted` — verified AA contrast on cream/honey/peach
- `--container-max-hero: 1400px`

**Navbar refactor** (`components/nav/top-nav.tsx`):
- `bg-navy` → `bg-base/90 backdrop-blur` + scroll-driven `shadow-cozy-md`
- `useScrollY` hook in `lib/hooks/use-scroll-y.ts`
- Shop CTA: `size="lg"`
- Newsletter CTA: `variant="outline"`, anchors to `#newsletter` (footer)
- Honey hover underline via CSS `::after`
- Mobile button: `size="lg"`, animated burger → X via framer-motion

## Related Code Files

**Create:**
- `app/icon.png` — yellow paw favicon (Next 15 file convention; auto-served as favicon)
- `app/apple-icon.png` — 180×180 same paw
- `components/ui/atmosphere-layer.tsx`
- `components/ui/section-curve.tsx`
- `lib/hooks/use-scroll-y.ts`

**Modify:**
- `app/globals.css` — new contrast tokens, container scale token, paw-drift keyframes
- `tailwind.config.ts` — extend `maxWidth.hero`, `colors.text-warm`
- `components/nav/top-nav.tsx` — full navbar redesign
- `components/nav/mobile-nav.tsx` — larger tap target, burger animation
- `components/nav/nav-links.tsx` — hover underline + larger spacing
- `components/ui/button.tsx` — verify `variant="outline"` matches new nav style

**Delete:** none.

## Implementation Steps

1. Generate favicon assets (yellow paw on transparent bg). Place `app/icon.png` (32×32) + `app/apple-icon.png` (180×180). Verify Next 15 auto-serves.
2. Add contrast tokens + container scale token in `globals.css`. Wire `maxWidth.hero` in Tailwind config.
3. Build `lib/hooks/use-scroll-y.ts` (returns `boolean` for `scrolled > 8`).
4. Build `components/ui/atmosphere-layer.tsx` w/ inline SVG paws + dust circles + cloud blobs. Variants control palette + density. Reduced-motion disables `framer-motion` animate.
5. Build `components/ui/section-curve.tsx` for section transitions.
6. Refactor `top-nav.tsx`: cream bg, scroll shadow, larger Shop CTA, new Newsletter CTA, hover underline.
7. Refactor `mobile-nav.tsx`: 44px tap target, animated burger, larger menu typography.
8. Visual smoke test: load home/shop/watch — verify navbar contrast + CTA prominence + favicon.
9. Lighthouse baseline + post-change comparison on home page.

## Success Criteria

- [x] Yellow paw favicon visible in tab (deterministic SVG → PNG via ImageMagick — see Notes)
- [x] Navbar bg matches body cream tone, scroll shadow appears on scroll
- [x] Shop CTA visually dominant (size lg, sticker shadow)
- [x] Newsletter CTA in nav scrolls to home `#newsletter` section
- [x] Mobile menu button 48px tap target
- [x] AtmosphereLayer drops cleanly into a page w/ no layout shift
- [x] SectionCurve renders top + bottom variants without z-index conflicts
- [ ] Axe: zero contrast violations on navbar (deferred to P5 audit)
- [x] Reduced-motion: all decorative animations halt (`useReducedMotion` guard + `@media` rule)
- [ ] Lighthouse mobile perf within 2 points of baseline (deferred to P5 audit)

## Notes

- **Favicon:** User selected AI-generation but no API keys (`GEMINI_API_KEY` / `OPENROUTER_API_KEY` / `MINIMAX_API_KEY`) are configured in this environment. Generated from a hand-crafted SVG (`assets/favicon-source/paw.svg`) rasterized via ImageMagick. Visually brand-on-tone (yellow paw, honey gradient). If user wants AI-gen later, swap the source file and re-rasterize.
- **NewsletterCTA anchor:** uses `/#newsletter`. On non-home pages the link navigates to home then scrolls. Acceptable for MVP; tighter UX (per-page anchor) deferable.
- **Build verified:** `pnpm typecheck` + `pnpm build` both pass. `icon.png` + `apple-icon.png` show in route table.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| AtmosphereLayer fights existing section bg colors | Variant prop forces caller to pick palette; default `transparent` |
| Navbar scroll shadow flicker on iOS | Use `transform: translateZ(0)` + `will-change: box-shadow` |
| Favicon caching during dev | Hard-refresh + clear browser cache test step in checklist |
| Container scale breaks existing pages | Only opt-in (`max-w-hero` class), don't change defaults |
