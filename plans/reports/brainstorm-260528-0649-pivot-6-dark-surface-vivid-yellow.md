---
type: brainstorm
date: 2026-05-28 06:49
slug: pivot-6-dark-surface-vivid-yellow
status: design-approved
mockup: plans/260528-0649-pivot-6-solid-yellow-design-decision/mockups/comparison.html
restores: 260526-1913-hero-navy-surfaces-yellow-titles (Plan J)
---

# Pivot #6 — Dark Surface + Vivid Yellow Title Restoration (Option A)

## Problem statement

Pivot #6 in <72h. Mockup-validated decision: user picked **Option A** from `mockups/comparison.html` after seeing all 5 options rendered with real CSS + actual hex values. Hero + large section-banner surfaces become deep navy `#1a3a5c`; titles become solid bright yellow `#ffd70c`. This is essentially **Plan J restored** (pivot #1, 2026-05-26) — which was implemented then reverted for poorly-documented reasons in pivot #2.

## Why this pivot is different from #1-#5

Pivots 1-5 were text-described decisions. This is the **first mockup-validated decision**. User explicitly chose Option A AFTER seeing it rendered side-by-side against 4 alternatives including the current state. The lock mechanism (introduced pivot #5) just paid for itself.

## The root cause uncovered

User reported: *"The gradient renders too muted/dark in browser — looks more brown than yellow."*

This is a real visual problem the tiered system never solved:
- `.heading-gradient-gold-light` anchors at `#b8862e` (dark gold) on 0-25% and 75-100% of the gradient
- `#b8862e` reads as amber/bronze, not yellow
- Only the middle 50% hits brand yellow, which gets compressed visually
- Net read = "amber/brown gradient" not "royal yellow"

Solid bright yellow `#ffd70c` only reads as "royal yellow" on dark surfaces (AA-safe at ~9:1) or accepting catastrophic AA failure on light surfaces (~1.1:1). User picked the AA-safe path: change the surfaces.

## Pivot history (full audit trail)

| # | When | What | Status |
|---|---|---|---|
| 1 | 2026-05-26 (Plan J) | Navy hero surfaces + yellow titles + gold gradient utility | Shipped → reverted |
| 2 | 2026-05-26 (reversal) | Light surfaces + navy titles + gold kickers | Shipped |
| 3 | 2026-05-27 18:33 | Kicker→blue, h1→gradient | Plan only, superseded |
| 4 | 2026-05-28 05:25 | Kicker blue + hero/banner gradient + mid solid gold | Shipped 06:02 |
| 5 | 2026-05-28 06:18 | Mid solid gold → ink-blue revert + lock mechanism | Shipped 06:34 |
| 6 | **2026-05-28 06:49** | **Plan J restored: dark navy surfaces + solid yellow titles, mockup-validated** | This brainstorm |

## Requirements

| # | Requirement |
|---|---|
| R1 | Hero surfaces become `bg-ink-blue` (`#1a3a5c`) — all 5 hero components |
| R2 | Large h2 banner surfaces become `bg-ink-blue` — all 14 section-banner components |
| R3 | Hero kicker color = `text-brand-primary` (`#ffd70c`, vivid yellow) on navy — AA ~9:1 |
| R4 | Hero h1 + large h2 = solid `text-brand-primary` (no gradient) on navy — AA ~9:1 |
| R5 | Body / description text on dark surface = `text-white/85` or `text-brand-primary/80` |
| R6 | Mid h2/h3 sub-headers — currently `text-ink-blue` (pivot #5 just-shipped). They sit on body cyan bg which stays cyan. **No change to mid-tier.** |
| R7 | Card-level h3 — unchanged `text-ink-blue` on card surfaces (also unchanged) |
| R8 | Body page bg (`bg-paper` `#c6e7e9`) — stays cyan. Spaces between dark hero/banner sections remain airy |
| R9 | Atmospheric decoratives (paw-print pattern, dust particles, cloud-divider, character poses) on dark surfaces — color/opacity adjusted as needed |
| R10 | Button variants inside hero/banner sections — yellow CTA (`bg-brand-primary` + `text-ink-blue`) still works; "outline" variant may need lighter border |
| R11 | Code-standards.md hero color contract rewritten; lock-mechanism wording refined |
| R12 | Project changelog entry |

## Approaches evaluated

### A — Full surface flip (chosen via mockup) ✅
Hero + banner surfaces → navy. Solid yellow titles. AA-safe ~9:1. Vivid "royal yellow" read. Touches ~19 components + atmosphere overlays. Substantial scope but conceptually clean.

### B — Hybrid (Option E from mockups) ❌
Heroes navy, banners cyan. User explicitly picked A over E, so this is not chosen. Captured for record only.

### C — AA-failing solid yellow on cyan (Option D from mockups) ❌
Rejected explicitly. Lock mechanism + WCAG awareness prevented this path.

### D — Lighter gradient anchors ❌
Not in mockup set. Would have replaced dark-gold anchors with light yellow stops, but contrast would still fail on cyan. Out of scope.

## Final design (locked via mockup approval)

### 1. Hero components — surface + color flip

Apply to all 5 hero components:
- `components/home/full-bleed-hero.tsx`
- `components/home/cinematic-hero.tsx`
- `components/watch/watch-hero.tsx`
- `components/coming-soon/coming-soon-hero.tsx`
- `components/characters/character-detail-hero.tsx`

Changes per component:
- Section/container background → `bg-ink-blue` (replace existing `bg-paper`, `bg-surface`, glass blob, or theme gradient)
- Kicker `text-ink-blue` → `text-brand-primary`
- H1 `heading-gradient-gold-light` → `text-brand-primary`
- Body `text-ink-blue` / `text-ink-blue/85` → `text-white/85` or `text-brand-primary/80`
- Outline buttons on dark bg → use lighter border (`border-white/30` or `border-brand-primary/40`)

**Special cases:**
- `character-detail-hero.tsx` uses per-character `theme.heroGradient`. This conflicts with site-wide navy. Decision: override theme gradients on dark, OR keep themes (each pup gets their own colored hero). Defer to mockup-validated decision in next round.
- `full-bleed-hero.tsx` uses a glass-blob backdrop on banner imagery. The blob backdrop becomes `bg-ink-blue/85` instead of `bg-white/55`. Text inverts accordingly.

### 2. Large h2 banner components — surface + color flip

Apply to all 14 banner components:
- `components/home/menu-cards.tsx`, `feature-banner.tsx`, `character-showcase.tsx`, `featured-pup-spotlight.tsx`, `newsletter-cta.tsx`, `video-grid.tsx`
- `components/watch/explore-videos.tsx`, `playlist-grid.tsx`, `featured-video.tsx`
- `components/shop/explore-products.tsx`, `about-shop.tsx`
- `components/top-picks/top-picks-board.tsx`, `deal-block.tsx`
- `components/characters/character-section.tsx`

Changes per component:
- Section bg → `bg-ink-blue` (most currently default to no bg → inherit `--bg-base` cyan)
- Kicker (small uppercase eyebrow above h2) `text-brand-gold` → `text-brand-primary`
- H2 `heading-gradient-gold-light` → `text-brand-primary` solid
- Body text → `text-white/85`
- Cards inside the section that were on white/paper bg → may need padding adjustments but card bg STAYS light (cards are content surfaces, not section surfaces)

**Special cases:**
- `about-shop.tsx` has pillar cards on themed bgs (cream, warm-tan, peach). Cards stay light. The section bg behind them turns navy. Visual: navy section with light pillar cards inside. Pillar h3s stay `text-ink-blue` per pivot #4 reversion.
- `character-section.tsx` h2 sits on `theme.surfaceTint`. Same theme-vs-navy decision needed.
- `featured-pup-spotlight.tsx`, `feature-banner.tsx`, `newsletter-cta.tsx` may have hero-banner-like full-bleed treatments — confirm bg change makes sense or stays subtle.

### 3. Mid h2/h3 sub-headers — NO change

Pivot #5 just made these `text-ink-blue` on cyan body bg. They stay that way. They sit on the LIGHT body bg between dark hero/banner sections.
- `components/watch/our-channels.tsx`, `video-rail.tsx`, `subscribe-card.tsx`, `watch-library.tsx`
- `components/shop/shop-empty-state.tsx`

### 4. Card-level h3 — NO change

Stays `text-ink-blue` on card surfaces. Cards remain on their existing surfaces.

### 5. CSS utilities

- `.heading-gradient-gold-light` — no longer used. **Keep in globals.css** for future reuse (zero cost, fully tree-shakeable if Tailwind purges; otherwise just unused CSS). Add comment noting it's reserved.
- `.heading-gradient-gold` — same status, was already reserved.
- No new utility needed. Solid `text-brand-primary` Tailwind class handles everything.
- Optional: add `.text-shadow-warm-glow` to titles for premium-foil effect on dark surface (already exists in globals.css line 282-286).

### 6. Atmosphere / decoratives audit

These elements were designed for light surfaces. Review on dark:
- `components/ui/paw-print-pattern.tsx` — check if pattern color reads on navy; may need light variant
- `components/ui/cloud-divider.tsx` — separator between sections; need to check both-edge surfaces
- Character poses inside heroes — silhouettes/clear PNGs should be fine; verify rendering
- `components/motion/scroll-reveal.tsx` — no color, just animation; unaffected
- Newsletter / subscribe character pose decorations — verify against dark bg

**Decision:** spot-check during render verification. Don't pre-optimize; fix observed issues only (YAGNI).

### 7. Docs

**`docs/code-standards.md`:**
- Rewrite "Hero color contract" section with new dark-surface rules:
  - Surface: `bg-ink-blue` (#1a3a5c)
  - Kicker: `text-brand-primary` (#ffd70c, ~9:1 AA-safe)
  - H1: `text-brand-primary` solid (no gradient)
  - Body: `text-white/85`
- Rewrite "Block title color contract":
  - Large h2 section banners — surface `bg-ink-blue`, h2 `text-brand-primary` solid (large-text AA ~9:1)
  - Mid h2/h3 sub-headers — surface body cyan, h2 `text-ink-blue` (unchanged from pivot #5)
  - Card-level h3 — surface card-default, h3 `text-ink-blue` (unchanged)
- Refine lock-mechanism wording: "user MUST view mockup before approving design — text-only approvals do not satisfy the lock."
- Mark `.heading-gradient-gold-light` and `.heading-gradient-gold` as reserved (not currently used).
- Update audit trail with pivot #6.

**`docs/project-changelog.md`:**
- Pivot #6 entry documenting surface flip + scope + mockup-validation milestone.

**`plans/260526-1913-hero-navy-surfaces-yellow-titles/` (Plan J):**
- If still present, mark as "design pattern restored by pivot #6" with backref to this brainstorm. Otherwise add a journal note for historical clarity.

## Implementation considerations

| Item | Note |
|---|---|
| Build gate | `memory/build-verification-gate.md` — typecheck + lint + live render; no `pnpm build` during dev server. |
| Render verification | This change affects 19 components + atmosphere. Live render across 7 routes MANDATORY: `/`, `/shop`, `/watch`, `/characters`, `/characters/[slug]`, `/coming-soon/[slug]`, `/top-picks`. Spot-check 3 character themes. |
| Per-character themes | `character-detail-hero` uses `theme.heroGradient`. Decision needed: override themes with navy (lose per-pup color identity) OR keep themes (per-pup heroes don't match the new rule). Recommendation: KEEP themes — they're a deliberate brand element. Document the exception in code-standards. |
| `bg-paper` body bg | Stays cyan. Light body + dark sections = strong visual rhythm. |
| Body text contrast | `text-white/85` on `bg-ink-blue` = ~14:1, plenty AA-safe. `text-brand-primary/80` = ~7:1, also AA-safe. |
| Newsletter / subscribe layouts | Already have layout adjustments from pre-existing working-tree changes. Spot-check they still work on navy. |
| `.heading-gradient-gold-light` | Mark reserved, don't delete. Cost is one line of CSS. Future reuse possible if heroes ever go back to light bg. |
| Existing button variants | `variant="dark"` button uses `bg-navy` + `text-white` — on `bg-ink-blue` this works (navy on navy, but borders separate it). `variant="primary"` (yellow bg) works on dark. `variant="outline"` (light border) may need `border-white/30` variant on dark surfaces. |

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Plan J reversal cause repeats — heaviness / coldness on dark site | High | Mockup-validated this round (user picked A AFTER seeing rendered). Per-character themes stay (per-pup color preserved). Body bg stays cyan (airy intersections). |
| Atmospheric decoratives break on dark | Med | Spot-check during render; fix observed only. YAGNI on pre-optimization. |
| Per-character themed heroes conflict with site-wide navy | Med | Decision: KEEP themes as an exception. Document. If user later wants themes overridden, another mockup-validated swap. |
| Pivot #7 happens | High | Mockup-validated decisions are sticky. Add to code-standards: "Any pivot that overrides a mockup-validated decision requires a new mockup round." |
| `text-brand-gold` on remaining kickers (section eyebrow text above mid sub-headers) | Low | They sit on light body cyan, where dark gold is borderline AA. Outside this pivot's scope (mid-tier section bg doesn't change). Track for future audit. |
| Card surfaces inside dark sections create visual seams | Med | Cards explicitly stay light — desired visual effect (cozy cards floating on dark sections). Verify aesthetics during render. |
| `about-shop.tsx` pillar cards on dark section bg | Low | Pillar cards already have their own bg (`pillar.bg`). Just sit on dark section. Should look fine. |
| Outline button variants on dark | Low | Audit button.tsx variants during implementation; add a `dark-surface` variant if needed. |
| Cookie consent, mobile nav, back-to-top, footer | Low | None of these are inside hero/banner surfaces. Unchanged. |

## Success criteria

- All 5 heroes render with navy bg + bright yellow kicker + bright yellow h1 + light body text
- All 14 large h2 banners render with navy bg + bright yellow kicker + bright yellow h2 + light body
- Mid sub-headers (5 components) unchanged from pivot #5 (still ink-blue on cyan body bg)
- Card-level h3 unchanged
- `bg-paper` body bg unchanged (cyan)
- WCAG AA passes on all title elements (~9:1 on navy)
- `pnpm tsc --noEmit` + `pnpm lint` clean
- Live render across 7 routes shows no broken atmosphere
- 3 character themes spot-checked on `/characters/[slug]`
- `docs/code-standards.md` reflects new contract
- `docs/project-changelog.md` has pivot #6 entry

## Next steps

1. `/ck:plan` to scaffold implementation phases. Recommended phase split:
   - **Phase 1**: Hero surface flip (5 components)
   - **Phase 2**: Large banner surface flip (14 components)
   - **Phase 3**: Button variant audit + outline-on-dark fix if needed
   - **Phase 4**: Atmosphere decoratives spot-check + per-character theme decision
   - **Phase 5**: Render verification across 7 routes + 3 character themes
   - **Phase 6**: Docs sync (code-standards + changelog + lock mechanism refinement)
2. `/ck:cook --parallel` once plan approved.
3. `/ck:journal` after.

## Unresolved questions

- Per-character themed heroes: keep themes (per-pup color, exception to site rule) OR override with site-wide navy? **Proposed: keep themes.** If user disagrees, separate mockup round.
- `bg-paper` body bg: keep cyan or also flip to navy? **Proposed: keep cyan** — light intersections between dark sections preserve airiness.
- Buttons `variant="outline"` on dark surfaces: add a new variant OR override per-instance? **Proposed: audit during Phase 3, decide based on usage count.**
- Atmosphere decoratives (paw-print pattern, dust particles, cloud-divider): which ones break on navy? **Proposed: identify during Phase 4 render check; fix only observed issues.**
