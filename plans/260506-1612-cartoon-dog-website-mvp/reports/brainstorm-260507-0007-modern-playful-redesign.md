---
type: brainstorm
date: 2026-05-07
slug: modern-playful-redesign
status: shipped
---

# Modern Playful Redesign — Subtractive Pass

Reframed the Bluey-replica build to "clean modern, dog-themed" per Direction B.

## Decisions Locked

| Topic | Choice |
|---|---|
| Direction | B — Modern Playful |
| Palette | Refreshed (warm off-white base, sky used selectively) |
| Type case | Mixed (Title Case headlines, UPPERCASE kickers only) |
| Decoration density | Selective — 1-2 moments per page |

## Palette Refresh

```
NEW
--bg-base:      #FAF7EE  warm off-white (replaces cloud-pattern bg)
--bg-soft-sky:  #DDEEF7  muted sky (selective use)
--bg-warm-tan:  #F0E6D2  feature banners

KEPT
--brand-primary:  #FFD449  butter yellow
--accent-coral:   #FF7A85  coral (kickers, accents)
--ink:            #2B1D10  warm dark
--surface:        #FFFFFF
--bg-navy:        #1D2750  footer + dark CTAs
--bg-grass:       #7BC47F  footer signature

PARKED (kept in tokens, removed from default usage)
sky / sky-deep / peach / sage / blush / cream / mint / teal
```

## Section Cuts

**Home: 9 → 6**
- Hero · IconRow · CharacterShowcase · FeatureBanner · VideoGrid · NewsletterCTA
- Dropped: 2nd FeatureBanner (dark), SecondaryFeatureCard, ActivitiesPreview, WatchOnTile

**Shop: 9 → 5**
- Hero · PromoBand · ProductGrid · AboutShop · NewsletterCTA
- Dropped: CategoryTiles, PromoSplitCard interleave, 2nd PromoBand, CollectionsGrid, LatestPosts

## Component Refinements

- **TopNav** — light cream bg + ink text + Title Case items + single navy "Shop" sticker on right
- **Hero** — clean split (60/40), Title Case headline, single CloudDecoration moment, banner in soft-sky panel
- **IconRow** — quieter cards (single shadow), Title Case, text-link "View all →" instead of pill button
- **CharacterCard** — cream tile w/ 4px accent-color bottom border (not solid color tile), no rotation, Title Case name + breed
- **CharacterShowcase** — back to 5 chars (placeholders dropped), squiggle underline kept as 1 decoration moment, "View all →" text link
- **FeatureBanner** — single light variant (warm-tan bg + white card), Title Case, navy CTA pill
- **VideoGrid** — quieter cards (lighter shadow), Title Case headlines, "More on YouTube →" text link
- **NewsletterCTA** — single white card, no sparkles, dark navy submit button
- **Footer** — grass strip kept (signature), wavy horizon now uses bg-base, navy footer trimmed
- **ProductCard** — lighter shadow, Title Case, neutral tag pills, hover icon button retained

## Files Changed (~14 modified)

Modified: `globals.css`, `tailwind.config.ts`, `top-nav.tsx`, `mobile-nav.tsx`, `hero.tsx`, `icon-row.tsx`, `character-card.tsx`, `character-showcase.tsx`, `feature-banner.tsx`, `video-grid.tsx`, `newsletter-cta.tsx`, `footer.tsx`, `button.tsx`, `product-card.tsx`, `app/page.tsx`, `app/shop/page.tsx`, `characters.json`

## Components Now Unused (kept in repo, cleanup pass later)

`activities-preview.tsx`, `secondary-feature-card.tsx`, `watch-on-tile.tsx`, `category-tiles.tsx`, `collections-grid.tsx`, `latest-posts.tsx`, `promo-split-card.tsx`, `floating-pack.tsx`, `header-strip.tsx`, `kicker-label.tsx`, `placeholder-pup.svg`, `clouds-pattern.svg` (no longer body bg)

## Bundle

- Home: 116 kB
- Shop: 117 kB
- 5 character SSG routes (back from 8)
- All under 200 KB budget

## Visual Outcome

- Base: warm off-white, no cloud pattern repeating
- Single accent moments (coral kickers + butter buttons + navy anchors)
- Title Case headlines (no more shouty ALL CAPS)
- Cards feel softer (single shadow vs sticker-shadow)
- Hero feels editorial (split layout, no overlay card)
- Character row reads as a clean catalog row, not stickers
- Shop reads as a focused product page
- Footer grass strip remains as the one playful signature

## Trade-offs Accepted

- Less Bluey energy — quieter throughout
- Lost: 8-character grid (back to 5 real)
- Lost: multiple feature banners (single one on home)
- Lost: persistent sky-cloud bg (replaced with warm off-white)
- Lost: heavy sticker shadows (single shadow throughout)

## Outstanding TODOs (not in this pass)

- Delete unused component files in cleanup
- Real Privacy/Terms copy (legal)
- 5 character bios + taglines + funFacts in JSON
- YouTube channel + video IDs
