---
phase: 3
title: Component Literal Swaps
status: completed
priority: P2
effort: 45m
dependencies:
  - 1
---

# Phase 3: Component Literal Swaps

## Overview

Update hardcoded copy inside 4 components: switch Pack Leader spotlight from Buddy to Max, rewrite Menu Cards section header + 3 cards, swap Watch Together title/desc/CTAs, and rewire Footer to read the new `footerExplore` field.

## Requirements

- **Functional:** All hardcoded strings inside the four components match the brand spec verbatim. Pack Leader pulls from `max` slug. Footer reads `footerExplore` with fallback to `navItems` for back-compat.
- **Non-functional:** No prop API changes (those land in Phase 2 + Phase 4 only). Server components remain server-only.

## Architecture

- **Pack Leader (`featured-pup-spotlight.tsx`)** stays data-driven for `bio` + `funFacts[0]` (updated in Phase 1) but the breed-derived subtitle is replaced with a literal brand string; lookup slug switches.
- **Menu Cards (`menu-cards.tsx`)** has hardcoded section H2 + description and an inline `allCards` array — all literal swaps.
- **Video Grid (`video-grid.tsx`)** has hardcoded title + description + CTA labels — literal swaps.
- **Footer (`footer.tsx`)** swaps the source of `exploreLinks` from `config.navItems` to `config.footerExplore ?? config.navItems`.

## Related Code Files

**Modify:**
- `components/home/featured-pup-spotlight.tsx`
- `components/home/menu-cards.tsx`
- `components/home/video-grid.tsx`
- `components/nav/footer.tsx`

**Create / Delete:** none

## Implementation Steps

### 3.1 `components/home/featured-pup-spotlight.tsx`

1. Swap character lookup:
   ```tsx
   const max = characters.find((c) => c.slug === "max") ?? characters[0];
   if (!max) return null;
   const quote = max.funFacts[0];
   ```
   Rename local var `buddy` → `max` everywhere in the function (lookup, JSX bindings, button hrefs/labels).
2. Update kicker literal:
   ```tsx
   <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-warm-muted md:text-sm">
     MEET THE PACK LEADER
   </p>
   ```
3. Update H2 — replace `Say hi to <span>Buddy.</span>` w/ literal Max, drop the period (user spec omits it):
   ```tsx
   <h2 className="mt-3 font-display text-5xl font-bold leading-[0.95] text-ink md:text-7xl lg:text-[5.5rem]">
     Say hi to <span className="block text-brand-gold">Max</span>
   </h2>
   ```
4. Replace the breed subtitle line w/ literal:
   ```tsx
   <p className="mt-2 font-display text-lg uppercase tracking-[0.2em] text-warm-muted md:text-xl">
     THE SOULFUL, GOLDEN HEART OF SCOUTPAW
   </p>
   ```
   (was: `The {buddy.breed}` — `breed` field stays in data, just unused on this surface.)
5. Body paragraph stays data-driven (`{max.bio}`); the bio string was already updated in Phase 1.
6. Blockquote stays data-driven (`{quote}` resolved from `max.funFacts[0]` — also updated Phase 1).
7. Button labels — `Meet {max.name}` becomes "Meet Max" automatically via data; secondary unchanged.

### 3.2 `components/home/menu-cards.tsx`

1. Update section header block:
   ```tsx
   <header className="text-center">
     <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-gold md:text-sm">
       The ScoutPaw World
     </p>
     <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-5xl lg:text-6xl">
       Step into the pack's world
     </h2>
     <p className="mx-auto mt-4 max-w-xl text-base text-warm-text md:text-lg">
       Whether you're here to meet the pack, find some new favorites, or start the music, there's something special for every pup and their hooman to discover!
     </p>
   </header>
   ```
   Kicker `"The ScoutPaw World"` preserved (per minor-decisions in brainstorm).
2. Rewrite the `allCards` array w/ verbatim labels + copy:
   ```tsx
   const allCards: Card[] = [
     {
       label: "CHARACTERS",
       copy: "Learn more about Buddy, Max, and all your favorite furry friends from the pack!",
       image: "/assets/card/characters.png",
       href: "#meet-the-pack",
       bg: "var(--bg-honey)",
       accentGlow: "var(--brand-honey)",
     },
     {
       label: "SHOP",
       copy: "Treat your pup to new favorites and grab something cute for yourself! From doggy essentials to fun human gear, there's a little magic here for both of you.",
       image: "/assets/card/shop.png",
       href: "/shop",
       bg: "var(--bg-peach)",
       accentGlow: "var(--bg-blush)",
     },
     {
       label: "WATCH",
       copy: "Experience every musical adventure and cartoon designed to keep your pup company all day.",
       image: "/assets/card/watch.png",
       href: "/watch",
       bg: "var(--bg-warm-tan)",
       accentGlow: "var(--bg-sky-deep)",
     },
   ];
   ```
   Keep `LIVE_HREFS` filter as-is (`#meet-the-pack`, `/shop`, `/watch` — all 3 visible).
3. Smart-quote/apostrophe note: copy uses U+2019 (`'`) — preserve exactly as user supplied to avoid typographic drift.

### 3.3 `components/home/video-grid.tsx`

1. Update section header:
   ```tsx
   <header className="text-center">
     <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
       Watch Together
     </p>
     <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-6xl lg:text-7xl">
       Peace. Play. Playback.
     </h2>
     <p className="mx-auto mt-4 max-w-2xl text-base text-ink/85 md:text-lg">
       Switch on ScoutPaw TV - soothing rhythms and cozy colors crafted to keep your best friend company.
     </p>
   </header>
   ```
   Kicker `"Watch Together"` preserved.
2. Update CTA buttons:
   ```tsx
   <Link href="/watch" className="...">
     DIVE INTO THE LIBRARY
     <span aria-hidden="true">→</span>
   </Link>
   ```
   Move the `→` glyph from inside the label (user spec shows `DIVE INTO THE LIBRARY →`) into the existing `aria-hidden` span so screen readers don't read it.
3. Secondary link label → "Join the pack on YouTube". Replace `Watch on @ScoutPawTV` and update the link arrow glyph as-is (`↗` kept).

### 3.4 `components/nav/footer.tsx`

1. Replace `exploreLinks` derivation:
   ```ts
   const exploreLinks = (config.footerExplore ?? config.navItems).map((item) => ({
     label: item.label,
     href: item.href,
   }));
   ```
   Fallback to `navItems` guards against the schema being deployed before the JSON is updated (edge case during partial deploys).
2. No other footer logic changes. `realSocial` filter unchanged — it already drops `TODO` URLs and now naturally drops `x` (no longer in JSON).

## Success Criteria

- [ ] `pnpm typecheck` clean across all 4 files
- [ ] Pack Leader section renders Max's image (from existing `husky-bg.png`) + updated bio + new subtitle
- [ ] Menu Cards section H2 reads "Step into the pack's world"; 3 cards labeled CHARACTERS/SHOP/WATCH
- [ ] Watch Together H2 reads "Peace. Play. Playback." + new CTAs
- [ ] Footer Explore renders 6 links in order: Home, Characters, Shop, Watch, Top Picks, Activities

## Risk Assessment

- **Risk:** Smart-quote vs straight-quote drift in JSX literals (`'` U+2019 vs `'` U+0027). *Mitigation:* JSX renders curly-brace `{}` strings verbatim — preserve user's U+2019 chars. ESLint may warn `react/no-unescaped-entities` for raw `'` in JSX text — wrap in `{"..."}` if needed.
- **Risk:** Pack Leader image `husky-bg.png` may not visually fit the "golden snack" brand voice. *Mitigation:* Out of scope — image swap is a separate design decision; flag during visual QA.
- **Risk:** Removing X social entry without grep first could leave dead refs. *Mitigation:* `footer.tsx` and `top-nav.tsx` iterate `social[]` — no hardcoded x platform string elsewhere in components (verified during scout).
