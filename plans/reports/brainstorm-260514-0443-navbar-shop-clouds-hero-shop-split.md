# Brainstorm — Navbar Shop, Cloud Stacking, Hero Shift, Shop Split, Card Names

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** 6 changes. Navbar Shop demotion, cloud z-index fix, hero objectPosition shift, View All blue (no arrow), character name hover-only, Shop the Pack split layout amplified.

---

## Honest Framing

- Hero gets ONE small change (objectPosition shift), not a structural rework. Still respects the convergence guardrail.
- Navbar Shop styled as a white pill 3 cooks ago → user now wants it as a plain text link like the rest. Partial reversal.
- Pack Leader card (last cook) stays as-is — user didn't object.
- Shop the Pack card (last cook) stays wrapped but split layout amplified inside.

---

## Locked Decisions (User-Confirmed)

| # | Item | Decision |
|---|---|---|
| 1 | Navbar Shop | Demote to plain nav text-link (like Watch/Characters) |
| 2 | Cloud overlap | Drop `bg-paper` from CharacterShowcase section; body bg is already cyan |
| 3 | Hero banner shift | `objectPosition: "70% 50%"` (was 55%) |
| 4 | View All button | Drop arrow; switch to brand-secondary blue (`#397fc5`) fill + white text + rounded-full |
| 5 | Character name | Remove always-visible name below card; reveal as fade-in pill OVER the card on hover |
| 6 | Shop the Pack split | Keep card wrap; amplify split inside: bigger image, full-bleed-to-card-edge image side |

---

## File-by-File Change Set

### 1. Navbar Shop → text link — `components/nav/nav-links.tsx`

Currently detects `item.label === "Shop"` and renders a white pill button. Drop the conditional:

```tsx
// Before
className={cn(
  "relative inline-flex min-h-[44px] items-center font-display text-sm font-bold uppercase tracking-wider transition-all duration-200 md:text-base",
  isShop
    ? "rounded-full bg-surface px-5 py-2 text-ink ring-1 ring-ink/10 shadow-cozy hover:-translate-y-0.5 hover:shadow-cozy-md"
    : cn(
        "nav-underline rounded-full px-4 py-2 md:px-5",
        active ? "text-ink" : item.enabled ? "text-ink hover:text-ink" : "text-ink/45 hover:text-ink/70",
      ),
)}

// After
className={cn(
  "nav-underline relative inline-flex min-h-[44px] items-center rounded-full px-4 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors duration-200 md:px-5 md:text-base",
  active
    ? "text-ink"
    : item.enabled
      ? "text-ink hover:text-ink"
      : "text-ink/45 hover:text-ink/70",
)}
```

Remove the `isShop` variable. Shop now uses the same `.nav-underline` treatment as Watch/Characters/etc.

### 2. Cloud z-index fix — `components/home/character-showcase.tsx`

Remove `bg-paper` from the section wrapper:

```tsx
// Before
<section
  id="meet-the-pack"
  className="relative scroll-mt-24 overflow-hidden bg-paper py-24 md:py-32"
>

// After
<section
  id="meet-the-pack"
  className="relative scroll-mt-24 overflow-hidden py-24 md:py-32"
>
```

The body's `--bg-base` (cyan) is uniform. Section was painting the same cyan over the fixed `SideClouds` at z-0 in the gutters. Dropping the explicit bg lets the body color show through, and clouds in the gutters become visible as user scrolls through the section.

**Side effect:** CloudDivider components (top + bottom of section) still render — they sit ON the body cyan (no change visually). PawPrintPattern is also inside the section's content layer, unaffected.

**Verify:** if any other section also has `bg-paper` that creates similar cloud-hiding behavior, consider auditing later. For now, CharacterShowcase is the reported pain.

### 3. Hero banner shift — `components/home/full-bleed-hero.tsx`

```tsx
// Before
style={{ objectPosition: "55% 50%" }}
// After
style={{ objectPosition: "70% 50%" }}
```

Pushes character cluster ~15% further right in the frame. Combined with the existing left cyan fade + text card, the text zone gets more clearance from the character art.

### 4. View All button → blue, no arrow — `components/home/menu-cards.tsx`

```tsx
// Before
<span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/20 bg-transparent px-4 py-1.5 font-display text-sm font-semibold text-ink shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-ink/40 group-hover:shadow-md md:text-base">
  View All
  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
    →
  </span>
</span>

// After
<span className="mt-auto inline-flex w-fit items-center rounded-full bg-navy px-5 py-2 font-display text-sm font-semibold text-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md md:text-base">
  View All
</span>
```

Changes:
- `border border-ink/20 bg-transparent text-ink` → `bg-navy text-white` (solid blue pill)
- Removed arrow span
- Padding bumped slightly (`px-5 py-2`) for button feel
- Hover still lifts (parent card hover via `group-hover:`)

`bg-navy` resolves to `--bg-navy` which is `#397fc5` from the prior palette swap.

### 5. Character name hover-only — `components/characters/character-card.tsx`

Remove the always-visible `<p>{character.name}</p>` below the card. Add a name pill that fades in over the card bottom on hover:

```tsx
// Before
<Link ...>
  <div className="relative ... rounded-[2rem] ..." style={{ backgroundColor: character.accentColor }}>
    <CardPawScatter />
    {/* hover ring */}
    <Image ... />
  </div>
  <p className={`truncate text-center font-display font-bold tracking-[0.05em] text-ink ${nameClass}`}>
    {character.name}
  </p>
</Link>

// After
<Link ...>
  <div className="relative ... rounded-[2rem] ..." style={{ backgroundColor: character.accentColor }}>
    <CardPawScatter />
    {/* hover ring */}
    <Image ... />

    {/* Hover-reveal name pill */}
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition-all duration-300 group-hover:bottom-6 group-hover:opacity-100">
      <span className="inline-flex items-center rounded-full bg-ink/90 px-4 py-1.5 font-display text-sm font-bold text-white shadow-md backdrop-blur-sm md:text-base">
        {character.name}
      </span>
    </div>
  </div>
</Link>
```

Changes:
- Drop the `<p>` below card entirely (no more layout reservation for it)
- Add hover-reveal pill INSIDE the card at bottom-center
- Pill: ink bg + white text + rounded + soft shadow + backdrop-blur
- Animation: fade-in (`opacity-0 → opacity-100`) + slide-up (`bottom-4 → bottom-6`)
- No `nameClass` variant logic needed anymore (name is consistent)

Cleanup: `nameClass` variable is unused after this change — remove it.

### 6. Shop the Pack split amplified — `components/home/feature-banner.tsx`

Keep card wrap; make image full-bleed to card edge on its side:

```tsx
// Inner grid stays similar but image side loses inner padding
<div className="relative mx-auto max-w-hero scroll-mt-24 px-4 py-12 md:px-8 md:py-16">
  <div
    className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 shadow-cozy-md"
    style={{
      background: "linear-gradient(120deg, var(--bg-warm-tan) 0%, var(--brand-primary) 55%, var(--bg-peach) 100%)",
    }}
  >
    <div className={`relative grid items-stretch md:grid-cols-[1fr_1.4fr] ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
      {/* Copy block */}
      <div className="relative px-4 py-16 md:py-20 md:pl-12 md:pr-8">
        {/* kicker / h2 / body / cta — unchanged */}
      </div>
      {/* Media — full-bleed to card edge on its side */}
      <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-[460px] lg:min-h-[540px]">
        <Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
      </div>
    </div>
  </div>
</section>
```

Changes from prior cook:
- Drop outer card-level padding `px-4 py-20 md:px-12 md:py-24`
- Put padding ON the copy block only (`px-4 py-16 md:py-20 md:pl-12 md:pr-8`)
- Image side has no padding → image fills its grid column edge-to-edge (within card)
- Image becomes `object-cover` (was previously inside its own bg-surface inset div with rotation)
- Drop the `-rotate-1` and `bg-surface` wrapper on the image — not needed when image fills the half
- `items-stretch` so both columns equal height

Net: card has clear left-side (yellow gradient under copy) + right-side (image filling its half). Reads as "magazine spread" inside the card.

---

## Phased Execution

| Phase | Item | Risk | Effort |
|---|---|---|---|
| P1 | Navbar Shop demotion | Trivial | 5m |
| P2 | Cloud z-index fix (drop bg-paper) | Trivial | 2m |
| P3 | Hero objectPosition 70% | Trivial | 2m |
| P4 | View All button blue, no arrow | Low | 5m |
| P5 | Character name hover pill | Medium | 25m |
| P6 | Shop the Pack split amplified | Medium | 30m |

**Total: ~1h10m**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Other sections with `bg-paper` create same cloud-hiding problem | Low | CharacterShowcase was the reported issue. Audit if it recurs on another section. |
| Hero 70% objectPosition crops right-side characters | Medium | Banner art is 2754×1536 with characters distributed across width. 70% should be safe; verify visually. |
| Blue View All on cyan page bg has low contrast | Low | `#397fc5` on `#c6e7e9` ≈ 3:1. Combined with white text inside → fine for non-text-heavy CTAs. |
| Layout shift when name moves from below to inside-card | Low | Removing the always-visible `<p>` reduces total card height. Section may shift. Verify spacing. |
| Image side full-bleed in Shop card has hard edges meeting gradient | Medium | Card `overflow-hidden` clips. If hard seam feels abrupt, add a soft inner shadow or gradient mask on the image edge. |

---

## Success Criteria

- Navbar Shop reads as plain text link (matches Watch/Characters)
- Clouds visible through CharacterShowcase scroll position (no covering)
- Hero banner characters clearly visible right-of-center on desktop
- View All button is solid blue pill (no arrow)
- Character names hidden at rest; reveal as pill on card hover
- Shop the Pack section shows clear text/image split inside the card
- typecheck + lint + build clean

---

## Out of Scope (Explicit)

- Hero structural changes (only objectPosition shift)
- Pack Leader (already shipped last cook; not in this brief)
- New character motifs
- Footer changes
- Banner artwork
- Dark mode

---

## Unresolved Questions

None. Ready to plan + cook.
