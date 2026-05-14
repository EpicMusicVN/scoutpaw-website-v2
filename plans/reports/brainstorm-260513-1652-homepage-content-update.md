---
type: brainstorm
date: 2026-05-13
slug: homepage-content-update
status: approved
---

# Brainstorm: Homepage Content Update

## Problem
Update homepage copy across 7 sections + footer w/ finalized brand-approved strings. Touches data (`site-config.json`, `characters.json`), schema, and 5 home components. Must keep typography hierarchy cinematic + maintain playful/warm tone.

## Surface Map

| Section | File | Change |
|---|---|---|
| 1. Hero | `app/page.tsx` | Prop values (title, description) |
| 2. Step Into the Pack | `components/home/menu-cards.tsx` | Section title/desc + 3 card labels/copy hardcoded |
| 3. Pack Leader | `components/home/featured-pup-spotlight.tsx` + `content/characters.json` | Switch `buddy`→`max`, add `subDescription` prop, replace breed-line w/ explicit subtitle prop, update Max's data |
| 4. Shop the Pack | `components/home/feature-banner.tsx` + `app/page.tsx` | Add `subDescription` prop; new copy via page |
| 5. Watch Together | `components/home/video-grid.tsx` | Hardcoded title/desc + CTA labels |
| 6. Join the Pack | `components/home/newsletter-cta.tsx` + `app/page.tsx` | Add `subDescription` prop; new heading/subheading/socialProof |
| 7a. Footer desc | `content/site-config.json` (`brand.description`) | String swap |
| 7b. Footer Explore | `content/site-config.json` (new `footerExplore[]`) + `components/nav/footer.tsx` | Decouple from `navItems`, read new field |
| 7c. Social | `content/site-config.json` (`social[]`) | URL updates; drop `x` |
| Schema | `lib/content/schemas.ts` | Add optional `footerExplore` w/ enabled-default true |
| Coming-soon stub | `content/coming-soon.json` | Add `top-picks` entry |

## Approaches Evaluated

| Decision | Chosen | Rejected |
|---|---|---|
| Pack Leader data | Update Max's `characters.json` (data-driven) | Hardcode home copy (two sources of truth) |
| Footer Explore | Add `footerExplore[]` in site-config | Rewrite `navItems` (breaks top-nav); hardcode in footer.tsx (less consistent) |
| Missing routes | Characters→`/#meet-the-pack`, Top Picks→`/coming-soon/top-picks` | Both coming-soon (loses anchor jump); new `/characters` index (scope creep) |
| Sub-description | Explicit `subDescription` prop per component | Append inline `<p>`; concat into description (loses visual distinction) |

## Final Solution

### Data changes
- `content/site-config.json`:
  - `brand.description` → new footer copy
  - Add `footerExplore[]`: 6 entries Home/Characters/Shop/Watch/Top Picks/Activities
  - Update 4 social URLs; drop `x` entry
- `content/characters.json` (`max` record):
  - Replace `bio` w/ user's pack-leader description
  - Replace `funFacts[0]` w/ user's golden-snack quote
  - Keep breed/accentColor/image/order untouched (component will stop using breed for subtitle)
- `content/coming-soon.json`: add `top-picks` entry mirroring `activities` schema

### Schema changes
- `lib/content/schemas.ts`: add optional `footerExplore: z.array({label, href}).optional()` to site-config schema (graceful fallback if absent)

### Component changes
- `FullBleedHero`: no API change. New props passed from `app/page.tsx`.
- `MenuCards`: section H2/description hardcoded swap. Card definitions: 3 labels (CHARACTERS/SHOP/WATCH), 3 copy strings, `href` for Characters card stays `#meet-the-pack`.
- `FeaturedPupSpotlight`:
  - Change `find(c => c.slug === "buddy")` → `find(c => c.slug === "max")`
  - Replace `<p>The {buddy.breed}</p>` line with `<p>{subtitle}</p>` using explicit `subtitle` literal
  - Replace blockquote source from `funFacts[0]` → use `quote` literal (preserves intent w/o data dependency)
  - Add `<p className="...italic">{subDescription}</p>` block below blockquote
  - Update kicker literal: `Meet the Mascot` → `MEET THE PACK LEADER`
  - Update H2: `Say hi to {capitalized name}` → render the user's verbatim "Say hi to Max" (no `.` since user omitted)
- `FeatureBanner`: add optional `subDescription?: string` prop; render below `body` with smaller italic style. Pass from `app/page.tsx`.
- `VideoGrid`: hardcoded title/desc/CTAs swap (component already accepts no props for these).
- `NewsletterCTA`: add optional `subDescription?: string` prop; render below `subheading`. Update `app/page.tsx` to pass `heading="Become a VIP (Very Important Pup)"` + new subheading/socialProof/subDescription.
- `Footer`: read `config.footerExplore ?? config.navItems` (fallback for safety). Order honored as supplied.

### Page wiring (`app/page.tsx`)
- Pass new hero copy
- Pass kicker/title/body/cta/subDescription to `FeatureBanner`
- Pass new heading/subheading/socialProof/subDescription to `NewsletterCTA`

### Minor decisions (defaults)
- Hero kicker `SCOUTPAW TV` kept
- MenuCards kicker `The ScoutPaw World` kept
- Watch kicker `Watch Together` kept
- Newsletter kicker `Join the Pack` kept
- Hero buttons + Pack Leader buttons unchanged
- Card labels render verbatim (no CSS uppercase)
- X social entry removed

## Risks
- `/characters/max` reflects new bio (acceptable per user choice)
- `breed` field becomes unused on home spotlight (data still valid for character page)
- Schema change must support optional `footerExplore` to avoid breaking existing JSON during partial deploy
- Responsive text wrap on long strings (Hero title is 7+ words; Newsletter heading has parens) — must verify at md/lg breakpoints

## Success Criteria
- All copy strings render verbatim
- `pnpm typecheck` + `pnpm lint` clean
- Top-nav unchanged
- `/characters/max` renders w/o layout break
- `/coming-soon/top-picks` renders stub
- Footer Explore = exactly: Home, Characters, Shop, Watch, Top Picks, Activities
- 4 social icons appear (yt, ig, fb, tt); no broken X icon

## Implementation Order (phases)
1. Schema + content data: `schemas.ts`, `site-config.json`, `characters.json`, `coming-soon.json`
2. Component prop additions: `feature-banner.tsx`, `newsletter-cta.tsx`, `featured-pup-spotlight.tsx`
3. Component literal swaps: `menu-cards.tsx`, `video-grid.tsx`, `footer.tsx`
4. Page wiring: `app/page.tsx`
5. Typecheck + lint
6. Visual QA at responsive breakpoints (manual; out of scope for automated step)

## Unresolved
None.
