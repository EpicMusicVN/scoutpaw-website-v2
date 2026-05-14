# Brainstorm — Side Clouds, Hero Cyan Pivot, Newsletter Card Conversion

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** 8 changes. Hero 5th revision converges on cyan-only (yellow zone dropped). Newsletter converts from yellow band to white card. Footer grass removed. New side-cloud system.

---

## Honest Framing

This pass unwinds several recent decisions:
- **Yellow brand spine** (set up 2 iterations ago) shrinks: hero zone removed. Yellow now lives only in FeatureBanner + (was) Newsletter — now also Newsletter strips yellow. **Net:** yellow only appears in `FeatureBanner` after this pass.
- **Pack Leader italic** (just added last cook) gets removed.
- **Footer GrassStrip** (just recolored last cook) gets removed entirely.
- **Hero is on its 5th revision.** The convergence guardrail from prior brainstorm explicitly said "next round should be about banner artwork, not gradients." This round is gradients again — but at least it simplifies (drop a layer rather than add).

User has the prerogative to evolve the design. Flagging the pattern so we both see it.

---

## Locked Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Hero | Drop yellow zone, both sides fade to cyan, strengthen text card (`bg-white/85 + ring + shadow`) |
| 2 | Side clouds | Fixed-position viewport decoratives, visible only on screens >1500px |
| 3 | Newsletter | Full conversion to "Stay Tuned" card style — white surface card, drop yellow gradient |
| 4 | Footer GrassStrip | Remove entirely |
| 5 | Pack Leader subtitle | Remove italic, keep title case |
| 6 | View All buttons | Audit + spot-fix Menu Cards "View All" to use shared Button styling |
| 7 | Character Showcase featured | `aspect-[3/4]` (tall rectangle) |
| 8 | Character card decoratives | Keep paws only — verify visually first |

---

## File-by-File Change Set

### 1. Hero — `components/home/full-bleed-hero.tsx`

Replace left yellow zone with cyan fade (mirror of right side):
```tsx
{/* Left cyan fade — banner image visually merges into the page bg. */}
<div
  aria-hidden
  className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-paper via-paper/70 to-transparent md:block"
/>
```

Strengthen text card:
```tsx
<div className="max-w-md rounded-2xl border border-ink/10 bg-white/85 px-6 py-5 shadow-cozy backdrop-blur-md lg:max-w-lg lg:px-8 lg:py-7">
  <CardBody />
</div>
```
- `bg-white/55` → `bg-white/85` (much more opaque)
- Add `border border-ink/10` for clean edge
- `backdrop-blur-sm` → `backdrop-blur-md` (more frosted)
- Same shadow

Mobile glass card retint from yellow → white:
- `bg-[rgb(255_215_12/0.9)]` → `bg-white/90`

**Net:** zero yellow in hero. Text legibility carried entirely by the strong white card sitting on top of cyan fade.

### 2. Side Clouds — `components/ui/side-clouds.tsx` (NEW)

Fixed-position decorative cloud blobs anchored to viewport sides, visible only on wide screens:

```tsx
"use client";

export function SideClouds() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 hidden xl:block">
      {/* Left side clouds — 3 blobs at varying heights/sizes */}
      <CloudBlob className="left-4 top-[18%] h-24 w-32 opacity-[0.55]" />
      <CloudBlob className="left-2 top-[52%] h-20 w-28 opacity-[0.45]" />
      <CloudBlob className="left-6 top-[78%] h-16 w-24 opacity-[0.4]" />
      {/* Right side clouds — 3 blobs mirrored */}
      <CloudBlob className="right-4 top-[30%] h-24 w-32 opacity-[0.5]" />
      <CloudBlob className="right-2 top-[60%] h-20 w-28 opacity-[0.45]" />
      <CloudBlob className="right-6 top-[84%] h-16 w-24 opacity-[0.4]" />
    </div>
  );
}

function CloudBlob({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      aria-hidden
      className={`absolute ${className}`}
    >
      <ellipse cx="30" cy="40" rx="22" ry="14" fill="white" />
      <ellipse cx="55" cy="32" rx="26" ry="18" fill="white" />
      <ellipse cx="82" cy="38" rx="20" ry="13" fill="white" />
      <ellipse cx="100" cy="42" rx="14" ry="10" fill="white" />
    </svg>
  );
}
```

**Placement:** In `app/layout.tsx` (or a global wrapper). Renders site-wide.

**Why `xl:block` (≥1280px):** below 1280px the gutters are too narrow — clouds would touch content. On widescreen, the clouds gently frame the page.

### 3. Newsletter — `components/home/newsletter-cta.tsx`

Convert from full-bleed yellow gradient to contained white card:

**Before:**
```tsx
<section id="newsletter" className="relative scroll-mt-24 overflow-hidden">
  <SectionCurve position="top" color="var(--bg-base)" variant="cloud" height={70} />
  <div
    className="relative px-4 pt-24 pb-12 md:px-8 md:pt-32 md:pb-16"
    style={{ background: "linear-gradient(180deg, #ffd70c 0%, #ffe968 100%)" }}
  >
    <CornerPaws />
    <div className="relative mx-auto max-w-2xl text-center"> ... </div>
  </div>
</section>
```

**After:**
```tsx
<section id="newsletter" className="relative scroll-mt-24 mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
  <div className="relative rounded-[2rem] border border-ink/10 bg-surface px-6 py-10 text-center shadow-cozy-md md:px-12 md:py-14">
    <CornerPaws />
    <div className="relative">
      {/* heading + form + social proof */}
    </div>
  </div>
</section>
```

Changes:
- Drop SectionCurve (no longer needed since no gradient transition)
- Wrap content in `max-w-3xl` container
- Inner `rounded-[2rem] bg-surface border shadow-cozy-md` card
- Drop yellow gradient style
- CornerPaws stay (paw decoratives provide visual interest in the white card)
- Form CTA button stays dark ink (already on white = clean)

**Impact:** `body:has(#newsletter)` selector in globals.css won't matter since no more yellow gradient meeting grass. But this becomes moot anyway — see #4.

### 4. Footer GrassStrip — `components/nav/footer.tsx`

Remove the `<GrassStrip />` component entirely:
```tsx
return (
  <footer>
    {/* <GrassStrip /> — removed per design direction */}
    <div className="relative bg-navy py-14 text-white/90 md:py-16">
      ...
    </div>
  </footer>
);
```

Also remove the `GrassStrip` function definition and any unused imports.

**Cleanup:** the `--grass-strip-top` CSS variable + `body:has(#newsletter)` rule in `globals.css` become dead. Remove both.

### 5. Pack Leader subtitle — `components/home/featured-pup-spotlight.tsx`

```tsx
// Before (italic added last cook)
<p className="mt-2 font-display text-lg italic tracking-wide text-warm-muted md:text-xl">

// After (italic removed)
<p className="mt-2 font-display text-lg tracking-wide text-warm-muted md:text-xl">
```

Single class removed.

### 6. Character Showcase featured aspect — `components/characters/character-card.tsx`

```tsx
const aspectClass =
  variant === "featured"
    ? "aspect-[3/4]"  // was aspect-square (changed in prior cook)
    : "aspect-square";
```

Featured card becomes a tall rectangle, sitting next to the 2×2 grid of squares.

### 7. View All button audit — `components/home/menu-cards.tsx`

The Menu Cards "View All" link is currently a styled `<span>` with no explicit rounding (just inline-flex):
```tsx
<span className="mt-auto inline-flex items-center gap-1.5 pt-3 font-display text-sm font-semibold text-ink md:text-base">
  View All
  <span>→</span>
</span>
```

This isn't really a button — it's an inline link cue inside a clickable card. Verify visually: if it looks button-like and is rounded, leave alone. If user wants a chip-style pill, convert to:
```tsx
<span className="mt-auto inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 font-display text-sm font-semibold text-ink ...">
```

**Default action:** leave as inline link; only convert if user reviews and asks for explicit pill.

### 8. Character card paw scatter — verify only

Already shipped last cook (P5). No code change. Smoke check after this pass: do the paws visibly read? If too subtle on dark accent colors (Bella's brown), opacity may need a per-card tune.

---

## Phased Execution

| Phase | Item | Risk | Effort |
|---|---|---|---|
| P1 | Pack Leader italic removal | Trivial | 2m |
| P2 | Char Showcase featured `aspect-[3/4]` | Trivial | 2m |
| P3 | Footer GrassStrip removal + globals.css cleanup | Low | 10m |
| P4 | Hero cyan-only + strengthened card | Medium (5th hero revision) | 25m |
| P5 | Newsletter conversion to white card | Medium | 30m |
| P6 | Side clouds `<SideClouds>` component + layout placement | Medium | 45m |

**Total:** ~2h

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Hero now has zero yellow — brand spine theme dead | Acceptable | User-directed evolution. Yellow concentrates in CTAs + FeatureBanner. Cleaner is the trade. |
| Newsletter loses CTA emphasis without yellow band | Medium | Strong dark CTA button + card shadow lifts the section. If still feels weak, add `bg-paper` page bg → `bg-[#fffbe6]` cream contrast around the card. |
| Side clouds invisible to <1280px users (most mobile) | By design | Side clouds are widescreen-only frame. Not load-bearing UX. |
| GrassStrip removal breaks footer transition | Low | Footer's blue starts directly. Cleaner — no jarring strip color decision needed. |
| Stronger hero card looks like v1 all over again | Acceptable | v1 was glass card OVER the characters; this card sits in the cyan gutter zone. Different position = different design. |
| `body:has(#newsletter)` orphan CSS rule | Low | Remove in same commit as GrassStrip cleanup. |

---

## Success Criteria

- Hero has zero yellow. Both sides fade to cyan. Text card opaque enough to carry legibility alone.
- Side clouds visible at ≥1280px on left and right page flanks; invisible below.
- Newsletter renders as a centered white card with rounded corners + soft shadow.
- Footer top has NO grass decoration. Blue bg starts directly.
- Pack Leader subtitle reads in plain title case (no italic, no caps).
- Character Showcase featured card is taller than wide (3:4 ratio).
- `pnpm typecheck` + `pnpm lint` + `pnpm build` all clean.

---

## Out of Scope (Explicit)

- New banner artwork
- Yellow re-introduction anywhere
- Logo asset re-tinting
- Footer text/structure changes (only grass strip)
- Per-character `accentColor` changes
- Dark mode
- Animation work

---

## Unresolved Questions

None. Design is ready to plan + cook.
