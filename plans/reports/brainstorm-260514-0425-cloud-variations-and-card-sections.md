# Brainstorm — Cloud Variations + Section Cards (Pack Leader, Shop)

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** 7 changes. Cloud variety, View All standardization, Pack Leader + Shop → card containers, Character Showcase aspect adjust, Newsletter spacing audit, character paw verify.

---

## Honest Framing

- Hero is **not** touched this round — first time in 5 iterations. Stable.
- Both remaining yellow gradient sections (Pack Leader + Shop) become contained cards. Yellow stays inside the cards.
- User asks for paw scatter again — already shipped last cook. Verify-only this round (likely browser cache or unviewed).
- Newsletter spacing — likely visual perception; audit before changing.

---

## Locked Decisions (User-Confirmed)

| # | Item | Decision |
|---|---|---|
| 1 | Side clouds | 4 distinct SVG shapes (long-soft, fluffy-round, stretched, mini) + size/opacity variation |
| 2 | View All button | Wrap in `<Button variant="outline" size="sm">` — site-standard button |
| 3 | Pack Leader | Convert to contained card; KEEP warm-tan/yellow gradient inside |
| 4 | Shop the Pack (FeatureBanner) | Same treatment as Pack Leader (consistent) |
| 5 | Character Showcase featured | `aspect-[1/2]` (tall column matching 2-row stack) |
| 6 | Character paw scatter | Verify only — already shipped; no code change |
| 7 | Newsletter spacing | Audit surrounding sections, fix only if real asymmetry exists |

---

## File-by-File Change Set

### 1. `components/ui/side-clouds.tsx` — Cloud variety

Replace single-shape `<CloudBlob>` with multiple variants:

```tsx
function LongCloud({ className, opacity }: ...) {
  // Wide, flat — like a horizontal streak
  return (
    <svg viewBox="0 0 180 50" ...>
      <ellipse cx="30" cy="35" rx="22" ry="12" fill="white" />
      <ellipse cx="65" cy="28" rx="30" ry="18" fill="white" />
      <ellipse cx="105" cy="30" rx="28" ry="15" fill="white" />
      <ellipse cx="145" cy="34" rx="22" ry="13" fill="white" />
      <ellipse cx="170" cy="38" rx="10" ry="8" fill="white" />
    </svg>
  );
}

function FluffyCloud({ className, opacity }: ...) {
  // Rounded, taller, fluffier
  return (
    <svg viewBox="0 0 120 80" ...>
      <ellipse cx="30" cy="55" rx="26" ry="18" fill="white" />
      <ellipse cx="58" cy="40" rx="32" ry="24" fill="white" />
      <ellipse cx="90" cy="50" rx="24" ry="18" fill="white" />
    </svg>
  );
}

function StretchedCloud({ className, opacity }: ...) {
  // Very wide, narrow — cinematic horizon
  return (
    <svg viewBox="0 0 220 40" ...>
      <ellipse cx="40" cy="25" rx="32" ry="10" fill="white" />
      <ellipse cx="100" cy="20" rx="40" ry="12" fill="white" />
      <ellipse cx="170" cy="24" rx="35" ry="11" fill="white" />
      <ellipse cx="210" cy="28" rx="12" ry="6" fill="white" />
    </svg>
  );
}

function MiniCloud({ className, opacity }: ...) {
  // Small, compact
  return (
    <svg viewBox="0 0 80 50" ...>
      <ellipse cx="20" cy="30" rx="16" ry="11" fill="white" />
      <ellipse cx="45" cy="22" rx="22" ry="16" fill="white" />
      <ellipse cx="65" cy="30" rx="14" ry="10" fill="white" />
    </svg>
  );
}

export function SideClouds() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden xl:block">
      {/* Mix of 4 shapes at various heights/sides/opacities */}
      <LongCloud className="left-0 top-[12%] h-16 w-44" opacity={0.5} />
      <FluffyCloud className="left-4 top-[42%] h-24 w-32" opacity={0.6} />
      <MiniCloud className="left-6 top-[68%] h-14 w-24" opacity={0.45} />
      <StretchedCloud className="left-0 top-[88%] h-12 w-52" opacity={0.4} />

      <FluffyCloud className="right-2 top-[22%] h-20 w-28" opacity={0.55} />
      <StretchedCloud className="right-0 top-[50%] h-12 w-48" opacity={0.45} />
      <MiniCloud className="right-6 top-[74%] h-14 w-24" opacity={0.5} />
      <LongCloud className="right-0 top-[92%] h-14 w-40" opacity={0.4} />
    </div>
  );
}
```

8 clouds total (4 left + 4 right). Each side uses all 4 distinct shapes — eliminates the "same blob 6x" repetition.

### 2. `components/home/menu-cards.tsx` — View All button

The "View All" is currently inside a card-link span. Since the entire card is wrapped in a `<Link>`, the inner "View All" cannot be a clickable button (nested anchors are invalid HTML).

**Resolution:** Style the span as a button-like outline pill but keep it as a `<span>` (visual only, parent card handles the click). To honor "site-standard button style" requirement, extract the styling values from the `outline` Button variant:

```tsx
{!card.comingSoon && (
  <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/20 bg-transparent px-4 py-1.5 font-display text-sm font-semibold text-ink shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-ink/40 group-hover:shadow-md md:text-base">
    View All
    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
      →
    </span>
  </span>
)}
```

Classes mirror `Button variant="outline" size="sm"` look. `group-hover:` triggers on card hover (since card is the actual interactive element).

### 3. `components/home/featured-pup-spotlight.tsx` — Card conversion

Wrap the inner content in a contained card. KEEP gradient + SunRays inside the card:

```tsx
return (
  <section className="relative mx-auto max-w-hero scroll-mt-24 px-4 py-12 md:px-8 md:py-16">
    <div
      className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 px-4 py-20 shadow-cozy-md md:px-12 md:py-28"
      style={{
        background:
          "linear-gradient(135deg, var(--bg-warm-tan) 0%, var(--brand-primary) 50%, var(--bg-peach) 100%)",
      }}
    >
      <SunRays />
      <div className="relative mx-auto grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
        {/* copy block + image — unchanged */}
      </div>
    </div>
  </section>
);
```

Changes:
- Outer `-mx-4 md:-mx-8` (full-bleed) → `mx-auto max-w-hero px-4 md:px-8` (contained)
- Drop top + bottom `<SectionCurve>` (no longer needed without full-bleed transition)
- Wrap inner gradient + content in `rounded-[2.5rem] border border-ink/10 shadow-cozy-md` card
- Adjust internal padding (was `py-28 md:py-40`, now `py-20 md:py-28` inside card)
- SunRays stays inside the card (clipped by `overflow-hidden`)

### 4. `components/home/feature-banner.tsx` — Card conversion

Same pattern as Pack Leader:
```tsx
return (
  <section className="relative mx-auto max-w-hero scroll-mt-24 px-4 py-12 md:px-8 md:py-16">
    <div
      className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 px-4 py-20 shadow-cozy-md md:px-12 md:py-24"
      style={{
        background:
          "linear-gradient(120deg, var(--bg-warm-tan) 0%, var(--brand-primary) 55%, var(--bg-peach) 100%)",
      }}
    >
      <div className={`relative mx-auto grid items-center gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16 ${reverse ? "..." : ""}`}>
        {/* copy + media — unchanged */}
      </div>
    </div>
  </section>
);
```

Drop top + bottom SectionCurves. Same border + shadow + radius for consistency.

### 5. `components/characters/character-card.tsx` — Featured aspect

Change featured aspect from `aspect-[3/4]` to `aspect-[1/2]`:
```tsx
const aspectClass =
  variant === "featured"
    ? "aspect-[1/2]"
    : "aspect-square";
```

At 1:2, featured becomes a tall narrow column. With grid `1fr:2fr` (rectangle 33% / 2x2-grid 67%), this gives featured roughly the same total height as the stacked 2×2 grid.

**Visual trade-off acknowledged:** the character image inside a 1:2 container will have a lot of vertical whitespace around it (image is roughly square). To balance, the featured card padding stays at `p-8 md:p-10` so the image stays centered with breathing room above and below.

### 6. `components/home/newsletter-cta.tsx` — Spacing audit (potentially)

Current section wrapper:
```tsx
<section id="newsletter" className="relative mx-auto max-w-3xl scroll-mt-24 px-4 py-16 md:px-8 md:py-20">
```

Equal `py-16 md:py-20` top/bottom. Likely perception issue caused by:
- VideoGrid (the section ABOVE) has its own bottom padding
- Footer (BELOW) has `py-14 md:py-16` top padding

If VideoGrid bottom + Newsletter top adds visually > Newsletter bottom + Footer top, the top feels bigger.

**Action plan:**
- Read VideoGrid bottom padding
- Compare to total above-newsletter and below-newsletter visual space
- Adjust newsletter `py-` if asymmetry confirmed; otherwise no change

If a real fix is needed, candidate is `py-12 md:py-14` (tighter), or asymmetric `pt-12 pb-16 md:pt-14 md:pb-20`.

### 7. Character paw scatter — verify only

No code change. Already shipped last cook (5 paws per card, `text-white/20`, hand-tuned positions in `CharacterCard`). User to verify in browser.

---

## Phased Execution

| Phase | Item | Risk | Effort |
|---|---|---|---|
| P1 | Character featured aspect-[1/2] | Trivial | 2m |
| P2 | View All button outline styling | Low | 10m |
| P3 | Pack Leader → card | Medium | 25m |
| P4 | FeatureBanner → card | Low (mirror P3) | 15m |
| P5 | Side clouds 4 shapes | Medium | 45m |
| P6 | Newsletter spacing audit + fix | Low | 10m |

**Total: ~2h**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| 1:2 featured aspect leaves lots of empty space around character image | Medium | Padding stays generous; visual smoke check. If image looks lost, fall back to 2:3 or use a "frame" style with bigger character image. |
| Pack Leader card loses cinematic full-bleed impact | Medium | Gradient + SunRays preserved inside card. Trade is intentional: contained matches site card system. |
| FeatureBanner card too similar to Pack Leader → repetition | Low | Different content (image vs character); the visual rhythm is fine. |
| Card-link "View All" can't be a real Button (nested anchor) | Resolved | Styled span as button visual, parent Link handles click. Standard pattern. |
| Cloud variety eats more DOM nodes | Low | 8 SVGs instead of 6, total ~120 elements. Trivial render cost. Pointer-events-none + aria-hidden. |
| Newsletter spacing tweak feels arbitrary if perception was wrong | Low | Audit BEFORE changing; only act on real asymmetry. |

---

## Success Criteria

- Side clouds show 4 visually distinct shapes mixed across left + right flanks
- Pack Leader + Shop the Pack render as contained rounded cards with internal yellow gradient
- Character Showcase featured card has 1:2 aspect ratio (tall column)
- "View All" links have outline-button visual style (border, padding, rounded-full)
- Newsletter section spacing balanced (audit confirms or tweak applied)
- typecheck + lint + build clean

---

## Out of Scope (Explicit)

- Hero changes (intentionally not touched this round)
- Banner artwork
- New character motifs (toys/balls/bones — paws-only stays)
- Newsletter card redesign (already done last cook)
- Logo/footer tweaks
- Dark mode

---

## Unresolved Questions

None. Design ready to plan + cook.
