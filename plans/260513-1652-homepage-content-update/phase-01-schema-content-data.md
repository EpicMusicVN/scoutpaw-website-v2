---
phase: 1
title: Schema + Content Data
status: completed
priority: P2
effort: 30m
dependencies: []
---

# Phase 1: Schema + Content Data

## Overview

Update content JSON files + zod schema to carry the new copy. Foundation for all later phases. No component code touched.

## Requirements

- **Functional:** All new brand strings persisted in JSON; schema accepts new optional field; existing data still validates.
- **Non-functional:** Schema change is additive only (no breaking field removals); `top-picks` coming-soon page resolves at `/coming-soon/top-picks`.

## Architecture

Data layer = source of truth where possible. Max's bio + funFacts[0] live in `characters.json` so `/characters/max` page also reflects the new bio. Footer Explore decoupled via new optional `footerExplore` array — top-nav keeps reading `navItems`.

## Related Code Files

**Modify:**
- `lib/content/schemas.ts` — add optional `footerExplore` to `SiteConfigSchema`
- `content/site-config.json` — `brand.description`, new `footerExplore[]`, update `social[]` URLs, drop `x` entry
- `content/characters.json` — update Max's `bio` + `funFacts[0]`
- `content/coming-soon.json` — append `top-picks` entry

**Create:** none
**Delete:** none

## Implementation Steps

1. **`lib/content/schemas.ts`** — extend `SiteConfigSchema` w/ optional `footerExplore` field after `navItems`:

   ```ts
   navItems: z.array(NavItemSchema),
   footerExplore: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
   social: z.array(/* unchanged */),
   ```

   Optional ensures back-compat: if JSON omits the field, footer falls back to `navItems`.

2. **`content/site-config.json`** — three edits:
   - `brand.description` →
     `"Musical best friends for your pup's big day. Gentle sounds, cozy colors, and stories for every \"Good Boy.\""`
   - Insert `footerExplore` array between `navItems` and `social`:
     ```json
     "footerExplore": [
       { "label": "Home", "href": "/" },
       { "label": "Characters", "href": "/#meet-the-pack" },
       { "label": "Shop", "href": "/shop" },
       { "label": "Watch", "href": "/watch" },
       { "label": "Top Picks", "href": "/coming-soon/top-picks" },
       { "label": "Activities", "href": "/coming-soon/activities" }
     ],
     ```
   - Replace `social[]` (drop `x`, update 4 URLs):
     ```json
     "social": [
       { "platform": "youtube", "url": "https://www.youtube.com/@ScoutPaw", "label": "YouTube" },
       { "platform": "instagram", "url": "https://www.instagram.com/scoutpawtv/", "label": "Instagram" },
       { "platform": "tiktok", "url": "https://www.tiktok.com/@scoutpawtv", "label": "TikTok" },
       { "platform": "facebook", "url": "https://www.facebook.com/ScoutPawTV", "label": "Facebook" }
     ],
     ```

3. **`content/characters.json`** — update the `max` record (slug `"max"`, currently at index 1):
   - `bio` →
     `"Max, our \"Welcome Wag-on,\" is the heart of the crew. This snuggle master loves head-tilting to music and carrying his plushie, filling our home with love. He's our ScoutPaw Captain!"`
   - `funFacts[0]` →
     `"He believes every nap is a musical masterpiece and every stranger is just a best friend who hasn't shared a golden snack yet."`
   - Keep `breed`, `accentColor`, `image`, `order`, `tagline`, remaining `funFacts` untouched.

4. **`content/coming-soon.json`** — append new entry to `pages[]`:
   ```json
   {
     "slug": "top-picks",
     "navLabel": "Top Picks",
     "title": "Top Picks are sniffing the way here",
     "tagline": "Hand-picked favorites from the pack — coming soon.",
     "characterSlug": "rocky",
     "newsletterTag": "coming-soon-top-picks"
   }
   ```

   `characterSlug` reuses an existing character to satisfy `ComingSoonPageSchema.characterSlug.min(1)` + image lookups.

## Success Criteria

- [ ] `pnpm typecheck` passes after schema change
- [ ] Manual JSON parse: all three JSON files remain valid JSON (no trailing commas, escaped quotes correct)
- [ ] Site-config validates against updated zod schema at runtime (smoke test in next phase)
- [ ] `/coming-soon/top-picks` resolves (verified in Phase 5)

## Risk Assessment

- **Risk:** Updating Max's bio cascades to `/characters/max` page. *Mitigation:* This is explicitly accepted per brainstorm. Verify the character page still renders w/o layout break in Phase 5.
- **Risk:** Dropping `x` social entry may leave stale references in code. *Mitigation:* `footer.tsx` filters by `realSocial.length` + iterates `social[]` — no hardcoded `x` references in surface code. Verify with grep.
- **Risk:** Adding `footerExplore` before zod schema knows about it would fail parse. *Mitigation:* Schema change executes first in Phase 1.
