---
phase: 2
title: Page Layout and Mobile Treatment
status: completed
priority: P2
effort: 45m
dependencies:
  - 1
---

# Phase 2: Page Layout and Mobile Treatment

## Overview

Adjust `app/characters/page.tsx` to render the new cards with appropriate gap between them (where Plan C's dividers will later sit). Confirm mobile renders gracefully — no forced viewport-height, comfortable padding, art still feels prominent.

## Requirements

**Functional:**
- Card-to-card vertical gap: `my-12 md:my-20` (~48–80px breathing room)
- Outer page background remains cyan (`--bg-base`)
- Mobile: cards stack naturally, no `min-h` forcing tall empty space, character name h2 still prominent
- First character keeps `priority` (LCP)
- Zig-zag flip preserved

**Non-functional:**
- No regression on `/` or other pages (only `app/characters/page.tsx` changes)

## Architecture

The page renders character cards in sequence. Plan B does NOT add dividers — that's Plan C. Plan B just ensures the gap exists and mobile is comfortable.

Current map (post-Plan-A):
```jsx
{ordered.map((character, i) => (
  <ScrollReveal key={character.slug}>
    <CharacterSection ... />
  </ScrollReveal>
))}
```

The card component now provides its own outer `<section>` with internal padding. The page just renders them in sequence; gap comes from the section's `py-*` (or wrap the map in a `space-y-*` container).

## Related Code Files

- **Modify:** `app/characters/page.tsx` — add vertical gap wrapper
- **Modify (mobile pass):** `components/characters/character-section.tsx` — confirm mobile breakpoints from Phase 1 hold up; tune if needed

## Implementation Steps

1. **Open** `app/characters/page.tsx`.
2. **Wrap the character map in a `space-y-*` container** so cards have consistent gap:

   ```diff
   - {ordered.map((character, i) => (
   -   <ScrollReveal key={character.slug}>
   -     <CharacterSection ... />
   -   </ScrollReveal>
   - ))}
   + <div className="space-y-12 py-12 md:space-y-20 md:py-20">
   +   {ordered.map((character, i) => (
   +     <ScrollReveal key={character.slug}>
   +       <CharacterSection ... />
   +     </ScrollReveal>
   +   ))}
   + </div>
   ```

3. **Open** `components/characters/character-section.tsx` (rebuilt in Phase 1).
4. **Mobile audit** — confirm:
   - `min-h-[80vh]` only applies on `md+` (already specced in Phase 1)
   - Content padding `p-6 sm:p-8 md:p-12 lg:p-16` ramps cleanly
   - Art overflow `-translate-y-[8%]` only applies on `md+` — on mobile, drop it to keep pose inside card
   - Adjust if any visual issues found

   Likely mobile-safe diff:
   ```diff
   - <div className="relative mx-auto aspect-[3/4] w-full max-w-[380px] md:max-w-[460px] md:-translate-y-[8%]">
   + <div className="relative mx-auto aspect-[3/4] w-full max-w-[380px] md:max-w-[460px] md:-translate-y-[8%]">
   ```
   (Already responsive — the `md:` prefix gates the overflow correctly.)

5. **Visual check** at mobile (375px), tablet (768px), desktop (1280px), wide (1536px).
6. **Typecheck + lint.**

## Success Criteria

- [ ] Character cards have `my-12 md:my-20` vertical gap on the cyan page bg
- [ ] Mobile (375px): cards stack, no forced viewport-height, art prominent, content readable
- [ ] Tablet (768px): cards begin to feel cinematic but not yet 80vh
- [ ] Desktop (1024px+): cards hit `min-h-[80vh]`, art overflows top, premium feel
- [ ] First card priority-loaded for LCP
- [ ] Zig-zag flip alternates correctly across 5 characters
- [ ] Typecheck + lint clean
- [ ] No regression on other pages

## Risk Assessment

- **Risk:** Combined card height + `my-20` gap makes the page very long. *Mitigation:* this is accepted per cinematic intent; user confirmed in brainstorm. If feedback says shorter, drop to `min-h-[70vh]` and `my-16`.
- **Risk:** Mobile art looks small inside large mobile card. *Mitigation:* `max-w-[380px]` on art is reasonable for mobile; the card itself sizes to content (no `min-h` mobile) so it fits.
- **Risk:** Long page hurts LCP. *Mitigation:* only first card uses `priority`; subsequent images use Next.js lazy.

## Security Considerations

None.
