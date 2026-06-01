# Code Standards

This document captures cross-cutting standards for the ScoutPaw v2 codebase. Reviewers MUST check PRs against these rules.

## Surface → Text Color Contract

This is a hard contract. All PRs must comply. The rules below were established across Plans A, D, G, J of the styling rebuild (May 2026).

### Compliant pairings

| Surface bg | Heading | Body | Example consumer |
|---|---|---|---|
| Light: white / `bg-surface` / cyan (`bg-paper`) / cream / warm-tan / themed `surfaceTint` | `text-navy` on h2; `heading-gradient-tri` h1 (3-stop navy→yellow→white) | `text-ink-blue` (deep navy `#1a3a5c`) | Default for cards, content sections, character page scenes |
| Yellow: `bg-brand-primary` (full or alpha), yellow gradients | `text-ink-blue` (preferred) or `text-navy` | `text-ink-blue` | Primary buttons, brand pills, badges, video category labels |
| Deep navy: `bg-ink-blue` (full or alpha) | `heading-gradient-gold` + `text-shadow-bold` (h1) or `text-brand-primary` (kicker) | `text-white/85` or `text-brand-primary/80` | Reserved for future dark-surface usage. NOT currently applied to heroes — see Plan J reversal entry in changelog. |
| Brand navy: `bg-navy` (`#397fc5` mid blue) | `text-white` | `text-white/90` (large only — body text needs careful sizing) | Footer wrapper, skip-link, subscribe-card YouTube button, menu-cards CTA pill, button `dark` variant |
| Dark anchor: `bg-ink` (full or alpha) | n/a (button or badge only) | `text-surface` (white) or `text-cream` | Newsletter submit button, dark CTA badges, video duration pills, cookie banner |

### Forbidden combinations (WCAG AA violations)

- **Yellow text on cyan / white / cream surfaces** — ~1.4:1 contrast, FAILS AA at any size. This is a physics problem, not a preference. Solve by changing the surface, not by adding shadow.
- **Blue text on navy / blue surfaces** — too close in hue and luminance. FAILS AA.
- **Brown ink on warm-tan** — borderline (~3:1). Use `text-ink-blue` (deep navy) instead — it's the body default for all light surfaces.

### Acceptable exceptions

- **Per-character themed accents on `surfaceTint`** — e.g., `text-brand-gold` accent in stories, or `style={{ color: character.accentColor }}` on the per-character themed surface. AA must still be respected per-character (verify each accentColor against the surfaceTint behind it).
- **Skip-links and focus-only elements** — `text-white` on `bg-navy` at small text is ~4:1 (technically fails body AA). Skip-links are shown only on Tab focus and used by screen-reader / keyboard users who tab through. Practical exception with explicit acknowledgment.

### Tokens

| Token | Hex | Purpose | Tailwind |
|---|---|---|---|
| `--ink-blue` | `#1a3a5c` | Deep navy — body text on light bg, hero container bg | `text-ink-blue`, `bg-ink-blue` |
| `--bg-navy` | `#397fc5` | Brand mid-blue — footer wrapper, dark variant button, brand surfaces | `bg-navy`, `text-navy` |
| `--brand-primary` | `#ffd70c` | Brand yellow — CTAs, brand pills, hero kickers on dark | `bg-brand-primary`, `text-brand-primary` |
| `--ink` | `#2b1d10` | Dark anchor — buttons, form borders, focus rings | `bg-ink`, `border-ink`, `ring-ink` |
| `--accent-gold-dark` | `#b8862e` | Dark gold — used as start of `heading-gradient-gold` | `text-brand-gold` |
| Surface | `#ffffff` | White cards | `bg-surface`, `text-surface` |
| Paper / bg-base | `#c6e7e9` | Soft cyan page background | `bg-paper` |

### Heading utilities

| Class | When to use |
|---|---|
| `text-navy` (h1 + h2 on light bg) | Default section heading on light surfaces. AA-safe for large text (text-3xl+) on white/cream/cyan/warm-tan. |
| `text-brand-gold` (mid h2/h3 sub-headers) | Solid dark gold (`#b8862e`). Used on mid-tier headings (text-2xl/text-3xl) like sub-section titles, channel headers. AA-safe body size contrast on light surfaces (~4.5:1). Pivot #8 kept this rule — only large h2 banner kickers were swapped to cobalt; the mid sub-header h2/h3 fill stays dark gold. |
| `text-cobalt` (hero + large-banner kickers, post pivot #8) | Saturated cobalt `#1f4d96`. New token introduced by pivot #8. Replaces `text-brand-gold` and `text-ink-blue` for kicker-only contexts (small uppercase tracked text above hero h1 + large h2 banners). Card-internal kickers retain the `text-ink-blue/70` family per locked rule. |
| `text-ink-blue` (body, card-internal kickers) | Deep navy `#1a3a5c`. Used for body text, card titles, and card-internal kickers (with `/70` opacity). NOT used for hero / banner kickers post pivot #8. |
| `.heading-sticker-honey` | **ACTIVE (pivot #8)** — solid honey-yellow fill with cobalt text-stroke + slight cobalt drop-shadow. Sticker-pop treatment for hero h1s + large h2 banner titles on the cyan body bg. AA-legible via the outline (~10:1 effective contrast). Em-sized stroke + shadow scale with heading font-size. 19 consumers. |
| `.heading-gradient-gold-light` | **RETIRED (pivot #8)** — was the gradient-gold utility that pivot #8 replaced. Removed from `globals.css`. Historical name preserved in comments for grep-ability. |
| `heading-gradient-gold` | **RESERVED** — no current consumers. Dark-surface variant for future. |
| `heading-gradient-tri` / `-cool` / `-warm` | **RESERVED** — no current consumers. |
| `text-shadow-bold` | **RESERVED** — no current consumers (was used pivot #6, removed pivot #7). |
| `text-shadow-soft` / `text-shadow-warm-glow` | Available; spot consumers in atmospheric heroes. |

### Reserved utilities (no current consumers — kept for future reuse)

The following utilities have NO active consumers post-pivot-#7 but are kept in the codebase as low-cost infrastructure for potential future use:

| Asset | Location | Reason kept |
|---|---|---|
| `dark-surface` button variant | `components/ui/button.tsx` | Transparent bg + light border + light text. Suitable when dark-surface designs return. |
| `tone: "light" \| "dark"` prop | `components/ui/paw-print-pattern.tsx` | Switches stamp color for dark-surface usage. Default "light" matches all current consumers. |
| `surface: "light" \| "dark"` prop | `components/ui/cloud-divider.tsx` | Mutes cloud opacity on dark-to-dark transitions. Default "light" matches all current consumers. |
| `titleColor: "yellow" \| "ink-blue"` field | `lib/content/character-themes.ts` | Per-character h1 color override for themed surfaces. Currently unused; characters default. |

These are NOT dead code — they are reserved infrastructure. Do not remove without a separate plan documenting the cleanup decision.

### Hero color contract (current, post pivot #8 — sticker-honey on light cyan)

All hero banners use:
- **Surface**: light — `bg-paper` body cyan / `bg-surface` white / themed gradient (unchanged from pivot #7)
- **Kicker** (e.g. "SCOUTPAW TV", "Coming Soon"): `text-cobalt` (saturated cobalt `#1f4d96`) — ~7:1 AA on cyan
- **Title (h1)**: `.heading-sticker-honey` — solid honey fill (`#ffd70c`) with `0.04em` cobalt stroke + slight cobalt drop-shadow. Sticker-pop treatment.
- **Body / description**: `text-ink-blue` or `text-ink-blue/85` (unchanged)

Exception: `character-detail-hero.tsx` keeps `theme.heroGradient` per-character. h1 still uses `.heading-sticker-honey` regardless of theme — the cobalt outline carries contrast on any pastel theme surface.

This contract applies to: `CinematicHero`, `FullBleedHero`, `WatchHero`, `ComingSoonHero`, `CharacterDetailHero`.

History note: pivot #6 (2026-05-28) tried `bg-ink-blue` surface + solid `text-brand-primary` titles. User viewed live result and reverted (pivot #7 restored pivot #4 gradient state). Pivot #8 (this iteration) takes a different route — keeps the light cyan body bg of pivot #7 but solves the "yellow on cyan = AA fail" problem with a cobalt outline rather than a surface flip. See pivot #8 entry in the audit trail below.

### Block title color contract (current, post pivot #8)

Tiered system:
- **Large h2 section banners** (≥`text-4xl`) — surface light (cyan body bg), kicker `text-cobalt` (post pivot #8; was `text-brand-gold` pivot #7), h2 `.heading-sticker-honey` (was `.heading-gradient-gold-light` pivot #7). Applied to 14 components. Card-internal kicker exception (`text-ink-blue/70`) preserved for `feature-banner` + `featured-pup-spotlight` + `deal-block` because those h2s sit on card surfaces, not on the page body bg.
- **Mid h2/h3 sub-headers** (`text-2xl`/`text-3xl` base on cyan body bg) — `text-brand-gold` (#b8862e solid dark gold). **UNCHANGED by pivot #8** — applies to 5 components: `our-channels`, `video-rail`, `subscribe-card`, `watch-library`, `shop-empty-state`. Their kickers (where present) DID flip to `text-cobalt` for consistency; only the mid-h2/h3 fill stays gold.
- **Card-level h3 titles** (product/video/character names, card-level icon labels) — `text-ink-blue` on card surfaces. UNCHANGED across all 8 pivots.

Exception: `character-section.tsx` keeps `theme.surfaceTint` per-character. h2 uses `.heading-sticker-honey` regardless — the cobalt outline carries contrast on all theme surfaces.

**Important note on inner-card text colors:** Decorative cards inside large h2 banner sections keep their dark text. See `feature-banner.tsx:52`, `featured-pup-spotlight.tsx:36`, `deal-block.tsx:42`.

**Forbidden**: pure `text-brand-primary` on cyan/white/cream surfaces WITHOUT a stroke or surface anchor — physics ban (`#ffd70c` on `#c6e7e9` = ~1.1:1, catastrophic AA fail). Pivot #8 solves this for landmark titles by adding the cobalt outline (`.heading-sticker-honey`). Free-standing `text-brand-primary` body or button text on cyan is still forbidden.

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

**Audit trail of the 8 pivots:**
1. 2026-05-26 (Plan J) — navy hero + yellow titles (shipped → reverted undocumented)
2. 2026-05-26 (reversal) — light surfaces + navy titles + gold kickers
3. 2026-05-27 18:33 — kicker→blue + h1→gradient (planned, superseded)
4. 2026-05-28 05:25 — kicker blue + hero/banner gradient + mid solid gold + card unchanged (target state of current site)
5. 2026-05-28 06:18 — mid solid gold → ink-blue revert + lock mechanism introduced (REVERTED by pivot #7)
6. 2026-05-28 06:49 — dark navy surfaces + solid yellow, mockup-validated (REVERTED by pivot #7 after user viewed live)
7. 2026-05-28 08:14 — revert #5 + #6, refine lock mechanism with full-page-context rule
8. 2026-06-01 07:58 — **pivot #8 shipped via lock mechanism (mockup v3 D3).** Light cyan body bg kept. Hero h1 + large h2 banners switched from `.heading-gradient-gold-light` to new `.heading-sticker-honey` utility — solid honey-yellow fill (`#ffd70c`) with em-sized cobalt (`#1f4d96`) text-stroke + slight cobalt drop-shadow. All hero + banner kickers switched from `text-brand-gold` / `text-ink-blue` to new `text-cobalt` token (same `#1f4d96`). Card-internal titles + mid h2/h3 sub-headers UNCHANGED. Validated via mockup v3 with full-page context per lock rule.

**Pivot #8 outcome:** the lock mechanism worked as designed this round. User saw 2 prior mockups (v1, v2), rejected both with specific feedback, and v3 (Bluey-vibe brief) landed on D3. Total mockup iterations: 3. No code touched until variant locked.

**Pivot #9 protocol:** Lock mechanism is now considered proven. Future pivots still require full-page-context mockup-first review BEFORE code. If a pivot #9 is requested within 14 days of pivot #8 ship date, brainstorm should additionally surface "cumulative pivot cost" — total hours spent on color iterations across 8 pivots — and ask the user to commit to a freeze period.

### Audit summary (Plan K, 2026-05-26; updated Plan 260528-0649; refined Plan 260528-0814)

All `bg-brand-primary`, `bg-navy`, `bg-ink-blue`, `bg-ink` consumers were swept against this contract. **No violations found** — Plan D's body sweep (44 files, brown ink → ink-blue) and Plan J's hero conversion (light → dark surface for hero containers) already covered the cases.

**Plan 260528-0525** swept all hero h1s + large h2 banners + mid h2/h3 sub-headers into the tiered system. Card-level h3s remained `text-ink-blue` per WCAG AA strict.

**Plan 260528-0649 (pivot #6)** flipped hero and large h2 banner surfaces to `bg-ink-blue` with `text-brand-primary` solid titles + `text-white/85` bodies. Crucially, **inner decorative cards retain dark text** (example: `feature-banner.tsx:52` h2 = `text-ink-blue` on its own inner light gradient card, even though the section behind it is `bg-ink-blue`). This nested-contrast rule preserves readability across layered surfaces.

**Plan 260528-0814 (pivot #7)** reverted pivots #5 and #6 after user viewed live full-page render. Hero + large h2 banner surfaces returned to light (`bg-paper` / `bg-surface`); kickers + h1 titles reverted to `.heading-gradient-gold-light` gradient + ink-blue kickers. Mid h2/h3 returned to solid `text-brand-gold`. Lock mechanism refined with critical **"full-page-context mockup"** rule. Reserved utilities documented.

**Plan 260601-0758 (pivot #8)** introduced the `.heading-sticker-honey` utility + `--cobalt` token. Hero h1 + large h2 banners across 19 components flipped from gradient gold to sticker-honey (yellow fill + cobalt outline + cobalt drop-shadow). Hero + banner kickers flipped to `text-cobalt`. Card-internal titles, mid h2/h3 sub-headers, and body text UNCHANGED. Validated via 3-round mockup pipeline (v1 blue/yellow exploration → v2 broader brand palette exploration → v3 Bluey-vibe playful kids brand) with D3 selected. Lock mechanism worked as designed.

Notable consumers verified:
- All 11 `bg-brand-primary` usages pair with `text-ink-blue`
- All 5 `bg-navy` usages use white text (skip-link, subscribe button, menu pill, footer wrapper, button dark variant)
- All `bg-ink-blue` usages — **0 post-pivot #7 revert** (dark-surface experiment ended; reserved utilities documented)
- All `bg-ink` usages (buttons, badges, banners) pair with `text-surface` or `text-cream`
- `.heading-gradient-gold-light` — 19 active consumers (5 hero h1s + 14 large h2 banners)

Future PRs MUST be checked against this contract. If a violation is intentional (e.g., a new themed surface), document the exception inline and verify AA contrast.
