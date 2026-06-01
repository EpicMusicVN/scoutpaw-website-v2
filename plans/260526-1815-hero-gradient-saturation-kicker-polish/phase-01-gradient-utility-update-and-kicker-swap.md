---
phase: 1
title: Gradient Utility Update and Kicker Swap
status: completed
priority: P1
effort: 20m
dependencies: []
---

# Phase 1: Gradient Utility Update and Kicker Swap

## Overview

Update `.heading-gradient-tri` color stops in `app/globals.css` for stronger saturation; swap watch-hero kicker color from `text-brand-gold` to `text-ink-blue`.

## Requirements

**Functional:**
- `.heading-gradient-tri` uses 5-stop gradient: deeper navy start `#0f2540`, current navy at 22%, brand-primary yellow `#ffd70c` at 50%, warm white `#fff5cc` at 78%, white at 100%
- Mobile media query (`<640px`) keeps a 2-stop fallback with `#0f2540 → #ffd70c` for stripe-safe rendering
- Watch hero kicker text reads as deep navy (`text-ink-blue`)
- No new utility classes; the existing one is updated in place
- All 5 hero h1 sites (cinematic-hero, full-bleed-hero, watch-hero, coming-soon-hero, character-detail-hero) automatically inherit the new gradient since they use `heading-gradient-tri`

**Non-functional:**
- No AA regressions (gradient text doesn't have a single contrast value; readability comes from text-shadow + size + content)
- Watch kicker AA: deep navy `#1a3a5c` on cream/cyan bg = ~6:1 ✓

## Architecture

Single-CSS change to existing utility, plus single-class swap on one component. No new files.

## Related Code Files

- **Modify:** `app/globals.css` — `.heading-gradient-tri` declaration + mobile media query
- **Modify:** `components/watch/watch-hero.tsx` — line ~111 kicker className

## Implementation Steps

1. **Open** `app/globals.css`. Locate `.heading-gradient-tri` declaration (~line 198, post-Plan A).
2. **Replace** the gradient definition:
   ```diff
     .heading-gradient-tri {
       background-image: linear-gradient(
         90deg,
   -     var(--bg-navy) 0%,
   -     var(--brand-primary) 50%,
   -     #ffffff 100%
   +     #0f2540 0%,
   +     var(--bg-navy) 22%,
   +     var(--brand-primary) 50%,
   +     #fff5cc 78%,
   +     #ffffff 100%
       );
       background-clip: text;
       -webkit-background-clip: text;
       color: transparent;
     }
   ```
3. **Update mobile fallback** in the `@media (max-width: 639px)` block:
   ```diff
     @media (max-width: 639px) {
       .heading-gradient-tri {
         background-image: linear-gradient(
           90deg,
   -       var(--bg-navy) 0%,
   +       #0f2540 0%,
           var(--brand-primary) 100%
         );
       }
     }
   ```
4. **Open** `components/watch/watch-hero.tsx`. Locate kicker at line ~111:
   ```diff
   - <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
   + <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-ink-blue md:text-sm">
       ScoutPaw TV
     </p>
   ```
5. **Save.**
6. **Typecheck + lint** — must pass.
7. **Smoke test** — render any hero (e.g. `/watch`) to visually confirm:
   - h1 gradient reads more vibrant (deeper navy start, stronger yellow mid)
   - Watch kicker reads as deep navy, not warm gold
   - Other hero h1s (home, characters, shop, top-picks) also visibly stronger

## Success Criteria

- [ ] `.heading-gradient-tri` uses new 5-stop gradient
- [ ] Mobile fallback uses deeper navy
- [ ] Watch hero kicker uses `text-ink-blue`
- [ ] All 5 hero h1s render with stronger gradient (auto-inherited)
- [ ] Typecheck + lint clean
- [ ] No visible AA regression

## Risk Assessment

- **Risk:** Deep navy `#0f2540` reads too inky on busy hero backgrounds. *Mitigation:* dial back to `#1a3a5c` (Plan D ink-blue) if too dark live.
- **Risk:** 5-stop gradient on small headings looks busy. *Mitigation:* the mobile fallback flattens to 2-stop; tablet/desktop renders the full 5-stop sweep where there's room.

## Security Considerations

None.
