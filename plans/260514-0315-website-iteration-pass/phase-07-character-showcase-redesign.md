---
phase: 7
title: Character Showcase Redesign
status: completed
priority: P2
effort: 2h
dependencies: []
---

# Phase 7: Character Showcase Redesign

## Overview

Replace the uniform 5-col staggered grid with a magazine-style layout: 1 large featured rectangle on the left + a 2×2 grid of compact squares on the right. Add a subtle paw-print decorative background pattern across the whole section.

## Requirements

- Functional:
  - First character renders as a large featured card (~1.5fr width, taller aspect)
  - Remaining 4 characters render as compact squares in a 2×2 grid
  - Layout stacks vertically on mobile (featured on top, 2×2 below)
  - Paw-print pattern overlays section bg at ~8% opacity, deterministic positions
- Non-functional: no SSR hydration mismatch; typecheck/lint clean; no perf regression (pattern hidden on mobile to reduce DOM).

## Architecture

**Layout:**
- Grid: `md:grid-cols-[1.5fr_1fr]` puts featured on left, 2×2 sub-grid on right.
- Featured: CharacterCard with a new `variant="featured"` prop — taller aspect, larger typography.
- Sub-grid: 4 CharacterCards with `variant="compact"` — square aspect, smaller typography.

**Decoratives:**
- New file: `components/ui/paw-print-pattern.tsx`.
- Renders ~24 paw SVGs at randomized positions/rotations/scales.
- Uses seeded pseudo-random (same pattern as `AtmosphereLayer`) to avoid SSR hydration warnings.
- Opacity `text-ink/8` or `text-brand-gold/10`.
- Pattern hidden below md (`hidden md:block`) to save mobile cost.
- Reuses the `Paw` SVG already defined inline in `newsletter-cta.tsx:198–210` — extract to a shared util for DRY: new file `components/ui/paw-icon.tsx`, import from both `newsletter-cta.tsx` (existing CornerPaws) and new `paw-print-pattern.tsx`.

**CharacterCard variants:**
- Default (existing) → unchanged for `/characters/[slug]` detail pages.
- `featured` → `aspect-[3/4]` or `aspect-[4/5]`, bigger name/tagline typography, more padding.
- `compact` → `aspect-square`, smaller padding, name only (no tagline).

## Related Code Files

- Create: `components/ui/paw-icon.tsx` (extracted shared SVG)
- Create: `components/ui/paw-print-pattern.tsx` (new decorative bg component)
- Modify: `components/home/character-showcase.tsx` (full layout rewrite)
- Modify: `components/characters/character-card.tsx` (add `variant` prop)
- Modify: `components/home/newsletter-cta.tsx` (import shared `PawIcon`, remove inline copy)

## Implementation Steps

1. **Extract `PawIcon`** to `components/ui/paw-icon.tsx`:
   ```tsx
   export function PawIcon({ className }: { className?: string }) {
     return (
       <svg aria-hidden="true" viewBox="0 0 64 64" className={className}>
         <ellipse cx="32" cy="42" rx="14" ry="10" fill="currentColor" />
         <ellipse cx="14" cy="26" rx="6" ry="8" fill="currentColor" />
         <ellipse cx="50" cy="26" rx="6" ry="8" fill="currentColor" />
         <ellipse cx="22" cy="14" rx="5" ry="7" fill="currentColor" />
         <ellipse cx="42" cy="14" rx="5" ry="7" fill="currentColor" />
       </svg>
     );
   }
   ```
2. **Update `newsletter-cta.tsx`** `CornerPaws` to use `<PawIcon className="..." />` instead of inline SVG.
3. **Create `paw-print-pattern.tsx`**:
   ```tsx
   import { PawIcon } from "@/components/ui/paw-icon";

   function seededRand(seed: number) {
     const x = Math.sin(seed) * 10000;
     return x - Math.floor(x);
   }

   export function PawPrintPattern({ count = 24 }: { count?: number }) {
     const paws = Array.from({ length: count }, (_, i) => {
       const r1 = seededRand(i + 1);
       const r2 = seededRand(i + 100);
       const r3 = seededRand(i + 200);
       const r4 = seededRand(i + 300);
       return {
         top: `${r1 * 95}%`,
         left: `${r2 * 95}%`,
         rotate: r3 * 360,
         scale: 0.5 + r4 * 0.8,
       };
     });
     return (
       <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
         {paws.map((p, i) => (
           <PawIcon
             key={i}
             className="absolute h-10 w-10 text-ink/8 md:h-12 md:w-12"
             style={{
               top: p.top,
               left: p.left,
               transform: `rotate(${p.rotate}deg) scale(${p.scale})`,
             }}
           />
         ))}
       </div>
     );
   }
   ```
   Note: `PawIcon` may need to accept `style` prop too. Add it.
4. **Update `character-card.tsx`** to accept `variant?: "default" | "featured" | "compact"`:
   - Default keeps existing styling.
   - `featured` uses `aspect-[3/4]`, larger heading (e.g., `text-3xl md:text-4xl` for name), bigger tagline, more padding.
   - `compact` uses `aspect-square`, smaller heading (e.g., `text-lg`), hides tagline or shrinks to one line, smaller padding.
5. **Rewrite `character-showcase.tsx`**:
   ```tsx
   import { CharacterCard } from "@/components/characters/character-card";
   import { PawPrintPattern } from "@/components/ui/paw-print-pattern";
   import { content } from "@/lib/content";

   export async function CharacterShowcase() {
     const characters = await content.getCharacters();
     return (
       <section id="meet-the-pack" className="relative scroll-mt-24 overflow-hidden bg-paper py-24 md:py-32">
         <PawPrintPattern />
         <div className="relative mx-auto max-w-hero px-4 md:px-8">
           <header className="text-center">
             <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-gold md:text-sm">
               Explore Characters
             </p>
             <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-6xl lg:text-7xl">
               Meet the Whole Pack
             </h2>
             <p className="mx-auto mt-4 max-w-2xl text-base text-ink/85 md:text-lg">
               Five distinct pups, each with their own quirks, songs, and favourite napping spots.
             </p>
           </header>
           <div className="mt-14 grid gap-5 md:grid-cols-[1.5fr_1fr] md:gap-6 lg:gap-8">
             <CharacterCard character={characters[0]} variant="featured" />
             <div className="grid grid-cols-2 gap-5 md:gap-6 lg:gap-8">
               {characters.slice(1, 5).map((c) => (
                 <CharacterCard key={c.slug} character={c} variant="compact" />
               ))}
             </div>
           </div>
         </div>
       </section>
     );
   }
   ```
6. Run `pnpm typecheck` + `pnpm lint` + `pnpm build`.
7. Visual smoke: layout, mobile stack, paw-print density/opacity, hover states on all cards.

## Success Criteria

- [ ] Section uses featured-left + 2×2-right magazine layout on md+
- [ ] Stacks vertically on mobile
- [ ] Paw-print pattern visible at low opacity across section bg (md+ only)
- [ ] No SSR hydration warnings (paw positions deterministic)
- [ ] `PawIcon` extracted and reused (newsletter + new pattern)
- [ ] Character detail pages (`/characters/[slug]`) unaffected
- [ ] typecheck + lint + build clean

## Risk Assessment

- **Risk:** SSR/client mismatch on randomized paw positions. **Mitigation:** seeded pseudo-random ensures deterministic positions across SSR + client; same pattern as existing `AtmosphereLayer`.
- **Risk:** Pattern too busy or too subtle. **Mitigation:** tunable via `count` prop (default 24) and opacity (default `text-ink/8` ≈ 8%).
- **Risk:** CharacterCard variants leak into `/characters/[slug]` pages. **Mitigation:** default variant unchanged; only opt-in via prop.
- **Risk:** Mobile stacks too long with featured + 2×2 = 5 stacked cards. **Mitigation:** featured uses smaller aspect on mobile (`aspect-square` instead of `aspect-[3/4]`) to compress total height.
- **Risk:** Increased DOM (24 SVGs + new wrappers) hurts mobile perf. **Mitigation:** pattern is `hidden md:block` so mobile DOM unchanged; SVGs are tiny (~80 bytes each).
