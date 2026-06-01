---
phase: 1
title: CharacterScene Component Rebuild
status: completed
priority: P1
effort: 2h
dependencies: []
---

# Phase 1: CharacterScene Component Rebuild

## Overview

Rebuild `components/characters/character-section.tsx` from a rounded standalone card (Plan B output) into a full-bleed sticky scene. Structure: outer wrapper (`relative h-screen` — contributes to page scroll height) + inner sticky div (`sticky top-0 h-screen`) + scene content (full-bleed tint bg, atmosphere/motif, art column, content column with zig-zag).

Renaming: keep file name `character-section.tsx` and export name `CharacterSection` to avoid touching consumers; concept shift is implementation-internal.

## Requirements

**Functional:**
- Component renders a section that contributes 100vh to page scroll
- Inner sticky div pins to viewport top, fills height
- Per-character `surfaceTint` is now the FULL scene background (no rounded card)
- `CharacterAtmosphere` + `CharacterMotif` clipped via inner `overflow-hidden`
- Z-index = `index` prop (later scenes layer over earlier)
- All current props preserved (`character`, `theme`, `flip`, `priority`); add new `index: number` and `total: number` props
- Plan A heading (`text-navy` h2) preserved
- Zig-zag layout via `flip` preserved

**Non-functional:**
- File stays under 200 lines
- No new dependencies (framer-motion already installed)
- Mobile-safe: sticky disabled on mobile (gated in Phase 3, but classes use `md:` prefix from the start)

## Architecture

```tsx
<section className="relative h-screen" style={{ zIndex: index }}>
  <div className="sticky top-0 flex h-screen items-center overflow-hidden md:[whatever]" style={{ backgroundColor: theme.surfaceTint }}>
    {/* Atmosphere + Motif inside the sticky scene; clipped by overflow-hidden */}
    <CharacterAtmosphere ... />
    <CharacterMotif ... />

    {/* Scene content grid */}
    <div className="relative z-10 mx-auto grid w-full max-w-hero items-center gap-8 px-4 md:grid-cols-2 md:gap-12 md:px-8 [flip-class]">
      <ArtColumn />
      <ContentColumn />
    </div>
  </div>
</section>
```

**Sticky technique:**
- Outer `<section>` is `relative h-screen` → contributes 100vh to document scroll
- Inner `<div>` is `sticky top-0 h-screen` → pins to viewport top while the outer scrolls past
- Effect: the scene "sticks" until next scene's outer wrapper scrolls under it, at which point the next scene's sticky div takes over (with higher z-index it visually layers on top)

**Z-index stacking:**
- Each scene gets `style={{ zIndex: index }}` on the outer wrapper (or inner — see Phase 2 choreography)
- Index 0 = first character (lowest layer), index 4 = last (highest)
- Browser paints later scenes over earlier as they enter

**Mobile gating** (preview, full implementation in Phase 3):
- Sticky behavior gated to `md+` via Tailwind responsive utilities: `md:sticky md:top-0 md:h-screen`
- Mobile sees plain stacked `h-screen` (or `min-h-screen` if content can grow) sections

## Related Code Files

- **Modify (rebuild):** `components/characters/character-section.tsx`
- **Read only:** `components/characters/character-atmosphere.tsx`, `character-motif.tsx`, `character-merch-card.tsx`

## Implementation Steps

1. **Open** `components/characters/character-section.tsx`.
2. **Rewrite** structure:
   ```tsx
   export function CharacterSection({
     character,
     theme,
     flip,
     priority,
     index,
     total,
   }: {
     character: Character;
     theme: CharacterTheme;
     flip: boolean;
     priority: boolean;
     index: number;
     total: number;
   }) {
     // …destructuring as before
     return (
       <section
         id={slug}
         aria-labelledby={`${slug}-name`}
         className="relative h-screen"
         style={{ zIndex: index }}
       >
         <div
           className="relative flex h-screen items-center overflow-hidden md:sticky md:top-0"
           style={{ backgroundColor: theme.surfaceTint }}
         >
           {/* Atmosphere/motif clipped to scene */}
           <CharacterAtmosphere atmosphere={theme.atmosphere} color={theme.decor} />
           <CharacterMotif motif={theme.motif} color={theme.decor} />

           {/* Content grid */}
           <div className={`relative z-10 mx-auto grid w-full max-w-hero items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-12 md:px-8 md:py-16 ${flip ? "md:[&>div:first-child]:order-2" : ""}`}>
             {/* ArtColumn — same as Plan B but without translate-y overflow */}
             <div className="relative mx-auto aspect-[3/4] w-full max-w-[380px] md:max-w-[520px] lg:max-w-[560px]">
               <span aria-hidden className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl" style={{ backgroundColor: accentColor }} />
               <Image src={assetUrl(pose)} alt={`${name} the ${breed}`} fill priority={priority} sizes="(min-width: 768px) 560px, 80vw" className="object-contain object-bottom drop-shadow-[0_28px_50px_rgba(43,29,16,0.30)]" />
             </div>

             {/* ContentColumn — same kicker/h2/tagline/bio/merch/CTAs as Plan B */}
             <div>{/* …kicker, h2, tagline, bio, merch grid, CTAs… */}</div>
           </div>
         </div>
       </section>
     );
   }
   ```
3. **Drop card-specific styles**: no `rounded-[2.5rem]`, no `shadow-cozy-xl`, no `md:-translate-y-[8%]` art overflow
4. **Keep** Plan A heading style on the character name (`text-navy text-4xl md:text-5xl lg:text-6xl`)
5. **Bump art column size** since it now fills more viewport space — `max-w-[520px] lg:max-w-[560px]` instead of `max-w-[460px]`
6. **Typecheck + lint** — must pass
7. **Live smoke test** — render `/characters`, verify scenes stack and pin (will look incomplete until Phase 2 wires motion)

## Success Criteria

- [ ] `CharacterSection` accepts new `index` and `total` props
- [ ] Outer wrapper is `relative h-screen` with `zIndex: index`
- [ ] Inner is `md:sticky md:top-0 md:h-screen overflow-hidden`
- [ ] Per-character `surfaceTint` fills the entire scene
- [ ] Atmosphere + motif visible inside scene, clipped to scene bounds
- [ ] Grid layout + zig-zag preserved
- [ ] Character pose + content render correctly
- [ ] Heading uses Plan A `text-navy`
- [ ] File under 200 lines
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** Sticky doesn't work because of parent overflow-hidden or transform. *Mitigation:* the outer page (`app/characters/page.tsx`) must not have `overflow-hidden` on the scene-stack container; verified in Phase 2.
- **Risk:** `100vh` on iOS causes jumpy behavior due to address bar resize. *Mitigation:* use `100dvh` if needed (Phase 3 verification).
- **Risk:** Atmosphere/motif positioned absolute at viewport corners → still work at sticky-scene scale. *Mitigation:* test live; they're meant to drift inside section bounds anyway.
- **Risk:** Removing rounded card geometry loses Plan B's "premium" feel. *Mitigation:* full-bleed cinematic scenes ARE the new premium feel; this is the intent.

## Security Considerations

None.
