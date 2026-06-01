---
phase: 1
title: Card Component Rebuild
status: completed
priority: P1
effort: 2h
dependencies: []
---

# Phase 1: Card Component Rebuild

## Overview

Rebuild `components/characters/character-section.tsx` from a full-width tinted strip into a large standalone rounded card on the cyan canvas. Card houses tinted bg inside, allows art overflow at top, and uses Plan A's heading style for the character name.

## Requirements

**Functional:**
- Component renders a single rounded card (`rounded-[2.5rem] md:rounded-[3rem]`)
- Card background = per-character `surfaceTint`
- Card has shadow (`shadow-cozy-xl`)
- Card width: `max-w-hero` (1400px), `mx-auto` horizontal center
- Card min-height: `min-h-[80vh]` desktop, `min-h-auto` mobile
- Art column may overflow card top by ~10–15% of pose height for cinematic depth
- Atmosphere/motif drift layers stay (clipped to card via `overflow-hidden` on body)
- Character name h2 uses Plan A's `text-navy` or `heading-gradient-cool` (consult final Plan A choice)
- Zig-zag flip preserved via `flip` prop
- All existing props (`character`, `theme`, `flip`, `priority`) preserved — no API break

**Non-functional:**
- File stays under 200 lines (current ~125; should not grow drastically)
- Composition over abstraction — don't extract sub-components unless line cap pressures it
- No regression on `/characters` page rendering

## Architecture

**Card structure (composition):**
```
<section> (outer — provides scroll-mt + spacing on page)
  <article> (the card)
    <div overflow-hidden> (clip wrapper for atmosphere/motif)
      <CharacterAtmosphere />
      <CharacterMotif />
    </div>
    <div grid> (composition layer above clip wrapper)
      <ArtColumn /> (may overflow visually via -translate-y-* on the Image)
      <ContentColumn />
    </div>
  </article>
</section>
```

**Overflow art technique:**
- Inner clip wrapper has `overflow-hidden` for atmosphere/motif (so they don't bleed outside card)
- The `<Image>` inside ArtColumn lives in a separate stacking context with `overflow: visible`; use `-translate-y-[10%]` to push the pose above the card's top edge

## Related Code Files

- **Modify (substantial rebuild):** `components/characters/character-section.tsx`
- **Read only (no change needed):**
  - `components/characters/character-atmosphere.tsx`
  - `components/characters/character-motif.tsx`
  - `components/characters/character-merch-card.tsx`
  - `lib/content/character-themes.ts`

## Implementation Steps

1. **Open** `components/characters/character-section.tsx`.
2. **Refactor structure** to wrap the content in a card `<article>`:

   ```tsx
   <section
     id={slug}
     aria-labelledby={`${slug}-name`}
     className="relative mx-auto max-w-hero scroll-mt-20 px-4 md:px-8"
   >
     <article
       className="relative rounded-[2.5rem] shadow-cozy-xl overflow-visible md:rounded-[3rem] md:min-h-[80vh] flex flex-col justify-center"
       style={{ backgroundColor: theme.surfaceTint }}
     >
       {/* Clip layer — atmosphere/motif stay inside rounded edges */}
       <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] md:rounded-[3rem]">
         <CharacterAtmosphere atmosphere={theme.atmosphere} color={theme.decor} />
         <CharacterMotif motif={theme.motif} color={theme.decor} />
       </div>

       {/* Content grid above clip layer */}
       <div
         className={`relative grid items-center gap-8 p-6 sm:p-8 md:grid-cols-2 md:gap-12 md:p-12 lg:p-16 ${
           flip ? "md:[&>div:first-child]:order-2" : ""
         }`}
       >
         {/* Art column — pose overflows top edge on desktop */}
         <div className="relative mx-auto aspect-[3/4] w-full max-w-[380px] md:max-w-[460px] md:-translate-y-[8%]">
           <span aria-hidden className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl" style={{ backgroundColor: accentColor }} />
           <Image
             src={assetUrl(pose)}
             alt={`${name} the ${breed}`}
             fill
             priority={priority}
             sizes="(min-width: 768px) 460px, 80vw"
             className="object-contain object-bottom drop-shadow-[0_28px_50px_rgba(43,29,16,0.30)]"
           />
         </div>

         {/* Content column — kicker, name (Plan A heading), tagline, bio, merch, CTAs */}
         <div>
           <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-ink/60">
             {breed}
           </p>
           <h2
             id={`${slug}-name`}
             className="mt-2 font-display text-5xl font-bold leading-[1.02] text-navy md:text-6xl"
           >
             {name}
           </h2>
           {/* …tagline, bio, merch row, CTAs — keep existing markup… */}
         </div>
       </div>
     </article>
   </section>
   ```

3. **Verify** atmosphere/motif still render but clip cleanly at rounded edges (no bleed past card).
4. **Verify** art overflow at top is visible (Image pushes ~8% above card top).
5. **Typecheck + lint** — must pass.
6. **Visual check** at desktop (≥md) — card should feel like a hero scene.

## Success Criteria

- [ ] Card renders with `rounded-[2.5rem] md:rounded-[3rem]`, `shadow-cozy-xl`, per-character tint inside
- [ ] `min-h-[80vh]` on `md+` viewports; auto height on mobile
- [ ] Character pose visibly overflows card top on desktop
- [ ] Atmosphere/motif layers clip to rounded card edges
- [ ] Character name h2 uses Plan A's `text-navy` (or chosen gradient)
- [ ] All 5 characters render correctly (max, buddy, bella, oscar, rocky)
- [ ] Zig-zag flip alternation preserved
- [ ] No layout regressions on `/characters/[slug]` detail pages (they don't use this component, but sanity check)
- [ ] File still under 200 lines
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** `overflow-hidden` on inner clip + `overflow-visible` on outer card → confusing stacking. *Mitigation:* the inner clip is `absolute inset-0` for atmosphere/motif; the art lives in the regular grid flow with `-translate-y-*`. Test in browser.
- **Risk:** `min-h-[80vh]` causes large empty space on short content. *Mitigation:* use `flex flex-col justify-center` on card so content vertically centers within the tall card.
- **Risk:** Drop-shadow on Image (already there) competes visually with card shadow. *Mitigation:* keep both — pose shadow grounds the character to the card surface; card shadow grounds the card to the page.

## Security Considerations

None.
