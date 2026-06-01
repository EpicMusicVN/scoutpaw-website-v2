---
phase: 2
title: "Carousel Card Rebuild"
status: completed
priority: P1
effort: "3h"
dependencies: []
---

# Phase 2: Carousel Card Rebuild

## Overview

Rebuild the carousel card: the character pose dominates the slide and stands on
a small solid signature-color nameplate showing only the name + tagline.

## Requirements

- Functional: pose dominates (~76% of slide); a solid `accentColor` nameplate
  (~22-25% slide height) at the bottom holds `name` + `tagline` only; the whole
  card opens the detail on click + keyboard.
- Non-functional: file < 200 lines; valid HTML; AA contrast via auto text
  color; visible focus ring; consistent character sizing; `priority` on the
  first 3 poses.

## Architecture

Reverses the v6 white content card. New composition (stretched-button-overlay
pattern kept — a transparent `<button>` over a semantic `<article>`):

```
<article class="group relative h-full">
  <bloom span>                              ← subtle themed glow behind pose
  <pose div: absolute, upper ~76%>           ← Image fill object-contain object-bottom
  <nameplate div: absolute bottom, ~24%>     ← solid accentColor, rounded, shadow
     <h3 name>  <p tagline>                  ← auto-contrast text color
  <button absolute inset-0 z-10>             ← click/focus target
</article>
```

Character "stands on" the nameplate: the pose's `object-bottom` baseline sits
at the nameplate's top edge (small overlap so it reads as standing ON it). The
card height ratio makes the character ≈ 4× the nameplate height.

**Auto-contrast text:** compute inline from `accentColor`. Parse the hex →
relative luminance → if light, use `ink` (#2b1d10); if dark, use `#fff`.
accentColors: Max `#FFB627` + Bella `#B8A1D9` + Rocky `#5BC0EB` + Buddy
`#F4A261` → ink; Oscar `#9C6644` → white. One consumer → inline, no shared util.

## Related Code Files

- Modify: `components/characters/character-carousel-card.tsx` (full rebuild)
- Read for context: `content/characters.json` (accentColors), v6 card for the
  bloom/pose treatment to carry over

## Implementation Steps

1. **`character-carousel-card.tsx`** — rebuild. Keep props
   `{ character, theme, priority, onSelect }`; `onSelect` keeps
   `(event: React.MouseEvent) => void`. `theme` is unused now (`void theme` or
   drop it from destructure — keep the prop for call-site symmetry).
2. Auto-contrast helper — a small inline function:
   ```ts
   function readableText(hex: string): string {
     const h = hex.replace("#", "");
     const r = parseInt(h.slice(0, 2), 16) / 255;
     const g = parseInt(h.slice(2, 4), 16) / 255;
     const b = parseInt(h.slice(4, 6), 16) / 255;
     // Perceived luminance (sRGB-weighted).
     const lum = 0.299 * r + 0.587 * g + 0.114 * b;
     return lum > 0.6 ? "#2b1d10" : "#ffffff";
   }
   ```
3. Structure (see Architecture):
   - Root `<article className="group relative h-full select-none">`.
   - Subtle themed bloom `<span>` behind the pose (carry from v6, retune).
   - **Pose** — `<div>` absolute, occupies the upper region down to ~`bottom-[22%]`
     (so the pose's object-bottom baseline meets the nameplate top). `next/image`
     `fill`, `object-contain object-bottom`, `priority={priority}`, `sizes`
     tuned for ~31vw desktop, drop-shadow. `pointer-events-none`.
   - **Nameplate** — `<div className="absolute inset-x-1 bottom-0 h-[24%]
     rounded-[2rem] shadow-cozy ...">` with `style={{ backgroundColor:
     accentColor }}`. Inside, centred: `<h3>` name (large bold `font-display`)
     + `<p>` tagline (one line, smaller, uppercase tracked). Both get
     `style={{ color: readableText(accentColor) }}` (tagline can use the same
     color at reduced opacity).
   - **Overlay button** — `<button absolute inset-0 z-10 rounded-[2rem]
     aria-label={\`Open ${name}'s profile\`} onClick={onSelect}>` with the
     focus-visible ring.
4. Hover — `group-hover` pose rise (`-translate-y`), subtle nameplate shadow
   deepen. Keep `ease-gentle`, ~300ms.
5. Consistent sizing — the pose box has a fixed height fraction; normalized PNGs
   + `object-contain object-bottom` keep every character the same scale.
6. Run `pnpm typecheck` + `pnpm lint`.

## Success Criteria

- [ ] Character pose dominates; a small solid-accentColor nameplate sits at the
      bottom (~¼ of character height)
- [ ] Character visually stands on the nameplate
- [ ] Nameplate shows only name + tagline; auto-contrast text is AA on all 5
      characters (incl. Oscar's dark brown)
- [ ] Whole card opens detail on click + keyboard; drag does not mis-fire
- [ ] Valid HTML; visible focus ring; consistent character sizing
- [ ] File < 200 lines; `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Contrast on mid-tone accents** → the 0.6 luminance threshold is a starting
  value; verify all 5 in browser (Phase 4 QA), nudge the threshold if a
  mid-tone (Rocky/Buddy) reads poorly.
- **Pose/nameplate overlap** → percentage-based absolute positioning; tune the
  overlap in browser so the character clearly "stands on" the plate.
