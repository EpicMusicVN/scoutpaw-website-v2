# Brainstorm — Cloud System + 3rd Iteration Pass

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** 6 changes: white-cloud decorative system, navbar glassmorphism, hero re-card + cyan right fade, character showcase ratio + per-card paw scatter, Pack Leader typography.

---

## Honest Pre-Read

Hero is on its **4th revision**, navbar on its **3rd color attempt**, character showcase on its **2nd ratio change**. Pattern suggests visual iteration based on browser viewing — that's fine, but each round adds complexity. This pass should converge. If the hero still feels off after this, the next conversation should be about photography/banner art, not gradient stacking.

The `View All` change in Menu Cards already shipped in the prior cook (P5 of plan `260514-0315`). User's brief mentions it again — included as a "verify only" item in success criteria, no new code.

---

## Locked Decisions (User-Confirmed)

| # | Item | Decision |
|---|---|---|
| 1 | Navbar color | Glassmorphism: `bg-white/70 + backdrop-blur-md` (cyan-tinted via page bg below) |
| 2 | Hero text | Bring back a subtle text card (cream/white-ish, low opacity, light shadow) |
| 3 | Hero right side | Right fade uses cyan `from-paper to-transparent` (NOT yellow) — image merges into page bg |
| 4 | Hero left side | Keep yellow zone for text (now also has card on top of zone) |
| 5 | Character Showcase ratio | `1fr : 2fr` (rectangle ≈ 33%, 4-grid ≈ 67%) |
| 6 | Character card decoratives | Subtle paw prints scattered on each card's accent backdrop |
| 7 | Cloud system | Section dividers + hero corners (new `<CloudDivider>` SVG component) |
| 8 | Pack Leader subtitle | "THE SOULFUL, GOLDEN HEART OF SCOUTPAW" → "The soulful, golden heart of ScoutPaw" (title case) |

---

## Change Set by File

### 1. `components/nav/top-nav.tsx` — Glassmorphism navbar

Replace `bg-brand-primary` with glass effect:
```tsx
className="sticky top-0 z-30 w-full overflow-visible bg-white/70 backdrop-blur-md transform-gpu transition-shadow duration-300 will-change-[box-shadow] data-[scrolled=true]:shadow-cozy-md data-[scrolled=true]:bg-white/85"
```
- `bg-white/70` + `backdrop-blur-md` → frosted glass over the cyan page bg
- On scroll: `bg-white/85` (less transparent) + shadow → emphasizes "lifted off page" feel
- Cyan page bg shows through subtly → cohesive with site

**NavLinks:** Shop button can stay white pill or shift to brand-primary (yellow) fill to add a yellow accent on a now-mostly-white navbar. **Recommend keep white pill** for consistency.

**`.nav-underline`:** Already on `var(--ink)` from prior phase. Stays correct.

**Mobile drawer:** `bg-brand-primary` → `bg-white/95` + `backdrop-blur-md` for consistency.

### 2. `components/home/full-bleed-hero.tsx` — Card + cyan right fade

**Bring back subtle text card** (smaller/lighter than v1):
```tsx
<div className="max-w-md rounded-2xl bg-white/55 px-6 py-5 shadow-cozy backdrop-blur-sm lg:max-w-lg lg:px-8 lg:py-7">
  <CardBody />
</div>
```
- `bg-white/55` — cream/white tint with strong transparency, lets yellow zone show through
- `backdrop-blur-sm` — soft blur for ambient legibility
- Smaller padding than original glass card
- No border for cleanest look

**Right side fade:** Yellow → cyan:
```tsx
<div
  aria-hidden
  className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-paper via-paper/60 to-transparent md:block"
/>
```
- `from-paper` = cyan page bg
- Right side of image now visually melts into the page bg below

**Left yellow zone stays** (text rides on yellow → still high contrast).

**Mobile glass card:** Keep current yellow tint (works on mobile stacking).

### 3. `components/home/featured-pup-spotlight.tsx` — Title case + remove uppercase

Line 41–43 currently:
```tsx
<p className="mt-2 font-display text-lg uppercase tracking-[0.2em] text-warm-muted md:text-xl">
  THE SOULFUL, GOLDEN HEART OF SCOUTPAW
</p>
```
Change to:
```tsx
<p className="mt-2 font-display text-lg italic tracking-wide text-warm-muted md:text-xl">
  The soulful, golden heart of ScoutPaw
</p>
```
- Remove `uppercase` class
- Remove `tracking-[0.2em]` (looser tracking belongs to UPPERCASE/eyebrow style)
- Add `italic` and `tracking-wide` for the softer editorial feel
- Display the text in actual title case in JSX

### 4. `components/home/character-showcase.tsx` — Ratio adjustment

Change grid from `md:grid-cols-[1.5fr_1fr]` to `md:grid-cols-[1fr_2fr]`:
```tsx
<div className="mt-14 grid gap-5 md:grid-cols-[1fr_2fr] md:gap-6 lg:gap-8">
  <CharacterCard character={featured} variant="featured" />
  <div className="grid grid-cols-2 gap-5 md:gap-6 lg:gap-8">
    {rest.map((c) => <CharacterCard key={c.slug} character={c} variant="compact" />)}
  </div>
</div>
```

Featured card now takes 1/3 width; 2×2 grid takes 2/3 width. Featured card's `aspect-[4/5]` may need to become `aspect-square` or `aspect-[5/6]` at this narrower width to avoid awkward stretching — verify visually.

### 5. `components/characters/character-card.tsx` — Per-card paw scatter

Add a scattered paw-print overlay INSIDE the card backdrop (behind the character image):
```tsx
<div className="relative ... rounded-[2rem] ..." style={{ backgroundColor: character.accentColor }}>
  {/* Paw scatter — sits behind the character image */}
  <CardPawScatter />
  {/* existing hover ring */}
  {/* existing Image */}
</div>
```

`CardPawScatter` is a small local helper rendering 4-6 paws at fixed positions/rotations (no random) for consistency across cards. Uses `<PawIcon />` (already extracted last cook). Opacity `text-white/15` or `text-ink/12` — keeps paws visible against any character's accent color.

### 6. `components/ui/cloud-divider.tsx` (NEW) — Cloud SVG decorative

New shared component for cloud shapes:
```tsx
export function CloudDivider({ position = "bottom" }: { position?: "top" | "bottom" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      className={`absolute inset-x-0 ${position === "top" ? "top-0" : "bottom-0"} h-16 w-full ${position === "top" ? "rotate-180" : ""}`}
    >
      <path
        d="M0,40 C 80,10 160,80 240,40 S 400,10 480,40 S 640,80 720,40 S 880,10 960,40 S 1120,80 1200,40 S 1360,10 1440,40 L1440,100 L0,100 Z"
        fill="white"
        opacity="0.75"
      />
    </svg>
  );
}
```

Or use multiple stacked ellipses for fluffier cloud look. The path-based wave is cleaner / KISS.

### 7. Cloud placement — `app/page.tsx` or section components

Place `<CloudDivider />` at:
- Top of `MenuCards` section (clouds drift down from hero into menu)
- Bottom of `FeatureBanner` (clouds transition from FeatureBanner yellow into next section)
- Top of `CharacterShowcase` section (clouds frame the magazine layout)
- Hero corners (optional — small floating clouds inside the hero, top-right corner of yellow zone)

**Avoid:** placing clouds on EVERY section — feels noisy. 3-4 strategic placements.

### 8. Verify: `menu-cards.tsx` already has "View All" + `mt-auto`

No code change. Just confirm visual smoke check still passes.

---

## Phased Execution

| Phase | Item | Risk | Effort |
|---|---|---|---|
| P1 | Pack Leader title case | Trivial | 2m |
| P2 | Char Showcase ratio (1fr:2fr) | Low | 5m |
| P3 | Navbar glassmorphism + mobile drawer | Low-Med | 20m |
| P4 | Hero card-back + cyan right fade | Medium (4th hero revision — converge) | 30m |
| P5 | Character card paw-scatter + variant aspect tune | Medium | 45m |
| P6 | `<CloudDivider>` component + placements | Medium | 1h |

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Glass navbar over cyan page = washed out | Medium | Bump opacity to `bg-white/80` if too pale. On scroll bg goes to `/85`. |
| Hero card-back makes us back where we started (v1) | Acceptable | Smaller/lighter than v1, on yellow zone (not over characters). Different design point. |
| Cyan right fade clashes with yellow left zone | Medium | Asymmetric is intentional — banner reads "yellow on left, cyan on right". User chose this. |
| Cloud divider feels childish if too prominent | Low | Default `opacity 0.75` and `h-16` — soft / small. Tunable. |
| Per-card paw scatter clashes with character image | Low | Paws sit BEHIND image, at 12-15% opacity. Image always wins visually. |
| Glass navbar slows scroll on low-end devices (backdrop-blur cost) | Low | `backdrop-blur-md` is well-supported on modern devices; cost is GPU-cheap. |

---

## Success Criteria

- Navbar feels frosted-glass (cyan-tinted), text legible at all scroll states
- Hero text legible inside a subtle card backdrop (no v1-style intrusion)
- Hero right side melts into cyan page bg (not yellow)
- Char Showcase: featured-left is small (~1/3), 2×2 grid is dominant (~2/3)
- Each character card has a subtle paw scatter visible on the accent backdrop
- White cloud dividers visible at ~3-4 section transitions, soft enough to not distract
- "The soulful, golden heart of ScoutPaw" renders in title case
- typecheck + lint + build all clean

---

## Out of Scope (Explicit)

- New banner artwork
- Logo asset re-tinting
- Footer changes
- Animations / motion design beyond existing hover states
- Per-character accentColor changes
- Dark-mode

---

## Unresolved Questions

None — design is ready to plan and cook.
