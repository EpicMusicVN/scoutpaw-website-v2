# Hero Left + Pinterest Pin Cards Iteration

**Date**: 2026-05-13 05:45  
**Severity**: Medium  
**Component**: Home page (hero position, Step Into the Pack cards)  
**Status**: Resolved

## What Happened

Two rapid refinements on top of the previous hero + floating cards session. Phase 1: Hero glass card swapped from upper-right to upper-left (3-character diff: `md:right-12 lg:right-16` → `md:left-12 lg:left-16` in `full-bleed-hero.tsx`). Phase 2: MenuCard restructure iteration—pack cards shifted from "large image card + narrower text below" layout to true Pinterest pin pattern with small centered floating image (h-32/36/40 w-32/36/40) + full-width text card pulled up underneath using negative margins and positive padding to create visual overlap. Files modified: `components/home/full-bleed-hero.tsx`, `components/home/menu-cards.tsx`. Validation: pnpm typecheck + pnpm lint passed clean.

## The Brutal Truth

User iteration is fast enough to make multi-pass refinements in a single session. That's good—it means the design is converging. The pain point: we're optimizing for mockup feel without surfacing implementation constraints until code lands. Hero on the left means the corgi now sits 28% from the left edge instead of hiding in the right-bleed zone. Glass card still occludes him, but we "own the trade-off per brainstorm." That's weasel language. What happened was the user didn't realize the hero position choice gates the banner composition until we shipped the code. Same with the image card padding (p-3 into a 128px container)—tiniest icons get cramped, but "visual QA decides" kicks the decision downstream. Do the math upfront and show alternatives before committing to a phase.

## Technical Details

**Hero position swap (Phase 1):**
- Line 42 of full-bleed-hero.tsx: `md:absolute md:left-12 md:top-12 md:mx-0 md:mt-0 md:max-w-md ... lg:left-16 lg:top-16 lg:max-w-lg`
- No `right-*` classes remain; `left-*` now positions from the left edge
- Mobile flow unchanged: `relative mx-4 -mt-8 max-w-md` (centers via auto margins, not absolute positioning)

**MenuCard Pinterest pin (Phase 2):**
- Image card (lines 96–113): `relative z-10 mx-auto h-32 w-32 ... md:h-36 md:w-36 lg:h-40 lg:w-40`
  - `relative` is REQUIRED for `z-10` to take effect (without it, z-index is ignored)
  - `mx-auto` centers within the full-width column
  - `p-3` padding inside 128px container leaves ~104px for the icon (tight)
  - Glow positioned `inset-x-1/4 top-1/4 h-1/2 blur-2xl opacity-40` (radial gradient behind icon)
- Text card (line 117): `relative -mt-16 ... pt-24 ... md:-mt-[72px] md:pt-28 lg:-mt-20 lg:pt-32`
  - Negative margin pulls text card top up to overlap bottom half of image
  - Positive padding reserves space for the overlap; text content starts below image bottom
  - Mobile: image y=0→128, text -mt-16 pulls text top to y=64, pt-24 (96px) puts copy at y=160. Image bottom at 128 = 32px gap below image ✓
- Coming-soon badge: `absolute right-3 top-3 z-20` anchored to outer Link wrapper, not card piece (survives layout changes)

**Validation:**
- pnpm typecheck: clean
- pnpm lint: clean

## Root Cause Analysis

Phase 1 (hero left) was inevitable: user wanted the hero on the opposite side. 3-token change, no risk. Phase 2 (pin restructure) happened because the single "large image + text below" layout struggled with aspect-ratio math across varying text lengths. Floating a small centered image with negative-margin text card overlap is genuinely cleaner—each surface owns its own shadow/bg, grid heights stay matched, hover cascades from the Link wrapper to both cards. The lesson isn't "we made the wrong choice before." It's "we should have shown mockups with Pinterest pins FROM THE BRAINSTORM, not after code landed."

## Lessons Learned

1. **User iteration cycles 3+ times per night on hero position and card layout.** Don't fight this with over-engineered Framer Motion transitions or complex absolute-positioning chains. Use simple Tailwind classes (position, z-index, margins) that flip with a single token swap. Keep the structure flat and the CSS dumb; the user will change it, and dumb code is easy to refactor.

2. **Z-index only applies to `position: relative` elements.** Image card had `relative z-10`; without the `relative`, the `z-10` is ignored and the text card renders visually on top even with lower z-value. Catches the eye in code review, not in rendered output. Always pair z-index with position in the same element.

3. **Pinterest pin pattern (floating centered image + negative-margin text card) is cleaner than large-image-with-narrower-text.** No absolute positioning needed—image card in normal flow with `mx-auto` centers it; text card's negative top margin + positive padding creates the overlap; `relative z-10/z-auto` controls paint order. Each card owns its shadow/bg. Grid stays simple (auto-rows-fr). Simpler CSS, easier to iterate.

4. **Coming-soon badge anchors to the outer wrapper, not the image card.** Decorative badges should sit on the highest-level container (the Link). Survives internal layout restructures; moving the badge between cards shouldn't be necessary. This one was right from the start; noting it because it's a good pattern.

5. **Show multiple mockup options (desktop positions, card layouts, image sizes) BEFORE merging code.** User didn't realize hero-left occludes the corgi until the code rendered; didn't know image-card padding (p-3) was tight until visual QA. Do the math (pixel widths, overlap heights, icon sizes) and show alternatives with trade-offs labeled. "Glass blur softens the occlusion—acceptable?" vs. "we'll figure it out during visual QA" is a vastly different conversation.

6. **Don't skip code-reviewer subagent for "trivial" changes.** Phase 1 was a 3-token swap; Phase 2 was a full MenuCard rewrite. Both felt like "obvious" changes, so code review got deferred. Subagent caught the `relative` requirement in the phase 2 plan; I missed it in a skim. Always run the review, even for "tiny" refactors. The surface-level diff is small; the risk lives in details (z-index, margin math, vendor prefixes).

## Next Steps

- Visual QA deferred (responsive renders at 360/768/1024/1440)
- 5 uncommitted plans in current session (asset-refresh, navbar-footer, newsletter-button, hero-glass (session 1), hero-left-pins (session 2))
- Icon padding `p-3` in 128px container is tight; if icons visually cramped, try `p-2` (more room) or `p-4` (less room, smaller icon). Visual QA call.
- Text card background `bg-surface` may feel cold next to warm image-card colors. A/B with `bg-honey/10` if user feedback suggests it.

**Status**: DONE
