---
phase: 3
title: Page Assembly & Navigation
status: completed
priority: P1
effort: 2h
dependencies:
  - 2
---

# Phase 3: Page Assembly & Navigation

## Overview

Assemble `app/characters/page.tsx` from the Phase 2 components and wire the
"Characters" entry in site navigation + footer to the new route.

## Requirements

- Functional: `/characters` route renders hero → quick-nav → 5 alternating
  sections → newsletter CTA. Nav item enabled and pointing to `/characters`.
- Non-functional: SEO metadata; correct image priority/lazy split; `next build`
  clean.

## Architecture

### `app/characters/page.tsx` (server component)
- `export const metadata: Metadata` — `title: "Characters"` (layout template
  appends brand), `description` (pack-overview blurb), `openGraph` with
  `assetUrl("banner/banner.png")`. (Static metadata — no async needed.)
- `const characters = await content.getCharacters()`.
- `const PAGE_ORDER = ["max", "buddy", "bella", "oscar", "rocky"]` — map to an
  ordered array via a slug lookup; this drives page order independent of JSON
  `order` (so the home featured pup is unaffected).
- Render tree:
  ```
  <FullBleedHero kicker="The Pack" title="Meet the Characters"
                 description="..." image={assetUrl("banner/banner.png")} />
  <CharacterQuickNav characters={ordered} />
  {ordered.map((c, i) => (
    <Fragment key={c.slug}>
      <ScrollReveal><CharacterShowcaseSection character={c} index={i}
                       priority={i === 0} /></ScrollReveal>
      {i < ordered.length - 1 && <CloudDivider />}
    </Fragment>
  ))}
  <ScrollReveal><NewsletterCTA tag="characters-newsletter" /></ScrollReveal>
  ```
- Image priority: `FullBleedHero` is already `priority`; pass `priority` only to
  the first `CharacterShowcaseSection` (`i === 0`); the rest lazy-load by default.

### `content/site-config.json`
- `navItems` → "Characters" entry: set `enabled: true`, `href: "/characters"`
  (was `/coming-soon/characters`, `enabled: false`).
- Footer "Characters" link: `href: "/#meet-the-pack"` → `/characters`.

## Related Code Files

- Create: `app/characters/page.tsx`
- Modify: `content/site-config.json`
- Read for context: `app/shop/page.tsx` (page composition + `ScrollReveal` +
  `CloudDivider` + `NewsletterCTA` pattern), `app/layout.tsx` (metadata template),
  `lib/content/index.ts` (`getCharacters` API)

## Implementation Steps

1. Read `app/shop/page.tsx` to mirror the page-composition pattern
   (`ScrollReveal`/`CloudDivider`/`NewsletterCTA`, section spacing).
2. Create `app/characters/page.tsx` per Architecture.
3. Edit `content/site-config.json` — enable + repoint the nav "Characters" item;
   repoint the footer "Characters" link. Keep JSON valid.
4. `pnpm build` — confirm `/characters` appears as a static (`○`) route and
   build is clean.

## Success Criteria

- [ ] `/characters` builds as a static route
- [ ] Page renders hero, quick-nav, 5 sections with `CloudDivider` between,
      newsletter CTA — in order Max, Buddy, Bella, Oscar, Rocky
- [ ] "Characters" nav item enabled, links to `/characters`; footer link updated
- [ ] Page `metadata` (title/description/OG) present
- [ ] Only hero + first character image are `priority`; rest lazy
- [ ] `pnpm build` clean

## Risk Assessment

- **Nav config shape** — confirm the exact `navItems` "Characters" object keys
  before editing; there are two "Characters" entries (nav + footer) in
  `site-config.json` — edit the correct one for each change.
- **`getCharacters` ordering** — it may sort by JSON `order`; the explicit
  `PAGE_ORDER` map must not assume input order.
