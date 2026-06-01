---
type: brainstorm
date: 2026-05-28 08:14
slug: pivot-7-revert-to-pivot-4-state
status: design-approved
reverts: [260528-0525-hero-and-block-title-yellow-gold (pivot 5 mid-tier work), 260528-0649-pivot-6-solid-yellow-design-decision (pivot 6 surface flip)]
target_state: pivot #4 final state (shipped 2026-05-28 06:02)
---

# Pivot #7 — Revert Pivots #5 + #6 (Back to Pivot #4 State)

## Problem statement

User viewed the live rendered site after pivot #6 (dark navy + solid yellow titles) and disagreed with the result. The mockup that validated pivot #6 didn't predict full-page context — atmospheric overlays, character poses, glass cards, and multi-section rhythm collectively produced a feel that the isolated-section mockups couldn't communicate.

**Scope: revert pivots #5 + #6.** Restore the state shipped at 06:02 today (pivot #4 final state). Codify the lock-mechanism refinement: mockups must show full-page context, not just isolated section samples.

## Lock-mechanism honest assessment

The lock didn't fail. The user did view rendered pixels (pivot #6 was live in browser). What failed was **the mockup's predictive quality** — a panel of isolated hero + section banner samples can't reveal how the dark sections feel in full-page rhythm with atmospheric overlays. The mockup-first rule remains correct; the mockup itself was too narrow.

**Refinement to codify:** mockups must include full-page context (hero + section banner + atmosphere + 1 internal card + page transitions). Isolated component samples are necessary but not sufficient.

## Pivot history (now 7)

| # | When | What | Status |
|---|---|---|---|
| 1 | 2026-05-26 (Plan J) | Navy hero + yellow titles | Reverted |
| 2 | 2026-05-26 | Light surfaces + navy titles + gold kickers | Done |
| 3 | 2026-05-27 18:33 | Kicker→blue + h1→gradient | Superseded |
| 4 | 2026-05-28 05:25 | Kicker blue + hero/banner gradient + mid solid gold | Shipped 06:02 — target of this revert |
| 5 | 2026-05-28 06:18 | Mid solid gold → ink-blue + lock introduced | To be reverted |
| 6 | 2026-05-28 06:49 | Dark navy surfaces + solid yellow (mockup-validated) | To be reverted |
| 7 | 2026-05-28 08:14 (this) | Revert #5 + #6 + refine lock | This plan |

## Requirements

| # | Requirement |
|---|---|
| R1 | 4 hero components: revert surface to light, kicker → `text-ink-blue`, h1 → `.heading-gradient-gold-light`, body → `text-ink-blue/85`, mobile cards + glass blobs + fades back to light variants |
| R2 | 14 banner components: drop `bg-ink-blue` from sections, revert kickers (mostly `text-brand-gold`), h2 → `.heading-gradient-gold-light`, body → `text-ink-blue/85` |
| R3 | 5 mid sub-headers (pivot #5 scope): `text-ink-blue` → `text-brand-gold` (back to pivot #4 state) |
| R4 | Inner-card AA fixes from pivot #6 end-of-cook — KEEP (already at pivot #4 colors) |
| R5 | `character-detail-hero.tsx` h1 → `.heading-gradient-gold-light` (drop conditional theme.titleColor logic, or keep field unused) |
| R6 | `character-section.tsx` kicker + h2 → restore to pivot #4 colors (likely gradient h2) |
| R7 | `video-grid.tsx:63` link `text-white/85` → `text-ink-blue` (restoring pivot #4 light-surface state) |
| R8 | 4 button per-instance swaps reverted (cinematic-hero, featured-pup-spotlight, watch-hero × 2) |
| R9 | 3 page-level `CloudDivider surface="dark"` calls reverted (drop the surface prop) |
| R10 | KEEP utility additions (`dark-surface` button variant, `tone` prop, `surface` prop, `titleColor` field) — zero-cost, reserved for future |
| R11 | `docs/code-standards.md` — restore pivot-4-era hero + block-title contracts; keep pivot #5's lock-mechanism section; REFINE wording to add "full-page context" rule for mockups |
| R12 | `docs/project-changelog.md` — append pivot #7 entry; KEEP pivots #5 + #6 entries for audit trail (mark them reverted) |

## Approach (chosen)

**Full `/ck:plan` → `/ck:cook` cycle** — same rigor as the forward direction. 6 phases mirroring pivot #6's structure but in reverse:

1. Hero surface revert (4 components)
2. Banner surface revert (14 components)
3. Button per-instance reverts (4 swaps; keep `dark-surface` variant as reserved)
4. Character/atmosphere reverts (character-detail-hero, character-section, cloud-divider page consumers, video-grid link; keep `tone`/`surface`/`titleColor` as reserved)
5. Live render verification — confirm visual match to pivot #4 state
6. Docs sync — restore pivot-4-era contracts; refine lock mechanism with full-page-context rule; document pivot #7

## Implementation considerations

| Item | Note |
|---|---|
| Build gate | typecheck + lint + dev render. No `pnpm build` (memory). |
| Git state | Working tree still has uncommitted pivots #5/#6/#7. Plus ~37 pre-existing modifications. No commits to `git revert`. Manual edits only. |
| Reserved utilities | `dark-surface` button variant, `tone` prop, `surface` prop, `titleColor` field — all zero-cost, kept as reserved for future use. Mark as reserved in code-standards. |
| Mockup directory | `plans/260528-0649-pivot-6-solid-yellow-design-decision/mockups/comparison.html` stays as historical reference (Option A was chosen but ultimately rejected after viewing live). |
| Inner-card AA fixes from pivot #6 | The 7 fixes done by code-reviewer (feature-banner, featured-pup-spotlight, deal-block inner cards + video-grid link) already RESTORED pivot-4 colors during pivot #6's mid-cook. Their state already matches pivot #4. Don't double-revert. |
| Pivot #7 ironically uses pivot #5's lock-mechanism infrastructure | The lock section was introduced in pivot #5. Keep it. The refinement we add now (full-page-context rule) is additive. |
| Future pivot #8 | If someone requests another swap, the refined lock will require full-page mockup. If even that fails, lock mechanism is empirically broken — switch to a freeze period (e.g., "no color swap on these tokens for 14 days"). |

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Revert misses a file → mixed state | Med | Plan phase enumerates all files explicitly; cook phase uses parallel agents with strict file ownership. |
| `character-detail-hero` + `character-section` were touched by 2 pivots — easy to miss something | Med | Phase 4 owns these files with explicit revert mapping for both. |
| Pivot-4 era kicker colors on banners weren't uniform (some were `text-brand-gold`, some `text-ink-blue/70`) — easy to revert to wrong color | Med | Phase 2 of revert plan reads each file's git history (via blame or prior plan refs) to confirm exact pivot-4 state per file before edit. |
| Atmosphere page consumers (3 page files) might miss something | Low | Only 3 calls to revert; small surface. |
| User reverses again within 24h (pivot #8) | High | Lock mechanism refinement = full-page mockup. If pivot #8, brainstorm refuses to proceed without that. |
| Reserved utility cruft accumulates in codebase | Low | Acceptable — each is a few lines; reserved-comment documentation. KISS over DRY here. |
| Mockup comparison.html stays as orphaned artifact | Low | Keep for historical reference. Don't delete — audit trail. |

## Success criteria

- All 4 heroes match pivot-4 state (light surface, gradient h1, ink-blue kicker, ink-blue body)
- All 14 banners match pivot-4 state (no `bg-ink-blue`, gradient h2, original kicker colors, ink-blue body)
- All 5 mid sub-headers match pivot-4 state (`text-brand-gold` solid)
- character-detail-hero h1 back to gradient
- character-section back to gradient h2
- 4 button per-instance swaps reverted
- 3 page-level CloudDivider consumers reverted
- `pnpm tsc --noEmit` + `pnpm lint` clean
- Live render confirms visual match to pivot #4 state
- `docs/code-standards.md` lock section gains "full-page context" rule
- `docs/project-changelog.md` has pivot #7 entry with full reversal audit
- Reserved utilities (`dark-surface` variant, `tone`, `surface`, `titleColor`) documented as available-but-unused

## Next steps

1. `/ck:plan` to scaffold 6-phase implementation plan (mirroring pivot #6 structure in reverse).
2. `/ck:cook --parallel` to execute.
3. `/ck:journal` to capture the saga ending (pivot #7 = revert) and the lock-mechanism refinement.

## Unresolved questions

- After this revert, is the user committed to the pivot #4 state, or is another pivot expected? — implicit answer: lock mechanism + full-page rule should hold. If pivot #8 requested without full-page mockup, brainstorm refuses.
- Should pivots #5 and #6 plan dirs be archived / marked superseded? — propose: mark `status: reverted` in their plan.md frontmatter for audit trail.
- Should mockup comparison.html be moved to a permanent `mockups-archive/` dir? — defer; keep in original location for now.
