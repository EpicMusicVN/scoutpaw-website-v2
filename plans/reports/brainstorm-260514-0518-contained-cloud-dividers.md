# Brainstorm — Contained Cloud Dividers (Floating Cluster)

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Redesign CloudDivider from full-width wave to a centered 3-mini-cloud cluster. Re-add at the same 5 home-page transitions.

---

## Honest Framing

- **Session reversal count: 5** (yellow spine, italic subtitle, GrassStrip recolor, yellow hero zone, full-width dividers).
- This round restores dividers in a new contained form — reasonable design direction. Just noting the pattern.

---

## Locked Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Divider visual | 3 mini cloud blobs in a horizontal row, varying sizes/opacities |
| 2 | Container | `max-w-md mx-auto` (~448px), centered |
| 3 | Placement | Same 5 home transitions (Hero→Menu, Menu→Pack, Char→Shop, Shop→Video, Video→Newsletter) |

---

## File-by-File Change Set

### 1. `components/ui/cloud-divider.tsx` — Redesign to cluster

```tsx
/**
 * Decorative cloud-cluster divider for between-sections placement. Renders
 * three mini cloud blobs in a horizontal row inside a centered max-w-md
 * container. Soft, contained, doesn't span full viewport width.
 *
 * Block-level element; pure decorative; aria-hidden.
 */
export function CloudDivider({
  opacity = 0.7,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`mx-auto flex max-w-md items-center justify-center gap-3 py-6 md:gap-4 md:py-8 ${className ?? ""}`}
    >
      <MiniCloud className="h-7 w-14 md:h-8 md:w-16" opacity={opacity * 0.6} />
      <MiniCloud className="h-10 w-20 md:h-12 md:w-24" opacity={opacity} />
      <MiniCloud className="h-7 w-14 md:h-8 md:w-16" opacity={opacity * 0.6} />
    </div>
  );
}

function MiniCloud({ className, opacity }: { className: string; opacity: number }) {
  return (
    <svg
      viewBox="0 0 80 50"
      aria-hidden
      className={className}
      style={{ opacity }}
    >
      <ellipse cx="20" cy="30" rx="16" ry="11" fill="white" />
      <ellipse cx="45" cy="22" rx="22" ry="16" fill="white" />
      <ellipse cx="65" cy="30" rx="14" ry="10" fill="white" />
    </svg>
  );
}
```

**Replaces:** the prior wave-SVG that spanned `w-full`. Now block element with `max-w-md` container, 3 mini cloud SVGs in a row. Outer + middle cloud sizes differ for visual rhythm.

**Side-effect-free for callers:** The component API stays — `opacity` + `className` props. Removes `flip` (no longer needed for symmetric cluster).

**Visual outcome:**
```
[ section content ]
              ☁  ☁☁  ☁
[ section content ]
```

### 2. `app/page.tsx` — Re-add the 5 placements

```tsx
import { CloudDivider } from "@/components/ui/cloud-divider";

// ... in body:
<FullBleedHero ... />
<CloudDivider />
<ScrollReveal><MenuCards /></ScrollReveal>
<CloudDivider />
<ScrollReveal><FeaturedPupSpotlight /></ScrollReveal>
<ScrollReveal><CharacterShowcase /></ScrollReveal>
<CloudDivider />
<ScrollReveal><FeatureBanner ... /></ScrollReveal>
<CloudDivider />
<ScrollReveal><VideoGrid /></ScrollReveal>
<CloudDivider />
<ScrollReveal><NewsletterCTA ... /></ScrollReveal>
```

Same 5 transitions as the (now-removed) full-width version.

---

## Phased Execution

Single small phase:

| Phase | Item | Effort |
|---|---|---|
| P1 | Redesign CloudDivider to cluster + re-add 5 placements in app/page.tsx | 10m |

**Total: ~10m**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| `max-w-md` (448px) too narrow on widescreens (looks lost in viewport) | Low | Container has `mx-auto` centering. 448px is the "comfortable reading width" zone; clouds read as intentional decoration vs banner. |
| Cluster overlaps SideClouds in widescreen gutters | None | Cluster is centered in content area, SideClouds in gutters. They sit in different horizontal zones. |
| 5 instances feel too dense | Medium | Each is ~80-100px tall total (incl. py-6/8). Lighter than wave version. Tunable. |
| `py-6 md:py-8` adds vertical space (~96-128px total per divider, 480-640px total over 5) | Acceptable | Adds breathing room; doesn't bloat sections themselves. |

---

## Success Criteria

- CloudDivider renders 3 mini clouds centered in a `max-w-md` container
- 5 dividers re-placed in `app/page.tsx`
- No full-width white wave bars
- typecheck + lint clean

---

## Out of Scope

- Hero changes
- Banner artwork
- Card chrome adjustments
- Other-page reuse (shop/watch/about/activities — defer; user mentioned in brief but priority is home)
- SideClouds / paw decoratives

---

## Unresolved Questions

None.
