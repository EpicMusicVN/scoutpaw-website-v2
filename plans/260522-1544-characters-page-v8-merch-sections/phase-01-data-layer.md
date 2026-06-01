---
phase: 1
title: "Data Layer"
status: pending
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Data Layer

## Overview

Add a character↔merchandise link: a `CharacterProductSchema`, a `products`
array + `merchCtaHref` on `CharacterSchema`, and 2 products per character in
`characters.json`. No new content file or adapter method.

## Requirements

- Functional: `content.getCharacters()` returns characters each carrying a
  `products` array (2 entries) + an optional `merchCtaHref`.
- Non-functional: additive schema change (`.default([])` / `.optional()` so it
  never breaks existing-shaped data); fail-fast Zod validation at load.

## Architecture

`characters.json` already flows through `CharactersFileSchema` →
`getCharacters()`. Embedding `products` keeps merch co-located with the
character and needs zero new adapter wiring — `getCharacters()` returns it
unchanged.

## Related Code Files

- Modify: `lib/content/schemas.ts` (add `CharacterProductSchema`; extend
  `CharacterSchema`)
- Modify: `content/characters.json` (add `products` + `merchCtaHref` to all 5)
- Modify: `lib/content/index.ts` (re-export the `CharacterProduct` type)

## Implementation Steps

1. **`lib/content/schemas.ts`** — add before `CharacterSchema`:
   ```ts
   export const CharacterProductSchema = z.object({
     id: z.string().min(1),
     title: z.string().min(1),
     image: z.string().min(1),          // bare asset key, resolved via asset-url
     badge: z.string().optional(),       // optional highlight, e.g. "Bestseller"
     ctaHref: z.string().min(1),         // external storefront URL
   });
   export type CharacterProduct = z.infer<typeof CharacterProductSchema>;
   ```
   Then extend `CharacterSchema` with two fields (additive — place after
   `poses`):
   ```ts
   products: z.array(CharacterProductSchema).default([]),
   merchCtaHref: z.string().optional(),
   ```
2. **`content/characters.json`** — add to every one of the 5 characters:
   - `products`: 2 entries. Reuse existing assets for `image` (`shop/1.jpg`,
     `shop/2.jpg`, `shop/banner.jpg`, `shop/promotion.jpg`,
     `characters/*-bg.png`, `characters/golden-2.png`). `ctaHref` → the existing
     storefronts (`https://linktr.ee/puppycaretaker.shop`,
     `https://puppylullabytv-shop.fourthwall.com/`). Give some a `badge`. Pick
     titles that read as that character's merch (e.g. Max → plush, cozy blanket).
   - `merchCtaHref`: one of the storefront URLs (the section "Shop Collection"
     CTA target).
3. **`lib/content/index.ts`** — add `CharacterProduct` to the re-exported types
   from `./schemas`.
4. Run `pnpm typecheck` — must pass (the new optional/default fields keep every
   existing consumer valid).

## Success Criteria

- [ ] `CharacterProductSchema` + `CharacterProduct` type exported
- [ ] `CharacterSchema` has `products` (default `[]`) + `merchCtaHref` (optional)
- [ ] All 5 characters in `characters.json` have 2 products + a `merchCtaHref`
- [ ] `CharacterProduct` re-exported from `lib/content/index.ts`
- [ ] `pnpm typecheck` passes

## Risk Assessment

- **Malformed seed JSON** → Zod throws at load with a field path; fix + rerun.
- **Breaking existing character consumers** → `products` is `.default([])`,
  `merchCtaHref` is `.optional()` — purely additive, no existing reader breaks.
