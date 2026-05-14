---
phase: 3
title: Pack Cards Restructure
status: completed
priority: P1
effort: 30m
dependencies: []
---

# Phase 3: Pack Cards Restructure

## Overview

Restructure `components/home/menu-cards.tsx` `MenuCard` from a single rounded card (image filling upper half, text bottom) into two stacked elements per item: image card on top (aspect-square, colored bg, glow, transparent icon) + smaller text card below (bg-surface, narrower via mx-4, negative-margin overlap).

## Requirements

- Functional: 3 visible cards (characters / shop / watch) render; each links to its href; coming-soon variant still supported.
- Non-functional: Grid `auto-rows-fr` keeps outer wrapper heights matched; `aspect-square` image card stays fixed; text card grows.

## Architecture

**Current `MenuCard` inner:**
```
<div min-h-[320px] md:min-h-[360px] p-6 md:p-7 bg={card.bg} rounded-[2rem] shadow-cozy rotate-{X}>
  flex-1 image container (glow + icon)
  text section (h3 + copy + Explore)
</div>
```

**Target `MenuCard` inner:**
```
<Link group block>
  Image card:
    aspect-square rounded-[2rem] shadow-cozy-md
    bg={card.bg}
    inside: radial glow + transparent icon (p-6)
    hover: -translate-y-2 shadow-cozy-lg; icon scales 1.05
  Text card:
    -mt-10 mx-4 rounded-2xl bg-surface p-5 md:p-6 shadow-cozy
    h3 + copy + (Explore or Coming Soon badge)
    hover: shadow-cozy-md
</Link>
```

**Removed:**
- Outer `rounded-[2rem] shadow-cozy ${card.rotate} hover:rotate-0 hover:-translate-y-2 hover:shadow-cozy-lg overflow-hidden` wrapper — replaced by two-element structure
- `card.rotate` field can stay on the type (used nowhere else) but unused; cleaner to remove

**Coming-soon badge:** moves to overlay the image card (top-right corner, same `absolute right-4 top-4` style, plus `z-10`).

## Related Code Files

- Modify: `components/home/menu-cards.tsx`

## Implementation Steps

1. Inside `MenuCard`, replace the `inner` JSX and the `wrapperClass` logic with the two-card stack pattern:
   ```tsx
   function MenuCard({ card }: { card: Card }) {
     const content = (
       <>
         {/* Image card */}
         <div
           className="relative aspect-square overflow-hidden rounded-[2rem] shadow-cozy-md transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-cozy-lg"
           style={{ background: card.bg }}
         >
           {card.comingSoon && (
             <span className="absolute right-4 top-4 z-10 rounded-full bg-ink/85 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-surface md:text-xs">
               Coming Soon
             </span>
           )}
           <div
             aria-hidden="true"
             className="pointer-events-none absolute inset-x-1/4 top-1/4 h-1/2 rounded-full opacity-30 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
             style={{ backgroundColor: card.accentGlow }}
           />
           <Image
             src={card.image}
             alt=""
             fill
             sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
             className="object-contain p-6 drop-shadow-[0_18px_24px_rgba(43,29,16,0.18)] transition-transform duration-500 ease-out group-hover:scale-105"
             style={{ objectPosition: "center 60%" }}
             aria-hidden="true"
           />
         </div>

         {/* Text card */}
         <div className="relative -mt-10 mx-4 rounded-2xl bg-surface p-5 shadow-cozy transition-shadow duration-300 group-hover:shadow-cozy-md md:p-6">
           <h3 className="font-display text-xl font-bold text-ink md:text-2xl">{card.label}</h3>
           <p className="mt-1.5 text-sm text-warm-text md:text-base">{card.copy}</p>
           {!card.comingSoon && (
             <span className="mt-3 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink md:text-base">
               Explore
               <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                 →
               </span>
             </span>
           )}
         </div>
       </>
     );

     const wrapperClass = "group block h-full";

     if (card.comingSoon) {
       return (
         <div
           role="link"
           aria-disabled="true"
           aria-label={`${card.label} — Coming Soon`}
           className={wrapperClass}
         >
           {content}
         </div>
       );
     }
     return (
       <Link href={card.href} className={wrapperClass}>
         {content}
       </Link>
     );
   }
   ```

2. Remove the `rotate` field from each card object in `allCards` (it's no longer used). Update the `Card` type to drop `rotate`.

3. Verify imports unchanged (`Image`, `Link`).

## Success Criteria

- [x] Each card renders as two visually distinct stacked elements.
- [x] Image card is square (aspect-square) with colored bg.
- [x] Text card has bg-surface, narrower via mx-4, sits below image with ~40px overlap.
- [x] Hover lifts image card more than text card; icon scales.
- [x] Coming-soon badge renders on image card top-right (only if card.comingSoon).
- [x] Grid heights remain consistent across the row.
- [x] No rotation on any card.

## Risk Assessment

- **Risk:** Text card `bg-surface` (white) may feel cold against the warm honey/peach/tan image cards.
  - **Mitigation:** Visual QA. If too cold, swap to `bg-paper` (cream) or `bg-honey/40` for warmth.
- **Risk:** `-mt-10` overlap at small mobile widths may push text card content too close to next card below.
  - **Mitigation:** Grid `gap-5` on parent provides separation; verify in QA. If tight, increase parent gap to `gap-6`.
- **Risk:** Icon glow position (`top-1/4 h-1/2`) was tuned for the previous flex-based image container; in `aspect-square` it may shift. The glow div uses percentage-based positioning so it scales with container. Should still center reasonably; visual QA decision.
- **Risk:** `auto-rows-fr` stretches outer wrapper but image card stays aspect-square — extra vertical space ends up below text card. Acceptable; cards still align across row.
