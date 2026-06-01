---
phase: 2
title: "Hero Component Swaps"
status: pending
priority: P1
effort: "30m"
dependencies: [1]
---

# Phase 2: Hero Component Swaps

## Overview

Apply the kicker + title color swap across all 5 hero components. Pure className edits — no logic, no layout changes.

## Requirements

- **Functional:** Every hero kicker renders in `text-ink-blue`
- **Functional:** Every hero H1 renders via `heading-gradient-gold-light` (with `font-display` etc. preserved)
- **Functional:** CharacterDetailHero breed kicker opacity bumped to full (`text-ink-blue/65` → `text-ink-blue`) to match site-wide kicker treatment
- **Non-functional:** No new imports, no API changes, no prop additions
- **Non-functional:** Each edit is a single-line className change

## Architecture

Each hero shares the same structural pattern:

```
<p className="font-display ... uppercase tracking-... text-brand-gold">{kicker}</p>
<h1 className="... font-display ... text-navy">{title}</h1>
```

Becomes:

```
<p className="font-display ... uppercase tracking-... text-ink-blue">{kicker}</p>
<h1 className="... font-display ... heading-gradient-gold-light">{title}</h1>
```

`heading-gradient-gold-light` replaces the `text-navy` color entirely; gradient util drives fill via `color: transparent`.

## Related Code Files

- Modify: `components/home/full-bleed-hero.tsx`
- Modify: `components/watch/watch-hero.tsx`
- Modify: `components/coming-soon/coming-soon-hero.tsx`
- Modify: `components/characters/character-detail-hero.tsx`
- Audit + modify if applicable: `components/home/cinematic-hero.tsx`

## Implementation Steps

### 1. `components/home/full-bleed-hero.tsx`

| Line | Current | Replace with |
|---|---|---|
| 28 | `text-brand-gold` | `text-ink-blue` |
| 31 | `text-navy` | `heading-gradient-gold-light` |

Powers Home + Shop + Characters list + Top Picks (4 routes via reuse).

### 2. `components/watch/watch-hero.tsx`

| Line | Current | Replace with |
|---|---|---|
| 113 | `text-brand-gold` | `text-ink-blue` |
| 116 | `text-navy` | `heading-gradient-gold-light` |

### 3. `components/coming-soon/coming-soon-hero.tsx`

| Line | Current | Replace with |
|---|---|---|
| 24 | `text-brand-gold` | `text-ink-blue` |
| 27 | `text-navy` | `heading-gradient-gold-light` |

### 4. `components/characters/character-detail-hero.tsx`

| Line | Current | Replace with |
|---|---|---|
| 39 | `text-ink-blue/65` | `text-ink-blue` |
| 42 | `text-navy` | `heading-gradient-gold-light` |

Note: breed kicker was already blue (light opacity). Bump opacity for consistency with site-wide kicker contrast.

### 5. Audit `components/home/cinematic-hero.tsx`

- Read file
- If it contains the kicker (`text-brand-gold`) + title (`text-navy`) pattern → apply same swap
- If it uses different tokens (e.g. is wired for navy bg with white text) → skip and note in commit message
- Decision rule: any element acting as a hero eyebrow/kicker should become `text-ink-blue`; any hero H1 should become `heading-gradient-gold-light`

### 6. Verify

- `pnpm typecheck` — no TS errors (className changes are string literals; should be clean)
- `pnpm lint` — no lint errors
- Do NOT run `pnpm build` while dev server is running (per build-verification-gate memory)

## Success Criteria

- [ ] All 5 hero files edited (cinematic-hero conditional on audit outcome)
- [ ] Grep `text-brand-gold` shows zero matches in `components/**/*hero*.tsx`
- [ ] Grep `text-navy` shows zero matches in hero H1s (`text-navy` may still appear in non-H1 contexts — verify case-by-case)
- [ ] Grep `heading-gradient-gold-light` shows 4-5 matches across hero components
- [ ] Typecheck + lint pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| `text-navy` appears in non-title contexts in hero files (e.g. badges) | Use line-anchored edits, not `replace_all`. Review each hit before swap. |
| `cinematic-hero.tsx` has a different pattern requiring custom handling | Audit step gates the edit. If unclear, halt + report rather than guessing. |
| Tailwind doesn't see `heading-gradient-gold-light` and purges it | Class is a regular CSS class (not Tailwind-generated). PostCSS preserves it; Tailwind purge doesn't apply to non-Tailwind classes. Safe. |
| Hot-reload doesn't pick up gradient | Dev server picks up `globals.css` changes; if stale, manual page reload. |
