---
phase: 1
title: "Content Layer"
status: completed
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Content Layer

## Overview

Add the Top Picks content type to the JSON → Zod → adapter pipeline: schemas,
seed JSON, and a `getTopPicks()` adapter method. No UI in this phase.

## Requirements

- Functional: `content.getTopPicks()` returns a validated `{ deal, picks }`
  object; picks sorted by `order`.
- Non-functional: fail-fast Zod validation at module load (matches existing
  sources); Sanity swap path preserved; follows the `getChannels`/`getPlaylists`
  precedent exactly.

## Architecture

New content type mirrors the established pattern. `top-picks.json` is itself the
file shape (`{ deal, picks }`), so `TopPicksContentSchema` doubles as the file
schema — no separate wrapper needed.

## Related Code Files

- Create: `content/top-picks.json`
- Modify: `lib/content/schemas.ts` (append top-picks schemas + constants)
- Modify: `lib/content/adapter.ts` (add `getTopPicks` to `ContentSource`)
- Modify: `lib/content/sources/json-source.ts` (implement `getTopPicks`)
- Modify: `lib/content/sources/sanity-source.ts` (stub `getTopPicks`)
- Modify: `lib/content/index.ts` (export `TopPick`, `TopPicksContent`,
  `TopPickCategory`, `DealBlock` types)

## Implementation Steps

1. **`lib/content/schemas.ts`** — append after the Video/Channel block:
   ```ts
   // Top Picks — curated favourites surface on /top-picks.
   export const TOP_PICK_CATEGORIES = [
     "apparel", "pet-supplies", "pet-toys", "home-living", "others",
   ] as const;
   export const TopPickCategorySchema = z.enum(TOP_PICK_CATEGORIES);
   export type TopPickCategory = z.infer<typeof TopPickCategorySchema>;

   export const TOP_PICK_CATEGORY_LABELS: Record<TopPickCategory, string> = {
     apparel: "Apparel",
     "pet-supplies": "Pet Supplies",
     "pet-toys": "Pet Toys",
     "home-living": "Home Living",
     others: "Others",
   };

   export const TopPickSchema = z.object({
     id: z.string().min(1),
     title: z.string().min(1),
     category: TopPickCategorySchema,
     image: z.string().min(1),          // bare asset key, resolved via asset-url
     badge: z.string().optional(),       // discount/highlight e.g. "30% OFF"
     rating: z.number().min(0).max(5).optional(),
     popularity: z.string().optional(),  // e.g. "Bestseller", "1.2k sold"
     ctaLabel: z.string().default("Shop Now"),
     ctaHref: z.string().min(1),         // external storefront URL
     order: z.number().int().nonnegative(),
   });
   export type TopPick = z.infer<typeof TopPickSchema>;

   export const DealBlockSchema = z.object({
     badge: z.string().min(1),
     title: z.string().min(1),
     description: z.string(),
     image: z.string().min(1),
   });
   export type DealBlock = z.infer<typeof DealBlockSchema>;

   export const TopPicksContentSchema = z.object({
     deal: DealBlockSchema,
     picks: z.array(TopPickSchema),
   });
   export type TopPicksContent = z.infer<typeof TopPicksContentSchema>;
   ```
2. **`content/top-picks.json`** — seed `{ deal, picks }`. 10 picks, 2 per
   category, `order` 1..10. Reuse existing assets (only ~9 distinct images
   exist — repetition is expected and accepted): `shop/1.jpg`, `shop/2.jpg`,
   `shop/banner.jpg`, `shop/promotion.jpg`, `characters/corgi-bg.png`,
   `characters/poodle-bg.png`, `characters/collie-bg.png`,
   `characters/husky-bg.png`, `characters/golden-2.png`. `deal.image` →
   `shop/promotion.jpg`. `ctaHref` → reuse the storefront links already in
   `explore-products.tsx`: `https://linktr.ee/puppycaretaker.shop` and
   `https://puppylullabytv-shop.fourthwall.com/`. Give most picks a `badge`,
   some a `rating` (e.g. 4.6–4.9), some a `popularity` string — vary so the
   card UI exercises all optional fields.
3. **`lib/content/adapter.ts`** — add to the `ContentSource` interface:
   `getTopPicks(): Promise<TopPicksContent>;` and import `TopPicksContent`.
4. **`lib/content/sources/json-source.ts`** — import `top-picks.json`, parse
   once at module load with `TopPicksContentSchema`, sort `picks` by `order`,
   implement `async getTopPicks()` returning the parsed object.
5. **`lib/content/sources/sanity-source.ts`** — add
   `async getTopPicks() { return notImplemented("getTopPicks"); }`.
6. **`lib/content/index.ts`** — add `TopPick`, `TopPicksContent`, `DealBlock`,
   `TopPickCategory` to the re-exported types from `./schemas`.
7. Run `pnpm typecheck` — must pass.

## Success Criteria

- [ ] `content/top-picks.json` exists with 10 picks (2 per category) + a deal
- [ ] Schemas + category constants exported from `schemas.ts`
- [ ] `getTopPicks()` in interface, json-source (real), sanity-source (stub)
- [ ] Types re-exported from `lib/content/index.ts`
- [ ] `pnpm typecheck` passes

## Risk Assessment

- **Malformed seed JSON** → Zod throws at build with field path; fix and rerun.
- **Schema drift vs character work** on `schemas.ts` → append-only, no edits to
  existing schemas; conflict-free.
