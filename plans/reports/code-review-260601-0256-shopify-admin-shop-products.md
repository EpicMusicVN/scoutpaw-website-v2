# Code Review — Shopify Admin Shop Products

Scope: 9 focus files. typecheck clean, lint clean, no residue grep.

## Verdict

Ship. Sound, secure, no broken patterns. Two low-priority observations and one informational follow-up.

---

## Security (PASS)

- `import "server-only"` correctly at top of `lib/shopify/client.ts:1` AND `lib/shopify/get-products.ts:1`. Any client import will hard-fail at build.
- No client component imports either module. Grep confirms only `app/shop/page.tsx` (RSC) imports `getProducts`. `product-grid.tsx` + `product-card.tsx` are `"use client"` but only consume the typed `ShopProduct[]`, never the fetcher.
- `process.env.SHOPIFY_ADMIN_TOKEN` is read **inside the function body** of `adminFetch` (client.ts:25), not at module scope. Next.js cannot inline a function-scoped `process.env` read into a client bundle even by accident.
- Token never echoed in URL — header-only (`X-Shopify-Access-Token`, client.ts:38). URL template at client.ts:33 contains only the store domain.
- Error path: `console.error("[shopify] Admin errors:", errors)` (get-products.ts:58) — when the 401/403 branch fires, `errors = { status, statusText }` (no headers, no body, no token). When the GraphQL `errors` array fires, Shopify's GraphQL error payload does not echo request headers. Safe.
- Caught exception path logs the raw `err` (get-products.ts:63). `fetch` rejects typically carry network/DNS messages, not request headers — also safe. If a future refactor wraps `err` with the request body, that body is `{query, variables}`, not the token — still safe.
- `.env.local.example:19` explicitly warns `SERVER-ONLY — never expose with a NEXT_PUBLIC_ prefix`. Good.

## Correctness (PASS)

Admin GraphQL 2024-10 schema fields all valid:
- `products(first, query, sortKey)` — correct shape (Admin uses search filter on `query`, Storefront uses query-string).
- `query: "status:active AND published_status:published"` — documented Admin search syntax. `published_status:published` filters items published to the **Online Store** sales channel, which is the prerequisite for the `{domain}/products/{handle}` fallback URL to resolve. The pairing is intentional and correct.
- `sortKey: BEST_SELLING` — valid `ProductSortKeys` enum value.
- `priceRangeV2.minVariantPrice {amount, currencyCode}` — current field (`priceRange` deprecated as the comment notes).
- `onlineStorePreviewUrl`, `featuredImage{url,altText}`, `tags`, `description`, `handle`, `id` — all valid `Product` fields on 2024-10.

`mapNode` handles nullable shapes correctly:
- `featuredImage: null` → `imageUrl: null`, `imageAlt: null` (matches `ShopProductSchema` nullability).
- `tags: []` → `node.tags ?? []` (defensive even though Admin returns `[]` not `null`).
- `description: ""` → guarded with `?? ""`.
- `onlineStorePreviewUrl: null` → `buildStorefrontUrl(handle)` returns `https://{domain}/products/{handle}`.

## Resilience (PASS)

Verified the bad-token chain:
1. 401/403 → `response.ok === false` → `adminFetch` returns `{ errors: { status, statusText } }` (no throw).
2. `getProducts` sees `errors` truthy → logs → returns `[]`.
3. `app/shop/page.tsx:54` falls through to `<ShopEmptyState />`.

Network throw (DNS, timeout) → caught at get-products.ts:62 → `[]` → empty state. Chain holds.

GraphQL `errors` (200 with body errors) → same `[]` fallback. Holds.

## Caching (PASS)

- `next: { revalidate: 3600, tags: ["shopify-products"] }` applied at `client.ts:43`.
- No `cache: "no-store"` anywhere in the path.
- Tag `shopify-products` reserved for `revalidateTag()` webhook wire-up (per changelog out-of-scope note).
- No stale-while-error concern: on error the request is NOT cached (Next only caches successful fetches), so a transient 5xx will be retried on next request rather than poisoning the ISR cache with `[]`. Good.

## Type Safety (PASS)

- `ShopProductsSchema.parse(...)` at get-products.ts:61 rejects malformed responses (would throw and land in the catch → `[]`).
- `LiveResponseNode` matches the GraphQL selection set precisely (no missing fields, no extras).
- `mapNode` output is exhaustively typed against `ShopProduct` — TS would have caught any missing key.

## Patterns / Consistency (PASS)

- `app/shop/page.tsx` is async RSC — matches the team's RSC pattern (e.g., other `app/*/page.tsx` files use `await getCharacters()` etc. through the content adapter).
- New section uses identical kicker + h2 idiom as `AboutShop.tsx:60-66` and `ExploreProducts.tsx:69-78`:
  - kicker: `font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm`
  - h2: `mt-3 font-display text-4xl font-bold heading-gradient-gold-light md:text-6xl lg:text-7xl`
  - section: `mx-auto max-w-hero px-4 py-24 md:px-8 md:py-32`
- `ScrollReveal` wrap + `CloudDivider` cadence matches the existing rhythm.
- Image allowlist `cdn.shopify.com` already in `next.config.ts:12` — covers all Shopify CDN-hosted featured images.

## Docs Accuracy (PASS)

- `docs/deployment.md` env table: `SHOPIFY_ADMIN_TOKEN` row matches `.env.local.example`. "Switching Mock → Live" Custom App flow + `read_products` scope matches code expectation.
- `docs/codebase-overview.md`: Stack line ("Shopify Admin GraphQL API via raw `fetch` (server-only)..."), folder annotation (`lib/shopify/`), shop route annotation (`async RSC — ExploreProducts tiles + ProductGrid (live Shopify) + AboutShop`), and outstanding TODO ("Custom App, `read_products` scope") all accurate.
- `docs/project-changelog.md` 2026-06-01 entry: file-level diffs match reality.

No drift detected.

## Dead Code / Regressions (PASS)

Verified by grep across `lib/`, `app/`, `components/`, `docs/`, `.env.local.example`, `package.json`, `pnpm-lock.yaml`:
- No `@shopify/storefront-api-client` references (lockfile clean).
- No `SHOPIFY_STOREFRONT_TOKEN` references (outside historical plan docs).
- No `createStorefrontApiClient` / `getStorefrontClient` references.
- `mock-products.ts` shape unchanged, still matches `ShopProductSchema`. No regression.
- `categorize.ts` operates on `ShopProduct.tags` + `title` only — unaffected by the source swap.

---

## Low-Priority Observations

### LOW-1: `categorizeProduct` ignores `description`

`categorize.ts:33-38` tokenizes `tags + title` only. With Admin data, `description` is now a rich Shopify product field. Products lacking explicit category tags (e.g., a plush mug labeled only "Buddy's Mug") will silently fall to `"accessories"` (the default bucket). Not a regression — pre-existing behavior — but worth noting since live data variety will exceed the curated mock set. **Action:** defer. Re-evaluate after first live render shows real distribution.

### LOW-2: `buildStorefrontUrl` silently returns `null` if env is missing

`get-products.ts:24-25`: `if (!domain) return null;` — but in live mode `adminFetch` already throws at client.ts:28 before this runs, so this branch is unreachable in live mode. Dead defensive code; type-system forces the guard. Acceptable per the inline comment, but a brief assertion or `// unreachable` marker would make intent clearer to future readers. **Action:** optional cleanup.

### INFO-1: `revalidate: 3600` is hard-coded

Reasonable default. Tag-based webhook revalidation is the planned escape hatch (per changelog out-of-scope). No action.

### INFO-2: `first = 24` default + no pagination

Per plan, intentionally out of scope. If catalog grows beyond 24, the section will silently truncate. Today's catalog is small. **Action:** add a TODO comment in `getProducts` signature for future-self, or rely on existing changelog "Out of Scope" note. Optional.

### INFO-3: Mock-mode `categorize` keyword set

`KEYWORD_MAP` may miss live-data terminology (e.g., "calming", "essentials", "anxiety" — used in `ExploreProducts` copy). Not introduced by this change but worth a follow-up pass once live tags are observed.

---

## Validation Results

- `pnpm typecheck` — clean
- `pnpm lint` — clean (`No ESLint warnings or errors`)
- Grep gates (no storefront client residue across lib/app/components/docs/.env/package/lockfile) — clean
- Pattern-match against `AboutShop` / `ExploreProducts` for kicker+h2 idiom — match

---

**Status:** DONE
**Summary:** Swap is sound, secure, and consistent with project patterns; typecheck + lint + grep gates green; no critical or high concerns. Only low/info-level follow-ups around category heuristics and a dead defensive branch.
**Concerns/Blockers:** none
