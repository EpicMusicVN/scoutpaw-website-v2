---
phase: 5
title: Typecheck + Lint
status: completed
priority: P2
effort: 10m
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Typecheck + Lint

## Overview

Final validation. Run `pnpm typecheck` + `pnpm lint`. Smoke-check `/characters/max` page (data side effect) and `/coming-soon/top-picks` route (new stub). Spot-check footer for 6 explore links + 4 social icons.

## Requirements

- **Functional:** Zero TS errors, zero ESLint warnings. New `/coming-soon/top-picks` route resolves. `/characters/max` still renders w/o layout break. Footer Explore exactly 6 links in spec order.
- **Non-functional:** Build doesn't regress in size/perf (no new deps).

## Architecture

Validation-only phase. No code changes unless errors surface.

## Related Code Files

**Modify (only on regression):**
- Whichever phase 1-4 file produced an error.

## Implementation Steps

1. Run `pnpm typecheck` → expect silent success. If errors:
   - Most likely culprit: zod schema field type mismatch w/ JSON shape, or stale `Character`/`SiteConfig` import.
   - Fix at the source phase, do not retro-patch in phase 5.

2. Run `pnpm lint` → expect `✔ No ESLint warnings or errors`. Common stumble:
   - `react/no-unescaped-entities` on raw `'` or `"` in JSX text → wrap in `{"..."}`.

3. Grep for orphan `ScrollSun` / `Buddy` (Pack Leader switch sanity):
   ```
   Grep "buddy" components/home/featured-pup-spotlight.tsx
   ```
   Expect zero matches in that file post-Phase 3.

4. Grep for X social orphans:
   ```
   Grep "\"x\"" components/nav/
   ```
   Expect zero matches in source files.

5. Manual smoke-check (boot dev server if available):
   - `pnpm dev` → open `http://localhost:3000/`
   - Hero copy + image render
   - Step Into Pack section H2 reads "Step into the pack's world"
   - 3 menu cards labeled CHARACTERS / SHOP / WATCH
   - Pack Leader section shows Max, kicker "MEET THE PACK LEADER", subtitle "THE SOULFUL, GOLDEN HEART OF SCOUTPAW", new bio, new quote
   - Shop banner reads "UNBOX THE MAGIC" + sub-description quote line
   - Watch section reads "Peace. Play. Playback." + new CTA labels
   - Newsletter heading "Become a VIP (Very Important Pup)" + "Already 20,000+..." line
   - Footer description new line; 6 Explore links in order; 4 social icons (yt, ig, fb, tt)
   - Open `/characters/max` → verify bio matches new copy + layout intact
   - Open `/coming-soon/top-picks` → verify stub page renders (uses Rocky's image per characterSlug)

6. Manual responsive QA at md (768px) and lg (1024px):
   - Hero glass card doesn't overflow with new longer title
   - Menu Cards 3-col grid wraps cleanly with new copy lengths (Shop card has the longest text)
   - Footer Explore list doesn't wrap awkwardly at narrow viewports
   - Newsletter heading doesn't break ugly inside the `(...)` parens

## Success Criteria

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] All 9 manual smoke checks pass
- [ ] No new console warnings in dev server
- [ ] `/characters/max` page renders without layout break
- [ ] `/coming-soon/top-picks` renders

## Risk Assessment

- **Risk:** Visual regression on tablet from longer copy. *Mitigation:* No fix in this plan; flag any regression and decide whether to ship or follow up.
- **Risk:** Top-picks coming-soon stub fails because `characterSlug` lookup needs a real image. *Mitigation:* `characterSlug: "rocky"` chosen because rocky already has `image: "/assets/characters/poodle-bg.png"` — verified in Phase 1.
- **Risk:** ESLint react-no-unescaped-entities catches user's curly apostrophes. *Mitigation:* Verified — U+2019 is not in the ESLint default forbid set (which targets straight `'`, `"`, `<`, `>`, `{`, `}`). Curly chars pass through.
