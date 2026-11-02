# Brainstorm — SEO/AEO On-Page Remediation (Batch 2)

- **Date:** 2026-06-18
- **Branch:** `feat/seo-aeo-remediation`
- **Trigger:** Fresh SEO/AEO tool scan (homepage) listing duplicate-content, header, alt, anchor, canonical, backlink, freshness, and citation findings.
- **Relation to prior work:** Follows plan `260617-0458-seo-aeo-audit-remediation` (5 phases done, un-deployed) + reassessment `reassessment-260617-0713`. This batch covers findings the prior remediation **missed or did not include**.

---

## 1. Problem Statement

New scan flags ~17 items on the homepage. Investigation shows they split three ways:

- **Genuinely open & code-fixable** — not addressed by prior remediation.
- **AEO content** — one homepage citation decision.
- **Off-site / ops** — structurally impossible to fix in code.

Key insight: the **duplicate H1 + duplicate "Max, Rocky…" text** is a **real current bug**, not a stale-live-site artifact. `FullBleedHero` renders its `CardBody` (kicker + `<h1>` + description) **twice** in the DOM — mobile in-flow card (`md:hidden`) and desktop absolute blob (`hidden md:flex`). CSS hides one per breakpoint; CSS-blind crawlers count both. Prior remediation claimed "single h1" (semantic intent) but the responsive dual-render still emits two in raw HTML.

---

## 2. Finding Triage

### 🟢 Code-fixable, open
| Finding | Root cause | Fix |
|---|---|---|
| Duplicate H1 `Discover a happier world of puppies` | `FullBleedHero` dual-render of `CardBody` | Single-render `CardBody`; switch positioning via responsive Tailwind utils |
| Duplicate heading texts | same | same |
| 2 duplicate text blocks `Max, Rocky…` | same (description inside `CardBody`) | same |
| `X-Powered-By` header sent | `next.config.ts` lacks `poweredByHeader: false` | add one line |
| AEO `dateModified` missing | zero date fields in any JSON-LD | add `WebPage`/`WebSite` `dateModified` from build time |
| 8 images no `alt` | decorative/meaningful `<Image>` without `alt` | enumerate + add `alt` (`""` for decorative) |
| Anchor texts reused | repeated "Shop the Pack" etc. | diversify duplicated anchors |
| Internal anchors too long | overlong link text | shorten, preserve destination |

### 🟡 AEO content (decided)
| Finding | Decision |
|---|---|
| External citation links (2+) | **Science-backed note on homepage** near video section / FAQ, linking 2 credible sources (peer-reviewed research on music lowering canine stress). URLs confirmed at build. |

### 🔴 Off-site / ops — NOT code (checklist only)
| Finding | Reality | Owner |
|---|---|---|
| Canonical "points to a different page" | Known **D1** apex↔www host mismatch — canonical emits one host, site served on another | Ops/Dev: set `NEXT_PUBLIC_SITE_URL=https://www.scoutpaw.tv` in Vercel + apex→www 308 |
| Few links / 1 referring domain / 1 backlink / 1 IP | Off-site authority — digital PR | Marketing (P2 in reassessment) |
| Server clock set incorrectly | Host/infra; non-issue on Vercel | Ops: verify host `Date` header |

---

## 3. Chosen Approach

### Decisions locked (this session)
1. **Scope:** code fixes + ops checklist (document the 🔴 items, don't code them).
2. **Citations:** science-backed note on homepage.
3. **Freshness:** `dateModified` = build/deploy date.

### Fix design
1. **Hero dedup (core):** render `<CardBody>` once. One container, `relative` in-flow card on mobile, `md:absolute md:inset-0` overlay on desktop. Decorative blur/mask layers stay duplicated (`aria-hidden`, no text). Result: exactly one `<h1>` + one description in raw HTML. Then sweep sibling heroes (`watch-hero`, `character-detail-hero`, `coming-soon-hero`, `feature-banner`) for the same pattern; apply where present.
2. **Header:** `poweredByHeader: false` in `next.config.ts`.
3. **Freshness:** add `dateModified` (+ `datePublished`) to site JSON-LD, sourced from a build-time constant.
4. **Alt:** audit homepage `<Image>`/`<img>`, add `alt`.
5. **Anchors:** diversify/shorten homepage internal link text.
6. **Citations:** compact "Why calming works" note + 2 reputable outbound links.

### Validation
`pnpm typecheck` + `pnpm lint` + live render check (build-verification gate: skip full `pnpm build` while dev server runs). Confirm single `<h1>` via view-source. Visual parity check on hero after refactor.

---

## 4. Approaches Considered (hero dedup)

| Approach | Verdict |
|---|---|
| Single `CardBody` + responsive positioning utils | **Chosen** — KISS, one DOM copy, no JS |
| CSS portal / shared node across breakpoints | Rejected — overkill, fragile |
| Keep dual-render, mark one `aria-hidden` | Rejected — crawler still sees duplicate text |

---

## 5. Risks
- Hero refactor touches visual layout → mitigate with before/after render check.
- Exact 8 alt-less images + 2 citation URLs confirmed during implementation, not pre-guessed.
- Sibling-hero sweep may surface more layout work than the homepage alone.

---

## 6. Out of Scope
Commercial buildout, new pages, CMS schema, real-content `updatedAt` wiring — owned by the existing commercial-buildout plan.

---

## 7. Unresolved Questions
1. Final 2 citation source URLs (pick during build; need brand-acceptable, authoritative).
2. Confirm Vercel is the prod host (determines whether "server clock" finding is truly a non-issue).
3. Should the sibling-hero dedup ship in this batch or be a fast-follow if scope grows?
