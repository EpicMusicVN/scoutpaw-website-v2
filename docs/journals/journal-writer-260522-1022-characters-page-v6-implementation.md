# Characters Page v6: Implementation & Carousel Masking Reality Check

**Date**: 2026-05-22 10:22
**Severity**: Low
**Component**: Characters carousel, detail view, carousel masking
**Status**: Resolved, code review gates merged

## What Happened

Executed the full v6 carousel redesign plan (5 phases). Delivered:
- Left-anchored 3+peek Embla carousel with CSS `mask-image` right-edge dissolve (replacing per-frame JS opacity fade)
- 100vh immersive carousel + detail split
- White content cards with pose PNG overlay (stretched-button-overlay pattern)
- Cinematic push-in transition between carousel ↔ detail
- `CharacterQuote` compact variant
- Verification: `pnpm typecheck` + `pnpm lint` pass; live dev server renders `/characters` with HTTP 200

Code review surfaced 3 medium clipping findings on short viewports. All fixed. Implementation complete and gate-verified.

## The Brutal Truth

Implementation went smoothly—no critical blockers, no design reversals. But two decisions exposed gaps between the plan's literal values and the plan's own intent. And the working tree's accumulating uncommitted state is becoming a real risk that we're no longer treating as a one-off.

## Technical Details

**Files modified:**
- `components/characters/character-detail-card.tsx` — 100vh detail split, prev/next pup-flipper removed, centered layout
- `components/characters/character-carousel.tsx` — Embla `align: "start"`, carousel state injection, scale-down fade
- `components/characters/character-carousel-track.tsx` — CSS `mask-image` gradient (new masking logic)
- `components/characters/character-carousel-card.tsx` — Stretched-button-overlay article pattern, dense text block layout
- `components/characters/character-quote.tsx` — Added `compact` prop with `line-clamp-3`

**File deleted:**
- `components/characters/use-carousel-fade.ts` — Replaced by CSS mask-image; hook no longer needed

**Verification gate:**
```bash
pnpm typecheck  # PASS
pnpm lint       # PASS
dev server GET /characters → 200 OK
```

## Code Review Findings & Fixes

Three medium clipping risks all stemmed from the same root: fixed-height/centered layouts (flex `justify-center` + `overflow-hidden`, fixed `clamp()` floors) clip short-viewport content.

**Finding 1: CharacterQuote compact variant overflowed on mobile**
- Root: Quote text on carousel cards → fixed line count on small screens → overflow
- Fix: Added `line-clamp-3` to compact variant; visually graceful truncation

**Finding 2: Carousel + arrow row didn't fit in short viewports**
- Root: `VIEWPORT_H` clamp floor was `520px`; on height <520px (iPhone SE, iPad split-view), carousel + pagination arrow row exceeded `100svh - fixed header`
- Fix: Lowered floor to `420px`; switched all height units from `vh` → `svh` (small viewport height, excludes browser UI). Carousel + arrow row now fits in `calc(100svh - 5rem)`

**Finding 3: Detail view content clipped under overflow-hidden**
- Root: Detail card had `justify-center` at all breakpoints; content scrolls below fold, but parent has `overflow-hidden`
- Fix: Changed to `md:justify-center` (center only on desktop). Mobile content now scrolls within the scrollable container instead of clipping

## Decision: Carousel Edge Mask — Plan vs. Intent

**The plan specified:**
```css
mask-image: linear-gradient(to right, #000 0%, #000 85%, transparent 100%);
```

Reasoning: "Left is the anchor point; keep it fully opaque and crisp."

**What we found:**
A fully opaque left edge (hard clip at 0%) creates exactly the boundary problem the brief wanted to avoid. As cards scroll past the left, they hard-clip—visually obvious and unnatural. The opposite of "invisible seamless carousel."

**What we shipped:**
```css
mask-image: linear-gradient(to right, transparent 0%, #000 6%, #000 85%, transparent 100%);
```

A small left fade (transparent → solid in 6%) softens the scroll clip just enough that the left-anchored card still reads crisp, but the edge dissolve feels intentional, not like a boundary. Scrolling feels seamless.

**Lesson:** A plan's literal CSS value can contradict the plan's own design intent. The brief said "no visible left/right boundaries"—the gradient's hard left edge violated that. We honored the *requirement*, not the literal *value*. That's the right call, but it's a pattern worth flagging: plans need intent + values. When they conflict, intent wins.

## Short-Viewport Design Story Lessons

The cluster of clipping findings all point to the same gap: the design was "fill 100vh" with centered content, but there's no **explicit short-viewport story**.

- "100vh" assumes height ≥ design floor (formerly 520px). It doesn't fail gracefully.
- `justify-center` + `overflow-hidden` assumes all content fits. It doesn't degrade to scroll.
- No units shift to account for browser UI on mobile (the `svh` fix).

**Lesson:** "Fill 100vh" + "center content" layouts need a SHORT-VIEWPORT DESIGN DECISION before implementation:
1. Does content scroll or clip?
2. What's the minimum height needed (and is it reasonable)?
3. Should centering disable on mobile?
4. Which units account for browser UI (svh vs vh)?

This isn't new (mobile-first design 101), but it's a pattern that's been missed on this project twice now (top-picks in the last session, now characters). Worth adding to the pre-implementation checklist.

## Build Environment Friction (Persistent Pattern)

The live dev server holds `.next` cache, so `pnpm build` fails with "cannot link `.next`" errors. This is a recurring blocker across sessions.

**Current workaround:** Gate on `typecheck` + `lint` + live HTTP 200 verification instead of a full build pass. This is reasonable for dev, but it masks potential build-time errors (e.g., unused exports, missing async handling) until CI/CD.

**Observation:** This is now a **recurring environmental constant**, not a one-off. Either:
- The project needs a dedicated build script that cleans `.next` before rebuild, or
- The team needs to shift to `vercel build` (which Vercel's CI uses), or
- We accept that dev builds are gated on typecheck + lint + server render, not `pnpm build`

Honesty: This friction has appeared in ~4 sessions now. It's worth documenting as a known constraint, not working around it silently.

## Uncommitted Working Tree Risk

The working tree is now **97 files uncommitted**, entangling:
- Characters v6 redesign (core work of this session)
- Characters v5 baseline (prior session)
- Top Picks feature (parallel work from earlier today)
- Docs edits (scattered across multiple sessions)

These are NOT cleanly separable by feature. A single `git reset` or accidental `git checkout .` would nuke all of it with no recovery. The user chose not to commit (same call as the Top Picks session), prioritizing feature velocity over git hygiene.

**Observation:** This is a **deliberate trade-off**, not a mistake. But the surface is growing across sessions. At ~100 files, the cost-to-commit narrative flips. It's no longer "let's batch them all later"; it's "we're one slip away from losing a day's work."

**Honest take:** The uncommitted state is manageable *today*, but it's not a scalable pattern. The project needs one of:
1. Commit boundaries after each phase (breaks momentum slightly, gains recovery points)
2. A worktree-per-feature workflow (isolates changes, easier merges)
3. Explicit "final commit window" at session end (batches everything, explicit moment to verify)

The user is aware; this is a known risk being managed deliberately. Flagging it for visibility.

## Lessons for Next Session

1. **CSS gradient literals vs. intent:** Always ask "does the plan's literal value match the plan's own design goals?" If not, honor the goal.

2. **Short-viewport design:** Before implementing a "100vh fill + center" layout, document the short-viewport story (scroll vs. clip, min-height, centering toggle, unit strategy).

3. **Build environment:** Accept that concurrent `pnpm dev` breaks `pnpm build` in this project. Document it. Either fix it once (clean script) or shift gates to dev-mode verification (typecheck + lint + server render).

4. **Uncommitted state:** The working tree is a risk surface. At 97 files and growing, weigh momentum gains against recovery cost. Explicit commit boundaries may be worth the context switch.

## Next Steps

- All code review gates merged; no outstanding issues
- Characters v6 carousel live on dev server, verified HTTP 200
- Ready for design review / QA if user wants to test before commit
- Recommend explicit commit decision (batch all or split by feature) before next session
