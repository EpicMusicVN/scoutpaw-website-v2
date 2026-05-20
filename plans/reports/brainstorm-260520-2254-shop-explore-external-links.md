# Brainstorm — Shop "Explore Products" External Links

**Date:** 2026-05-20 22:54 | **Status:** Agreed | **Scope:** 1 file

## Problem Statement

Shop page "Explore Products" cards should send visitors to external storefronts:

- **Dog Calming & Essentials Collection** → `https://linktr.ee/puppycaretaker.shop`
- **Dog owner gifts** → `https://puppylullabytv-shop.fourthwall.com/`

Both open in a new tab.

## Scout Findings

- `components/shop/explore-products.tsx` — renders 2 visible cards (`plushes`, `apparel`); 2 more tiles filtered out via `VISIBLE_CATEGORIES`.
- "Shop →" is a `<span>` affordance inside a card-wide `next/link` `<Link>` — not a standalone `<button>`. Whole card is the click target.
- **Bug found:** cards link to `/shop?cat=...#products`, but `app/shop/page.tsx` no longer renders any `ProductGrid` / `#products` section. Current links hit a dead anchor. This change also fixes that.

## Evaluated Approaches

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| A. Whole card → external `<a target="_blank">` | Matches current click UX, no nested-interactive issues, minimal churn | — | **Chosen** |
| B. Restructure so only "Shop →" is the link | Narrower hit target | More markup churn, card body goes non-interactive, no real benefit | Rejected |

## Final Solution

Single file: `components/shop/explore-products.tsx`.

1. Add optional `href` field to the `Tile` type (external URL). Optional so the 2 hidden tiles need no fake value; visible tiles always set it.
2. Set per visible tile:
   - `plushes` (Dog Calming & Essentials Collection) → `https://linktr.ee/puppycaretaker.shop`
   - `apparel` (Dog owner gifts) → `https://puppylullabytv-shop.fourthwall.com/`
3. Replace card-wide `<Link href={internal}>` with `<a href={tile.href} target="_blank" rel="noopener noreferrer">`. Remove now-unused `next/link` import.
4. `aria-label`: `"Browse …"` → `"Shop … (opens in new tab)"` — screen-reader new-tab hint (agreed).

## Risks

- Low. Static external URLs; no data flow. Verify both URLs resolve before merge.

## Success Criteria

- Each card opens its correct URL in a new browser tab.
- `rel="noopener noreferrer"` present on both.
- `aria-label` announces "opens in new tab".
- No remaining reference to dead `#products` anchor from these cards.
- `next build` / lint pass.

## Next Steps

- Implement the 4 edits in `explore-products.tsx`. Trivial scope — no multi-phase plan needed.
