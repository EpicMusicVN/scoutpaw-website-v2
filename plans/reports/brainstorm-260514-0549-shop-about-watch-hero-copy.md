# Brainstorm — Shop AboutShop + Watch Hero Copy Updates

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** 8 string replacements across 2 files. Pure copy edit, no structural changes.

---

## Locked Changes

### 1. `components/shop/about-shop.tsx` (PILLARS array, lines 31-50)

| Pillar | Old title | New title | Old body | New body |
|---|---|---|---|---|
| 1 | "Designed by the pack" | `The "Invisible Hug" Effect` | "Every piece starts with the dogs we love and the homes they share. Real moments inform every detail." | `Tactile comfort for your pup when you're away. Weighted plushies and scent-retentive fabrics provide security and grounding until you return.` |
| 2 | "Made for real homes" | `Sensory Sanctuary` | "Cosy plushes, soft cotton tees, ceramics built to last. Designed to hold up to muddy paws and long naps alike." | `Calm departures for pups. Sensory products + music create a "Zen Zone" replacing anxiety with calm as you leave.` |
| 3 | "Ships from our Shopify store" | `The Return to Happy` | "Every Buy Now opens our official Shopify checkout — secure, simple, and shipped with care." | `Goodbye guilt, hello happy pup! Shop our toys for entertained, safe, and content dogs while you're away.` |

JSX requires double-quotes inside title strings to be escaped as `\"`. New title #1 (`The "Invisible Hug" Effect`) wrapped in single quotes (JS object literal) to avoid escaping; or use double + escape.

### 2. `components/watch/watch-hero.tsx` (lines 48-53)

| Element | Old | New |
|---|---|---|
| `<h1>` | "Watch the Whole Pack." | "Tune in to the Pack." |
| `<p>` description | "Calm visuals and gentle sounds — designed for your pup's rotation. Tap any episode to watch on YouTube." | "Keep your furry friend happy with calming visuals and scientifically proven sounds. Just tap a journey to start their YouTube session!" |

---

## Effort

~5m total. Pure text edits.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Escape characters break JSX (the `"Invisible Hug"` title has quotes) | Low | Use single-quote string literal `'The "Invisible Hug" Effect'` to avoid escaping |
| Card heights misalign after copy change (new bodies vary in length) | Low | Existing layout uses flex column with `mt-auto` on action elements; copy length variance handled. Visual smoke to confirm. |
| Watch h1 length change affects mobile responsiveness | Low | "Tune in to the Pack." is shorter than "Watch the Whole Pack." — same or better. |

## Success Criteria

- All 3 AboutShop cards show new titles + bodies
- WatchHero shows new h1 + description
- typecheck + lint clean
- No layout regressions

## Out of Scope

- Any styling changes
- Card layout adjustments
- Other pages

## Unresolved Questions

None.
