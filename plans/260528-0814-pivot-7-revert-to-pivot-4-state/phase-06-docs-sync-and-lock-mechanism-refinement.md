---
phase: 6
title: Docs Sync and Lock Mechanism Refinement
status: completed
priority: P2
effort: 40m
dependencies:
  - 5
---

# Phase 6: Docs Sync and Lock Mechanism Refinement

## Overview

Restore pivot-4-era hero + block-title contracts in `code-standards.md`. REFINE the lock-mechanism section with the lesson from pivot #6: **mockups must show full-page context**, not just isolated section samples. Append pivot #7 changelog entry. Mark pivots #5 and #6 plans as reverted. Document reserved utilities.

## Requirements

- Functional: docs accurately reflect the restored pivot-4-era contract. Lock mechanism gains a critical refinement clause. Audit trail preserves pivots #5 and #6 as reverted.
- Non-functional: clear documentation of which utilities are RESERVED (no consumers but kept for future).

## Architecture

`code-standards.md` currently (post pivot #6) describes the dark-surface contract. Revert to the pivot-4-era light-surface contract. KEEP the lock-mechanism section (introduced pivot #5, refined pivot #6) — it's working infrastructure. Add the "full-page context" rule.

`project-changelog.md` currently has pivot #6 at top, pivot #5 below. Append pivot #7 entry at the top. KEEP #5 and #6 entries with prepended "REVERTED" header so the audit trail stands.

Plans `260528-0525` and `260528-0649` frontmatter: add `reverted_by: 260528-0814-pivot-7-revert-to-pivot-4-state` field. Status stays "done" (the work shipped; pivot #7 reversed it post-shipment).

## Related Code Files

- Modify: `docs/code-standards.md`
- Modify: `docs/project-changelog.md`
- Modify: `plans/260528-0525-hero-and-block-title-yellow-gold/plan.md` (frontmatter only)
- Modify: `plans/260528-0649-pivot-6-solid-yellow-design-decision/plan.md` (frontmatter only)

## Implementation Steps

### 1. Rewrite `docs/code-standards.md` — Hero color contract

Restore pivot-4-era hero rule:

```markdown
### Hero color contract (current, post Plan 260528-0814 pivot #7 — restored to pivot #4 state)

All hero banners use:
- **Surface**: light — `bg-paper` body cyan / `bg-surface` white / themed gradient
- **Kicker** (e.g. "SCOUTPAW TV", "Coming Soon"): `text-ink-blue` (deep navy `#1a3a5c`) — ~6:1 AA on cyan
- **Title (h1)**: `.heading-gradient-gold-light` (symmetric dark-gold → yellow → dark-gold gradient on light bg)
- **Body / description**: `text-ink-blue` or `text-ink-blue/85`

Exception: `character-detail-hero.tsx` keeps `theme.heroGradient` per-character. h1 still uses `.heading-gradient-gold-light` regardless of theme (the gradient anchors at dark-gold both ends, readable on all pastel themes).

This contract applies to: `CinematicHero`, `FullBleedHero`, `WatchHero`, `ComingSoonHero`, `CharacterDetailHero`.

History note: pivot #6 (2026-05-28 06:49) tried `bg-ink-blue` surface + solid `text-brand-primary` titles. User viewed live result and reverted. The mockup that validated #6 didn't show full-page context (atmosphere, character poses, multi-section rhythm). See "Future pivot lock mechanism" below for the refined rule.
```

### 2. Rewrite `docs/code-standards.md` — Block title color contract

Restore pivot-4-era tier rules:

```markdown
### Block title color contract (current, post Plan 260528-0814 pivot #7 — restored to pivot #4 state)

Tiered system:
- **Large h2 section banners** (≥`text-4xl`) — surface light (cyan body bg), kicker `text-brand-gold` (or `text-ink-blue/70` for feature-banner + featured-pup-spotlight), h2 `.heading-gradient-gold-light` (same gradient as hero h1). Applied to 14 components.
- **Mid h2/h3 sub-headers** (`text-2xl`/`text-3xl` base on cyan body bg) — `text-brand-gold` (#b8862e solid dark gold). Applied to 5 components: `our-channels`, `video-rail`, `subscribe-card`, `watch-library`, `shop-empty-state`. AA borderline (~2.45:1 on cyan per code-reviewer recalc); user-approved per pivot #4.
- **Card-level h3 titles** (product/video/character names, card-level icon labels) — `text-ink-blue` on card surfaces. UNCHANGED across all 7 pivots.

Exception: `character-section.tsx` keeps `theme.surfaceTint` per-character. h2 uses `.heading-gradient-gold-light` regardless.

**Important note on inner-card text colors:** When a large h2 banner section was on a dark navy background (pivot #6 transient state), decorative cards *inside* with their own light gradient surfaces retained dark text. This was the AA fix that survived the revert because pivot #4 already had ink-blue text in those cards. See `feature-banner.tsx:52`, `featured-pup-spotlight.tsx:36`, `deal-block.tsx:42`.

**Forbidden**: pure `text-brand-primary` on cyan/white/cream surfaces — physics ban (`#ffd70c` on `#c6e7e9` = ~1.1:1, catastrophic AA fail). If brand yellow is required on text, surface MUST be dark navy.
```

### 3. REFINE the "Future pivot lock mechanism" section

Add the critical full-page-context rule:

```markdown
### Future pivot lock mechanism (refined post pivot #7, 2026-05-28 08:30)

**Rule:** Any future swap of hero / banner / title color OR surface tokens MUST go through mockup-first review BEFORE code changes. Mockup approval is **not** complete until the user has viewed **a full-page-context rendered mockup** — text-only approvals and isolated-section samples do not satisfy the lock.

**Threshold:**
- Change spans >5 components OR introduces new color tokens OR changes surface bg → mockup pipeline (see below) → user views rendered mockup in full-page context → user approves specific option → implementation locks to that option
- Change spans ≤5 components, no new tokens, no surface change → render in git worktree + screenshot for approval

**Mockup pipeline (MANDATORY content):**
- Standalone HTML + CSS mockup file with real hex values (NOT ai-multimodal image gen — AI image gen cannot render text faithfully)
- **MUST include full-page context** — hero + section banner + atmosphere overlays + 1 internal card + page transitions (cloud dividers, section bgs alternating). Isolated component samples are necessary but not sufficient. (Lesson from pivot #6: a 5-option panel of isolated samples failed to predict how the dark navy treatment feels in full-page rhythm.)
- For larger structural/layout decisions: Figma reference OR sandbox dev-server render of the actual page

**Why this matters (lessons from pivots #1-#7 in <72h):**
1. Pivots #4 and #5 happened because designs were approved via text descriptions
2. Pivot #6 was the first mockup-validated decision — but the mockup was too narrow, only showing isolated section samples
3. Pivot #7 reverted #5 and #6 after user viewed live full-page result
4. The lock mechanism is correct in spirit; mockup quality is the variable

**Audit trail of the 7 pivots:**
1. 2026-05-26 (Plan J) — navy hero + yellow titles (shipped → reverted undocumented)
2. 2026-05-26 (reversal) — light surfaces + navy titles + gold kickers
3. 2026-05-27 18:33 — kicker→blue + h1→gradient (planned, superseded)
4. 2026-05-28 05:25 — kicker blue + hero/banner gradient + mid solid gold + card unchanged (target state of current site)
5. 2026-05-28 06:18 — mid solid gold → ink-blue revert + lock mechanism introduced (REVERTED by pivot #7)
6. 2026-05-28 06:49 — dark navy surfaces + solid yellow, mockup-validated (REVERTED by pivot #7 after user viewed live)
7. 2026-05-28 08:14 — revert #5 + #6, refine lock mechanism with full-page-context rule

**Pivot #8 protocol:** If a pivot #8 is requested, brainstorm must refuse to design until either (a) a new full-page-context mockup-validated decision exists OR (b) the user explicitly waives the lock with acknowledgement of the cumulative ~14 hours spent.

**Empirical breaking point:** If pivot #8 happens despite this refined lock, the lock mechanism is empirically broken. Switch to a freeze period (e.g., "no color swap on these tokens for 14 days") as the next intervention.
```

### 4. Update "Heading utilities" table

Heading utilities are mostly RESERVED at this point. Update table:

```markdown
| Class | When to use |
|---|---|
| `text-navy` (h1 + h2 on light bg) | Default section heading. AA-safe for large text. |
| `text-brand-gold` (mid h2/h3 sub-headers, hero kickers) | Solid dark gold (`#b8862e`). Active consumer. |
| `text-ink-blue` (hero kickers, body) | Deep navy `#1a3a5c`. Active consumer. |
| `.heading-gradient-gold-light` | ACTIVE — hero h1 + large h2 banner titles (5+14 consumers). |
| `heading-gradient-gold` | **RESERVED** — no current consumers. Dark-surface variant for future. |
| `heading-gradient-tri` / `-cool` / `-warm` | **RESERVED** — no current consumers. |
| `text-shadow-bold` | **RESERVED** — no current consumers (was used pivot #6, removed pivot #7). |
| `text-shadow-soft` / `text-shadow-warm-glow` | Available; spot consumers in atmospheric heroes. |
```

### 5. Add new section: "Reserved utilities" (NEW)

Document the four pivot-#6 utilities kept as reserved:

```markdown
### Reserved utilities (no current consumers — kept for future reuse)

The following utilities have NO active consumers post-pivot-#7 but are kept in the codebase as low-cost infrastructure for potential future use:

| Asset | Location | Reason kept |
|---|---|---|
| `dark-surface` button variant | `components/ui/button.tsx` | Transparent bg + light border + light text. Suitable when dark-surface designs return. |
| `tone: "light" \| "dark"` prop | `components/ui/paw-print-pattern.tsx` | Switches stamp color for dark-surface usage. Default "light" matches all current consumers. |
| `surface: "light" \| "dark"` prop | `components/ui/cloud-divider.tsx` | Mutes cloud opacity on dark-to-dark transitions. Default "light" matches all current consumers. |
| `titleColor: "yellow" \| "ink-blue"` field | `lib/content/character-themes.ts` | Per-character h1 color override for themed surfaces. Currently unused; characters default. |

These are NOT dead code — they are reserved infrastructure. Do not remove without a separate plan documenting the cleanup decision.
```

### 6. Update Audit summary

Add row for plan 260528-0814 documenting the revert.

### 7. Append `docs/project-changelog.md`

Top of file, new dated entry:

```markdown
## [2026-05-28] - Pivot #7 — Revert #5 + #6 to Pivot #4 State + Lock Refinement

### Overview
**Reverted pivots #5 and #6** after user viewed the live pivot #6 dark-navy + solid-yellow render and disagreed. Mockup that validated pivot #6 was too narrow (isolated section samples, no full-page context). Site is back to pivot #4 final state shipped at 06:02 today.

**Critical addition:** lock-mechanism refined with **"mockups must show full-page context"** rule. This is the lesson from pivot #6 — isolated samples can't predict how a treatment feels in full-page rhythm.

### Changes

**Code reverts (~30 files):**
- 4 heroes: surface back to light, kicker `text-brand-primary` → `text-ink-blue`, h1 solid yellow → `.heading-gradient-gold-light` gradient, body white → ink-blue
- 14 banners: `bg-ink-blue` removed, kickers back to original (mostly `text-brand-gold`), h2 → `.heading-gradient-gold-light`, body → `text-ink-blue/85`
- 5 mid sub-headers: `text-ink-blue` → `text-brand-gold` (reverting pivot #5)
- `character-detail-hero` + `character-section`: h1/h2 back to gradient
- `video-grid.tsx:63` link: `text-white/85` → `text-ink-blue`
- 4 button per-instance swaps reverted (3 dark-surface → outline + 1 primary → dark)
- 3 page-level `<CloudDivider surface="dark" />` calls dropped

**Reserved utilities kept (no current consumers, zero cost):**
- `button.tsx` `dark-surface` variant
- `paw-print-pattern.tsx` `tone` prop
- `cloud-divider.tsx` `surface` prop
- `character-themes.ts` `titleColor` field

**Docs:**
- `docs/code-standards.md` — hero + block-title contracts restored to pivot-4-era rules; "Reserved utilities" section added; lock-mechanism section refined with **full-page-context rule**; pivot #8 protocol updated
- `docs/project-changelog.md` — this entry
- `plans/260528-0525-.../plan.md` — frontmatter `reverted_by: 260528-0814-...`
- `plans/260528-0649-.../plan.md` — same

### Design Rationale
- **Why revert:** User viewed live pivot #6 result and disagreed. Aesthetic + functional issues with full-page context (atmosphere, character poses, multi-section rhythm) that the mockup couldn't reveal.
- **Why keep reserved utilities:** Zero cost (purged from CSS bundle if unused); explicit infrastructure for potential future dark-surface direction.
- **Why refine lock mechanism:** Pivot #6 had a mockup AND user viewed live AND we still reverted. The lock didn't fail — the mockup was too narrow. Future mockups must show full-page context.
- **Why keep pivots #5 and #6 entries in changelog:** Audit trail is more valuable than tidiness. Future devs reading the changelog see the full saga and its lessons.

### Validation
- `pnpm typecheck`: clean
- `pnpm lint`: clean
- Grep regressions: zero `bg-ink-blue` in flipped sections, zero `text-shadow-bold` consumers, zero `variant="dark-surface"` consumers, zero `surface="dark"` consumers.

### Files Changed
- 4 heroes: cinematic-hero, full-bleed-hero, watch-hero, coming-soon-hero
- 14 banners (all listed in pivot-7 plan.md)
- 5 mid sub-headers (our-channels, video-rail, subscribe-card, watch-library, shop-empty-state)
- 2 character: character-detail-hero, character-section
- 1 link: video-grid
- 4 button consumer instances (cinematic-hero, featured-pup-spotlight, watch-hero × 2)
- 3 page consumers (app/page.tsx, app/shop/page.tsx, app/top-picks/page.tsx)
- 1 atmosphere consumer (character-showcase if applicable)
- 4 reserved utility files (untouched in code; documented in code-standards.md)
- 2 docs (code-standards.md, project-changelog.md)
- 2 plan frontmatter updates

---
```

### 8. Update reverted plans' frontmatter

In `plans/260528-0525-hero-and-block-title-yellow-gold/plan.md`:
- Add `reverted_by: 260528-0814-pivot-7-revert-to-pivot-4-state` to frontmatter
- Top banner note: "**REVERTED by [pivot #7](../260528-0814-pivot-7-revert-to-pivot-4-state/plan.md) (2026-05-28 08:14)**"

In `plans/260528-0649-pivot-6-solid-yellow-design-decision/plan.md`:
- Same treatment

## Success Criteria

- [ ] `docs/code-standards.md` Hero contract restored (light surface, ink-blue kicker, gradient h1, ink-blue body)
- [ ] `docs/code-standards.md` Block title contract restored (light surface, gradient large h2, solid dark-gold mid, ink-blue card)
- [ ] `docs/code-standards.md` "Future pivot lock mechanism" REFINED with full-page-context rule
- [ ] `docs/code-standards.md` "Reserved utilities" section added documenting the 4 reserved items
- [ ] `docs/code-standards.md` Heading utilities table updated (most marked reserved)
- [ ] `docs/code-standards.md` Audit trail updated with pivot #7
- [ ] `docs/project-changelog.md` has pivot #7 entry at top
- [ ] Pivots #5 + #6 plan frontmatter marked with `reverted_by:`
- [ ] All 6 phases of pivot #7 plan checked complete

## Risk Assessment

- **Risk:** Lock mechanism refinement is too verbose / future devs ignore it. **Mitigation:** keep the section concise; bold the key rule ("MUST include full-page context"); list lessons numerically.
- **Risk:** Reserved utilities cause confusion (future dev cleans them up as dead code). **Mitigation:** explicit "Reserved utilities" section in code-standards.md; inline comments in the utility files themselves (optional follow-up).
- **Risk:** Pivot history table in code-standards.md grows unwieldy. **Mitigation:** if it crosses 10+ pivots, move audit trail to a dedicated `docs/pivots-history.md` and link from code-standards.
- **Risk:** Future dev reads `reverted_by:` frontmatter and assumes the plan was wrong. **Mitigation:** plans #5 and #6 were CORRECT executions of approved designs; the revert is a taste/visual change, not an implementation error. Frontmatter wording should reflect that ("reverted post-shipment due to design preference change, not implementation defect").
