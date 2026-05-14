# Brainstorm — Navbar Content Update

**Date:** 2026-05-14
**Status:** Design approved by user (pending plan creation)
**Scope:** Update navbar menu items + ensure coming-soon UX feels intentional

---

## Problem

Current navbar: `Home, Shop, Watch, About, Games, Activities`.
Requested: `Characters, Shop, Watch, Top Picks, Activities` (+ keep Home per user).
Three new items have no real content yet but must feel polished, not broken.

---

## Final Decisions (User-Confirmed)

| Decision | Choice |
|---|---|
| Existing items | Drop About + Games. Keep Home. |
| Characters route | Treat as disabled → `/coming-soon/characters` |
| Disabled item click | Clickable, navigates to `/coming-soon/[slug]` (current pattern) |
| Mobile order | Match desktop exactly |
| Polish layer | Opacity-only (no badge/pill) |
| Coming-soon spotlight | Reuse existing characters via `characterSlug` mapping |

---

## Final Menu (Order Matters)

```
1. Home         /                            enabled
2. Characters   /coming-soon/characters      disabled
3. Shop         /shop                        enabled
4. Watch        /watch                       enabled
5. Top Picks    /coming-soon/top-picks       disabled
6. Activities   /coming-soon/activities      disabled
```

---

## Why This Works (Codebase Alignment)

Existing architecture already supports this with **near-zero new code**:

- `content/site-config.json` → `navItems[]` is config-driven with `enabled: boolean`
- `components/nav/nav-links.tsx:32-39` → disabled state already styled (`text-ink/45`)
- `components/nav/mobile-nav.tsx:104-120` → mobile disabled state already styled
- `app/coming-soon/[slug]/` → template route exists for any slug
- `content/coming-soon.json` → **already contains entries for `top-picks` and `activities`** (lines 11-18, 27-34)
- Only `characters` slug needs a new coming-soon entry

---

## Change Set (Atomic)

### 1. `content/site-config.json`
Replace `navItems` array:
```json
"navItems": [
  { "label": "Home",       "href": "/",                          "enabled": true  },
  { "label": "Characters", "href": "/coming-soon/characters",    "enabled": false },
  { "label": "Shop",       "href": "/shop",                      "enabled": true  },
  { "label": "Watch",      "href": "/watch",                     "enabled": true  },
  { "label": "Top Picks",  "href": "/coming-soon/top-picks",     "enabled": false },
  { "label": "Activities", "href": "/coming-soon/activities",    "enabled": false }
]
```

### 2. `content/coming-soon.json`
Add new entry for `characters` (use a thematically-fitting character — recommend `oscar` or whichever is the "lead" mascot):
```json
{
  "slug": "characters",
  "navLabel": "Characters",
  "title": "Meet the pack — coming soon",
  "tagline": "Full character profiles and stories are sniffing their way here.",
  "characterSlug": "<pick-one>",
  "newsletterTag": "coming-soon-characters"
}
```

### 3. (Optional cleanup) `content/coming-soon.json`
`about` and `games` entries no longer linked from nav. Keep them (still reachable via direct URL / footer if needed) or prune. **Recommend keep** — zero cost, future-proof.

---

## Responsive Behavior (Already Handled)

- **Desktop (≥md)**: 6 items render via `nav-links.tsx`. Spacing already verified — original had 6 items too.
- **Tablet**: same as desktop above md breakpoint. Below md → mobile drawer.
- **Mobile (<md)**: full-screen overlay drawer in `mobile-nav.tsx`. 6 items + 2 quick-action buttons (Shop the Pack, Newsletter) fit comfortably.
- **Hover/tap states**: existing `nav-underline` utility + 45% opacity for disabled.
- **No new responsive logic required.**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| 6 nav items tight on narrow desktops | Low | Same count as current navbar; already proven |
| Users confused by clickable-but-disabled items | Low | Coming-soon page is polished, on-brand — communicates intent |
| `characters` coming-soon slug mismatch with `/characters/[slug]` detail pages | Medium | Acceptable: nav item points to placeholder hub; direct `/characters/{slug}` URLs (e.g., from cards) still work |
| Stale `footerExplore` references | Low | Footer already references `/coming-soon/top-picks` and `/coming-soon/activities`. Consistent. |

---

## Success Criteria

- Navbar renders 6 items in correct order on desktop, tablet, mobile.
- Disabled items show 45% opacity, navigate to a polished coming-soon page on click.
- No layout shift, no overflow, no broken links.
- Lint + typecheck pass.
- Mobile drawer opens/closes smoothly; ESC and route-change still close it.

---

## Out of Scope (Explicitly)

- Building a real `/characters` index page
- Building `/top-picks` or `/activities` real pages
- Adding tooltips, badges, or new UI primitives
- Visual redesign of navbar itself
- Footer changes (already references the correct coming-soon URLs)

---

## Next Steps

1. Pick a `characterSlug` for the new `characters` coming-soon entry.
2. Apply the two-file change set above.
3. Smoke-test desktop / tablet / mobile.
4. Run `pnpm lint` + `pnpm typecheck`.

---

## Unresolved Questions

1. Which character should spotlight on `/coming-soon/characters`? (Suggest the brand mascot if there is one — otherwise reuse `oscar` to differentiate from `top-picks`/`about` which already use `rocky`.)
2. Keep `about` and `games` entries in `coming-soon.json`, or prune now that nothing links to them?
