# Brainstorm — Top Picks Amazon Products

**Date:** 2026-06-01 05:41 | **Status:** Agreed | **Scope:** Top Picks page only

## Problem Statement

Replace the 10 placeholder picks on `/top-picks` with 9 real Amazon affiliate products (across 5 categories). Display image + title + short description + CTA to Amazon. Match existing design system. Handle missing data gracefully.

## Hard Truths Surfaced

1. **Auto-fetching Amazon data at runtime is forbidden** (ToS) and impractical (anti-bot blocks, broken weekly). PA-API requires 3 qualifying affiliate sales for access — chicken-and-egg.
2. **Live price display is forbidden by Amazon Associates ToS** without real-time PA-API. Dropped from scope.
3. **Existing `OfferCard` has no description slot.** Schema + card both need a small extension.
4. **FTC + Amazon ToS require affiliate disclosure** visible on the page.

## User Decisions

| Question | Answer |
|---|---|
| Data source | Hand-author JSON (no PA-API, no scraper, no paid service) |
| Image hosting | Upload to R2 bucket (`scoutpaw` bucket, `top-picks/` prefix) |
| Replace vs add | Replace all 10 placeholders |
| Affiliate tags | Preserve URLs as-given (3 `melosy-20` + 6 `puppycaretaker-20`) |
| Descriptions | Use Amazon's first description sentence verbatim |
| Disclosure placement | Top of TopPicksBoard, below heading |
| R2 upload execution | Claude runs the script in-session |

## Final Solution

### Files touched

| File | Change |
|---|---|
| `content/top-picks.json` | Replace `picks` array with 9 entries. Keep existing `deal` block (refresh later if needed). |
| `lib/content/schemas.ts` | Add `description: z.string().optional()` to `TopPickSchema`. **No price field.** |
| `components/top-picks/offer-card.tsx` | Render `pick.description` (2-line clamp) between title and rating. |
| `components/top-picks/top-picks-board.tsx` | Add affiliate disclosure line below heading: *"As an Amazon Associate we earn from qualifying purchases."* |
| `public/assets/top-picks/{slug}.jpg` × 9 | Downloaded product images (local fallback for dev). |
| `scripts/upload-top-picks-images.mjs` (NEW) | One-shot Node script: reads R2 creds from `.env.local`, uploads 9 JPGs to R2 under `top-picks/{slug}.jpg`. |
| `package.json` | Add `@aws-sdk/client-s3` as `devDependencies`. |
| `docs/codebase-overview.md` | Note real Amazon affiliate products live on Top Picks. |
| `docs/project-changelog.md` | New entry. |
| `next.config.ts` | No change (not hot-linking Amazon CDN). |

### Acquisition workflow

| Phase | Step | Failure mode |
|---|---|---|
| 1 | WebFetch each Amazon URL → extract title, image URL, first description sentence, best-guess category | Amazon blocks WebFetch → ask user to paste data |
| 2 | `curl` each image URL with browser UA → save as `/public/assets/top-picks/{slug}.jpg`, verify via `file` | HTML decoy detected → ask user for direct image URL |
| 3 | Categorize each ASIN against `TOP_PICK_CATEGORIES` (apparel \| pet-supplies \| pet-toys \| home-living \| others); slug from title | Ambiguous category → confirm with user |
| 4 | Edit `top-picks.json` with 9 new entries; edit schema + offer-card; add disclosure | Typecheck/lint fail → fix and re-verify |
| 5 | Run R2 upload script with `.env.local` creds; verify by HEAD request to `https://images.scoutpaw.tv/top-picks/{slug}.jpg` | Auth/perms fail → fall back to /public-only path |
| 6 | Live render `/top-picks`; visual check; affiliate disclosure visible | Layout broken → adjust offer-card padding |

### Schema change

```ts
export const TopPickSchema = z.object({
  // ... existing fields
  description: z.string().optional(), // 1-2 sentence short description
});
```

### Offer card render slot

```tsx
{/* Below title, above rating */}
{pick.description && (
  <p className="mt-2 line-clamp-2 text-sm text-ink-blue/75 md:text-base">
    {pick.description}
  </p>
)}
```

### Affiliate disclosure component

Small italic line in TopPicksBoard, below the existing heading + above the filter chips:

> *As an Amazon Associate we earn from qualifying purchases. Featured products link to Amazon and open in a new tab.*

### What we are NOT doing (YAGNI)

- PA-API integration
- Live price display
- Hot-linking Amazon CDN
- Auto-refresh / scheduled fetcher
- Image optimization beyond what Amazon serves
- Custom category for cat products (Friskies B0777J8V5J fits `pet-supplies`)

### Risks

| Risk | Mitigation |
|---|---|
| WebFetch blocked by Amazon | Manual paste fallback per ASIN |
| Image URL returns HTML decoy | `file` verifies type post-download; retry with different UA or ask for direct URL |
| Image too large | Skip optimization for v1; if any >300KB, add ImageMagick step |
| R2 upload auth fails | Fall back to `/public` only; user can sync to R2 later |
| Affiliate disclosure overlooked | Placed prominently at top, not in footer |
| ASIN points to retired/OOS product | Card still renders; CTA opens Amazon and user can refund-loop manually |

### Success Criteria

- 9 entries in `content/top-picks.json`, each with: id, title, category, image (`top-picks/{slug}.jpg`), optional description, optional badge/popularity/rating, ctaLabel, ctaHref (Amazon URL with affiliate tag preserved), order
- 9 JPGs in `public/assets/top-picks/` AND in R2 bucket at `top-picks/{slug}.jpg`
- Affiliate disclosure visible at top of TopPicksBoard
- `pnpm typecheck` + `pnpm lint` clean
- 10 old placeholder picks removed (`pack-leader-hoodie`, `good-boy-tee`, etc.)
- `/top-picks` renders 9 cards correctly in dev and prod

### Open Questions

1. **Deal block** — current "Cozy Season Bundle" stays for v1. Refresh / repurpose / drop decision deferred to follow-up. Not blocking.
2. **Cat products on a dog-focused site** — Purina Friskies (B0777J8V5J) is cat food. Ship as-is per user's product list; brand-narrative justification (e.g. "for the multi-pet household") implicit.
3. **Out-of-stock handling** — accepted as user-managed refresh; no UI flagging needed for v1.

## Sources

- [Amazon Associates Operating Agreement (re: price display, disclosure)](https://affiliate-program.amazon.com/help/operating/agreement)
- [FTC endorsement guide for affiliate disclosure](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers)
- [Amazon Product Advertising API 5.0 docs](https://webservices.amazon.com/paapi5/documentation/)
- Existing pattern: `content/top-picks.json` (hand-authored JSON) + `lib/content/schemas.ts` `TopPickSchema`
