---
phase: 1
title: Gradient and Shadow Utilities and Hero Container Conversion
status: completed
priority: P1
effort: 1.5h
dependencies: []
---

# Phase 1: Gradient and Shadow Utilities and Hero Container Conversion

## Overview

Add two new utilities to `app/globals.css` (`.heading-gradient-gold` + `.text-shadow-bold`). Convert 4 hero text containers to navy bg + swap h1/kicker colors. CharacterDetailHero gets a smaller targeted update (h1 color only — keeps themed bg).

## Requirements

**Functional:**
- `.heading-gradient-gold` renders yellow-only gradient (no navy)
- `.text-shadow-bold` adds dark grounding + golden glow
- CinematicHero text panel = navy bg, gold gradient h1, yellow kicker, white/85 body
- FullBleedHero mobile glass + desktop glass blob = navy bg, gold h1, yellow kicker, white/85 body
- WatchHero gets a wrapped navy text container; gold h1, yellow kicker (SCOUTPAW TV), white/85 body
- ComingSoonHero gets wrapped navy text container; gold h1, yellow kicker, white/85 body
- CharacterDetailHero h1 swaps gradient-tri → gradient-gold; kicker stays themed (uses character accentColor)

**Non-functional:**
- AA contrast verified: gold gradient + text-shadow-bold on navy = strong; yellow `#ffd70c` on navy = ~7:1; white/85 on navy = ~5.5:1
- No regression to other components (atmosphere, motif, etc.)

## Architecture

Two CSS utilities in `@layer utilities`:

```css
.heading-gradient-gold {
  background-image: linear-gradient(
    90deg,
    #b8862e 0%,
    #d4a833 22%,
    var(--brand-primary) 50%,
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

.text-shadow-bold {
  text-shadow:
    0 2px 0 rgb(15 37 64 / 0.4),
    0 4px 12px rgb(15 37 64 / 0.25),
    0 0 24px rgb(255 215 12 / 0.35);
}
```

Hero containers: existing `bg-surface` or `bg-white/55` swaps to `bg-navy` or `bg-navy/85`. Heading classes update accordingly.

## Related Code Files

- **Modify:** `app/globals.css`
- **Modify:** `components/home/cinematic-hero.tsx`
- **Modify:** `components/home/full-bleed-hero.tsx`
- **Modify:** `components/watch/watch-hero.tsx`
- **Modify:** `components/coming-soon/coming-soon-hero.tsx`
- **Modify:** `components/characters/character-detail-hero.tsx`

## Implementation Steps

1. **Open** `app/globals.css`. Locate the `.heading-gradient-tri` block (~line 198).
2. **Add** new `.heading-gradient-gold` block AFTER `.heading-gradient-tri`. Add `.text-shadow-bold` after `.text-shadow-warm-glow`.

3. **CinematicHero** (`components/home/cinematic-hero.tsx`):
   - Text panel container className: `bg-surface` → `bg-navy`; border `border-ink/10` → `border-navy/30`
   - Kicker `<p>` className: `text-ink-blue/70` → `text-brand-primary`
   - h1 className: `heading-gradient-tri text-shadow-soft` → `heading-gradient-gold text-shadow-bold`
   - Description `<p>` className: `text-ink-blue/85` → `text-white/85`

4. **FullBleedHero** (`components/home/full-bleed-hero.tsx`):
   - Mobile card: `bg-white/90` → `bg-navy/90`; border `border-ink/10` → `border-navy/30`
   - Desktop glass blob: `bg-white/55 backdrop-blur-xl` → `bg-navy/85 backdrop-blur-xl`
   - Kicker `text-ink-blue/70` → `text-brand-primary`
   - h1 `heading-gradient-tri text-shadow-soft` → `heading-gradient-gold text-shadow-bold`
   - Description body `text-ink-blue` → `text-white/85`

5. **WatchHero** (`components/watch/watch-hero.tsx`):
   - Wrap the centered text block (`<div className="mx-auto max-w-2xl text-center">`) in a navy container:
     ```diff
     - <div className="mx-auto max-w-2xl text-center">
     -   <p className="font-display ... text-ink-blue md:text-sm">ScoutPaw TV</p>
     -   <h1 className="heading-gradient-tri text-shadow-soft ...">Tune in to the Pack.</h1>
     -   <p className="... text-ink-blue/85 ...">...</p>
     -   <div className="mt-6 flex flex-wrap justify-center gap-3">...</div>
     - </div>
     + <div className="mx-auto max-w-2xl">
     +   <div className="rounded-[2rem] bg-navy px-8 py-10 text-center shadow-cozy-md md:px-12 md:py-12">
     +     <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-primary md:text-sm">
     +       ScoutPaw TV
     +     </p>
     +     <h1 className="heading-gradient-gold text-shadow-bold mt-3 font-display text-4xl font-bold leading-[1.02] md:text-5xl lg:text-6xl">
     +       Tune in to the Pack.
     +     </h1>
     +     <p className="mx-auto mt-4 max-w-md text-base text-white/85 md:text-lg">
     +       Keep your furry friend happy with calming visuals and scientifically proven sounds. Just tap a journey to start their YouTube session!
     +     </p>
     +     <div className="mt-6 flex flex-wrap justify-center gap-3">
     +       <Button href="#channels" size="lg" variant="primary">Join ScoutPaw World!</Button>
     +       <Button href={youtubeChannelUrl} size="lg" variant="outline" target="_blank" rel="noopener noreferrer">Watch on YouTube</Button>
     +     </div>
     +   </div>
     + </div>
     ```
   - Note: changed "Join ScoutPaw World!" button variant `dark` → `primary` (yellow CTA on navy reads as the brand action button)
   - Keep flanking poses + their `pb-20 xl:pb-32 2xl:pb-40` from Plan I

6. **ComingSoonHero** (`components/coming-soon/coming-soon-hero.tsx`):
   - Wrap the existing text block (kicker, h1, tagline) in a navy container with rounded radius. Keep the character image above (outside the navy container).
   - Kicker stays themed (`style={{ color: character.accentColor }}`) — exception kept since it ties to per-character identity
   - h1: `heading-gradient-tri text-shadow-soft` → `heading-gradient-gold text-shadow-bold`
   - Tagline body: `text-ink-blue/75` → `text-white/85`

7. **CharacterDetailHero** (`components/characters/character-detail-hero.tsx`):
   - h1: `heading-gradient-tri text-shadow-soft` → `heading-gradient-gold text-shadow-bold`
   - Kicker keeps `style={{ color: ... }}` themed
   - Body text (`text-ink-blue/70`, `text-ink-blue/65`) unchanged — runs on themed surfaceTint bg, AA verified by Plan D

8. **Typecheck + lint** — must pass.

## Success Criteria

- [ ] `.heading-gradient-gold` + `.text-shadow-bold` added to `globals.css`
- [ ] CinematicHero text panel navy, h1 gold, kicker yellow
- [ ] FullBleedHero mobile + desktop glass navy, h1 gold, kicker yellow
- [ ] WatchHero text wrapped in navy container, h1 gold, kicker yellow
- [ ] ComingSoonHero text wrapped in navy container, h1 gold
- [ ] CharacterDetailHero h1 uses gradient-gold (themed bg unchanged)
- [ ] All hero kickers (where converted) read yellow on navy at AA ~7:1
- [ ] All hero body copy inside navy containers reads white/85 at AA ~5.5:1
- [ ] Typecheck + lint clean

## Risk Assessment

- **Risk:** Navy hero containers feel too dark/cold vs current warm cream identity. *Mitigation:* dial alpha down to `bg-navy/90` if too strong, or add subtle warm glow via box-shadow.
- **Risk:** FullBleedHero glass blob over banner image — navy/85 may muddy the banner colors showing through. *Mitigation:* test live; tighten to navy/95 or solid navy with reduced backdrop-blur if needed.
- **Risk:** WatchHero text container wrap changes visual flow (poses still flank — verify they still position correctly relative to the new wrap).
- **Risk:** ComingSoonHero kicker stays themed (accentColor) — kicker color may now contrast poorly against navy bg if accentColor is also navy-ish. *Mitigation:* if any character's accentColor lands on navy spectrum, fall back to `text-brand-primary` for those.

## Security Considerations

None.
