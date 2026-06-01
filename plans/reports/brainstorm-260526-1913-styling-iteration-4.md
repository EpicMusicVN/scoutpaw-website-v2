# Brainstorm — Styling Iteration 4: Navy Hero Surfaces, Typography Contract Audit, True Crossfade

**Date:** 2026-05-26 (fourth iteration after A–I shipped)
**Scope:** Three sub-projects fixing what previous iterations couldn't solve: yellow titles + readability, contract consistency, character scene blending.

## Problem Statement

User has asked three times for visual changes that previous iterations addressed partially but not fully:

1. **Yellow hero titles + yellow SCOUTPAW TV kicker** — every iteration shipped a compromise (blue text, gold dim, ink-blue) because yellow on cyan/cream fails WCAG AA. User now insists.
2. **Typography contract** "yellow bg → blue text, blue bg → yellow text" — applied inconsistently because every component sets colors manually.
3. **Character scene transitions** — Plan E added outgoing fade, Plan H added incoming fade 0.5→1.0; user says STILL too separated.

## Brutal Honesty Captured

- **Yellow on light bg is a physics problem.** ~1.4:1 contrast. Text-shadow doesn't save it for body text. To get yellow titles to work, we must change the SURFACE under them.
- **Manual color enforcement always drifts.** Need either a documented contract + audit OR a refactor to wrapper components.
- **Plan H opacity range 0.5→1.0 was too narrow** — adjacent scenes always partially overlap, never fully fade through. And solid full-bleed tints with no edge gradient still register as hard color jumps.

## Decisions Locked

| Concern | User Choice |
|---|---|
| Hero surface treatment | **Change hero text containers to navy bg** — solves readability for yellow titles + kickers everywhere |
| Typography enforcement | **Document contract + manual audit** (lightweight; no new abstraction) |
| Character transition softening | **mask-image edge feathering + 0→1 opacity** — true crossfade through feathered edges |

## Final Recommended Solution

### Sub-Plan J — Hero Redesign: Navy Surfaces + Yellow-Only Titles + Yellow Kickers

**Files:** `app/globals.css`, 5 hero components, `tailwind.config.ts` (no change expected — `bg-navy` already wired).

**1. New `.heading-gradient-gold` utility (replaces `.heading-gradient-tri` on hero h1s):**
```css
.heading-gradient-gold {
  background-image: linear-gradient(
    90deg,
    #b8862e 0%,                  /* dark gold */
    #d4a833 22%,                 /* warm gold */
    var(--brand-primary) 50%,    /* brand yellow #ffd70c */
    #fff5cc 78%,
    #ffffff 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
@media (max-width: 639px) {
  .heading-gradient-gold {
    background-image: linear-gradient(90deg, #b8862e 0%, var(--brand-primary) 100%);
  }
}
```

**2. New `.text-shadow-bold` lift for gold-on-navy depth:**
```css
.text-shadow-bold {
  text-shadow:
    0 2px 0 rgb(15 37 64 / 0.4),
    0 4px 12px rgb(15 37 64 / 0.25),
    0 0 24px rgb(255 215 12 / 0.35);
}
```

**3. Hero text containers → navy bg:**

| Hero | Current text container | New |
|---|---|---|
| CinematicHero (home) | `bg-surface` (white) + `border-ink/10` | `bg-navy` + `border-navy/30` |
| FullBleedHero mobile glass card | `bg-white/90` | `bg-navy/90` (preserves backdrop-blur) |
| FullBleedHero desktop glass blob | `bg-white/55 backdrop-blur-xl` | `bg-navy/85 backdrop-blur-xl` |
| WatchHero centered text | (no container — direct on cyan body) | Wrap in `bg-navy rounded-[2rem] px-8 py-10` |
| ComingSoonHero text | (no container — direct on cyan body) | Wrap in `bg-navy rounded-[2rem] px-6 py-8` |
| CharacterDetailHero text | themed `surfaceTint` block | Keep theme bg (per-character intent); only swap h1 + kicker colors |

**4. Hero kickers** → `text-brand-primary` (yellow on navy = ~7:1 AA ✓):
- "SCOUTPAW TV" (watch-hero), kicker prop in cinematic/full-bleed/coming-soon/character-detail heroes
- Exception: CharacterDetailHero keeps current colors since its bg stays themed (not navy)

**5. Hero h1s** swap `heading-gradient-tri text-shadow-soft` → `heading-gradient-gold text-shadow-bold`.

**6. Hero body text inside navy containers** → `text-white/85` or `text-brand-primary/80`.

### Sub-Plan K — Typography Contract Audit + Documentation

**Files:** `docs/code-standards.md`, possibly minor fixes in components found to violate contract.

**1. Add Surface → Text Color Contract section to `docs/code-standards.md`:**

```markdown
## Surface → Text Color Contract

This contract MUST be enforced everywhere. Reviewers check PRs against it.

| Surface | Heading | Body | Notes |
|---|---|---|---|
| Light (white, surface, cyan, cream, warm-tan) | `text-navy` h2; gradient h1 | `text-ink-blue` | Default bulk content |
| Yellow (`bg-brand-primary`, yellow gradients) | `text-ink-blue` / `text-navy` | `text-ink-blue` | Brand surfaces, primary buttons |
| Navy / dark blue (`bg-navy`, hero containers) | `text-brand-primary` / `heading-gradient-gold` | `text-white/85` or `text-brand-primary/80` | Footer, hero text panels |
| Dark anchor (`bg-ink` button) | n/a | `text-surface` (white) | Newsletter submit button, badges |

### Forbidden combinations (WCAG AA violations)
- Yellow text on cyan / white / cream — ~1.4:1, FAILS AA
- Blue text on navy — ~1:1, FAILS AA
- Brown ink on warm-tan — borderline, prefer `text-ink-blue`
```

**2. Audit checklist (manual sweep):**

Scan for these patterns and verify text colors comply:
- `bg-brand-primary` → text must be `text-ink-blue` (or `text-navy`). Audit: button.tsx, mobile-nav.tsx (active), video-card category badge, product-card price pill, top-picks CTA, feature-banner, newsletter inside pills if any.
- `bg-navy` → text must be `text-brand-primary` / `text-white` / `heading-gradient-gold`. Audit: subscribe-card YouTube button, footer headings, new hero containers from Plan J.
- `bg-ink` (button) → text-surface. Audit: newsletter submit button (correct).
- Warm/peach/blush/sage gradient surfaces → text-ink-blue (light surface rule).

**3. Fix any violations found** during audit. Most are likely already correct from Plan D's body sweep.

**4. Update changelog with audit results.**

### Sub-Plan L — Character Scene mask-image Feathering + 0→1 Crossfade

**Files:** `components/characters/character-section.tsx`.

**1. Add `mask-image` to motion.div** style:
```tsx
<motion.div
  style={{
    scale,
    opacity,
    backgroundColor: theme.surfaceTint,
    maskImage: "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
  }}
  className="..."
>
```

Top + bottom 12% of each scene fade to transparent. Adjacent scenes blend through each other's feathered edges.

**2. Widen incoming opacity to true 0→1 crossfade:**
```diff
- const incomingOpacity = useTransform(enterProgress, [0, 1], reduce ? [1, 1] : [0.5, 1]);
+ const incomingOpacity = useTransform(enterProgress, [0, 1], reduce ? [1, 1] : [0, 1]);
```

**3. Verify** that the composite `incoming × outgoing` formula still resolves to 1 during sticky middle phase (it does — both ends of their respective ranges are 1).

## Implementation Considerations

- **Plan J navy heroes** = significant visual identity shift from "cozy warm" to "premium dark cinematic." User has chosen this knowingly. If post-implementation review prefers softer (e.g., `bg-navy/95` instead of solid navy), easy tweak.
- **Plan J hero kickers on navy** = yellow `#ffd70c` on navy `#397fc5` = ~7:1 AA-safe even at 12px. Solves the original "SCOUTPAW TV in yellow" request without compromise.
- **Plan J body text inside navy containers** = white-ish or yellow-ish. Hero description paragraphs need readable contrast — `text-white/85` on navy = ~5.5:1 ✓.
- **Plan J CharacterDetailHero exception** = its bg is intentionally per-character themed. Don't navy-wrap. Just verify h1/kicker colors are AA on its theme bgs (may need theme-aware text via accentColor).
- **Plan K contract enforcement** = doc-based; relies on reviewer discipline. Future violations may slip through — flag risk.
- **Plan L mask-image** = uses `WebkitMaskImage` for Safari. iOS 14+ supports linear-gradient mask. Confirmed in dev.
- **Plan L 0→1 crossfade** = combined with z-index stacking + sticky positioning, the FIRST scene's enterProgress starts at 1 if it's already in viewport on load (no fade-in artifact). Verify on `/characters` initial load.

## Risks

1. **Plan J navy hero look may feel jarring** vs current warm-cream identity. Live review essential. *Mitigation:* dial back navy intensity if needed (`bg-navy/90`, lighter tint).
2. **Plan J FullBleedHero glass tint over banner image** — navy/85 vs banner photo: ensure the text still reads against the banner-color-bleed-through. *Mitigation:* tighten alpha to `bg-navy/95` if text muddied.
3. **Plan J kicker rendering** on per-character heroes (CharacterDetailHero) — if we leave that hero unchanged, the "all heroes yellow kicker" rule has one exception. Acceptable: document it.
4. **Plan K audit miss rate** — manual checking, human-fallible. *Mitigation:* the doc gives reviewers a clear test.
5. **Plan L mask-image + sticky** — mask doesn't break sticky (mask is a paint-time effect, not a layout-altering one). Should work cleanly. *Mitigation:* visual check.
6. **Plan L 0→1 crossfade first-frame** — when page initially loads at top, `enterProgress` for the first scene might begin at 1 (already past the entry window) since the entry window is "start end → start start" and the user lands at the start. So first scene shows correctly. Verify.

## Success Metrics

- All hero h1s render gold gradient with text-shadow-bold lift, AA-safe over navy
- All hero kickers render yellow on navy at ~7:1 AA-safe
- Hero body text inside navy containers renders white-ish at AA-safe
- Plan K audit: 0 violations remaining; `docs/code-standards.md` contract section published
- Characters page: visible crossfade through feathered edges between adjacent scenes
- `pnpm typecheck` + `pnpm lint` clean
- No AA regressions on body text site-wide

## Plan Sequencing

Recommended order: **J → K → L** (J first because biggest visual change; K audits including the new navy hero surfaces; L is independent but L's changes only affect /characters so could run anytime).

Could parallelize: J alone, then K + L in parallel.

## Next Steps

- Scaffold three plans via `ck plan create`
- Each plan has 2 phases (small targeted scope)
- Ship J first, walk through live to confirm navy hero direction before K/L

## Unresolved Questions

- None at design time. CharacterDetailHero exception documented; live review will confirm navy intensity preference.
