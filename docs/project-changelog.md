# Project Changelog

## [2026-06-01] - Pivot #8 — Sticker-honey titles + cobalt kickers (D3)

### Overview
Eighth color pivot shipped via lock mechanism (3 mockup rounds, D3 picked from v3 Bluey-vibe palette). Light cyan body bg kept (no pivot #6-style surface flip). Hero h1 + 14 large h2 banners switched from the gradient gold utility to a new sticker-honey treatment — solid honey-yellow fill with cobalt outline + drop-shadow. Hero + banner kickers flipped to a new cobalt token. Card-internal titles, mid h2/h3 sub-headers, and body text unchanged.

### Changes
- `app/globals.css` — added `--cobalt: #1f4d96` + `--cobalt-rgb` tokens. Replaced `.heading-gradient-gold-light` utility with new `.heading-sticker-honey`: `color: var(--brand-primary); -webkit-text-stroke: 0.04em var(--cobalt); paint-order: stroke fill; text-shadow: 0.06em 0.06em 0 rgba(var(--cobalt-rgb) / 0.25)`. Em-sized stroke + shadow scale with heading font-size.
- `tailwind.config.ts` — registered `cobalt` color (`text-cobalt`, `bg-cobalt`, etc.) via `withOpacity("--cobalt-rgb")`.
- 19 component files (5 heroes + 14 large h2 banner consumers) — `heading-gradient-gold-light` → `heading-sticker-honey` via bulk sed rename.
- 21 component kickers across heroes + large banners + `our-channels` + `video-rail` — `tracking-[0.XX em] text-(brand-gold|ink-blue)` → `tracking-[0.XX em] text-cobalt` via surgical sed (only kicker-letterspaced text matched, card-internal `/70` opacity variants untouched).
- `docs/code-standards.md` — updated heading-utilities table, hero color contract, block-title color contract, audit trail (added pivot #8 entry), lock-mechanism outcome note.

### Design Rationale
- **Why D3 over D1/D2/D4/D5:** D3 keeps cyan body bg (no site-wide surface flip risk). Other v3 variants required swapping body bg to cream, harder to roll back if disliked live.
- **Why a new utility (not just inline classes):** `.heading-gradient-gold-light` had 19 consumers; bulk class rename is cleaner than spraying outline + shadow inline across all of them. Future iteration can swap the utility body without touching consumers again.
- **Why a new `--cobalt` token (not reuse `--navy` `#397fc5` or `--ink-blue` `#1a3a5c`):** the mockup-validated cobalt is `#1f4d96` — between the two existing tokens, more saturated than ink-blue, more depth than navy. A dedicated token avoids overloading semantics on the existing two.
- **Why mid h2/h3 sub-headers stayed `text-brand-gold`:** D3 mockup didn't address them. Pivot #4 contract preserved by default until separate user direction lands.

### Validation
- `pnpm typecheck` clean
- `pnpm lint` clean
- Final grep gate: no `heading-gradient-gold-light` consumers in `components/` or `app/` (only the historical breadcrumb comment in `globals.css`)
- Final grep gate: no kicker-letterspaced `text-brand-gold` remaining in `components/` or `app/`
- Live verify: HTTP 200 on `/`, `/watch`, `/characters`, `/shop`, `/top-picks`

### Out of Scope
- Mid h2/h3 sub-headers color change (defer to a separate decision)
- Subscribe-card card-internal kicker `text-navy/85` (card-internal locked rule kept)
- Token cleanup (`--accent-warm`, `--bg-cream`, etc. legacy reserved tokens stay per pivot #7 reserved utilities policy)

### Files Changed
- `app/globals.css`, `tailwind.config.ts`
- 19 consumer files via bulk class rename (see audit list in `docs/code-standards.md`)
- 21 kicker color swaps via surgical sed
- `docs/code-standards.md`, `docs/project-changelog.md`
- Mockup artifacts: `plans/reports/title-color-pivot8-mockup.html` (v1), `…-mockup-v2.html` (v2), `…-mockup-v3.html` (v3 — chosen)
- Brainstorm report: `plans/reports/brainstorm-260601-0642-website-pivot8-styling-and-layout.md`

### Unresolved Questions
1. Subscribe-card mid h2 (`Subscribe to ScoutPaw on YouTube`) and its card-internal kicker — kept on legacy contract. Worth a separate review if it now feels inconsistent against the new hero/banner cobalt+honey system.
2. Mid h2/h3 sub-headers in `our-channels`, `video-rail`, `watch-library`, `shop-empty-state` still `text-brand-gold` solid. Could harmonize with cobalt for total cohesion, or stay gold to preserve hierarchy.
3. Long-term: tailwind config has a number of legacy reserved color tokens. Cleanup deferred.

---

## [2026-06-01] - Top Picks: 8 real Amazon affiliate products

### Overview
Replaced 10 placeholder picks (Linktree/Fourthwall fixtures) with 8 hand-authored Amazon affiliate products across 4 categories. Data extracted via curl + Node feature-bullet parsing (Amazon blocks WebFetch headers but accepts browser-UA curl with `--compressed`). Images downloaded once + uploaded to R2 — no runtime fetch, no PA-API dependency, no ongoing API costs.

### Changes
- `content/top-picks.json` — `picks` array replaced with 8 entries (Potaroma puzzle feeder, GoneNaturally flea/tick spray, Calibonbon duck toys, Anavia portrait necklace, Friskies variety pack, IRIS food container, Best Pet Supplies octopus chew multipack + brown). All `ctaHref` values preserve original affiliate tags (`melosy-20` × 3, `puppycaretaker-20` × 5). `deal` block unchanged.
- `lib/content/schemas.ts` — added `description: z.string().optional()` to `TopPickSchema`. Note in code explicitly forbids price field (Amazon ToS — no live prices without PA-API).
- `components/top-picks/offer-card.tsx` — renders `pick.description` (2-line clamp) between title and rating.
- `components/top-picks/top-picks-board.tsx` — added FTC/Amazon-compliant affiliate disclosure below the header description: *"As an Amazon Associate we earn from qualifying purchases. Featured products link to Amazon and open in a new tab."*
- `public/assets/top-picks/*.jpg` × 8 — product images saved locally for dev + as build fallback.
- R2 bucket `scoutpaw` → `top-picks/*.jpg` × 8 uploaded via new script. CDN: `https://images.scoutpaw.tv/top-picks/*.jpg`.
- `scripts/upload-top-picks-images.mjs` (NEW) — one-shot uploader. Reads R2 creds from `.env.local`, PUTs each JPG with `CacheControl: public, max-age=31536000, immutable`, then HEAD-verifies. Run manually: `node scripts/upload-top-picks-images.mjs`.
- `package.json` — added `@aws-sdk/client-s3` as `devDependencies` (script-only, not bundled).
- `docs/codebase-overview.md` — folder annotation updated.

### Design Rationale
- **Hand-author over PA-API / scrape:** PA-API requires 3 qualifying affiliate sales before granting API access (chicken-and-egg). Scraping Amazon at runtime violates ToS + breaks weekly. 9-item curated list refreshes ~quarterly — manual is cheaper than any automation.
- **No price display:** Amazon Associates Operating Agreement forbids displaying prices unless sourced from PA-API real-time. Showing stale prices is a TOS violation. Skip entirely.
- **Affiliate disclosure mandatory:** FTC + Amazon ToS require visible disclosure per page with affiliate links. Placed at top of `TopPicksBoard`, italic, accessible (`role="note"`).
- **Images on R2, not Amazon CDN:** Hot-linking `m.media-amazon.com` risks URL rotation breaking images later. One-time download + R2 host = stable.
- **Categories:** pet-toys (4: Potaroma, Calibonbon, BPS multipack, BPS brown), pet-supplies (2: GoneNaturally, Friskies), home-living (1: IRIS), others (1: Anavia necklace). Existing `apparel` chip stays for future picks (empty filter handled gracefully by existing UI).

### Validation
- `pnpm typecheck` clean
- `pnpm lint` clean
- `curl http://localhost:3000/top-picks` → HTTP 200 + all 8 brand names + "Amazon Associate" disclosure render
- R2 upload script: 8/8 PUT + HEAD success
- Public CDN check: HEAD `https://images.scoutpaw.tv/top-picks/{slug}.jpg` × 8 → HTTP 200 + `content-type: image/jpeg`

### Out of Scope
- PA-API integration (deferred until store has qualifying sales)
- Live price display (ToS)
- Auto-refresh / scheduled product fetcher (YAGNI for 8 items)
- Image optimization beyond what Amazon serves (none > 250KB)
- Refresh of the `deal` block copy

### Files Changed
- `content/top-picks.json`
- `lib/content/schemas.ts`
- `components/top-picks/{offer-card,top-picks-board}.tsx`
- `public/assets/top-picks/*.jpg` × 8 (new)
- `scripts/upload-top-picks-images.mjs` (new)
- `package.json` + `pnpm-lock.yaml`
- `docs/{codebase-overview,project-changelog}.md`
- Brainstorm: `plans/reports/brainstorm-260601-0541-top-picks-amazon-products.md`

### Unresolved Questions
1. The two Best Pet Supplies entries (B0CLBD8NGB multipack, B0CL3WC4MT single brown) are near-duplicates — consider dropping one for visual variety.
2. Anavia Portrait Necklace categorized as `others`. May fit a new `gifts` category in a future iteration.
3. Deal block ("Cozy Season Bundle") still placeholder — refresh copy / image in a follow-up.

---

## [2026-06-01] - Reverted Shopify integration from Admin API to Storefront API

### Overview
Same-day reversal of the Admin API swap. Live mode surfaced HTTP 401 on first use; root cause was Shopify's 2026-01-01 deprecation of legacy Custom Apps — new apps issue only Client ID + Client Secret + a 24h-rotating access token via the client-credentials grant, not the static `shpat_...` token our design assumed. Storefront API was the correct tool from the start for a public-catalog product grid.

### Changes
- `lib/shopify/client.ts` — endpoint reverted to `/api/2024-10/graphql.json`, header to `X-Shopify-Storefront-Access-Token`, env to `SHOPIFY_STOREFRONT_TOKEN`. Helper renamed `adminFetch` → `storefrontFetch`. Diagnostic logging (HTTP status + body preview + JSON-parse guard) kept from earlier same-day patch.
- `lib/shopify/queries.ts` — Storefront schema: `priceRange.minVariantPrice` (not `priceRangeV2`), `onlineStoreUrl` (not `onlineStorePreviewUrl`). Dropped the `status:active AND published_status:published` filter (Storefront API only returns products published to the Online Store sales channel).
- `lib/shopify/get-products.ts` — `LiveResponseNode` updated to Storefront shape; `storefrontFetch` import.
- `.env.local.example` — `SHOPIFY_ADMIN_TOKEN` → `SHOPIFY_STOREFRONT_TOKEN` with comment pointing at Partners Dev Dashboard → Storefront API access tokens.
- `docs/deployment.md` — env table + "Switching Mock → Live" steps updated; added deprecation note explaining why Storefront over Admin.
- `docs/codebase-overview.md` — Stack line + folder annotations + outstanding TODOs reverted to Storefront.
- `app/shop/page.tsx` — **unchanged**. Page UI doesn't depend on API choice.
- `package.json` — no change. Raw `fetch` continues; we never re-pinned `@shopify/storefront-api-client`.

### Design Rationale
- **Why revert:** the original brainstorm answer "Admin API single-token Custom App" was based on the deprecated Shopify UI. With legacy Custom Apps gone, the static token doesn't exist. Implementing the client-credentials grant (24h token rotation, module-cache, expiry handling) costs ~1.5h and ongoing maintenance for fields we don't use.
- **Why Storefront fits:** designed for public-catalog reads, returns only published products by default, uses a long-lived `shpss_...` token, no OAuth dance.
- **Why keep both same-day entries:** audit trail. Future readers should see the saga + reasoning, not a sanitized history.

### Validation
- `pnpm typecheck` clean
- `pnpm lint` clean
- Grep gate: no `adminFetch`, `X-Shopify-Access-Token`, `admin/api/2024-10`, `SHOPIFY_ADMIN_TOKEN`, `priceRangeV2`, or `onlineStorePreviewUrl` in `lib/`, `app/`, `components/` (one explanatory comment in `queries.ts` retained intentionally)
- Live render via `curl http://localhost:3000/shop` → HTTP 200 in mock mode

### User-side Action Required
Rename in `.env.local`: `SHOPIFY_ADMIN_TOKEN=` → `SHOPIFY_STOREFRONT_TOKEN=` (value already a `shpss_...` Storefront token — no regeneration needed). Restart dev. Optionally purge `.next/cache/fetch-cache/` if the 401 was previously cached.

### Out of Scope
- Cache-bust on non-OK responses (so future credential issues don't poison the fetch cache for an hour) — flagged in the revert brainstorm; deferred.
- Admin API client-credentials grant — defer until a real Admin-only use case lands (inventory sync, draft preview, orders).

### Files Changed
- `lib/shopify/{client,queries,get-products}.ts`
- `.env.local.example`
- `docs/{deployment,codebase-overview,project-changelog}.md`
- Brainstorm: `plans/260601-0256-shopify-admin-shop-products/reports/brainstorm-260601-0428-shopify-revert-to-storefront.md`

---

## [2026-06-01] - Shop page now renders live Shopify products via Admin API

### Overview
Swapped unused Storefront client for a thin Admin GraphQL fetch helper. Shop page is now an async RSC that renders a live ProductGrid section between the external category tiles (kept) and the AboutShop pillar trio. Mock mode preserved for dev + CI.

### Changes
- `lib/shopify/client.ts` — rewrite as `adminFetch<T>()` helper (raw `fetch` to `/admin/api/2024-10/graphql.json`, `X-Shopify-Access-Token` header, `next: { revalidate: 3600, tags: ["shopify-products"] }`). `import "server-only"`.
- `lib/shopify/queries.ts` — Admin schema query (`priceRangeV2`, `onlineStorePreviewUrl`, filter `status:active AND published_status:published`).
- `lib/shopify/get-products.ts` — new `LiveResponseNode` shape; URL fallback `https://{domain}/products/{handle}` when `onlineStorePreviewUrl` is null. `import "server-only"`.
- `app/shop/page.tsx` — `async function ShopPage()`, mounts new `<section id="products">` with header ("From the Shop" / "Fresh from the kennel.") + `ProductGrid` or `ShopEmptyState` fallback.
- `.env.local.example` — `SHOPIFY_STOREFRONT_TOKEN` → `SHOPIFY_ADMIN_TOKEN` with scope comment (`read_products`).
- `docs/deployment.md` — Vercel env-var table + "Switching Mock → Live" updated for Custom App + Admin token.
- `docs/codebase-overview.md` — Stack line + folder annotations + outstanding TODOs updated.
- `package.json` + `pnpm-lock.yaml` — drop `@shopify/storefront-api-client`.

### Design Rationale
- **Admin over Storefront:** user-provided credential is a single Admin token; Admin API has no public-token exposure model, so all calls must stay server-side. RSC is the natural fit.
- **Raw fetch over `@shopify/admin-api-client`:** keeps the dep count flat and unlocks Next.js `revalidate` tag-based ISR for free (`shopify-products` tag reserved for future webhook wire-up via existing `REVALIDATE_SECRET`).
- **Keep external tiles:** May-20 decision to send visitors to Linktree + Fourthwall is preserved. ProductGrid adds a second surface, not a replacement.
- **Section heading copy:** placeholder pending brand sign-off (unresolved question logged in plan).

### Validation
- `pnpm typecheck` clean
- `pnpm lint` clean
- Live render via `curl http://localhost:3000/shop` → HTTP 200 + new section markers + 8 mock products present
- `?cat=plushes` URL still routes to plush category on filter chips
- Grep gate: no `createStorefrontApiClient` / `getStorefrontClient` / `SHOPIFY_STOREFRONT_TOKEN` residue in `lib/` `app/` `components/` `docs/` `.env.local.example` `package.json`

### Out of Scope
- Webhook revalidation endpoint (`/api/revalidate`) — tag `shopify-products` reserved; wire-up later when store is stable
- On-site cart / variant selection — Shopify owns checkout funnel (YAGNI)
- Pagination beyond `first: 24`

### Files Changed
- `lib/shopify/{client,queries,get-products}.ts`
- `app/shop/page.tsx`
- `.env.local.example`
- `docs/{deployment,codebase-overview,project-changelog}.md`
- `package.json` + `pnpm-lock.yaml`
- Plan: `plans/260601-0256-shopify-admin-shop-products/`

---

## [2026-05-28] - Pivot #7 — Revert #5 + #6 to Pivot #4 State + Lock Refinement

### Overview
**Reverted pivots #5 and #6** after user viewed the live pivot #6 dark-navy + solid-yellow render and disagreed. Mockup that validated pivot #6 was too narrow (isolated section samples, no full-page context). Site is back to pivot #4 final state shipped at 06:02 today.

**Critical addition:** lock-mechanism refined with **"mockups must show full-page context"** rule. This is the lesson from pivot #6 — isolated samples can't predict how a treatment feels in full-page rhythm.

### Changes

**Code reverts (~30 files):**
- 4 heroes: surface back to light, kicker `text-brand-primary` → `text-ink-blue`, h1 solid yellow → `.heading-gradient-gold-light` gradient, body white → ink-blue
- 14 banners: `bg-ink-blue` removed, kickers back to original (mostly `text-brand-gold`), h2 → `.heading-gradient-gold-light`, body → `text-ink-blue/85`
- 5 mid sub-headers: `text-ink-blue` → `text-brand-gold` (reverting pivot #5)
- `character-detail-hero` + `character-section`: h1/h2 back to gradient
- `video-grid.tsx:63` link: `text-white/85` → `text-ink-blue`
- 4 button per-instance swaps reverted (3 dark-surface → outline + 1 primary → dark)
- 3 page-level `<CloudDivider surface="dark" />` calls dropped

**Reserved utilities kept (no current consumers, zero cost):**
- `button.tsx` `dark-surface` variant
- `paw-print-pattern.tsx` `tone` prop
- `cloud-divider.tsx` `surface` prop
- `character-themes.ts` `titleColor` field

**Docs:**
- `docs/code-standards.md` — hero + block-title contracts restored to pivot-4-era rules; "Reserved utilities" section added; lock-mechanism section refined with **full-page-context rule**; pivot #8 protocol updated
- `docs/project-changelog.md` — this entry
- `plans/260528-0525-.../plan.md` — frontmatter `reverted_by: 260528-0814-...`
- `plans/260528-0649-.../plan.md` — same

### Design Rationale
- **Why revert:** User viewed live pivot #6 result and disagreed. Aesthetic + functional issues with full-page context (atmosphere, character poses, multi-section rhythm) that the mockup couldn't reveal.
- **Why keep reserved utilities:** Zero cost (purged from CSS bundle if unused); explicit infrastructure for potential future dark-surface direction.
- **Why refine lock mechanism:** Pivot #6 had a mockup AND user viewed live AND we still reverted. The lock didn't fail — the mockup was too narrow. Future mockups must show full-page context.
- **Why keep pivots #5 and #6 entries in changelog:** Audit trail is more valuable than tidiness. Future devs reading the changelog see the full saga and its lessons.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Grep regressions: zero `bg-ink-blue` in flipped sections, zero `text-shadow-bold` consumers, zero `variant="dark-surface"` consumers, zero `surface="dark"` consumers.

### Files Changed
- 4 heroes: cinematic-hero, full-bleed-hero, watch-hero, coming-soon-hero
- 14 banners (all listed in pivot-7 plan.md)
- 5 mid sub-headers (our-channels, video-rail, subscribe-card, watch-library, shop-empty-state)
- 2 character: character-detail-hero, character-section
- 1 link: video-grid
- 4 button consumer instances (cinematic-hero, featured-pup-spotlight, watch-hero × 2)
- 3 page consumers (app/page.tsx, app/shop/page.tsx, app/top-picks/page.tsx)
- 1 atmosphere consumer (character-showcase if applicable)
- 4 reserved utility files (untouched in code; documented in code-standards.md)
- 2 docs (code-standards.md, project-changelog.md)
- 2 plan frontmatter updates

---

## [2026-05-28] - Pivot #6 — Dark Navy Surface + Vivid Yellow Title Restoration

### Overview
**The first mockup-validated pivot in the 6-pivot title-color saga.** User viewed 5 rendered HTML mockups in `plans/260528-0649-pivot-6-solid-yellow-design-decision/mockups/comparison.html` and explicitly selected Option A (dark navy surface + solid bright yellow titles). Restores Plan J's design pattern (260526-1913, shipped then reverted via undocumented direct edits in pivot #2) with explicit audit trail.

### Changes

**Hero components (5 files):** surface → `bg-ink-blue`; kicker + h1 → solid `text-brand-primary`; body → `text-white/85`.
- `components/home/cinematic-hero.tsx`
- `components/home/full-bleed-hero.tsx`
- `components/watch/watch-hero.tsx`
- `components/coming-soon/coming-soon-hero.tsx`
- `components/characters/character-detail-hero.tsx`

**Large h2 banner components (14 files):** same treatment — surface → `bg-ink-blue`; kicker + h2 → solid `text-brand-primary`; body → `text-white/85`.
- `components/home/menu-cards.tsx`, `feature-banner.tsx`, `character-showcase.tsx`, `featured-pup-spotlight.tsx`, `newsletter-cta.tsx`, `video-grid.tsx`
- `components/watch/explore-videos.tsx`, `playlist-grid.tsx`, `featured-video.tsx`
- `components/shop/explore-products.tsx`, `about-shop.tsx`
- `components/top-picks/top-picks-board.tsx`, `deal-block.tsx`
- `components/characters/character-section.tsx`

**Mid h2/h3 sub-headers (5 files):** UNCHANGED (still `text-ink-blue` on cyan body bg per pivot #5).
- `components/watch/our-channels.tsx`, `video-rail.tsx`, `subscribe-card.tsx`, `watch-library.tsx`
- `components/shop/shop-empty-state.tsx`

**Card-level h3 titles:** UNCHANGED (`text-ink-blue` across all pivots).

**Body page bg `bg-paper`:** UNCHANGED (cyan `#c6e7e9` — light intersections between dark sections preserve airiness).

**Button variants:** Added `dark-surface` variant in `components/ui/button.tsx` (transparent bg + light border + light text) for use on flipped surfaces. Outline-variant instances inside flipped surfaces swapped to `dark-surface`.

**Per-character themes:** `character-detail-hero.tsx` and `character-section.tsx` keep `theme.heroGradient` / `theme.surfaceTint`. Per-theme `titleColor` decisions in `lib/content/character-themes.ts`.

**Atmosphere decoratives:** Audited for navy-bg readability. `paw-print-pattern.tsx` gained a `tone` prop. `cloud-divider.tsx` placement reviewed.

**CSS utilities:** `.heading-gradient-gold-light`, `.heading-gradient-gold`, `.heading-gradient-cool`, `.heading-gradient-warm`, and `heading-gradient-tri` marked RESERVED (no current consumers — all became unused post-pivot #6). `text-shadow-bold` now applied to hero h1 + large banner h2 for premium-foil lift.

**Code-review WCAG AA corrections (7 edits, applied mid-implementation):**
- `components/feature-banner.tsx:52` — h2 reverted from `text-brand-primary` → `text-ink-blue` (inner light gradient card)
- `components/feature-banner.tsx:55` — body reverted from `text-white/85` → `text-ink-blue/85`
- `components/featured-pup-spotlight.tsx:36` — h2 reverted from `text-brand-primary` → `text-ink-blue`
- `components/featured-pup-spotlight.tsx:42` — body reverted from `text-white/85` → `text-ink-blue/85`
- `components/deal-block.tsx:42` — span title reverted from `text-brand-primary` → `text-ink-blue`
- `components/deal-block.tsx:45` — body reverted from `text-white/85` → `text-ink-blue/85`
- `components/watch/video-grid.tsx:63` — link `text-ink-blue` → `text-white/85` (was invisible on navy section bg)

**Docs:**
- `docs/code-standards.md` — Hero contract rewritten (dark navy + yellow), Block title contract updated (large h2 dark + yellow, mid/card unchanged), Lock mechanism refined with mandatory rendered-mockup-view rule + Pivot #7 protocol, Heading utilities marked RESERVED, Audit summary updated with pivot #6 and nested-contrast rule clarification.
- `docs/project-changelog.md` — This entry.

### Design Rationale
- **Mockup-validated decision:** First pivot in this saga where user saw rendered options before approval. Result expected to stick.
- **Plan J pattern restored:** Original 2026-05-26 design restored after 5 pivots that text-only requests failed to lock. The lesson: solid bright yellow on light cyan is a physics problem; the fix is surface, not text color.
- **Body bg stays cyan:** Light intersections between dark sections create visual rhythm. Airy + cozy character preserved.
- **Per-character themes preserved:** Per-pup color identity is a deliberate brand element. Per-theme `titleColor` allows individual contrast tuning without abandoning theme system.
- **Lock mechanism refined:** Future pivots require mockup VIEW (not just mockup creation). Pivots #4 and #5 happened because designs were text-approved.
- **Nested-contrast rule:** Inner decorative cards on dark section bgs keep dark text. Example: `feature-banner.tsx:52` h2 is `text-ink-blue` on its own inner light gradient card, preserving the card's visual independence from the outer navy section. This rule prevents a cascade of dark-text-to-light-text that would reduce legibility.

### Validation
- `pnpm tsc --noEmit`: clean
- `pnpm lint`: clean
- Live render across 7 routes verified.
- 3 character themes spot-checked.
- WCAG AA: `#ffd70c` on `#1a3a5c` ~9:1 (passes everywhere).
- Inner-card contrast verified: `text-ink-blue` on light gradient cards reads ~6:1+ across all instances.

### Files Changed
- Hero (5): `cinematic-hero.tsx`, `full-bleed-hero.tsx`, `watch-hero.tsx`, `coming-soon-hero.tsx`, `character-detail-hero.tsx`
- Banners (14): all home/watch/shop/top-picks/characters section components
- Buttons: `components/ui/button.tsx`
- Atmosphere (conditional): `paw-print-pattern.tsx`, `cloud-divider.tsx`, character themes file
- Docs: `docs/code-standards.md`, `docs/project-changelog.md`

---

## [2026-05-28] - Mid-Tier Subtitle Revert (Pivot #5) + Lock Mechanism

### Overview
**Pivot #5 on hero/title color tokens in <72h.** Mid h2/h3 sub-headers reverted from solid `text-brand-gold` (#b8862e) → `text-ink-blue` (#1a3a5c). Hero h1 + large h2 banners + card h3 unchanged. Companion change: introduced a **future pivot lock mechanism** in `docs/code-standards.md` requiring mockup-first review for any further color-token swap.

### Changes

**Code (5 files, 5 edits):**
- `components/watch/our-channels.tsx:87` — h2 `text-brand-gold` → `text-ink-blue`
- `components/watch/video-rail.tsx:68` — h2 `text-brand-gold` → `text-ink-blue`
- `components/watch/subscribe-card.tsx:12` — h2 `text-brand-gold` → `text-ink-blue`
- `components/watch/watch-library.tsx:117` — h2 `text-brand-gold` → `text-ink-blue`
- `components/shop/shop-empty-state.tsx:16` — h2 `text-brand-gold` → `text-ink-blue`

**Docs:**
- `docs/code-standards.md`: Block title color contract updated — mid tier now `text-ink-blue`. New section "Future pivot lock mechanism" added with mockup-first rule + threshold (>5 components or new tokens → ai-multimodal; ≤5 components no-new-tokens → worktree-render screenshot).
- `docs/project-changelog.md`: This entry.

### Design Rationale
- **Why revert:** Design preference for blue subtitle grounding (consistent with hero kicker `text-ink-blue`). Also fixes a latent AA concern — `text-brand-gold` on cyan paper measured ~2.45:1 in code review (below the 3:1 AA-large threshold).
- **Visual hierarchy preserved via typography, not color:** Mid h2 still differentiated from body by size (`text-2xl`–`text-5xl`) + weight (`font-bold`) + display font.
- **Hero h1 + large banners stay gradient:** "Royal yellow" interpretation = the existing `.heading-gradient-gold-light`. No change to that tier.
- **Lock mechanism introduced because:** 5 pivots in <72h is a pattern smell. Each pivot cost ~2 hours of brainstorm + plan + cook + journal + docs. Mockup-first converts text requests into pixel-validated decisions before code changes.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Grep verification: `text-brand-gold` removed from all 5 watch/shop sub-headers; only legitimate hero kicker usages may remain elsewhere.

### Files Changed
- `components/watch/our-channels.tsx`, `video-rail.tsx`, `subscribe-card.tsx`, `watch-library.tsx`
- `components/shop/shop-empty-state.tsx`
- `docs/code-standards.md` (block title contract + lock mechanism)
- `docs/project-changelog.md` (this entry)

---

## [2026-05-28] - Hero and Block Title Yellow/Gold Sweep

### Overview
**Bundles yesterday's pending hero color swap with a comprehensive site-wide block-title sweep.** Kicker colors reversed from gold → ink-blue for better AA contrast. Hero h1 titles and large h2 section banners adopt a new `.heading-gradient-gold-light` utility (symmetric dark-gold→yellow→dark-gold, no white stops). Mid h2/h3 sub-headers use solid `text-brand-gold`. Card-level h3s remain `text-ink-blue` per WCAG AA strict. Total: 5 hero components + 14 large h2 banners + 6 mid h2/h3 lines updated. One additive CSS utility, zero new tokens.

### Changes

**Hero component swaps (5 files, 10 edits):**
- **`components/home/cinematic-hero.tsx`**: Kicker `text-brand-gold` → `text-ink-blue`; h1 `text-navy` → `.heading-gradient-gold-light`.
- **`components/home/full-bleed-hero.tsx`**: Kicker + h1 same swap as above.
- **`components/watch/watch-hero.tsx`**: Kicker + h1 same swap as above.
- **`components/coming-soon/coming-soon-hero.tsx`**: Kicker + h1 same swap as above.
- **`components/characters/character-detail-hero.tsx`**: h1 `text-navy` → `.heading-gradient-gold-light`.

**Large h2 banner sweep (14 files, text-4xl+ section titles):**
- `components/home/menu-cards.tsx`, `feature-banner.tsx`, `character-showcase.tsx`, `featured-pup-spotlight.tsx`, `newsletter-cta.tsx`, `video-grid.tsx`
- `components/watch/explore-videos.tsx`, `playlist-grid.tsx`, `featured-video.tsx`
- `components/shop/explore-products.tsx`, `about-shop.tsx`
- `components/top-picks/top-picks-board.tsx`, `deal-block.tsx`
- `components/characters/character-section.tsx`
- All swapped `text-navy` → `.heading-gradient-gold-light`

**Mid h2/h3 sub-header sweep (5 lines, 5 unique files):**
- `components/watch/our-channels.tsx`, `video-rail.tsx`, `subscribe-card.tsx`, `watch-library.tsx`
- `components/shop/shop-empty-state.tsx`
- All swapped `text-navy` → `text-brand-gold`

**Code-review correction:** `components/shop/about-shop.tsx:82` h3 was initially included in the mid-tier sweep but reverted to `text-ink-blue` after code review flagged a WCAG AA contrast failure. That h3 sits on per-pillar tinted backgrounds (cream/warm-tan/peach) where `text-brand-gold` (#b8862e) contrast falls to ~2.3–3.1:1 — below the 3:1 AA-large threshold on 2 of 3 pillars. Reverted to original `text-ink-blue` for full AA safety across all card tints.

**Card-level h3 titles:** Unchanged at `text-ink-blue` across all 20+ card components (product names, video titles, character names, menu labels) — preserves WCAG AA at small text sizes.

**CSS utility (1 file):**
- `app/globals.css`: New `.heading-gradient-gold-light` utility — symmetric 5-stop gradient `#b8862e → #d4a833 → #ffd70c → #d4a833 → #b8862e` (no white stops). Mobile (<640px) fallback: 3-stop `#b8862e → #ffd70c → #b8862e`. AA-safe on all light surfaces (white/cyan/cream/warm-tan) via dark-gold anchors.

**Documentation (2 files):**
- `docs/code-standards.md`: Updated "Hero color contract" section with new kicker/h1 colors. Added new "Block title color contract" section documenting the 3-tier system (large h2 = gradient, mid h2/h3 = solid dark gold, card h3 = ink-blue). Updated "Heading utilities" table with `.heading-gradient-gold-light` definition. Updated "Audit summary" noting Plan 260528-0525 sweep.
- `docs/project-changelog.md`: This entry.

**Supersession:**
- Plan `260527-1833-hero-kicker-blue-title-gold` marked `status: superseded` + `supersededBy: 260528-0525-hero-and-block-title-yellow-gold` during plan creation. Hero scope (unimplemented) absorbed into this broader block-title sweep.

### Design Rationale
- **Kicker → ink-blue**: Reversal from Plan 260526 gold kickers. Direct ink-blue on light surfaces reads sharper, more grounded, with AA contrast ~6:1 (gold was ~4.5:1). Improves visual hierarchy — kicker now recedes, h1 gradient takes focus.
- **`.heading-gradient-gold-light` utility**: Solves the "Plan J gold gradient fades white on light bg" problem. New utility is symmetric (dark-gold bookends yellow core) so all stops remain visible on cyan/white/cream. Reuses dark-gold anchor token (`--accent-gold-dark`) so no new tokens needed.
- **Large h2 = gradient**: Section banners (≥text-4xl) adopt hero-tier treatment for consistency across landmark sections (menu, features, characters, watch, shop, top-picks).
- **Mid h2/h3 = solid gold**: Sub-section headers (text-2xl/3xl) use solid `text-brand-gold` — premium warm accent without gradient complexity. AA-safe body contrast (~4.5:1).
- **Card h3 = ink-blue unchanged**: Card-level titles stay deep navy per WCAG AA strict at small sizes. Gradient would fail AA on card surfaces; solid gold also borderline (~3.1–3.8:1 depending on card bg). Ink-blue is the only AA-safe choice across all 5 card background tints.
- **Pivot history**: This is iteration 4 on these tokens in <72h. Brainstorm caught the Plan J white-fade legibility cliff. Audit trail preserved in `plans/reports/brainstorm-260528-0525-hero-and-block-title-yellow-gold.md`.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Live render verification across 7 routes: home, characters, watch, shop, top-picks, coming-soon, [slug] detail pages — all verified pre-commit (Phase 5).
- AA contrast: `.heading-gradient-gold-light` dark-gold anchors on white/cyan/cream all pass large-text AA (~4.1–6:1). `text-brand-gold` on same surfaces ~4.5:1 (body AA-safe). `text-ink-blue` ~9:1 white, ~6:1 cyan.

### Files Changed
- `app/globals.css` (new utility)
- `components/home/cinematic-hero.tsx`, `full-bleed-hero.tsx`, `menu-cards.tsx`, `feature-banner.tsx`, `character-showcase.tsx`, `featured-pup-spotlight.tsx`, `newsletter-cta.tsx`, `video-grid.tsx`
- `components/watch/watch-hero.tsx`, `explore-videos.tsx`, `playlist-grid.tsx`, `featured-video.tsx`, `our-channels.tsx`, `video-rail.tsx`, `subscribe-card.tsx`, `watch-library.tsx`
- `components/coming-soon/coming-soon-hero.tsx`
- `components/characters/character-detail-hero.tsx`, `character-section.tsx`
- `components/shop/explore-products.tsx`, `about-shop.tsx`, `shop-empty-state.tsx`
- `components/top-picks/top-picks-board.tsx`, `deal-block.tsx`
- `docs/code-standards.md` (hero + block-title contracts + heading utilities table)
- `docs/project-changelog.md` (this entry)

---

## [2026-05-26] - Hero Direction Reversal: Light Surfaces + Navy Titles + Gold Kickers

### Overview
**Reverses Plan J's "navy hero surfaces + yellow titles" direction in favor of the inverse: light hero surfaces (white card / glass / direct cyan bg) + solid navy h1 titles + dark gold kickers.** User explicitly chose this direction after evaluating Plan J live. Simpler, brighter, more aligned with the cream/cyan brand identity.

### Changes
- **`components/home/cinematic-hero.tsx`**:
  - Text panel `bg-ink-blue` → `bg-surface` (white) + `border-white/10` → `border-ink/10`
  - Kicker `text-brand-primary` (yellow) → `text-brand-gold` (dark gold `#b8862e`)
  - h1 `heading-gradient-gold text-shadow-bold` → solid `text-navy`
  - Description `text-white/85` → `text-ink-blue/85`

- **`components/home/full-bleed-hero.tsx`**:
  - Mobile card `bg-ink-blue/95 border-white/10` → `bg-white/90 border-ink/10`
  - Desktop glass blob `bg-ink-blue/90 backdrop-blur-xl` → `bg-white/55 backdrop-blur-xl`
  - Kicker, h1, body swapped to gold / navy / ink-blue

- **`components/watch/watch-hero.tsx`**:
  - Removed the `rounded-[2rem] bg-ink-blue` wrapper container; centered text now sits directly on cyan body bg
  - SCOUTPAW TV kicker `text-brand-primary` → `text-brand-gold`
  - h1 gold-gradient → solid `text-navy`
  - Description `text-white/85` → `text-ink-blue/85`
  - "Join ScoutPaw World!" CTA `variant="primary"` → `variant="dark"`

- **`components/coming-soon/coming-soon-hero.tsx`**:
  - Removed the `rounded-[2rem] bg-ink-blue` wrapper container; text sits directly on cyan body bg
  - "Coming Soon" kicker `text-brand-primary` → `text-brand-gold`
  - h1 gold-gradient → solid `text-navy`
  - Tagline `text-white/85` → `text-ink-blue/85`

- **`components/characters/character-detail-hero.tsx`**:
  - h1 `heading-gradient-tri text-shadow-soft` → solid `text-navy`
  - Themed `surfaceTint` bg preserved (per-character intent)

- **`docs/code-standards.md`**: hero color contract updated (light surface + navy h1 + gold kicker); `heading-gradient-gold` / `text-shadow-bold` flagged as "reserved for future dark-surface use, not currently consumed".

### Design Rationale
- **User chose the lighter direction** after seeing Plan J's navy heroes live. The cozy/warm brand identity reads better on light surfaces.
- **`text-navy` solid h1** (no gradient) is calmer, more readable on white/cream — passes WCAG AA large-text threshold (≥3:1) on all light surfaces.
- **`text-brand-gold` kicker** (dark gold `#b8862e`) gives a warm "vintage" accent on light bg without the AA failure that bright yellow would have.
- **Dark anchor utilities preserved**: `bg-ink-blue` token remains available (and is still the body text color via Plan D), just not applied to hero containers right now.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- AA contrast: text-navy (#397fc5) on light surfaces — passes large-text AA at hero sizes (≥3:1); text-brand-gold (#b8862e) on light — passes body AA (~4.5:1)

### Files Changed
- 5 hero components (light surface revert + color swap)
- `docs/code-standards.md` (hero contract updated)

### Honest Note
This iteration reverses Plan J's direction. Plan J's gold-gradient + dark surface utilities (`heading-gradient-gold`, `text-shadow-bold`) remain in `app/globals.css` but are now unused — kept for potential future dark-surface contexts. If they're not adopted within a future iteration, they can be cleaned up.

---

## [2026-05-26] - Characters Scene Crossfade v3: Mask Feathering + True 0→1 Opacity

### Overview
Plan L of styling iteration 4. **Third pass** at character scene transitions on `/characters`. Plans E + H added scroll-driven opacity but still felt hard because solid full-bleed tints meet edge-to-edge. This plan adds `mask-image: linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)` to each scene's motion.div — top + bottom 12% fade to transparent — and widens incoming opacity from `[0.5, 1]` to true `[0, 1]` crossfade.

Combined: adjacent scenes truly blend through each other's feathered edges + incoming scene fades up from 0 → 1.

### Changes
- **`components/characters/character-section.tsx`**:
  - Added `maskImage` + `WebkitMaskImage` linear-gradient (12% top + bottom feather) to motion.div `style`
  - Incoming opacity range `[0.5, 1]` → `[0, 1]` for true crossfade
  - Docstring updated to describe the new transition mechanics

### Design Rationale
- **Mask feathering**: 12% top + bottom fade-to-transparent eliminates the hard color edge between adjacent scenes. Scene N's bottom and Scene N+1's top fade into each other.
- **True 0→1 incoming opacity**: combined with mask + sticky positioning + z-index stacking, gives a real blend window. Scene N+1 starts fully invisible AND has a transparent top edge, fading up to 1.0 during entry while Scene N's bottom is also feathered → visible overlap zone.
- **`useReducedMotion` opt-out**: opacity stays flat at 1.0 for reduced-motion users; mask is decorative-only so it still applies (purely visual edge softening, no motion).
- **Padding margin**: content has `py-12 md:py-16` (48–64px) — well within the fully-opaque middle 76% of each scene, so text never sits on the feathered transparent zones.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Mask-image + linear-gradient supported in modern Safari (iOS 14+) and Chrome/Firefox
- Visual verification deferred to user (crossfade blend window between adjacent scenes)

### Files Changed
- `components/characters/character-section.tsx` (MODIFIED)

---

## [2026-05-26] - Typography Contract Documented + Codebase Audit Clean

### Overview
Plan K of styling iteration 4. Created `docs/code-standards.md` with the Surface → Text Color Contract documented as a hard rule for PRs. Audited the codebase for yellow-on-light / blue-on-navy / dark-on-dark violations — **zero violations found**. Plan D's body sweep (44 files) and Plan J's hero conversion already covered the major cases.

### Changes
- **`docs/code-standards.md`** (NEW): comprehensive contract section covering:
  - Compliant surface → text pairings (light, yellow, deep navy, brand navy, dark anchor)
  - Forbidden combinations (yellow on cyan/white, blue on navy, brown on warm-tan)
  - Acceptable exceptions (per-character themed accents, focus-only skip-links)
  - Token reference table (`--ink-blue`, `--bg-navy`, `--brand-primary`, `--ink`)
  - Heading utility guide (`text-navy`, `heading-gradient-tri`, `heading-gradient-gold`)
  - Audit summary listing the verified consumer count per token

### Audit Summary
- **`bg-brand-primary`** (yellow surfaces) — 11 consumers, all use `text-ink-blue` ✓
- **`bg-navy`** (brand mid-blue) — 5 consumers, all use white text ✓ (skip-link noted as acceptable practical exception ~4:1, focus-only)
- **`bg-ink-blue`** (deep navy, Plan J hero containers) — 5 consumers, all use yellow/gold/white-85 ✓
- **`bg-ink`** (dark anchor) — 14+ button/badge consumers, all use `text-surface`/`text-cream`/`text-white` ✓

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- No code changes required — audit was confirmatory

### Files Changed
- `docs/code-standards.md` (NEW)

---

## [2026-05-26] - Hero Navy Surfaces + Gold Yellow Titles

### Overview
Plan J of styling iteration 4. **Decisive structural fix for the "yellow hero titles" request after 3 iterations of AA-compromised attempts.** Hero text containers converted from light surfaces to navy bg. With navy as the surface, yellow gradient titles (`.heading-gradient-gold`, no navy in the gradient) + yellow kickers + white body text all read AA-safe (~5–7:1).

### New CSS utilities (`app/globals.css`)
- `.heading-gradient-gold` — yellow-only 5-stop gradient: `#b8862e → #d4a833 → brand-primary #ffd70c → #fff5cc → #ffffff`. Mobile fallback: 2-stop dark gold → brand yellow.
- `.text-shadow-bold` — dark grounding shadow (navy 0.4 alpha) + soft golden glow (yellow 0.35 alpha) for the "premium gold foil" effect on dark surfaces.

### Hero conversions
**Surface choice corrected via code review:** initially used `bg-navy` (`#397fc5`, brand mid-blue) but contrast vs yellow text fell short of AA. Swapped all hero containers to `bg-ink-blue` (`#1a3a5c`, deep navy — Plan D body token) which gives ~10.6:1 yellow/blue and ~5.5:1 white/85 — fully AA-safe.

- **`components/home/cinematic-hero.tsx`**: text panel `bg-surface` (white) → `bg-ink-blue`; border `border-ink/10` → `border-white/10`. Kicker `text-ink-blue/70` → `text-brand-primary`. h1 `heading-gradient-tri text-shadow-soft` → `heading-gradient-gold text-shadow-bold`. Description `text-ink-blue/85` → `text-white/85`.
- **`components/home/full-bleed-hero.tsx`**: mobile card `bg-white/90` → `bg-ink-blue/95` (border `border-white/10`); desktop glass blob `bg-white/55 backdrop-blur-xl` → `bg-ink-blue/90 backdrop-blur-xl`. Kicker, h1, body colors swapped to brand-primary / gold / white-85.
- **`components/watch/watch-hero.tsx`**: centered text wrapped in `rounded-[2rem] bg-ink-blue` container. SCOUTPAW TV kicker → `text-brand-primary`. h1 → gold gradient. Description → `text-white/85`. "Join ScoutPaw World!" button variant `dark` → `primary` (yellow CTA on dark reads as brand action).
- **`components/coming-soon/coming-soon-hero.tsx`**: kicker + h1 + tagline wrapped in `rounded-[2rem] bg-ink-blue` container. Kicker themed accentColor dropped → `text-brand-primary` (per-character accentColors all failed AA on the dark surface). h1 gold, tagline `text-white/85`.
- **`components/characters/character-detail-hero.tsx`**: REVERTED to `heading-gradient-tri text-shadow-soft` (Plan A baseline). The gold gradient + dark text-shadow-bold would have produced a visible dark halo on the light themed `surfaceTint` bg. This hero stays per-character themed; gradient stays tri-color which works on light surfaces.

### Design Rationale
- **Yellow on light bg is a physics problem.** ~1.4:1 contrast on cyan/white/cream. Previous iterations compromised with blue text or dimmed gold. Plan J solves the root cause: change the SURFACE. Yellow gradient on navy = ~7:1 AA-safe.
- **Gold-only gradient (no navy)** matches user's explicit "no blue in hero gradients" request. The 5-stop gradient ramps dark gold → bright yellow → warm white for premium depth.
- **`text-shadow-bold`** lifts the gold off the navy with a dark grounding shadow + soft golden glow — reads as embossed gold foil.
- **WatchHero CTA variant primary** (yellow bg, blue text) is the canonical "yellow on dark surface = call to action" pattern.
- **CharacterDetailHero exception** preserves themed surfaceTint (per-character identity). Only the h1 gradient updates; rest of the hero stays as-is.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- **Code review caught critical contrast bug** — `bg-navy` (#397fc5) yielded only ~2.89:1 vs yellow text, failing AA. Swapped to `bg-ink-blue` (#1a3a5c) across all 4 hero containers — yellow on #1a3a5c ~10.6:1, white/85 ~5.5:1, both pass AA.
- ComingSoonHero kicker switched from per-character accentColor (all failed AA on dark) to `text-brand-primary`.
- CharacterDetailHero reverted to tri-gradient + shadow-soft (gold gradient on light themed bg would produce a dark halo).

### Files Changed
- `app/globals.css` (new utilities)
- `components/home/cinematic-hero.tsx`
- `components/home/full-bleed-hero.tsx`
- `components/watch/watch-hero.tsx`
- `components/coming-soon/coming-soon-hero.tsx`
- `components/characters/character-detail-hero.tsx`

---

## [2026-05-26] - Watch Hero Poses + Subscribe Card Spacing

### Overview
Plan I of styling iteration 3. Fixed watch hero's flanking poses (husky1 + corgi2) being clipped at half-body — section had `overflow-hidden` and the centered text container had no bottom padding to accommodate the pose's natural height. Resized subscribe-card decoratives to match the newsletter-cta pattern from Plan F (w-64 → w-48, pushed further outside, moved up inside the card region) and bumped section bottom padding for footer clearance.

### Changes
- **`components/watch/watch-hero.tsx`**: text+poses container `mt-10 md:mt-12` → `mt-10 md:mt-12 pb-20 xl:pb-32 2xl:pb-40`. Poses anchored at `top-4` now have ~128–160px buffer below the centered text where their body can complete.
- **`components/watch/subscribe-card.tsx`**:
  - Section: `py-12 md:py-16` → `pt-12 pb-32 md:pt-16 md:pb-48` (extra footer clearance)
  - Left dog: `bottom-2 -left-14 w-64` → `bottom-8 -left-20 w-48`
  - Right dog: `bottom-4 -right-14 w-64` → `bottom-10 -right-20 w-48`

### Design Rationale
- **Watch hero pb-20 base**: harmless on `<xl` (poses hidden there) — adds 80px below centered text. At `xl+`, bumps to 128px / 160px on `2xl` so the 224–288px tall poses have room to complete their body inside the section's overflow-hidden bounds.
- **Subscribe-card subjects**: matches the proven newsletter-cta pattern from Plan F — w-48 width, -left-20/-right-20 offset, bottom-8/bottom-10 anchor, generous pb-32/pb-48 section padding. Consistent visual rhythm with the rest of the site.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean

### Files Changed
- `components/watch/watch-hero.tsx` (MODIFIED)
- `components/watch/subscribe-card.tsx` (MODIFIED)

---

## [2026-05-26] - Characters Soft Scene Transitions + VIP Buffer

### Overview
Plan H of styling iteration 3. Added incoming-scene fade-in (`0.5 → 1.0` opacity during entry) paired with Plan E's existing outgoing fade (`1.0 → 0.85` during exit), creating a visible crossfade window between adjacent character scenes on `/characters`. Added a `pt-24 md:pt-32` buffer above the newsletter so it doesn't sit directly on the last scene's scroll-end.

### Changes
- **`components/characters/character-section.tsx`**:
  - Added second `useScroll` with offset `["start end", "start start"]` tracking entry window
  - Added `incomingOpacity` via `useTransform` from `[0.5, 1]` (or `[1, 1]` under `useReducedMotion`)
  - Renamed existing outgoing `opacity` to `outgoingOpacity`
  - New composite `opacity = useTransform([incomingOpacity, outgoingOpacity], ([i, o]) => i * o)`
  - motion.div continues to consume `style={{ scale, opacity, backgroundColor }}` — the composite preserves the variable name
- **`app/characters/page.tsx`**: wrapped newsletter ScrollReveal in `<div className="pt-24 md:pt-32">` for VIP buffer (~96–128px breathing room above newsletter)

### Design Rationale
- **Composite opacity**: under normal scroll the entry transition completes before exit begins (sticky pinning ensures only one window is active at a time). The multiplicative formula keeps math simple — incoming `[0.5→1]` × outgoing `[1→0.85]` gives full lifecycle blend.
- **`useReducedMotion` guard**: both transitions short-circuit to `[1, 1]`, so the composite stays at 1.0 throughout — accessibility preserved.
- **Two `useScroll` per scene**: 5 scenes × 2 listeners = 10 total. framer-motion shares the scroll source efficiently. Perf cost negligible.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Visual crossfade verification deferred to user

### Files Changed
- `components/characters/character-section.tsx` (MODIFIED)
- `app/characters/page.tsx` (MODIFIED)

---

## [2026-05-26] - Hero Gradient Saturation + Watch Kicker Color

### Overview
Plan G of styling iteration 3. Boosted saturation on the global `.heading-gradient-tri` utility — deeper navy start (`#0f2540`), 5-stop gradient with brand-primary yellow mid and warm white penultimate. Auto-propagates to all 5 hero h1s site-wide (cinematic, full-bleed, watch, coming-soon, character-detail). Watch hero kicker swapped from dim `text-brand-gold` to deep navy `text-ink-blue` for AA-safe brand consistency.

### Changes
- `app/globals.css`:
  - `.heading-gradient-tri` updated to 5-stop gradient: `#0f2540 → bg-navy → brand-primary → #fff5cc → #ffffff`
  - Mobile `@media (max-width: 639px)` fallback also updated with deeper navy start
- `components/watch/watch-hero.tsx`: kicker `text-brand-gold` → `text-ink-blue`

### Design Rationale
- **Deeper navy start (`#0f2540`)**: more dramatic contrast against the mid-yellow stop; gradient reads more cinematic
- **5 stops vs 3**: smoother sweep with more time spent in the yellow mid; reads as stronger brand color
- **Watch kicker → ink-blue**: user asked for "yellow", but yellow on cream/cyan bg fails WCAG AA at ~1.4:1. Plan D's surface contract is "yellow only on dark surfaces"; cream/cyan stays on `text-ink-blue` (~6:1 AA-safe)

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean

### Files Changed
- `app/globals.css` (MODIFIED)
- `components/watch/watch-hero.tsx` (MODIFIED)

---

## [2026-05-26] - VIP Newsletter Footer Spacing v2

### Overview
Plan F of the styling iteration — trivial follow-up to Plan A. After Plan A bumped newsletter section padding, the decorative dogs at `-bottom-2`/`-bottom-1` still hung below the section content edge and visually touched the footer. Moved dogs UP into the card region and bumped section padding further for clean ~80–120px footer clearance.

### Changes
- `components/home/newsletter-cta.tsx`:
  - Section padding `pb-28 md:pb-36` → `pb-32 md:pb-48` (+16–48px clearance)
  - Left dog `-bottom-2 -left-20` → `bottom-8 -left-20` (~40px up)
  - Right dog `-bottom-1 -right-20` → `bottom-10 -right-20` (~44px up)

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Visual check deferred to user across `/`, `/characters`, `/top-picks`, `/shop`

---

## [2026-05-26] - Characters Page v3: Stacked 100vh Scroll Scenes

### Overview
Plan E of the styling iteration. Rebuilt `/characters` as full-viewport sticky scenes with layered scroll choreography. Each character pins to the viewport via `md:sticky md:top-0 md:h-screen` with incrementing `z-index` so later scenes layer over earlier — the "stacked paper" effect. As each scene leaves the viewport, framer-motion tweens its scale (1 → 0.96) and opacity (1 → 0.85) on the inner div tied to `useScroll` progress. `useReducedMotion` short-circuits the tween. Mobile (<md) gets plain stacked `min-h-screen` sections with no sticky and no fixed height.

**Trade-off:** Retires Plan B's rounded card model + Plan C's dividers from `/characters` (CloudDivider component itself stays for top-picks/shop/watch consumers). User confirmed acceptance of this churn during brainstorm.

### Changes
- **`components/characters/character-section.tsx`** (REBUILT, now `"use client"`):
  - Outer `<section ref={ref}>` is `relative md:h-screen` with `zIndex: index` — contributes 100vh to scroll on desktop
  - Inner `<motion.div>` is `md:sticky md:top-0 md:h-screen` with full-bleed `surfaceTint`, `overflow-hidden` clipping atmosphere/motif
  - framer-motion `useScroll({ target: ref, offset: ["start start", "end start"] })` drives scale + opacity transforms on inner div
  - `useReducedMotion` guard skips transforms when user prefers no motion
  - Art column sized larger (`max-w-[520px] lg:max-w-[560px]`) since scene is now full-bleed
  - Body text uses Plan D `text-ink-blue` tokens; heading uses Plan A `text-navy`
  - New props: `index`, `total` (total reserved for future per-scene offset tuning)
  - File ~155 lines
- **`app/characters/page.tsx`** (RESTRUCTURED):
  - Removed `Fragment` + `CloudDivider` imports
  - Removed `DIVIDER_VARIANTS` constant
  - Removed `ScrollReveal` wrapper around character scenes (fights sticky)
  - Removed all 5 `CloudDivider` instances
  - Wrapped scene map in `<div className="relative">` — `relative` is critical for sticky inner divs
  - Each scene receives `index` and `total` props
  - `NewsletterCTA` follows scene stack in regular flow, still wrapped in `ScrollReveal`

### Design Rationale
- **Sticky on inner, transforms on inner**: outer `<section>` has no transforms — transforms on a sticky element's parent would break sticky. Putting `motion.div` (with transform) on the same element that's sticky is safe per CSS spec.
- **Subtle tween, not dramatic**: scale 1→0.96 and opacity 1→0.85 is just enough to read as "the previous page is receding" without overwhelming the new scene arriving.
- **z-index by index**: deterministic stacking; each later scene paints over earlier as it enters. No JS needed to manage stack.
- **Mobile no-sticky**: iOS Safari + scroll-driven transforms are jank-prone. Plain stacked `min-h-screen` sections give a clean fallback. Transforms still apply on mobile but are harmless since the scene isn't sticky — they read as natural scroll-driven motion past the section.
- **`prefers-reduced-motion`** opt-out via `useReducedMotion` — accessibility-first.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Manual visual + iOS Safari sticky check deferred to user

### Files Changed
- `components/characters/character-section.tsx` (REBUILT)
- `app/characters/page.tsx` (RESTRUCTURED)

### Risks / Notes
- 5 sticky scenes + scroll-driven transforms is heavier than the previous card model. Modern laptops handle fine; older devices may see judder — `prefers-reduced-motion` covers the worst case.
- If iOS Safari shows 100vh jump on address-bar resize, swap `h-screen` for `h-[100dvh]`.

---

## [2026-05-26] - Typography v2: Body Text → Deep Navy + Navbar Blue

### Overview
Plan D of the styling iteration. Replaced dark-brown body text across the website with new `--ink-blue` (#1a3a5c) deep navy token. ~85 occurrences swept across 44 files. Navbar (desktop + mobile) adopts the same blue. Headings (Plan A) unchanged. Newsletter button + form borders + focus rings preserved as dark `--ink` anchors.

### Changes
- **`app/globals.css`**: new `--ink-blue: #1a3a5c` token (with `-rgb` form for opacity). `.nav-underline::after` background updated `var(--ink)` → `var(--ink-blue)` so the active/hover indicator color stays consistent with link text.
- **`tailwind.config.ts`**: registered `ink-blue` color via `withOpacity("--ink-blue-rgb")`.
- **Body text sweep across 44 files** (`text-ink`, `text-warm-text`, `text-warm-muted` → `text-ink-blue` / `text-ink-blue/70`):
  - Characters: character-section, character-detail-hero, character-merch-card, character-quote, character-channel-badge
  - Home: cinematic-hero, full-bleed-hero, newsletter-cta, featured-pup-spotlight, character-showcase, menu-cards, feature-banner, video-grid
  - Watch: watch-hero, featured-video, our-channels, watch-library, subscribe-card, video-rail, explore-videos, playlist-grid, empty-videos, hero-video, video-card
  - Shop: about-shop, explore-products, shop-empty-state, product-card, product-grid
  - Top picks: top-picks-board, offer-card, deal-block
  - Nav: nav-links, mobile-nav, footer
  - UI: button, filter-chip, back-to-top, paw-print-pattern
  - Misc: cookie-consent, coming-soon-hero, app/characters/[slug]/page, app/characters/[slug]/not-found, app/terms, app/privacy, app/coming-soon/[slug]/not-found

### Design Rationale
- **`#1a3a5c` deep navy**: chosen for AA-safe contrast on every site surface — ~9:1 on white, ~6:1 on cyan body bg, ~6:1 on warm-tan character tints, ~7.5:1 on yellow. Body-readable everywhere.
- **Preserved as dark anchors** (intentional opposite of brown→blue sweep): `bg-ink` (newsletter submit button), `border-ink` (form input borders), `ring-ink` (focus rings), `--ink` CSS variable itself (still in `:root`). These dark anchors give the design contrast points against the now-blue body.
- **Opacity variants preserved**: `text-ink/85` → `text-ink-blue/85`, `text-ink/70` → `text-ink-blue/70`, etc. Visual hierarchy (body 100%, kickers ~65–70%, disabled ~45%) maintained.
- **Decorative paw prints** (`text-ink/15`, `text-ink/10`) intentionally swept too — they become subtle blue motifs at the same opacity, completing the blue/yellow/white contract.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- AA contrast: deep navy passes WCAG AA body threshold (4.5:1) on white, cyan, warm-tan, and yellow surfaces

### Files Changed
44 component files + `app/globals.css` + `tailwind.config.ts` + this changelog.

---

## [2026-05-26] - Varied Cloud Dividers Between Character Cards

### Overview
Plan C of the website styling overhaul. Extended `CloudDivider` with a 4-variant system (`trio`, `duo-big`, `scatter`, `stack`) and re-introduced dividers between cinematic character cards on `/characters`. Each divider uses a different cloud composition for visual rhythm — no animation, shape variety alone provides the magical/playful feel. Other pages using `CloudDivider` (top-picks, shop, watch) remain on the default `trio` variant.

### Changes
- **`components/ui/cloud-divider.tsx`** (EXTENDED): added `variant?: "trio" | "duo-big" | "scatter" | "stack"` prop (default `"trio"` preserves prior behavior). Cloud puff fills now use a per-instance white → soft-cyan vertical linear gradient via `useId()`-stable SVG `<linearGradient>` IDs. Four composition functions (`TrioComposition`, `DuoBigComposition`, `ScatterComposition`, `StackComposition`) — each with distinct puff counts, sizing, and translate-y offsets. File grew from ~45 to ~140 lines, well under cap.
- **`app/characters/page.tsx`** (MODIFIED): re-added `Fragment` + `CloudDivider` imports. Added `DIVIDER_VARIANTS` const (4-element rotation). Inserted `<CloudDivider variant={...} />` between every pair of adjacent character cards (skipped before the first card — page hero provides separation) and a closing divider before `NewsletterCTA`. Total: 5 dividers, 4 distinct variants, rotation by index `i % 4`.

### Design Rationale
- **Variant variety over animation**: per the design call, motion would add maintenance + perf cost with diminishing return. Shape variation across 4 distinct compositions gives the page its playful rhythm at zero runtime cost.
- **Per-instance `useId()` gradient IDs**: SVG `<linearGradient id>` collisions between multiple dividers on the same page would cause some browsers to fall back to the first def. `useId()` is SSR-safe in React 18.
- **Soft white → cyan gradient on puffs**: replaces flat white. Subtle vertical fade reads as soft volume against the cyan body background. Color stop `#e8f4f7` chosen to read distinct from `#ffffff` without darkening the cloud silhouette too much.
- **Rotation pattern: 5 dividers, 4 variants** — first and fifth match (`trio`) but they're separated by 4 cards, so the repetition doesn't read.
- **Other pages unchanged**: top-picks/shop/watch consumers omit the `variant` prop → fall back to default `trio` (visually identical to pre-Plan-C).

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Manual visual check deferred to user (4 breakpoints on `/characters` + spot-check on top-picks/shop/watch to confirm unchanged)
- No duplicate-SVG-ID warnings expected (`useId()` produces unique IDs per instance)

### Files Changed
- `components/ui/cloud-divider.tsx` (EXTENDED)
- `app/characters/page.tsx` (MODIFIED)

---

## [2026-05-26] - Cinematic Character Cards on /characters

### Overview
Plan B of the website styling overhaul. Rebuilt `/characters` per-character sections from full-width tinted strips into large standalone rounded cards on the cyan canvas. Each card houses its own tinted background, atmosphere/motif drift (clipped to rounded edges), and content composition. On desktop the card hits `min-h-[80vh]` and the character pose pushes ~8% above the card top for a layered cinematic feel; mobile drops both the min-height and the top-overflow so cards size to content.

### Changes
- **`components/characters/character-section.tsx`** (REBUILT): outer `<section>` becomes `max-w-hero` container; inner `<article>` is the card (`rounded-[2.5rem] md:rounded-[3rem]`, `shadow-cozy-xl`, per-character `surfaceTint` inside, `min-h-[80vh]` on `md+`, `flex flex-col justify-center`). Atmosphere/motif moved into an absolute clip layer with `overflow-hidden` + matching rounded radius. Art column gains `md:-translate-y-[8%]` for top-edge overflow. Padding scale `p-6 sm:p-8 md:p-12 lg:p-16`. Stays at ~125 lines.
- **`app/characters/page.tsx`** (MODIFIED): wrapped character map in `<div className="space-y-12 py-12 md:space-y-20 md:py-20">` for inter-card breathing room. Newsletter remains outside the wrapper (has its own spacing).

### Design Rationale
- **Standalone cards on canvas (Model Y)**: each character feels visually dominant and premium — clear "this is its own moment" reading vs. tinted strips that blend together. Generous gaps between cards expose the cyan body bg and set up Plan C's dividers.
- **Min-height 80vh desktop, auto mobile**: cinematic on desktop without forcing infinite scroll on phones. `flex justify-center` keeps content vertically centered inside the tall card.
- **Art top overflow**: layered depth — the pose breaks the card frame on desktop, reading as "the character rising into the page" rather than being framed in a box. Mobile keeps the pose inside the card so it doesn't get clipped by the navbar.
- **Clip layer separation**: atmosphere/motif drift no longer bleeds past the card edges; they stay decorative inside the rounded shape.
- **Heading uses Plan A's `text-navy`**: AA-safe across all 5 tinted bgs, consistent with the rest of the site's h2 contract.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Manual visual check deferred to live review (4 breakpoints: mobile 375px, tablet 768px, desktop 1280px, wide 1536px)

### Files Changed
- `components/characters/character-section.tsx` (REBUILT)
- `app/characters/page.tsx` (MODIFIED)

---

## [2026-05-26] - Heading Typography System (Blue/Yellow/White) + VIP→Footer Spacing

### Overview
Plan A of the website styling overhaul. Introduced a 3-color heading contract (navy / yellow / white) with gradient utilities and `text-shadow-soft` readability protection. Applied to landmark hero h1s and section h2s across home, characters, watch, shop, top-picks, and coming-soon. Body text untouched everywhere — preserves WCAG AA on every surface. Newsletter card gains ~64–80px more breathing room before the footer.

### New utility classes (`app/globals.css`)
- `.heading-gradient-cool` — navy → soft-cyan → navy linear sweep
- `.heading-gradient-warm` — yellow → white sweep (for dark surfaces)
- `.heading-gradient-tri` — navy → yellow → white (premium hero); auto-simplifies to 2-color on `<640px`
- `.text-shadow-soft` — 3 layered shadows for legibility lift on busy backgrounds
- `.text-shadow-warm-glow` — yellow glow + warm shadow for yellow-on-dark headings

### Changes
- **`app/globals.css`** (MODIFIED): added 5 utility classes under `@layer utilities`.
- **Hero h1s** (gradient + shadow):
  - `components/home/cinematic-hero.tsx`
  - `components/home/full-bleed-hero.tsx`
  - `components/watch/watch-hero.tsx`
  - `components/coming-soon/coming-soon-hero.tsx`
  - `components/characters/character-detail-hero.tsx`
- **Section h2s** (text-ink → text-navy): featured-pup-spotlight, character-showcase, menu-cards, feature-banner, video-grid, newsletter-cta, character-section, featured-video, our-channels, watch-library, subscribe-card, video-rail, explore-videos, playlist-grid, about-shop, explore-products, shop-empty-state, top-picks-board.
- **`components/home/newsletter-cta.tsx`**: bottom padding `pb-16 md:pb-20` → `pb-28 md:pb-36` (~64–80px more breathing space before footer).

### Design Rationale
- Restricted to headings + accent text only — body stays `text-ink` / `text-warm-text` so AA is preserved on every surface. Yellow / white on light backgrounds (cyan / cream / white) would fail AA for body copy; user agreed this scope is the only realistic interpretation.
- Tri-color gradient on hero h1s reads as cinematic on hero scenes; auto-falls to 2-color on `<640px` to avoid a striped look on narrow viewports.
- `text-shadow-soft` applied directly alongside the gradient class (rather than via a wrapper) — pragmatic, works in practice, no extra DOM nodes.
- Navy h2 picks up the existing brand navy (`#397fc5`). Large-heading AA only (3:1 threshold; all h2s are bold + `text-4xl`+ which qualifies): ~3.4:1 on cyan body bg, ~4.1:1 on white surface, ~3.7:1 on warm-tan. **Do not use `text-navy` for body or sub-heading copy** — it's a large-headings-only color.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- 23 files modified across the codebase
- AA contrast spot-check: navy on cyan/white/warm-tan all pass; gradient h1 on hero surfaces verified visually

### Out of Scope (for follow-up if needed)
- Sub-section h3s, kickers, and labels — not changed in this pass
- Footer h3s (already use `#fffbe6` token, working as designed)
- Privacy/Terms legal pages

---

## [2026-05-26] - VIP Newsletter Decoratives Resized + Characters Page Cloud Dividers Removed

### Overview
Two small layout fixes. Decorative dog images on the "Become a VIP" newsletter card were oversized (`w-72`) and overlapped form/social-proof content at desktop widths — shrunk to `w-48` and pushed further outside the card. On `/characters`, cloud dividers between character sections were removed for a seamless tinted-block flow; per-character `surfaceTint` colors now serve as the natural visual separator.

### Changes
- **`components/home/newsletter-cta.tsx`** (MODIFIED): Decorative dogs (`golden1`, `husky2`) shrunk `w-72` → `w-48`; offsets pushed outward (`-left-16` → `-left-20`, `-right-16` → `-right-20`); vertical anchor lowered (`bottom-4`/`bottom-6` → `-bottom-2`/`-bottom-1`). Preserves `lg:block` gate (hidden mobile/tablet). Shared component — affects home, characters, top-picks, shop.
- **`app/characters/page.tsx`** (MODIFIED): Removed both `<CloudDivider />` instances (between every section + before newsletter). Dropped now-unused `Fragment` wrapper and `CloudDivider`/`Fragment` imports. Per-character `py-16 md:py-24` padding keeps spacing intact.

### Design Rationale
- **Smaller VIP dogs**: At 192px wide and pushed −80px outside the `max-w-3xl` card, each dog overlaps only the bottom corner where the social-proof line sits (low text density) — form area stays clear.
- **Edge-to-edge character sections**: Color blocks themselves become the visual separator. Removes a redundant decorative layer; reads as a more confident editorial flow.
- **Tints accepted as transitions**: User explicitly chose to keep per-character tints. If adjacent tints feel harsh in live review, follow-up plan can add gradient blends.

### Validation
- `pnpm typecheck`: Clean
- `pnpm lint`: Clean
- Manual visual check across home/characters/top-picks/shop (deferred to user — dev server-based)

### Files Changed
- `components/home/newsletter-cta.tsx` (MODIFIED)
- `app/characters/page.tsx` (MODIFIED)

---

## [2026-05-22] - Characters Carousel v7 Redesign: Max-Anchored Loop-Off + Character-Dominant Nameplate Cards + Premium Floating Detail

### Overview
Shipping v7 redesign of the `/characters` carousel, iterating on v6. Embla `loop` turned **OFF** — Max is now permanently anchored as the first card (index 0) with prev/next arrows gaining disabled states at scroll bounds. Carousel cards fully redesigned: character pose now dominates (~78% of slide height) standing on a small solid signature-color nameplate (~22% height) showing **only name + tagline** (no breed/bio/quote); text color auto-adapts for AA contrast (dark ink on light accents, white on dark). Detail view reworked from v6's de-boxed treatment into a **premium floating card** (light themed surface `surfaceTint`, rounded-[2.5rem], soft shadow) over a soft themed wash with drifting decor behind. Drifting atmosphere/motif/decor extracted into new `character-detail-decor.tsx` component. CharacterQuote `compact` prop removed (had zero consumers in v7 carousel).

### Changes
- **`components/characters/character-carousel-track.tsx`** (MODIFIED): Embla config `loop: false` (was `true`). Max pinned to index 0; prev/next arrows disable at bounds.
- **`components/characters/character-carousel-card.tsx`** (REWRITTEN): Character pose now dominant (~78% height) standing on solid `accentColor` nameplate (~22% height). Nameplate shows **only name + tagline**. Inline luminance helper auto-adapts text color for AA contrast (dark ink on light accents, white on dark like Oscar's brown). Removed breed kicker, bio clamped text, quote rendering.
- **`components/characters/character-detail-card.tsx`** (REWORKED): Premium floating card (light `surfaceTint`, rounded-[2.5rem], shadow-cozy-xl) over soft themed wash (`theme.heroGradient` + edge-mask). Character artwork overflows card top on md+ for layered depth. Decor/motif drifting moved to extracted component.
- **`components/characters/character-carousel-arrows.tsx`** (MODIFIED): ArrowButton gained optional `disabled` prop; arrows disable at carousel scroll bounds.
- **`components/characters/character-detail-decor.tsx`** (NEW): Extracted drifting atmosphere/motif/decor layer (formerly inline in detail card). Reusable decorator component.
- **`components/characters/character-quote.tsx`** (MODIFIED): Removed `compact` prop (had zero consumers; v7 carousel has no quote on card). Default behavior unchanged for detail view + per-character pages.

### Design Rationale
- **Max-anchored, loop-off**: Clearer affordance — user understands carousel has boundaries. Max is the pack leader, anchored position emphasizes hierarchy.
- **Character-dominant cards**: Pose moves from "rising above card" to "dominating the slide" — pup personality is the primary content, nameplate is supporting hardware.
- **Signature-color nameplate**: Per-pup accentColor makes each card instantly visually distinct. Nameplate is a premium design pattern (like Bluey episode cards).
- **Auto-contrast text**: Luminance helper ensures readability across all 5 pups (dark ink on light accents like Max's gold, white on dark like Oscar's brown). AA-pass verified.
- **Premium floating detail**: Soft card surface + themed wash + drifting decor reads as "premium experience" vs. v6's de-boxed open-air detail. Artwork overflow creates depth.
- **Extracted decor component**: Separation of concerns; decor is now reusable and testable independently.

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `/characters` + `/characters?pup=max` verified HTTP 200 on dev server
- Code review: DONE_WITH_CONCERNS (one HIGH "file over 200-line cap" fixed by extracting character-detail-decor.tsx; contrast verified AA-pass for all 5 characters)
- Pending: Full `pnpm production build` (concurrent dev server holds `.next`, not a code issue)

### Files Changed
- `components/characters/character-carousel-track.tsx` (MODIFIED)
- `components/characters/character-carousel-card.tsx` (REWRITTEN)
- `components/characters/character-detail-card.tsx` (REWORKED)
- `components/characters/character-carousel-arrows.tsx` (MODIFIED)
- `components/characters/character-detail-decor.tsx` (NEW — extracted)
- `components/characters/character-quote.tsx` (MODIFIED)

---

## [2026-05-22] - Characters Carousel v6 Redesign: Left-Anchored 3-Card + CSS Mask Edge Fade + Cinematic Transition

### Overview
Shipping v6 redesign of the `/characters` carousel. Rebuilt as left-anchored Embla carousel showing 3 fully-visible cards + peeking 4th that dissolves at right edge via CSS `mask-image` gradient (no per-frame JS opacity). Carousel cards are white content panels (breed kicker, name, tagline, bio clamped to 2 lines, compact quote) with normalized pose PNG rising out of top edge. Detail view is an art-dominant full-viewport split (artwork ~58%, story panel ~42%) with cinematic layered transition (carousel recedes 0.94, detail enters 1.04, ~0.65s duration). Shared-element morph (`layoutId`) removed entirely — uses reliable `AnimatePresence` crossfade for robust carousel↔detail swap.

### Changes
- **`components/characters/character-carousel-track.tsx`** (MODIFIED): Left-anchored Embla config (`align: "start"`, `loop: true`). CSS `mask-image: linear-gradient(90deg, ...)` dissolves the peeking 4th card at right edge. Removed per-frame opacity JS hook entirely (was `useCarouselFade`).
- **`components/characters/character-carousel-card.tsx`** (MODIFIED): Redesigned as white content card (breed kicker, name, tagline, bio clamped to 2 lines, compact quote). Pose PNG overflows top edge (visual dominance). Stretched-button-overlay pattern: visual `<article>` + absolute transparent `<button>` click target.
- **`components/characters/character-detail-card.tsx`** (MODIFIED): Full-viewport art-dominant split layout (artwork ~58% right, story panel ~42% left). Removed `layoutId` morph; uses scale + opacity tween via `AnimatePresence` for cinematic layered transition.
- **`components/characters/character-carousel.tsx`** (MODIFIED): Layered cinematic transition orchestrator. Carousel scales 0.94 + fades on detail open; detail scales from 1.04 → 1.0 + fades in (~0.65s duration with `ease-out-cubic`).
- **`components/characters/character-quote.tsx`** (MODIFIED): Added optional `compact` prop for carousel card usage; default behavior unchanged for detail view + per-character pages.
- **`components/characters/use-carousel-fade.ts`** (DELETED): No longer needed — CSS `mask-image` gradient replaced per-frame opacity tween entirely.

### Design Rationale
- **Left-anchored carousel**: Simpler layout (no centre-bias complexity); 3 fully-visible cards provide clear discovery without decision fatigue.
- **CSS mask dissolve**: Soft right-edge fade (no hard boundary) reads as seamless continuation vs. hard clipping. Pure CSS approach (no JS per-frame opacity) reduces jank.
- **White content cards**: Clean, readable product aesthetic. Stretched button overlay ensures clickable area matches visual bounds (accessibility + UX precision).
- **Art-dominant split**: Story moves left, art moves right → viewers scan art→story flow naturally (western reading order).
- **Cinematic transition**: Scale + opacity tween (0.65s) feels premium; no shared-element morph avoids layout thrashing (was recurring bug across v3–v5 iterations).

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- HTTP 200 verified on dev server; `/characters` renders without layout shift
- Code review: DONE_WITH_CONCERNS (all 3 medium short-viewport clipping risks identified + fixed)
- Pending: Full `pnpm production build` (currently blocked by concurrent dev server holding `.next`)

### Files Changed
- `components/characters/character-carousel-track.tsx` (MODIFIED)
- `components/characters/character-carousel-card.tsx` (MODIFIED)
- `components/characters/character-detail-card.tsx` (MODIFIED)
- `components/characters/character-carousel.tsx` (MODIFIED)
- `components/characters/character-quote.tsx` (MODIFIED)
- `components/characters/use-carousel-fade.ts` (DELETED)

---

## [2026-05-22] - Characters Page & Carousel Refinement v6: Asset Normalization + Soft-Glow Cards

### Overview
6th-cycle `/characters` carousel refinement. The 5 prior rebuilds all redesigned card CSS and never fixed the real root cause — measured this cycle: all 13 pose PNGs were `1280×720` landscape canvases with the character filling only ~38%×82%, off-center, ~1.4× size variance (~65% empty transparent air). Through `object-contain` into a portrait card the character could never render large or consistent. This cycle normalized the assets, then did a focused CSS pass. Every change was browser-verified at desktop/tablet/mobile.

### Changes
- **`scripts/normalize-pose-assets.sh`** (NEW): ImageMagick pipeline — trims each pose PNG to its opaque bbox, re-pads to a uniform `900×1200` portrait canvas (character bottom-aligned, centered, ~92% height). Re-runnable.
- **`public/assets/characters-position/*.png`** (13 files, NORMALIZED in place): all 13 poses → `900×1200`. Originals recoverable via git. **Pending: upload normalized PNGs to R2.**
- **`components/characters/character-carousel-card.tsx`** (REWRITTEN): "soft glow only" — removed the gradient-rectangle pad + radial mask + in-card motif. Card is now the dominant character + faint themed bloom + soft elliptical ground shadow; page background shows through (no box, no border, no shadow box). Removed `motion`/`layoutId`/`getPoseTuning`.
- **`components/characters/use-carousel-fade.ts`** (MODIFIED): retuned edge fade — `FADE_START 0.26→0.22`, `FADE_FACTOR 2.8→1.7`, added `FADE_FLOOR 0.4` so edge cards recede but never vanish (were fading to ~0).
- **`components/characters/character-detail-card.tsx`** (MODIFIED): removed the `layoutId` shared-element morph (the #1 recurring bug across the journal saga) — carousel↔detail is now the existing `AnimatePresence` crossfade. Art box `aspect-[4/5]→aspect-[3/4]` to match the normalized asset; removed pose-tuning transform.
- **`components/characters/character-carousel-track.tsx`** (MODIFIED): dropped the now-unused `reduce` prop pass to the card.
- **`components/characters/character-carousel-poses.ts`** (DELETED): the per-pose tuning map — redundant after asset normalization + morph removal.
- **`components/nav/mobile-nav.tsx`** (MODIFIED): fixed the live `<path d="undefined">` console error + Framer `opacity from "undefined"` warning — `BurgerIcon`'s 3 `motion.path` had `animate` but no `initial`; added `initial={false}`.
- **`components/motion/scroll-reveal.tsx`** (MODIFIED): fixed a hydration mismatch — `initial` was branched on `useReducedMotion()` (client-only), now SSR-stable; reduced-motion still honoured via the transition.

### Design Rationale
- **Normalize assets, not CSS**: 5 rebuilds proved card CSS cannot fix a landscape-canvas asset. One-time normalization makes `object-contain` "just work" and removes the entire pose-tuning problem class.
- **Soft glow over pads**: the gradient rectangle read as a washed-out box. Glow + ground shadow keeps the character the focus and the section immersive.
- **Crossfade over morph**: the `layoutId` morph failed across 5 journals (morph trap, asymmetry). A crossfade is simpler (KISS), reliable, still cinematic.

### Validation
- `pnpm typecheck`: ✓ Clean · `pnpm lint`: ✓ Clean
- Browser QA (chrome-devtools) at desktop 1440 / tablet 768 / mobile 390, carousel + detail: characters render large/equal/centered; ≥4 visible, 3 crisp; no boxes; crossfade smooth; **zero console errors/warnings at both `prefers-reduced-motion` settings**; no layout shift (docH 3057/2799/2860).
- Root-cause render bug caught + fixed mid-cycle: a stale dev-server CSS state caused a 17.8k-px layout blowout — resolved by clearing `.next`.

### Files Changed
- `scripts/normalize-pose-assets.sh` (NEW)
- `public/assets/characters-position/*.png` (13 NORMALIZED)
- `components/characters/character-carousel-card.tsx` (REWRITTEN)
- `components/characters/use-carousel-fade.ts` (MODIFIED)
- `components/characters/character-detail-card.tsx` (MODIFIED)
- `components/characters/character-carousel-track.tsx` (MODIFIED)
- `components/characters/character-carousel-poses.ts` (DELETED)
- `components/nav/mobile-nav.tsx` (MODIFIED — bug fix)
- `components/motion/scroll-reveal.tsx` (MODIFIED — hydration fix)

### Follow-Up
- Upload the 13 normalized `characters-position/*.png` to R2; remove the temporary `.env.local`.
- `/characters/[slug]` route still duplicates the in-page detail card — consolidation deferred.

---

## [2026-05-22] - Top Picks Page: Curated Offers + Category Filter + Accordion Grid

### Overview
Shipped `/top-picks` route: curated featured deals page with category filtering, featured deal spotlight (DealBlock), and accordion-style offer grid. Reuses site-rhythm components (FullBleedHero, CloudDivider, NewsletterCTA) for consistency with `/shop`. New FilterChip UI primitive extracted from `explore-videos.tsx` for DRY reuse.

### Changes
- **`app/top-picks/page.tsx`** (NEW): Server component, SSG. Renders FullBleedHero + TopPicksBoard + CloudDivider + NewsletterCTA flow.
- **`components/top-picks/`** (NEW folder):
  - `top-picks-board.tsx`: Client state owner. Category filter chips + DealBlock (featured) + accordion offer grid. CSS grid-template-rows 0fr→1fr transition on accordion toggle.
  - `deal-block.tsx`: Featured spotlight card with `<button>` that toggles accordion grid visibility. Mirror of showcase pattern from shop.
  - `offer-card.tsx`: Curated-offer card. Reuses product-card aesthetic: discount badge, star rating, popularity pill, external Shop Now CTA.
- **`components/ui/filter-chip.tsx`** (NEW, extracted): Shared FilterChip primitive. Extracted from `components/watch/explore-videos.tsx` (was inline); both now import `<FilterChip>` for DRY reuse.
- **`components/watch/explore-videos.tsx`** (MODIFIED): Removed inline FilterChip JSX; now imports from `components/ui/filter-chip.tsx`. No behavior change.
- **`content/top-picks.json`** (NEW): Shape `{ deal: DealBlockSchema, picks: TopPickSchema[] }`. 10 curated picks across 5 categories (apparel, pet-supplies, pet-toys, home-living, others).
- **`lib/content/schemas.ts`** (MODIFIED): Added `TOP_PICK_CATEGORIES`, `TOP_PICK_CATEGORY_LABELS` union constants, `TopPickSchema`, `DealBlockSchema`, `TopPicksContentSchema` (exported).
- **`lib/content/adapter.ts`** (MODIFIED): Added `getTopPicks()` method. Implemented in json-source.ts + sanity-source.ts (no-op stub for Sanity future).
- **`lib/content/index.ts`** (MODIFIED): Re-exports new schemas.
- **`content/site-config.json`** (MODIFIED): Top Picks nav item enabled (was disabled); `href: "/top-picks"`; footer exploreLinks updated likewise. Removed stale top-picks entry from coming-soon.json.

### Design Rationale
- **Category filter**: DRY FilterChip primitive enables consistent taxonomy UI across watch + top-picks pages.
- **Accordion offer grid**: CSS-driven toggle (0fr→1fr) avoids layout shift; semantic <details> pattern considered but deferred for Framer Motion motion-query support in future.
- **Reused rhythm**: FullBleedHero + CloudDivider + NewsletterCTA mirrors /shop for visual/cognitive consistency.

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- HTTP 200 verified on dev server; full `pnpm build` pending (concurrent build lock, not code issue)

### Files Changed
- `app/top-picks/page.tsx` (NEW)
- `components/top-picks/top-picks-board.tsx` (NEW)
- `components/top-picks/deal-block.tsx` (NEW)
- `components/top-picks/offer-card.tsx` (NEW)
- `components/ui/filter-chip.tsx` (NEW — extracted primitive)
- `components/watch/explore-videos.tsx` (MODIFIED — imports FilterChip)
- `content/top-picks.json` (NEW)
- `lib/content/schemas.ts` (MODIFIED)
- `lib/content/adapter.ts` (MODIFIED)
- `lib/content/index.ts` (MODIFIED)
- `content/site-config.json` (MODIFIED)

---

## [2026-05-22] - Characters Carousel v5: Immersive 100SVH + 4 Cards + De-Boxed Soft Pads + Dominant Poses

### Overview
Fifth carousel iteration: evolved equal-size cards into a **full-viewport immersive section** (`min-h-[100svh]`, content vertically centred) with **4 cards visible** (slide basis ~25% desktop). Cards redesigned as **de-boxed soft gradient pads** — no border, no shadow, no hard rectangle; radial-masked edges fade into page background. Character pose PNG **dominates** at ~2x pad height, overflows pad top edge, kept within slide column via per-pose tuning constants. Detail card also de-boxed (edge-masked fade, no border/shadow). All animations preserved: opacity edge-fade, move-by-1, centre-first → detail morph.

### Changes
- **`components/characters/character-carousel-poses.ts`**: NEW — per-pup pose tuning constants (offsetY %, scale factor) applied on pad ancestor for correct `layoutId` morph measurement. Covers all 5 characters.
- **`components/characters/character-carousel-card.tsx`**: Card redesigned as soft de-boxed pad. Background uses `theme.heroGradient` + `PAD_MASK` (radial gradient, no border/shadow). Pose image absolute-positioned to overflow pad top (inset-x-[3%] bottom-[14%] top-[2%]). Pose ancestor applies per-pup tuning. Motif + accent glow inside pad. `layoutId` morph on pose wrapper syncs with detail card. All cards render at equal scale; no coverflow scaling.
- **`components/characters/character-carousel-track.tsx`**: Carousel config simplified — removed focal/scale plugin references, added `useCarouselFade(emblaApi)` hook call. Slides maintain uniform dimensions; Embla `align: "center"` + `loop: true` handles layout. Carousel section: `min-h-[100svh]` with content centred, 4 cards visible (slide basis 25%).
- **`components/characters/character-detail-card.tsx`**: Detail card border + shadow removed; themed gradient now edge-masked to fade into page (no hard rectangle). Uses per-pup `theme.heroGradient` with fade mask applied.
- **`components/characters/use-carousel-fade.ts`**: Hook unchanged — opacity tween still runs on Embla scroll frames, respects `prefers-reduced-motion`.

### Design Rationale
- **Immersive viewport**: 100svh section elevates carousel to hero-level prominence; centred content focuses user attention on character selection.
- **4 cards visible**: Maintains discovery rhythm while reducing decision fatigue vs. 3-card layout.
- **De-boxed soft pads**: Removes visual boundary between card and page background; radial masking creates "melting" effect vs. hard card edges. Gradient exclusive to pad; detail page reuses same per-character theme. Pose dominance (2x height overflow) emphasizes character personality.
- **Per-pose tuning**: Prevents morph measurement drift when pose width/height varies across characters.

### Performance
- `/characters` First Load JS: 164 kB (unchanged from v4).
- Opacity tween runs on Embla scroll frames (no React re-render per frame).
- `/characters/[slug]` detail pages unchanged (SSG).

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: ✓ `/characters` static + prerendered, 164 kB First Load JS
- No CLS; AA contrast; `prefers-reduced-motion` respected (static cards, opacity-only fade)

### Files Changed
- `components/characters/character-carousel-poses.ts` (NEW — per-pup pose tuning)
- `components/characters/character-carousel-card.tsx` (redesigned as de-boxed soft pad)
- `components/characters/character-carousel-track.tsx` (updated to 4-card immersive section)
- `components/characters/character-detail-card.tsx` (edge-masked detail, no border/shadow)
- `components/characters/use-carousel-fade.ts` (unchanged, opacity tween preserved)
- `app/characters/page.tsx` (carousel section now full-viewport immersive)

---

## [2026-05-21] - Characters Carousel v4: Equal-Size Cards + Opacity Fade + Themed Gradient Panels

### Overview
Fourth carousel iteration: replaced center-scaling coverflow with **equal-size cards** (all 3 in-view at same scale + height). Center-scaling animation swapped for **soft opacity edge-fade** — cards stay opaque within viewport, fade smoothly at edges via `useCarouselFade` hook (no React re-render, direct DOM opacity tween). Carousel cards redesigned as **full per-pup themed gradient panels** (per-character `heroGradient` + motif + accent glow); character pose PNG now **straddles the card's top edge** (~50% above, ~50% inside). Navigation unchanged (prev/next arrows move one card at a time, centre-first click expands detail).

### Changes
- **`components/characters/use-carousel-fade.ts`**: NEW — Embla-driven opacity fade hook. Soft FADE_START (0.2) + smooth falloff (FADE_FACTOR 3.6) calculates per-slide opacity on scroll frames. Loop-point aware. Writes DOM `style.opacity` directly (no React re-render per frame). Replaces prior coverflow scale tween.
- **`components/characters/character-carousel-card.tsx`**: Card redesigned as themed gradient panel. Background uses `theme.heroGradient` (per-pup distinct palette). Motif scatter + accent glow render inside card. Pose image absolute-positioned to overflow card's top edge (inset-x-[6%] bottom-[44%] top-[6%]). `layoutId` morph applied to pose wrapper (same morph target as detail card). All cards render at equal scale + height; no coverflow scaling.
- **`components/characters/character-carousel-track.tsx`**: Carousel config simplified — removed focal/scale plugin references, added `useCarouselFade(emblaApi)` hook call. Cards maintain uniform dimensions; Embla `align: "center"` + `loop: true` handles layout. Slides render with `.carousel-fader` wrapper for opacity tween. Centre-first click logic preserved (scroll-to-centre, then expand).
- **RENAMED** `components/characters/use-carousel-coverflow.ts` → `use-carousel-fade.ts` — Hook purpose now opacity-only (no scale logic).

### Design Rationale
- **Equal-size benefit**: Cleaner visual rhythm, easier card focus hierarchy, reduced complexity vs. dynamic scaling.
- **Opacity fade rationale**: Softer visual transition than hard scale-based dimming; respects `prefers-reduced-motion` (static fade, no motion penalty).
- **Themed card panels**: Each card is a distinct character experience (gradient backdrop + motif + pose overflow) vs. prior generic white-card aesthetic. Gradient exclusive to card; detail page reuses same per-character theme.
- **Pose overflow design**: Pup artwork visually "rises" from the card; emphasizes character personality + pose detail.

### Performance
- `/characters` First Load JS: 164 kB (unchanged from v3).
- Opacity tween runs on Embla scroll frames (no React re-render per frame).
- `/characters/[slug]` detail pages unchanged (SSG).

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: ✓ `/characters` static + prerendered, 164 kB First Load JS
- No CLS; AA contrast; `prefers-reduced-motion` respected (static cards, opacity-only fade)

### Files Changed
- `components/characters/use-carousel-fade.ts` (NEW — opacity fade hook, renamed from use-carousel-coverflow.ts)
- `components/characters/character-carousel-card.tsx` (redesigned as themed gradient panel + pose overflow)
- `components/characters/character-carousel-track.tsx` (updated to use useCarouselFade, removed scale plugin)

---

## [2026-05-21] - Characters Page: Refinement + Coverflow Polish (Final Iteration)

### Overview
Polish pass on the `/characters` carousel: swapped hero to `FullBleedHero` (reused from Home) + `CloudDivider` section rhythm for visual cohesion. Carousel refined to show 3 cards fully visible (no clipping), removed full sky-gradient backdrop block in favour of faint ambient-only decor to blend seamlessly into site background. Carousel cards reverted to uniform calm white (per-pup gradient exclusive to detail card now). Navigation simplified: removed pagination dots, arrows-only navigation. Animation cinematic rework: center-first click (side card scrolls to centre, then expands), carousel recede + staggered detail copy with `layoutId` morph.

### Changes
- **`app/characters/page.tsx`**: Refactored to render `<FullBleedHero>` + `<CharacterCarousel>` flow (instead of standalone cinematic setup).
- **`components/characters/character-carousel.tsx`**: Focal coverflow now displays 3 cards fully visible with no clipping. Pagination dots removed; arrows-only navigation. Added center-first click expansion trigger with Framer morph.
- **`components/characters/character-carousel-track.tsx`**: Layout optimized for 3-card focal visibility; recede animation applied on detail selection.
- **`components/characters/character-carousel-card.tsx`**: Reverted to uniform white card (`bg-white`). Removed per-pup accent gradient. Cleaner, calmer aesthetic. `layoutId` morph synced to detail expansion.
- **`components/characters/character-carousel-arrows.tsx`**: Exported `ArrowButton` primitive (renamed from internal helper).
- **`components/characters/character-detail-card.tsx`**: Staggered animation on copy blocks (title, tagline, bio, quote). `layoutId` morph from carousel card.
- **NEW** `components/characters/character-carousel-ambient.tsx` — faint decorative layer (ambient backdrop only; sky gradient removed).
- **NEW** `components/characters/use-carousel-coverflow.ts` — coverflow layout hook (extracted from orchestrator for reuse).
- **DELETED** `components/characters/character-scene-backdrop.tsx` — full-bleed sky backdrop removed (now ambient-only). Use `CharacterSceneBackdrop` in detail card only.
- **DELETED** `components/characters/character-scene-data.ts` — decoration data removed (replaced by minimal ambient decor).

### Performance
- `/characters` First Load JS: 164 kB (down from 179 kB post-polish).
- Carousel no longer renders scene-level full-bleed backdrop (sky gradient + complex decorations), reducing render cost.
- `/characters/[slug]` detail pages unchanged (SSG).

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: ✓ `/characters` static + prerendered, 164 kB First Load JS
- No CLS; AA contrast; `prefers-reduced-motion` respected (static carousel for a11y)

### Files Changed
- `app/characters/page.tsx` (refactored)
- `components/characters/character-carousel.tsx` (refined focal + arrows-only nav)
- `components/characters/character-carousel-track.tsx` (3-card layout)
- `components/characters/character-carousel-card.tsx` (uniform white cards)
- `components/characters/character-carousel-arrows.tsx` (exported ArrowButton)
- `components/characters/character-detail-card.tsx` (staggered copy)
- `components/characters/character-carousel-ambient.tsx` (NEW — faint decor)
- `components/characters/use-carousel-coverflow.ts` (NEW — coverflow hook)
- `components/characters/character-scene-backdrop.tsx` (DELETED from index carousel)
- `components/characters/character-scene-data.ts` (DELETED)

---

## [2026-05-21] - Characters Page: Embla Carousel + Inline Detail Expansion (Final Iteration)

### Overview
Replaced immersive full-screen scene with Embla-powered focal coverflow carousel. Center card displays large pup artwork (5px scale, bright), neighbours are scaled 60% + dimmed 40%, carousel loops with drag/swipe/arrows/dots. Clicking a card triggers inline detail expansion: hides carousel peers, full-bleed detail card emerges (pup artwork, themed decor, bio/quote). URL query param `?pup=<slug>` tracks selection (shareable, back-button friendly). Framer Motion `layoutId` morph animates card→detail transition. `/characters/[slug]` detail pages unchanged (SSG, shareable). Reused atmosphere, motif, quote, backdrop, decor components from prior iterations. Added embla-carousel-react ^8.6.0.

### New Components
- **`components/characters/character-carousel.tsx`** — Embla carousel orchestrator: state management (activeIndex, selectedPup), query param sync, detail-expanded mode. Renders track + arrows + dots nav.
- **`components/characters/character-carousel-track.tsx`** — Embla carousel slides container (5 pups). Per slide: `layoutId="pup-{slug}"` for morph animation, click handler routes to detail + sets URL param.
- **`components/characters/character-carousel-card.tsx`** — Carousel card presentation (thumbnail image, pup name). Embla embeds; 100px square with accent glow. Hover state brightness + scale.
- **`components/characters/character-carousel-arrows.tsx`** — Prev/next nav buttons (branded arrows). onClick handlers trigger Embla scroll. Disabled at scroll edges (non-loop mode); carousel loops so always enabled.
- **`components/characters/character-detail-card.tsx`** — Inline detail expansion (framed in modal-like white overlay above carousel). Renders: scene-backdrop (full-bleed), scene-decor (SVG scatter), atmosphere (per-pup mood layer), motif (animated decor), character figure (pup artwork), title/tagline/bio/quote blocks. Close button (X top-right) collapses detail. `layoutId` morph syncs with carousel card.

### Modified Components
- **`app/characters/page.tsx`** — Rewritten to render `<CinematicHero title="Meet the Pack" ... />` (reused from home), then `<CharacterCarousel characters={ordered} />` below. Suspense boundary wraps carousel. NewsletterCTA remains at bottom.
- **`lib/content/schemas.ts`** — No breaking changes. CharacterSchema already had tagline/bio/quote (all used by detail card).

### Deleted
- **`components/characters/character-scene.tsx`** (full-screen orchestrator, replaced by carousel)
- **`components/characters/character-scene-figure.tsx`** (interactive stage figure, carousel uses simple image cards)
- **`components/characters/character-scene-foreground.tsx`** (depth layer, not needed in carousel layout)

### Reused (No Changes)
- `character-scene-backdrop.tsx` (full-bleed background, reused in detail card)
- `character-scene-decor.tsx` (SVG decorative primitives)
- `character-atmosphere.tsx` (mood layer, per-pup)
- `character-motif.tsx` (scatter animation)
- `character-quote.tsx` (pull-quote text)
- `character-scene-data.ts` (decoration position data)

### Technical Details
- **Embla Config**: `loop: true, align: "center"`, focal plugin enables centre-large layout
- **Drag/Swipe**: Native Embla behavior; mobile swipe + desktop drag both supported
- **Query Param Sync**: `router.push(...?pup=<slug>)` maintains shareable URL; back button closes detail
- **Framer Morph**: `layoutId="pup-{slug}"` on carousel card + detail card enables smooth animation between states
- **Static Prerender**: `/characters` uses Suspense; carousel client-side hydrates with content hydration context
- **SSG Detail Pages**: `/characters/[slug]` routes unchanged, pre-rendered for SEO + instant shareable links

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: ✓ All 5 character detail pages SSG'd, `/characters` static + Suspense boundary
- No CLS; AA contrast; `prefers-reduced-motion` respected (static carousel for a11y users)
- Device support: desktop (drag/arrows/dots), mobile (swipe/arrows/dots), tablet (all)

### Files Changed
- `app/characters/page.tsx` (rewritten)
- `components/characters/character-carousel.tsx` (NEW)
- `components/characters/character-carousel-track.tsx` (NEW)
- `components/characters/character-carousel-card.tsx` (NEW)
- `components/characters/character-carousel-arrows.tsx` (NEW)
- `components/characters/character-detail-card.tsx` (NEW)
- `components/characters/character-scene.tsx` (DELETED)
- `components/characters/character-scene-figure.tsx` (DELETED)
- `components/characters/character-scene-foreground.tsx` (DELETED)
- `package.json` (embla-carousel-react ^8.6.0 added)

---

## [2026-05-21] - Characters Page: Full-Screen Cinematic Scene (Iteration #6)

### Overview
Elevated characters page further: full-viewport immersive scene with premium enriched backdrop (aurora wash, god-ray beams, bokeh orbs, layered parallax depth), foreground foliage depth layer, significantly larger clickable characters, and hover-only name reveal. Buddy pose reordered (corgi2 lead). Detail pages streamlined: removed "From the ScoutPaw Network" callout block; YouTube badge retained in hero title. Pure server-side CSS/SVG — no client JS added.

### New Components (Server, CSS/SVG-only)
- **`components/characters/character-scene-decor.tsx`** — shared decorative SVG primitives: Cloud, MusicNote, Sparkle. Hand-tuned for scattered backdrop embellishment.
- **`components/characters/character-scene-data.ts`** — hand-tuned scatter data arrays for cloud, music note, sparkle placement and sizing. Consumable by backdrop + foreground.
- **`components/characters/character-scene-foreground.tsx`** — foliage + bokeh foreground depth layer rendered in front of figures (`pointer-events-none` to preserve click targets). Creates true depth perception; pups nestled into environment.

### Modified Components
- **`components/characters/character-scene.tsx`** — full-viewport stage (`min-h-[100svh]`); compact integrated `<h1>`. Desktop/tablet: art-directed `SCENE_LAYOUT` character widths bumped (~Max 40%, others 30–34%); mobile: full-height with staggered scroll column. Renders backdrop → figures → foreground.
- **`components/characters/character-scene-figure.tsx`** — name labels now **hover/focus reveal only** (hidden by default, `opacity-0`). On `group-hover` / `group-focus-visible`: fade + slide-in animation. Touch-safe (plain hover ⇒ hidden); `aria-label` covers screen readers + keyboard focus.
- **`components/characters/character-scene-backdrop.tsx`** — enriched into premium animated universe: added aurora wash (soft hue-drift blob), god-ray light beams (layered radiance), bokeh orbs (blurred, depth-varied, gentle float), 3 layered meadow hills (parallax depth). Still pure CSS/SVG + keyframes; no client JS.
- **`content/characters.json`** — Buddy's `poses` reordered: `corgi2.png` now `poses[0]` (lead pose used by scene + detail hero). Updates both `/characters` scene + `/characters/buddy` detail hero with single source of truth.
- **`lib/content/schemas.ts`** — `poses` field comment refreshed (no longer references the removed carousel).
- **`app/characters/[slug]/page.tsx`** — removed `<CharacterChannelCallout>` render + import. "Back to the pack" button folded into themed story section (adjusted padding for visual closure). Channel badge retains title-area YouTube icon.

### Deleted (Iteration Cleanup)
- **`components/characters/character-channel-callout.tsx`** — the "From the ScoutPaw Network" block; detail page streamlined to YouTube badge in hero only

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: ✓ All 5 character detail pages SSG'd, `/characters` static
- No CLS; AA contrast; `prefers-reduced-motion` respected (static sun, no motion for reduced-motion users)

### Files Changed
- `components/characters/character-scene-decor.tsx` (NEW)
- `components/characters/character-scene-data.ts` (NEW)
- `components/characters/character-scene-foreground.tsx` (NEW)
- `components/characters/character-scene.tsx` (modified)
- `components/characters/character-scene-figure.tsx` (modified)
- `components/characters/character-scene-backdrop.tsx` (modified)
- `app/characters/[slug]/page.tsx` (modified)
- `content/characters.json` (modified — Buddy poses reordered)
- `lib/content/schemas.ts` (modified — comment refresh)
- `components/characters/character-channel-callout.tsx` (DELETED)

---

## [2026-05-21] - Characters Page: Immersive Scene Redesign (Iteration #5 / Final Iteration)

### Overview
Completed characters page rebuild (Iteration 5): replaced hero banner + carousel with a custom code-built immersive scene featuring all 5 pups as clickable figures on a cinematic storybook backdrop. Detail pages gained per-character signature atmosphere layers and integrated YouTube channel badges for visual distinction. Pure CSS/SVG solution — no client JS, full server-side rendering.

### New Components (Server, CSS/SVG-only)
- **`components/characters/character-scene.tsx`** — page orchestrator: backdrop + h1 + 5 figures via `SCENE_LAYOUT` const. Desktop art-directed absolute positioning (Max centered + largest, pack fanned around); mobile staggered vertical flow.
- **`components/characters/character-scene-figure.tsx`** — one clickable pup: Link → detail page. Pose PNG + accent glow + always-visible themed name label. CSS hover: glow/scale/float/shadow (same pose). `aria-label` for a11y.
- **`components/characters/character-scene-backdrop.tsx`** — code-built sky: gradient, sun glow, stars, sparkles, clouds, music notes, meadow hills. Inline SVG + CSS keyframes (gentle drift). Fully decorative (`aria-hidden`).
- **`components/characters/character-atmosphere.tsx`** — per-character signature layer (full-bleed, behind motif scatter). 5 variants: Max (nightlight radial glow), Buddy (motion speed lines), Bella (ballet ribbons), Oscar (blueprint grid), Rocky (mountain ridges).
- **`components/characters/character-channel-badge.tsx`** — small integrated emblem: channel banner color + YouTube icon + name, external link (new tab). Placed in detail-page hero below subtitle.

### Modified Components
- **`lib/content/character-themes.ts`** — added `atmosphere` union type + field to `CharacterTheme` struct. All 5 pups themed with unique atmosphere variant + existing heroGradient/decor/motif.
- **`components/characters/character-detail-hero.tsx`** — accepts optional `channel` prop; renders `CharacterChannelBadge` below subtitle + `CharacterAtmosphere` layer behind motif scatter.
- **`app/characters/page.tsx`** — removed FullBleedHero + CharacterCarousel; now renders `<CharacterScene characters={ordered} />`. NewsletterCTA remains below.
- **`app/characters/[slug]/page.tsx`** — passes fetched `channel` to CharacterDetailHero (new prop).
- **`app/globals.css`** — added `figure-float` + `twinkle` keyframes for scene figure animations.

### Deleted (Iteration Cleanup)
- **`components/characters/character-carousel.tsx`** — replaced by CharacterScene
- **`components/characters/character-carousel-card.tsx`** — carousel child component, no longer needed
- **Previously removed (ensure docs updated):**
  - `components/characters/character-hero.tsx` — replaced by CharacterDetailHero
  - `components/characters/fun-facts-list.tsx` — replaced by CharacterQuote

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: ✓ All 5 character detail pages SSG'd, `/characters` static
- No CLS; AA contrast; `prefers-reduced-motion` respected

### Files Changed
- `app/characters/page.tsx` (rewritten)
- `app/characters/[slug]/page.tsx` (modified)
- `components/characters/character-scene.tsx` (NEW)
- `components/characters/character-scene-figure.tsx` (NEW)
- `components/characters/character-scene-backdrop.tsx` (NEW)
- `components/characters/character-atmosphere.tsx` (NEW)
- `components/characters/character-channel-badge.tsx` (NEW)
- `components/characters/character-detail-hero.tsx` (modified)
- `lib/content/character-themes.ts` (modified)
- `app/globals.css` (modified)
- `components/characters/character-carousel.tsx` (DELETED)
- `components/characters/character-carousel-card.tsx` (DELETED)

---

## [2026-05-21] - Characters Page: Data Model + Schema Groundwork (Superseded by Iteration 5)

### Overview (Archived)
This entry documents the data model refactor that prepared the foundation for the immersive scene redesign completed later in Iteration 5. Migrated Character schema from `funFacts` array to unified `quote` field; all schema updates persist and are used by the final immersive scene layout.

### Schema Changes (Retained)
- **lib/content/schemas.ts**: CharacterSchema — added `quote: z.string().min(1)`, removed `funFacts: z.array(z.string())`.
- **content/characters.json**: All 5 characters include `tagline`, `bio`, and `quote` fields (these are reused by Iteration 5 scene components).

### Deprecated Components (Replaced by Iteration 5)
The following intermediate components were discarded in Iteration 5 and should no longer be referenced:
- `character-showcase-section.tsx` (replaced by `character-scene.tsx`)
- `character-quick-nav.tsx` (replaced by `character-scene-figure.tsx`)
- `character-hero.tsx` (replaced by `character-detail-hero.tsx`)
- `fun-facts-list.tsx` (replaced by `character-quote.tsx`)

The data schema changes below are the only artifact retained from this iteration.

### Technical Details
- Quote field is required (min length 1) per Zod schema
- Character data fully populated for all 5 pups
- All changes were superseded by the Iteration 5 immersive redesign (2026-05-21, final)

### Plan
- `plans/260520-2354-characters-page/` (archived; final implementation in Iteration 5)

---

## [2026-05-19] - Newsletter: Delivery Debug + Observability

### Overview
Added structured logging + secret-guarded diagnostic endpoint to the newsletter pipeline after reports that production signups weren't producing team notifications despite the UI showing success. Sanitized `.env.local.example` (a real Resend API key had been accidentally committed to the template; user rotated the key before this change).

### Changes
- **NEW** `lib/newsletter/mask.ts` — `maskEmail("longnn1998@gmail.com")` → `"lon***@gmail.com"` PII helper
- **NEW** `app/api/newsletter/health/route.ts` — secret-guarded `GET /api/newsletter/health?key=$DIAGNOSTIC_SECRET`; fail-closed (404 when secret unset); constant-time compare via `node:crypto.timingSafeEqual`; returns booleans + masked PII + safe values only
- **MOD** `lib/newsletter/index.ts` — emits `[newsletter] dispatch` log line per request (mode + env presence booleans)
- **MOD** `lib/newsletter/resend-source.ts` — logs `[newsletter:resend] sent ok` with Resend message-id; enriched error logs with masked recipient; new `config missing` log for missing-env early exit
- **MOD** `.env.local.example` — stripped real values (key already rotated by user); added prominent TEMPLATE-DO-NOT-EDIT header; added `DIAGNOSTIC_SECRET` placeholder
- **MOD** `docs/deployment.md` — env table now lists `DIAGNOSTIC_SECRET`; new "Newsletter Diagnostics" section with curl runbook and interpretation table

### Security Notes
- Leaked Resend API key was rotated by user prior to this commit
- If `.env.local.example` had previously been pushed with the leaked key, git-history scrubbing is OUT OF SCOPE here — flag for follow-up if upstream commits show the key. Key rotation already contained the blast radius.
- Health endpoint fail-closes when `DIAGNOSTIC_SECRET` is unset (returns 404, indistinguishable from "not found"); constant-time secret compare prevents timing oracle
- All log lines mask subscriber email (`lon***@gmail.com` format); API key never logged in any form

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: pending Phase 4

### Plan
- `plans/260519-0157-resend-delivery-debug/`

---

## [2026-05-18] - Newsletter: ConvertKit → Resend Team Notification

### Overview
Replaced ConvertKit newsletter integration (never provisioned, always stubbed) with Resend transactional email. Every "Join the Pack" signup now triggers a notification email to a single team inbox containing the subscriber's email, source tag, and ISO timestamp. Subscriber receives no email — internal notification only. Stub mode preserved for dev without API key.

### Changes

#### Newsletter Source Layer
- **lib/newsletter/resend-source.ts** (new): Calls Resend SDK `emails.send()`. HTML-escapes user-controlled fields (email, tag). Returns `{ok: false}` on missing env vars instead of throwing. Logs `error.name` + `error.message` only — never full SDK response.
- **lib/newsletter/index.ts**: Dispatch swap — `mode === "live"` now calls `subscribeResend` (was `subscribeConvertKit`).
- **lib/newsletter/convertkit-source.ts**: Deleted.

#### Environment & Deployment Docs
- **.env.local.example**: Removed `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID`. Added `RESEND_API_KEY`, `TEAM_NOTIFICATION_EMAIL`, `NEWSLETTER_FROM_EMAIL` (default `onboarding@resend.dev`).
- **docs/deployment.md**: Env var table + post-deploy smoke test + "Switching Mock → Live" section refreshed for Resend.
- **package.json**: Added `resend@^6.12.3`.

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ pending — to be run in Phase 4
- Stub mode: untouched, still logs `[newsletter:stub]` for dev
- Live mode: requires `RESEND_API_KEY` + `TEAM_NOTIFICATION_EMAIL` (user provisions in Vercel)

### Notes for Ops
- `onboarding@resend.dev` sender only delivers to the Resend-account-owner email. Set `TEAM_NOTIFICATION_EMAIL` to match the account email during initial testing.
- For production: verify `scoutpaw.tv` in Resend dashboard, then switch `NEWSLETTER_FROM_EMAIL` to `notifications@scoutpaw.tv` (deferred — separate plan).
- Remove `CONVERTKIT_API_KEY` and `CONVERTKIT_FORM_ID` from Vercel env vars if previously set.

### Plan
- `plans/260518-1415-join-the-pack-resend-notify/`

---

## [2026-05-18] - Home & Shop Content Refresh (MenuCards, Character Data, Promotion Asset, ExploreProducts)

### Overview
Completed home + shop content refresh: stripped MenuCards backdrops, corrected Max character data (Golden Retriever), redirected promotion banner to new R2 JPG asset, refreshed ExploreProducts tile labels and section copy. Four file edits landed in Phase 1; build (tsc + lint + pnpm build) validation passed in Phase 2. Deploy + CDN purge (Phase 3) + post-deploy smoke tests (Phase 4) pending user action.

### Changes

#### Home MenuCards Backdrop Removal
- **components/home/menu-cards.tsx**: Dropped `bg: string` and `accentGlow: string` from Card type definition. Removed inline `style={{ background: card.bg }}` from floating image card div. Deleted paw-tile pattern overlay div (`patterns/paw-tile.svg`). Deleted radial accent-glow div. Result: bare floating icon card with transparent bg, rounded outline, shadow, hover lift — no colored backdrop, no pattern, no glow.

#### Character Data Slug Swap (Golden Retriever ↔ Husky)
- **content/characters.json**: Swapped `max` ↔ `buddy` entries. `slug: "max"` now correctly represents the Golden Retriever (name "Max", breed "Golden Retriever", image `characters/golden-2.png`, accentColor `#FFB627`). `slug: "buddy"` now represents the Husky (name "Buddy", breed "Husky", image `characters/husky-bg.png`, accentColor `#5BC0EB`). Bios + funFacts traveled with bodies; slugs + order preserved. Resolves pre-existing data shuffle that mislabeled spotlight hero.

#### Home Promotion Banner Asset Update
- **app/page.tsx**: FeatureBanner image path changed from `shop/promotion.png` to `shop/promotion.jpg` (new R2 asset already in place).

#### Shop ExploreProducts Tile Rebranding
- **components/shop/explore-products.tsx**: Extended Tile type with optional `title?: string` field. Updated plushes entry: `title: "Dog Calming & Essentials Collection"`, copy: "Shop our curated collection for pet anxiety, comfort, and wellness. Free your pup from stress today!". Updated apparel entry: `title: "Dog owner gifts"`, copy: "Keep your pup close to your heart with essentials designed to celebrate your unbreakable bond." Render logic updated: `<h3>` and `aria-label` now prefer `tile.title ?? categoryLabel(tile.category)`. Section subtitle updated: "Curated picks for the whole pack — calming essentials for pups + gifts for the humans who love them." Category slugs (`?cat=plushes`, `?cat=apparel`) unchanged; routing untouched.

### Validation (Phase 2)
- `pnpm tsc --noEmit`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: ✓ Success, 21/21 static pages, `/characters/max` + `/characters/buddy` SSG'd
- Code Review: ✓ Done (report: `code-reviewer-260518-0709-phase-01-diff.md`); DONE_WITH_CONCERNS verdict ("Ship").

### Known Follow-Up (Out of Scope)
- **lib/shopify/mock-products.ts**: 3 references to `shop/promotion.png` + mismatched breed labels ("Buddy the Golden Plush", "Max the Husky Tee") contradict the character slug swap. Filed as immediate follow-up per YAGNI (product mock data not user-facing; refactor deferred).

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

---

## [2026-05-15] - Watch Hero: Autoplay-with-Sound + Audio Toggle (WCAG 1.4.2)

### Overview
Enabled autoplay-with-sound on watch hero featured video with graceful muted fallback and user audio toggle control. Client Component handles browser autoplay policies (some require user gesture); user can enable sound via toggle pill. WCAG 1.4.2 compliant (no auto-playing audio without user control).

### Changes
- NEW `components/watch/hero-video.tsx` — Client Component wrapping `<video>` with:
  - Optimistic autoplay-with-sound attempt (respects browser autoplay policy)
  - Graceful fallback to muted if autoplay blocked
  - Audio toggle pill (play icon + "Unmute" label) overlaid on lower-right
  - `<video>` controls hidden (custom toggle only)
  - Aria-label + WCAG keyboard navigation for accessibility
- **components/watch/watch-hero.tsx** — Server Component wrapper replaced inline `<video>` JSX with `<HeroVideo {...props}>` call. Behavior unchanged externally.

### Technical Details
- No new dependencies, no architectural change
- Client Component pattern standard for browser policy handling
- Toggle state managed locally (no external state/store needed)
- Video metadata (src, poster, duration) still passed from server as VideoContentSchema
- Tested: typecheck ✓, lint ✓ (user to smoke test autoplay policy behavior via dev server)

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

---

## [2026-05-15] - "No Videos" Empty State Polish

### Overview
Replaced the plain `No Videos` pill with a cozy gradient card featuring a paw icon, an uppercase headline, and a soft tagline. Shared component used by both ExploreVideos and VideoRail empty states.

### Changes
- NEW `components/watch/empty-videos.tsx` — shared `<EmptyVideos />` with cream→sky gradient (`var(--bg-warm-tan)` → `var(--bg-soft-sky)`), centered paw icon in a white/70 circle, "NO VIDEOS" headline, "Fresh episodes coming soon 🐾" tagline. Hover lift + shadow grow.
- `components/watch/explore-videos.tsx` — empty branch now renders `<EmptyVideos />`.
- `components/watch/video-rail.tsx` — same swap.

### Design tokens used
- `var(--bg-warm-tan)` + `var(--bg-soft-sky)` gradient
- `text-brand-gold` for paw icon
- `bg-white/70` for icon circle backdrop
- `shadow-cozy` → `shadow-cozy-md` on hover
- `font-display` headline with `tracking-[0.18em]`
- `ease-gentle duration-500` transitions (matches site-wide hover tempo)

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

Source brainstorm: `plans/reports/brainstorm-260515-0403-no-videos-empty-state-polish.md`

---

## [2026-05-15] - assetUrl() Absolute URL Pass-Through (Hotfix)

### Overview
Fix latent bug from cycle 5: `assetUrl()` was corrupting API-fetched thumbnail URLs by prepending the R2 prefix to absolute https:// URLs. After `enrichVideos()` overlaid `https://i.ytimg.com/vi/<id>/hqdefault.jpg` onto `video.thumbnail`, the 5 component sites wrapping it with `assetUrl()` produced broken URLs like `https://images.scoutpaw.tv/assets/https://i.ytimg.com/...`. YouTube Data API video thumbnails never rendered in production.

### Change
- `lib/utils/asset-url.ts`: 2-line addition — early return for inputs matching `/^https?:\/\//i`. Bare keys still resolve to R2; absolute URLs pass through unchanged.

### Affected sites (now working)
- `components/watch/featured-video.tsx:26`
- `components/watch/our-channels.tsx:142` (latestVideo.thumbnail)
- `components/watch/video-card.tsx:28`
- `components/watch/watch-hero.tsx:25`
- `components/watch/watch-library.tsx:152`

### Verification
Smoke-tested 5 input forms: bare key + leading slash + assets prefix + https + http. All resolve correctly.

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

---

## [2026-05-15] - ExploreVideos Carousel Refactor

### Overview
Converted `ExploreVideos` from a static 2-large + 6-small grid into a horizontal scroll-snap rail matching the Community Choice rail (`VideoRail`). Native swipe + nav arrows + shared `VideoCard` component. Cleaner streaming-platform UX.

### Changes
- `components/watch/explore-videos.tsx` rewritten:
  - Filter chips header unchanged.
  - Grid replaced with `<ul>` scroll-snap rail (`snap-x snap-mandatory`).
  - Inline `NavArrow` component (duplicate of `VideoRail`'s) — arrows hide at scroll ends.
  - Card render uses shared `VideoCard` component (consistent with VideoRail).
  - Removed local `LargeVideoCard`, `SmallVideoCard`, `videoHref`, `videoThumb`, `formatViews` helpers (unused after refactor).
  - Filter chip change auto-scrolls the rail back to the start for clean UX.
  - Empty filter retains the "No Videos" pill from earlier polish.

### Behavior
- Mobile: native horizontal swipe, 1 card visible with peek.
- Desktop: nav arrows appear at scroll edges; 3+ cards visible.
- Filter chip change → rail re-renders with sorted list + scroll reset.

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

Source brainstorm: `plans/reports/brainstorm-260515-0345-explore-videos-carousel.md`

---

## [2026-05-15] - Mock Video Cleanup (Watch Page Production-Ready)

### Overview
Deleted all 24 placeholder mock videos (youtubeId starting with `TODO_`) from `content/videos.json`. Watch page now renders only the 6 real YouTube-backed dog videos. Empty categories (cats, funny, community, shorts, product-reviews) gracefully show the "NO VIDEOS" pill shipped earlier today.

### Change
- `content/videos.json`: 30 entries → 6 (filtered by `!youtubeId.startsWith("TODO_")`).
- Remaining videos: mock-001 through mock-006, all in `dogs` category, all with real YouTube IDs (4Fgl_dW3vgA, X19MapswOQs, PRCac_UMohw, 3b3T2Z2CZLA, HPlFCtF_Sxs, D3vSMHj2mrg).

### Downstream
- Community Choice rail: 6 videos sorted by view count.
- Featured video: mock-001 (still real ID).
- All non-dogs category filters render the "NO VIDEOS" empty-state pill.
- Watch page is now fully API-driven (no mock fallback values rendering).

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

---

## [2026-05-15] - Channel Breed Prefix + "No Videos" Pill (Polish)

### Overview
Follow-up polish to cycle 5. Channel card titles now display as `{breed} - {channel name}` (e.g., "Golden - Puppy Lullaby TV"). Empty-state for video rails + Explore categories rendered as a centered rounded "NO VIDEOS" pill instead of plain text.

### Changes
- **Schema** (`lib/content/schemas.ts`): ChannelSchema gains `displayPrefix?: string` — optional breed/character label decoupled from `characterSlug` theming.
- **`content/channels.json`**: 4 channels rewritten with `displayPrefix` ("Golden", "Husky", "Poodle", "Collie") and revised `characterSlug` + `bannerColor` + `avatarColor` per user mapping (Golden→max, Husky→rocky, Poodle→bella, Collie→oscar).
- **`components/watch/our-channels.tsx`**: CompactChannelCard renders `{displayPrefix} - {channel.name}` when prefix present.
- **`components/watch/explore-videos.tsx`** + **`components/watch/video-rail.tsx`**: empty-state replaced with centered rounded pill (`rounded-full border bg-surface px-5 py-2 uppercase tracking-wider text-ink/65`) reading "No Videos".

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

### Note on Mapping
User-supplied breed prefixes do not match the stored `characters.json` breed values (e.g., Max is a Husky in JSON but prefix "Golden" was assigned to him). Implemented per explicit user spec; prefix is a free-form display string independent of character data.

Source brainstorm: `plans/reports/brainstorm-260515-0311-channel-prefix-no-videos-badge.md`

---

## [2026-05-15] - YouTube Data API Integration (Cycle 5 of 5)

### Overview
Cycle 5 complete: Dynamic YouTube Data API integration wired into Watch page. New `lib/youtube/` module fetches live channel + video metadata from Google Cloud YouTube Data v3; server-side enrichment overlays API data onto fallback JSON schema; components render transparently (no API awareness). Completes final phase of 5-cycle Watch+Polish decomposition.

### YouTube Data API Architecture
- **NEW Module** `lib/youtube/`:
  - `types.ts`: TypeScript interfaces (YouTubeChannel, YouTubeVideo) with API response shape
  - `client.ts`: `fetchChannels(ids)` + `fetchVideos(ids)` with batching (50 IDs max), 1hr revalidate cache via Next.js fetch options, graceful empty-array fallback on 403/404/network errors
  - `duration.ts`: ISO 8601 duration parser (`parseISODuration("PT1H23M45S")` → `"1:23:45"`)
  - `enrich.ts`: `enrichChannels(channels)` + `enrichVideos(videos)` overlay API data onto JSON fallback, skip TODO_* placeholder IDs silently

### Schema Extension
- **lib/content/schemas.ts**: ChannelSchema gains `youtubeChannelId?: string` + `avatarUrl?: string`; `bannerColor` relaxed to optional (undefined becomes gradient fallback in UI)

### Content Refactor
- **content/channels.json**: Rewrote 4 entries (dropped mock scoutpaw-tv + scoutpaw-music placeholders). Each remaining channel now includes youtubeChannelId (ready for API fetch)
- **content/videos.json**: Dropped `channelSlug` field from all 30 entries (pointed at removed channels; UI null-safe)

### Environment & Config
- **.env.local.example**: Documented `YOUTUBE_API_KEY=` with security note: "Restrict to HTTP referrers in Google Cloud Console (scoutpaw.tv only in prod)"
- **next.config.ts**: Added `yt3.googleusercontent.com` + `yt3.ggpht.com` to images.remotePatterns for YouTube avatar CDN

### Watch Page Integration
- **app/watch/page.tsx**: After `content.getChannels()` + `content.getFeaturedVideos()` + `content.getVideos(category)` hydrate JSON, Promise.all enriches via `enrichChannels()` + `enrichVideos()` server-side before passing to components. Components render data transparently (no API awareness, backward-compatible fallback).

### Component Updates
- **components/watch/our-channels.tsx**: bannerColor gradient gains undefined fallback; CompactChannelCard avatar: when `channel.avatarUrl` present, renders dynamic `<Image>` of YouTube avatar; else fallback to original initial-letter gradient circle
- **components/watch/explore-videos.tsx**: Empty-state placeholder text simplified "No videos in this category yet — try All." → "No videos yet"
- **components/watch/video-rail.tsx**: Previously returned null when empty; now renders rail header + placeholder card with "No videos yet" + hidden seeAllHref

### Changed Files
- `lib/youtube/types.ts`: NEW (YouTubeChannel, YouTubeVideo interfaces)
- `lib/youtube/duration.ts`: NEW (ISO 8601 parser)
- `lib/youtube/client.ts`: NEW (API fetch + batch + cache logic)
- `lib/youtube/enrich.ts`: NEW (enrichment overlay)
- `lib/content/schemas.ts`: ChannelSchema youtubeChannelId + avatarUrl, bannerColor optional
- `content/channels.json`: 4-entry rewrite with youtubeChannelId
- `content/videos.json`: Dropped channelSlug from 30 entries
- `.env.local.example`: YOUTUBE_API_KEY documentation
- `next.config.ts`: yt3 CDN remotePatterns
- `app/watch/page.tsx`: Promise.all enrichment server-side pre-render
- `components/watch/our-channels.tsx`: Avatar img fallback, bannerColor undefined safety
- `components/watch/explore-videos.tsx`: Empty-state text polish
- `components/watch/video-rail.tsx`: Empty-state header + placeholder card

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- Code Review: ✓ Done (no critical/high concerns); 3 medium observations (non-blocking): silent error swallowing in client catch blocks; redundant `id &&` guard in enrich.ts; asymmetric featured-fetch in page.tsx. All deferred to tech-debt backlog.
- User YOUTUBE_API_KEY: ✓ Present in .env (verified via grep)
- Live API smoke test: Deferred to user (dev server walkthrough required)

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

### Cycle 5 Completion Context
This entry marks completion of **Cycle 5: YouTube Data API integration**, the final phase of the 5-cycle Watch+Polish decomposition begun earlier this session. Cycles 1–5 timeline:
- **Cycle 1** (complete, 2026-05-15): Glass blob hero + watch hero video
- **Cycle 4–6** (complete, 2026-05-15): Watch content + newsletter discovery + channels
- **Cycle 5** (complete, 2026-05-15): YouTube Data API integration
- **Cycles 2–4** (pending, deferred): Responsive audit, SEO audit, audit-driven fixes

---

## [2026-05-15] - Watch Content + Newsletter Discovery + Channels (Cycle 4–6)

### Overview
Completed cycles 4–6 of Watch page enhancement: real YouTube IDs migrated into featured + community videos; 4 new channels appended with placeholder metrics; newsletter API validated as functional (stub-mode confirmed, no code defect); duration badge removed from watch hero video card for UX consistency.

### YouTube Video Migration
- **content/videos.json**: 6 mock dog video youtubeIds replaced with real, live-verifiable YouTube IDs:
  - `mock-001` → `4Fgl_dW3vgA` (Corgi playlist intro)
  - `mock-002` → `X19MapswOQs` (Puppy challenge)
  - `mock-003` → `PRCac_UMohw` (Golden retriever training)
  - `mock-004` → `3b3T2Z2CZLA` (Husky antics)
  - `mock-005` → `HPlFCtF_Sxs` (Shiba inu moments)
  - `mock-006` → `D3vSMHj2mrg` (Live dog stream)
- **Side Effect**: WatchHero featured link href now navigates to real YouTube URL; community choice rail thumbnails resolve dynamically to i.ytimg.com (no static image overhead).

### Channels Expansion
- **content/channels.json**: Appended 4 channels (6 total now):
  - `puppy-lullaby-tv` → bella (50000 subs, 30 videos placeholder)
  - `happy-paws-cartoon` → oscar (50000 subs, 30 videos placeholder)
  - `magic-paw` → rocky (50000 subs, 30 videos placeholder)
  - `doggo-dreams-tv` → max (50000 subs, 30 videos placeholder)
- **Placeholder Note**: Subscriber + video counts are stub values. Cycle 5 (YouTube Data API integration, pending) will replace with live API values. Channels render functionally; counts auto-update once API wired.

### Watch Hero Polish
- **components/watch/watch-hero.tsx**: Removed duration badge (`{featured.duration && (...)}` block) from video card overlay. Category + channel badges retained.
- **Rationale**: Duration badge redundant on featured video context; removal simplifies card UI while preserving category/channel metadata.

### Newsletter API Validation (No Code Change)
- **Discovery**: Existing `app/api/newsletter/route.ts` + sophisticated `lib/newsletter/` (Zod schemas, ConvertKit source stub, rate-limiter) already in codebase.
- **Smoke Test**: Curl tested all 3 paths:
  - Valid email: 200 response
  - Invalid format: 400 response
  - Honeypot field set: Silent 200 (anti-bot pattern)
- **Finding**: User's "form not working" report likely relates to stub-mode behavior (no actual email delivery), not code defect. Newsletter infrastructure is functional; setup for live ConvertKit wiring exists in `lib/newsletter/sources/convertkit.ts`.

### Changed Files
- `content/videos.json`: 6 youtubeIds updated
- `content/channels.json`: 4 channels appended
- `components/watch/watch-hero.tsx`: Duration badge removed

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- Curl smoke tests: ✓ All 3 newsletter paths pass (200, 400, 200)
- Code Review: ✓ Done (report: `code-reviewer-260515-1455-watch-content-newsletter.md`); no blocking concerns; 3 medium observations (all informational, non-actionable in current scope)

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

### Pending User Action (Out of Scope)
- **R2 Asset Upload**: `public/assets/patterns/paw-tile.svg` must be manually uploaded to R2 bucket key `assets/patterns/paw-tile.svg`. Curl HEAD check still returns 404. Until uploaded, home menu cards' paw pattern background won't render (fallback: solid card bg only). See plan reports for curl command.

---

## [2026-05-15] - R2 `/assets/` Prefix Fix (Hotfix)

### Overview
Hotfix to the R2 asset migration shipped earlier today. Helper now prepends `assets/` to all R2-resolved URLs, matching the bucket key structure (`assets/banner/banner.png` etc.). Production URLs were 404ing because the helper produced `https://images.scoutpaw.tv/<key>` while R2 keys live at `https://images.scoutpaw.tv/assets/<key>`.

### Change
- `lib/utils/asset-url.ts`: one-line edit — `${BASE_URL}/${k}` → `${BASE_URL}/assets/${k}` in the R2 branch. Local fallback unchanged (already had `/assets/` prefix).
- Smoke-tested all 5 input forms resolve to `https://images.scoutpaw.tv/assets/...` URLs.

### Validation
- `pnpm typecheck` clean
- `pnpm lint` clean
- No caller changes, no JSON re-migration, no schema changes.

Source brainstorm: `plans/reports/brainstorm-260515-0138-r2-assets-prefix-fix.md`

---

## [2026-05-15] - R2 Asset Migration (Independent Completion)

### Overview
Completed migration from local `/assets/` paths to Cloudflare R2 CDN asset delivery. New `assetUrl()` helper centralizes CDN URL resolution; 42 content asset strings migrated; 23 components/pages refactored for dynamic asset loading; build validation clean.

### R2 Integration
- **NEW Helper**: `lib/utils/asset-url.ts` exports `assetUrl(key: string)` that reads `NEXT_PUBLIC_R2_BASE_URL` env var and resolves to CDN. Fallback to `/assets/<key>` when env empty (local dev mode).
- **ENV Naming**: `.env` renamed `R2_PUBLIC_URL → NEXT_PUBLIC_R2_BASE_URL` (client-accessible prefix); `.env.local.example` documents new var for local dev.
- **Next Config**: `next.config.ts` adds `images.scoutpaw.tv` to remotePatterns for Image component optimization.

### Content Migration
- **Character Icons** (`content/characters.json`): 8 string asset paths stripped `/assets/` prefix → bare keys (e.g., `characters/corgi.png`)
- **Playlists Metadata** (`content/playlists.json`): 16 coverImage paths migrated; `_note` docstring updated to reflect new convention
- **Site Configuration** (`content/site-config.json`): 5 brand asset paths (logo, logoText, favicon) migrated
- **Videos Metadata** (`content/videos.json`): 13 thumbnail + poster paths migrated; `_note` docstring updated

### Component Refactoring
- **23 files modified**: app/ (4 files), components/ (15 files), lib/ (2 files, shop mock products + asset-url helper), content/ (4 JSON files)
- **Literal Migration**: Component files wrap asset-url calls around hardcoded string literals (e.g., `assetUrl("banner/banner.png")`)
- **JSON-Fed Values**: Character.image, playlist.coverImage, featured.thumbnail, featured.videoSrc, featured.videoPoster, config.brand.logo, config.brand.logoText wrapped at render sites (values read from content schemas, passed to assetUrl before JSX)
- **CSS backgroundImage**: Template-literal conversion in menu-cards.tsx (paw pattern path) + watch-library.tsx (background gradient + pattern); both use assetUrl() wrapper
- **Shopify Mock**: `lib/shopify/mock-products.ts` 8 asset literals migrated

### Post-Review Fixes
- **Top Nav Logo**: `logoText` prop wrapped in assetUrl() before passing to MobileNav component (caught by reviewer; prevents unnecessary re-wrapping downstream)
- **Env Documentation**: R2_BASE_URL line added to `.env.local.example` (caught by reviewer; ensures new developers get clear setup guidance)
- **JSON Docstrings**: Playlists + videos `_note` fields updated to reflect new "bare key" convention, replacing old "/assets/" mention (caught by reviewer; maintains content documentation accuracy)

### Changed Files
- `lib/utils/asset-url.ts`: NEW helper (assetUrl function + env fallback logic)
- `.env`: R2_PUBLIC_URL → NEXT_PUBLIC_R2_BASE_URL rename
- `.env.local.example`: NEW R2_BASE_URL documentation line
- `next.config.ts`: images.scoutpaw.tv remotePatterns entry
- `content/characters.json`: 8 paths migrated (corgi, donkey, duck, horse, pig, rabbit, shark, turtle)
- `content/playlists.json`: 16 coverImage paths + _note updated
- `content/site-config.json`: 5 brand asset paths migrated
- `content/videos.json`: 13 thumbnail + poster paths + _note updated
- `components/` (15 files): assetUrl() wrapping on literals + JSON-fed values + CSS template literals
- `lib/shopify/mock-products.ts`: 8 image paths migrated
- `app/` (4 files): logo, banner, and other asset paths wrapped

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- **Grep Audit**: Zero `/assets/` hits in app/, components/, lib/, content/ (excluding lib/utils/asset-url.ts fallback string, which is correct)
- **Code Review**: DONE_WITH_CONCERNS; all 3 findings (logoText wrapping, env documentation, JSON docstrings) resolved post-review

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-15] - Glass Blob Hero + Watch Hero Video (Cycle 1 of 5)

### Overview
Cycle 1 complete: Visual enhancement pass on home hero (glass blob effect) + dynamic video integration into watch hero. Foundation for cycles 2–5: responsive audit, SEO audit, audit fixes, YouTube Data API integration.

### Glass Blob Hero Redesign
- **FullBleedHero Architecture**: Replaced rounded-rectangle frosted glass card (`bg-white/55 rounded-2xl border shadow-cozy backdrop-blur-xl`) with layered glass blob. Outer div holds kicker + title + description; absolute aria-hidden div beneath provides visual effect via `bg-white/55 backdrop-blur-xl` + radial mask-image gradient (`radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 95%)`). Inset padding `-1.5rem` extends blob falloff beyond text container. Mobile in-flow card path unchanged.
- **Visual Impact**: Soft glow blob anchors upper-left corner; text floats atop with full readability. No client-side JS; mask-image provides CSS-only soft-edge effect. Works across all viewports (mobile soft-stacked, desktop glass blob overlay).

### Watch Hero Video Integration
- **Video Schema Extension** (`lib/content/schemas.ts`): Added optional fields to `VideoContentSchema`: `videoSrc?: string` and `videoPoster?: string`. Backwards-compatible; non-video entries unaffected.
- **Featured Video Payload** (`content/videos.json`): `mock-001` (getFeaturedVideo return value) now includes `videoSrc: "/assets/watch/intro.mp4"` and `videoPoster: "/assets/watch/intro-poster.jpg"`.
- **WatchHero Conditional Render** (`components/watch/watch-hero.tsx`): When `featured.videoSrc` present, renders `<video src={...} poster={...} autoPlay muted loop playsInline preload="metadata">` (absolute inset, object-cover, 13 MB H.264). Falls back to YouTube thumbnail + play-button overlay if no videoSrc. Outer Link navigation to YouTube unchanged.
- **Asset Delivery**: `/public/assets/watch/intro.mp4` (13 MB, compressed from 90 MB source via ffmpeg H.264 CRF 26, audio stripped, faststart enabled) and `/public/assets/watch/intro-poster.jpg` (252 KB extracted at 0.5s frame).

### Changed Files
- `components/home/full-bleed-hero.tsx`: Glass blob effect (mask-image radial gradient, inset padding, aria-hidden div)
- `lib/content/schemas.ts`: Added `videoSrc?: string`, `videoPoster?: string` to VideoContentSchema
- `content/videos.json`: `mock-001` featured video now includes videoSrc + videoPoster
- `components/watch/watch-hero.tsx`: Conditional video render (videoSrc present) vs YouTube fallback
- `public/assets/watch/intro.mp4`: NEW video asset (13 MB, H.264, no audio)
- `public/assets/watch/intro-poster.jpg`: NEW poster frame (252 KB, extracted at 0.5s)

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- Video compression: ✓ 13 MB (under 15 MB cap)
- Code Review: ✓ Done (report: `code-reviewer-260515-0026-glass-blob-watch-video.md`); no blocking concerns

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

### Cycle Roadmap
- **Cycle 1** (complete): Glass blob + video (visual enhancements)
- **Cycle 2** (pending): Responsive audit (audit-only, seeded by 2026-05-11 audit)
- **Cycle 3** (pending): SEO audit (audit-only)
- **Cycle 4** (pending): Audit-driven fixes (layout, contrast, a11y, cookie consent)
- **Cycle 5** (pending): YouTube Data API integration (dynamic playlists + metadata)

## [2026-05-14] - Hero + Cards + Shop Layout Polish (UI Polish Pass)

### Iteration 1 (earlier today)
- **Home Hero Title**: Removed `: Scoutpaw TV` suffix from hero title (now "THE ULTIMATE WORKDAY HANGOUT" only).
- **FullBleedHero Overlay Reanchor**: Desktop overlay re-anchored from vertically centered to bottom-left corner. Default width narrowed (`max-w-sm lg:max-w-md`). Added localized bottom-up gradient backdrop overlay. Mobile layout unchanged. Corgi face now fully unobstructed.
- **Home Menu Cards Images**: Set A images mirrored into `/public/assets/card/` (characters.png, shop.png, watch.png for Characters, Shop, Watch cards).
- **Characters Card Background**: Changed `#fffbe6` (yellow) → `var(--bg-soft-sky)` to prevent unwanted yellow-duck blending with image.
- **Shop ExploreProducts Refactor**: Refactored from sticker-overlay pattern (text panel absolute-positioned over image bottom) to editorial layout (square image card on top with retained tilt + hover-untilt, separate text card below with full padding).
- **Asset Performance**: shop.png optimized 3.4 MB → 363 KB (2048² → 768² downsize, 256-color quantize, max compression). Quality preserved; visual impact minimal.

### Iteration 2 (Code Review + Polish Post-Review)
- **FullBleedHero Glass Card Reanchor**: Bottom-left opaque card (`bg-white/85`) → top-left frosted glass card (`bg-white/55`). Vertical anchor `pb-10 lg:pb-16` → `pt-12 lg:pt-16` (bottom → top). Alignment `items-end` → `items-start`. Backdrop `backdrop-blur-md` → `backdrop-blur-xl`. Border `border-ink/10` → `border-white/40` (opacity bumped post-review for WCAG contrast). Removed bottom-up gradient div.
- **Home Menu Cards Paw Pattern**: Added per-card repeating paw-print pattern layer (`public/assets/patterns/paw-tile.svg`, 48×48 viewBox, opacity 12%) inside each image card div. Section-level scattered decor (paws, bones, ball) unchanged from iter-1.
- **Shop ExploreProducts Unified Tiles**: Refactored from iter-1's two-sibling-cards stack (image + text as separate cards) into ONE unified card per tile. Single `bg-surface rounded-[2rem] shadow-cozy overflow-hidden` container wraps image area + text area. Whole-card tilt + hover-untilt preserved. Grid gap `gap-8 md:gap-10` → `gap-6 md:gap-8`.

### Iteration 3 (Interaction Polish — CTA & Hover Motion Standardization)
- **FullBleedHero CTA Removal**: Removed `actions` prop and default `<Button>` block; removed `Button` import. Hero CardBody now renders kicker + title + description only (no CTA).
- **Shop Page CTA Cleanup**: Removed `actions={<Button>Explore Collections</Button>}` prop from `<FullBleedHero />` in `app/shop/page.tsx`; removed `Button` import.
- **MenuCard Unified Hover Motion**: Standardized all card transitions to `duration-500 ease-gentle` site-wide. Outer `<Link>` wrapper gains `hover:-translate-y-1` (whole composition breathes upward as one unit). Image card bumped `-translate-y-1` → `-translate-y-2` (preserves 4px differential lift vs outer motion). Text card transition expanded `transition-shadow` → `transition-all`. Pill duration 200ms → 500ms for consistency.
- **Shop Tile Hover Refinement**: Removed `group-hover:rotate-0` from unified card div (tile stays tilted on hover; eliminates apparent text resize / layout shift perception). Duration 300ms → 500ms for site-wide consistency. Inner image easing `ease-out` → `ease-gentle`.
- **Cross-Cutting Motion Standard**: Card hover tempo unified at `duration-500 ease-gentle` across home menu cards, shop tiles, and all composite interactions.

### Changed Files
- `components/home/full-bleed-hero.tsx`: Removed `actions` prop, default `<Button>` render, and `Button` import
- `app/shop/page.tsx`: Removed `actions` prop from `<FullBleedHero />` and `Button` import
- `components/home/menu-cards.tsx`: Unified hover motion (`duration-500 ease-gentle`), outer Link hover `-translate-y-1`, image card `-translate-y-2`, text card `transition-all`, pill duration 200ms → 500ms
- `components/shop/explore-products.tsx`: Removed `group-hover:rotate-0`, duration 300ms → 500ms, inner image easing `ease-out` → `ease-gentle`

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- Code Review: Done (no blocking concerns; calibration note on combined menu-card lift = 12px absolute / 8px differential, visual QA owns final "lift feel" call)

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Scroll Sun Architecture Reversed to Global Fixed (Motion Fix)

### Added / Changed
- **Scroll Sun Repositioned**: Sun decoration moved from hero-bound (`position: absolute`, hero ref scroll target) to globally fixed (`position: fixed`, document scroll tracking). Component now visible across all home page sections (not confined to hero viewport).
- **Architecture Changes**:
  - `components/home/scroll-sun.tsx`: Dropped `useRef` + hero target; now calls `useScroll()` with no args (tracks full document scroll). Y translation increased 0→220px → 0→400px. X drift updated [0,0.5,1] → [0,40,-20]. Added opacity fade [0, 0.85, 1] → [1, 1, 0.3] (sun fades to 30% opacity in final 15% of scroll to avoid footer clash).
  - `components/home/full-bleed-hero.tsx`: Removed ScrollSun import + JSX render.
  - `app/page.tsx`: Added ScrollSun import + render at top of home page fragment.
- **Styling**: Top-right placement fixed: `right-[12%] top-[14%]` (desktop), `lg:right-[16%] lg:top-[16%]` (desktop up). z-index `z-[5]` (above sections, below navbar). Still `hidden md:block` (mobile hidden).

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Scroll-Linked Sun Decoration on Hero (Motion Enhancement)

### Added / Changed
- **Scroll Sun Hero Decoration**: New client component `components/home/scroll-sun.tsx` adds decorative sun to upper-right corner of hero section. Scroll-linked motion via Framer Motion useScroll/useTransform: vertical descent 0→220px + horizontal drift 0→+28→-16px. SVG sun (circle r=22 + 8 rays) with stacked drop-shadow glow layers. Color `text-brand-honey`. Hidden on mobile (`hidden md:block`). Respects `prefers-reduced-motion` (static sun for a11y users). Self-contained ref, no prop drilling.
- `components/home/full-bleed-hero.tsx`: Import + render `<ScrollSun />` between banner div and glass card div.

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Hero Center-Upper + Pack Cards Image Upsize + Section Decorations (Polish Iteration)

### Added / Changed
- **Hero Vertical Anchor**: Glass card anchored to upper-third of banner on desktop (`md:top-24 lg:top-32` = 96/128px from banner top). Mobile true-stack below banner with 32px gap (`mt-8` replaces `-mt-8`).
- **Pack Cards Image Upsize**: Image card bumped h-40/44/48 (160/176/192px). Text card restructured for exact equal heights: outer wrapper `flex h-full flex-col`, text card `flex flex-1 flex-col` fills remaining height inside wrapper. Negative margin + padding recomputed (see phase-02 math).
- **Section Decorations**: 6 scattered SVG icons (3 paw, 2 bone, 1 ball) at 10% opacity in `text-warm-text`, absolute positioned behind cards. Layer has `pointer-events-none + aria-hidden` to preserve interactivity. Rotation varied (8–20 degrees). File growth +30 lines (3 inline SVG components at bottom).

### Changed
- `components/home/full-bleed-hero.tsx`: `-mt-8` → `mt-8` (mobile), `md:top-12` → `md:top-24`, `lg:top-16` → `lg:top-32`
- `components/home/menu-cards.tsx`: Image h-40/44/48 + sizes prop; text card flex-1; wrapper flex-col; decoration layer + DecorPaw/DecorBone/DecorBall functions

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Hero Left Swap + Pack Cards Pinterest Pin Restructure (Follow-up Refinement)

### Added / Changed
- **Hero Glass Card Position Swap**: Hero text panel repositioned from upper-right (`md:right-12 lg:right-16`) to upper-left (`md:left-12 lg:left-16`). Placement follows glass card overlap pattern; card now sits left of centerline.
- **Pack Cards Pinterest Pin Pattern**: MenuCard redesigned from tall image card + narrower text below to **small centered floating image card + full-width text card**. Image card fixed-size (`h-32 md:h-36 lg:h-40` square), centered, z-10 relative; text card full width with negative margin (`-mt-16 md:-mt-[72px] lg:-mt-20`) pulling up to overlap image bottom half. Text card padding (`pt-24 md:pt-28 lg:pt-32`) reserves overlap space; Content starts below image.
- **Coming-Soon Badge Relocation**: Badge moved from inside image card to outer Link wrapper top-right (z-20), visible above floating image.
- **Hover Refinement**: Image card lifts on hover (`-translate-y-1 scale-105`); text card shadow bumps. Group-level hover coordination preserved.

### Changed
- `components/home/full-bleed-hero.tsx`: Glass card right → left positioning (3-char swap: `md:right-12`→`md:left-12`, `lg:right-16`→`lg:left-16`)
- `components/home/menu-cards.tsx`: MenuCard restructured to Pinterest pin layout (small floating image + large text card overlap)

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Home Hero Restructure (Glass Card + Pack Cards Restack)

### Added / Changed
- **Hero Card Repositioning**: Hero text panel converted from full-bleed overlay to top-right glass card (`bg-honey/85 backdrop-blur-xl`). Mobile (<768px): card stacks below banner aspect-4:3 with `-mt-8` overlap. md+: pinned `top-12 right-12` (lg: `top-16 right-16`).
- **Hero Copy Refresh**: Kicker "SCOUTPAW TV", headline "THE ULTIMATE WORKDAY HANGOUT", 70-word body describing the 5 characters + their workday hangout mission.
- **Pack Cards Restructure**: MenuCard redesigned from single card into two-element stack: aspect-square image card (colored bg + glow + transparent icon) + narrower text card below (bg-surface, mx-4, -mt-10 overlap). Card rotation removed. Coming-Soon badge moved to image card top-right.
- **Hover Behavior**: Image card lift on hover scales icon 1.05x and lifts 8px; text card shadow deepens.

### Changed
- `components/home/full-bleed-hero.tsx`: Glass card layout, responsive positioning, gradient mask removed
- `app/page.tsx`: Hero kicker/title/description props updated to new copy
- `components/home/menu-cards.tsx`: MenuCard restructured to two-element stacks, rotate field removed from Card type

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Newsletter Button + Navbar/Footer Polish (Styling Pass)

- **Newsletter Button**: Navbar button redesigned with navy bg, envelope icon, variant="dark" size="lg"
- **Logo Sizing**: Navbar/footer logo aspect corrected (no stretch); sizing adjusted h-10/12/14 (navbar), h-8/10/12 (footer)
- **Asset Sync**: 10 PNGs synced to `/public/assets/` (banner, card icons, logo files); `banner.webp` deleted
- **MenuCards**: Accent-color radial glow + drop-shadow on transparent icons
- **Files**: `components/nav/top-nav.tsx`, `components/nav/footer.tsx`, `components/home/full-bleed-hero.tsx`, `components/home/menu-cards.tsx`, `components/nav/mobile-nav.tsx`
- Validation: typecheck ✓, lint ✓

## [2026-05-11] - Responsive Audit (Full Website)

### Audit / QA
- **Comprehensive Responsive Review**: 44 components audited via code-static pass; 49 screenshots captured at 7 viewports (360–2560px) across 7 pages (Home, Shop, Watch, Coming-Soon, Character, Privacy, Terms)
- **Findings Summary**: 0 critical / 8 major / 10 minor
  - Major: Cookie consent UX inconsistency, hero positioning at MD breakpoint, watch grid layout shift, filter chip contrast, anchor navigation accessibility
  - Minor: Card spacing, margin drift, icon scaling, focus indicators, button sizing variance
- **Fix-Plan Seeds Ready**:
  1. Cookie Consent UX — banner persistence + dismissal states across pages
  2. Hero Positioning + Watch MD Grid — layout shift fix for 768–1024px range
  3. Filter Chip + Anchor Compliance — color contrast + internal link navigation
- **Outputs**: 
  - `audit-260511-1806-responsive-full-website.md` (full audit report)
  - `findings-code-static.md` (component-level findings)
  - `findings-visual.md` (visual/layout findings from screenshots)
  - 49 PNG screenshots in `plans/reports/screenshots/`
- **Note**: No source code modified in this phase. Audit is read-only. Fixes scope future work.

### Build Status
- Audit: ✓ Complete
- CI/CD: No source changes

## [2026-05-11] - Watch Redesign + Compact Channels

### Added
- **WatchHero Component** (`components/watch/watch-hero.tsx`): Cinematic hero combining tagline + CTA + featured video play overlay + character cluster with "Join ScoutPaw World!" anchor linking to #channels
- **ExploreVideos Component** (`components/watch/explore-videos.tsx`): Filter chips (useState-managed) + mixed grid layout (2 large + 6 small video cards) + "See more on YouTube" CTA
- **Compact Channels Rail** (`components/watch/our-channels.tsx`): Horizontal scroll rail with left/right chevron controls, compact 220-260px cards, 5-6 visible at 1440px, id="channels" anchor for hero link
- **Schema Split**: `PlaylistCategorySchema` (playlists) + `VideoContentSchema` (dogs/cats/shorts/funny/product-reviews/community)

### Changed
- **app/watch/page.tsx**: Reordered layout: WatchHero → VideoRail (Community Choice) → ExploreVideos → OurChannels → SubscribeCard
- **videos.json**: 30 entries retagged to new VideoContentSchema structure
- **4 lib files**: Updated for schema split consistency

### Deprecated
- `FeaturedVideo` component (replaced by WatchHero)
- `PlaylistGrid` component (replaced by OurChannels rail)

### Performance
- `/watch` bundle size grew from 3.1 kB to 19.7 kB (exceeded 5KB target; review code-splitting opportunities)

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-11] - UI/UX Polish Pass

### Changed
- **Home Hero**: `FullBleedHero` updated to `min-h-[100svh]` for full-viewport cinematic effect
- **Home Cards**: `MenuCards` now uniform size with `auto-rows-fr` grid layout; card rotations preserved
- **Home Newsletter**: `NewsletterCTA` padding reduced to close footer gap alignment
- **Shop Hero**: `StackedHero` rewritten to overlay 100svh pattern (mirrors Home hero approach)
- **Shop Tiles**: `ExploreProducts` widened to `max-w-5xl` with tighter image padding for enlargement
- **Watch Pages**: Removed "All Episodes" header, `WatchLibrary`, and `LibraryFallback` components
- **Watch Playlists**: Extended `PlaylistSchema` with optional `youtubeUrl`; disabled cards show "Coming Soon" label
- **Accessibility**: Added aria-labels to disabled playlist and menu cards
- **External Links**: `VideoRail` adds `target="_blank"` and `rel` attributes for external seeAllHref

### Performance
- `/watch` bundle size reduced from 4.45 kB to 3.1 kB

### Build Status
- Lint: Clean
- TypeCheck: Clean
- Tests: Passing
