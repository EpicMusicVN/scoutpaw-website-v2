---
type: brainstorm
date: 2026-05-06
slug: bluey-match-pass
status: shipped
---

# Bluey-Match Pass (Phases A-D)

Full alignment pass after gap audit against bluey/home.jpg + bluey/shop.jpg.

## Phase A — Visual Polish

- Button: added `dark` variant (navy bg, white text) for use inside light cards
- TopNav: items center-justified between logo (left) and account icon + hamburger (right). Disabled items now show ▼ chevron instead of "Soon" badge (Bluey-style dropdown indicator)
- Hero: removed CTAs from welcome card (Bluey card is text-only); kept welcome copy + brand mark + tagline; added decorative carousel chevrons (visual hint, not wired)
- Mobile hero card stacks below banner (already in place from previous pass)

## Phase B — Layout Structure

- Added 3 placeholder characters: Penny (Beagle), Charlie (Dachshund), Daisy (Pug). Each uses `placeholder-pup.svg` (silhouette dog w/ "SOON" label) and is marked with "NEW PUP" pill on the tile
- CharacterShowcase upgraded to 2x4 grid (was 1x5). Per-tile rotation alternates -2/+1/-1/+2 for sticker feel; hover unrotates
- Removed name+breed labels under tiles (Bluey doesn't show them) — labels still on the detail page
- Added "View All" navy button below grid
- New `SecondaryFeatureCard` component — Bluey "Happy Snaps" pattern; sits between feature banners and videos
- New `WatchOnTile` component — Bluey "Watch Bluey on Disney Junior" pattern; sits before newsletter

## Phase C — Shop Additions

- Mock products expanded from 4 to 8 (fills 4-up grid + interleaved promo cleanly)
- ProductCard: whole card now clickable (Bluey pattern); tag pills above title (Bluey "BLUEY · STUDENTS" pattern); hover-only navy arrow icon in image corner for affordance; explicit Buy Now button removed
- ProductGrid: 4-up at xl, 3-up at lg, 2-up on mobile
- New `CategoryTiles` (3-up — Plushes / Apparel / Home Goods)
- New `PromoSplitCard` (yellow split card, navy CTA) — interleaved between two halves of product grid (Bluey "I Slipped on My Beans" pattern)
- New `CollectionsGrid` (3-up — All Collections)
- New `LatestPosts` (3-up — uses videos when available, falls back to placeholder posts)
- New `AboutShop` (3-column long-form text)
- Shop hero CTA changed to `dark` variant button

## Phase D — Footer

- Grass strip: increased to 80px / 112px (mobile/desktop). Tall grass blade SVGs, daisy flowers (yellow petals + cream centers), small pink/coral flowers scattered
- Wavy horizon: more dramatic waves between sky and grass
- Footer bottom: added Privacy · Terms · Cookie Settings link row (replaces "Made with paws & pixels" tagline)
- Stub pages created: `/privacy`, `/terms` (placeholder copy, marked TODO for production)

## Files

**New (10):** `placeholder-pup.svg`, `secondary-feature-card.tsx`, `watch-on-tile.tsx`, `category-tiles.tsx`, `promo-split-card.tsx`, `collections-grid.tsx`, `latest-posts.tsx`, `about-shop.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`

**Modified (~12):** `characters.json`, `button.tsx`, `top-nav.tsx`, `hero.tsx`, `character-card.tsx`, `character-showcase.tsx`, `product-card.tsx`, `product-grid.tsx`, `mock-products.ts`, `queries.ts`, `get-products.ts`, `types.ts`, `footer.tsx`, `app/page.tsx`, `app/shop/page.tsx`

## Bundle (under 200 KB target)

- Home: 116 kB
- Shop: 117 kB
- 8 character SSG paths
- All routes within budget

## Trade-offs Acknowledged

| Bluey has | We have |
|---|---|
| 8 real characters | 5 real + 3 placeholders (clearly labeled "NEW PUP") |
| Sub-brand logos in footer | None (single brand) |
| News articles in Latest News | YouTube videos (when available) or placeholder posts |
| Lifestyle photo in shop hero | promotion.png illustration |
| Real product collections | 3 mock collections (decorative for MVP) |
| Long-form blog posts | Placeholder post copy |

## Outstanding (TODOs in JSON / content)

- 3 placeholder characters need real art + bios when drawn
- YouTube channel URL + 3 featured video IDs
- Real product catalog when Shopify store goes live
- Real blog/news content
- Production-grade Privacy + Terms copy (legal)
