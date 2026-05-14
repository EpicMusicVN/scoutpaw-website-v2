---
type: brainstorm
date: 2026-05-06
slug: bluey-inspired-reskin
status: approved
---

# Brainstorm: Bluey-Inspired Re-skin

Re-skin pass on top of completed MVP. Keep architecture, dog-first palette, and content adapter. Borrow Bluey.tv layout patterns for Nav, Header, Home, Shop, Footer.

## Decisions Locked

| Topic | Choice |
|---|---|
| Scope | Visual + layout for Nav, Home, Shop, Header, Footer |
| Audience | Stays dog-first; borrow Bluey patterns selectively |
| Visual closeness | Quite close — but ScoutPaw chars + own palette (IP-safe) |
| Refactor scope | Keep architecture, change visuals (~30%) |

## What Changes

**Tokens** — adds `--bg-sky`, `--bg-peach`, `--bg-sage`, `--bg-blush`, `shadow-sticker`. Existing dog-vision base stays.

**Header strip** — new thin band above nav linking to YouTube channel, dismissible.

**Nav** — larger logo, sticker-pill items w/ drop shadow.

**Home** — sectioned w/ alternating bright bgs + wave dividers:
1. Hero (banner + floating 5-character pack overlay w/ idle wiggle)
2. Meet the Pack (sky bg, colored tiles per character)
3. Watch With Us (cream, video grid)
4. Activities & More (peach bg, NEW — surfaces Coming Soon pages as bright cards)
5. Join the Pack (newsletter, sky bg)

**Shop** — promotion-strip hero, alternating section bgs, sticker Buy Now buttons.

**Footer** — sage bg, multi-column (Brand / Explore / Follow), paw print decorations.

**Buttons** — new `sticker` variant w/ drop shadow + lift-on-hover.

## What Stays Untouched

Content adapter, Zod schemas, Coming Soon pages, Character detail pages, Newsletter API, Shopify mock, Cookie consent, Analytics. Re-skin is presentational only.

## Files

**New (4):** `components/ui/wave-divider.tsx`, `components/nav/header-strip.tsx`, `components/home/activities-preview.tsx`, `components/home/floating-pack.tsx`

**Modified (~10):** tailwind config, globals.css, button, top-nav, hero, character-showcase, newsletter-cta, footer, layout, shop page, page.tsx

## Risks

- IP — keep characters + mark our own; palette warmer-yellow not Bluey-pink
- Bundle — wave SVG inline, no new deps
- Motion overload — `prefers-reduced-motion` honored, floating pack opts out

## Success Criteria

- Build passes; bundle ≤ 200 KB First Load
- All routes render correctly
- Lighthouse perf/a11y stay ≥ 90
- Reduced-motion still disables animations
- Visual feel notably more playful while staying ScoutPaw-distinct
