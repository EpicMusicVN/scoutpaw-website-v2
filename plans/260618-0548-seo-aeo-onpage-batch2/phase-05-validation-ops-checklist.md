---
phase: 5
title: Validation & Ops Checklist
status: completed
priority: P1
effort: 1-2h
dependencies:
  - 1
  - 2
  - 3
  - 4
---

# Phase 5: Validation & Ops Checklist

## Overview
Validate all code fixes from Phases 1–4 against the build-verification gate, and produce an
ops/off-site checklist for the findings that cannot be fixed in code.

## Requirements
- Functional: typecheck + lint pass; live render confirms each fix; ops checklist doc exists.
- Non-functional: no `pnpm build` while a dev server runs (memory `build-verification-gate`).

## Architecture
**Validation** uses the project's gate: `pnpm typecheck` + `pnpm lint` + live render
(`next start` + curl/view-source). Validate structured data in Google Rich Results test.

**Ops checklist** documents the 🔴 non-code findings so they aren't lost. Save as
`ops-offsite-checklist.md` in this plan dir (or append to the existing
`260611-0509-.../ops-prep-checklist.md` if the user prefers a single ops doc — confirm).

## Related Code Files
- Create: `plans/260618-0548-seo-aeo-onpage-batch2/ops-offsite-checklist.md`
- No source changes (validation only).

## Implementation Steps
1. `pnpm typecheck` → 0 errors.
2. `pnpm lint` → clean.
3. `next start` + curl/view-source the homepage; confirm:
   - exactly one `<h1>` and one `Max, Rocky…` string (Phase 1)
   - no `X-Powered-By` header via `curl -I` (Phase 2)
   - recent `dateModified` in JSON-LD (Phase 2)
   - no meaningful image missing alt; clean anchors (Phase 3)
   - ≥2 outbound external citation links (Phase 4)
4. Validate JSON-LD in Google Rich Results.
5. Write the ops/off-site checklist (below).
6. (Optional) `code-reviewer` pass on the diff.

## Ops / Off-Site Checklist (NOT code — for Ops/Marketing)
- [ ] **Canonical host mismatch (D1):** the "canonical points to a different page" finding =
      apex↔www mismatch. Set `NEXT_PUBLIC_SITE_URL=https://www.scoutpaw.tv` in Vercel and add an
      apex→www **308** redirect so canonical/sitemap/OG all agree on the www host.
- [ ] **Backlinks / authority:** findings (few links, 1 referring domain, 1 backlink, 1 IP) are
      off-site — start a digital-PR/backlink program (pet/parenting/vet media). P2 in the prior
      reassessment; no code fix possible.
- [ ] **Server clock:** "clock set incorrectly" is host/infra. Confirm prod host is Vercel
      (where the `Date` header is correct automatically); if so this finding is a measurement
      artifact — verify with `curl -I` and close. If a non-Vercel host, sync NTP.
- [ ] **Deploy dependency:** Phases 1–4 only improve the live score after the
      `feat/seo-aeo-remediation` branch deploys. Bundle with the existing un-deployed remediation.

## Success Criteria
- [ ] `pnpm typecheck` + `pnpm lint` pass.
- [ ] All Phase 1–4 fixes confirmed in live rendered HTML / response headers.
- [ ] JSON-LD validates in Google Rich Results.
- [ ] Ops/off-site checklist written and handed to Ops/Marketing.

## Risk Assessment
- **Gate violation** — running `pnpm build` with a dev server up corrupts output; use
  typecheck + lint + `next start` instead.
- **False "done"** — code fixes are dormant in prod until the branch deploys; the checklist
  must state this so the score gain isn't assumed live.
