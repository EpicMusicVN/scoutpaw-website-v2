---
phase: 1
title: Hero Restructure
status: completed
priority: P1
effort: 40m
dependencies: []
---

# Phase 1: Hero Restructure

## Overview

Convert `components/home/full-bleed-hero.tsx` from a single-mode full-bleed layout into a responsive two-mode layout: mobile stacks banner above a glass card; md+ pins the glass card absolute top-right over the full-bleed banner.

## Requirements

- Functional: Banner image still loads with `priority` (LCP). Headline/kicker/body/CTAs all render. Mobile (<768px) is readable without overlap.
- Non-functional: Glass card uses `bg-honey/85 backdrop-blur-xl` for legibility over varied banner colors. No new dependencies. SSR-safe (no `"use client"`).

## Architecture

**Current structure:**
- Section is `relative isolate overflow-hidden bg-paper`
- Inner div `relative min-h-[100svh] w-full` — banner image `fill` + overlay flex container
- Text panel is a flex child with `items-start pt-[12svh]`, max-w ladder, honey card backdrop on mobile
- Gradient mask `linear-gradient(90deg, ...) 0% → 42%` for desktop text legibility

**Target structure:**
- Section is `relative isolate bg-paper` (drop `overflow-hidden` so glass card border-shadow can render cleanly)
- Banner wrapper: `relative aspect-[4/3] md:aspect-auto md:min-h-[100svh]`
  - Mobile: banner has fixed 4:3 aspect → ends mid-viewport
  - md+: banner fills viewport height
- Banner `<Image fill priority sizes="100vw" className="object-cover" style={objectPosition}>`
- Glass card: separate sibling div, no longer inside flex container
  - Mobile: `relative mx-4 -mt-8 max-w-md` flows below banner with 32px overlap onto banner's bottom edge
  - md+: `md:absolute md:top-12 md:right-12 lg:right-16 lg:top-16 md:mx-0 md:mt-0 md:max-w-md lg:max-w-lg`
- Gradient mask: REMOVED

**Glass card styling:**
```
rounded-3xl
border border-white/40
bg-honey/85
backdrop-blur-xl
shadow-cozy-xl
p-6 md:p-8 lg:p-10
```

**Typography:**
- kicker: `font-display text-xs font-bold uppercase tracking-[0.3em] text-warm-muted md:text-sm`
- title: `mt-3 font-display text-3xl font-bold leading-[1.05] text-ink md:text-4xl lg:text-5xl xl:text-[3.5rem]`
- description: `mt-4 text-base leading-relaxed text-warm-text lg:text-lg`
- actions: `mt-6 flex flex-wrap gap-3` w/ default Watch Now (dark) + Meet the Pack (outline) — unchanged from current default actions

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`

## Implementation Steps

1. Replace the inner DOM structure:
   ```tsx
   return (
     <section className="relative isolate bg-paper">
       <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[100svh]">
         <Image
           src={image}
           alt={imageAlt}
           fill
           priority
           sizes="100vw"
           className="object-cover"
           style={{ objectPosition: "50% 50%" }}
         />
       </div>

       <div className="relative mx-4 -mt-8 max-w-md rounded-3xl border border-white/40 bg-honey/85 p-6 shadow-cozy-xl backdrop-blur-xl md:absolute md:top-12 md:right-12 md:mx-0 md:mt-0 md:max-w-md md:p-8 lg:right-16 lg:top-16 lg:max-w-lg lg:p-10">
         <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-warm-muted md:text-sm">
           {kicker}
         </p>
         <h1 className="mt-3 font-display text-3xl font-bold leading-[1.05] text-ink md:text-4xl lg:text-5xl xl:text-[3.5rem]">
           {title}
         </h1>
         <p className="mt-4 text-base leading-relaxed text-warm-text lg:text-lg">
           {description}
         </p>
         <div className="mt-6 flex flex-wrap gap-3">
           {actions ?? (
             <>
               <Button href="/watch" size="lg" variant="dark">Watch Now</Button>
               <Button href="#meet-the-pack" size="lg" variant="outline">Meet the Pack</Button>
             </>
           )}
         </div>
       </div>
     </section>
   );
   ```

2. Remove the now-unused gradient mask `<div>` block.

3. Remove `overflow-hidden` from the section (was needed for the parallax image; no longer needed and would clip the glass card's outer shadow on mobile where the card slides up).

4. Update component docstring to reflect new behavior.

## Success Criteria

- [x] At 360×800: banner renders at 4:3 (≈360×270), glass card flows below with `-mt-8` overlap, fully readable.
- [x] At 768×1024: banner fills 100svh; glass card pinned `top-12 right-12`; partial overlap w/ upside-down peekers acceptable.
- [x] At 1440×900: banner full-bleed; glass card `top-16 right-16`, `max-w-lg` (32rem ≈ 512px wide).
- [x] Kicker / headline / body / 2 CTAs all visible.
- [x] Drop-shadow + backdrop-blur render correctly on the glass card (verify in DevTools).
- [x] No console hydration warnings.

## Risk Assessment

- **Risk:** At 768px exactly, the card (max-w-md ≈ 448px) anchored `right-12` (48px) leaves ~272px viewport for left-side dogs. May feel cramped.
  - **Mitigation:** Visual QA. If tight, change `md:max-w-md` to `md:max-w-sm` (384px). One-line tune.
- **Risk:** `backdrop-blur-xl` cost on low-end mobile. The card on mobile is below the banner (only 32px sliver overlaps banner via `-mt-8`), so blur only applies to that sliver — minimal.
- **Risk:** Image `priority` + new aspect-ratio container — verify Image still treated as LCP candidate. Test with Lighthouse if concerned.
- **Risk:** Long headline wrapping awkwardly at `text-[3.5rem]` xl. "THE ULTIMATE WORKDAY HANGOUT" = 4 words ≈ 22 chars + spaces. At `text-[3.5rem]` in `max-w-lg` (32rem) container minus padding ≈ 25rem usable width. Likely wraps to 2-3 lines.
  - **Mitigation:** Acceptable per user direction (comfortable line spacing). If too tall, drop xl back to `text-5xl`.
