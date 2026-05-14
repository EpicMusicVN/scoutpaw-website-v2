# Brainstorm — Color System Overhaul + Hero Banner Rework

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Site-wide palette swap (warm cream/honey/navy → cool cyan/yellow/blue) + hero banner letterbox composition

---

## Problem

Two coupled concerns:
1. **Palette is being rebranded**: warm cream/golden/navy → cool cyan/yellow/blue.
2. **Hero glass card** (`bg-honey/85 + backdrop-blur-xl`) overlays characters and weakens composition.

---

## Final Palette (User-Confirmed)

| Token | Current | New | Role |
|---|---|---|---|
| `--bg-base` | `#fbf6e9` (cream) | **`#c6e7e9`** (cool cyan) | Page background, large surfaces |
| `--bg-navy` | `#1d2750` (deep navy) | **`#397fc5`** (mid blue) + darker gradient overlay | Footer background |
| `--brand-primary` | `#e8b547` (golden) | **`#ffd70c`** (saturated yellow) | CTA buttons, focus rings, highlights |
| `--ink` | `#2b1d10` (warm brown) | **`#2b1d10`** (unchanged) | Body text |
| `--brand-honey` | `#ffc966` (soft honey) | **DROPPED** | — |
| `--brand-honey-rgb` | `255 201 102` | **DROPPED** | — |
| Character `accentColor` (json) | varied | **untouched** | Per-character brand IDs |

**Newsletter gradient**: `linear-gradient(180deg, #ffd70c 0%, #ffe968 100%)` (single-yellow family).
**Footer overlay**: subtle darker-blue gradient `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.18) 100%)` overlaid on `#397fc5` → effective bg-darkness lifts contrast above 7:1 with white text.

---

## Honey Re-Targeting (9 occurrences across 6 files)

| Old usage | New treatment |
|---|---|
| `text-brand-honey` (footer headings, `footer.tsx:~85`) | `text-white` (or `text-[#fffbe6]` cream variant for slight warmth) |
| `.nav-underline` background (`globals.css:152`) using `var(--brand-honey)` | `var(--brand-primary)` → new yellow `#ffd70c` (already accent role) |
| `border-brand-honey` (social icon hovers, `footer.tsx`) | `border-[#ffd70c]` / new yellow |
| Decorative GrassStrip blob `#fff1c9` honey-cream | recolor to `#e8f6f7` (lighter cyan) — harmonizes with new bg |
| Decorative GrassStrip blob `#e8b547` gold | recolor to `#ffd70c` (new yellow) |

After this pass, `--brand-honey` is unreferenced and can be removed from `globals.css` + `tailwind.config.ts`.

---

## File-by-File Change Set

### 1. `app/globals.css`

**`:root` color variables (lines 13–83):**
```css
/* Replace */
--brand-primary: #ffd70c;
--brand-primary-rgb: 255 215 12;
--bg-base: #c6e7e9;
--bg-base-rgb: 198 231 233;
--bg-navy: #397fc5;
--bg-navy-rgb: 57 127 197;

/* Delete (or comment out for one cycle) */
--brand-honey, --brand-honey-rgb
--bg-honey, --bg-honey-rgb  (used in: confirm with grep before deleting)
--accent-gold-dark  (legacy)
```

**Shimmer overlay (line 171):**
Current: `rgba(255, 245, 214, 0.55)` (cream tint).
New: `rgba(255, 240, 180, 0.55)` (light yellow tint) — keeps sparkle on yellow buttons.

**`.nav-underline` (line 152):**
Switch `background: var(--brand-honey)` → `background: var(--brand-primary)`.

### 2. `tailwind.config.ts` (lines 20–52)

- Remove `honey` from `brand: { ... }` if defined as standalone, OR ensure `brand-honey` color extension is dropped from `colors.brand`.
- Verify `paper` token wires to new `--bg-base-rgb` (it does — withOpacity helper). No changes needed if helper is variable-driven.

### 3. `components/nav/footer.tsx`

- Wrapper bg class: `bg-navy` → already points to `--bg-navy` (now `#397fc5`). **Just verify** the `bg-navy` Tailwind token resolves to the new value via variable.
- **Add darker overlay**: prepend a child div with `absolute inset-0 bg-gradient-to-b from-transparent to-black/18 pointer-events-none` inside the footer wrapper. Lifts contrast.
- Section headings (`text-brand-honey`): swap to `text-[#fffbe6]` or `text-white`.
- Social icon hover (`border-brand-honey`): swap to `border-[#ffd70c]` or use a new `accent` token.

**GrassStrip SVG fills (lines 145, 171–190):**

| Old hex | New hex | Notes |
|---|---|---|
| `#fff1c9` (honey cream blob) | `#e8f6f7` (light cyan) | Harmonizes with bg |
| `#e8b547` (gold blob) | `#ffd70c` (yellow) | New accent |
| `#ff7a85` (coral) | `#ff7a85` (keep) OR `#ffb89a` (softer peach) | Decorative warm accent |
| `#7bc47f` (grass green) | `#7bc47f` (keep) | Organic, neutral, doesn't clash |
| `#5fa663` (grass stroke) | `#5fa663` (keep) | Same as above |

### 4. `components/ui/button.tsx` (line 8)

Primary variant: `bg-brand-primary` already resolves to the new `#ffd70c` via CSS variable. **No code change** — automatic via palette swap.
**Verify**: `text-ink` (dark brown) on `#ffd70c` (vivid yellow) → contrast ~11:1, excellent.

### 5. `components/home/full-bleed-hero.tsx` — LETTERBOX REWORK

**Strategy (Option 2):** Image lives in a max-width container at natural aspect ratio. Page bg `#c6e7e9` fills left/right gutters on wide screens. Text card sits in the left gutter (aligned with navbar via `max-w-hero` container), never overlapping characters.

**Mobile (< md)** stays current: aspect-[4/3] full-width banner, card flows below with `-mt-8` overlap.

**Desktop (md+):**
```tsx
<section className="relative isolate bg-paper">
  {/* Image at natural aspect, capped at 1600px wide.
      Beyond 1600, page bg-paper (cyan) fills gutters. */}
  <div className="relative mx-auto max-w-[1600px] md:aspect-[16/9] lg:aspect-[21/9] md:min-h-[60svh] lg:min-h-[80svh]">
    <Image fill priority sizes="(min-width: 1600px) 1600px, 100vw"
           className="object-contain md:object-cover"
           style={{ objectPosition: "60% 50%" }} />

    {/* Soft fade on left edge of image to blend into gutter */}
    <div className="hidden md:block absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-paper via-paper/60 to-transparent pointer-events-none" />
  </div>

  {/* Mobile card (in-flow below banner) */}
  <div className="md:hidden mx-4 -mt-8 max-w-md rounded-3xl border border-white/40 bg-[#c6e7e9]/85 p-6 shadow-cozy-xl backdrop-blur-xl">
    {/* kicker / h1 / desc / actions */}
  </div>

  {/* Desktop card overlay, constrained to max-w-hero (aligns w/ navbar) */}
  <div className="hidden md:absolute md:inset-0 md:flex md:items-center md:pointer-events-none">
    <div className="mx-auto w-full max-w-hero px-8 md:pointer-events-auto">
      <div className="max-w-md lg:max-w-lg">
        {/* kicker / h1 / desc / actions (NO bg, NO blur, NO border).
            Text reads against the cyan gutter + soft fade. */}
      </div>
    </div>
  </div>
</section>
```

**Key changes:**
- Image now uses `object-contain` on mobile fallback (preserves art) and `object-cover` on desktop with `objectPosition: 60% 50%` to push characters right of center, clearing left-side text zone.
- Capped at 1600px wide. On wider screens, page bg fills the gutters.
- Left-side gradient fade blends image edge into gutter.
- **Glass card → just text on background**. No card chrome on desktop. Mobile keeps a glass card retinted to new cyan.
- Card body uses no border / shadow / blur on desktop because text now sits on a quiet gutter, not over the image.

**Trade-off acknowledged:** `aspect-[16/9]` and `aspect-[21/9]` are assumptions. The actual `/assets/banner/banner.png` dimensions aren't known from scout. **First implementation iteration should verify** the aspect matches the art; tune if not.

**Duplication note:** Card content duplicates between mobile (`md:hidden`) and desktop (`hidden md:absolute`). For brevity I left them as two blocks — if YAGNI violation feels too heavy, extract a local `CardContent` helper inside the file.

### 6. `components/home/newsletter-cta.tsx`

Replace the wrapper gradient:
```css
/* Before */
background: linear-gradient(180deg, var(--brand-honey) 0%, var(--brand-primary) 100%);
/* After */
background: linear-gradient(180deg, #ffd70c 0%, #ffe968 100%);
```
Or use CSS variables if a new `--brand-yellow-soft: #ffe968` is added.

### 7. `content/site-config.json` — palette block

The `palette` block at lines 15–23 is documentation-only (not consumed at runtime per scout). Either:
- **Sync** values to the new palette (preferred — keeps docs accurate), OR
- **Delete** if obsolete (cleaner).

Recommend **sync**.

---

## Phased Implementation (for `/ck:plan`)

| Phase | Files | Risk |
|---|---|---|
| **P1: CSS variables** | `globals.css` (palette block + shimmer + nav-underline) | Low — all variables, automatic propagation |
| **P2: Tailwind config audit** | `tailwind.config.ts` | Low — verify, no rename needed |
| **P3: Footer recolor + overlay** | `components/nav/footer.tsx` (incl. GrassStrip SVG) | Medium — hardcoded hex needs surgical edits |
| **P4: Hero letterbox rework** | `components/home/full-bleed-hero.tsx` | Medium — structural change, aspect ratio assumption |
| **P5: Newsletter gradient** | `components/home/newsletter-cta.tsx` | Low |
| **P6: site-config palette sync** | `content/site-config.json` | Trivial |
| **P7: Honey cleanup** | grep for `brand-honey` / `bg-honey` / `text-brand-honey` and migrate remaining | Low — bounded by grep results |

After each phase: `pnpm typecheck` + `pnpm lint`. After P3/P4/P5: visual smoke check at desktop / tablet / mobile.

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Hero aspect ratio assumption wrong | Medium | First iteration: verify `banner.png` dimensions, tune `aspect-[X/Y]` values |
| Honey cleanup misses an occurrence | Low | Grep `brand-honey`, `bg-honey`, `--brand-honey` at end of P7 |
| Footer contrast still feels weak after gradient overlay | Low | Tunable — overlay opacity can ramp to 25–30% |
| Yellow CTA buttons too loud against cyan bg | Medium | If buttons feel screamy, reduce yellow saturation by ~5% to `#f5c20a` (tunable) |
| New cyan bg clashes with character accentColors (Bella=brown, Oscar=coral) | Low | Per-character colors are decorative; will read as intentional warm/cool mix |
| Browser cache holds old palette | Low | Already CSS-variable-driven; refresh resolves |

---

## Success Criteria

- Page bg renders `#c6e7e9` site-wide
- Footer renders `#397fc5` with white-on-darker-gradient text ≥7:1 contrast
- All CTAs render new yellow `#ffd70c`
- Hero shows characters fully visible, NOT covered by any overlay
- Hero text card aligned with navbar's left edge (carried from prior brainstorm)
- No `bg-honey` / `brand-honey` references remain
- `pnpm typecheck` + `pnpm lint` clean

---

## Out of Scope (Explicit)

- Per-character `accentColor` overhaul in `characters.json`
- Extracting a `<Container>` wrapper component (deferred)
- Logo asset re-tinting (logo PNG stays as-is)
- Dark-mode variants
- Animations / motion design
- Typography changes

---

## Unresolved Questions

1. **Exact `banner.png` aspect ratio** — need to read the actual file or get dimensions before locking `aspect-[16/9]` vs `aspect-[21/9]` vs custom.
2. **Coral `#ff7a85` in GrassStrip** — keep as warm decorative accent or swap to peach `#ffb89a`?
3. **Mobile glass card on hero** — keep glass card or also strip to plain text on cyan background? (Current design keeps the glass card for mobile readability.)
4. **`#fffbe6` cream text in footer** — slight warm tint vs pure white. Subjective taste call.
