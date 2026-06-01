---
phase: 1
title: Data Model & Consumer Refresh
status: completed
priority: P1
effort: 3h
dependencies: []
---

# Phase 1: Data Model & Consumer Refresh

## Overview

Migrate the `Character` data model to the new copy shape (add `quote`, drop
`funFacts`), load the new copy for all 5 characters, and refresh every existing
consumer in the same phase so `tsc`/build stay green.

## Requirements

- Functional: `CharacterSchema` gains `quote`, loses `funFacts`. `characters.json`
  carries new Subtitle/Description/Quote for all 5 pups. New reusable
  `CharacterQuote` component. Detail page renders the quote instead of fun facts.
- Non-functional: no orphan `funFacts` / `FunFactsList` references; `tsc --noEmit`
  clean at phase end.

## Architecture

- `CharacterSchema` (`lib/content/schemas.ts`): remove
  `funFacts: z.array(z.string()).default([])`; add `quote: z.string()`.
  `Character` type auto-derives via `z.infer`. Retain `tagline` (now holds the
  all-caps Subtitle/epithet) and `bio` (now holds the Description) — keeping the
  field names avoids a rename ripple through `generateMetadata` etc.
- `CharacterQuote` — server component, props `{ quote: string; accentColor: string }`.
  Pull-quote: oversized decorative quotation mark, accent-tinted card
  border/background tint, body text in `ink` on light `surface` (never text on a
  saturated accent fill — guarantees WCAG AA). Reused by the detail page (this
  phase) and `CharacterShowcaseSection` (Phase 2).
- Ripple: delete `FunFactsList`; detail page swaps it for `CharacterQuote`;
  `character-hero.tsx` / `character-card.tsx` adapted only if the grep audit
  shows they touch `funFacts`.

## Related Code Files

- Modify: `lib/content/schemas.ts`, `content/characters.json`,
  `app/characters/[slug]/page.tsx`, `components/characters/character-hero.tsx`,
  `components/characters/character-card.tsx`
- Create: `components/characters/character-quote.tsx`
- Delete: `components/characters/fun-facts-list.tsx`

## Implementation Steps

1. **Grep audit FIRST** (mitigates schema-removal ripple): search `funFacts`,
   `FunFactsList`, `fun-facts-list` across `app/`, `components/`, `lib/`. Record
   every hit. Also scan `tagline` / `bio` usages to confirm no surprise consumers.
2. `lib/content/schemas.ts` — in `CharacterSchema`: delete the `funFacts` line,
   add `quote: z.string()`.
3. `content/characters.json` — for each character set `tagline` ← Subtitle,
   `bio` ← Description, add `quote`, remove `funFacts`. Verbatim copy below.
   Keep `slug`, `name`, `breed`, `image`, `accentColor`, `order` untouched.
4. Create `components/characters/character-quote.tsx` per Architecture.
5. `app/characters/[slug]/page.tsx` — remove `FunFactsList` import + usage;
   render `<CharacterQuote quote={character.quote} accentColor={character.accentColor} />`
   in its place. `generateMetadata` keeps using `character.bio` — unchanged.
6. Delete `components/characters/fun-facts-list.tsx`.
7. Adapt `character-hero.tsx` / `character-card.tsx` per step-1 results (expected:
   they reference only `name`/`tagline`/`bio`/`image`/`accentColor` — verify).
8. Run `pnpm exec tsc --noEmit` + `node -e "JSON.parse(...)"` on `characters.json`.

## Verbatim Character Copy

Title = derived `"Say hi to {name}"` — NOT stored. Apply to existing slugs.

| slug | `tagline` (Subtitle) | `bio` (Description) | `quote` |
|---|---|---|---|
| max | THE SOULFUL, GOLDEN HEART OF SCOUTPAW | Max, our 'Welcome Wag-on,' is the heart of the crew. This snuggle master loves head-tilting to music and carrying his plushie, filling our home with love. He's our ScoutPaw Captain! | He believes every nap is a musical masterpiece and every stranger is just a best friend who hasn't shared a golden snack yet. |
| buddy | THE SPUNKY, LOW-RIDING SPARK OF SCOUTPAW | Buddy: big personality, short legs! This 'Professional Splooter' uses satellite ears to catch every beat. Fluffy trousers & pack leader, he proves you don't need height to liven up the party. | He believes no snack is too high to reach and every song is an excuse for a full-body wiggle. |
| bella | THE ELEGANT, ENCHANTING STAR OF SCOUTPAW | Bella, the crew's graceful 'Prima Ballerina,' uses her sharp mind to dance beautifully through musical stories, turning living rooms into peaceful stages. | She believes every calming melody is a dance and every dream is better when it's high-fashion. |
| oscar | THE BRILLIANT, BEAMING MIND OF SCOUTPAW | Oscar, the 'Professor of Play,' keeps your dog mentally sharp and relaxed with music. He's the smartest pup around! | He believes every day needs a job to do - and his favorite job is being the best study buddy your dog ever had. |
| rocky | THE WILD, WOO-WOOING SPIRIT OF SCOUTPAW | Rocky, our 'Howl-of-Fame' singer, is an adventurous leader. His voice and playful energy turn every day into an epic journey. | He believes every song deserves a howl-along and every living room is just an indoor mountain waiting to be climbed. |

## Success Criteria

- [ ] `CharacterSchema` has `quote`, no `funFacts`
- [ ] `characters.json` — all 5 updated, valid JSON, no `funFacts` keys
- [ ] `CharacterQuote` component renders a styled pull-quote
- [ ] `fun-facts-list.tsx` deleted; zero dangling imports
- [ ] Detail page `/characters/[slug]` renders `CharacterQuote`
- [ ] `pnpm exec tsc --noEmit` clean

## Risk Assessment

- **Schema removal ripple** — a missed `funFacts` consumer breaks the build.
  Mitigation: mandatory step-1 grep audit before any edit.
- **Copy punctuation** — descriptions contain apostrophes; ensure valid JSON
  string escaping (straight `'` needs no escaping inside double-quoted JSON).
