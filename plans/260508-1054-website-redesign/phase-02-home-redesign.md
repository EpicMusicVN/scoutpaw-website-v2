---
phase: 2
title: Home Redesign
status: completed
priority: P1
effort: 2d
dependencies:
  - 1
---

# Phase 2: Home Redesign

## Overview

Rebuild the home page in 7 sections (Hero / Menu Intro / Meet Buddy / Explore Characters / Shop Banner / Watch Together / Join the Pack) with cinematic scale, sticker layouts, parallax characters, and atmospheric continuity. Reuses Phase 1 atmosphere + container tokens.

## Requirements

**Functional:**
- Hero: text + characters never overlap; parallax on character cluster (desktop only)
- Menu Intro uses all 7 `assets/card/*.png` images, tagged live vs coming-soon
- Meet Buddy banner is full-bleed, oversized mascot, emotional storytelling copy
- Explore Characters in staggered/offset layout w/ per-character accent backdrops + hover name reveal
- Shop banner full-bleed 60/40 split w/ oversized sticker CTA
- Watch Together shows 3 featured videos + see-all link
- Join the Pack newsletter form: bigger input + sticker submit button + social-proof line

**Non-functional:**
- LCP ≤ 2.5s on 4G mobile (hero image)
- Hero parallax disabled <md breakpoint
- All hover/scroll animations respect reduced-motion
- WCAG AA on all body text

## Architecture

**Hero (`components/home/cinematic-hero.tsx` — REWRITE):**
- Layout: 55/45 grid `md:grid-cols-[55%_45%]`
- Left zone: text panel `bg-honey/95` w/ sticker shadow, max-w-md content; kicker + h1 + body + 2 CTAs
- Right zone: character cluster (Buddy primary front, 1 supporting behind w/ Y offset). framer-motion `useScroll` parallax (desktop only).
- Floating cloud SVGs + dust motes via `<AtmosphereLayer variant="honey" density="med" />`
- Mobile: stacked, characters above text, no parallax

**Menu Introduction (`components/home/menu-cards.tsx` — NEW):**
- Asymmetric grid: 2 large feature cards (col-span-2) + 4 smaller (col-span-1) + 1 wide footer card
- Each card: rotation `-2deg` / `+2deg` random, hover `rotate-0 + scale-1.03 + shadow-cozy-lg`
- Image (asset/card), title, short copy, CTA pill
- Coming-soon cards: faded badge "Coming Soon", disabled link

**Meet Buddy (`components/home/featured-pup-spotlight.tsx` — REWRITE):**
- Full-bleed gradient: `warm-tan → honey → peach`
- Top + bottom SectionCurve
- Buddy oversized right (90% panel height), copy block left
- Sun-ray decorative SVG behind Buddy
- Quote-style pull from `funFacts[0]`
- 2 CTAs: Meet Buddy (dark) + Meet the rest (link)

**Explore Characters (`components/home/character-showcase.tsx` — REWRITE):**
- 5-card staggered layout: column `Y` offsets `[0, 24, 0, 24, 0]` on desktop
- Each card: square aspect, `accentColor` backdrop, sticker rotation, character image full
- Hover: `scale-1.05`, name pill slides up from bottom, breed in caps below, glow ring matching accent
- Click → `/characters/[slug]`
- Mobile: 2-col grid, no offsets

**Shop Banner (`components/home/feature-banner.tsx` — REWRITE):**
- Full-bleed 60/40, container `max-w-hero`
- Product collage (3 products overlapped) instead of single image
- Oversized sticker CTA (`size="xl"` if needed)
- bg `warm-tan` w/ peach gradient swipe

**Watch Together (`components/home/video-grid.tsx` — REFACTOR):**
- Shows 3 featured videos only
- Reuses Phase 4 video card component (built in P4 — for P2, use placeholder card matching final shape)
- "Watch on @ScoutPawTV →" link below

**Join the Pack (`components/home/newsletter-cta.tsx` — REWRITE):**
- Full-bleed honey gradient, curved edges (SectionCurve)
- Centered: kicker + h2 + form (email + sticker submit) + social-proof "1,200+ pet parents"
- Tiny paw decoratives at corners

## Related Code Files

**Create:**
- `components/home/menu-cards.tsx`
- `components/home/menu-card.tsx` (single-card subcomponent if cleaner)

**Modify:**
- `app/page.tsx` — reorder to: Hero / MenuCards / FeaturedPupSpotlight / CharacterShowcase / FeatureBanner / VideoGrid / NewsletterCTA
- `components/home/cinematic-hero.tsx` — full rewrite (zoning + parallax)
- `components/home/featured-pup-spotlight.tsx` — full rewrite (storytelling banner)
- `components/home/character-showcase.tsx` — full rewrite (staggered)
- `components/home/feature-banner.tsx` — scale up, product collage
- `components/home/video-grid.tsx` — 3-card preview, see-all link
- `components/home/newsletter-cta.tsx` — full rewrite (community CTA)
- `components/characters/character-card.tsx` — hover name reveal + glow
- `components/ui/button.tsx` — add `size="xl"` if used

**Delete:**
- `components/home/icon-row.tsx` — replaced by MenuCards
- `components/home/promo-band.tsx` — not in new layout
- `components/home/activities-preview.tsx` — moved into MenuCards

## Implementation Steps

1. Update `app/page.tsx` to new section order. Stub missing components first to verify routing.
2. Build `menu-cards.tsx` w/ asymmetric grid + sticker rotations + hover lifts.
3. Rewrite `cinematic-hero.tsx`: zoning, parallax (desktop only), AtmosphereLayer.
4. Rewrite `featured-pup-spotlight.tsx`: full-bleed gradient, sun rays, oversized Buddy.
5. Rewrite `character-showcase.tsx`: staggered offsets, accent backdrops.
6. Update `character-card.tsx`: hover name pill + glow ring.
7. Refactor `feature-banner.tsx`: full-bleed, product collage placeholder.
8. Refactor `video-grid.tsx`: 3-card preview (use placeholder card matching P4 shape).
9. Rewrite `newsletter-cta.tsx`: community CTA + social proof.
10. Delete obsolete: `icon-row.tsx`, `promo-band.tsx`, `activities-preview.tsx`.
11. Visual + responsive QA: 360px / 768px / 1024px / 1440px / 1920px.
12. Reduced-motion test: parallax + hovers halt.

## Success Criteria

- [ ] Home page renders 7 sections in spec order
- [ ] Hero: text panel + character cluster never overlap at any breakpoint
- [ ] Hero parallax active ≥ md, disabled < md
- [ ] Menu cards: 7 visible, sticker rotations, hover lift smooth
- [ ] Meet Buddy: Buddy ≥ 70% panel height, copy readable AA contrast
- [ ] Character showcase: 5 staggered, hover reveals name + breed + glow
- [ ] Shop banner: full-bleed, CTA visually dominant
- [ ] Watch Together: 3 cards + see-all link, layout matches final P4 spec
- [ ] Newsletter CTA: form submits to existing `/api/newsletter` endpoint
- [ ] Lighthouse mobile perf ≥ 85
- [ ] Axe: zero AA violations across all sections

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Parallax causes jank on low-end mobile | Disabled <md; GPU transforms only; pause on `visibilitychange` hidden |
| Asymmetric menu grid breaks at odd breakpoints | Test 7 breakpoints; fallback to symmetric on <md |
| Buddy banner oversized image hits LCP | `priority` flag + `sizes` prop; preload as critical |
| Video grid placeholder diverges from P4 reality | Define shared `VideoCardProps` type up front; both phases consume same type |
| Coming-soon menu cards confuse users | Clear "Coming Soon" badge + disabled cursor |

## Code-review fixes applied (post-implementation)
- **C1** Missing menu-card assets — copied `assets/card/*.png` → `public/assets/card/*.png` (7 files).
- **C2** Tailwind 3.4 opacity-utility regression on hex CSS-var tokens — migrated all design tokens to dual hex + RGB-triplet form (`--ink` + `--ink-rgb`). Updated `tailwind.config.ts` to use `rgb(var(--…-rgb) / <alpha-value>)`. Verified compiled CSS now emits `.bg-ink\/85`, `.text-ink\/85`, etc. Also fixes the latent P1 carry-over.
- **H1** `cinematic-hero.tsx` + `hero-character-cluster.tsx` motion gated on `mounted` flag — no SSR/CSR mismatch, no flash on reduced-motion.
- **H2** `priority` removed from supporting character image (kept on primary LCP image only).
- **H3** Newsletter honeypot moved from `display:none` to off-screen positioning.
- **M1** Removed dead "View all characters" link in `CharacterShowcase` (no characters index page).
