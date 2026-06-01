---
type: brainstorm
date: 2026-05-28 06:18
slug: mid-tier-subtitle-revert-to-ink-blue
status: design-approved
follows: plans/reports/brainstorm-260528-0525-hero-and-block-title-yellow-gold.md
---

# Mid-Tier Sub-Header Revert to Ink-Blue

## Problem statement

Pivot #5 on hero/block-title color tokens in <72h. User wants mid h2/h3 sub-headers to use **dark blue** ("subtitle titles") instead of the solid `text-brand-gold` shipped 1h ago. Hero kicker (already dark blue), hero h1 + large banner h2 (already gold gradient) stay unchanged.

## Pivot context — full audit trail

| # | When | What | Status |
|---|---|---|---|
| 1 | 2026-05-26 (Plan J) | Navy hero surfaces + yellow titles + gold gradient | Shipped → reverted |
| 2 | 2026-05-26 (reversal) | Light surfaces + navy titles + gold kickers | Shipped |
| 3 | 2026-05-27 18:33 | Kicker→blue, h1→gradient | Plan only, never shipped (superseded) |
| 4 | 2026-05-28 05:25 | Hero swap + large h2 gradient + mid h2/h3 solid gold + card h3 unchanged | ✅ Shipped 06:02 |
| 5 | **2026-05-28 06:18** | Mid h2/h3 revert: solid gold → ink-blue | This brainstorm |

## What user clarified (locked)

| Question | Answer |
|---|---|
| Intentional reversal of pivot 4 mid-tier? | **Yes** — explicit |
| "Royal yellow" = solid bright yellow or current gradient? | **Current `.heading-gradient-gold-light` IS the royal yellow** — keep as-is |
| AA tolerance? | Strict — no AA violations introduced |
| Lock mechanism for future pivots? | **ai-multimodal mockup pipeline** for future changes (not this one — too small) |

## Requirements

| # | Requirement |
|---|---|
| R1 | Mid h2/h3 sub-headers (5 files, 5 edits) revert from `text-brand-gold` → `text-ink-blue` |
| R2 | Hero kicker, hero h1, large h2 banners — **unchanged** |
| R3 | Card-level h3 titles — **unchanged** (still `text-ink-blue`) |
| R4 | Code-standards.md updated to reflect new mid-tier rule |
| R5 | Code-standards.md gains a new section: **future-pivot lock mechanism** (mockup-first rule) |
| R6 | Changelog entry documents pivot #5 + lock-mechanism introduction |

## Final design

### 1. Code changes (5 lines, 5 files)

| File | Line | Before | After |
|---|---|---|---|
| `components/watch/our-channels.tsx` | 87 | `text-brand-gold` | `text-ink-blue` |
| `components/watch/video-rail.tsx` | 68 | `text-brand-gold` | `text-ink-blue` |
| `components/watch/subscribe-card.tsx` | 12 | `text-brand-gold` | `text-ink-blue` |
| `components/watch/watch-library.tsx` | 117 | `text-brand-gold` | `text-ink-blue` |
| `components/shop/shop-empty-state.tsx` | 16 | `text-brand-gold` | `text-ink-blue` |

No new utility. No new token. Pure class substitution.

### 2. Docs changes

**`docs/code-standards.md`:**
- Update "Block title color contract" section:
  - **Mid h2/h3 sub-headers**: `text-ink-blue` (deep navy `#1a3a5c`) — fully AA-safe (~9:1 on white, ~6:1 on cyan)
  - Remove the `text-brand-gold` mid-tier rule entirely (it lasted 30 minutes)
- Add new section **"Future pivot lock mechanism"**:
  - Any future color-token swap on hero/banner/title elements **must** go through mockup-first review.
  - Threshold: change spans >5 components OR introduces new tokens → use `ai-multimodal` to generate mockups.
  - Smaller changes (≤5 components, no new tokens) → render in worktree + screenshot for approval.
  - Goal: prevent further pivot-cycles. 5 pivots in <72h is a smell.

**`docs/project-changelog.md`:**
- Append dated entry `## [2026-05-28] - Mid-Tier Subtitle Revert (Pivot #5)`:
  - 5-file revert: mid h2/h3 from `text-brand-gold` → `text-ink-blue`
  - Reason: design preference — subtitle treatment should ground (blue) instead of accent (gold)
  - AA improvement: ink-blue (~6:1 on cyan) clearly safer than dark gold (~2.45:1 contested)
  - Lock mechanism introduced — see code-standards.md

### 3. No mockup for this pivot

User chose "skip mockup for THIS pivot" because scope is trivial (5 line swaps, fully reversible via git). Lock mechanism activates for future requests.

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Pivot #6 happens despite lock mechanism | Med | Lock requires mockup BEFORE pivot. If user requests another swap, brainstorm refuses to proceed until mockup is reviewed. |
| Visual hierarchy collapses (kicker = mid h2 = both blue) | Low | Hierarchy preserved by size: kicker `text-xs–sm`, mid h2 `text-2xl–3xl`. Same color, different weights/sizes already differentiates. |
| Mid h2 `text-ink-blue` reads same as body text (also ink-blue) | Low | Body is `text-base–lg`, mid h2 is `text-2xl–5xl` + `font-display font-bold`. Visual separation maintained via typography, not color. |
| User reverses again within 24h | Med | Lock mechanism. Brainstorm explicitly cites the 5-pivot cost (~10 hours of accumulated work). |

## Implementation considerations

- Build gate per `memory/build-verification-gate.md`: typecheck + lint + live render. No `pnpm build` during dev server.
- 5 edits can be done directly (no need for subagent — too small).
- Total estimated effort: 10 min implementation + 10 min docs sync.

## Success criteria

- All 5 mid h2/h3 elements render `text-ink-blue` in browser
- Hero kicker + hero h1 + large h2 banners + card h3 — visually unchanged from current (pivot 4) state
- `pnpm tsc --noEmit` + `pnpm lint` pass
- `docs/code-standards.md` updated with new mid-tier rule + lock mechanism section
- `docs/project-changelog.md` has pivot #5 entry
- Grep verification: `Grep "text-brand-gold" components/watch components/shop` shows **no more mid-tier matches** (only hero kicker leftovers if any — verify none remain)

## Next steps

1. Skip the `/ck:plan` heavy flow — scope too small to justify 6 phases. Run a single-phase plan OR direct implementation via `/ck:cook` with the file list above.
2. Apply 5 edits + 2 docs updates.
3. Live render verification.
4. Mark plan complete.
5. Journal entry capturing pivot #5 + lock mechanism going forward.

## Unresolved questions

- Does any external doc (README, marketing site preview, design system tool) reference the brief gold mid-tier state? — propose: spot-check during docs sync; likely none since pivot 4 was only live 30 min.
- Should the lock mechanism formally extend beyond color tokens (e.g., typography sizing, spacing systems) or stay scoped to colors? — propose: defer; codify based on observation if pivot-pattern repeats in non-color areas.
