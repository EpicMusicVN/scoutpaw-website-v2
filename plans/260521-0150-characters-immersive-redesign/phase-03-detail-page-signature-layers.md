---
phase: 3
title: Detail Page Signature Layers
status: completed
priority: P2
effort: 4h
dependencies:
  - 1
---

# Phase 3: Detail Page Signature Layers

## Overview

Make each `/characters/[slug]` detail page feel distinct: add one signature
atmospheric layer per pup and an integrated YouTube channel badge near the
title. The existing themed template (gradient, motif scatter, bottom callout)
stays.

## Requirements

- Functional: each detail page renders its `atmosphere` layer + a channel badge
  below the subtitle linking to the pup's YouTube channel (new tab). Bottom
  `CharacterChannelCallout` unchanged.
- Non-functional: server components, CSS/SVG only, no client JS; decorative
  layers `aria-hidden` + `pointer-events-none`; AA contrast; reduced-motion safe.

## Architecture

```
app/characters/[slug]/page.tsx
  └─ <CharacterDetailHero character theme channel />   ← channel prop added
       ├─ <CharacterAtmosphere atmosphere decor />     ← new, behind motif
       ├─ <CharacterMotif ... />                        (existing scatter)
       ├─ h1 "Say hi to {name}" + breed + tagline
       └─ <CharacterChannelBadge channel decor />      ← new, below subtitle
  └─ story block ... <CharacterChannelCallout ... />    (existing, kept)
```

- **`CharacterAtmosphere`** — switches on `atmosphere` id, renders a single
  full-bleed decorative layer, `aria-hidden`, layered *behind* the motif scatter
  (lower z-index), tinted by `decor`:
  - `nightlight` → soft warm radial-gradient glow (CSS radial-gradient).
  - `motion` → repeating diagonal speed-line streaks (SVG `<line>`s / gradient).
  - `ribbons` → a few long curved SVG `<path>` ribbons, low opacity.
  - `blueprint` → faint grid lines (CSS `repeating-linear-gradient`).
  - `ridge` → 2–3 layered mountain-ridge `<path>` silhouettes along the bottom.
- **`CharacterChannelBadge`** — small inline emblem: rounded pill, channel
  `bannerColor` tint, an inline YouTube glyph SVG + channel `name`. Anchor with
  `target="_blank" rel="noopener noreferrer"`, accessible label
  `"Watch {name} on YouTube"`. Decorative tint only — text stays `ink`/AA.
- Keep all copy/theme reads as-is; `channel` is already fetched in the page for
  the bottom callout — just thread it into the hero too.

## Related Code Files

- Create: `components/characters/character-atmosphere.tsx`
- Create: `components/characters/character-channel-badge.tsx`
- Modify: `components/characters/character-detail-hero.tsx`
- Modify: `app/characters/[slug]/page.tsx`

## Implementation Steps

1. **`character-atmosphere.tsx`** (server): prop `atmosphere: CharacterAtmosphere`
   + `color: string`. Map each id → a decorative layer (CSS/SVG per the table
   above). Wrap in an `aria-hidden`, `pointer-events-none`, `absolute inset-0`
   div; subtle drift via existing keyframes where it suits (reduced-motion safe).
2. **`character-channel-badge.tsx`** (server): props `channel: Channel`,
   `decor: string`. Render the themed pill anchor with inline YouTube SVG +
   channel name. External link, new tab, AA contrast.
3. **`character-detail-hero.tsx`**: add optional `channel?: Channel | null` prop.
   Render `<CharacterAtmosphere atmosphere={theme.atmosphere} color={theme.decor} />`
   beneath `<CharacterMotif>` (lower z-index). Render `<CharacterChannelBadge>`
   below the tagline `<p>` when `channel` is present.
4. **`app/characters/[slug]/page.tsx`**: pass the already-resolved `channel` to
   `<CharacterDetailHero>`. No new data fetch.
5. `npx tsc --noEmit` + `npx next lint` — confirm clean.

## Success Criteria

- [x] Each detail page shows its signature atmosphere layer; the 5 read visibly
      distinct from one another.
- [x] Channel badge renders below the subtitle, links to the correct YouTube
      channel in a new tab, AA contrast.
- [x] Bottom `CharacterChannelCallout` still present; motif scatter intact.
- [x] Decorative layers `aria-hidden`; `tsc` + `lint` clean; reduced-motion safe.

## Risk Assessment

- **Atmosphere over decoration** — layers must sit behind content + motif and
  stay low-opacity so copy contrast holds (AA). Verify text legibility per pup.
- **Badge duplication feel** — badge (title area) + callout (bottom) both link
  the channel; keep the badge compact/emblem-like so it reads as identity, not a
  repeated CTA.
- `Channel` may be `null` for an unmapped slug — badge render must be guarded.
