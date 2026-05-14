# Code-Static Findings — Responsive Audit
Generated: 2026-05-11

Stack: Next.js 15 / React 19 / Tailwind v3 (default breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536). Shared `Button` (`components/ui/button.tsx`) already enforces min-h 36/44/48 — uses of Button are not flagged.

## Severity Rubric
- **Critical** — broken layout / unreachable controls
- **Major** — awkward stacking, touch <44px, hero failing
- **Minor** — spacing roughness, cosmetic

---

## components/analytics

### cookie-consent.tsx
- **Major (L64-69, L70-75)**: Banner uses two ad-hoc `<button>`s. Decline button (L64-69) has only `px-4 py-2 text-sm` → computed ≈32-36px, **below 44px touch target**. Accept button (L70-75) has `px-5 py-2` → ~36-40px, also below. Fix: add `min-h-[44px]` to both, or convert to shared `Button` (`variant="ghost"` for Decline, `variant="primary"` for Accept).
- **Minor (L57)**: On <340px viewports the centered button cluster (`flex gap-2`) plus Accept's `px-5 py-2` could brush the right edge of the dialog. Low risk.

## components/characters

### character-hero.tsx — clean
### fun-facts-list.tsx — clean
### character-card.tsx — clean

## components/coming-soon

### coming-soon-hero.tsx — clean

## components/motion

### fade-in.tsx / stagger.tsx / wiggle.tsx / scroll-reveal.tsx — clean (motion wrappers, no layout opinions)

## components/shop

### shop-empty-state.tsx
- **Minor (L5)**: `p-12` all viewports — on small phones, 48px padding on every side feels heavy. Suggest `p-8 md:p-12`. Cosmetic.

### about-shop.tsx — clean

### product-grid.tsx
- **Minor (L95)**: FilterChip `min-h-[40px]` — below 44px AA recommendation. Same pattern in watch-library + explore-videos. Standardize to `min-h-[44px]`.
- Grid `grid-cols-1 sm:grid-cols-2 ... lg:grid-cols-3` correct.

### product-card.tsx
- **Minor (L99)**: Tag list `text-[0.7rem]` (≈11.2px) — below 12px accessibility minimum. Tags decorative; cosmetic.

### stacked-hero.tsx
- `min-h-[100svh]` intentional per brainstorm. Clean.

### explore-products.tsx
- **Minor (L94)**: Bottom label panel `p-4 md:p-5` — on 320px viewports with `aspect-square`, panel could push close to top if title + 2-line copy is long. Currently only 2 visible categories so unlikely. Watch this if all 4 tiles re-enabled.

## components/ui

### card.tsx / button.tsx / scroll-progress.tsx / back-to-top.tsx / section-curve.tsx / atmosphere-layer.tsx — clean

## components/nav

### top-nav.tsx — clean (logo `h-16 md:h-24 lg:h-28` intentional)
### mobile-nav.tsx — clean (compliant touch targets)
### nav-links.tsx — clean
### top-nav-scroll-effect.tsx — no-render

### footer.tsx
- **Minor (L112)**: Social icon links `h-11 w-11` (44×44) — exactly at AA threshold, borderline. Recommend `h-12 w-12` for headroom. Technically compliant.

## components/home

### featured-pup-spotlight.tsx — clean (`md:min-h-[560px]` only at md+)

### video-grid.tsx
- **Major (L55)**: Ad-hoc anchor "Watch on @ScoutPawTV" — NO `min-h-*`. Line-height alone ≈20-24px, below 44px target. Fix: `min-h-[44px] inline-flex items-center` (already has `inline-flex`).
- "See the full library" button at L48-54 has `min-h-[48px]` — compliant.

### hero-character-cluster.tsx — clean
### character-showcase.tsx — clean
### feature-banner.tsx — clean
### cinematic-hero.tsx — clean
### full-bleed-hero.tsx — clean
### menu-cards.tsx — clean (intentional uniform-height pattern)
### newsletter-cta.tsx — clean (submit + input both min-h-[56px])

## components/watch

### subscribe-card.tsx — clean (Subscribe link min-h-[48px])
### video-card.tsx — clean
### watch-library.tsx
- **@deprecated** — minor: FilterChip `min-h-[40px]` (same as product-grid).
### video-rail.tsx — clean
### our-channels.tsx
- **Minor (L156-172)**: Banner header `h-24` clips character peek (overflow-hidden parent). Verify visually whether intentional crop.
- **Minor (L213)**: Subscribe badge `min-h-[32px]` — badge inside larger clickable card; whole card is target. Acceptable.
### featured-video.tsx — **@deprecated** — no obvious bugs on skim
### playlist-grid.tsx — **@deprecated** — no obvious bugs on skim

### watch-hero.tsx (NEW)
- 3-col grid `md:grid-cols-[minmax(0,3fr)_minmax(0,7fr)_minmax(0,2fr)]` — `minmax(0,...)` flex-shrink protection ✓
- `min-h-[80svh]` intentional
- L133: third CharacterFigure uses `-left-12 bottom-6` BUT `hidden ... lg:block` — only shows lg+ where column widens. Safe.
- Title `text-4xl md:text-5xl lg:text-6xl` clean.

### explore-videos.tsx (NEW)
- **Minor (L133)**: FilterChip `min-h-[40px]` — below 44px floor. Same family as product-grid/watch-library.
- "See more on YouTube" anchor `min-h-[48px]` compliant.
- Grids `grid-cols-1 md:grid-cols-2` (large) and `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (small) clean.

---

## Cross-Cutting Patterns

1. **Filter chips at `min-h-[40px]`** — 3 components below 44px floor:
   - `components/shop/product-grid.tsx:95`
   - `components/watch/watch-library.tsx:221` (deprecated)
   - `components/watch/explore-videos.tsx:133`
   - **Fix**: standardize `min-h-[44px]` across all filter chips.

2. **Ad-hoc anchors below 44px touch target**:
   - `components/analytics/cookie-consent.tsx:64,70` (Decline/Accept in modal — highest priority)
   - `components/home/video-grid.tsx:55` ("Watch on @ScoutPawTV" text link)
   - `components/nav/footer.tsx:112` social icons at exactly 44px (borderline)
   - **Fix**: migrate cookie-consent buttons to shared `<Button>`; add `min-h-[44px]` to video-grid YouTube link; bump footer socials to `h-12 w-12`.

3. **Heavy headline sizes without small-mobile variant** — `text-5xl` baseline on heroes is intentional cinematic design with short copy. No wrap risk on existing copy. Affects: cinematic-hero, full-bleed-hero, stacked-hero, featured-pup-spotlight, feature-banner, newsletter-cta. **Not blocking.**

4. **Horizontal scroll rails (mobile)** — video-rail + our-channels rely on partial-card peek as "more →" affordance on mobile. Partial-peek widths sufficient. Well-designed.

5. **Section padding scaling** — all sections use `px-4 md:px-8` (or `... lg:px-12`) consistently. Clean.

---

## Touch-Target Violations

| Component | File:Line | Current | Required |
|-----------|-----------|---------|----------|
| Cookie Decline | `analytics/cookie-consent.tsx:64-69` | ~32-36px (no min) | `min-h-[44px]` |
| Cookie Accept | `analytics/cookie-consent.tsx:70-75` | ~36-40px (no min) | `min-h-[44px]` |
| Product filter chip | `shop/product-grid.tsx:95` | `min-h-[40px]` | `min-h-[44px]` |
| Watch library filter (deprecated) | `watch/watch-library.tsx:221` | `min-h-[40px]` | `min-h-[44px]` or delete file |
| Explore videos filter chip | `watch/explore-videos.tsx:133` | `min-h-[40px]` | `min-h-[44px]` |
| Home "Watch on @ScoutPawTV" | `home/video-grid.tsx:55` | no min-h | `min-h-[44px]` |
| Footer social icons | `nav/footer.tsx:112` | `h-11 w-11` (44px exact) | `h-12 w-12` headroom |

---

## Stats
- **Total files audited**: 44
- **Critical**: 0
- **Major**: 5 distinct touch-target violations
- **Minor**: ~20 observations (cosmetic)
- **Components clean** (17): characters/character-card.tsx, characters/fun-facts-list.tsx, coming-soon/coming-soon-hero.tsx, motion/{fade-in,stagger,wiggle,scroll-reveal}.tsx, ui/{card,button,scroll-progress,section-curve,atmosphere-layer,back-to-top}.tsx, nav/{top-nav-scroll-effect,nav-links}.tsx, home/{hero-character-cluster,character-showcase}.tsx

---

## Unresolved Questions
1. Filter-chip floor: project-wide design intent for filter chips — keep at 40px (denser pill) or bump to 44px?
2. Cookie consent buttons: would migrating to shared `<Button>` (carries `cta-shimmer` on `primary`) overstyle the restrained consent banner?
3. Footer social icons at `h-11 w-11`: AA technical pass; bump to `h-12 w-12` only if visual rhythm allows.
