---
phase: 3
title: "Detail Card & Transition"
status: pending
priority: P1
effort: "1d"
dependencies: [2]
---

# Phase 3: Detail Card & Transition

## Overview

Wire the click-to-expand interaction: clicking a card hides the others and
morphs it into a large themed detail card. Open state syncs to `?pup=<slug>`;
back/Escape/close return to carousel mode.

## Requirements

- Functional: click any card → detail card for that pup; other cards exit;
  URL → `?pup=<slug>`; close button + browser-back + `Escape` return to carousel;
  detail-mode prev/next arrows flip between pups.
- Non-functional: smooth morph; no reflow; reduced-motion → crossfade.

## Architecture

```
CharacterCarousel (client)
├─ reads ?pup via useSearchParams → mode = pup ? "detail" : "carousel"
├─ writes ?pup via useRouter (router.push, { scroll:false })
└─ <AnimatePresence mode="popLayout">
   ├─ carousel mode → backdrop + track + arrows         (Phase 2)
   └─ detail  mode → character-detail-card
```

**Morph:** carousel card artwork carries `layoutId={\`pup-\${slug}\`}`; the
detail card's artwork wrapper shares the same `layoutId` → framer-motion morphs
between them. Non-selected cards `exit` with staggered fade + scale-down.

**State:** single source of truth = `?pup` query param. `useSearchParams()`
resolves the open pup; `mode` derives from it. Carousel `scrollTo` the pup's
index on close so it re-centers correctly.

## Related Code Files

- Create: `components/characters/character-detail-card.tsx` — expanded detail.
- Modify: `components/characters/character-carousel.tsx` — mode state, query-param
  read/write, `AnimatePresence`, focus management, `Escape` handler.
- Modify: `components/characters/character-carousel-card.tsx` — confirm `layoutId` + `onSelect`.
- Modify: `components/characters/character-carousel-arrows.tsx` — reuse in detail mode for prev/next pup.
- Read for context: `components/characters/character-detail-hero.tsx`,
  `components/characters/character-atmosphere.tsx`, `components/characters/character-motif.tsx`,
  `components/characters/character-quote.tsx`, `lib/content/character-themes.ts`.

## Implementation Steps

1. `character-detail-card.tsx`:
   - Props `{ character: Character; theme: CharacterTheme; onClose: () => void; onPrev/onNext }`.
   - Themed `heroGradient` background; full-bleed `CharacterAtmosphere` + `CharacterMotif` scatter.
   - Artwork wrapper with `layoutId={\`pup-\${slug}\`}`, large pose, accent glow.
   - Text stack: breed kicker, "Say hi to {name}" title (`font-display`), all-caps
     `tagline` subtitle (accent color), `bio` description, `CharacterQuote`.
   - "✕ Back to the pack" close button (top-right); prev/next arrows reuse.
   - Desktop split layout, mobile stacked (Phase 4 refines breakpoints).
2. `character-carousel.tsx` upgrades:
   - `useSearchParams()` → `openSlug`; `mode = openSlug ? "detail" : "carousel"`.
   - `openPup(slug)`: `router.push(\`?pup=\${slug}\`, { scroll:false })`.
   - `closePup()`: `router.push(pathname, { scroll:false })`, then `scrollTo` carousel index.
   - `Escape` keydown listener closes when in detail mode.
   - `getCharacterTheme(slug)` for the open pup's palette.
   - `AnimatePresence mode="popLayout"` swaps carousel ↔ detail.
   - On open: move focus to detail heading; on close: restore focus to source card.
3. Card exit: non-selected cards animate fade + scale-down, slight stagger.
4. Reduced-motion: morph → simple crossfade; no stagger.
5. Initial-load deep link: if `?pup=` present on mount, render detail mode directly.
6. Typecheck + build + smoke test: open, close, back-button, Escape, deep link, prev/next.

## Success Criteria

- [ ] Clicking any card opens its detail card with layoutId morph.
- [ ] Other cards exit cleanly ("hide the others").
- [ ] URL updates to `?pup=<slug>`; browser-back closes detail.
- [ ] Close button + `Escape` return to carousel; carousel re-centers on that pup.
- [ ] Direct load of `/characters?pup=max` opens detail mode.
- [ ] Detail-mode prev/next flips pups without collapsing.
- [ ] Focus moves to detail on open, restored on close.

## Risk Assessment

- Embla transform vs framer `layoutId` morph conflict — keep Embla scale on the
  outer slide, `layoutId` morph on an inner wrapper (separate transform contexts).
- Loop index ↔ `?pup=` sync — resolve initial index from query param before/at Embla init.
- `character-detail-card.tsx` <200 LOC — reuse atmosphere/motif/quote primitives;
  if it grows, extract a shared `character-profile-layout` (also usable by `[slug]`).
