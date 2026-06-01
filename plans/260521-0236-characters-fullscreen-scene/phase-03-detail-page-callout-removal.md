---
phase: 3
title: Detail Page Callout Removal
status: completed
priority: P2
effort: 1.5h
dependencies: []
---

# Phase 3: Detail Page Callout Removal

## Overview

Remove the "From the ScoutPaw Network" callout block from every character
detail page and rebalance the layout so the page closes cleanly. Independent of
the scene phases.

## Requirements

- Functional: `/characters/[slug]` no longer renders the bottom channel
  callout; the title-area channel badge is untouched; the page still resolves
  the channel (badge needs it).
- Non-functional: no dead imports; layout reads balanced with no abrupt ending;
  `tsc` + `lint` clean.

## Architecture

Current `app/characters/[slug]/page.tsx` structure:
`CharacterDetailHero` (hero + atmosphere + title channel badge) → themed story
section (bio + quote) → `CharacterChannelCallout` → centered "← Back to the
pack" button.

After removal: hero → themed story section → back button. The back button
currently sits in its own `paper`-colored strip below the themed tint — with
the callout gone, the page would end on hero → story → bare button strip, which
feels abrupt. Rebalance by folding the back button into the bottom of the
themed story section (one themed block that closes the page), with adjusted
padding.

`CharacterChannelCallout` is imported only by this page → delete the component.

## Related Code Files

- Modify: `app/characters/[slug]/page.tsx`
- Delete: `components/characters/character-channel-callout.tsx`

## Implementation Steps

1. In `app/characters/[slug]/page.tsx`: remove the `<CharacterChannelCallout>`
   render block and its `import`. Keep `content.getChannels()` + the `channel`
   lookup (still passed to `CharacterDetailHero` for the badge).
2. Rebalance: move the "← Back to the pack" `Button` inside the themed story
   `<section>` (after the quote), centered, with comfortable top spacing
   (e.g. `mt-10 md:mt-12`); drop the now-empty standalone button strip. Adjust
   the story section's bottom padding so the close feels intentional.
3. Delete `components/characters/character-channel-callout.tsx`.
4. Grep to confirm no remaining references to `CharacterChannelCallout`.
5. `npx tsc --noEmit` + `npx next lint` — confirm clean.

## Success Criteria

- [x] No "From the ScoutPaw Network" block on any detail page.
- [x] Title-area channel badge still present + correct.
- [x] Back button rebalanced into the themed story section; page ends cleanly.
- [x] `character-channel-callout.tsx` deleted; no dangling imports.
- [x] `tsc` + `next lint` clean.

## Risk Assessment

- **Lonely page** — without the callout the detail page is short; folding the
  back button into the themed block is the rebalance — do not add new content
  (YAGNI).
- **`channel` still needed** — do not remove the channel fetch/lookup; the
  title badge depends on it.
