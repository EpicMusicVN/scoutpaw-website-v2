# Brainstorm — Hero Glass Card + Floating Pack Cards

**Date:** 2026-05-13
**Status:** Approved, ready for `/ck:plan`
**Scope:** Two distinct home-page changes (one brainstorm covers both since same page, similar pattern):
1. Hero — Replace upper-left text panel with upper-right glass card containing new copy
2. Step Into the Pack — Restructure each MenuCard into two stacked elements (image card on top, smaller text card below with overlap)

---

## Problem Statement

User wants to evolve the home page from "cinematic banner with side-panel text" + "flat sticker cards" to "magazine-cover glass card hero" + "floating-image stacked-card grid". Both moves trade simplicity for premium-modern feel.

### Concerns surfaced + addressed

1. **Banner composition vs upper-right placement**: new banner has 5 dogs across the full horizontal band + upside-down peekers (samoyed/husky) at top. Upper-right glass card will partially overlap the peekers. User accepted — glass blur softens them, foreground dogs (corgi/golden/border-collie) stay fully visible.
2. **Text-length vs cinematic feel**: new hero copy is ~70 words (vs current ~15). Glass card with paragraph reads as "magazine cover" not "pure cinematic". User accepted — calibrating expectation, not building something else.
3. **Two-card stack vs auto-rows-fr grid**: separate image + text cards inside one Link could break heights. Resolved: image card is `aspect-square` (fixed), text card grows; grid's `auto-rows-fr` stretches outer link wrappers uniformly.

## User-Locked Decisions

- Hero position: top-right glass card, accept peeker overlap (glass blur softens)
- Hero CTAs: keep both Watch Now (dark) + Meet the Pack (outline)
- Typography hierarchy: 3-tier — kicker SCOUTPAW TV / headline THE ULTIMATE WORKDAY HANGOUT / body
- Pack cards: two stacked cards with overlap (image card top, narrower text card below, `-mt-10` overlap)

## Approaches Evaluated

### Hero

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| Top-right glass card | Honors user direction; glass blur softens peeker overlap; foreground dogs untouched | Partial overlap with peekers (acceptable) | **Chosen** |
| Right vertically-centered | More "cinematic balance" | Covers border collie + cardboard box (foreground content) | Rejected |
| Top-right narrow column | Less peeker overlap | Sidebar feel, breaks the 70-word body | Rejected |
| Keep current upper-left + glass styling | Minimal overlap | Ignores user's stated direction | Rejected |

### Pack cards

| Approach | Pro | Con | Verdict |
|---|---|---|---|
| Two stacked cards w/ negative-margin overlap | Matches user description literally; clear layered depth | Slight markup complexity | **Chosen** |
| Single card w/ image overflowing top edge | Simpler markup | Less "layered depth" feel | Rejected |
| Image sticker (drop-shadow only) floating on flat text card | Cleanest hierarchy | Loses the colored-bg "platform" for the icon | Rejected |

## Final Solution

### Hero (`components/home/full-bleed-hero.tsx`)

Restructure from "full-bleed image + overlay flex container" to "responsive 2-mode layout":

- **Mobile (<md):** banner = `aspect-[4/3]` block + glass card flows below in normal stack with `-mt-8` (32 px overlap onto banner bottom edge).
- **md+:** banner = `aspect-auto min-h-[100svh]` full-bleed + glass card = `absolute md:top-12 md:right-12 lg:top-16 lg:right-16`.

Glass card spec:
- `bg-honey/85 backdrop-blur-xl border border-white/40 shadow-cozy-xl rounded-3xl`
- `max-w-md lg:max-w-lg`
- `p-6 md:p-8 lg:p-10`

Typography:
- kicker `SCOUTPAW TV` — `font-display text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-warm-muted`
- headline `THE ULTIMATE WORKDAY HANGOUT` — `font-display text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold leading-[1.05] text-ink`
- body `Meet the pack! ...` — `text-base lg:text-lg leading-relaxed text-warm-text`

CTAs preserved: Watch Now (dark) + Meet the Pack (outline).

Gradient mask removed (no longer needed — glass card is self-contained).

### Pack cards (`components/home/menu-cards.tsx`)

Replace single `<div>` with two-element stack inside the `<Link>`:

**Image card (top):**
- `aspect-square rounded-[2rem] shadow-cozy-md`
- bg color per `card.bg`, accent glow per `card.accentGlow`, transparent icon padded `p-6`
- Hover: `group-hover:-translate-y-2 group-hover:shadow-cozy-lg`; icon `group-hover:scale-105`

**Text card (below):**
- `relative -mt-10 mx-4 rounded-2xl bg-surface p-5 md:p-6 shadow-cozy`
- Hover: `group-hover:shadow-cozy-md`
- Contains h3 + copy + Explore →

Card rotation hack (`rotate-2 / -rotate-2 / hover:rotate-0`) removed for premium-clean stack.

### Page wiring (`app/page.tsx`)

Update `FullBleedHero` props:
- kicker: `"SCOUTPAW TV"`
- title: `"THE ULTIMATE WORKDAY HANGOUT"`
- description: full 70-word paragraph

## Implementation Considerations

**Order:**
1. Hero restructure (full-bleed-hero.tsx)
2. Page wiring (app/page.tsx)
3. Pack cards (menu-cards.tsx)
4. `pnpm typecheck` + `pnpm lint`
5. User visual QA at 360 / 768 / 1024 / 1440

**Risks:**
- **Backdrop-blur mobile perf**: glass card on mobile sits below banner (only `-mt-8` overlap), so blur is applied to a small sliver — minimal cost.
- **Hero width tight at md (exactly 768px)**: `right-12` + `max-w-md` ≈ card takes 58% of width, leaves ~270 px for left-side foreground dogs. May feel cramped — visual QA decision, can drop to `md:max-w-sm` if needed.
- **Long headline wrapping**: "THE ULTIMATE WORKDAY HANGOUT" at `lg:text-5xl` in `max-w-lg` will wrap 2-3 lines. Per user's "comfortable line spacing" direction, this is fine.
- **Pack card stack heights**: `aspect-square` image card + variable text card; `auto-rows-fr` on grid keeps outer wrappers matched. Text cards may have empty bottom space if one card has shorter copy. Acceptable for current copy lengths.

## Files Touched

```
components/home/full-bleed-hero.tsx       (major restructure)
components/home/menu-cards.tsx            (major restructure)
app/page.tsx                              (3 prop updates)
```

## Out of Scope

- Other home sections (FeaturedPupSpotlight, CharacterShowcase, FeatureBanner, VideoGrid, Newsletter)
- Shop/Watch/Coming-Soon heroes
- Banner asset (unchanged)
- Navbar / Footer (unchanged)

## Success Criteria

- Hero: glass card pinned top-right on md+, flows below banner on mobile. New 3-tier copy renders. CTAs functional.
- Pack cards: two stacked elements visible per card; image card visually "sits on" text card. Hover lifts image more than text.
- `pnpm typecheck` + `pnpm lint` clean.
- Visual QA at 360/768/1024/1440 confirms layout integrity, character visibility, text legibility.

## Next Steps

1. `/ck:plan` — phased implementation
2. Cook against the plan
3. User spot-check on dev server

## Unresolved Questions

- At md exactly (768px), card may feel cramped — if so, drop `md:max-w-md` to `md:max-w-sm`. Visual QA decision.
- Headline `text-5xl` lg / `text-[3.5rem]` xl — should xl bump to text-6xl instead? Visual QA decision.
- Pack text card `bg-surface` (white) vs `bg-paper` (cream) — surface is cleaner contrast against colored image card; paper would feel warmer. Going with surface for now.
