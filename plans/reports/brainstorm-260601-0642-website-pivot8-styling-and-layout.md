# Brainstorm — Pivot #8 (title color) + Layout Tuning

**Date:** 2026-06-01 06:42 | **Status:** Agreed | **Scope:** 4 sub-projects, mixed risk

## Problem Statement

User-requested website overhaul touching titles, kickers, character images, Characters-page structure, and Top Picks toggle. Bundled in original brief; decomposed into 4 sub-projects on review.

## Lock Mechanism Triggered (Sub-project A)

Per `docs/code-standards.md` lines 95-112, any swap of hero/banner/title color OR surface tokens spanning >5 components requires mockup-first review BEFORE code. User's request: gradient → solid yellow titles + gold → dark blue kickers sitewide. Touches 19+ components per pivot #7 changelog entry. Same direction as **pivot #6 (2026-05-28 06:49)** which was reverted by **pivot #7 same day** after live-render review. User explicitly opted into mockup-first this round.

## Hard Constraint

`text-brand-primary` (#ffd70c) on cyan body bg (#c6e7e9) = ~1.1:1 contrast — **forbidden by code-standards.md** as "physics ban." Going solid yellow forces ONE of: navy surface beneath title bands / per-title navy strip wrap / accepting a Lighthouse a11y fail. Mockup must surface these visually.

## User Decisions

| Question | Answer |
|---|---|
| Lock handling | Build full-page-context mockup first |
| Title-color contradiction resolution | Two-tier: hero/banner = yellow, card titles = blue |
| Tokens | Yellow = `text-brand-primary` (#ffd70c), Blue = `text-ink-blue` (#1a3a5c) |
| Sequencing | Parallel — ship B/C/D now, mockup A in background |
| Sub-project C approach | Reuse `character-channel-badge.tsx` in card layout |
| Sub-project B image size | +50% (`w-48` → `w-72`), offset reduced to `-left-8`/`-right-8` |

## Final Solution

### Sub-project A — Title color (MOCKUP-GATED)

Build `mockups/title-color-pivot8.html` — self-contained HTML page with cyan body bg + cloud divider transitions + 4 variants:

| Variant | Approach | Trade-off |
|---|---|---|
| A1 | Yellow on cyan, no surface change | Visually punchy, AA fails (~1.1:1) — Lighthouse a11y will flag |
| A2 | Yellow titles wrapped in local navy strip per h2 | AA-safe, heavy markup churn |
| A3 | Body bg darkens to navy in title bands only (pivot #6-lite) | AA-safe, big visual shift |
| A4 | Hybrid: hero h1 stays gradient (it's on a hero gradient bg already), section h2s only switch to solid yellow on local navy strip | Surgical, preserves what worked |

All 4 share: kicker `text-ink-blue` (deep navy, replaces current `text-brand-gold`), card-internal titles `text-ink-blue`.

User reviews mockup in browser. Picks variant. Implementation locks to that variant per code-standards.md lock mechanism.

### Sub-project B — Become a VIP + Subscribe card pose tuning

Two files, identical structural change:

| File | Lines | Change |
|---|---|---|
| `components/home/newsletter-cta.tsx` | 170-184 | `w-48` → `w-72`, `-left-20`/`-right-20` → `-left-8`/`-right-8`, `bottom-8`/`bottom-10` → `bottom-6` |
| `components/watch/subscribe-card.tsx` | 33-50 | Same pattern |

Result: characters 50% larger, peek into card edge instead of floating in negative space.

### Sub-project C — Characters page

| Change | File | Detail |
|---|---|---|
| Bigger poses | `components/characters/character-section.tsx:121` | `max-w-[380px] md:max-w-[520px] lg:max-w-[560px]` → `max-w-[440px] md:max-w-[620px] lg:max-w-[700px]` (+~25%) |
| YouTube card | same file, ~line 172 (after products grid) | Reuse `character-channel-badge.tsx` rendered card-style, alongside or below the products grid. Lookup channel via existing `channelSlug` on Character + `lib/content.getChannel()`. |

No schema change. `Character.products` + channel lookup already exist.

### Sub-project D — Top Picks remove toggle

`components/top-picks/top-picks-board.tsx`:
- Drop `open/setOpen` state, `onToggle` callback, the `grid-template-rows: 0fr/1fr` accordion wrapper, the `inert` prop, the `OFFERS_ID` constant
- `<DealBlockCard>` becomes a non-interactive header (no `onToggle`/`controlsId` props)
- Render `<ul>` of picks directly, always visible

`components/top-picks/deal-block.tsx`:
- Drop the button/toggle role
- "Cozy Season Bundle" title → `text-ink-blue` (replaces current gradient/color, pending file read)

## Files Touched (B + C + D implementation)

| File | Lines | Change |
|---|---|---|
| `components/home/newsletter-cta.tsx` | ~6 | pose sizing + offset |
| `components/watch/subscribe-card.tsx` | ~6 | pose sizing + offset |
| `components/characters/character-section.tsx` | ~10 | pose max-w bump + YouTube card insert |
| `components/characters/character-channel-badge.tsx` | possibly minor | adapt for card-style usage if needed |
| `components/top-picks/top-picks-board.tsx` | ~20 (deletions) | drop accordion state + always-render grid |
| `components/top-picks/deal-block.tsx` | ~5 | drop toggle role + title color |

A is mockup-gated; files for A determined post-pick.

## Sources

- `docs/code-standards.md` lines 47-112 (typography contract + lock mechanism)
- `docs/project-changelog.md` 2026-05-28 pivot #7 entry (audit of last 7 pivots)

## Unresolved Questions

1. Mockup save location — `mockups/` (new dir at repo root) or `plans/visuals/`? Defaulting to `mockups/` since it's a working draft, not a plan artifact.
2. `character-channel-badge.tsx` current size/markup not yet read — may need a card-style adapter if it's small-format badge only.
3. Tablet (md) visibility for pose decoratives — user did not pick this option. Currently `lg`-only. Keeping `lg` default.
