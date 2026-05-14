# Hero Glass Card + Floating Pack Cards Restructure

**Date**: 2026-05-13 02:15  
**Severity**: Medium  
**Component**: Home page (hero, Step Into the Pack section)  
**Status**: Resolved

## What Happened

Home page hero and Step Into the Pack cards were restructured to improve visual hierarchy and mobile responsiveness. Hero converted from full-bleed text overlay to a pinned glass card (top-right on desktop, stacked below banner on mobile). Step Into the Pack split from a single full-width card into two stacked elements: an aspect-square image card with a smaller, overlapped text card using -mt-10 mx-4 positioning. Files modified: `full-bleed-hero.tsx`, `app/page.tsx`, `menu-cards.tsx`. Validation: pnpm typecheck + pnpm lint passed clean. Code review completed.

## The Brutal Truth

Glass cards look slick in mockups but fail silent when the banner photo is busy. Pinning text to the upper-right works only if that zone exists—if the hero shot has subjects everywhere, the glass card will occlude them. We shipped this without surfacing that tension to the user upfront during brainstorm. The truth: glass blur softening is the only real mitigation; there's no clean answer if the banner has no breathing room. Own that trade-off explicitly next time.

## Technical Details

**Hero card restructure:**
- Old: Full-bleed text overlay, z-30 positioned over banner
- New: Glass card (w-96 max-w-full md:absolute md:top-6 md:right-6 md:z-20) pinned top-right on desktop
- Mobile: Card stacks below banner (no absolute positioning), wraps to max-w-full mx-auto
- Background: bg-honey/85 + backdrop-blur-xl (NOT pure bg-white/15—legibility failed on paragraph-length copy; warm tint + high opacity reads cleanly while still softening the banner behind)
- Shadow: shadow-lg (consistent with card design system)

**Step Into the Pack two-card split:**
- Old: Single card with full-width content
- New: Two stacked Link-wrapped components:
  1. Image card: aspect-square, rounded-2xl, shadow-md, group-hover:shadow-lg
  2. Text card: bg-surface, -mt-10 mx-4, rounded-xl, p-4 (overlaps image via negative margin)
- Group-hover cascades shadow/scale on the Link wrapper to both cards—no competing hover styles
- Removed: rotate-2/-rotate-2 stickers (visual noise when paired with two-card depth; pick one technique per component, not stacked)

**Validation:**
- pnpm typecheck: clean
- pnpm lint: clean (apostrophes/em-dashes in prop strings pass lint; only JSX text children flag react/no-unescaped-entities)
- Code review: DONE

## Root Cause Analysis

Original hero and card layouts were adequate but didn't leverage the glass + depth design language emerging elsewhere on the home page. The move to glass + floating cards makes visual sense—each surface owns its own bg/shadow/hover layer. The two-card split especially improves grid stability; a single card with overflow image creates aspect-ratio hell on varying text lengths. The real lesson: glass opacity *must* scale with content length. Short callouts can hide behind pure frosted glass; paragraphs need readable background color.

## Lessons Learned

1. **Banner composition gates glass card placement**: If the hero photo has no empty zone (sky, negative space), an upper-right glass card WILL overlap subjects. Surface this during brainstorm. Let the user trade off (glass blur softening as mitigation). Don't pretend there's a clean answer without looking at the actual asset first.

2. **Glass cards need real bg opacity for body text**: bg-white/15 + backdrop-blur fails on paragraphs. bg-honey/85 + backdrop-blur-xl gives warm tint, readable copy, AND still softens the banner. Pick opacity as a function of content length.

3. **Two-card stack beats single card with overflow image**: Each card owns its bg/shadow/hover. Group-hover on the Link wrapper cascades correctly to both. Aspect-square on the image card locks grid heights even with variable text lengths. Simpler CSS, more predictable layout.

4. **Drop the rotation hack when restructuring**: rotate-2/-rotate-2 stickers compete with the two-card stack depth effect. Visual techniques pile up; pick one per component. Depth (shadow/margin) already communicates "floating," rotation adds noise.

5. **react/no-unescaped-entities only fires on JSX text children**: Apostrophes and em-dashes inside prop string values pass lint cleanly. Useful to know for content-heavy components; no need to HTML-entity-encode inside attributes.

## Next Steps

- Visual QA at 360/768/1024/1440 deferred to user
- 4 plans uncommitted across recent sessions (asset-refresh, navbar-footer, newsletter-button, this one pending review)
- md=768px tunable: max-w-md may feel cramped (consider max-w-sm), xl headline scale may need bump, text card bg-surface may feel cold (A/B with bg-honey/20 if needed)

**Status**: DONE
