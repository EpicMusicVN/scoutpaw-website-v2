---
phase: 2
title: "Section Components"
status: pending
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: Section Components

## Overview

Build the two new components: `CharacterMerchCard` (a small product card) and
`CharacterSection` (a themed per-character editorial block blending the
character intro with a 2-product merch row + CTAs).

## Requirements

- Functional: a section renders character visual + name + description + 2 merch
  cards + a "Shop Collection" CTA + a "full story" link; merch cards open the
  external storefront in a new tab and fire a `track()` event.
- Non-functional: each file < 200 lines; valid HTML; AA contrast; responsive
  (2-col alternating → stacked); `next/image`; reduced-motion honored.

## Architecture

```
CharacterSection (server)                ← themed block, alternating side
  ├─ visual side: pose Image + bloom + CharacterAtmosphere/CharacterMotif
  └─ content side: kicker · name <h2> · tagline · bio
       ├─ merch row → CharacterMerchCard (client) × 2
       ├─ Button  → external merchCtaHref ("Shop {name}'s Collection")
       └─ Link    → /characters/[slug] ("Read {name}'s full story")
```

`CharacterSection` is a Server Component (static content + decorative layers);
`CharacterMerchCard` is a Client Component (it fires a `track()` analytics
event on click). The section's themed wash (`theme.surfaceTint` or a
low-opacity `heroGradient`) makes the merch read as part of the character's
world. `flip` (derived from the character's index) alternates the column order.

## Related Code Files

- Create: `components/characters/character-merch-card.tsx`
- Create: `components/characters/character-section.tsx`
- Read for patterns: `components/top-picks/offer-card.tsx`,
  `components/shop/product-card.tsx` (card language), `components/ui/button.tsx`,
  `components/characters/character-themes.ts`, `character-atmosphere.tsx`,
  `character-motif.tsx`, `lib/analytics/track.ts`, `lib/utils/asset-url.ts`

## Implementation Steps

1. **`character-merch-card.tsx`** — `"use client"`. Props
   `{ product: CharacterProduct; accentColor: string }`. Render a `next/link`
   to `product.ctaHref` (`target="_blank" rel="noopener noreferrer"`,
   `aria-label` noting "opens in new tab"), `onClick` → `track("BuyNowClick",
   { product: product.id })`. Card: `rounded-[1.5rem]` `border-ink/10`
   `bg-surface` `shadow-cozy`, hover `-translate-y-1` + `shadow-cozy-md`. Image
   area: `aspect-square`, tile bg tinted from `accentColor` (low-opacity), the
   `next/image` `object-contain`. Optional `badge` → small pill on `accentColor`
   with luminance-safe text (reuse the `readableText` idea — a tiny inline
   helper, or accept ink text since badges are short). Title `font-display`
   `line-clamp-2`.
2. **`character-section.tsx`** — Server Component. Props
   `{ character: Character; theme: CharacterTheme; flip: boolean; priority: boolean }`.
   - Root `<section id={character.slug} className="relative ... scroll-mt-20">`
     with a soft themed wash background (`theme.surfaceTint`).
   - Two-column grid (`md:grid-cols-2`); when `flip`, reverse the column order
     (`md:[&>*:first-child]:order-2` or an order utility).
   - **Visual column** — large pose (`next/image` `object-contain`,
     `priority={priority}`), themed bloom (`accentColor`), and subtle
     `CharacterAtmosphere` / `CharacterMotif` behind it.
   - **Content column** — breed kicker · `name` as `<h2>` (large `font-display`)
     · `tagline` subtitle · `bio` (short description) · a merch row
     (`grid grid-cols-2 gap-4`) of two `<CharacterMerchCard>` · a `<Button>`
     (variant dark) to `merchCtaHref` (external, new tab) labelled
     "Shop {name}'s Collection" · a text `Link` to `/characters/${slug}`
     labelled "Read {name}'s full story".
   - If the file approaches 200 lines, extract the merch row into a small
     `character-merch-row.tsx` sibling.
3. Responsive — desktop two-column alternating; `<md` stacks (pose on top,
   content below); the merch row stays 2-up (two small cards fit on mobile).
4. A11y — section `<h2>`; external links `rel="noopener noreferrer"` + new-tab
   `aria-label`; AA contrast (content on the light themed wash → `ink`).
5. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] `CharacterMerchCard` renders a product, opens the storefront in a new tab,
      fires `track()`
- [ ] `CharacterSection` renders visual + name + description + 2 merch cards +
      "Shop Collection" CTA + "full story" link, themed per character
- [ ] `flip` alternates the column order
- [ ] Both files < 200 lines (merch row extracted if needed)
- [ ] Responsive (2-col → stacked); AA contrast; `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **`character-section.tsx` > 200 lines** → extract `character-merch-row.tsx`.
- **Server/client boundary** → keep `CharacterSection` server; only
  `CharacterMerchCard` (with `onClick`) is `"use client"`.
- **Badge contrast on accent** → keep badges short; if a badge uses the accent
  bg, apply the luminance auto-text approach used by the v7 nameplate.
