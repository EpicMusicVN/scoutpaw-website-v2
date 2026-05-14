---
phase: 1
title: FullBleedHero glass blob refactor
status: completed
priority: P2
effort: 20m
dependencies: []
---

# Phase 1: FullBleedHero glass blob refactor

## Overview

Replace the rounded-rectangle glass card with a soft, mask-faded glass blob. The new structure separates the visual glass layer (background, blurred, masked) from the text content (full opacity, in front). Edges fade smoothly into the banner imagery instead of terminating at a hard rectangle.

## Requirements

**Functional**
- Hero card on Home + Shop reads as a soft glow centered around the text, not a UI rectangle.
- Backdrop blur still applies behind the text region.
- Text (kicker + title + description) remains fully legible.
- Top-left placement preserved (from iter-3).

**Non-functional**
- Shared component — single change benefits both pages.
- Mobile in-flow card path UNCHANGED.
- No new components, no new design tokens, no new dependencies.
- Graceful degradation: older browsers that ignore `mask-image` render the blob as a soft rectangle (no critical regression).

## Architecture

`components/home/full-bleed-hero.tsx` — desktop overlay block at lines ~92-101.

**Current (iter-3):**

```jsx
<div className="pointer-events-none absolute inset-0 hidden items-start md:flex">
  <div className="pointer-events-auto mx-auto w-full max-w-hero px-8 pt-12 lg:pt-16">
    <div className="max-w-sm rounded-2xl border border-white/40 bg-white/55 px-6 py-5 shadow-cozy backdrop-blur-xl lg:max-w-md lg:px-7 lg:py-6">
      <CardBody />
    </div>
  </div>
</div>
```

**New:**

```jsx
<div className="pointer-events-none absolute inset-0 hidden items-start md:flex">
  <div className="pointer-events-auto mx-auto w-full max-w-hero px-8 pt-12 lg:pt-16">
    <div className="relative max-w-sm px-8 py-7 lg:max-w-md lg:px-10 lg:py-9">
      {/* Glass blob — soft white tint + backdrop-blur, edges fade via radial
          mask so the card reads as a cinematic glow, not a UI rectangle.
          inset-[-1.5rem] extends the blob beyond the text container so the
          fade has falloff room. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-1.5rem] bg-white/55 backdrop-blur-xl"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 95%)",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 95%)",
        }}
      />
      {/* Text content sits above the blob at full opacity. */}
      <div className="relative">
        <CardBody />
      </div>
    </div>
  </div>
</div>
```

**Net changes:**
- Outer overlay container (`items-start` + `pt-12 lg:pt-16`): unchanged.
- Width/padding container: `max-w-sm rounded-2xl border bg-white/55 shadow-cozy backdrop-blur-xl` → `relative max-w-sm px-8 py-7 lg:max-w-md lg:px-10 lg:py-9`. Drops rectangle styling entirely; just provides padding + width.
- New aria-hidden glass-blob div: bg + blur + mask.
- New `relative` text wrapper ensures text layers above blob.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx` (desktop overlay block ~lines 92-101)

## Implementation Steps

1. Open `components/home/full-bleed-hero.tsx`. Locate the desktop overlay block at lines ~92-101.
2. Replace the existing inner card div with the new two-layer structure (outer padding container + absolute glass blob + relative text wrapper).
3. Update the JSX comment above the desktop overlay to reflect the new "glass blob" behavior.
4. Run `pnpm typecheck`. Halt on errors.
5. Run `pnpm lint`. Halt on new errors.
6. Boot dev server, verify on `/` and `/shop` at 768/1024/1440:
   - Hero card reads as a soft glow centered around the text.
   - No visible rectangle border or hard edges.
   - Text fully legible.
   - Mobile path (≤md) unchanged.
7. If kicker or description edges fade too much, bump the inner mask radius from `35%` → `45%`.

## Success Criteria

- [ ] Old rounded-rectangle card classes removed
- [ ] New outer padding container with `relative` positioning in place
- [ ] Glass-blob div present with `bg-white/55 backdrop-blur-xl` + radial mask
- [ ] Text wrapper has `relative` so content stacks above blob
- [ ] Text fully legible at all breakpoints
- [ ] Mobile in-flow card path unchanged
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean

## Risk Assessment

- **Mask + backdrop-filter compositing fails on old browsers** — symptom: blur becomes a hard rectangle ignoring the mask. Acceptable degradation. Modern browsers (Chrome 88+, Safari 14+, Firefox 103+) render correctly.
- **Text edges fade too much (kicker at top, description at bottom)** — bump mask inner stop from `35%` → `45%` or `50%`. Visual judgment after first render.
- **Banner imagery shows through too clearly at edges** — desired effect per user. If readability suffers, bump bg opacity from `bg-white/55` → `bg-white/65` or `/70`.
- **Glass blob shadow expectations** — previous design had `shadow-cozy`. Now no shadow. Acceptable per user intent ("less like a floating UI card"). If a soft glow shadow is missed, add `drop-shadow` filter on the blob (renders as a soft halo around the masked shape).
- **Hover/focus states on CTAs** — N/A; CTAs were removed in iter-3.
