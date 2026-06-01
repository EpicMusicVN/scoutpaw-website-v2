---
phase: 4
title: "Nav Wiring and Cleanup"
status: completed
priority: P1
effort: "0.5h"
dependencies: [3]
---

# Phase 4: Nav Wiring and Cleanup

## Overview

Make `/top-picks` reachable: enable the nav item, point it at the new route,
and remove the now-dead `top-picks` coming-soon entry. Must run after Phase 3
so nav never links to a missing page.

## Requirements

- Functional: Top Picks appears in the top nav + footer, links to `/top-picks`;
  `/coming-soon/top-picks` no longer generates.
- Non-functional: no dangling references to the old coming-soon path.

## Architecture

`site-config.json` drives both `TopNav` and the footer explore list.
`coming-soon.json` drives `generateStaticParams` in `app/coming-soon/[slug]` —
removing the entry automatically stops that page from being built.

## Related Code Files

- Modify: `content/site-config.json`
- Modify: `content/coming-soon.json`

## Implementation Steps

1. **`content/site-config.json`**:
   - `navItems` → Top Picks item: set `"enabled": true`, change `"href"` from
     `"/coming-soon/top-picks"` to `"/top-picks"`.
   - `footerExplore` → Top Picks item: change `"href"` to `"/top-picks"`.
2. **`content/coming-soon.json`**: remove the `top-picks` page object from the
   `pages` array (it would otherwise SSG a stale orphan page).
3. Grep the repo for `coming-soon/top-picks` and `top-picks` to confirm no
   other hard-coded references remain (expect only the new route + nav).
4. Run `pnpm build` — confirm `/top-picks` builds and `/coming-soon/top-picks`
   is gone from the route manifest.

## Success Criteria

- [ ] Top Picks nav item `enabled: true`, href `/top-picks` (navItems + footer)
- [ ] `top-picks` entry removed from `coming-soon.json`
- [ ] No remaining references to `/coming-soon/top-picks`
- [ ] `pnpm build` passes; `/top-picks` in the route manifest

## Risk Assessment

- **Schema validation** → `site-config.json` / `coming-soon.json` are
  Zod-validated at load; a typo throws a clear build error. Low risk.
- **External inbound links to old path** → unlaunched MVP, negligible; no
  redirect needed.
