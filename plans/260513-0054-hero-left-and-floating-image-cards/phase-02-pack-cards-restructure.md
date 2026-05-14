---
phase: 2
title: Pack Cards Restructure
status: completed
priority: P1
effort: 30m
dependencies: []
---

# Phase 2: Pack Cards Restructure

## Overview

Restructure `components/home/menu-cards.tsx` `MenuCard` from "full-width image + narrower text card below" to Pinterest pin pattern: small centered floating image card on top + full-width text card pulled up to create overlap effect.

## Requirements

- Functional: 3 visible cards render with new layout. Each links to href. Coming-soon variant supported (badge relocates to outer wrapper top-right).
- Non-functional: Grid `auto-rows-fr` keeps outer Link wrapper heights matched. Image card is fixed dimension. Text card grows.

## Architecture

**Current MenuCard:**
```
<Link group block h-full>
  <div aspect-square rounded-[2rem] bg={card.bg} shadow-cozy-md ...>
    <coming-soon badge> + glow + image (full-size in image card, p-6)
  </div>
  <div -mt-10 mx-4 rounded-2xl bg-surface shadow-cozy p-5/6>
    h3 + copy + Explore →
  </div>
</Link>
```

**Target MenuCard:**
```
<Link group relative block h-full>
  {coming-soon && <span absolute top-3 right-3 z-20 ...>Coming Soon</span>}
  <div mx-auto relative z-10 h-32/36/40 w-32/36/40 rounded-3xl bg={card.bg} shadow-cozy-md ...>
    glow (smaller blur-2xl opacity-40) + image (p-3)
  </div>
  <div -mt-16/md:-mt-[72px]/lg:-mt-20 rounded-3xl bg-surface shadow-cozy px-6 pb-6 pt-24/md:pt-28/lg:pt-32 ...>
    h3 + copy + Explore →
  </div>
</Link>
```

**Key dimensions:**

| Breakpoint | Image size | Text -mt | Text pt |
|---|---|---|---|
| mobile | 128×128 (h-32 w-32) | -mt-16 (-64px) | pt-24 (96px) |
| md | 144×144 (h-36 w-36) | -mt-[72px] | pt-28 (112px) |
| lg | 160×160 (h-40 w-40) | -mt-20 (-80px) | pt-32 (128px) |

**Math (mobile):**
- Image renders y=0 to y=128 in normal flow
- Text card has -mt-16 → text card top pulled up to y=128-64 = y=64
- Image extends y=64 to y=128 visually overlaps text card top 64px
- Text card pt-24 (96px) → text content starts at y=64+96 = y=160. Image bottom at y=128. Gap = 32px ✓

**Z-stacking:**
- Image card: `relative z-10` (relative is required for z-index)
- Text card: `relative` (default z-auto, below 10)
- Coming-soon badge: `absolute z-20` on outer wrapper (above image)

**Hover:**
- Image: `group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-cozy-lg`
- Text card: `group-hover:shadow-cozy-md`

## Related Code Files

- Modify: `components/home/menu-cards.tsx`

## Implementation Steps

1. Update `MenuCard` function body to the Pinterest pin structure:
   ```tsx
   function MenuCard({ card }: { card: Card }) {
     const content = (
       <>
         {card.comingSoon && (
           <span className="absolute right-3 top-3 z-20 rounded-full bg-ink/85 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-surface md:text-xs">
             Coming Soon
           </span>
         )}
         <div
           className="relative z-10 mx-auto h-32 w-32 overflow-hidden rounded-3xl shadow-cozy-md transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-cozy-lg md:h-36 md:w-36 lg:h-40 lg:w-40"
           style={{ background: card.bg }}
         >
           <div
             aria-hidden="true"
             className="pointer-events-none absolute inset-x-1/4 top-1/4 h-1/2 rounded-full opacity-40 blur-2xl"
             style={{ backgroundColor: card.accentGlow }}
           />
           <Image
             src={card.image}
             alt=""
             fill
             sizes="(min-width:1024px) 160px, (min-width:640px) 144px, 128px"
             className="object-contain p-3 drop-shadow-[0_12px_18px_rgba(43,29,16,0.22)]"
             aria-hidden="true"
           />
         </div>
         <div className="relative -mt-16 rounded-3xl bg-surface px-6 pb-6 pt-24 shadow-cozy transition-shadow duration-300 group-hover:shadow-cozy-md md:-mt-[72px] md:px-7 md:pb-7 md:pt-28 lg:-mt-20 lg:pt-32">
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

     const wrapperClass = "group relative block h-full";

     if (card.comingSoon) {
       return (
         <div role="link" aria-disabled="true" aria-label={`${card.label} — Coming Soon`} className={wrapperClass}>
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

2. Verify Card type unchanged (no rotate field, has accentGlow). Verify grid section unchanged.

## Success Criteria

- [x] Each card: small centered image card (h-32/36/40 square) on top.
- [x] Image card overlaps top of text card; z-10 places it visually on top.
- [x] Text card full column width, bg-surface, with pt-24/28/32 reserving overlap space.
- [x] Coming-soon badge (if used) sits top-right of outer Link wrapper, z-20.
- [x] Hover lifts image card (-translate-y-1 + scale-105) and bumps text card shadow.
- [x] Grid heights stay matched across the row.

## Risk Assessment

- **Risk:** Z-index won't apply without `relative` on the image card. Image card class has `relative z-10` ✓.
- **Risk:** Auto-rows-fr stretches outer Link wrapper but image card is fixed-height — extra space goes into text card. Text card grows acceptable.
- **Risk:** Glow positioning (`inset-x-1/4 top-1/4 h-1/2`) inside a smaller container may look off. Visual QA decision.
- **Risk:** Icon padding `p-3` (12px) inside h-32 (128px) container — icon ~104px tall. May feel cramped vs current `p-6` in larger container.
  - **Mitigation:** If too cramped, try `p-2` for more icon room. Or `p-4` for more padding. Visual QA.
- **Risk:** `<Image fill sizes="...">` with multiple breakpoint sizes — let Next.js handle correctly. Sizes prop is just a hint to the browser; not strictly required to match exact pixel sizes.
