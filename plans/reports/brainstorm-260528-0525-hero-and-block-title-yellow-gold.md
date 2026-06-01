---
type: brainstorm
date: 2026-05-28 05:25
slug: hero-and-block-title-yellow-gold
status: design-approved
supersedes: plans/reports/brainstorm-260527-1833-hero-kicker-blue-title-gold.md
---

# Hero + Block Title — Yellow/Gold Sweep

## Problem statement

Two bundled scopes:

1. **Hero swap (pending from yesterday's plan)** — Kicker (e.g. "SCOUTPAW TV") → deep navy; H1 title → royal golden-yellow gradient. Applies to all 5 hero components.
2. **Block titles (new today)** — Section/block titles across the site → yellow or yellow/golden gradient. Applies tiered by text-size to honor WCAG AA.

User intent: site-wide visual identity push toward yellow/gold authority titles + navy kicker eyebrows. No bg redesigns.

## Context — pivot history (now 4 in <72h)

| Date | Decision |
|---|---|
| 2026-05-26 (Plan J) | Navy hero surfaces + yellow titles + `.heading-gradient-gold` |
| 2026-05-26 (reversal) | Light surfaces + navy titles + gold kickers |
| 2026-05-27 (yesterday) | Re-swap: navy kickers + gold titles (light bg) — plan written, **not shipped** |
| 2026-05-28 (today) | Bundle yesterday's pending hero swap + extend yellow rule to block titles |

User confirmed yesterday's plan is unshipped → this brainstorm supersedes it and absorbs both scopes.

## Requirements

| # | Requirement |
|---|---|
| R1 | All 5 hero components: kicker = navy, H1 = gold gradient (identical to yesterday's design) |
| R2 | Large h2 section banners (≥`text-4xl` at any breakpoint) = same gold gradient as hero H1 (DRY) |
| R3 | Mid h2/h3 sub-headers (`text-2xl`/`text-3xl` base) = solid `text-brand-gold` (`#b8862e`) |
| R4 | Card-level h3 (product names, video titles, character names, menu icon labels) = **unchanged**, stay `text-ink-blue` |
| R5 | Single new CSS utility max — `.heading-gradient-gold-light` (symmetric, light-surface-safe) |
| R6 | Brand yellow tone unchanged: `--brand-primary` `#ffd70c` |
| R7 | No surface bg changes — colors only |

## Evaluated approaches

### Approach A — Reuse `.heading-gradient-gold` everywhere ❌
Existing utility fades to pure white at 100%. On `#c6e7e9` paper bg right half of every gradient title disappears. Rejected — same legibility cliff Plan J reversal flagged.

### Approach B — Solid `text-brand-gold` (`#b8862e`) for everything ❌
AA-safe at large size only (~3.4:1 on cyan). Loses gradient richness user explicitly wants. Rejected for hero h1 + large h2 banners; **kept** for mid h2/h3 sub-headers (smaller text where gradient is harder to read).

### Approach C — Add `.heading-gradient-gold-light` (symmetric gold) ✅ chosen
Linear gradient `dark-gold → brand-yellow → dark-gold`. No invisible regions on light bg. Existing `.heading-gradient-gold` stays untouched for future navy-surface reuse. Additive, zero regression risk. Combined with solid `text-brand-gold` fallback for mid-tier titles where gradient detail is lost at small text sizes.

### Approach D — Change card surfaces to ink-blue, make yellow safe ❌
User explicitly rejected via legibility-tolerance question. Big visual shift; out of scope.

## Final design

### 1. New utility — `app/globals.css`

Add after existing `.heading-gradient-gold` block (~line 270):

```css
/*
 * Yellow gradient sized for LIGHT hero / section surfaces (cyan paper / white).
 * Symmetric: dark gold anchors both ends so no stop fades into the bg.
 * Pair with `.text-shadow-soft` if extra lift is needed on busy imagery.
 */
.heading-gradient-gold-light {
  background-image: linear-gradient(
    90deg,
    #b8862e 0%,
    #d4a833 25%,
    var(--brand-primary) 50%,
    #d4a833 75%,
    #b8862e 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
@media (max-width: 639px) {
  .heading-gradient-gold-light {
    background-image: linear-gradient(
      90deg,
      #b8862e 0%,
      var(--brand-primary) 50%,
      #b8862e 100%
    );
  }
}
```

### 2. Hero swaps (5 components — kicker → ink-blue, h1 → gradient)

| File | Line | Element | Before | After |
|---|---|---|---|---|
| `components/home/full-bleed-hero.tsx` | 28 | kicker | `text-brand-gold` | `text-ink-blue` |
| `components/home/full-bleed-hero.tsx` | 31 | h1 | `text-navy` | `heading-gradient-gold-light` |
| `components/home/cinematic-hero.tsx` | 89 | kicker | `text-brand-gold` | `text-ink-blue` |
| `components/home/cinematic-hero.tsx` | 92 | h1 | `text-navy` | `heading-gradient-gold-light` |
| `components/watch/watch-hero.tsx` | 113 | kicker | `text-brand-gold` | `text-ink-blue` |
| `components/watch/watch-hero.tsx` | 116 | h1 | `text-navy` | `heading-gradient-gold-light` |
| `components/coming-soon/coming-soon-hero.tsx` | 24 | kicker | `text-brand-gold` | `text-ink-blue` |
| `components/coming-soon/coming-soon-hero.tsx` | 27 | h1 | `text-navy` | `heading-gradient-gold-light` |
| `components/characters/character-detail-hero.tsx` | 39 | breed kicker | `text-ink-blue/65` | `text-ink-blue` |
| `components/characters/character-detail-hero.tsx` | 42 | h1 | `text-navy` | `heading-gradient-gold-light` |

### 3. Large h2 section banners (≥text-4xl base) — apply gradient

| File | Line | Sizes |
|---|---|---|
| `components/home/menu-cards.tsx` | 70 | 4xl→6xl |
| `components/home/feature-banner.tsx` | 52 | 5xl→7xl |
| `components/home/character-showcase.tsx` | 29 | 4xl→7xl |
| `components/home/featured-pup-spotlight.tsx` | 36 | 4xl→7xl |
| `components/home/newsletter-cta.tsx` | 76 | 5xl→7xl |
| `components/home/video-grid.tsx` | 35 | 4xl→7xl |
| `components/watch/explore-videos.tsx` | 80 | 4xl→6xl |
| `components/watch/playlist-grid.tsx` | 28 | 4xl→6xl |
| `components/shop/explore-products.tsx` | 73 | 4xl→7xl |
| `components/shop/about-shop.tsx` | 64 | 4xl→7xl |
| `components/top-picks/top-picks-board.tsx` | 52 | 4xl→6xl |
| `components/characters/character-section.tsx` | 144 | 4xl→6xl |
| `components/watch/featured-video.tsx` | 79 | 3xl→5xl (borderline, lean LARGE — scales to 5xl) |
| `components/top-picks/deal-block.tsx` | 42 | 3xl→5xl (borderline, lean LARGE) |

Swap: `text-navy` → `heading-gradient-gold-light` (keep all other classes intact).

### 4. Mid h2/h3 sub-headers — apply solid `text-brand-gold`

| File | Line | Sizes |
|---|---|---|
| `components/watch/our-channels.tsx` | 87 | 3xl→5xl (sub-section under hero) |
| `components/watch/video-rail.tsx` | 68 | 3xl→5xl |
| `components/watch/subscribe-card.tsx` | 12 | 3xl→4xl |
| `components/shop/shop-empty-state.tsx` | 16 | 3xl |
| `components/watch/watch-library.tsx` | 117 | 2xl→3xl |
| `components/shop/about-shop.tsx` | 82 | h3 2xl→3xl (sub-card title) |

Swap: `text-navy` → `text-brand-gold` (keep all other classes intact).

### 5. Card-level h3 (NO CHANGES — preserves AA)

Explicitly out of scope per legibility decision:
- `components/shop/product-card.tsx:110` (product name, `text-lg/xl/2xl`)
- `components/watch/playlist-grid.tsx:85` (playlist title, `text-2xl/3xl`)
- `components/home/menu-cards.tsx:118` (icon card label, `text-xl/2xl`)
- `components/shop/explore-products.tsx:115` (card title, `text-xl/2xl`)
- `components/watch/video-card.tsx` (any small video titles, similar tier)

Body text, breadcrumbs, navigation, footer, buttons — all untouched.

## Implementation considerations

| Item | Note |
|---|---|
| Build gate | Per `memory/build-verification-gate.md` — typecheck + lint + live render, NOT `pnpm build` while dev server runs |
| Mobile fallback | Gradient utility has 3-stop mobile variant — narrow viewports keep visible gold without artefacts |
| Character themes | `character-detail-hero` sits on per-character `theme.heroGradient` (light pastel) — gradient anchors at dark-gold both ends pass AA on all themes. Spot-check 3 themes during verification. |
| CharacterSection | `character-section.tsx:144` — h2 on `theme.surfaceTint`. Same anchor logic. |
| Watch hero kicker | Hardcoded literal `"ScoutPaw TV"` (line 114) — out of scope to refactor, but same color rule applies. |
| Existing utilities | `.heading-gradient-gold` (5-stop with white) stays for future navy-surface reuse. `.heading-gradient-tri` and `-cool/-warm` untouched. |
| Code-standards.md | Will need update — current contract says heroes use solid `text-navy` h1 + `text-brand-gold` kicker. Both invert under this plan. Plus new rule for block h2 titles. |
| docs/project-changelog.md | Append new dated entry summarising both scopes + supersession of yesterday's plan |

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Mid h2/h3 `text-brand-gold` at `text-2xl` borderline AA (~3.4:1) | Med | Acceptable per "Strict AA" decision since text-2xl is still "large" by AA standards (≥18pt). Verify per-component bg during render. |
| Gradient title competes with hero h1 visually (no hierarchy) | Med | Hero h1 vs block h2 differentiated by SIZE (hero uses `text-4xl→text-7xl` at desktop), not color. Acceptable trade — user explicitly chose "identical" treatment. |
| User reverses for a 5th time | Med | Documented supersession of yesterday's plan + journal entry. If reversal happens, force a design audit before any swap. |
| Card-level h3 stays navy while parent h2 turns gold → visual inconsistency inside same card | Low | Hierarchy reads as "gold for emphasis, navy for content" — defensible reading order. |
| `featured-video.tsx` + `deal-block.tsx` borderline classification (3xl base) | Low | Classified as LARGE (gradient) because they scale to 5xl. If they look off in render, downgrade to solid `text-brand-gold` per `our-channels`/`video-rail` precedent. |
| `bg-paper` cyan + gradient gold on overlapping atmospheric imagery (paw patterns, characters) | Low | Existing `.text-shadow-soft` available if needed during render. Don't pre-apply blindly. |

## Success criteria

- All 5 hero pages render kicker in deep navy + h1 in gold gradient
- 14 large h2 section banners render in gold gradient
- 6 mid h2/h3 sub-headers render in solid dark gold
- 5+ card-level h3 titles unchanged (still navy)
- No part of any title becomes invisible on any surface (white card, cyan body, character themes, glass blob)
- Typecheck + lint pass; live render verified across 7 routes (home, shop, watch, characters, characters/[slug], coming-soon/[slug], top-picks)
- `docs/code-standards.md` updated to reflect new contract
- `docs/project-changelog.md` appended with dated entry

## Next steps

1. Create implementation plan via `/ck:plan` with this report as context
2. Phase 1: Add `.heading-gradient-gold-light` utility to `app/globals.css`
3. Phase 2: Hero swaps (5 components × kicker + h1)
4. Phase 3: Large h2 banner sweep (14 components)
5. Phase 4: Mid h2/h3 sweep (6 components)
6. Phase 5: Live render verification + spot-check character themes
7. Phase 6: Update `docs/code-standards.md` + `docs/project-changelog.md`
8. Mark yesterday's plan `plans/260527-1833-hero-kicker-blue-title-gold/` as `superseded` (don't delete — historical record)

## Unresolved questions

- Should the two borderline elements (`featured-video.tsx:79`, `deal-block.tsx:42`) get gradient (current call) or solid `text-brand-gold` (safer)? — propose: ship as gradient, downgrade only if render looks crowded.
- Does `shop-empty-state.tsx:16` (h2 text-3xl only, no scale-up) belong in MID (current call) or LARGE? — current call holds; it's a one-shot emergency state, not a banner.
- If a per-character theme `surfaceTint` blends too close to gold (e.g. cream/tan tints), do we add a per-theme override or hard-block? — propose: ship, add override only if observed during verification.
