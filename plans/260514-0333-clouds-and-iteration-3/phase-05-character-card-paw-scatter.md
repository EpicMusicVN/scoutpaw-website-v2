---
phase: 5
title: Character Card Paw Scatter
status: completed
priority: P2
effort: 30m
dependencies: []
---

# Phase 5: Character Card Paw Scatter

## Overview

Add a scattered paw-print overlay inside each character card's accent backdrop (behind the character image). Subtle (8-15% opacity), reuses the `<PawIcon>` component. Replaces the "flat color only" appearance per user brief.

## Requirements

- Functional:
  - Each character card shows 4-6 paw prints scattered on its accent backdrop
  - Paws sit BEHIND the character image (image always wins visually)
  - Positions/rotations fixed (deterministic, same across cards)
- Non-functional:
  - No SSR hydration mismatch
  - typecheck + lint clean
  - No noticeable perf regression

## Architecture

- Inside `character-card.tsx`, add a small `<CardPawScatter />` helper render call inside the card backdrop div.
- 4-6 paw positions hand-tuned (no random — same positions on every card = visual consistency).
- Opacity: `text-white/15` (visible against any accent color since accent colors are mid-saturation hex like `#FFB627`, `#5BC0EB`).
- Alternative: `text-ink/12` for darker accent colors — test which reads better, default to white.

## Related Code Files

- Modify: `components/characters/character-card.tsx`

## Implementation Steps

1. Add a `CardPawScatter` helper component at the bottom of `character-card.tsx`:
   ```tsx
   function CardPawScatter() {
     const paws = [
       { top: "8%",  left: "12%", rotate: -15, scale: 0.7 },
       { top: "20%", left: "78%", rotate: 25,  scale: 0.5 },
       { top: "60%", left: "8%",  rotate: 40,  scale: 0.6 },
       { top: "72%", left: "82%", rotate: -25, scale: 0.5 },
       { top: "35%", left: "45%", rotate: 10,  scale: 0.4 },
     ];
     return (
       <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden text-white/15">
         {paws.map((p, i) => (
           <PawIcon
             key={i}
             className="absolute h-10 w-10"
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
2. Import `PawIcon` at the top:
   ```tsx
   import { PawIcon } from "@/components/ui/paw-icon";
   ```
3. Inside the card backdrop div (where the hover ring is), add `<CardPawScatter />` BEFORE the `<Image />`:
   ```tsx
   <div className="relative ... rounded-[2rem] ..." style={{ backgroundColor: character.accentColor }}>
     <CardPawScatter />
     {/* existing hover ring div */}
     {/* existing Image */}
   </div>
   ```
4. Run `pnpm typecheck` + `pnpm lint`.
5. Visual smoke: confirm paws visible on each card but not distracting from character image.

## Success Criteria

- [ ] Each character card shows scattered paw prints on accent backdrop
- [ ] Paws are subtle (visible but not noisy)
- [ ] Character image is the focal point (paws fade into background)
- [ ] No SSR hydration warnings
- [ ] typecheck + lint clean

## Risk Assessment

- **Risk:** White paws look bad on Bella's brown `#9C6644` accent. **Mitigation:** test visually; may need per-card opacity tuning OR use `text-white/20` for all (slightly stronger).
- **Risk:** Paws clash with character image edges. **Mitigation:** image has padding inside card; paws scatter around the image's visual footprint. Position values may need fine-tuning.
- **Risk:** Featured-variant card (larger) has paws looking sparse. **Mitigation:** scale up paw count or size for featured if needed — but start uniform for KISS.
