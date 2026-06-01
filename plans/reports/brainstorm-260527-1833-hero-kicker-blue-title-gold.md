---
type: brainstorm
date: 2026-05-27 18:33
slug: hero-kicker-blue-title-gold
status: design-approved
---

# Hero Banner Color Swap — Dark-Blue Kicker + Royal Gold Title

## Problem statement

Site-wide visual identity update: invert hero banner color pairing so the eyebrow kicker (e.g. "SCOUTPAW TV") reads in deep navy and the H1 title reads in royal golden yellow. Apply uniformly across all 5 hero components on light cyan paper surface (no bg redesign).

## Context — recent history warning

Third pivot on the same two tokens in <48h:
- Plan J (260526-1913) — added gold gradient utilities + navy hero surfaces with yellow titles
- Plan J reversal — backed out to light surfaces + **navy titles + gold kickers** (current)
- This brainstorm — swap to **navy kickers + gold titles** while keeping light surfaces

User explicitly chose "light bg stays — only color swap" intent. Legibility risk acknowledged and mitigated via new utility (below).

## Requirements

| # | Requirement |
|---|---|
| R1 | All 5 hero components share the same kicker/title color rule |
| R2 | Kicker color = `var(--ink-blue)` (`#1a3a5c`) — body-text token, AA on light surfaces |
| R3 | Title color = gold gradient that stays legible on light cyan paper |
| R4 | No hero bg / layout changes |
| R5 | Reuse existing tokens; one additive utility max |
| R6 | Verify legibility on light cyan AND on every CharacterDetailHero themed gradient |

## Evaluated approaches

### Approach A — Reuse existing `.heading-gradient-gold` + text-shadow ❌
Existing utility fades to pure white at 100%. On `#c6e7e9` paper bg right half of every title is invisible. Text-shadow halo only partially rescues. Rejected: same issue Plan J reversal flagged.

### Approach B — Solid `--accent-gold-dark` (`#b8862e`) ❌
Simplest, AA-safe, never invisible. Costs "premium foil" effect. Rejected by user — wants the gradient richness.

### Approach C — New `.heading-gradient-gold-light` utility ✅ (chosen)
Symmetric gradient `dark-gold → brand-yellow → dark-gold`. No white stops → no invisible regions on light bg. Existing `.heading-gradient-gold` stays untouched for navy-surface reuse later. KISS + additive, zero regression risk.

## Final design

### 1. New utility — `app/globals.css`

Add after existing `.heading-gradient-gold` block (~line 270):

```css
/*
 * Yellow gradient sized for LIGHT hero surfaces (cyan paper / white).
 * Symmetric: dark gold anchors both ends so no stop fades into the bg.
 * Pair with .text-shadow-soft if extra lift is needed on busy imagery.
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

### 2. Per-hero swaps

| File | Line | Before | After |
|---|---|---|---|
| `components/home/full-bleed-hero.tsx` | 28 | `text-brand-gold` | `text-ink-blue` |
| `components/home/full-bleed-hero.tsx` | 31 | `text-navy` | `heading-gradient-gold-light` |
| `components/watch/watch-hero.tsx` | 113 | `text-brand-gold` | `text-ink-blue` |
| `components/watch/watch-hero.tsx` | 116 | `text-navy` | `heading-gradient-gold-light` |
| `components/coming-soon/coming-soon-hero.tsx` | 24 | `text-brand-gold` | `text-ink-blue` |
| `components/coming-soon/coming-soon-hero.tsx` | 27 | `text-navy` | `heading-gradient-gold-light` |
| `components/characters/character-detail-hero.tsx` | 39 | `text-ink-blue/65` | `text-ink-blue` |
| `components/characters/character-detail-hero.tsx` | 42 | `text-navy` | `heading-gradient-gold-light` |

Also audit `components/home/cinematic-hero.tsx` — present in repo but no kicker= references found. If contains same pattern, apply same swap; otherwise skip.

### 3. Pages downstream (no edits)

Pages already pass kicker text via prop — color is component-internal, no app-route changes:
- `app/page.tsx` — `kicker="SCOUTPAW TV"`
- `app/shop/page.tsx` — `kicker="ScoutPaw Shop"`
- `app/watch/page.tsx` — `kicker="Community Choice"` (note: WatchHero hardcodes "ScoutPaw TV" internally, not the page kicker)
- `app/characters/page.tsx` — `kicker="Characters"`
- `app/top-picks/page.tsx` — `kicker="Top Picks"`

## Implementation considerations

| Item | Note |
|---|---|
| Build gate | Per memory `build-verification-gate.md` — verify via typecheck + lint + live render. Do NOT run `pnpm build` while dev server is live. |
| Mobile fallback | Light gradient has 3-stop mobile variant so narrow viewports keep visible gold without artefacts. |
| Character themes | All themes use light pastel gradients per `lib/content/character-themes` — symmetric gold reads on all. Spot-check at least 3 themes during verification. |
| WatchHero kicker | Currently hardcoded literal `"ScoutPaw TV"` (line 114) — out of scope to make configurable. Same color rule still applies. |
| Existing utility | `.heading-gradient-gold` stays as-is. Future navy-surface direction can reuse it without rebuild. |

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Gold gradient clashes with one character theme | Med | Per-character override `style={{ color: theme.titleColor }}` if needed post-verification. Defer until observed. |
| Coming Soon hero — character image above title may compete | Low | Title sits below image, not overlaid. Visual hierarchy intact. |
| User reverses again (fourth pivot) | Med | Documented in this report + journal. Locked decision rationale. |
| `text-ink-blue` kicker on white glass blob too dark | Low | Glass blob bg already hosts ink-blue body text — same token, no contrast surprise. |

## Success criteria

- All 5 hero pages render kicker in deep navy + title in golden gradient
- No part of title becomes invisible on any hero surface (light cyan, white glass blob, character theme gradients)
- Typecheck passes, lint passes
- Mobile + desktop viewports visually consistent
- No regression in non-hero sections (kicker/title pattern is hero-specific)

## Next steps

1. (Optional) Create implementation plan via `/ck:plan` with this report as context
2. Implement utility + component edits
3. Live-render verify across 6 routes (home, shop, watch, coming-soon/[slug], characters, characters/[slug], top-picks)
4. Spot-check 3+ character themes
5. Update `docs/project-changelog.md` per documentation-management rule

## Unresolved questions

- Does `cinematic-hero.tsx` need the swap? — confirm during implementation by reading the file
- If a specific character theme fails legibility, do we ship with a per-theme override or hard-block? — propose: ship with override, don't block
