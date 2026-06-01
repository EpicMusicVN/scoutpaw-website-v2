---
phase: 6
title: Docs Sync and Lock Mechanism Refinement
status: completed
priority: P2
effort: 30m
dependencies:
  - 5
---

# Phase 6: Docs Sync and Lock Mechanism Refinement

## Overview

Major rewrite of `docs/code-standards.md` to reflect the dark-surface contract (pivot #6 overturns the light-surface assumptions from pivots #2-#5). Append pivot #6 changelog entry. Refine lock-mechanism wording: **user MUST view rendered mockup before approving design — text-only approvals do not satisfy the lock.** That refinement is the most important deliverable of this phase because it captures the lesson learned: pivots #4 and #5 happened because the design was approved via text, not pixels.

## Requirements

- Functional: docs accurately reflect the new dark-surface contract. Future PRs / future-self enforce the contract.
- Non-functional: explicit refinement of lock mechanism — distinguishes "design approved via text description" (insufficient) from "design approved via rendered mockup view" (sufficient).

## Architecture

`code-standards.md` currently describes light-surface heroes + tiered block titles (post pivot #5). After pivot #6:
- Hero contract: dark surface + yellow kicker + yellow h1 + light body
- Block title contract: large h2 → dark surface + yellow h2 (same treatment); mid h2/h3 → ink-blue on cyan body (pivot #5 unchanged); card h3 → ink-blue (unchanged)
- Lock mechanism: refined wording around "mockup-first" semantics
- Audit trail: 6 pivots in <72h documented

`project-changelog.md` gets a new dated entry — most substantial of any pivot.

## Related Code Files

- Modify: `docs/code-standards.md`
- Modify: `docs/project-changelog.md`

## Implementation Steps

### 1. Rewrite `docs/code-standards.md` — Hero color contract

Replace the "Hero color contract" section with:

```markdown
### Hero color contract (current, post Plan 260528-0649 pivot #6)

All hero banners use:
- **Surface**: `bg-ink-blue` (deep navy `#1a3a5c`) — dark band against the cyan body bg
- **Kicker** (e.g. "SCOUTPAW TV", "Coming Soon"): `text-brand-primary` (vivid yellow `#ffd70c`) — AA ~9:1
- **Title (h1)**: solid `text-brand-primary` (no gradient) — AA ~9:1, optional `.text-shadow-bold` for premium-foil lift
- **Body / description**: `text-white/85` (~14:1 AA-safe)

Exception: per-character `character-detail-hero.tsx` keeps `theme.heroGradient`. Each character's `titleColor` field (see `lib/content/character-themes.ts`) determines h1 color per theme.

This contract applies to: `CinematicHero`, `FullBleedHero`, `WatchHero`, `ComingSoonHero`. `CharacterDetailHero` follows per-character theme rules.
```

### 2. Rewrite `docs/code-standards.md` — Block title color contract

Replace with:

```markdown
### Block title color contract (current, post Plan 260528-0649 pivot #6)

Tiered system:
- **Large h2 section banners** (≥`text-4xl`) — surface `bg-ink-blue`, kicker + h2 `text-brand-primary` solid (AA ~9:1), body `text-white/85`. Applied to 14 components.
- **Mid h2/h3 sub-headers** (`text-2xl`/`text-3xl` base on cyan body bg) — `text-ink-blue` (deep navy, ~6:1 on cyan). Applied to 5 components: `our-channels`, `video-rail`, `subscribe-card`, `watch-library`, `shop-empty-state`.
- **Card-level h3 titles** (product/video/character names, card-level icon labels) — `text-ink-blue` on card surfaces (UNCHANGED across all pivots).

Exception: `character-section.tsx` keeps `theme.surfaceTint` with per-character titleColor per Phase 4 decision.

**Forbidden**: pure `text-brand-primary` on cyan/white/cream surfaces — physics ban remains (`#ffd70c` on `#c6e7e9` = ~1.1:1, catastrophic AA fail). If brand yellow is required on text, surface MUST be navy / ink-blue.
```

### 3. REFINE the "Future pivot lock mechanism" section

Replace with:

```markdown
### Future pivot lock mechanism (refined post pivot #6, 2026-05-28 07:00)

**Rule:** Any future swap of hero / banner / title color OR surface tokens MUST go through mockup-first review BEFORE code changes. Mockup approval is **not** complete until the user has **viewed the rendered pixels** — text-only approvals do not satisfy the lock.

**Threshold:**
- Change spans >5 components OR introduces new color tokens OR changes surface bg → mockup pipeline (see below) → user views rendered mockup → user approves specific option → implementation locks to that option
- Change spans ≤5 components, no new tokens, no surface change → render in git worktree + screenshot for approval

**Mockup pipeline:**
- For typography/color decisions: standalone HTML + CSS mockup file with real hex values (NOT ai-multimodal image gen — AI image gen cannot render text faithfully)
- For larger structural/layout decisions: ai-multimodal mockups OR Figma reference OR sandbox dev-server render

**Why this matters (lesson from pivots #1-#6 in <72h):**
Pivots #4 and #5 happened because designs were approved via text descriptions. User saw the rendered result post-shipment and requested changes. Pivot #6 was the first mockup-validated decision — user viewed all 5 options before picking, and the result is expected to stick.

**Audit trail of the 6 pivots:**
1. 2026-05-26 (Plan J) — navy hero + yellow titles (shipped → reverted, undocumented)
2. 2026-05-26 (reversal) — light surfaces + navy titles + gold kickers
3. 2026-05-27 18:33 — kicker→blue + h1→gradient (planned, superseded)
4. 2026-05-28 05:25 — kicker blue + hero/banner gradient + mid solid gold + card unchanged
5. 2026-05-28 06:18 — mid solid gold → ink-blue revert + lock mechanism introduced
6. 2026-05-28 06:49 — mockup-validated restoration of pivot #1's design pattern (this entry)

**Pivot #7 protocol:** If a pivot #7 is requested, brainstorm must refuse to design until either (a) a new mockup-validated decision exists OR (b) the user explicitly waives the lock with acknowledgement of the cumulative cost.
```

### 4. Update Heading utilities table

Mark `.heading-gradient-gold-light` as RESERVED (no longer consumed but kept in globals.css). Mark `.heading-gradient-gold` likewise (was reserved already). Add note that `text-shadow-bold` pairs with solid `text-brand-primary` on `bg-ink-blue` for premium effect.

### 5. Update Audit summary

Add a row for Plan 260528-0649: "Surface flip to dark navy across all hero + large banner sections. Tier rules: large h2 navy/yellow, mid sub-header cyan/ink-blue, card-level h3 unchanged."

### 6. Append `docs/project-changelog.md` entry

Top of file, new dated entry:

```markdown
## [2026-05-28] - Pivot #6 — Dark Navy Surface + Vivid Yellow Title Restoration

### Overview
**The first mockup-validated pivot in the 6-pivot title-color saga.** User viewed 5 rendered HTML mockups in `plans/260528-0649-pivot-6-solid-yellow-design-decision/mockups/comparison.html` and explicitly selected Option A (dark navy surface + solid bright yellow titles). Restores Plan J's design pattern (260526-1913, shipped then reverted via undocumented direct edits in pivot #2) with explicit audit trail.

### Changes

**Hero components (5 files):** surface → `bg-ink-blue`; kicker + h1 → solid `text-brand-primary`; body → `text-white/85`.

**Large h2 banner components (14 files):** same treatment — surface → `bg-ink-blue`; kicker + h2 → solid `text-brand-primary`; body → `text-white/85`.

**Mid h2/h3 sub-headers (5 files):** UNCHANGED (still `text-ink-blue` on cyan body bg per pivot #5).

**Card-level h3 titles:** UNCHANGED (`text-ink-blue` across all pivots).

**Body page bg `bg-paper`:** UNCHANGED (cyan `#c6e7e9` — light intersections between dark sections preserve airiness).

**Button variants:** Added `dark-surface` variant in `components/ui/button.tsx` (transparent bg + light border + light text) for use on flipped surfaces. Outline-variant instances inside flipped surfaces swapped to `dark-surface`.

**Per-character themes:** `character-detail-hero.tsx` and `character-section.tsx` keep `theme.heroGradient` / `theme.surfaceTint`. Per-theme `titleColor` decisions in `lib/content/character-themes.ts`.

**Atmosphere decoratives:** Audited for navy-bg readability. `paw-print-pattern.tsx` gained a `tone` prop. `cloud-divider.tsx` placement reviewed.

**CSS utilities:** `.heading-gradient-gold-light` marked RESERVED (no consumers). `.heading-gradient-gold` marked RESERVED. `text-shadow-bold` now applied to hero h1 + large banner h2 for premium-foil lift.

**Docs:**
- `docs/code-standards.md` — Hero contract rewritten, Block title contract updated, Lock mechanism refined with mandatory rendered-mockup-view rule, Audit trail updated with all 6 pivots.

### Design Rationale
- **Mockup-validated decision:** First pivot in this saga where user saw rendered options before approval. Result expected to stick.
- **Plan J pattern restored:** Original 2026-05-26 design restored after 5 pivots that text-only requests failed to lock. The lesson: solid bright yellow on light cyan is a physics problem; the fix is surface, not text color.
- **Body bg stays cyan:** Light intersections between dark sections create visual rhythm. Airy + cozy character preserved.
- **Per-character themes preserved:** Per-pup color identity is a deliberate brand element. Per-theme `titleColor` allows individual contrast tuning without abandoning theme system.
- **Lock mechanism refined:** Future pivots require mockup VIEW (not just mockup creation). Pivots #4 and #5 happened because designs were text-approved.

### Validation
- `pnpm tsc --noEmit`: clean
- `pnpm lint`: clean
- Live render across 7 routes verified.
- 3 character themes spot-checked.
- WCAG AA: `#ffd70c` on `#1a3a5c` ~9:1 (passes everywhere).

### Files Changed
- Hero (5): `cinematic-hero.tsx`, `full-bleed-hero.tsx`, `watch-hero.tsx`, `coming-soon-hero.tsx`, `character-detail-hero.tsx`
- Banners (14): all home/watch/shop/top-picks/characters section components
- Buttons: `components/ui/button.tsx`
- Atmosphere (conditional): `paw-print-pattern.tsx`, `cloud-divider.tsx`, character themes file
- Docs: `docs/code-standards.md`, `docs/project-changelog.md`

---

## [2026-05-28] - Mid-Tier Subtitle Revert (Pivot #5) + Lock Mechanism
```

### 7. Validate the rewrites

After both files are saved:
1. Run `pnpm tsc --noEmit` (no impact — docs are markdown)
2. Visually scan code-standards.md and changelog for grammar / formatting
3. Verify the lock-mechanism wording change is prominent (this is the most important deliverable)
4. Confirm the supersession note + Plan J reference reads correctly

## Success Criteria

- [ ] `docs/code-standards.md` Hero contract rewritten with dark-surface rules
- [ ] `docs/code-standards.md` Block title contract updated reflecting pivot #6
- [ ] `docs/code-standards.md` "Future pivot lock mechanism" refined with mandatory-render-view rule + Pivot #7 protocol
- [ ] `docs/code-standards.md` Heading utilities marked as reserved where applicable
- [ ] `docs/code-standards.md` Audit summary has pivot #6 row
- [ ] `docs/project-changelog.md` has pivot #6 entry at top with full audit trail
- [ ] All 6 phases checked complete via `ck plan check`
- [ ] Plan status auto-rolls to `done`
- [ ] No stray `text-navy` on hero/h1 OR `heading-gradient-gold-light` on banner h2 anywhere in `components/`

## Risk Assessment

- **Risk:** Refined lock-mechanism wording isn't strict enough to prevent pivot #7. **Mitigation:** Explicit Pivot #7 protocol included — brainstorm must refuse text-only requests on these tokens until a new mockup round completes.
- **Risk:** Future devs unfamiliar with the saga read the lock rule and think it's bureaucracy. **Mitigation:** Audit trail of 6 pivots with timestamps in the same section provides empirical justification.
- **Risk:** code-standards.md grows past readability threshold. **Mitigation:** older pivot history can be condensed to a one-line note pointing to the changelog if file gets too long.
- **Risk:** Plan J's reversal cause was never documented; this changelog entry acknowledges the gap but doesn't recover the lost context. **Mitigation:** explicit note in changelog ("undocumented" cause for original reversal); rely on mockup-validation to override the unknown prior reasoning.
