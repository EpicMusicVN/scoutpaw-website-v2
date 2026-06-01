---
phase: 3
title: "Live Render Verification"
status: pending
priority: P1
effort: "30m"
dependencies: [2]
---

# Phase 3: Live Render Verification

## Overview

Browser verification across all hero-bearing routes + 3 character themes + mobile/desktop viewports. Required because (a) this is the 3rd pivot on these tokens — visual signoff is the only way to break the reversal loop, and (b) `pnpm build` is gated while dev server runs.

## Requirements

- **Functional:** Every hero renders kicker as deep ink-blue + title as visible gold gradient across all stops
- **Functional:** No fragment of the title is invisible/washed out on any surface
- **Functional:** Mobile viewport renders 3-stop fallback (still gold, no striping)
- **Functional:** Character theme spot-checks confirm gradient reads on themed light pastel bgs
- **Non-functional:** Verification artefacts (screenshots optional) captured in case of revert

## Architecture

Dev server already runs (per project conventions). Verification is read-only — open routes in browser, inspect visually.

Routes to verify:

| Route | Hero | Notes |
|---|---|---|
| `/` | FullBleedHero | Most prominent. Glass blob desktop, white card mobile. |
| `/shop` | FullBleedHero | Same component, different content |
| `/watch` | WatchHero | Hardcoded "ScoutPaw TV" kicker; centered text block |
| `/coming-soon/[slug]` | ComingSoonHero | Pick any active slug from content/coming-soon.json |
| `/characters` | FullBleedHero | "Characters" kicker |
| `/characters/[slug]` | CharacterDetailHero | Themed gradient bg — 3+ themes spot-check |
| `/top-picks` | FullBleedHero | "Top Picks" kicker |

## Related Code Files

- Read only (no edits)
- May edit phase-04 changelog with verification findings

## Implementation Steps

1. **Pre-flight:**
   - Confirm dev server is running (`pnpm dev` on default port)
   - If not running, start it; do NOT also run `pnpm build`

2. **Desktop pass (1280px+):**
   - Visit each route from the table above
   - For each: confirm kicker is dark navy, title gradient is visible left-to-right (no white-fade-out)
   - Mark pass/fail in success criteria below

3. **Mobile pass (375px / Chrome DevTools mobile emulator):**
   - Revisit `/`, `/watch`, one character detail page
   - Confirm 3-stop mobile gradient is active (no striping)
   - Confirm kicker remains legible at small size

4. **Character theme spot-checks (at minimum 3 distinct themes):**
   - Open `lib/content/character-themes.ts` to identify theme variants
   - Pick characters from 3 different theme palettes (e.g. one peach, one sky, one sage)
   - Open `/characters/[slug]` for each
   - Confirm gradient reads on each themed bg

5. **Regression sanity:**
   - Quick scroll-through of `/` and `/watch` post-hero — non-hero typography (body, cards, buttons) unchanged
   - Footer color unchanged
   - Mobile nav unchanged

6. **Document findings:**
   - If any hero looks wrong → STOP, capture screenshot, file as concern in phase-04 changelog entry
   - If all pass → proceed to phase 4

## Success Criteria

- [ ] `/` hero passes (desktop + mobile)
- [ ] `/shop` hero passes
- [ ] `/watch` hero passes
- [ ] `/coming-soon/[slug]` hero passes (at least one active slug)
- [ ] `/characters` hero passes
- [ ] `/characters/[slug]` passes on 3+ distinct themes
- [ ] `/top-picks` hero passes
- [ ] Mobile gradient fallback active <640px
- [ ] No non-hero regressions observed
- [ ] Typecheck + lint clean (re-run after edits)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| One character theme produces low gold contrast | Capture screenshot. Two options: (a) per-theme override via inline `style`; (b) ship and tune in follow-up plan. Default = (b) unless contrast is broken |
| Mobile striping observed | Mobile fallback already reduces to 3 stops. If still striping, reduce to 2 stops (`#b8862e → #ffd70c`). One-line CSS edit. |
| Glass blob on `/` distorts gradient | Visually confirm gradient reads through backdrop-blur. If lost, add `.text-shadow-soft` to the H1. |
| User wants revert | Plan + brainstorm report stand as audit trail. Reversal = swap class names back; gradient utility remains harmless. |

## Notes

- Capturing screenshots is optional but recommended given reversal history
- If results disagree with brainstorm assumptions, log findings in plan dir before any rollback
