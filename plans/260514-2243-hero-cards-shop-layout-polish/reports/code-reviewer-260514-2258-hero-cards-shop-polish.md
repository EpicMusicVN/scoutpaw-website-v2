# Code Review — Hero / Cards / Shop Layout Polish

Date: 2026-05-14
Reviewer: code-reviewer
Plan: `plans/260514-2243-hero-cards-shop-layout-polish/`

## Scope

Files reviewed (4 source files + asset set):
- `app/page.tsx` (title literal change)
- `components/home/full-bleed-hero.tsx` (new bottom gradient + bottom-anchored card)
- `components/home/menu-cards.tsx` (Characters card `bg` token swap)
- `components/shop/explore-products.tsx` (editorial layout refactor)
- `public/assets/card/{characters,shop,watch}.png` (mirrored from `assets/card/`)

Validation already passed: `pnpm typecheck` clean, `pnpm lint` clean, RGBA pre-flight ok.

## Overall Assessment

Changes are clean, minimal, and adhere to existing codebase patterns. Focus-ring conventions match (`ring-2 ring-brand-primary ring-offset-4 ring-offset-paper`), token usage is correct, no class collisions, no orphan structure from the old sticker-overlay path. One real perf concern (shop.png 3.4MB source) and a handful of minor cosmetic / hit-target observations follow.

## Critical Issues

None.

## High Priority

### 1. `public/assets/card/shop.png` is 3.4 MB — downscale recommended

- File: `public/assets/card/shop.png` = 3,401,017 bytes. The other two Set A cards (`characters.png` 194 KB, `watch.png` 270 KB) are an order of magnitude smaller.
- Rendered slot is at most `lg:h-48 lg:w-48` = 192×192 CSS px. Even at 3× DPR, the *served* variant only needs ~576px.
- Next/Image optimization IS enabled (`next.config.ts` has no `unoptimized` flag; `/_next/image` will derive WebP/AVIF variants), so end-user payload at runtime is dramatically smaller than 3.4 MB. **However:**
  - The first request to optimize the source triggers a cold derive that reads the 3.4 MB file. On Vercel this consumes optimization compute budget (counted per source MB).
  - Repo size grows ~3 MB per asset rev; git history bloats over time.
  - If hosting ever switches to static export or `unoptimized: true`, every visitor ships the raw 3.4 MB.
- Above-the-fold-ness: `MenuCards` is the second section (after `FullBleedHero` aspect-[16/9] hero). On a 1080p portrait viewport, the top of MenuCards begins ~700-900px down, generally below initial fold but **partial visibility on shorter viewports / 4:3 tablets** is plausible. It is not `priority`-loaded, so native lazy loading applies — runtime impact bounded.
- **Recommendation:** downscale source to ~1024×1024 PNG (likely 100-300 KB) via imagemagick:
  ```
  magick assets/card/shop.png -resize 1024x1024 -strip -define png:compression-level=9 assets/card/shop.png
  ```
  Then re-copy to `public/assets/card/shop.png`. Visually identical at the render slot.
- **Severity:** medium-high. Acceptable to land but should be fixed in a follow-up before next release. Not a launch blocker; performance is bounded by Next image opt at runtime.

## Medium Priority

### 2. Editorial tile — rotated image overflows un-rotated Link bounding box

- `explore-products.tsx:75-112`: outer `<Link>` is un-rotated (`rounded-[2rem]` only, no transform). The image card child carries `${tile.rotate}` (e.g. `-rotate-2`).
- CSS transforms don't affect layout. The Link's `focus-visible:ring` and click hit-rect both follow the un-rotated bounding box. The rotated image corners visually poke beyond that box by ~tan(2°)×imageWidth ≈ 10-15 px at worst.
- **DOM-event hit-testing**: still correct — clicks on the rotated image bubble up to `<Link>` because the image is a DOM descendant. No accessibility regression for keyboard or screen reader users.
- **Visual UX**: on focus, the ring outlines an un-rotated rectangle; the rotated image corners stick out one side. Slightly awkward but matches what `playlist-grid.tsx` already does (it uses the same rotated-tile pattern). Pattern is consistent with codebase precedent.
- **Recommendation:** no code change required. If perfectionist polish is wanted later, rotate the outer Link wrapper instead and unrotate the text card child — but that introduces its own layout complications (margins, neighboring grid cells). Not worth churn now.

### 3. Hover gap drift between rotated image card and text card

- `explore-products.tsx:83,100`: image card has `group-hover:-translate-y-2`; text card has only `mt-5` margin. On hover, the image lifts 8px upward while the text card stays put → visual gap widens from 20px → 28px.
- Intentional "floating" effect, consistent with menu-cards.tsx's hover pattern (image card lifts via `-translate-y-1`).
- **No code change needed.** Worth eyeballing in visual QA to confirm it doesn't feel jarring at 2-col breakpoint.

## Low Priority

### 4. Bottom-left + left-edge gradient overlap

- `full-bleed-hero.tsx:69-84`: three fades on desktop — left horizontal (`w-2/5 from-paper`), right horizontal (`w-1/3 from-paper`), new bottom-left vertical (`h-1/2 w-2/5 from-paper/60`).
- The new bottom gradient overlaps the left gradient in the bottom-left quadrant. Both contribute toward `paper` tint; compounded opacity at the very bottom-left corner is ~0.7+0.6 alpha-blended — heavier than either alone. Probably fine because that quadrant is where the card overlays anyway.
- **Visual QA recommendation:** scrutinize the bottom-left of the Home hero on desktop — confirm corgi tail / lower characters aren't dimmed unintentionally. The `objectPosition: "70% 50%"` shifts characters rightward, so left corner is typically less character-heavy. Likely safe.

### 5. Min h-1/2 of `aspect-[16/9]` banner can be tall on wide viewports

- Banner height at `max-w-[1600px]` = 900px on widescreen → `h-1/2` gradient = 450px tall, occupying the bottom half of the banner area. Card sits in `pb-10 lg:pb-16` (40-64px). Gradient's fade-to-transparent boundary is near the top of the card; characters above the gradient stay untouched. Good.

### 6. `objectPosition: "70% 50%"` may need tuning for Shop hero

- Shop hero (`app/shop/page.tsx:18-29`) shares the same `FullBleedHero` component. The hard-coded `objectPosition: "70% 50%"` is appropriate for Home (corgi off-center right), but the Shop banner (`/assets/shop/banner.png`) may not have the same compositional center. Out of scope for this review (not changed in this PR), but flagged because the bottom-left card refactor newly applies to Shop too. Already noted in plan as "tune visually only if needed."

## Edge Cases / Responsive Correctness

- **Mobile path on FullBleedHero**: confirmed unchanged. New gradient div has `hidden md:block`. Mobile in-flow card unchanged (`md:hidden` path). 
- **Mobile editorial tile**: `grid-cols-1` on mobile, `sm:grid-cols-2` from 640px+. Each tile is a vertical image-then-text stack; no overflow risk. Gap `gap-8 md:gap-10` (32-40px) is ample.
- **Rotated image vs grid neighbors**: at `sm:grid-cols-2` on 1024px max, each column ≈ 472px image, rotation pushes corner out ~16px max. Grid gap = 32-40px. No collision.
- **`-translate-y-2` (8px) hover lift on aspect-square image card**: top of tile rises 8px on hover. Section has `py-24 md:py-32` (96-128px), so adjacent section is far away. No collision risk.
- **Bottom-left card vs next section**: card sits at `pb-10 lg:pb-16` inside the banner box; banner section is `relative isolate bg-paper`, and the section ends at the banner's bottom edge (no extra padding). CloudDivider follows. No collision — card is contained inside banner bounds.
- **Keyboard nav**: Tab order is unchanged. Focus ring on editorial tiles routes through the outer Link (single tab stop per tile, correct). `aria-label` on Link is preserved.
- **Touch targets**: editorial tile total touch area = image card (~400-500px) + 20px margin + text card (~180px) ≈ 600+ px tall. Well above 44px minimum.
- **`comingSoon` div in menu-cards.tsx**: still uses `role="link"` + `aria-disabled` pattern. Not touched by this PR but verified intact.

## Pattern Consistency

- Editorial layout in `explore-products.tsx` (image card + sibling text card with `mt-5`) **diverges** from `menu-cards.tsx` (image card + overlapping text card with `-mt-20`).
- Divergence is **justified** by the brainstorm rationale: shop tiles have rectangular product imagery that gets hidden when a text panel overlaps the bottom third; home menu cards have circular character icons centered in the card where the overlap is fine. Different visual problems, different solutions. Documented in `phase-03-shop-exploreproducts-editorial-refactor.md`.
- Shadow / radius / transition tokens are consistent (`shadow-cozy`, `shadow-cozy-md`, `rounded-2xl`, `rounded-[2rem]`, `ease-gentle`). 

## Type Safety / Build

- Already validated: `pnpm typecheck` clean, `pnpm lint` clean.
- `bg-soft-sky` resolves to `--bg-soft-sky-rgb` (= `221 238 247`, `#ddeef7`) via `tailwind.config.ts:38`. Token exists in `app/globals.css:25-26`.
- All Tailwind utilities used (`bg-soft-sky`, `max-w-hero`, `shadow-cozy*`, `ease-gentle`, `bg-paper`, `text-warm-text`, etc.) resolve correctly per config.
- `var(--bg-soft-sky)` used inline in `menu-cards.tsx:32` for the `style={{ background: card.bg }}` consumer — confirmed present in globals.css. No regression.

## Positive Observations

- Title removal is a one-character-precise diff in a single literal — no orphan strings, no broken references.
- `FullBleedHero` refactor cleanly handles both Home and Shop via the same component — single point of change.
- Mobile in-flow card path explicitly preserved; desktop changes guarded by `md:` prefixes.
- Editorial layout is a clean siblings-not-overlap design — keeps product imagery unobstructed and improves readability.
- Focus-ring + aria-label preservation on the new `<Link>` matches codebase conventions exactly.
- New `bg-soft-sky` token usage avoids the yellow-on-yellow blending issue for Characters card.
- Editorial tile uses `aspect-square` for predictable image card sizing — no surprise heights.
- All new gradients carry `aria-hidden` and `pointer-events-none`.

## Recommended Actions

1. **Before merge to release:** downscale `assets/card/shop.png` (and re-copy to `public/`) to ≤ 1024×1024. ~100-300 KB target. (Medium-high priority; will land cleanly as a follow-up commit.)
2. **Visual QA pass:** confirm
   - Home hero bottom-left card does not dim character zone above (compounded gradient overlap).
   - Editorial tile hover doesn't create jarring image-text drift at 2-col breakpoint.
   - Shop hero `objectPosition: "70% 50%"` works with `/assets/shop/banner.png` composition.
3. **Optional (not blocking):** in a future pass, consider rotating the outer `<Link>` wrapper instead of just the image card if focus-ring alignment with the rotated visual matters. Low value.

## Metrics

- Files modified: 4 (3 components + 1 page).
- LOC delta: minimal — ~10 lines net add (new gradient div, padding/class adjustments, slot wrappers).
- Type coverage: unchanged.
- Lint warnings: 0.
- Type errors: 0.

## Unresolved Questions

1. Is the shop.png 3.4 MB a blocker for this PR, or acceptable to land + follow up? (Recommended: land + immediate follow-up commit to downscale; runtime impact bounded by Next image opt.)
2. Should `objectPosition: "70% 50%"` become a prop on `FullBleedHero` so Home and Shop can independently tune? (Out of scope; flag for future plan.)
3. Is there a project-wide budget for git asset weight? `assets/card/shop.png` source is the canonical Set A artwork — if there's a "compress all source PNGs" pass planned elsewhere, this should be queued there.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** UI polish changes are correct, minimal, accessibility-preserving, and follow existing codebase patterns. Typecheck + lint already green. One real concern (`public/assets/card/shop.png` is 3.4 MB; recommend imagemagick downscale before next release) and minor cosmetic observations (rotated image vs un-rotated Link focus-ring bounding box, hover gap drift) noted as informational.
**Concerns/Blockers:** `shop.png` source weight is the only issue worth acting on before next release. Not a launch blocker because Next image optimization is active at runtime, but a 5-second imagemagick downscale removes the perf risk entirely and reduces repo bloat.
