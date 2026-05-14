---
phase: 4
title: Home Page
status: completed
priority: P1
effort: 8h
dependencies:
  - 3
---

# Phase 4: Home Page

## Overview
Build the marquee landing experience: hero w/ banner + animated character entrance, 5-character showcase w/ hover wiggle, curated YouTube grid (lite-youtube-embed), newsletter CTA, Lottie paws background. This is the Bluey-feel benchmark.

## Requirements
- Functional: shows banner, all 5 characters, 3–6 YouTube videos, newsletter signup form, footer
- Non-functional: LCP < 2.5s on 4G, CLS < 0.1, total JS ≤ 200KB initial; motion respects reduced-motion

## Architecture
Server component fetches content via adapter, passes to client components for motion. Hero uses `next/image` w/ priority for banner. Character showcase staggers in. Videos use `lite-youtube-embed` (defers iframe until click). Newsletter form posts to `/api/newsletter` (Phase 8).

## Related Code Files
- Create: `app/(marketing)/page.tsx` (or `app/page.tsx`)
- Create: `components/home/hero.tsx`, `components/home/character-showcase.tsx`, `components/home/video-grid.tsx`, `components/home/newsletter-cta.tsx`, `components/home/floating-paws.tsx`
- Create: `components/characters/character-card.tsx`
- Modify: `app/layout.tsx` if metadata needs page-specific override

## Implementation Steps
1. `Hero`: full-bleed banner, logo overlay, headline, subheadline, primary CTA (Shop) + secondary (Watch on YouTube)
2. Banner animation: characters fade-in + bounce-up via Framer stagger on mount
3. `FloatingPaws`: Lottie loop (paw prints drifting in background); lazy-load only on Home, respect reduced-motion
4. `CharacterShowcase`: 5x `CharacterCard` in grid (responsive: 1col → 2col → 5col), hover triggers `<Wiggle>`
5. `CharacterCard`: image, name, tagline, link to `/characters/[slug]`, accent color border
6. `VideoGrid`: 3–6 videos from `getVideos()`, responsive grid, `lite-youtube-embed` web component (registered once in layout or inline)
7. `NewsletterCTA`: heading, email input, submit → POST `/api/newsletter`, success/error states
8. SEO: metadata export — title, description, OG image (banner), JSON-LD for Organization
9. Lighthouse pass — fix CLS (image dimensions), LCP (preload banner)

## Success Criteria
- [ ] All 5 characters visible w/ correct images + accent colors
- [ ] 3+ YouTube videos render via lite-youtube-embed
- [ ] Newsletter form submits successfully (mock endpoint OK if Phase 8 not done)
- [ ] Lighthouse perf ≥ 90, a11y ≥ 95
- [ ] LCP < 2.5s, CLS < 0.1 (Vercel Analytics or local Lighthouse)
- [ ] Hover wiggle works on character cards
- [ ] Reduced-motion disables animations
- [ ] Looks correct on mobile, tablet, desktop

## Risk Assessment
- Framer + Lottie bundle bloat — lazy-load Lottie via dynamic import, only enable on viewport intersect
- Banner LCP — `priority` flag on next/image, preload hint
- YouTube embed perf — `lite-youtube-embed` solves (no iframe until click)
- Lottie file size — keep paws Lottie < 50KB, fallback to CSS-only animation if exceeded
