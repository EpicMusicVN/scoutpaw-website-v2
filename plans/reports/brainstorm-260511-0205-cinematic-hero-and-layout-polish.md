---
type: brainstorm
date: 2026-05-11
slug: cinematic-hero-and-layout-polish
status: approved
next: ck:plan
---

# Brainstorm — Cinematic Hero + Layout Polish Pass

## Problem
Current site falls short of the "cinematic" brand intent. Heroes cap at fixed pixel heights instead of viewport-fill. Menu cards uneven. Shop tiles cramped. Watch page has redundant flat library competing with playlist-driven browse. Visible gap between newsletter CTA and footer.

## Requirements
- Home + Shop heroes fill viewport (cinematic, not card-style)
- Menu cards uniform size, sticker rotations preserved
- Newsletter section flush to footer
- Shop product tiles larger, less surrounding negative space
- Watch page: drop "All Episodes" + flat library, lean on playlists/channels
- Responsive across 360 / 768 / 1280 / 1920+
- No new features; preserve existing brand vocabulary (honey gradients, sticker tilts, rounded corners)

## Approaches Evaluated

### Hero viewport
| Option | Pro | Con | Verdict |
|--------|-----|-----|---------|
| `min-h-screen` (100vh) | Simple | Mobile address bar causes scroll jump | Rejected |
| `min-h-[100dvh]` | Always fills | Resizes during scroll → content shift | Rejected |
| `min-h-[100svh]` | Stable across mobile chrome | Newer-only (Tailwind v3+) | **Chosen** |

### Shop hero layout
| Option | Pro | Con | Verdict |
|--------|-----|-----|---------|
| Stacked (image-then-text) at 100svh | Honors painted-in artwork | Splits viewport, not cinematic | Rejected |
| Overlay (Home-style) | Truly cinematic, single-viewport impact | Risk colliding with painted "DOG PARENTS" type | **Chosen** — mitigate via left-side gradient + position text left |
| Split (small overlay + scroll cue) | Minimal text noise | Adds complexity for little gain | Rejected |

### Watch removal scope
| Option | Pro | Con | Verdict |
|--------|-----|-----|---------|
| Keep WatchLibrary, drop only header | Smallest delta | Library still feels redundant | Rejected |
| Remove header + WatchLibrary | Aligns with YT-first intent | Strands `?playlist=` links from PlaylistGrid | **Chosen** — fix by adding `youtubeUrl` field, disable cards without one |
| Remove everything below PlaylistGrid | Cleanest | Loses OurChannels + Subscribe (not user intent) | Rejected |

### Menu card uniformity
| Option | Pro | Con | Verdict |
|--------|-----|-----|---------|
| Same size, no rotations | Most balanced | Loses sticker brand feel | Rejected |
| Same size, hover-only rotations | Compromise | Less personality at rest | Rejected |
| Same size, keep rotations | Balanced + on-brand | None | **Chosen** |

### Playlist link fallback
- **Chosen:** disable card interaction when `youtubeUrl` missing. Clean signal to populate later; no fake/dead navigations.

## Final Solution

### File-level changes
1. **`components/home/full-bleed-hero.tsx`** — replace `min-h-[520/600/680px]` with `min-h-[100svh]`; vertical-center text panel inside that height.
2. **`components/home/menu-cards.tsx`** — drop `size: 'lg'|'md'|'wide'` field + `heightClass` switch. Single fixed height `min-h-[320px] md:min-h-[360px]`. Add `auto-rows-fr` to grid. Keep rotations.
3. **`components/home/newsletter-cta.tsx`** — change `py-24 md:py-32` → `pt-24 md:pt-32 pb-12 md:pb-16`. Audit `Footer` for offsetting margin.
4. **`components/shop/stacked-hero.tsx`** — restructure to overlay pattern: 100svh container, `Image fill object-cover`, left-side honey gradient mask, kicker/description/CTAs in left card backdrop. Drop aspect ratios.
5. **`components/shop/explore-products.tsx`** — `max-w-3xl` → `max-w-5xl`. Reduce inner padding so image fills more of tile. Keep aspect-square + rotations.
6. **`app/watch/page.tsx`** — delete header section (lines 87-103), `libraryVideos` filter, `WatchLibrary` import + Suspense wrapper, `LibraryFallback`, empty-state branch. Trim `Promise.all` of unused queries (verify `getLatestVideos(8)` still consumed by VideoRail — it is, keep).
7. **`components/watch/playlist-grid.tsx`** — link only when `playlist.youtubeUrl` set; else render non-interactive tile (cursor-default, no Link wrap, "Coming Soon" or muted state).
8. **`lib/content/schemas.ts`** — add `youtubeUrl: z.string().url().optional()` to `PlaylistSchema`.
9. **`content/playlists.json`** — leave URL field absent for now (cards disable until populated). Optional: add a `_note` reminder.

### Implementation considerations
- Image assets already meet/exceed minimums (banner.png 2754×1536; promotion.png 1920×1073) — no asset swap.
- Tailwind v3 ships `100svh` arbitrary value — works.
- `auto-rows-fr` on a `grid-cols-3` ensures uniform row height regardless of content length.
- Shop hero overlay: text panel goes on **left** because promotion.png's painted "DOG PARENTS / essentials" type sits on the right side of the image.
- Footer audit: check `Footer` root for any `mt-*` that would re-add space.

### Risks
- **Shop overlay text vs. painted text** — must verify by eye after build; may need to drop HTML kicker/description and keep only CTAs.
- **Disabled playlist cards** — visual regression risk if all 3 lack URLs. Acceptable: signals data gap clearly.
- **`min-h-[100svh]` height + tall hero text panel** — verify text doesn't crowd at 360×640 viewport; may need `py-` floor on inner panel.

## Success Metrics
- Heroes fill viewport (no clip / no jump) on iPhone SE, iPad, 1440 desktop, 4K
- Menu cards: identical bounding boxes; tilts intact
- Shop tiles: visibly larger product image, tighter surrounding margin
- No visible gap between Newsletter gradient bottom and Footer top
- Watch page: page ends at Subscribe CTA; no flat library grid; PlaylistGrid cards either link to YouTube or render disabled

## Next Steps
1. `/ck:plan` — break into 3 phases:
   - **Phase 1 (Home):** hero + menu cards + newsletter gap
   - **Phase 2 (Shop):** hero overlay + explore tiles enlargement
   - **Phase 3 (Watch):** remove library, schema extension, playlist-grid disable logic
2. `/ck:cook` after plan approval
3. `/ck:test` + manual responsive QA
4. `/ck:code-review` before merge

## Unresolved Questions
- None. All decisions locked via clarifying-question round.
