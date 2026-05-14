---
phase: 6
title: Cloud Divider Component
status: completed
priority: P2
effort: 1h
dependencies: []
---

# Phase 6: Cloud Divider Component

## Overview

Build a reusable `<CloudDivider>` SVG component for soft white cloud-shaped section transitions. Place at 3-4 strategic spots: hero corners, section transitions between major home sections. Avoid overuse (user brief: "subtle, not noisy").

## Requirements

- Functional:
  - `<CloudDivider position="top|bottom" />` renders a soft cloud-shaped SVG band
  - 3-4 placements on home page (no more — over-decoration risk)
- Non-functional:
  - SVG-only, no runtime JS
  - Hidden on extreme-narrow mobile if needed (DOM cost minimal but cloud may look squashed)
  - typecheck + lint clean

## Architecture

- New file `components/ui/cloud-divider.tsx`.
- SVG with a wave-like path that resembles cloud bumps (multiple ellipses chained smoothly).
- Default: white fill, 75% opacity (so it tints with section bg below/above).
- `position` prop swaps top/bottom rotation.
- Companion to `SectionCurve` (which uses solid color waves) — both can coexist.

**Placement strategy:**
1. Hero corner top-right — small `<CloudDivider />` floating decorative inside hero section.
2. Bottom of `<MenuCards>` → top of `<FeaturedPupSpotlight>` — cloud transition.
3. Top of `<CharacterShowcase>` — cloud frame above magazine layout.
4. (Optional) above newsletter section — clouds fade into yellow gradient.

## Related Code Files

- Create: `components/ui/cloud-divider.tsx`
- Modify: `components/home/full-bleed-hero.tsx` (add small cloud in corner)
- Modify: `components/home/menu-cards.tsx` (bottom cloud divider)
- Modify: `components/home/character-showcase.tsx` (top cloud divider)

## Implementation Steps

1. Create `components/ui/cloud-divider.tsx`:
   ```tsx
   /**
    * Soft white cloud divider for section transitions. Uses a wave-like SVG path
    * with smooth cloud-shaped bumps. Pure decorative; aria-hidden.
    */
   export function CloudDivider({
     position = "bottom",
     opacity = 0.75,
     height = "h-12 md:h-16",
   }: {
     position?: "top" | "bottom";
     opacity?: number;
     height?: string;
   }) {
     return (
       <svg
         aria-hidden
         viewBox="0 0 1440 100"
         preserveAspectRatio="none"
         className={`absolute inset-x-0 ${position === "top" ? "top-0" : "bottom-0"} w-full ${height} ${position === "top" ? "rotate-180" : ""}`}
       >
         <path
           d="M0,55 C 60,15 130,80 210,45 S 360,5 450,40 S 600,85 700,45 S 870,5 970,45 S 1130,85 1220,45 S 1380,5 1440,40 L1440,100 L0,100 Z"
           fill="white"
           opacity={opacity}
         />
       </svg>
     );
   }
   ```
2. Add to `character-showcase.tsx` (top of section, inside the wrapper):
   ```tsx
   <section id="meet-the-pack" className="relative scroll-mt-24 overflow-hidden bg-paper py-24 md:py-32">
     <CloudDivider position="top" />
     <PawPrintPattern />
     {/* ... */}
   </section>
   ```
3. Add to `menu-cards.tsx` (bottom of section). Verify section wrapper has `relative overflow-hidden`.
4. Add a small floating cloud inside hero (top-right corner) — limited size:
   ```tsx
   <div className="pointer-events-none absolute right-4 top-4 hidden h-12 w-32 md:block">
     <CloudDivider position="bottom" opacity={0.55} height="h-full" />
   </div>
   ```
   Or simpler: use a static `<svg>` with cloud ellipses for the hero corner.
5. Run `pnpm typecheck` + `pnpm lint` + `pnpm build`.
6. Visual smoke at desktop / tablet / mobile.

## Success Criteria

- [ ] `<CloudDivider>` component renders a soft cloud-shaped SVG band
- [ ] 3-4 placements on home page (counts: hero corner, MenuCards bottom, CharacterShowcase top, optional newsletter)
- [ ] Clouds feel subtle and dreamy, not noisy
- [ ] Section bg colors show through cloud opacity (creates blended transition feel)
- [ ] typecheck + lint + build clean

## Risk Assessment

- **Risk:** Cloud wave path doesn't look cloud-like enough. **Mitigation:** iterate path. Alternative: use 5-7 absolute-positioned ellipses for explicit "cloud bumps" look.
- **Risk:** Cloud at hero top-right corner clashes with navbar shadow. **Mitigation:** hero corner cloud is decorative — limit size to ~32×128px so it reads as accent, not divider.
- **Risk:** Cloud opacity 0.75 too strong on white sections / too weak on cyan. **Mitigation:** opacity is a prop, can tune per placement.
- **Risk:** Pure white path against cyan section may look like a bald patch. **Mitigation:** soft opacity (0.55–0.75) lets cyan tint through; reads as "soft cloud" not "white block".
