# Brainstorm — Website Iteration Pass (Yellow Anchor + Section Polish)

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** 8 discrete UI changes anchoring the new design around the yellow `#ffd70c` accent. Navbar → hero → home sections → newsletter.

---

## Theme of This Pass

Yellow becomes the **branding spine**. Navbar yellow → hero text zone yellow → FeatureBanner ("UNBOX THE MAGIC") yellow gradient → Newsletter yellow gradient. The cyan page bg sits between these yellow "moments" as a quiet canvas. This locks in the yellow as the dominant brand color and pushes cyan to a supporting role.

**Why this matters:** The cyan-everywhere result from the prior pass made the page feel cold. Yellow anchors give warmth + visual rhythm.

---

## Locked Decisions (User-Confirmed)

| # | Item | Decision |
|---|---|---|
| 1 | Navbar bg | `#ffd70c` yellow (matches FeatureBanner middle stop) |
| 1a | Mobile menu drawer | Yellow `#ffd70c` (matches navbar) |
| 1b | Shop nav button | White bg + dark ink text + soft shadow, stays in nav position |
| 2 | Nav underline color | Switch from yellow (now bg) to dark ink |
| 3 | Hero text zone | Yellow `#ffd70c` gradient zone on left (replaces cyan fade) |
| 4 | Hero right side | Mirror gradient fade on right edge |
| 5 | "Step into the Pack's World" buttons | "Explore" → "View All", aligned via flexbox |
| 6 | "Say hi to Max" | Single line (remove `block` class on Max span) |
| 7 | Character Showcase | Featured-left + 2×2 grid right, paw-print decorative bg |
| 8 | FeatureBanner CTA | Dark ink button (max contrast on yellow) |
| 9 | Newsletter heading | "Become a VIP" (drop "(Very Important Pup)") |

---

## File-by-File Change Set

### 1. Navbar — `components/nav/top-nav.tsx`

- Add `bg-brand-primary` class on the sticky header wrapper (currently transparent or page-bg inheriting).
- Add subtle bottom border or soft shadow for separation from hero: `shadow-cozy` or `border-b border-ink/10`.
- Verify scroll behavior (`TopNavScrollEffect`) doesn't override the yellow bg.

### 2. Nav Links — `components/nav/nav-links.tsx`

- `.nav-underline` (in `globals.css`) currently uses `var(--brand-primary)` = yellow. With yellow bg, change to dark: `background: var(--ink)`.
- Active/hover text color stays `text-ink` (dark on yellow = 11:1, excellent).
- Disabled items (Characters, Top Picks, Activities) currently `text-ink/45` — keep, still legible on yellow.
- **Shop link** gets new styling: render as a button if it's the active link target:
  ```tsx
  // For the Shop item only:
  className="rounded-full bg-surface px-4 py-1.5 text-ink font-display font-bold shadow-cozy hover:-translate-y-0.5 transition-transform"
  ```
  Cleanest approach: detect `item.label === "Shop"` in `nav-links.tsx` and apply button styling.

### 3. Mobile Nav — `components/nav/mobile-nav.tsx`

- Line 64: `bg-paper` → `bg-brand-primary` (drawer becomes yellow).
- Verify CTA buttons inside drawer ("Shop the Pack", "Join the Newsletter") read well on yellow.

### 4. Hero — `components/home/full-bleed-hero.tsx`

**Replace left-edge fade with yellow gradient zone, mirror on right.**

```tsx
{/* Banner — natural 16:9 inside max-w-[1600px]. Yellow zones on both edges. */}
<div className="relative mx-auto w-full max-w-[1600px] aspect-[4/3] md:aspect-[16/9]">
  <Image ... style={{ objectPosition: "55% 50%" }} />

  {/* Left yellow zone — strong fade for text legibility (md+) */}
  <div
    aria-hidden
    className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-[#ffd70c] via-[#ffd70c]/80 to-transparent md:block"
  />

  {/* Right yellow fade — symmetric framing */}
  <div
    aria-hidden
    className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-[#ffd70c] via-[#ffd70c]/50 to-transparent md:block"
  />
</div>
```

**Mobile glass card** retint:
- `bg-[rgb(198_231_233/0.85)]` (cyan) → `bg-[#ffd70c]/90` (yellow)

**Text-shadow tweaks:** drop the cyan-tinted text-shadows (cyan zone is gone). Add subtle white shadow for body text legibility on yellow gradient transition:
```
md:[text-shadow:0_1px_2px_rgba(255,255,255,0.4)]
```
Or just remove text-shadow entirely — dark ink on solid yellow doesn't need it.

**Key change:** with the left zone going to ~40% width, the text sits FULLY on yellow (no gradient fade through), giving maximum legibility.

### 5. Menu Cards — `components/home/menu-cards.tsx`

- Line 137 button label: `Explore` → `View All`.
- Add `Explore →` arrow → `View All →` or `View All` (drop arrow if user wants cleaner).
- Card heights: ensure consistent via flex layout. Likely already has `flex flex-col` on each card with `flex-grow` on body and bottom-anchored button. Verify and fix if needed.
- Buttons aligned: each card's button gets `mt-auto` so it sticks to the bottom regardless of copy length.

### 6. Featured Pup Spotlight — `components/home/featured-pup-spotlight.tsx`

Line 39:
```tsx
// Before
<h2 className="...text-5xl md:text-7xl lg:text-[5.5rem]">
  Say hi to <span className="block text-brand-gold">Max</span>
</h2>

// After
<h2 className="...text-4xl md:text-6xl lg:text-7xl whitespace-nowrap">
  Say hi to <span className="text-brand-gold">Max</span>
</h2>
```

Changes:
- Remove `block` class on the Max span → keeps inline
- Add `whitespace-nowrap` to h2 → forces single line
- Drop font size one notch (5xl→4xl, 7xl→6xl, [5.5rem]→7xl) so it actually fits at narrow breakpoints
- On very narrow mobile (<375px), allow wrap by removing `whitespace-nowrap` at base and adding `md:whitespace-nowrap`:
  ```tsx
  className="... md:whitespace-nowrap"
  ```

### 7. Character Showcase — `components/home/character-showcase.tsx`

**Full redesign: featured-left + 2×2 grid right + paw-print decorative bg.**

```tsx
<section className="relative overflow-hidden bg-paper py-24 md:py-32">
  {/* Decorative paw-print pattern */}
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

    {/* Magazine layout — featured-left + 2×2 grid right (md+). Stacks on mobile. */}
    <div className="mt-14 grid gap-5 md:grid-cols-[1.5fr_1fr] md:gap-6 lg:gap-8">
      {/* Featured — first character, large rectangle */}
      <CharacterCard character={characters[0]} variant="featured" />

      {/* 2×2 grid of remaining 4 characters */}
      <div className="grid grid-cols-2 gap-5 md:gap-6 lg:gap-8">
        {characters.slice(1, 5).map((c) => (
          <CharacterCard key={c.slug} character={c} variant="compact" />
        ))}
      </div>
    </div>
  </div>
</section>
```

**CharacterCard variants** (in `components/characters/character-card.tsx`):
- `variant="featured"` → `aspect-[3/4]` or `aspect-[4/5]`, larger typography, more spacing
- `variant="compact"` → `aspect-square`, smaller typography
- Default unchanged for backward compat

**PawPrintPattern** — new file `components/ui/paw-print-pattern.tsx`:
- Renders ~20-30 paw SVGs randomly positioned across section
- Each at `text-ink/8` (8% opacity) or `text-brand-gold/12`
- Various rotations (-12°, +12°, 24°, -8°)
- Deterministic seeded positions to avoid SSR hydration mismatch
- Hidden on mobile to save render cost (`hidden md:block`)
- Reuses the `Paw` SVG already used in `CornerPaws` (newsletter-cta.tsx:198-210) — extract to shared util to honor DRY.

### 8. FeatureBanner — `components/home/feature-banner.tsx`

CTA button: change `variant` from default (yellow primary) to `variant="dark"`:
```tsx
<Button href={href} size="lg" variant="dark">
  {cta}
</Button>
```

Dark ink button on the yellow gradient = max contrast, signals premium.

### 9. Newsletter — `app/page.tsx`

Line 50:
```tsx
heading="Become a VIP (Very Important Pup)"
// →
heading="Become a VIP"
```

Single-word edit. No other newsletter changes needed.

---

## CSS Variable Updates (None required)

All changes use existing `--brand-primary` (#ffd70c) or hardcoded hex. No `globals.css` palette additions.

---

## Phased Execution Order (Risk-Sorted)

| Phase | Item | Risk | Effort |
|---|---|---|---|
| P1 | Navbar yellow + mobile drawer + Shop button | Low | 30m |
| P2 | Newsletter heading swap | Trivial | 2m |
| P3 | FeatureBanner CTA dark variant | Trivial | 2m |
| P4 | "Say hi to Max" single line | Low | 5m |
| P5 | Menu Cards "View All" + alignment | Low | 15m |
| P6 | Hero yellow zone + right fade + mobile card retint | Medium | 30m |
| P7 | Character Showcase redesign + paw-print pattern | Medium-High | 2h |

**P7 is the biggest** — new sub-component (PawPrintPattern), new CharacterCard variants, layout change. Should be its own commit at minimum.

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Yellow navbar fatigue (too much yellow site-wide) | Medium | Cyan page bg + white cards + dark ink keep yellow as accent, not majority |
| Shop button styling inconsistent with other nav items | Low | Acceptable — Shop is intentionally elevated as primary CTA |
| Hero yellow zone covers part of the image | By design | Image's left ~40% is intended to be obscured (text zone). objectPosition 55% nudges characters right. |
| "Say hi to Max" wraps on iPhone SE (320px) | Medium | Allow wrap on base, `md:whitespace-nowrap` from 768px+. Verify in browser. |
| PawPrintPattern hydration mismatch (SSR vs client randomness) | Medium | Use seeded pseudo-random (same pattern as `AtmosphereLayer`) for deterministic positions |
| CharacterCard variants break existing detail pages | Low | Default variant stays unchanged; variants are opt-in via prop |

---

## Success Criteria

- Navbar renders yellow `#ffd70c` with white Shop button and ink-colored text
- Mobile drawer matches navbar yellow
- Hero text fully legible against yellow gradient zones (no text-shadow hacks needed)
- "Say hi to Max" renders on one line at ≥md breakpoints
- Character Showcase shows featured-left + 2×2 grid right with subtle paw decoratives
- All `Explore →` labels in MenuCards now read `View All`
- Newsletter title reads "Become a VIP"
- `pnpm typecheck` + `pnpm lint` + `pnpm build` clean

---

## Out of Scope (Explicit)

- Tweaking the navbar logo color/treatment
- Adding new character images or asset work
- Redesigning the CharacterCard component itself (only adding variants)
- Mobile-only redesigns beyond what's listed
- Animations / motion design beyond existing hover states
- Footer changes
- New sections / removed sections

---

## Unresolved Questions

None. Design is ready to plan + cook.
