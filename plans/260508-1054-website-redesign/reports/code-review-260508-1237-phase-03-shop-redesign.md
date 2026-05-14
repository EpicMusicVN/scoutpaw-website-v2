---
type: code-review
phase: 3
slug: phase-03-shop-redesign
date: 2026-05-08
reviewer: code-reviewer
status: BLOCKED
---

# Phase 3 Shop Redesign — Code Review

## Scope

- 1 created file (`lib/shopify/categorize.ts`)
- 1 modified entrypoint (`app/shop/page.tsx`)
- 6 modified components (`explore-products`, `product-card`, `product-grid`, `about-shop`, `buy-now-button`, plus reuse of `cinematic-hero` + `hero-character-cluster` from P2)
- Author verified `pnpm typecheck` + `pnpm build` pass; shop first-load JS 167 KB (+1 KB)

## Overall Assessment

The component composition is clean — sensible split between the server-rendered shop page and the new `ProductGrid` client island, well-typed `categorizeProduct` helper, fixture data that exercises every category, and reasonably accessible filter chip buttons. **The P1/P2 C2 token blocker is fully resolved**: `app/globals.css` now ships `--*-rgb` sibling triplets and `tailwind.config.ts` wraps every token in `rgb(var(--…-rgb) / <alpha-value>)`. Verified `.bg-ink/85`, `.text-ink/{15,20,…,90}`, `.border-ink/10`, `.bg-honey`, `.bg-surface/95` etc. all emit in `.next/static/css/c9585e4423f01c84.css`. The home-page hierarchy bugs from P2 should now render as designed.

**However, two findings block ship.**

The first is the **`#products?cat=plushes` href** in `ExploreProducts`. Browsers and `next/link` parse the `?` as part of the hash fragment, not as a query string — `searchParams.get("cat")` resolves to `null` and the browser scrolls to an element with `id="products?cat=plushes"` that doesn't exist. The Explore Products tile click is a complete no-op for both filtering and scrolling. This is the single most prominent navigation affordance of the new section.

The second is the **`useSearchParams()` Suspense gap**. `ProductGrid` is now a client component that calls `useSearchParams()` directly. Per Next.js 15 App Router contract, this must be wrapped in a `<Suspense>` boundary or the client subtree opts the route out of static prerender. The build did not throw because `app/shop/page.tsx` already declares `export const revalidate = 300` (the bailout error is suppressed when `forceStatic` is unset and `isStaticGeneration` is gated by ISR), but on the rendered page the chip row hydrates with `filter = "all"` and only flips to the URL-derived filter on `useEffect` mount — producing a visible flicker for users who land on `/shop?cat=plushes` directly. Wrapping in Suspense (with the chip row visible inside the boundary) is the documented fix.

After these two are addressed, three medium issues and a handful of polish nits remain.

---

## Critical Issues

### C1. `ExploreProducts` href `#products?cat=<category>` is parsed as a single hash fragment — neither scroll nor filter works
**File:** `components/shop/explore-products.tsx:69`

```tsx
<Link href={`#products?cat=${tile.category}`} scroll={false} ... />
```

Verified parsing:

```js
new URL('#products?cat=plushes', 'https://example.com/shop')
// → href:    'https://example.com/shop#products?cat=plushes'
// → hash:    '#products?cat=plushes'   ← whole thing inside the fragment
// → search:  ''                         ← empty
```

Consequences:
1. **Filter never applies.** `useSearchParams()` reads `location.search`, not `location.hash`. `searchParams.get("cat")` returns `null` after the click → `ProductGrid` keeps `filter = "all"`.
2. **Scroll target missing.** The browser will look for an element with `id="products?cat=plushes"` (the literal hash fragment). The actual section uses `id="products"`. Scroll fails silently.
3. **`scroll={false}` doesn't help** — that disables Next's scroll-to-top behavior between routes. Within the same route Next still relies on the browser's hash-scroll, which finds nothing.

This is the single most prominent CTA on the new ExploreProducts section. Every tile click is a no-op.

**Recommended fix — pick one:**

A. **Real query string + manual scroll (preferred — works with native back/forward, shareable URLs):**
```tsx
"use client";
import { useRouter } from "next/navigation";

const router = useRouter();
const onTileClick = (cat: ShopCategory) => {
  router.push(`/shop?cat=${cat}#products`, { scroll: false });
  document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

// then on the tile:
<button type="button" onClick={() => onTileClick(tile.category)} ... />
```
This makes `ExploreProducts` a `"use client"` component (small bundle cost, ~1KB), but the URL becomes `?cat=plushes#products` — `useSearchParams()` reads `cat`, the hash takes the user to the grid, the back button restores the prior filter, and the page is shareable.

B. **Hash-only with a custom listener (server-friendly, less robust):**
```tsx
href={`#products-${tile.category}`}
// then in product-grid.tsx:
useEffect(() => {
  const m = window.location.hash.match(/^#products-(\w+)$/);
  if (m && (SHOP_CATEGORIES as readonly string[]).includes(m[1])) {
    setFilter(m[1] as ShopCategory);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  }
  const onHash = () => { /* same logic */ };
  window.addEventListener("hashchange", onHash);
  return () => window.removeEventListener("hashchange", onHash);
}, []);
```
Keeps `ExploreProducts` server-rendered. Loses query-string semantics; URLs of the form `/shop#products-plushes` aren't picked up by `useSearchParams`.

Severity: **Critical** — the centerpiece "browse by category" affordance does nothing. Visible regression on every ExploreProducts click.

---

### C2. `ProductGrid` calls `useSearchParams()` without a `<Suspense>` boundary
**File:** `app/shop/page.tsx:90`, `components/shop/product-grid.tsx:18`

Next.js 15.0.3 (verified in `package.json:18`) treats `useSearchParams()` inside a client component as a CSR-bailout hook (`node_modules/next/dist/client/components/navigation.js:79-101` → `bailout-to-client-rendering.js:13-17`). When the parent server component is statically generated, Next throws `BailoutToCSRError` unless wrapped in `<Suspense>`. The error is suppressed in this codebase only because `app/shop/page.tsx:14` declares `export const revalidate = 300` (ISR — `workStore.forceStatic` is `false`, `workStore.isStaticGeneration` toggles via the ISR path), so the build went green. The behavior at runtime is still broken:

1. **First-paint flicker:** SSR emits `searchParams = null` (server-rendering branch returns `null`); the chip row mounts with `filter = "all"`, then `useEffect` runs on hydration and flips the chip to the URL-derived value. Users landing on `/shop?cat=apparel` see "All" highlighted for ~50–200ms before the correct chip swaps in.
2. **Static prerender deopts.** Per Next.js 15 docs, an unwrapped `useSearchParams()` opts the entire client subtree out of static prerender — the parent server component still renders statically (so `/shop` still shows `○ (Static)` in the build output), but the client island below the boundary CSR-renders. That's why the entry shows `2.4 kB` page payload + `167 kB` first-load JS — the Suspense fallback is implicit (empty), and there's no loading state for the chip row + grid until JS executes.
3. **Future Next upgrade risk.** Next.js 15.1+ tightened this — even ISR routes warn `missing-suspense-with-csr-bailout` when `useSearchParams()` is unwrapped. The next minor bump will surface the warning.

**Recommended fix:**
```tsx
// app/shop/page.tsx
import { Suspense } from "react";

// ... inside the products section:
{products.length === 0 ? (
  <div className="mt-12">
    <ShopEmptyState />
  </div>
) : (
  <Suspense
    fallback={
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {/* match the chip row layout so the page doesn't reflow on hydration */}
        <div className="h-10 w-16 animate-pulse rounded-full bg-base" />
        <div className="h-10 w-24 animate-pulse rounded-full bg-base" />
        <div className="h-10 w-24 animate-pulse rounded-full bg-base" />
        <div className="h-10 w-20 animate-pulse rounded-full bg-base" />
        <div className="h-10 w-28 animate-pulse rounded-full bg-base" />
      </div>
    }
  >
    <ProductGrid products={products} />
  </Suspense>
)}
```

Better yet — extract the `useSearchParams` read into a tiny `<CategoryFilter>` client component and let `<ProductGrid>` accept the resolved `cat` as a prop:

```tsx
// product-grid.tsx — keep as client, but accept initial filter:
export function ProductGrid({ products, initialCat }: { products: ShopProduct[]; initialCat?: ShopCategory }) {
  const [filter, setFilter] = useState<FilterValue>(initialCat ?? "all");
  // …no useSearchParams needed if you pass cat in from the page
}

// app/shop/page.tsx — read searchParams from the page-level ServerComponent props
export default async function ShopPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const initialCat = (SHOP_CATEGORIES as readonly string[]).includes(cat ?? "")
    ? (cat as ShopCategory)
    : undefined;
  // …
  <ProductGrid products={products} initialCat={initialCat} />
}
```

That's cleaner: server reads the query param via the page's `searchParams` prop (no `useSearchParams` hook needed at all), passes it down. The page becomes dynamic on render (`searchParams` is dynamic), but ISR caching still applies for the products fetch.

Severity: **Critical** — runtime UX flicker is observable; future Next upgrade will turn this into a build warning. Pick one of the two fixes (Suspense wrap, or server-prop pattern). The server-prop pattern is structurally better and unblocks shareable `/shop?cat=plushes` URLs once C1 also lands.

---

## High Priority

### H1. `categorizeProduct` substring matching produces false positives on common short keywords
**File:** `lib/shopify/categorize.ts:31-44`

The keyword set includes 3-character substrings that appear inside unrelated words:

| Keyword | Category | False positives |
|---|---|---|
| `"art"` | prints | depart, smart, cart, start, party, charts, **`Apartment Print`** matches twice — once via "apartment"→"art", once via "print" → both prints, OK by luck |
| `"hat"` | apparel | hatch, **`What`'s New Mug** → "what" → apparel, **wrong** (mug is accessories) |
| `"cap"` | apparel | escape, capture, capsule — **`Escape Print`** → "escape" → apparel, **wrong** (print) |
| `"toy"` | plushes | mostly safe; "story" is s-t-o-r-y so no match. OK. |
| `"tee"` | apparel | teeth, fifteen, between — **`Teether Plush`** → matches both "tee" (apparel) and "plush" (plushes); apparel wins because plushes is iter 1 catches "plush" first → actually plushes wins. OK by iteration order. |
| `"bag"` | accessories | **`Banbagra`** etc. — nothing realistic. OK. |
| `"pin"` | accessories | spinning, pinch, **`Spinning Top Plush`** → "spinning" → accessories, **wrong** (plush) — but "plush" matches first in iter 1, so plushes wins. OK by iteration order. |
| `"sock"` | apparel | unsock-able. OK. |
| `"mug"` | accessories | mugger, mugshot. Probably OK. |
| `"card"` | prints | discard, **`Discarded Plush`** → "card" → prints, **wrong** — but "plush" is iter 1, plushes wins. OK by iteration order. |
| `"cap"` | apparel | **`Escape Mug`** → "cap" → apparel (iter 2) before "mug" → accessories (iter 4) — **wrong**. |

The "OK by iteration order" cases are silent fragility — they only work because `plushes` is the first iteration and most plush-named items contain "plush". The moment a plush product is named without the word "plush" (e.g. "Buddy Stuffed Friend"), substring conflicts will fire on the apparel/print pass.

The mock data (`mock-products.ts`) categorizes correctly today, so this is a forward bug. But the algorithm shape is what's wrong: substring `includes()` over a flat haystack should be word-boundary matching.

**Recommended fix — split haystack into tokens and match whole words:**
```ts
const WORD_RE = /[a-z0-9]+/g;

export function categorizeProduct(product: ShopProduct): ShopCategory {
  const words = new Set(
    [...product.tags.map((t) => t.toLowerCase()), product.title.toLowerCase()]
      .join(" ")
      .match(WORD_RE) ?? []
  );

  for (const cat of SHOP_CATEGORIES) {
    if (words.has(cat)) return cat;
    for (const keyword of KEYWORD_MAP[cat]) {
      // keyword may itself be multi-word ("soft toy"); fall back to substring for those
      if (keyword.includes(" ") ? [...words].join(" ").includes(keyword) : words.has(keyword)) {
        return cat;
      }
    }
  }
  return "accessories";
}
```

This is order-of-magnitude more reliable. Cost: one regex split per product, run once at module init via the existing `useMemo` in `product-grid.tsx:32`.

Also: the `"card"` keyword in `prints` is risky even with whole-word matching — a "Greeting Card" is debatable as a print. Consider whether `card` should be in `accessories` instead. (Convention call, not a bug.)

Severity: **High** — silent miscategorization the moment Shopify product names diverge from mock data. Easier to fix now than during the Storefront cutover.

---

### H2. Shop hero `AtmosphereLayer` variant doesn't match plan + spec — uses `honey`, plan calls for `peach`
**File:** `components/home/cinematic-hero.tsx:54`, `phase-03-shop-redesign.md:36`

Plan says: `AtmosphereLayer variant peach`. Implementation hard-codes `variant="honey"` for both Home and Shop. There's no prop to override it on the Shop call site (`app/shop/page.tsx:40-59`). This means:

- Both pages share identical paw/dust/cloud palette.
- Visual differentiation between Home and Shop heroes is reduced to the hero text + character. The atmospheric warmth that was supposed to signal "you're now in the shop" is missing.

**Recommended fix:** add an `atmosphere?: "honey" | "peach" | "sky" | "sage" | "warm-tan"` prop to `CinematicHero` (default `"honey"`, optional override for Shop = `"peach"`). One-line addition; the component already imports `AtmosphereLayer`.

```tsx
// cinematic-hero.tsx
export function CinematicHero({
  // …
  atmosphere = "honey",
}: {
  // …
  atmosphere?: "honey" | "peach" | "sky" | "sage" | "warm-tan";
}) {
  // …
  <AtmosphereLayer variant={atmosphere} density="med" />
}

// app/shop/page.tsx
<CinematicHero atmosphere="peach" ... />
```

Severity: **High** — plan deviation; Shop hero looks identical to Home hero except for the text panel and the supporting/primary character swap.

---

### H3. `app/shop/loading.tsx` skeleton does not match the new section structure
**File:** `app/shop/loading.tsx:9, 26, 31, 39`

The skeleton renders against the OLD shop layout:
- Hero uses `bg-warm-tan` while the actual hero is `bg-base` with a `honey` atmosphere → visible color flash on transition.
- Container width: skeleton uses `max-w-7xl` (1280px) but every shop section now uses `max-w-hero` (1400px) → 120px horizontal layout shift on hydration at xl viewports.
- ExploreProducts skeleton is a 1-column → 2-column grid; the actual section is 2 → 4 columns at `lg`. Mismatch on tablet/desktop.
- ProductGrid skeleton is a 2-column → 3-column grid; the actual is 1 → 2 → 3. Mobile mismatches.

Loading skeletons are exactly the place a layout-shift bug hides — `pnpm build` doesn't enforce visual parity. Verify in dev by `await new Promise(r => setTimeout(r, 2000))` in `app/shop/page.tsx`'s data fetch and watch the hydration jolt.

**Recommended fix:** rewrite `loading.tsx` to mirror the new structure (hero with honey atmosphere on `bg-base`, `max-w-hero` containers, matching grid breakpoints).

Severity: **High** — visible content reflow on every navigation to `/shop`, including back/forward.

---

## Medium Priority

### M1. Shop hero + ProductGrid + ExploreProducts + AboutShop all sit on one continuous cream wash with no visual separators
**Files:** `app/shop/page.tsx:38-97`, `components/shop/explore-products.tsx:52`, `components/shop/about-shop.tsx:59`

The flow:
- `<CinematicHero>` — `bg-base`
- `<ExploreProducts>` — no bg (inherits body `bg-base`)
- `<ProductGrid section>` — no bg (inherits body)
- `<AboutShop>` — no bg (inherits body)
- `<NewsletterCTA>` — gradient + SectionCurves (this one DOES have visual separators)

The home page (P2) breaks rhythm with `SectionCurve` top/bottom on `<FeaturedPupSpotlight>`, `<FeatureBanner>`, and `<NewsletterCTA>`, and uses gradient backgrounds inside those sections to differentiate. The Shop page has no such separators between Hero → ExploreProducts → ProductGrid → AboutShop. Visually, the four sections merge into a single warm cream sheet broken only by the colored stickers/cards inside each section.

The plan called for `AboutShop` and `ExploreProducts` to feel like distinct stations. They don't read distinct in the current layout — they read like a long strip of decorated cards.

**Recommended fix — pick one:**
- Add `bg-honey` or `bg-warm-tan` to one of `ExploreProducts` or `AboutShop` so two adjacent sections aren't both cream. Add `SectionCurve` top/bottom on whichever you tint.
- Or: alternate the colored-tile sections (Explore tiles → cream; ProductGrid → tinted; AboutShop → cream; Newsletter → gradient).

Severity: **Medium** — visual rhythm / hierarchy concern, not a functional bug.

---

### M2. `ProductGrid` re-syncs from URL on every render of the parent — runs `categorizeProduct` on `[products]` only, but the URL effect re-fires on every search-params change
**File:** `components/shop/product-grid.tsx:22-29`

```tsx
useEffect(() => {
  const cat = searchParams.get("cat");
  if (cat && (SHOP_CATEGORIES as readonly string[]).includes(cat)) {
    setFilter(cat as ShopCategory);
  } else if (!cat) {
    setFilter("all");
  }
}, [searchParams]);
```

Two issues:
1. **`searchParams` is a `ReadonlyURLSearchParams` instance.** Each navigation creates a new instance even when the URL is identical, which means `[searchParams]` triggers the effect on every router change anywhere on the page (not just `?cat`). Cheap effect, but redundant. Stable dep would be `searchParams.get("cat")`:
   ```tsx
   const cat = searchParams.get("cat");
   useEffect(() => {
     if (cat && (SHOP_CATEGORIES as readonly string[]).includes(cat)) {
       setFilter(cat as ShopCategory);
     } else if (!cat) {
       setFilter("all");
     }
   }, [cat]);
   ```
2. **State sync direction is one-way.** Clicking a chip changes `filter` (local state) but does NOT update the URL. Refresh the page → URL has no `?cat=` → filter resets to "all". This loses the user's filter when they reload, share, or navigate back. Either:
   - Document this as intentional (per plan risk #2: "Filter state lost on page reload — acceptable for MVP"), or
   - Push to the URL on chip click via `router.replace(`/shop?cat=${filter}#products`, { scroll: false })`.

Combined with C1, fixing both gets you full URL-state filter + tile-click + share-link.

Severity: **Medium** — local state reset on reload + over-eager effect.

---

### M3. `ProductCard` renders the placeholder coming-soon path with two coexisting "Coming Soon" treatments
**File:** `components/shop/product-card.tsx:81-86, 115-118`

When `isPlaceholder` (mock data: `onlineStoreUrl === "#mock-store"`):
1. Top-left of image: a small ink-on-cream pill saying "Coming Soon" (line 83-85).
2. Bottom of card: a full-width pill saying "Coming Soon" (line 115-118).

Both render at the same time. The user sees two "Coming Soon" labels per card. The CTA pill at the bottom (intended to look like the Buy Now button but disabled) communicates the state most clearly; the top-left badge is redundant.

Also: the card itself is an `<a>` (Next `<Link>`) with `href="#"` → clicking a placeholder card scrolls to the top of the page (the `href="#"` empty anchor behavior). The label on it correctly announces `(coming soon)` via `aria-label` (line 56), but the click is still navigable and goes nowhere useful. Consider either:
- Render the placeholder as a `<div>` (no link, no `<a>`) when `isPlaceholder`, or
- Add `onClick={(e) => isPlaceholder && e.preventDefault()}` so the click is a no-op.

**Recommended fix:**
```tsx
// drop the top-left badge; the bottom CTA already conveys state
{/* Coming-soon badge — placeholder products only */}
- {isPlaceholder && (
-   <span className="absolute left-4 top-4 ...">Coming Soon</span>
- )}

// then in the wrapper:
{isPlaceholder ? (
  <div className="group ..." aria-label={...}>{children}</div>
) : (
  <Link href={buyHref} target="_blank" rel="noopener noreferrer" ...>{children}</Link>
)}
```

Severity: **Medium** — UX clarity + dead-link click behavior.

---

### M4. `ProductCard` price pill is `aria-hidden="true"` — screen readers never hear the price
**File:** `components/shop/product-card.tsx:74-79`

```tsx
<span aria-hidden="true" className="absolute right-4 top-4 ...">
  {price}
</span>
```

The price is the second-most-important piece of information after the product name. Hiding it from AT means screen-reader users have to follow the link to Shopify just to learn the price. The `aria-label` on the parent `<Link>` includes the title and "(coming soon)" but **does not include the price**.

**Recommended fix:**
```tsx
<span className="absolute right-4 top-4 ..." aria-label={`Price: ${price}`}>
  {price}
</span>

// And include price in the link aria-label:
aria-label={`Buy ${product.title} for ${price}${isPlaceholder ? " (coming soon)" : " on Shopify"}`}
```

Severity: **Medium** — a11y regression for the most important purchase info.

---

### M5. `getCharacters()` called twice per Shop request
**File:** `app/shop/page.tsx:23`, also `app/page.tsx` (home)

Each route's server component calls `await content.getCharacters()` independently. Already flagged as a question in the P2 review (Q3). Phase 3 didn't introduce the duplication but inherits it. If `lib/content` doesn't memoize via React's `cache()`, the JSON is parsed twice per home request and once per shop request. Ride a follow-up; not P3-specific.

Severity: **Medium** — out of P3 scope; flagged for the next perf pass.

---

## Low Priority

### L1. `ExploreProducts` "Some categories haven't been mapped to tiles yet" message is dead code
**File:** `components/shop/explore-products.tsx:107-111`

```tsx
{SHOP_CATEGORIES.length !== TILES.length && (
  <p>Some categories haven't been mapped to tiles yet.</p>
)}
```

Both arrays are statically sized in code that ships together; the condition is unreachable. If the constants ever drift, the message would silently fix nothing — it'd render below the tiles, not in the missing slot. Either delete the block, or convert it to a build-time invariant via TypeScript (`type Assert<T extends true> = T; type _ = Assert<typeof TILES["length"] extends typeof SHOP_CATEGORIES["length"] ? true : false>;`).

Severity: **Low** — dead code.

---

### L2. `AboutShop` icons render a stale closure pattern (`Icon: () => PAW_ICON`)
**File:** `components/shop/about-shop.tsx:35, 41, 47`

```ts
const PILLARS: Pillar[] = [
  { /* … */ Icon: () => PAW_ICON },
  { /* … */ Icon: () => HOME_ICON },
  { /* … */ Icon: () => BAG_ICON },
];

// then:
<pillar.Icon />
```

`PAW_ICON` is a `React.ReactElement`, not a component. Wrapping it in `() => PAW_ICON` returns the same element on every render — that's fine functionally, but the type `Icon: () => React.ReactElement` is misleading: it suggests a component that produces JSX. Cleaner:

```tsx
type Pillar = {
  title: string;
  body: string;
  icon: React.ReactElement;
  bg: string;
};

const PILLARS: Pillar[] = [
  { title: "…", body: "…", icon: PAW_ICON, bg: "var(--bg-honey)" },
  { /* … */ },
];

// render: { pillar.icon }
```

Severity: **Low** — code clarity nit.

---

### L3. `ProductCard` index-based tile background coupling is fragile
**File:** `components/shop/product-card.tsx:19-24, 42`

```ts
const tileBackgrounds = ["var(--bg-warm-tan)", "var(--bg-honey)", "var(--bg-soft-sky)", "var(--bg-peach)"];
const tileBg = tileBackgrounds[index % tileBackgrounds.length];
```

Tile bg cycles by position in the rendered list. After filtering, the visible list shrinks, so the colors reshuffle per filter — clicking "Plushes" might show the same product against a peach bg, then clicking "All" shows the same product against warm-tan. Distracting visual reflow. Consider deriving the bg from a stable hash of `product.id` (e.g. character code sum mod 4) so each product always gets the same color.

```ts
function tileBgFor(productId: string): string {
  const hash = [...productId].reduce((a, c) => a + c.charCodeAt(0), 0);
  return tileBackgrounds[hash % tileBackgrounds.length];
}
```

Severity: **Low** — subtle UX polish.

---

### L4. `ProductCard` `Coming Soon` placeholder pill text is too small (`text-[10px]`)
**File:** `components/shop/product-card.tsx:83`

10px is below WCAG recommended minimum body text size for some platforms (esp. older Android/Chrome which scale below 12px aggressively). The overlay sits on a darker `bg-ink/85` pill so contrast is OK. Consider `text-xs` (12px) at minimum.

Severity: **Low** — accessibility polish.

---

### L5. `ScrollReveal` wrapping every shop section may make the whole page feel "delayed"
**File:** `app/shop/page.tsx:61, 67, 95, 99`

Four `<ScrollReveal>` wrappers on Shop, plus the hero (which has its own `motion.div` entrance). On mobile or on slow scroll, this stacks four 0.7s fade-up animations sequentially. Compare to home where the hero is bare and only the framed sections (Buddy spotlight, feature banner, video-grid, newsletter) get reveals — Shop has wraps on every section including ExploreProducts, which would otherwise be the first content the user sees after the hero.

Recommend dropping `ScrollReveal` from `<ExploreProducts>` (the first below-hero section, where reveal feels like a pop) and only revealing `AboutShop` + `NewsletterCTA`. The product grid is already lifted by card hover affordances; the section header doesn't need an additional fade.

Severity: **Low** — motion saturation; subjective.

---

### L6. `BuyNowButton` is dead code — replaced by inline span in `ProductCard`
**File:** `components/shop/buy-now-button.tsx:1-35`

`ProductCard` (lines 119-126) renders the Buy Now treatment as an inline `<span>` inside the parent `<Link>`, not by composing `<BuyNowButton>`. The phase plan said "Apply new sticker style" to `BuyNowButton`; the actual implementation moved the styling into `ProductCard` and left `BuyNowButton` as orphan code.

Verified: no callers in `app/`, `components/`, or `lib/` import `buy-now-button`. The file is unreferenced.

```bash
$ grep -rn "BuyNowButton\|buy-now-button" app components lib
components/shop/buy-now-button.tsx:6:export function BuyNowButton({
# no other matches
```

The plan modification list claims this file was "MODIFIED: components/shop/buy-now-button.tsx (size lg)" — confirmed, but the modification doesn't matter because nothing renders it. Either:
- Delete the file (preferred — YAGNI), or
- Refactor `ProductCard`'s Buy Now span into a call to `<BuyNowButton>` so the component earns its keep.

Severity: **Low** — dead code, ~35 LOC.

---

### L7. `ExploreProducts` tile uses `aspect-[4/5]` (taller than wide) but the plan called for "square aspect"
**File:** `components/shop/explore-products.tsx:72`, `phase-03-shop-redesign.md:43`

Plan: "Each: square aspect, accent bg, illustrated/photo icon, title, hover settle."
Impl: `aspect-[4/5]` (taller). Visually this works for the bottom label panel, but contradicts the spec. If intentional, update the plan; if not, change to `aspect-square`.

Severity: **Low** — plan deviation.

---

## Edge Cases Found by Scout / Hand-trace

- **Hero pre-rendering:** `HeroCharacterCluster` is `"use client"` but the `mounted` flag (line 22-23) gates animations correctly — SSR markup matches the static initial state. No hydration mismatch. P2 H1 is properly addressed. ✓
- **Hero `priority` deduplication:** `HeroCharacterCluster` only sets `priority` on the primary pup (line 65), supporting pup uses default lazy. P2 H2 fixed. ✓
- **`ShopEmptyState` is a server component** (no `"use client"`) — rendered conditionally by the page based on `products.length === 0`. Renders BEFORE `ProductGrid` mounts, so the path correctly avoids the client-grid render entirely when empty. ✓
- **`NewsletterCTA` reuse on Shop:** passes `tag="shop-newsletter"` for analytics partition and overrides `heading`/`subheading`. Verified the props are forwarded correctly in P2's component. ✓
- **`AtmosphereLayer` SSR-safe:** P1 deterministic seed math is intact. No hydration warnings introduced by hero reuse on Shop.
- **Filter chip a11y:** `aria-pressed={active}` is the correct ARIA pattern for toggle-button group. Filter chip layout uses a `<div>` not `<ul>`, which is fine — the chips function as a toggle-button group, not a list.
- **`<ul>` in `ProductGrid`:** `aria-live="polite"` on the product list (line 68) re-announces the list on every filter change. That's chatty for screen readers — every chip click triggers an SR announcement of the entire list. Consider `aria-live="polite"` on a separate hidden status region that just reads "Showing N plush products" instead.
- **`focus-visible:ring-offset-base` on tiles + cards:** the offset color is the cream body color, which gives a clean halo on the warm tile bg. Verified contrast in shipped CSS. ✓
- **`href={buyHref}` with `buyHref = "#"` placeholder:** when mock data has `onlineStoreUrl: null`, the `href="#"` falls back. Click scrolls to top of page. See M3.
- **`<Link target="_blank">` security:** correctly paired with `rel="noopener noreferrer"` (line 50). ✓
- **`track("BuyNowClick", ...)`:** fires only when `!isPlaceholder` (correct — don't pollute analytics with mock clicks). ✓
- **No new dependencies.** Verified by `package.json` diff.

---

## Backwards Compatibility / Regressions

- ✅ `<CinematicHero>` API: no breaking changes; Shop now passes `media={<HeroCharacterCluster ... />}` — same surface added in P2.
- ✅ `<ProductGrid>` was a server component → now `"use client"`. Its only caller (`app/shop/page.tsx`) was already passing `products` as a prop; the prop shape is unchanged. No external callers.
- ✅ `<ProductCard>` was a server component → now `"use client"`. Used only by `<ProductGrid>`. Prop shape unchanged.
- ⚠️ `<BuyNowButton>` no longer rendered anywhere (L6). Not a regression but dead code.
- ✅ `categorizeProduct` is a new pure function; safe to add.

---

## Acceptance Criteria Cross-check (from phase-03-shop-redesign.md)

| Criterion | Status |
|---|---|
| Shop hero zoning matches Home (no text/character overlap) | ✅ uses same `CinematicHero` grid |
| 4 category sticker tiles render w/ hover settle | ⚠️ render OK, click is no-op (C1) |
| Filter chips functional: All + 4 categories | ⚠️ chips work; URL sync broken on mount (C2 flicker, M2 no write-back) |
| Product card: sticker style, price pill, Buy Now visible AA contrast | ⚠️ price hidden from AT (M4); double "Coming Soon" labels (M3) |
| About section: 3 trust pillars, equal column heights | ✅ `h-full` + `flex flex-col` |
| Buy Now opens Shopify in new tab (analytics event still fires) | ✅ `target="_blank"`, `track("BuyNowClick")` |
| Empty state renders when products array empty | ✅ ServerComponent path preserved |
| Lighthouse mobile perf ≥ 85 | ⚠️ not run (P5); H3 layout shift will hurt CLS |
| Axe: zero AA violations | ⚠️ not run; M4 (price aria-hidden) is a likely violation |

---

## Recommended Actions (Prioritized)

1. **C1: Fix the `#products?cat=…` href.** Either change `ExploreProducts` tiles to client buttons that `router.push("/shop?cat=…#products")` and scroll, OR use `#products-<cat>` hash with a `hashchange` listener in `ProductGrid`. The query-string + scroll approach is preferred because it works with back/forward and shareable URLs.
2. **C2: Wrap `<ProductGrid>` in a `<Suspense>` boundary** in `app/shop/page.tsx`, OR refactor `ShopPage` to read `searchParams` from the page-level prop and pass `initialCat` down (eliminates `useSearchParams` entirely). Server-prop pattern is structurally cleaner.
3. **H1: Switch `categorizeProduct` to whole-word matching.** ~10 LOC change in `categorize.ts`. Pre-empts a hard-to-debug class of categorization bugs.
4. **H2: Add `atmosphere` prop to `CinematicHero`** and pass `"peach"` from the Shop page. One-line addition + one-line override.
5. **H3: Rewrite `app/shop/loading.tsx`** to mirror the new section structure (`max-w-hero`, honey atmosphere on `bg-base`, matching grid breakpoints).
6. **M1: Tint one of `ExploreProducts` or `AboutShop`** (e.g. `bg-honey` with `SectionCurve` top + bottom) so the four cream sections don't merge.
7. **M2: Use `searchParams.get("cat")` as a stable effect dep** in `ProductGrid`, and write filter changes back to the URL via `router.replace`.
8. **M3: Drop the top-left "Coming Soon" pill** in `ProductCard` and render placeholders as `<div>` instead of `<Link>` to neutralize the dead-end click.
9. **M4: Include price in the card's `aria-label`** and remove `aria-hidden` from the price pill (or change it to `aria-label="Price: $24"`).
10. **L6: Delete `components/shop/buy-now-button.tsx`** (unreferenced) OR refactor `ProductCard` to use it.
11. (Optional) **L1, L2, L3, L4, L5, L7:** polish nits, batch into a follow-up.

---

## Metrics

- New files: 1 (`categorize.ts`, 49 LOC)
- Modified files: 6
- Deleted files: 0
- New dependencies: 0 ✅
- TypeScript errors: 0 ✅ (per author + verified `pnpm build` passes)
- Compile errors: 0 ✅
- Opacity utilities now shipping in CSS (P2-C2 carry-over check): **all 19 verified** (`bg-ink/{0,5,10,30,40,80,85,95}`, `border-ink/{10,15,20,30,45}`, `text-ink/{15,20,40,45,55,60,65,70,75,80,85,90}`) — P2 blocker is RESOLVED ✅
- Visible regressions on Shop page: **C1 (tile clicks no-op), C2 (filter flicker), H3 (layout shift on transition)**
- A11y new concerns: 1 (M4 price hidden from AT)
- Dead code introduced: 1 file (L6 `BuyNowButton`)

---

## Unresolved Questions

1. Was visual QA performed on `/shop` and `/shop?cat=plushes` in a real browser? `pnpm build` and `pnpm typecheck` don't catch C1, C2 flicker, or H3 layout shift. Suggest `pnpm dev` + clicking each ExploreProducts tile and verifying URL + scroll + filter all happen.
2. Is the URL state intentionally non-persistent (per plan risk #2: "Filter state lost on page reload — acceptable for MVP"), or was the `useSearchParams()` introduction intended to fix that? Current implementation is in the awkward middle — reads URL on mount, doesn't write back. Pick one direction.
3. The plan brief mentioned a `brainstorm-260508-1054-website-redesign.md` reference; that file is not at the path given. Did anything in the brief specify alternate rules for ExploreProducts navigation (e.g. the "category param" UX) that would change the C1 fix?
4. Should `ProductCard` placeholders be navigable at all (current href="#" scroll-to-top), or rendered as inert `<div>` cards with a Coming Soon CTA?
5. Is the `BuyNowButton` component's continued existence intentional (planned future use) or stale code from before `ProductCard` absorbed the styling?

---

**Status:** BLOCKED
**Summary:** P2-C2 token blocker fully resolved (verified in shipped CSS). Hero animations correctly gated with `mounted` flag. Two new criticals block Phase 3: (1) `ExploreProducts` tile hrefs `#products?cat=X` are parsed as a single hash fragment — neither scroll nor filter fires; (2) `useSearchParams()` is called without a Suspense boundary, producing a chip-state flicker on hydration and a future Next-upgrade warning. Plus four high-priority items: substring-matching false positives in `categorizeProduct`, hero atmosphere variant deviation from plan, stale `app/shop/loading.tsx` skeleton causing layout shift, and price-pill `aria-hidden` from screen readers. After C1+C2 are fixed, the rest are non-blocking polish.
**Concerns/Blockers:** C1 (broken tile hrefs), C2 (missing Suspense). Unblock by swapping the tile click pattern (router.push + scrollIntoView) and either wrapping ProductGrid in Suspense OR refactoring to read `searchParams` from the page-level server prop.
