---
phase: 2
title: Hero Rebuild
status: completed
priority: P1
effort: 4h
dependencies:
  - 1
---

# Phase 2: Hero Rebuild

## Overview

Replace the placeholder character-cluster heroes on Home and Shop with the supplied banners. Home gets a **full-bleed cinematic hero** using `banner.png` with text floated in the upper-left sky zone behind a soft honey gradient mask (so dogs are never covered). Shop gets a **stacked hero** — full-width `promotion.png` on top, cream text-strip with kicker + CTAs below (the image already has its own painted "DOG PARENTS" title, so no h1 overlay).

## Requirements

**Functional:**
- Home hero displays `banner.png` full-bleed with title + CTAs in upper-left sky region; characters never covered or clipped
- Shop hero displays `promotion.png` full-width on top with cream kicker + CTA strip below
- Both heroes responsive at 360 / 768 / 1280 / 1440
- Both heroes preserve current page anchor IDs and CTA targets (`/watch`, `#meet-the-pack`, `#products`, `#explore`)
- LCP image preloaded (`priority` prop on `<Image>`)

**Non-functional:**
- LCP < 2.5s on home page (use `banner.webp` over `banner.png` when available)
- No hydration mismatch (server + client first paint identical)
- Reduced-motion users see static heroes (no parallax)
- Existing `CinematicHero` API kept intact for any future reuse — these new heroes are additive

## Architecture

**Decision:** Add two new lightweight components rather than branching `CinematicHero` with variant props. The branching variant grew past the ~30 LOC threshold flagged in plan-level risks (full-bleed needs absolute positioning + gradient overlay; stacked needs flex column + image aspect lock — combined, that's 60+ LOC of conditional JSX).

**New components:**
- `components/home/full-bleed-hero.tsx` — used by `app/page.tsx`
- `components/shop/stacked-hero.tsx` — used by `app/shop/page.tsx`

**Existing `CinematicHero` left in place** (still used by `coming-soon/[slug]` route per scout report — DO NOT DELETE without verifying).

### Full-Bleed Hero (Home) — Composition

```
<section class="relative isolate overflow-hidden min-h-[520px] md:min-h-[600px] lg:min-h-[680px]">
  <Image fill priority src="/assets/banner/banner.webp" />
                         ↑ webp first; fallback to png handled by Next/Image
  <div class="absolute inset-0 bg-gradient-to-r from-honey/85 via-honey/40 to-transparent" />
                         ↑ left ~50% honey wash, fades to transparent by ~60% width
  <div class="relative z-10 mx-auto max-w-hero px-4 md:px-12 lg:px-20 py-12 md:py-20 lg:py-28">
    <div class="max-w-md md:max-w-lg lg:max-w-xl">
      <p class="kicker">Welcome to ScoutPaw TV</p>
      <h1>Calm sounds for your pup's day.</h1>
      <p class="description">...</p>
      <div class="ctas">[Watch Now] [Meet the Pack]</div>
    </div>
  </div>
</section>
```

- `objectPosition="50% 60%"` biases the crop slightly upward on tall mobile so the dogs' heads stay visible
- Gradient `from-honey/85 via-honey/40 to-transparent` ensures text contrast on left while fully revealing the dogs on right
- No framer-motion parallax (banner.png is the focal image — parallax would feel laggy at this scale)

### Stacked Hero (Shop) — Composition

```
<section class="relative">
  <div class="relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] w-full">
    <Image fill priority src="/assets/shop/promotion.png" objectFit="cover" />
  </div>
  <div class="bg-base px-4 py-8 md:px-8 md:py-12">
    <div class="mx-auto max-w-2xl text-center">
      <p class="kicker">ScoutPaw Shop</p>
      <p class="description">Take a piece of the pack home...</p>
      <div class="ctas">[Browse All] [Explore Collections]</div>
    </div>
  </div>
</section>
```

- Image `aspect-[16/9]` mobile → wider on desktop preserves horizontal composition
- No h1 — the image's painted "essentials DOG PARENTS" title is the visual h1
- For SEO/a11y: render an `<h1 class="sr-only">ScoutPaw Shop</h1>` so screen readers + Google still see a top-level heading

## Related Code Files

- Create: `components/home/full-bleed-hero.tsx`
- Create: `components/shop/stacked-hero.tsx`
- Modify: `app/page.tsx` (swap import + usage; remove `HeroCharacterCluster` reference for hero block — it's still used elsewhere via `FeaturedPupSpotlight`, do NOT delete the component file)
- Modify: `app/shop/page.tsx` (swap import + usage; same caveat re: HeroCharacterCluster)
- Read: `public/assets/banner/banner.webp` + `banner.png` (verify both present)
- Read: `public/assets/shop/promotion.png` (verify present)

## Implementation Steps

1. **Asset verification (5 min)**
   - Confirm `public/assets/banner/banner.webp` exists (scout already verified) — Next/Image will pick webp automatically when supported
   - Confirm `public/assets/shop/promotion.png` exists
   - If `promotion.webp` missing, that's fine (png is acceptable for ~2.2MB image)

2. **Create `components/home/full-bleed-hero.tsx`**
   - Server component (no `"use client"` — no parallax, no scroll hooks)
   - Props: `kicker`, `title`, `description`, `actions?: ReactNode`
   - Default actions: same as current home hero (Watch Now / Meet the Pack)
   - Use `<Image fill priority src="/assets/banner/banner.png" sizes="100vw" />`
   - Title: `font-display text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-bold leading-[0.98] text-ink`
   - Description: `text-base md:text-lg lg:text-xl text-warm-text` (full opacity per Phase 1)
   - Kicker: `font-display text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-warm-muted`
   - Add a sr-only `<h1>` if the visible h1 is the painted text — but here the visible title IS our h1, so just keep `<h1>` semantic.

3. **Wire home page**
   - In `app/page.tsx:19-28`, replace the `<CinematicHero>` block with:
     ```tsx
     <FullBleedHero
       kicker="Welcome to ScoutPaw TV"
       title="Calm sounds for your pup's day."
       description="Visual + musical companions designed to keep the whole pack happy, relaxed, and entertained."
     />
     ```
   - Remove now-unused `CinematicHero` and `HeroCharacterCluster` imports IF they're not used elsewhere on this page (they aren't — `FeaturedPupSpotlight` imports its own internal usage)

4. **Create `components/shop/stacked-hero.tsx`**
   - Server component
   - Props: `kicker`, `description`, `image`, `imageAlt`, `actions?: ReactNode`
   - Render: `<div aspect-ratio image>` then `<div text-strip>`
   - Render `<h1 className="sr-only">{kicker}</h1>` for SEO/a11y
   - Visible kicker rendered as `<p>` with display class
   - CTAs in a `flex flex-wrap gap-3 justify-center` row

5. **Wire shop page**
   - In `app/shop/page.tsx:41-61`, replace the `<CinematicHero>` block with:
     ```tsx
     <StackedHero
       kicker="ScoutPaw Shop"
       description="Plushes, prints, and apparel — every Buy Now opens our Shopify store in a new tab."
       image="/assets/shop/promotion.png"
       imageAlt="Featured ScoutPaw apparel and accessories"
       actions={
         <>
           <Button href="#products" size="lg" variant="dark">Browse All</Button>
           <Button href="#explore" size="lg" variant="outline">Explore Collections</Button>
         </>
       }
     />
     ```
   - Remove now-unused `CinematicHero` + `HeroCharacterCluster` imports IF not used elsewhere on shop page (they aren't on shop)

6. **Type-check + visual smoke**
   - `pnpm exec tsc --noEmit` — must pass
   - `pnpm dev` → check home + shop at 1440 / 768 / 360
   - **Critical visual checks:**
     - Home: dogs in `banner.png` are NOT covered by gradient or text (gradient should fade fully transparent by ~55-60% width)
     - Home: title fits within left zone on tall mobile; doesn't push into character area
     - Shop: `promotion.png` doesn't crop too aggressively on mobile — products still visible
     - Shop: text strip below image doesn't feel disconnected (small `bg-base` padding bridges)

7. **A11y check**
   - Run `pnpm exec lighthouse http://localhost:3000 --only-categories=accessibility` (or use Chrome DevTools Lighthouse)
   - Target: ≥95
   - Verify: image alt text present, h1 unique per page, color contrast on title/description AAA on cream

8. **Save before/after screenshots** to `plans/260510-2254-ui-polish-pass/visuals/phase-02-{page}-{viewport}.png`

## Success Criteria

- [ ] `full-bleed-hero.tsx` and `stacked-hero.tsx` created (both <100 LOC)
- [ ] Home page renders `banner.png` full-bleed with text in upper-left and dogs visible
- [ ] Shop page renders `promotion.png` stacked with kicker + CTA strip below
- [ ] No competing titles on shop hero (image's painted text is the only visible h1-equivalent; sr-only h1 present for a11y)
- [ ] Both heroes work at 360 / 768 / 1440 without text overlapping characters or being unreadable
- [ ] LCP image marked `priority` on both
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] Lighthouse a11y ≥95 on home + shop
- [ ] Existing `CinematicHero` component still imports cleanly elsewhere (coming-soon route)
- [ ] Before/after screenshots saved

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Honey gradient covers golden retriever's right ear at narrow viewports | Test at 320px width; if covered, narrow gradient end from `to-transparent` at 55% → 45% |
| `banner.png` LCP stays heavy despite priority prop | Confirm Next/Image is serving webp (DevTools Network → check `Content-Type: image/webp`); if not, point `src` directly at `.webp` |
| Removed `CinematicHero` imports break unrelated routes | Run `grep -r "CinematicHero" app/ components/` — only `app/page.tsx`, `app/shop/page.tsx`, `app/coming-soon/[slug]/page.tsx` should reference it; first two get removed, third stays |
| Stacked hero shop image looks cropped at 360px | Set `objectPosition="center"` and lock `aspect-[16/9]` mobile; products are centered in promotion.png so they survive crop |
| Shop sr-only h1 + visible kicker creates duplicate-h1 a11y warning | Visible kicker is `<p>`, sr-only is `<h1>` — only one h1 in DOM, no conflict |
| Future plan needs the 2-zone hero — we deleted CinematicHero usage | We delete *usage* not the *component* — file stays, available to import |

## Security Considerations

None. Hero components are server-rendered, no user input, no API surface.

## Dependencies

Phase 1 must merge first (description text uses `text-warm-text` token referenced in step 2 implementation).
