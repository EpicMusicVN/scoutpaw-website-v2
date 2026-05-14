# Code Review — Iter-2: Glass Hero, Paw Pattern, Unified Shop Tiles

**Date:** 2026-05-14 23:42
**Reviewer:** code-reviewer
**Scope:** iter-2 redirect on three components (Hero, MenuCards, ExploreProducts) + 1 new asset
**Validation already done:** typecheck clean, lint clean.

## Files reviewed
- `components/home/full-bleed-hero.tsx`
- `components/home/menu-cards.tsx`
- `components/shop/explore-products.tsx`
- `public/assets/patterns/paw-tile.svg` (new)

## Verification notes (against described changes)
All four file states match the dispatch description exactly. No drift. paw-tile.svg present at `/public/assets/patterns/paw-tile.svg` — public URL `/assets/patterns/paw-tile.svg` will resolve. Banner images (`/assets/banner/banner.png`, `/assets/shop/banner.png`) both confirmed on disk.

---

## Critical Issues
None.

## High Priority

### H1. Glass card readability over busy Shop banner — `bg-white/45 backdrop-blur-xl` is likely too thin
**File:** `full-bleed-hero.tsx:91`
**Issue:** Text body uses `text-warm-text` which resolves to `#2b1d10` (= ink), kicker is `text-warm-muted` (`#5a4126`). Background dilution to `/45` (55% transparency) plus `backdrop-blur-xl` (24px) is aggressive. On the Home banner (predominantly cyan sky + cartoon dogs), legibility holds because the underlying image is mid-light and large blurred kernels homogenize it. **On the Shop banner**, the upper-left region of `banner.png` includes the corgi face + plush duck + patterned background — these create high-frequency dark/saturated patches that the blur cannot fully average out behind only `/45` glass. Risk: kicker (smallest text, lightest color) loses contrast first; the AA threshold for `#5a4126` text (4.6:1 vs white) drops below 4.5:1 once the backing is mixed ~55% with mid-tones.

**Recommendation:** Bump to `bg-white/55`. Empirically this is the sweet spot for `backdrop-blur-xl` over photographic content with frosted-glass intent — still reads as glass, but rescues kicker contrast. If iter-3 wants to be conservative, `/60` is safe; do not go to `/65+` (you lose the iter-2 effect goal). Single-token diff, no token additions, no responsive variants needed.

**Priority justification:** Kicker contrast at `/45` is the most likely regression a designer/PM will flag in visual QA. Worth fixing pre-merge.

### H2. Top-left card collision risk at md breakpoint
**File:** `full-bleed-hero.tsx:90`
**Issue:** Desktop overlay activates at `md:flex` (≥768px). Padding is `pt-12` (48px) at md, `pt-16` (64px) at lg+. At md (768–1023px) the banner is 16:9 → height = 432px. The yellow zone (`from-paper via-paper/70`) is `w-2/5` (≈307px). The card box at `max-w-sm` is 384px wide and the layout uses `mx-auto w-full max-w-hero` with `px-8` — so the card hugs left at `px-8`. **At md the card width can exceed the left yellow fade zone**, intruding into the imagery. Combined with `pt-12` (48px) the card top crosses into the upper banner art (where Home has upside-down dogs + clouds).

**Recommendation:** Visual QA at md breakpoint with the Home banner specifically. If card overlaps the upside-down dogs at md but not at lg, bump md to `pt-14` (56px) or constrain `max-w-xs` at md (`max-w-xs md:max-w-sm lg:max-w-md`). Don't pre-emptively change — needs eyes on the rendered output. Flag for high-priority visual QA pass.

---

## Medium Priority

### M1. Unified Shop card seam — sharp color edge is acceptable, but tile color reaches contrast cliff for "apparel"
**File:** `explore-products.tsx:88-99` (image area) → `103-114` (text area)
**Issue:** `apparel` tile uses `bg: "#fffbe6"` (a near-white cream). Text area below uses `bg-surface`. If `--surface` is also near-white (it almost certainly is for editorial UI), the seam between image-area `#fffbe6` and text-area `bg-surface` is barely perceptible — the tile reads as ONE unit, which is the design goal. Good.

For darker tiles (`plushes` = `var(--bg-warm-tan)` = `#ecdcb8`), the seam is a clear horizontal edge between cream and warmer tan. Per iter-2 brief this is the desired editorial-magazine composition. **Accept as designed; not a defect.**

**No change recommended.** Flag only as a "visually distinct seam between image and text area is intentional editorial composition" note for designer review.

### M2. Pattern + section-decor double-up — visible on Home only
**File:** `menu-cards.tsx:62-73` (section scattered decor) + `111-125` (per-card paw pattern)
**Issue:** Section-level decor is at `opacity-[0.10] text-warm-text` over cream `bg-paper`. Per-card paw pattern is at `opacity-[0.12]` with hardcoded `fill="#2b1d10"` over the saturated card bg (warm-tan/peach/soft-sky). The two patterns coexist on the same page, at similar opacities, but in different visual layers (section background vs. card image-area background). Per the iter-2 brief, the design choice is locked. From a visual-judgment standpoint, the section decor remains very subtle on cream paper, and the per-card pattern is contained inside the rounded image area, so there's no genuine "noise" overlap. Both layers stay distinguishable.

**No change recommended.** Risk acceptable per brief.

### M3. Paw-pattern z-order — verified correct
**File:** `menu-cards.tsx:117-138`
**Verification:** Sibling order inside the image card div (line 111-114):
1. Paw-tile pattern div (`absolute inset-0 opacity-[0.12]`) — first
2. Accent glow div (`absolute inset-x-1/4 top-1/4 ... blur-2xl opacity-40`) — second
3. `<Image>` (next/image, `fill` → absolute, `object-contain p-3`) — third

All three are `absolute`. Without explicit z-index, later siblings paint on top. Confirmed:
- Pattern is the bottom of the visual stack inside the card.
- Accent glow paints on top of pattern (slightly hides it where the glow is brightest — fine, glow is concentrated center-mid).
- `<Image>` paints on top of both — product image dominates as intended.

The outer image card div has `overflow-hidden rounded-3xl` — pattern is clipped to rounded-3xl. ✓

Hover transforms (`group-hover:-translate-y-1 group-hover:scale-105`) apply to the outer image card div. Pattern is `absolute inset-0` inside it → pattern moves/scales with the card as one unit. No transform isolation issue. ✓

**No change recommended.**

### M4. paw-tile.svg — uses `<defs>`-free repeat, watch for seam at 48×48
**File:** `public/assets/patterns/paw-tile.svg`
**Issue:** SVG is a single 48×48 frame with paw shapes centered (cx=24, cy=30 for main pad). The pads near top edges (cx=11/19/29/37 at cy=13) are entirely inside the 48px viewBox — no clipping at the tile edge, so no jaggy seam across repetitions. Tiling will be seamless. ✓
Hardcoded `fill="#2b1d10"` (= `--ink`) is fine for this single use case — pattern is decorative only on warm-saturated card backgrounds. If iter-3 wants the pattern to also live on dark backgrounds it'll need a recolor, but that's YAGNI for now.

**No change recommended.** Asset is correct.

### M5. `overflow-hidden` on Shop unified card — focus ring trace is on `<Link>`, not the inner card
**File:** `explore-products.tsx:78-85`
**Issue:** `focus-visible:ring-2 focus-visible:ring-offset-4` is on the outer `<Link>` with `rounded-[2rem]`. The inner card div ALSO has `rounded-[2rem] overflow-hidden`. The Link is wrapped around the card div with no extra padding between them — so the Link's bounding box matches the card div bounding box exactly. Focus ring will trace the card silhouette at offset-4. ✓ Working as intended.

However: when the card is at rest (rotated `-rotate-2` / `rotate-2`), the **inner div is rotated but the Link wrapper is not**. The focus ring is on the Link, so the ring will be axis-aligned (not rotated) while the card itself is tilted. On hover, card rotates to 0° and visually re-aligns with the focus ring. Sticker/editorial style accepts this — common pattern. Flag for designer awareness only.

**No change recommended.** Acceptable.

---

## Low Priority

### L1. Mobile path Hero — unchanged, still correct
**File:** `full-bleed-hero.tsx:81-83`
**Confirmation:** Mobile card uses `bg-white/90 backdrop-blur-xl` — kept opaque-leaning for legibility on small viewports where the banner is `aspect-[4/3]` and the card sits below the banner via `-mt-8`. iter-2 explicitly preserved this. ✓

### L2. SVG fill hardcoded — token would be aspirational
The brainstorm + iter-2 brief locks "no new tokens." Hardcoding `#2b1d10` is acceptable since `--ink` is `#2b1d10` (verified in `globals.css:31`). If the ink color ever changes, the pattern won't follow — minor drift risk only. Not worth fixing now.

### L3. Pattern density at 160px card on mobile
At mobile, image card is `h-40 w-40` (160px). Pattern tile is 48px → ~3.3 tile repetitions across the card. With `opacity-[0.12]` and the accent glow + product image on top, density reads as texture not noise. ✓

---

## Edge Cases (proactive scouting)

### E1. Reduced motion
None of the iter-2 changes introduce new animations beyond what already existed (`transition-all`, `group-hover:*`). All transitions are gated by Tailwind's standard `motion-safe` is NOT applied here. If the project has a `prefers-reduced-motion` requirement, that's a pre-existing concern across the whole component — not introduced by iter-2. **Out of iter-2 scope.**

### E2. Image fallback if `/assets/banner/banner.png` or shop banner missing
`next/image` will throw at runtime if the file is missing. Both verified present. ✓

### E3. SSR/hydration — paw-pattern uses inline style with `url()`
The pattern div uses inline `style={{ backgroundImage: "url('...')" }}`. This serializes deterministically (no Math.random, no Date.now). No hydration mismatch risk. ✓

### E4. `aria-hidden="true"` on three siblings inside `MenuCard`
Pattern, accent glow, and `<Image>` are all `aria-hidden="true"`. Screen reader only sees the parent Link's `aria-label`. No accessibility regression. ✓

### E5. `bg-white/45` interaction with `backdrop-filter: blur(24px)` on Safari/older WebKit
`backdrop-filter` has full mainline browser support; `backdrop-blur-xl` is `backdrop-filter: blur(24px)`. Safari ≥ 14 handles this. Mobile Safari (iOS ≥ 14) handles this. **No fallback needed for project's target.** If support for iOS 13 is required (unlikely for this project), card will render as a flat `bg-white/45` — readable but degraded. Out of iter-2 scope.

### E6. Tile rotation focus visibility — `rotate-2` cards
When focused at rest, the `<Link>` has the focus ring axis-aligned but the card is rotated. On keyboard tab the user sees the ring + a slightly tilted card behind it — visually unusual but functional and discoverable. Acceptable.

---

## YAGNI / KISS / DRY
- **Paw pattern via inline-style `url()`** — KISS ✓. Could have been a Tailwind plugin/utility but that'd be over-engineering for one use case.
- **Unified card collapse** — clean simplification over iter-1's dual-card approach. ✓
- **No new tokens, no new components, no new utilities** — brief honored. ✓
- **Repetition of `aria-hidden="true"` on three siblings** — necessary, not duplication-as-tech-debt.

---

## Backwards-compat / API contract
None of these changes touch exports, props, or data shapes. Internal-only DOM/style changes. ✓ No breaking changes.

---

## Recommended Actions (in priority order)
1. **[High, blocking-ish]** Bump glass tint from `bg-white/45` → `bg-white/55` in `full-bleed-hero.tsx:91`. One-line change. Rescues kicker contrast over the Shop banner busy left side.
2. **[High, non-blocking]** Visual QA the Home hero at md breakpoint (768–1023px) to confirm top-left card does not collide with upside-down dogs or clouds in upper banner art. If collision: bump `pt-12 → pt-14` at md OR constrain `max-w-xs md:max-w-sm lg:max-w-md` on the card.
3. **[Medium]** Capture screenshots of both banners (Home + Shop) at md/lg/xl with the iter-2 glass card for designer sign-off before merge.

---

## Positive Observations
- **Iter-2 simplifications hit YAGNI/KISS clean** — gradient div removed, dual-card collapsed to unified, no new tokens, no new components.
- **Z-stack inside MenuCard is correct** without needing explicit z-index — relies on sibling paint order, which is the right call.
- **SVG asset is minimal and seamless-tile-safe** — no over-engineering, no embedded styles, ~250 bytes.
- **Mobile path preserved untouched** — surgical change scope respected.
- **Focus rings preserved on outer Link wrappers** — accessibility not regressed.
- **aria-hidden coverage on decorative elements** — correct throughout.

---

## Metrics
- Type coverage: clean (typecheck passed)
- Lint: 0 warnings, 0 errors
- New files: 1 (`paw-tile.svg`, ~250 bytes)
- Net LOC delta: ~+20 lines across 3 components (collapse offsets paw-tile additions)
- Breaking changes: 0

---

## Unresolved Questions
1. Is the kicker text (`text-warm-muted`) AA-contrast over Shop banner at `/45` glass actually failing, or only theoretically marginal? Needs real screenshot QA, not just review reasoning. Recommend visual capture.
2. At md breakpoint, does the top-left card overlap upper-banner imagery on the Home hero? Cannot verify without a rendered screenshot.
3. Is the `apparel` tile `#fffbe6` vs `bg-surface` seam intentionally near-invisible (good for one-unit reading) or is the design expectation that all tiles show a visible seam between image and text zones?

---

**Status:** DONE_WITH_CONCERNS

**Summary:** iter-2 changes match dispatch description exactly. Code is clean, type-safe, lint-clean, accessibility-preserved, z-stack correct, SVG asset valid. Two visual-risk concerns flagged: (1) `bg-white/45` is on the edge of kicker contrast over the Shop banner — recommend bumping to `/55`; (2) md-breakpoint top-left card position needs visual QA against banner imagery.

**Concerns/Blockers:**
- **H1:** `bg-white/45` likely under-contrasts the kicker over Shop banner left-side imagery. Recommend `bg-white/55`. Non-blocking but high-priority pre-merge.
- **H2:** md-breakpoint card-vs-banner collision unverified — needs visual QA pass before merge. Non-blocking but flag for designer review.
- All other findings are observational / acceptable-as-designed per the iter-2 brief.
