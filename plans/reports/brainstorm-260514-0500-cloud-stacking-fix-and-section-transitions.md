# Brainstorm — Cloud Stacking Fix + Section Transition System

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Refactor cloud system architecture. Fix z-index conflict between SideClouds and section content. Convert CloudDividers from absolute-inside-sections to block-between-sections. Add transitions at 5 section boundaries.

---

## Root-Cause Diagnosis

**Why removing `bg-paper` last cook didn't fully fix the issue:**

CSS painting order within `body`:
1. Body bg (cyan)
2. Non-positioned in-flow elements (sections)
3. Positioned z-auto elements (sections with `relative`)
4. Positioned z-0 elements (SideClouds with `fixed z-0`)
5. Higher z-index elements (TopNav, ScrollProgress)

SideClouds at `z-0` paints AFTER sections. With `pointer-events-none` they don't block clicks, but visually they DO sit over the section content in the gutters.

**Compounding issue:** CloudDivider inside CharacterShowcase uses `absolute inset-x-0` which spans FULL viewport width including the gutters. Its opaque-white wave bar covers SideClouds in those gutters as user scrolls.

**Fix:**
1. Move SideClouds to `z-[-1]` so it paints BEHIND in-flow content but above body bg.
2. Refactor CloudDivider from absolute-inside-section → block-element-between-sections in `app/page.tsx`. Constrains the white wave to its own slot, eliminates "white bar in gutters" issue.

---

## Locked Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Cloud arch | Block-between-sections dividers + SideClouds at z-[-1] |
| 2 | Divider count | 5 transitions per user brief |
| 3 | Divider shape | Reuse existing CloudDivider (cloud-bumpy wave) |

---

## File-by-File Change Set

### 1. `components/ui/cloud-divider.tsx` — Refactor to block element

```tsx
/**
 * Soft white cloud-shaped section divider. Block element designed to sit
 * BETWEEN sections (in app/page.tsx or page wrappers). Renders an h-12/h-16
 * SVG wave that fills with white below the wave line — clouds peek up from
 * below into the lower section.
 *
 * Use `flip` prop to mirror vertically when the visual direction needs to
 * reverse (clouds peek DOWN from above into the section below).
 */
export function CloudDivider({
  flip = false,
  opacity = 0.75,
  className,
}: {
  flip?: boolean;
  opacity?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      className={`block w-full h-12 md:h-16 ${flip ? "rotate-180" : ""} ${className ?? ""}`}
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

Changes from existing:
- Drop `absolute inset-x-0 top-0/bottom-0` → `block w-full`
- Drop `position` prop, replace with `flip` boolean (cleaner semantic)
- Component is now an in-flow block element

### 2. `components/home/menu-cards.tsx` — Remove inside-section CloudDividers

```tsx
// Before
<section className="relative mx-auto max-w-hero overflow-hidden px-4 py-20 md:px-8 md:py-28">
  <CloudDivider position="top" opacity={0.6} />
  <CloudDivider position="bottom" opacity={0.6} />
  ...
</section>

// After
<section className="relative mx-auto max-w-hero overflow-hidden px-4 py-20 md:px-8 md:py-28">
  ...
</section>
```

Drop both `<CloudDivider>` calls. Drop the `CloudDivider` import.

### 3. `components/home/character-showcase.tsx` — Remove inside-section CloudDivider

```tsx
// Before
<section id="meet-the-pack" className="relative scroll-mt-24 overflow-hidden py-24 md:py-32">
  <CloudDivider position="top" opacity={0.65} />
  <PawPrintPattern />
  ...
</section>

// After
<section id="meet-the-pack" className="relative scroll-mt-24 overflow-hidden py-24 md:py-32">
  <PawPrintPattern />
  ...
</section>
```

Drop `<CloudDivider>` + import.

### 4. `app/page.tsx` — Place block dividers between sections

```tsx
import { CharacterShowcase } from "@/components/home/character-showcase";
import { FeatureBanner } from "@/components/home/feature-banner";
import { FeaturedPupSpotlight } from "@/components/home/featured-pup-spotlight";
import { FullBleedHero } from "@/components/home/full-bleed-hero";
import { MenuCards } from "@/components/home/menu-cards";
import { NewsletterCTA } from "@/components/home/newsletter-cta";
import { VideoGrid } from "@/components/home/video-grid";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CloudDivider } from "@/components/ui/cloud-divider";

export default async function HomePage() {
  return (
    <>
      <FullBleedHero ... />

      <CloudDivider />  {/* Hero → MenuCards */}

      <ScrollReveal>
        <MenuCards />
      </ScrollReveal>

      <CloudDivider />  {/* MenuCards → Pack Leader */}

      <ScrollReveal>
        <FeaturedPupSpotlight />
      </ScrollReveal>

      <ScrollReveal>
        <CharacterShowcase />
      </ScrollReveal>

      <CloudDivider />  {/* CharacterShowcase → FeatureBanner */}

      <ScrollReveal>
        <FeatureBanner ... />
      </ScrollReveal>

      <CloudDivider />  {/* FeatureBanner → VideoGrid */}

      <ScrollReveal>
        <VideoGrid />
      </ScrollReveal>

      <CloudDivider />  {/* VideoGrid → Newsletter (5th transition: maps to "Shop → Join the Pack") */}

      <ScrollReveal>
        <NewsletterCTA ... />
      </ScrollReveal>
    </>
  );
}
```

5 dividers placed at the 5 transitions specified.

Note: There is NO divider between FeaturedPupSpotlight and CharacterShowcase (Pack Leader → Char). Per the brainstorm question, only the 5 user-specified spots. If visual rhythm needs it, add later.

### 5. `components/ui/side-clouds.tsx` — z-[-1] for back-of-content layer

```tsx
// Before
<div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden xl:block">

// After
<div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden xl:block">
```

Why `-z-10` (Tailwind's `z-[-10]`) instead of `z-[-1]`:
- Same effective stacking position (behind all positive z content)
- Tailwind utility available out-of-box
- More predictable across modern browsers

**Risk verification:** body element should NOT create a stacking context. Quick grep confirms body has only `font-body` class + suppressHydrationWarning attr → no transform, opacity, isolation. So `-z-10` on fixed children paints behind in-flow content but above body bg.

---

## Phased Execution

| Phase | Item | Risk | Effort |
|---|---|---|---|
| P1 | CloudDivider refactor (block element + flip prop) | Low | 10m |
| P2 | Remove CloudDivider from MenuCards | Trivial | 2m |
| P3 | Remove CloudDivider from CharacterShowcase | Trivial | 2m |
| P4 | Add CloudDividers in app/page.tsx (5 transitions) | Low | 10m |
| P5 | SideClouds z-0 → -z-10 | Trivial | 2m |

**Total: ~30m**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Refactored CloudDivider visual diff from prior placement | Medium | Block-element renders same SVG wave, just in flow vs absolute. Wave shape unchanged. Should look near-identical. |
| 5 dividers feels too busy | Medium | All at low opacity (0.75 default). Each only 48-64px tall. Total added vertical space: ~250-320px across the home page. Acceptable. Tunable later. |
| -z-10 on SideClouds clipped by an unexpected stacking context | Low | Grep audit shows body has no transform/opacity/isolation. ScrollProgress + TopNav + Footer don't wrap content. Should work. |
| Block divider breaks existing scroll-mt-24 anchor positioning | Low | Section's own scroll-mt handles offset; CloudDivider sits between sections in flow, not affecting in-section anchors. |
| FeaturedPupSpotlight (Pack Leader) is already in a card — divider before it competes with card border | Low | Cyan body bg between divider and card creates a buffer. Divider wave + card top create layered transition (intentional). |

---

## Success Criteria

- CharacterShowcase scroll no longer shows clouds covering content in gutters
- SideClouds at widescreen (≥1280px) remain visible AND behind in-flow content
- 5 transitions show CloudDivider between sections
- No more white wave bars in section gutters covering SideClouds
- typecheck + lint + build clean

---

## Out of Scope (Explicit)

- Hero changes
- Banner artwork
- Newsletter / footer / Pack Leader card adjustments
- New cloud shape variants beyond existing 4
- Mobile-only divider variants

---

## Unresolved Questions

None. Ready to plan + cook.
